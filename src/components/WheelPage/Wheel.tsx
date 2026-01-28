'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Wheel.module.css';

export interface WheelSegment {
  label: string;
  value: number;
  backgroundColor?: string;
  weight: number;
}

interface CustomWheelProps {
  segments: WheelSegment[];
  onSpinComplete?: (segment: WheelSegment, segmentIndex: number) => void;
  isSpinning?: boolean;
}

const COLORS = [
  '#fdc963',
  '#00cca8',
  '#2b87e9',
  '#fd775b',
  '#ff4b78',
  '#c88857',
  '#a64a97',
  '#5b7c7d',
  '#715344',
  '#904e55',
  '#8b7856'
];

export const CustomWheel: React.FC<CustomWheelProps> = ({
  segments,
  onSpinComplete,
  isSpinning = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  // Calculate total weight for weighted random selection
  const getTotalWeight = () => {
    return segments.reduce((sum, seg) => sum + (seg.weight || 1), 0);
  };

  // Get weighted random segment
  const getRandomSegmentIndex = () => {
    const totalWeight = getTotalWeight();
    let random = Math.random() * totalWeight;
    for (let i = 0; i < segments.length; i++) {
      random -= segments[i].weight || 1;
      if (random <= 0) return i;
    }
    return segments.length - 1;
  };

  // Draw wheel on canvas
  const drawWheel = (ctx: CanvasRenderingContext2D, currentRotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const sliceAngle = (2 * Math.PI) / segments.length;

    segments.forEach((segment, index) => {
      const startAngle = index * sliceAngle + (currentRotation * Math.PI) / 180;
      const endAngle = startAngle + sliceAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.backgroundColor || COLORS[index % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(segment.label, radius - 30, 5);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 35);
    ctx.lineTo(centerX + 15, 35);
    ctx.closePath();
    ctx.fillStyle = '#ff4b78';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Draw on initial load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawWheel(ctx, rotationRef.current);
    }
  }, [segments]);

  // Handle spinning animation
  useEffect(() => {
  if (!isSpinning) return;

  setIsAnimating(true);

  const selectedIndex = getRandomSegmentIndex();
  const sliceAngle = 360 / segments.length;

  // pointer is at top (270deg canvas-wise), adjust if needed
  const pointerOffset = -90;

  const startRotation = rotationRef.current;

  const spins = 5; // full spins
  const finalRotation =
    startRotation +
    spins * 360 +
    selectedIndex * sliceAngle +
    sliceAngle / 2 +
    pointerOffset;

  let startTime: number | null = null;
  const duration = 3000;

  const animate = (time: number) => {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const t = Math.min(elapsed / duration, 1);

    // cubic ease-out
    const ease = 1 - Math.pow(1 - t, 3);

    const currentRotation =
      startRotation + (finalRotation - startRotation) * ease;

    setRotation(currentRotation);
    rotationRef.current = currentRotation;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawWheel(ctx, currentRotation);

    if (t < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // snap exactly to final angle
      const normalized = ((finalRotation % 360) + 360) % 360;
      rotationRef.current = normalized;
      setRotation(normalized);

      setIsAnimating(false);
      onSpinComplete?.(segments[selectedIndex], selectedIndex);
    }
  };

  animationRef.current = requestAnimationFrame(animate);

  return () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
}, [isSpinning, segments, onSpinComplete]);


  return (
    <div className={styles.wheelWrapper}>
      <canvas
        ref={canvasRef}
        className={styles.wheelCanvas}
        style={{
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
};
