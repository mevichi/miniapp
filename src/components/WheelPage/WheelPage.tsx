'use client';

import { useState, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './WheelPage.module.css';

// Constants
const WHEEL_SEGMENTS = [
  { label: '10', value: 10, color: '#FF6B6B' },
  { label: '20', value: 20, color: '#4ECDC4' },
  { label: '50', value: 50, color: '#FFE66D' },
  { label: 'Nothing', value: 0, color: '#95E1D3' },
  { label: '5', value: 5, color: '#C7CEEA' },
  { label: '100', value: 100, color: '#FF8B94' },
];

const ANIMATION_DURATION = 4000; // ms
const SPIN_ROUNDS = 5;
const KEYS_PER_SPIN = 1;
const API_ENDPOINT = 'https://api.solfren.dev/api/wheel/spin';

// Types
interface WheelState {
  isSpinning: boolean;
  rotation: number;
  lastPrize: number | null;
  lastLabel: string;
  message: string;
}

/**
 * WheelPage Component
 * Displays a spinning wheel game where users can use keys to win coins
 */
export function WheelPage() {
  // Context
  const { user, spendKeys, updateBalance, token } = useApp();

  // State
  const [state, setState] = useState<WheelState>({
    isSpinning: false,
    rotation: 0,
    lastPrize: null,
    lastLabel: '',
    message: '',
  });

  const wheelRef = useRef<HTMLDivElement>(null);

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
   * Calculate the rotation angle for a given segment index
   */
  const calculateRotation = (segmentIndex: number): number => {
    const segmentDegrees = 360 / WHEEL_SEGMENTS.length;
    const targetDegree = segmentIndex * segmentDegrees;
    return SPIN_ROUNDS * 360 + (360 - targetDegree);
  };

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
          const data = await response.json();
          console.log('Spin recorded successfully:', data);
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
   * Main spin handler
   */
  const handleSpin = async () => {
    // Validation
    if (state.isSpinning) return;
    if (totalKeys < KEYS_PER_SPIN) {
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

    // Select random prize
    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const selectedSegment = WHEEL_SEGMENTS[randomIndex];

    // Calculate and apply rotation
    const totalRotation = calculateRotation(randomIndex);
    setState((prev) => ({
      ...prev,
      rotation: prev.rotation + totalRotation,
    }));

    // Wait for spin animation to complete
    await new Promise((resolve) => setTimeout(resolve, ANIMATION_DURATION));

    // Update balance and display result
    const resultMessage =
      selectedSegment.value > 0
        ? `🎉 You won ${selectedSegment.value} coins!`
        : '😢 Better luck next time!';

    if (selectedSegment.value > 0) {
      updateBalance(selectedSegment.value);
    }

    setState((prev) => ({
      ...prev,
      lastPrize: selectedSegment.value,
      lastLabel: selectedSegment.label,
      message: resultMessage,
      isSpinning: false,
    }));

    // Record result to backend
    await recordSpinToBackend(selectedSegment.label, selectedSegment.value);
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
      <section className={styles.wheelWrapper}>
        <div
          ref={wheelRef}
          className={styles.wheel}
          style={{
            transform: `rotate(${state.rotation}deg)`,
            transition: state.isSpinning
              ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
              : 'none',
          }}
        >
          {WHEEL_SEGMENTS.map((segment, index) => {
            const angle = (360 / WHEEL_SEGMENTS.length) * index;
            return (
              <div
                key={segment.label}
                className={styles.segment}
                style={{
                  transform: `rotate(${angle}deg)`,
                  background: segment.color,
                }}
              >
                <span className={styles.segmentLabel}>{segment.label}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.pointer} />
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

      {/* Spin Button */}
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

      {/* Instructions Section */}
      <section className={styles.info}>
        <h3>How to Play</h3>
        <ul>
          <li>✅ Complete tasks to earn keys</li>
          <li>🎡 Use {KEYS_PER_SPIN} key to spin the wheel</li>
          <li>💰 Win up to 100 coins per spin</li>
          <li>🎯 Try your luck and get lucky!</li>
        </ul>
      </section>
    </div>
  );
}
