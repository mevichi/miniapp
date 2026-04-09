'use client';

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { TreasuryBox, type TreasuryReward } from './TreasuryBox';
import styles from './TreasuryBoxPage.module.css';
import { PageType } from '@/utils/types';
import { API_BASE_URL } from '@/services/api';

const KEYS_COST = 5;
const API_ENDPOINT = `${API_BASE_URL}/api/treasury/open`;

interface TreasuryState {
  isOpening: boolean;
  lastReward: TreasuryReward | null;
  message: string;
}

interface TreasuryBoxPageProps {
  onNavigate?: (page: PageType) => void;
}

/**
 * TreasuryBoxPage Component
 * Players spend 10 keys to open a treasure box
 * Rewards: 20 keys (rare), 5 keys (common), or 10-100 coins
 */
export function TreasuryBoxPage({ onNavigate }: TreasuryBoxPageProps) {
  // Context
  const { user, spendKeys, addKeys, updateBalance, addDiamonds, token } = useApp();

  // State
  const [state, setState] = useState<TreasuryState>({
    isOpening: false,
    lastReward: null,
    message: '',
  });

  // Loading state
  if (!user) {
    return (
      <div className={styles.treasuryContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  const { balance, totalKeys } = user;
  const canOpen = totalKeys >= KEYS_COST && !state.isOpening;

  /**
   * Record the treasury open to backend
   */
  const recordOpenToBackend = useCallback(
    async (reward: TreasuryReward) => {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            rewardType: reward.type,
            rewardAmount: reward.amount,
            keysCost: KEYS_COST,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          console.log('Treasury open recorded successfully');
        } else {
          console.warn('Failed to record treasury open:', response.statusText);
        }
      } catch (error) {
        console.error('Error recording treasury open:', error);
      }
    },
    [token]
  );

  /**
   * Handle box opening
   */
  const handleBoxOpen = useCallback((reward: TreasuryReward) => {
    let resultMessage = '';

    if (reward.type === 'keys') {
      addKeys(reward.amount);
      resultMessage = `✨ You found ${reward.amount} keys + 1 💎 Diamond!`;
    } else {
      updateBalance(reward.amount);
      resultMessage = `💰 You found ${reward.amount} coins + 1 💎 Diamond!`;
    }

    // Add diamond for opening treasury
    addDiamonds(1);

    setState((prev) => ({
      ...prev,
      lastReward: reward,
      message: resultMessage,
      isOpening: false,
    }));

    recordOpenToBackend(reward);
  }, [addKeys, updateBalance, addDiamonds, recordOpenToBackend]);

  /**
   * Initiate opening
   */
  const handleOpen = async () => {
    if (!canOpen) {
      setState((prev) => ({
        ...prev,
        message: `❌ You need at least ${KEYS_COST} keys to open the treasury!`,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isOpening: true,
      message: '',
    }));

    // Spend keys
    spendKeys(KEYS_COST);
  };

  return (
    <div className={styles.treasuryContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1>5️⃣ 🎁 Treasury box</h1>
        <p className={styles.subtitle}>Create dopamine, not value. Spend {KEYS_COST} keys to open and discover treasures!</p>
      </header>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Keys</span>
          <span className={styles.value}>{totalKeys}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Balance</span>
          <span className={styles.value}>{balance}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Diamonds</span>
          <span className={styles.value}>{user?.totalDiamonds || 0}</span>
        </div>
      </section>

      {/* Rewards Info */}
      <section className={styles.rewardsInfo}>
        <h3>Possible Rewards (SAFE)</h3>
        <div className={styles.rewardsList}>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>1 🪙</span>
            <span className={styles.rewardText}>30%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>5 🪙</span>
            <span className={styles.rewardText}>25%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>10 🪙</span>
            <span className={styles.rewardText}>20%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>25 🪙</span>
            <span className={styles.rewardText}>10%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>50 🪙</span>
            <span className={styles.rewardText}>5%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>1 🔑</span>
            <span className={styles.rewardText}>7%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>2 🔑</span>
            <span className={styles.rewardText}>2%</span>
          </div>
          <div className={styles.rewardItem}>
            <span className={styles.rewardIcon}>5 🔑</span>
            <span className={styles.rewardText}>1%</span>
          </div>
        </div>
      </section>

      {/* Treasury Box Section */}
      <section className={styles.boxSection}>
        <TreasuryBox
          onOpen={handleBoxOpen}
          isOpening={state.isOpening}
        />
        <button
          className={styles.openButton}
          onClick={handleOpen}
          disabled={!canOpen}
          aria-label="Open the treasury box"
        >
          {state.isOpening
            ? 'OPENING...'
            : totalKeys < KEYS_COST
              ? `NO KEYS (NEED ${KEYS_COST})`
              : `OPEN (${KEYS_COST} KEYS)`}
        </button>
      </section>

      {/* Results Section */}
      {state.message && (
        <div
          className={`${styles.message} ${
            state.message.includes('found') ? styles.success : ''
          }`}
        >
          {state.message}
        </div>
      )}

      {state.lastReward && (
        <div className={styles.reward}>
          <div className={styles.rewardLabel}>
            {state.lastReward.type === 'keys' ? '🔑 Keys Found!' : '💰 Coins Found!'}
          </div>
          <div className={styles.rewardAmount}>{state.lastReward.amount}</div>
        </div>
      )}
    </div>
  );
}
