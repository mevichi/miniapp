'use client';

import { PageType } from '@/utils/types';
import styles from './HomePage.module.css';
import { useApp } from '@/context/AppContext';

interface HomePageProps {
  onNavigate: (page: PageType) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useApp();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gold Rush</h1>
        <p className={styles.subtitle}>Earn tokens • Spin to win • Withdraw to wallet</p>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{user?.totalKeys || 0}</div>
          <div className={styles.statLabel}>🔑 Keys</div>
          <div className={styles.statDesc}>1 key = 1 spin</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{user?.balance || 0}</div>
          <div className={styles.statLabel}>💰 Balance</div>
          <div className={styles.statDesc}>Withdraw to wallet</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{user?.totalDiamonds || 0}</div>
          <div className={styles.statLabel}>💎 Diamonds</div>
          <div className={styles.statDesc}>Activity tracker</div>
        </div>

      </div>

      <div className={styles.actionCards}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>✓</div>
          <h3 className={styles.cardTitle}>Complete Tasks</h3>
          <p className={styles.cardDesc}>Watch ads to earn keys</p>
          <button
            className={styles.cardButton}
            onClick={() => onNavigate('tasks')}
          >
            Go to Tasks →
          </button>
        </div>

        {/* <div className={styles.card}>
          <div className={styles.cardIcon}>🎡</div>
          <h3 className={styles.cardTitle}>Spin the Wheel</h3>
          <p className={styles.cardDesc}>
            Use {user?.totalKeys || 0} {(user?.totalKeys || 0) !== 1 ? 'keys' : 'key'} to spin
          </p>
          <button
            className={styles.cardButton}
            onClick={() => onNavigate('wheel')}
            disabled={!user || user.totalKeys === 0}
          >
            Spin Now →
          </button>
        </div> */}

        <div className={styles.card}>
          <div className={styles.cardIcon}>💰</div>
          <h3 className={styles.cardTitle}>Withdraw Coins</h3>
          <p className={styles.cardDesc}>
            ${user?.balance || 0} available
          </p>
          <button
            className={styles.cardButton}
            onClick={() => onNavigate('wallet')}
            disabled={!user || user.balance === 0}
          >
            Withdraw →
          </button>
        </div>
      </div>

      <div className={styles.infoBox}>
        <h3>How it works?</h3>
        <ol>
          <li>📺 Watch ads in <strong>Tasks</strong> to earn keys</li>
          <li>🎡 Spin the wheel with your keys for prizes</li>
          <li>💰 Collect coins and gold rewards</li>
          <li>🔗 Connect your TON wallet to withdraw</li>
        </ol>
      </div>

      <div className={styles.userInfo}>
        <p>Welcome, <strong>{user?.username || 'Player'}</strong>! 👋</p>
      </div>
    </div>
  );
}
