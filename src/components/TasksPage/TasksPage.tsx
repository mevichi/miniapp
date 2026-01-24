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
}

export function TasksPage() {
  const { user, token, addKeys, addDiamonds } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState<string | null>(null);
  const [adProgress, setAdProgress] = useState(0);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [rewardMessage, setRewardMessage] = useState<{ show: boolean; keysEarned: number; diamondsEarned: number }>({ show: false, keysEarned: 0, diamondsEarned: 0 });

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Call backend to get all available tasks
      const data = await api.getTasks(token);
      setTasks(data);
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
      setRewardMessage({
        show: true,
        keysEarned: result.keysEarned,
        diamondsEarned: result.diamondsEarned || 1,
      });

      // Hide message after 3 seconds
      setTimeout(() => {
        setRewardMessage({ show: false, keysEarned: 0, diamondsEarned: 0 });
      }, 3000);

      // Mark task as completed
      setTasks((prev) =>
        prev.map((task) =>
          task.taskId === taskId ? { ...task, completed: true } : task
        )
      );

      // Reset states
      setWatchingAd(null);
      setAdProgress(0);
    } catch (error) {
      console.error('Failed to complete task:', error);
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
            <span className={styles.rewardEmoji}>🎉</span>
            <div>
              <strong>Task Completed!</strong>
              <p>+{rewardMessage.keysEarned} 🔑 Keys</p>
              <p>+{rewardMessage.diamondsEarned} 💎 Diamonds</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span>🔑 Your Keys</span>
          <strong>{user?.totalKeys || 0}</strong>
        </div>
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
                            : `Claim ${task.reward} 🔑`}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.taskHeader}>
                      <div>
                        <h3 className={styles.taskName}>{task.name}</h3>
                        <p className={styles.taskDesc}>{task.description}</p>
                      </div>
                      {task.completed && (
                        <span className={styles.completedBadge}>✓ Done</span>
                      )}
                    </div>

                    <div className={styles.taskFooter}>
                      <div className={styles.reward}>
                        <span className={styles.rewardValue}>{task.reward}</span>
                        <span className={styles.rewardLabel}>🔑</span>
                      </div>

                      {!task.completed && (
                        <button
                          className={styles.watchButton}
                          onClick={() => watchAd(task.taskId)}
                        >
                          Watch Ad
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
