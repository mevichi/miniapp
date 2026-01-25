'use client';

import { useEffect, useState } from 'react';
import styles from './TasksPage.module.css';
import { useApp } from '@/context/AppContext';
import * as api from '@/services/api';

interface Task {
  taskId: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
  type: string;
  canRetryAt?: Date | null;
  totalAds?: number; // For watch_ad tasks with multiple ads
  adProgress?: number; // Current progress (0-50)
  cooldownRemaining?: number; // Seconds until next ad can be watched
}

export function TasksPage() {
  const { user, token, addKeys, addDiamonds } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState<string | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [rewardMessage, setRewardMessage] = useState<{ show: boolean; keysEarned: number; diamondsEarned: number }>({ show: false, keysEarned: 0, diamondsEarned: 0 });
  const [cooldownTimers, setCooldownTimers] = useState<Record<string, number>>({}); // Seconds remaining for ad cooldowns
  const [adCooldownTimers, setAdCooldownTimers] = useState<Record<string, number>>({}); // Seconds remaining between ads

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Timer interval for updating cooldown countdown
  useEffect(() => {
    const interval = setInterval(() => {
      // Update task-level cooldowns (in minutes)
      setCooldownTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((taskId) => {
          updated[taskId] = Math.max(0, updated[taskId] - 1);
          if (updated[taskId] === 0) {
            delete updated[taskId];
          }
        });
        return updated;
      });

      // Update ad-level cooldowns (in seconds)
      setAdCooldownTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((taskId) => {
          updated[taskId] = Math.max(0, updated[taskId] - 1);
          if (updated[taskId] === 0) {
            delete updated[taskId];
          }
        });
        return updated;
      });
    }, 1000); // Update every second for smooth countdown

    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Call backend to get all available tasks
      const data = await api.getTasks(token);
      setTasks(data);

      // Initialize cooldown timers for tasks that have canRetryAt
      const timers: Record<string, number> = {};
      const adTimers: Record<string, number> = {};

      data.forEach((task: Task) => {
        if (task.canRetryAt) {
          const retryAt = new Date(task.canRetryAt);
          const now = new Date();
          const minutesRemaining = Math.ceil((retryAt.getTime() - now.getTime()) / (60 * 1000));
          if (minutesRemaining > 0) {
            timers[task.taskId] = minutesRemaining;
          }
        }

        // Initialize ad cooldown timers for watch_ad tasks
        if (task.cooldownRemaining && task.cooldownRemaining > 0) {
          adTimers[task.taskId] = task.cooldownRemaining;
        }
      });
      setCooldownTimers(timers);
      if (Object.keys(adTimers).length > 0) {
        setAdCooldownTimers(adTimers);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const watchAd = async (taskId: string) => {
    setWatchingAd(taskId);
    setAdProgress(0);

    // Simulate watching a 5-second ad
    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / 50); // 50 updates over 5 seconds
      });
    }, 100);

    // After 5 seconds, show completion button
    setTimeout(() => {
      clearInterval(interval);
      setAdProgress(100);
    }, 5000);
  };

  const completeTask = async (taskId: string) => {
    if (!token) return;

    try {
      setCompletingTask(taskId);

      // Call backend to complete the task and earn keys
      const result = await api.completeTask(token, taskId);

      // Update local UI
      addKeys(result.keysEarned);
      addDiamonds(result.diamondsEarned || 1);

      // Show reward message
      // setRewardMessage({
      //   show: true,
      //   keysEarned: result.keysEarned,
      //   diamondsEarned: result.diamondsEarned || 1,
      // });

      // Hide message after 3 seconds
      setTimeout(() => {
        setRewardMessage({ show: false, keysEarned: 0, diamondsEarned: 0 });
      }, 3000);

      // Find the task to update it
      setTasks((prev) =>
        prev.map((task) => {
          if (task.taskId === taskId) {
            // For multi-ad tasks, update progress
            if (task.type === 'watch_ad' && task.totalAds && task.totalAds > 1) {
              const newProgress = (task.adProgress || 0) + 1;
              const isFullyCompleted = newProgress >= (task.totalAds || 50);

              // Set 3-minute cooldown for next ad
              if (!isFullyCompleted) {
                setAdCooldownTimers((prev) => ({
                  ...prev,
                  [taskId]: 180, // 3 minutes in seconds
                }));
              } else {
                // Task fully completed - set 1 hour cooldown
                setCooldownTimers((prev) => ({
                  ...prev,
                  [taskId]: 60, // 60 minutes
                }));
              }

              return {
                ...task,
                adProgress: newProgress,
                completed: isFullyCompleted,
                canRetryAt: isFullyCompleted ? new Date(Date.now() + 60 * 60 * 1000) : task.canRetryAt,
              };
            } else {
              // Single-completion task
              setCooldownTimers((prev) => ({
                ...prev,
                [taskId]: 60,
              }));

              return {
                ...task,
                completed: true,
                canRetryAt: new Date(Date.now() + 60 * 60 * 1000),
              };
            }
          }
          return task;
        })
      );

      // Reset states
      setWatchingAd(null);
      setAdProgress(0);
    } catch (error: any) {
      // Handle 3-minute cooldown error for ad tasks
      if (error.response?.status === 400 && error.response?.data?.cooldownRemaining) {
        const secondsRemaining = error.response.data.cooldownRemaining;
        const adProgress = error.response.data.adProgress || 0;

        setAdCooldownTimers((prev) => ({
          ...prev,
          [taskId]: secondsRemaining,
        }));

        // Show error message
        setRewardMessage({
          show: true,
          keysEarned: 0,
          diamondsEarned: 0,
        });

        setTimeout(() => {
          setRewardMessage({ show: false, keysEarned: 0, diamondsEarned: 0 });
        }, 3000);
      } else if (error.response?.status === 400 && error.response?.data?.canRetryAt) {
        // Handle 1-hour cooldown error for completed tasks
        const retryAt = new Date(error.response.data.canRetryAt);
        const now = new Date();
        const minutesRemaining = Math.ceil((retryAt.getTime() - now.getTime()) / (60 * 1000));

        // Update cooldown timer
        setCooldownTimers((prev) => ({
          ...prev,
          [taskId]: Math.max(0, minutesRemaining),
        }));

        // Show error message
        setRewardMessage({
          show: true,
          keysEarned: 0,
          diamondsEarned: 0,
        });

        setTimeout(() => {
          setRewardMessage({ show: false, keysEarned: 0, diamondsEarned: 0 });
        }, 3000);
      } else {
        console.error('Failed to complete task:', error);
      }

      // Reset states
      setWatchingAd(null);
      setAdProgress(0);
    } finally {
      setCompletingTask(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>✓ Tasks</h1>
        <p className={styles.subtitle}>Complete tasks to earn keys and diamonds</p>
      </div>

      {rewardMessage.show && (
        <div className={styles.rewardNotification}>
          <div className={styles.rewardContent}>
            <span className={styles.rewardEmoji}>✓</span>
            <div>
              <strong>Task Completed!</strong>
              <p>+{rewardMessage.keysEarned} 🔑 Keys + {rewardMessage.diamondsEarned} 💎 Diamonds</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsBar}>
        {/* <div className={styles.stat}>
          <span>🔑 Your Keys</span>
          <strong>{user?.totalKeys || 0}</strong>
        </div> */}
        <div className={styles.stat}>
          <span>💎 Diamonds</span>
          <strong>{user?.totalDiamonds || 0}</strong>
        </div>
        <div className={styles.stat}>
          <span>✓ Completed</span>
          <strong>{tasks.filter((t) => t.completed).length}</strong>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div className={styles.tasksList}>
          {tasks.length === 0 ? (
            <div className={styles.empty}>
              <p>No tasks available at the moment</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.taskId} className={styles.taskCard}>
                {watchingAd === task.taskId ? (
                  <div className={styles.adContainer}>
                    <div className={styles.adBox}>
                      <div className={styles.adHeader}>
                        <span>📺 Advertisement</span>
                        <span className={styles.timer}>
                          {Math.ceil((100 - adProgress) / 20)}s
                        </span>
                      </div>

                      <div className={styles.adContent}>
                        <div className={styles.adPlaceholder}>
                          <p>Ad Video Playing...</p>
                        </div>
                      </div>

                      <div className={styles.progressBar}>
                        <div
                          className={styles.progress}
                          style={{ width: `${adProgress}%` }}
                        ></div>
                      </div>

                      {adProgress === 100 && (
                        <button
                          className={styles.claimButton}
                          onClick={() => completeTask(task.taskId)}
                          disabled={completingTask === task.taskId}
                        >
                          {completingTask === task.taskId
                            ? 'Claiming...'
                            : `Next Ad`}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.taskHeader}>
                      <div>
                        <h3 className={styles.taskName}>
                          {task.name}
                          {task.type === 'watch_ad' && task.totalAds && task.totalAds > 1 && (
                            <span className={styles.progressLabel}>
                              {task.adProgress || 0}/{task.totalAds}
                            </span>
                          )}
                        </h3>
                        <p className={styles.taskDesc}>{task.description}</p>
                        {task.type === 'watch_ad' && task.totalAds && task.totalAds > 1 && (
                          <div className={styles.progressBarSmall}>
                            <div
                              className={styles.progressSmall}
                              style={{ width: `${((task.adProgress || 0) / task.totalAds) * 100}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      {task.completed && !cooldownTimers[task.taskId] && (
                        <span className={styles.completedBadge}>✓ Done</span>
                      )}
                      {cooldownTimers[task.taskId] && (
                        <span className={styles.cooldownBadge}>
                          ⏱️ {cooldownTimers[task.taskId]}m
                        </span>
                      )}
                    </div>

                    <div className={styles.taskFooter}>
                      <div className={styles.reward}>
                        {task.type === 'watch_ad' && task.totalAds && (task.adProgress || 0) >= task.totalAds && !task.completed && (
                          <div className={styles.claimRewardBox}>
                            <span className={styles.rewardValue}>500</span>
                            <span className={styles.rewardLabel}>💰</span>
                          </div>
                        )}
                        {!(task.type === 'watch_ad' && task.totalAds && (task.adProgress || 0) >= task.totalAds && !task.completed) && (
                          <>
                            <span className={styles.rewardValue}>{task.reward}</span>
                            <span className={styles.rewardLabel}>🔑</span>
                          </>
                        )}
                      </div>

                      {/* For multi-ad tasks: show "Claim 500 Coins" when all ads watched */}
                      {task.type === 'watch_ad' && task.totalAds && task.totalAds > 1 && (task.adProgress || 0) >= task.totalAds && !task.completed && (
                        <button
                          className={styles.claimButton}
                          onClick={() => completeTask(task.taskId)}
                          disabled={completingTask === task.taskId}
                        >
                          {completingTask === task.taskId ? 'Claiming...' : 'Claim 500 💰'}
                        </button>
                      )}

                      {/* For multi-ad tasks: show "Watch Ad" while in progress */}
                      {!task.completed && !cooldownTimers[task.taskId] && !adCooldownTimers[task.taskId] && !(task.type === 'watch_ad' && task.totalAds && (task.adProgress || 0) >= task.totalAds) && (
                        <button
                          className={styles.watchButton}
                          onClick={() => watchAd(task.taskId)}
                        >
                          Watch Ad
                        </button>
                      )}
                      {adCooldownTimers[task.taskId] && (
                        <button className={styles.watchButton} disabled>
                          Wait {adCooldownTimers[task.taskId]}s
                        </button>
                      )}
                      {!task.completed && cooldownTimers[task.taskId] && (
                        <button className={styles.watchButton} disabled>
                          Available in {cooldownTimers[task.taskId]}m
                        </button>
                      )}
                      {task.completed && cooldownTimers[task.taskId] && (
                        <button className={styles.watchButton} disabled>
                          Available in {cooldownTimers[task.taskId]}m
                        </button>
                      )}
                      {task.completed && !cooldownTimers[task.taskId] && !(task.type === 'watch_ad' && task.totalAds) && (
                        <button
                          className={styles.watchButton}
                          onClick={() => watchAd(task.taskId)}
                        >
                          Watch Again
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className={styles.infoBox}>
        <h4>💡 Tips</h4>
        <ul>
          <li>Each task gives you keys to spin the wheel</li>
          <li>You can complete multiple tasks</li>
          <li>1 key = 1 spin on the lucky wheel</li>
          <li>More keys = more chances to win!</li>
        </ul>
      </div>
    </div>
  );
}
