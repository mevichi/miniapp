'use client';

import styles from './TasksPage.module.css';
import { useApp } from '@/context/AppContext';
import { PageType } from '@/utils/types';

interface TasksPageProps {
  onNavigate?: (page: PageType) => void;
}

export function TasksPage({ onNavigate }: TasksPageProps) {
  const { user } = useApp();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>✓ Tasks</h1>
        <p className={styles.subtitle}>Choose an activity to earn rewards</p>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span>💎 Diamonds</span>
          <strong>{user?.totalDiamonds || 0}</strong>
        </div>
        <div className={styles.stat}>
          <span>🎡 Spins</span>
          <strong>{user?.totalKeys || 0}</strong>
        </div>
      </div>

      {/* Quick Links Section - Main Activities */}
      <div className={styles.quickLinksSection}>
        <h3 className={styles.activitiesTitle}>Available Activities</h3>
        <div className={styles.quickLinksGrid}>
          <button
            className={styles.quickLinkCard}
            onClick={() => onNavigate?.('wheel')}
          >
            <div className={styles.quickLinkIcon}>🎡</div>
            <h3 className={styles.quickLinkTitle}>Spin the Wheel</h3>
            <p className={styles.quickLinkDesc}>Use your spins to win prizes</p>
          </button>

          <button
            className={styles.quickLinkCard}
            onClick={() => onNavigate?.('treasury')}
          >
            <div className={styles.quickLinkIcon}>🏺</div>
            <h3 className={styles.quickLinkTitle}>Treasury Box</h3>
            <p className={styles.quickLinkDesc}>Open boxes for rewards</p>
          </button>
        </div>
      </div>

      {/* Ad Tasks Section */}
      <div className={styles.adSection}>
        <h3 className={styles.adSectionTitle}>Earn More Rewards</h3>
        <button
          className={styles.adCard}
          onClick={() => onNavigate?.('ads')}
        >
          <div className={styles.adCardIcon}>📺</div>
          <div className={styles.adCardContent}>
            <h4 className={styles.adCardTitle}>Watch Ads</h4>
            <p className={styles.adCardDesc}>Watch 50 ads to earn 500 coins</p>
          </div>
          <span className={styles.adCardArrow}>→</span>
        </button>
      </div>

      <div className={styles.infoBox}>
        <h4>💡 How to Earn</h4>
        <ul>
          <li>Complete activities to earn diamonds and coins</li>
          <li>Watch ads to unlock special rewards</li>
          <li>Use coins in the Treasury Box for exclusive items</li>
          <li>Collect diamonds for special perks</li>
        </ul>
      </div>
    </div>
  );
}
