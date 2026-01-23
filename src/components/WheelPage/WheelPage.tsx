'use client';

import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { CustomWheel } from './Wheel';
import styles from './WheelPage.module.css';

// Wheel segments with weights
const WHEEL_SEGMENTS = [
  { label: '10', value: 10, color: '#FF6B6B', weight: 1 },
  { label: '20', value: 20, color: '#4ECDC4', weight: 1 },
  { label: '50', value: 50, color: '#FFE66D', weight: 0.5 }, // Harder to win
  { label: 'Nothing', value: 0, color: '#95E1D3', weight: 1.5 }, // More likely
  { label: '5', value: 5, color: '#C7CEEA', weight: 1 },
  { label: '100', value: 100, color: '#FF8B94', weight: 0.3 }, // Rare!
];

const KEYS_PER_SPIN = 1;
const API_ENDPOINT = 'https://api.solfren.dev/api/wheel/spin';

// Types
interface WheelState {
  isSpinning: boolean;
  lastPrize: number | null;
  lastLabel: string;
  message: string;
}

/**
 * WheelPage Component
 * Beautiful spinning wheel with weighted segments
 * Users can spin with keys to win coins
 */
export function WheelPage() {
  // Context
  const { user, spendKeys, updateBalance, token } = useApp();

  // State
  const [state, setState] = useState<WheelState>({
    isSpinning: false,
    lastPrize: null,
    lastLabel: '',
    message: '',
  });

  // Loading state
  if (!user) {
    return (
      <div className={styles.wheelContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  const { balance, totalKeys } = user;
  const canSpin = totalKeys >= KEYS_PER_SPIN && !state.isSpinning;

  /**
   * Record the spin result to the backend
   */
  const recordSpinToBackend = useCallback(
    async (prize: string, prizeValue: number) => {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            prize,
            keysSpent: KEYS_PER_SPIN,
            prizeValue,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          console.log('Spin recorded successfully');
        } else {
          console.warn('Failed to record spin:', response.statusText);
        }
      } catch (error) {
        console.error('Error recording spin:', error);
      }
    },
    [token]
  );

  /**
   * Handle spin completion
   */
  const handleSpinComplete = useCallback(
    (segment: typeof WHEEL_SEGMENTS[0], segmentIndex: number) => {
      // Update balance and display result
      const resultMessage =
        segment.value > 0
          ? `🎉 You won ${segment.value} coins!`
          : '😢 Better luck next time!';

      if (segment.value > 0) {
        updateBalance(segment.value);
      }

      setState((prev) => ({
        ...prev,
        lastPrize: segment.value,
        lastLabel: segment.label,
        message: resultMessage,
        isSpinning: false,
      }));

      // Record result to backend asynchronously without awaiting
      recordSpinToBackend(segment.label, segment.value);
    },
    [updateBalance, recordSpinToBackend]
  );

  /**
   * Initiate spin
   */
  const handleSpin = async () => {
    // Validation
    if (!canSpin) {
      setState((prev) => ({
        ...prev,
        message: `❌ You need at least ${KEYS_PER_SPIN} key(s) to spin!`,
      }));
      return;
    }

    // Initialize spin
    setState((prev) => ({
      ...prev,
      isSpinning: true,
      message: '',
    }));

    // Spend key
    spendKeys(KEYS_PER_SPIN);
  };

  return (
    <div className={styles.wheelContainer}>
      {/* Header Section */}
      <header className={styles.header}>
        <h1>🎡 Spin the Wheel</h1>
        <p className={styles.subtitle}>Use keys to spin and win coins!</p>
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
      </section>

      {/* Wheel Section */}
      <section className={styles.wheelSection}>
        <CustomWheel
          segments={WHEEL_SEGMENTS}
          onSpinComplete={handleSpinComplete}
          isSpinning={state.isSpinning}
          radius={150}
        />
        <button
          className={styles.spinButton}
          onClick={handleSpin}
          disabled={!canSpin}
          aria-label="Spin the wheel"
        >
          {state.isSpinning
            ? 'SPINNING...'
            : totalKeys < KEYS_PER_SPIN
              ? 'NO KEYS'
              : `SPIN (${KEYS_PER_SPIN} KEY)`}
        </button>
      </section>

      {/* Results Section */}
      {state.message && (
        <div
          className={`${styles.message} ${
            state.message.includes('won') ? styles.success : ''
          }`}
        >
          {state.message}
        </div>
      )}

      {state.lastPrize !== null && (
        <div className={styles.lastResult}>
          <p>
            Last spin: <strong>{state.lastLabel}</strong> - {state.lastPrize}{' '}
            coins
          </p>
        </div>
      )}

      {/* Instructions Section */}
      <section className={styles.info}>
        <h3>How to Play</h3>
        <ul>
          <li>✅ Complete tasks to earn keys</li>
          <li>🎡 Use {KEYS_PER_SPIN} key to spin the wheel</li>
          <li>💰 Win coins based on luck and odds</li>
          <li>🎯 Higher weights = harder to win, bigger rewards!</li>
        </ul>
        <div className={styles.odds}>
          <h4>Prize Odds:</h4>
          <ul className={styles.oddslist}>
            <li>100 coins - 12% (Very rare!)</li>
            <li>50 coins - 20% (Rare)</li>
            <li>20 coins - 33% (Common)</li>
            <li>10 coins - 33% (Common)</li>
            <li>5 coins - 33% (Common)</li>
            <li>Nothing - 50% (Ouch!)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
