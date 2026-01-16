/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from 'react';
import {
  initData,
  type User,
  useSignal,
  useRawInitData,
} from '@tma.js/sdk-react';
import { List, Placeholder } from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page';
import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData';
import styles from './wheel.module.css';
import { useApp } from '@/context/AppContext';
import * as api from '@/services/api';

function getUserRows(user: User): DisplayDataRow[] {
  return Object.entries(user).map(([title, value]) => ({ title, value }));
}

const prizes = [
  { label: '10 💰', color: '#FF6B6B', value: 10 },
  { label: '20 💰', color: '#4ECDC4', value: 20 },
  { label: '50 💰', color: '#FFE66D', value: 50 },
  { label: 'Nothing 😢', color: '#95A5A6', value: 0 },
  { label: '5 💰', color: '#A29BFE', value: 5 },
  { label: 'Bonus 🎁', color: '#FF85A2', value: 100 },
];

interface WheelPageProps {
  userId?: number;
}

export default function WheelPage({ userId }: WheelPageProps) {
  const { user, token, spendKeys, updateBalance } = useApp();
  const initDataRaw = useRawInitData();
  const initDataState = useSignal(initData.state);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initDataState && initDataState.user ? getUserRows(initDataState.user) : undefined;
  }, [initDataState]);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ label: string; color: string; value: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const spinWheel = async () => {
    // Check if user has keys
    if (!user || user.totalKeys === 0) {
      setError('You need at least 1 key to spin!');
      return;
    }

    if (spinning) return;
    setSpinning(true);
    setShowResult(false);
    setError(null);

    const spinDuration = 4000;
    const randomPrizeIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const finalRotation = 360 * 5 + randomPrizeIndex * segmentAngle;

    setRotation(finalRotation);

    setTimeout(async () => {
      const prize = prizes[randomPrizeIndex];
      setResult(prize);
      setShowResult(true);

      // Spend 1 key from user
      spendKeys(1);

      // Call backend to record the spin result
      // This verifies the spin and updates backend records
      if (token) {
        try {
          await api.recordWheelSpin(token, prize.label, 1, prize.value);
          // If successful, update user balance with prize
          updateBalance(prize.value);
        } catch (err) {
          console.error('Failed to record spin:', err);
          setError('Failed to record spin. Please try again.');
        }
      }

      setSpinning(false);
    }, spinDuration);
  };

  if (!initDataState || !initDataRaw) {
    return (
      <Page>
        <Placeholder
          header="Oops"
          description="Application was launched with missing init data"
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
      </Page>
    );
  }

  return (
    <Page>
      <List>
        <div className={styles.wheelContainer}>
          <h1 className={styles.title}>🎡 Lucky Wheel</h1>

          <div className={styles.keyInfo}>
            <span className={styles.keyCount}>🔑 {user?.totalKeys || 0} Keys</span>
            <span className={styles.keyHint}>1 key = 1 spin</span>
          </div>

          <div className={styles.wheelWrapper}>
            <div className={styles.pointer}></div>
            <svg
              className={`${styles.wheel} ${spinning ? styles.spinning : ''}`}
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
              viewBox="0 0 300 300"
              width="300"
              height="300"
            >
              {prizes.map((prize, index) => {
                const segmentAngle = 360 / prizes.length;
                const startAngle = index * segmentAngle;
                const midAngle = startAngle + segmentAngle / 2;
                const radius = 150;

                const x1 = 150 + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 150 + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 =
                  150 + radius * Math.cos(((startAngle + segmentAngle) * Math.PI) / 180);
                const y2 =
                  150 + radius * Math.sin(((startAngle + segmentAngle) * Math.PI) / 180);

                const textX =
                  150 + (radius * 0.65) * Math.cos((midAngle * Math.PI) / 180);
                const textY =
                  150 + (radius * 0.65) * Math.sin((midAngle * Math.PI) / 180);

                const largeArc = segmentAngle > 180 ? 1 : 0;

                const pathData = [
                  `M 150 150`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                  'Z',
                ].join(' ');

                return (
                  <g key={index}>
                    <path d={pathData} fill={prize.color} stroke="white" strokeWidth="2" />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={styles.wheelText}
                      transform={`rotate(${midAngle + 90} ${textX} ${textY})`}
                    >
                      {prize.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="150" cy="150" r="25" fill="white" stroke="#333" strokeWidth="2" />
              <circle cx="150" cy="150" r="15" fill="#FFD700" />
            </svg>
          </div>

          <button
            onClick={spinWheel}
            disabled={spinning || !user || user.totalKeys === 0}
            className={`${styles.spinButton} ${spinning ? styles.spinningButton : ''}`}
          >
            {spinning ? '⏳ Spinning...' : !user || user.totalKeys === 0 ? '🔒 Need Keys' : '🎯 Spin Now!'}
          </button>

          {error && (
            <div className={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {showResult && result && (
            <div className={styles.resultContainer}>
              <div
                className={styles.resultBox}
                style={{
                  borderColor: result.color,
                  boxShadow: `0 0 30px ${result.color}80`,
                }}
              >
                <h2 className={styles.resultTitle}>🎉 Congratulations!</h2>
                <p className={styles.resultText}>You won:</p>
                <p
                  className={styles.prizeText}
                  style={{
                    color: result.color,
                  }}
                >
                  {result.label}
                </p>
              </div>
            </div>
          )}

          <p className={styles.subtitle}>Complete tasks to earn more keys!</p>
        </div>
      </List>
    </Page>
  );
}
