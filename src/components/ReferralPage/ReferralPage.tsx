'use client';

import { useState, useEffect } from 'react';
import styles from './ReferralPage.module.css';
import { useApp } from '@/context/AppContext';
import { PageType } from '@/utils/types';
import { getReferralCode, getReferralStats } from '@/services/api';

interface ReferredUser {
  userId: number;
  username: string;
  balance: number;
  totalKeys: number;
  joinedAt: string;
  completedTasks: number;
  bonusEligible: boolean;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  totalReferralEarnings: number;
  pendingBonuses: number;
  referredUsers: ReferredUser[];
}

interface ReferralPageProps {
  onNavigate?: (page: PageType) => void;
}

export function ReferralPage({ onNavigate }: ReferralPageProps) {
  const { user, token, updateBalance, addKeys } = useApp();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      fetchReferralData();
    }
  }, [token, user]);

  const fetchReferralData = async () => {
    if (!token || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get or create referral code
      const codeData = await getReferralCode(token, user.userId);
      
      // Get referral stats
      const statsData = await getReferralStats(token, user.userId);
      
      setStats({
        ...codeData,
        ...statsData,
      });
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
      setError('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!stats?.referralLink) return;
    
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTelegram = () => {
    if (!stats?.referralLink) return;
    
    const text = encodeURIComponent(`🎉 Join me on this awesome app! Use my referral link: ${stats.referralLink}`);
    window.open(`https://t.me/share/url?url=${text}`, '_blank');
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>🎁 Referral Program</h1>
        <p className={styles.subtitle}>Invite friends and earn rewards!</p>
      </header>

      {loading ? (
        <div className={styles.loading}>
          <p>Loading referral data...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchReferralData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Referral Code Card */}
          <section className={styles.codeCard}>
            <h2>Your Referral Code</h2>
            <div className={styles.codeBox}>
              <span className={styles.code}>{stats?.referralCode}</span>
            </div>
            <div className={styles.linkBox}>
              <input
                type="text"
                value={stats?.referralLink || ''}
                readOnly
                className={styles.linkInput}
              />
              <button onClick={copyReferralLink} className={styles.copyButton}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <button onClick={shareToTelegram} className={styles.shareButton}>
              📤 Share on Telegram
            </button>
          </section>

          {/* Stats Cards */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats?.referralCount || 0}</span>
              <span className={styles.statLabel}>Total Invites</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats?.pendingBonuses || 0}</span>
              <span className={styles.statLabel}>Pending Bonuses</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>💰 {stats?.totalReferralEarnings || 0}</span>
              <span className={styles.statLabel}>Coins Earned</span>
            </div>
          </section>

          {/* How It Works */}
          <section className={styles.howItWorks}>
            <h2>How It Works</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <p>Share your referral link</p>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <p>Friend signs up and gets <strong>50 coins + 1 key</strong> instantly!</p>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <p>When they complete 3 tasks, you get <strong>100 coins + 1 key</strong>!</p>
              </div>
            </div>
          </section>

          {/* Referred Users List */}
          <section className={styles.referredUsers}>
            <h2>Your Invitations ({stats?.referredUsers?.length || 0})</h2>
            
            {!stats?.referredUsers?.length ? (
              <div className={styles.emptyState}>
                <p>No invitations yet. Share your link to invite friends!</p>
              </div>
            ) : (
              <div className={styles.usersList}>
                {stats.referredUsers.map((referred) => (
                  <div key={referred.userId} className={styles.userCard}>
                    <div className={styles.userInfo}>
                      <span className={styles.username}>@{referred.username}</span>
                      <span className={styles.joinDate}>
                        Joined {new Date(referred.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.userStats}>
                      <span className={styles.tasksCount}>
                        📋 {referred.completedTasks} tasks
                      </span>
                      <span className={`${styles.bonusStatus} ${referred.bonusEligible ? styles.eligible : ''}`}>
                        {referred.bonusEligible ? '✅ Bonus Earned' : '⏳ In Progress'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
