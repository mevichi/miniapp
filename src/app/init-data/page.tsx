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

function getUserRows(user: User): DisplayDataRow[] {
  return Object.entries(user).map(([title, value]) => ({ title, value }));
}

const prizes = [
  { label: '10 💰', color: '#FF6B6B' },
  { label: '20 💰', color: '#4ECDC4' },
  { label: '50 💰', color: '#FFE66D' },
  { label: 'Nothing 😢', color: '#95A5A6' },
  { label: '5 💰', color: '#A29BFE' },
  { label: 'Bonus 🎁', color: '#FF85A2' },
];

export default function WheelPage() {
  const initDataRaw = useRawInitData();
  const initDataState = useSignal(initData.state);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initDataState && initDataState.user ? getUserRows(initDataState.user) : undefined;
  }, [initDataState]);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ label: string; color: string } | null>(null);
  const [showResult, setShowResult] = useState(false);

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    setShowResult(false);

    const spinDuration = 4000;
    const randomPrizeIndex = Math.floor(Math.random() * prizes.length);
    const segmentAngle = 360 / prizes.length;
    const finalRotation = 360 * 5 + randomPrizeIndex * segmentAngle;

    setRotation(finalRotation);

    setTimeout(() => {
      const prize = prizes[randomPrizeIndex];
      setResult(prize);
      setShowResult(true);
      setSpinning(false);

      // TODO: optionally call backend to record prize for this user
      // fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, { ... })
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
            disabled={spinning}
            className={`${styles.spinButton} ${spinning ? styles.spinning : ''}`}
          >
            {spinning ? '⏳ Spinning...' : '🎯 Spin Now!'}
          </button>

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

          <p className={styles.subtitle}>Try your luck and win amazing prizes!</p>
        </div>
      </List>
    </Page>
  );
}
