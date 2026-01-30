'use client';

import { useState, useEffect } from 'react';
import styles from './TasksPage.module.css';
import { useApp } from '@/context/AppContext';
import { PageType } from '@/utils/types';
import { useTonWallet } from '@tonconnect/ui-react';

interface TasksPageProps {
  onNavigate?: (page: PageType) => void;
}

type TaskType = 'subscription' | 'launch_bot' | 'visit_website';

interface UserTask {
  taskId: string;
  type: TaskType;
  description: string;
  url: string;
  completionReward: {
    users: number;
    ton: number;
  };
}

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  subscription: '📢 Subscribe to Channel',
  launch_bot: '🤖 Launch Bot',
  visit_website: '🌐 Visit Website',
};

const COMPLETION_OPTIONS = [
  { users: 50, ton: 0.1 },
  { users: 100, ton: 0.2 },
  { users: 200, ton: 0.4 },
  { users: 500, ton: 1.0 },
];

export function TasksPage({ onNavigate }: TasksPageProps) {
  const { user, token } = useApp();
  const wallet = useTonWallet();

  const [activeTab, setActiveTab] = useState<'tasks' | 'missions'>('tasks');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // Task Creation state
  const [taskType, setTaskType] = useState<TaskType>('subscription');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [completionOption, setCompletionOption] = useState(0);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<{ to: string | null; amount: number; comment: string } | null>(null);
  const [paymentPendingTaskId, setPaymentPendingTaskId] = useState<string | null>(null);
  const [txHashInput, setTxHashInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Task List state
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [openedTasks, setOpenedTasks] = useState<Set<string>>(new Set());
  const [claimingTask, setClaimingTask] = useState<string | null>(null);
  const [completeMessage, setCompleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [activeTab, token]);

  const selectedCompletion = COMPLETION_OPTIONS[completionOption];

  const fetchTasks = async () => {
    if (!token) return;
    setLoadingTasks(true);
    try {
      const response = await fetch('https://api.solfren.dev/api/user-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setCreateMessage({ type: 'error', text: 'Please enter a valid URL' });
      return;
    }

    if (!description.trim()) {
      setCreateMessage({ type: 'error', text: 'Please enter a task description' });
      return;
    }

    setLoadingCreate(true);
    try {
      const response = await fetch('https://api.solfren.dev/api/user-tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: taskType,
          url,
          description,
          completionReward: selectedCompletion,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to create task: ${response.statusText} ${text}`);
      }

      const data = await response.json();

      if (data.paymentRequest) {
        // Keep modal open and show payment step
        setPaymentRequest(data.paymentRequest);
        setPaymentPendingTaskId(data.taskId);
        setPaymentMessage({ type: 'success', text: '🔔 Task pending payment. Please complete the payment to activate the task.' });
      } else {
        setCreateMessage({ type: 'success', text: '✅ Task created!' });
        // Close modal after a short delay
        setTimeout(() => {
          setShowAddTaskModal(false);
          setCreateMessage(null);
          fetchTasks();
        }, 1000);
      }

      // Reset form fields (keep payment UI state)
      setUrl('');
      setDescription('');
      setTaskType('subscription');
      setCompletionOption(0);
    } catch (error) {
      setCreateMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create task',
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleOpenTask = (taskId: string, taskUrl: string) => {
    // Open the task link in a new window
    window.open(taskUrl, '_blank');
    // Mark this task as opened
    setOpenedTasks(prev => new Set(prev).add(taskId));
  };

  const handleClaimTask = async (taskId: string) => {
    setClaimingTask(taskId);
    try {
      const response = await fetch(
        `https://api.solfren.dev/api/user-tasks/${taskId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCompleteMessage({
          type: 'success',
          text: '✅ Task completed! You earned 50 coins!',
        });
        // Refresh task list
        await fetchTasks();
        // Reset opened tasks
        setOpenedTasks(new Set());
      } else {
        throw new Error('Failed to claim task');
      }
    } catch (error) {
      setCompleteMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to claim task',
      });
    } finally {
      setClaimingTask(null);
    }
  };

  // Send payment using TonConnect wallet (if available)
  const sendPaymentWithWallet = async () => {
    if (!paymentRequest || !paymentPendingTaskId) return;
    if (!wallet) {
      setPaymentMessage({ type: 'error', text: 'Please connect your TON wallet first' });
      return;
    }

    setPaymentMessage({ type: 'success', text: 'Opening wallet for payment...' });
    try {
      const to = paymentRequest.to;
      const amountTon = paymentRequest.amount;
      const amountNano = Math.round(amountTon * 1_000_000_000); // nanoton
      let txHash: string | null = null;

      // Try common wallet method names (use any to avoid TS type mismatch)
      if (typeof (wallet as any).sendTransaction === 'function') {
        const tx = await (wallet as any).sendTransaction({ to, value: amountNano.toString(), text: paymentRequest.comment });
        txHash = tx?.hash || tx?.transactionHash || tx?.id || null;
      } else if (typeof (wallet as any).requestTransfer === 'function') {
        const tx = await (wallet as any).requestTransfer({ to, amount: amountTon, text: paymentRequest.comment });
        txHash = tx?.hash || tx?.transactionHash || tx?.id || null;
      } else if (typeof (wallet as any).send === 'function') {
        const tx = await (wallet as any).send({ to, value: amountNano.toString(), text: paymentRequest.comment });
        txHash = tx?.hash || tx?.transactionHash || tx?.id || null;
      }

      if (txHash) {
        setPaymentMessage({ type: 'success', text: 'Payment sent. Verifying on-chain...' });
        await verifyPaymentOnServer(paymentPendingTaskId, txHash);
      } else {
        setPaymentMessage({ type: 'error', text: 'Unable to obtain tx hash automatically. Please copy transaction hash from your wallet and paste it below.' });
      }
    } catch (error) {
      setPaymentMessage({ type: 'error', text: error instanceof Error ? error.message : 'Payment failed' });
    }
  };

  const verifyPaymentOnServer = async (taskId: string, txHash: string) => {
    setVerifying(true);
    try {
      const response = await fetch('https://api.solfren.dev/api/user-tasks/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, txHash }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPaymentMessage({ type: 'success', text: 'Payment verified and task activated!' });
        // cleanup and refresh
        setPaymentRequest(null);
        setPaymentPendingTaskId(null);
        setTxHashInput('');
        setTimeout(() => {
          setShowAddTaskModal(false);
          fetchTasks();
        }, 1000);
      } else {
        setPaymentMessage({ type: 'error', text: data.error || data.message || 'Verification failed' });
      }
    } catch (error) {
      setPaymentMessage({ type: 'error', text: error instanceof Error ? error.message : 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyHashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentPendingTaskId || !txHashInput.trim()) return;
    await verifyPaymentOnServer(paymentPendingTaskId, txHashInput.trim());
  };

  const closeModal = () => {
    setShowAddTaskModal(false);
    setCreateMessage(null);
    setUrl('');
    setDescription('');
    setTaskType('subscription');
    setCompletionOption(0);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🎮 Tasks & Missions</h1>
        <p className={styles.subtitle}>Complete activities to earn rewards</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'missions' ? styles.active : ''}`}
          onClick={() => setActiveTab('missions')}
        >
          🎡 Missions
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'tasks' ? styles.active : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          ✏️ Tasks
        </button>
      </div>

      {/* Missions Tab - Wheel & Treasury Buttons */}
      {activeTab === 'missions' && (
        <div className={styles.missionsContent}>
          <button 
            className={styles.missionButton}
            onClick={() => onNavigate?.('wheel')}
          >
            <div className={styles.missionButtonContent}>
              <h2>🎡 Spin the Wheel</h2>
              <p>Use your spins to win prizes</p>
            </div>
            <span className={styles.missionArrow}>→</span>
          </button>

          <button 
            className={styles.missionButton}
            onClick={() => onNavigate?.('treasury')}
          >
            <div className={styles.missionButtonContent}>
              <h2>🏺 Treasury Box</h2>
              <p>Open boxes for rewards</p>
            </div>
            <span className={styles.missionArrow}>→</span>
          </button>
        </div>
      )}

      {/* Tasks Tab - Task List & Add Button */}
      {activeTab === 'tasks' && (
        <div className={styles.tasksContent}>
          {/* Add Task Button */}
          <div className={styles.taskHeader}>
            <h2 className={styles.sectionTitle}>📋 Available Tasks</h2>
            <button 
              className={styles.addTaskButton}
              onClick={() => setShowAddTaskModal(true)}
            >
              ➕ Add Task
            </button>
          </div>

          {/* Message */}
          {completeMessage && (
            <div className={`${styles.message} ${styles[completeMessage.type]}`}>
              {completeMessage.text}
            </div>
          )}

          {/* Task List */}
          <div className={styles.tasksList}>
            {loadingTasks ? (
              <div className={styles.loading}>Loading tasks...</div>
            ) : userTasks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No tasks available yet 😅</p>
                <p className={styles.emptySubtext}>Be the first to create one!</p>
              </div>
            ) : (
              userTasks.map((task) => (
                <div key={task.taskId} className={styles.taskCard}>
                  <div className={styles.taskCardHeader}>
                    <h3 className={styles.taskTitle}>{task.description}</h3>
                    <span className={styles.taskTypeBadge}>{TASK_TYPE_LABELS[task.type]}</span>
                  </div>

                  <div className={styles.taskMeta}>
                    <p className={styles.reward}>💰 Earn <strong>50 coins</strong></p>
                  </div>

                  {!openedTasks.has(task.taskId) ? (
                    <button
                      className={styles.completeButton}
                      onClick={() => handleOpenTask(task.taskId, task.url)}
                    >
                      🔗 Open Task
                    </button>
                  ) : (
                    <button
                      className={styles.completeButton}
                      onClick={() => handleClaimTask(task.taskId)}
                      disabled={claimingTask === task.taskId}
                    >
                      {claimingTask === task.taskId ? '⏳ Claiming...' : '✅ Claim Reward'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>➕ Create a New Task</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleCreateTask} className={styles.taskForm}>
              {/* Task Type */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as TaskType)}
                  className={styles.select}
                  disabled={loadingCreate}
                >
                  {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* URL */}
              <div className={styles.formGroup}>
                <label className={styles.label}>URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={styles.input}
                  disabled={loadingCreate}
                  required
                />
                <small className={styles.hint}>
                  {taskType === 'subscription'
                    ? 'Telegram channel or group link'
                    : taskType === 'launch_bot'
                      ? 'Bot @username or deep link'
                      : 'Website URL to visit'}
                </small>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Task Description</label>
                <textarea
                  placeholder="Describe what users need to do..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  disabled={loadingCreate}
                  maxLength={200}
                  rows={3}
                  required
                />
                <small className={styles.charCount}>{description.length}/200</small>
              </div>

              {/* Completion Options */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Completion Reward</label>
                <div className={styles.completionOptions}>
                  {COMPLETION_OPTIONS.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.optionButton} ${completionOption === idx ? styles.selectedOption : ''}`}
                      onClick={() => setCompletionOption(idx)}
                    >
                      {option.users} users → {option.ton} TON
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Display */}
              <div className={styles.rewardBox}>
                <h4>Task Economics</h4>
                <p className={styles.rewardText}>
                  When <strong>{selectedCompletion.users} users</strong> complete this task, you'll receive <strong>{selectedCompletion.ton} TON</strong>
                </p>
                <p className={styles.rewardSubtext}>
                  Users will earn <strong>50 coins</strong> for completing your task
                </p>
                <p className={styles.costText}>
                  📌 Creation Cost: <strong>{selectedCompletion.ton} TON</strong> (will be deducted from your wallet)
                </p>
              </div>

              {/* Message */}
              {createMessage && (
                <div className={`${styles.message} ${styles[createMessage.type]}`}>
                  {createMessage.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loadingCreate || !url.trim() || !description.trim()}
              >
                {loadingCreate ? '⏳ Creating...' : '✨ Create Task & Pay TON'}
              </button>

              {/* Payment Step (shown if paymentRequest exists) */}
              {paymentRequest && paymentPendingTaskId && (
                <div className={styles.paymentBox}>
                  <h4>🔒 Payment required</h4>
                  <p>Send <strong>{paymentRequest.amount} TON</strong> to activate your task.</p>

                  {paymentMessage && (
                    <div className={`${styles.message} ${styles[paymentMessage.type]}`}>{paymentMessage.text}</div>
                  )}

                  <div className={styles.paymentActions}>
                    <button type="button" className={styles.payButton} onClick={sendPaymentWithWallet}>
                      Pay with Wallet
                    </button>
                  </div>

                  <div className={styles.manualPayment}>
                    <p>If your wallet doesn't return a tx hash, paste it here:</p>
                    <form onSubmit={handleVerifyHashSubmit} className={styles.verifyForm}>
                      <input
                        type="text"
                        placeholder="Transaction hash"
                        value={txHashInput}
                        onChange={(e) => setTxHashInput(e.target.value)}
                        className={styles.input}
                        disabled={verifying}
                        required
                      />
                      <button type="submit" className={styles.submitButton} disabled={verifying}>
                        {verifying ? '⏳ Verifying...' : '✅ Verify & Activate'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
