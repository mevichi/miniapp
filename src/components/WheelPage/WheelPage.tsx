'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './WheelPage.module.css';

const WHEEL_SEGMENTS = [
  { label: '10', value: 10, color: '#FF6B6B' },
  { label: '20', value: 20, color: '#4ECDC4' },
  { label: '50', value: 50, color: '#FFE66D' },
  { label: 'Nothing', value: 0, color: '#95E1D3' },
  { label: '5', value: 5, color: '#C7CEEA' },
  { label: '100', value: 100, color: '#FF8B94' },
];

export function WheelPage() {
  const { user, spendKeys, updateBalance, token } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastPrize, setLastPrize] = useState<number | null>(null);
  const [lastLabel, setLastLabel] = useState<string>('');
  const [message, setMessage] = useState('');
  const wheelRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return <div className={styles.wheelContainer}>Loading...</div>;
  }

  const { balance, totalKeys } = user;

  const spin = async () => {
    if (isSpinning) return;
    if (totalKeys < 1) {
      setMessage('❌ You need at least 1 key to spin!');
      return;
    }

    setMessage('');
    setIsSpinning(true);

    // Deduct key immediately
    spendKeys(1);

    // Random segment
    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const selectedSegment = WHEEL_SEGMENTS[randomIndex];

    // Calculate rotation (each segment is 60 degrees)
    // Spin multiple times + land on selected segment
    const spins = 5;
    const segmentDegrees = 360 / WHEEL_SEGMENTS.length;
    const targetDegree = randomIndex * segmentDegrees;
    const totalRotation = spins * 360 + (360 - targetDegree);

    // Animate spin
    setRotation((prev) => prev + totalRotation);

    // Wait for animation to complete (4 seconds)
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Update balance with prize
    if (selectedSegment.value > 0) {
      updateBalance(selectedSegment.value);
      setMessage(`🎉 You won ${selectedSegment.value} coins!`);
    } else {
      setMessage('😢 Better luck next time!');
    }

    setLastPrize(selectedSegment.value);
    setLastLabel(selectedSegment.label);

    // Record spin in backend
    try {
      const response = await fetch('https://api.solfren.dev/api/wheel/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prize: selectedSegment.label,
          keysSpent: 1,
          prizeValue: selectedSegment.value,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Spin recorded:', data);
      }
    } catch (error) {
      console.error('Failed to record spin:', error);
    }

    setIsSpinning(false);
  };

  return (
    <div className={styles.wheelContainer}>
      <div className={styles.header}>
        <h1>🎡 Spin the Wheel</h1>
        <p className={styles.subtitle}>Use keys to spin and win coins!</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Keys</span>
          <span className={styles.value}>{totalKeys}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Balance</span>
          <span className={styles.value}>{balance}</span>
        </div>
      </div>

      <div className={styles.wheelWrapper}>
        <div
          ref={wheelRef}
          className={styles.wheel}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {/* Wheel segments */}
          {WHEEL_SEGMENTS.map((segment, index) => {
            const angle = (360 / WHEEL_SEGMENTS.length) * index;
            return (
              <div
                key={index}
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

        {/* Pointer */}
        <div className={styles.pointer}></div>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('won') ? styles.success : ''}`}>
          {message}
        </div>
      )}

      {lastPrize !== null && (
        <div className={styles.lastResult}>
          <p>Last spin: <strong>{lastLabel}</strong> - {lastPrize} coins</p>
        </div>
      )}

      <button
        className={styles.spinButton}
        onClick={spin}
        disabled={isSpinning || totalKeys < 1}
      >
        {isSpinning ? 'SPINNING...' : totalKeys < 1 ? 'NO KEYS' : 'SPIN (1 KEY)'}
      </button>

      <div className={styles.info}>
        <h3>How to Play</h3>
        <ul>
          <li>✅ Complete tasks to earn keys</li>
          <li>🎡 Use 1 key to spin the wheel</li>
          <li>💰 Win up to 100 coins per spin</li>
          <li>🎯 Try your luck and get lucky!</li>
        </ul>
      </div>
    </div>
  );
}
