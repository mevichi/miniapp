'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './TreasuryBox.module.css';

export interface TreasuryReward {
  type: 'keys' | 'coins';
  amount: number;
  weight: number;
  label: string;
}

interface TreasuryBoxProps {
  rewards?: TreasuryReward[];
  onOpen?: (reward: TreasuryReward) => void;
  isOpening?: boolean;
}

const REWARDS: TreasuryReward[] = [
  { type: 'coins', amount: 1, weight: 30, label: '1 Coin' },      // 30%
  { type: 'coins', amount: 5, weight: 25, label: '5 Coins' },     // 25%
  { type: 'coins', amount: 10, weight: 20, label: '10 Coins' },   // 20%
  { type: 'coins', amount: 25, weight: 10, label: '25 Coins' },   // 10%
  { type: 'coins', amount: 50, weight: 5, label: '50 Coins' },    // 5%
  { type: 'keys', amount: 1, weight: 7, label: '1 Key' },         // 7%
  { type: 'keys', amount: 2, weight: 2, label: '2 Keys' },        // 2%
  { type: 'keys', amount: 5, weight: 1, label: '5 Keys' },        // 1%
];

export const TreasuryBox: React.FC<TreasuryBoxProps> = ({
  rewards = REWARDS,
  onOpen,
  isOpening = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opened, setOpened] = useState(false);
  const [boxRotation, setBoxRotation] = useState(0);
  const [lidRotation, setLidRotation] = useState(0);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; life: number }>>([]);
  const animationRef = useRef<number | null>(null);
  const boxRotationRef = useRef(0);
  const lidRotationRef = useRef(0);

  // Get weighted random reward
  const getRandomReward = (): TreasuryReward => {
    const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const reward of rewards) {
      random -= reward.weight;
      if (random <= 0) {
        return reward;
      }
    }
    return rewards[0];
  };

  // Draw treasury box
  const drawBox = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const boxWidth = 150;
    const boxHeight = 120;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw particles first (behind box)
    particles.forEach((p) => {
      ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
      ctx.beginPath();
      ctx.arc(centerX + p.x, centerY + p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Save context for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((boxRotationRef.current * Math.PI) / 180);

    // Draw box body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-boxWidth / 2, boxHeight / 4, boxWidth, boxHeight / 2);

    // Draw gold rim
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(-boxWidth / 2, boxHeight / 4, boxWidth, boxHeight / 2);

    // Draw top part (lid base)
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(0, boxHeight / 4, boxWidth / 2, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw lid with rotation
    ctx.save();
    ctx.translate(centerX, centerY - 30);
    ctx.rotate((lidRotationRef.current * Math.PI) / 180);

    ctx.fillStyle = '#CD853F';
    ctx.fillRect(-boxWidth / 2, -15, boxWidth, 30);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(-boxWidth / 2, -15, boxWidth, 30);

    // Draw lock detail
    if (!opened) {
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-8, -5, 16, 15);
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 2;
      ctx.strokeRect(-8, -5, 16, 15);
    }

    ctx.restore();

    // Draw shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX - 30, centerY - 40, 20, 10, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // Generate particles
  const generateParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = Math.random() * 5 + 2;
      newParticles.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      });
    }
    setParticles(newParticles);
  };

  // Animate particles
  const updateParticles = () => {
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0)
    );
  };

  // Draw on initial load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawBox(ctx);
    }
  }, []);

  // Handle opening animation
  useEffect(() => {
    if (!isOpening) return;

    generateParticles();
    setOpened(true);

    let startTime: number | null = null;
    const duration = 2000; // 2 seconds opening animation

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Lid rotates up
      lidRotationRef.current = progress * -120;
      setLidRotation(lidRotationRef.current);

      // Box shakes and bounces
      boxRotationRef.current = Math.sin(progress * Math.PI * 3) * 5;
      setBoxRotation(boxRotationRef.current);

      updateParticles();

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawBox(ctx);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (onOpen) {
          const reward = getRandomReward();
          onOpen(reward);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpening, onOpen, rewards]);

  return (
    <div className={styles.treasuryWrapper}>
      <canvas
        ref={canvasRef}
        className={styles.treasuryCanvas}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      {opened && (
        <div className={styles.glow} />
      )}
    </div>
  );
};
