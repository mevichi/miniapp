'use client';

import { useEffect, useRef } from 'react';
import { Wheel, type ItemProps } from 'spin-wheel';
import styles from './Wheel.module.css';

export interface WheelSegment {
  label: string;
  value: number;
  backgroundColor?: string;
  weight: number;
}

interface WheelProps {
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

export const CustomWheel: React.FC<WheelProps> = ({
  segments,
  onSpinComplete,
  isSpinning = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<Wheel | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Convert segments to spin-wheel ItemProps format
    const items: ItemProps[] = segments.map((seg, idx) => ({
      label: seg.label,
      value: seg.value,
      backgroundColor: seg.backgroundColor || COLORS[idx % COLORS.length],
      weight: seg.weight,
    }));

    // Initialize wheel
    const wheel = new Wheel(containerRef.current, {
      radius: 0.48,
      rotationResistance: 0,
      itemLabelRadius: 0.92,
      itemLabelRadiusMax: 0.3,
      itemLabelRotation: 180,
      itemLabelAlign: 'left',
      itemLabelBaselineOffset: -0.07,
      itemLabelColors: ['#fff'],
      itemLabelFont:
        '"Suez One", "Mochiy Pop P One", "Jua", "Unbounded", "Mitr", "Noto Sans TC", "Noto Sans SC", "Noto Sans Lao", "Noto Color Emoji"',
      itemLabelFontSizeMax: 55,
      itemBackgroundColors: COLORS,
      rotationSpeedMax: 2000,
      lineWidth: 1,
      lineColor: '#fff',
      items,
    });

    wheelRef.current = wheel;

    // Handle spin completion
    wheel.onRest = (event: any) => {
      if (onSpinComplete && event.currentIndex !== undefined) {
        const selectedSegment = segments[event.currentIndex];
        onSpinComplete(selectedSegment, event.currentIndex);
      }
    };

    return () => {
      if (wheelRef.current) {
        wheelRef.current.remove();
      }
    };
  }, [segments, onSpinComplete]);

  const handleSpin = () => {
    if (wheelRef.current && !isSpinning) {
      // Generate random rotation speed and spin
      const randomSpeed = Math.random() * 1000 + 1000;
      wheelRef.current.spin(randomSpeed);
    }
  };

  return (
    <div className={styles.wheelWrapper}>
      <div ref={containerRef} className={styles.wheelContainer}></div>
      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={styles.spinButton}
      >
        {isSpinning ? 'Spinning...' : 'Spin!'}
      </button>
    </div>
  );
};
