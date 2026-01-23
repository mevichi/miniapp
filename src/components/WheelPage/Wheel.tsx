'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Wheel.module.css';

export interface WheelSegment {
  label: string;
  value: number;
  color: string;
  weight: number; // Required - controls probability
}

interface WheelProps {
  segments: WheelSegment[];
  onSpinComplete?: (segment: WheelSegment, segmentIndex: number) => void;
  isSpinning?: boolean;
  radius?: number;
}

export const CustomWheel: React.FC<WheelProps> = ({
  segments,
  onSpinComplete,
  isSpinning = false,
  radius = 150,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  const SEGMENTS_COUNT = segments.length;

  /**
   * Draw the wheel on canvas
   */
  const drawWheel = (ctx: CanvasRenderingContext2D, currentRotation: number) => {
    const centerX = radius;
    const centerY = radius;
    const segmentAngle = (2 * Math.PI) / SEGMENTS_COUNT;

    // Draw segments
    for (let i = 0; i < SEGMENTS_COUNT; i++) {
      const startAngle = currentRotation + i * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius * 0.85, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segments[i].color;
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text label
      const textAngle = startAngle + segmentAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius * 0.6);
      const textY = centerY + Math.sin(textAngle) * (radius * 0.6);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.fillText(segments[i].label, 0, 0);
      ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.12, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer/needle (at top)
    const pointerHeight = 20;
    const pointerWidth = 15;
    ctx.beginPath();
    ctx.moveTo(centerX - pointerWidth, centerY - radius * 0.95);
    ctx.lineTo(centerX + pointerWidth, centerY - radius * 0.95);
    ctx.lineTo(centerX, centerY - radius * 0.95 + pointerHeight);
    ctx.closePath();
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add shadow
    ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  };

  /**
   * Initialize and redraw wheel
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw wheel
    drawWheel(ctx, rotation);
  }, [rotation, segments, radius]);

  /**
   * Calculate winning segment based on weights
   */
  const getWeightedRandomSegment = (): {
    index: number;
    segment: WheelSegment;
  } => {
    // Calculate total weight
    const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);

    // Generate random number
    let random = Math.random() * totalWeight;

    // Find segment
    for (let i = 0; i < segments.length; i++) {
      random -= segments[i].weight;
      if (random <= 0) {
        return { index: i, segment: segments[i] };
      }
    }

    return { index: 0, segment: segments[0] };
  };

  /**
   * Spin the wheel
   */
  const spin = async () => {
    if (isSpinning) return;

    const { index: winningIndex, segment: winningSegment } =
      getWeightedRandomSegment();

    // Calculate target rotation
    const segmentAngle = 360 / SEGMENTS_COUNT;
    const baseRotation = -(winningIndex * segmentAngle) + 90; // Adjust for pointer at top
    const spins = 5; // Full rotations
    const finalRotation = spins * 360 + baseRotation;

    // Animate spin
    const startRotation = rotation;
    const startTime = Date.now();
    const duration = 4000; // 4 seconds

    const animateSpin = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeProgress =
        1 - Math.pow(1 - progress, 3);

      const newRotation =
        startRotation + (finalRotation - startRotation) * easeProgress;
      setRotation(newRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Animation complete
        if (onSpinComplete) {
          onSpinComplete(winningSegment, winningIndex);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className={styles.wheelContainer}>
      <div className={styles.wheelWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.wheelCanvas}
          width={radius * 2}
          height={radius * 2}
        />
      </div>
      <button
        className={styles.spinButton}
        onClick={spin}
        disabled={isSpinning}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN!'}
      </button>
    </div>
  );
};
