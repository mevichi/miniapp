'use client';

import styles from './ProfilePage.module.css';
import { useApp } from '@/context/AppContext';

export function ProfilePage(props: { onNavigate?: (page: string) => void }) {
  const { user, logout } = useApp();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const handleConnectWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid wallet address' });
      return;
    }

    setLoading(true);
    try {
      await connectWallet(walletInput);
      setMessage({ type: 'success', text: 'Wallet connected successfully!' });
      setWalletInput('');
      setShowConnectForm(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (amount > (user?.balance || 0)) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    if (!user?.walletAddress) {
      setMessage({ type: 'error', text: 'Please connect a wallet first' });
      return;
    }

    setLoading(true);
    try {
      await withdrawCoins(amount);
      setMessage({
        type: 'success',
        text: `Successfully withdrawn ${amount} coins!`,
      });
      setWithdrawAmount('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Withdrawal failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const maxWithdraw = user?.balance || 0;
  const minWithdraw = 10;
  const canWithdraw = maxWithdraw >= minWithdraw && user?.walletAddress;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>👤 Profile</h1>
        <p className={styles.subtitle}>Your game statistics and info</p>
      </div>

      {/* User Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>{user?.username?.charAt(0).toUpperCase() || '?'}</div>
        <div className={styles.userInfo}>
          <h2 className={styles.username}>{user?.username || 'Guest'}</h2>
          <p className={styles.userId}>ID: {user?.userId || '-'}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>📊 Statistics</h3>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Balance</p>
              <p className={styles.statValue}>{user?.balance || 0}</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>🔑</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Keys Remaining</p>
              <p className={styles.statValue}>{user?.totalKeys || 0}</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>🎡</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Spins</p>
              <p className={styles.statValue}>{user?.totalSpins || 0}</p>
            </div>
          </div>

          <div className={styles.statItem}>
            <div className={styles.statIcon}>🔗</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Wallet Status</p>
              <p className={styles.statValue}>{user?.walletAddress ? '✓ Connected' : '✗ Not Connected'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Link */}
      <div className={styles.section}>
        <button
          className={styles.walletLink}
          onClick={() => props.onNavigate?.('wallet')}
        >
          <span>💳 Wallet Management</span>
          <span>→</span>
        </button>
      </div>

      {/* Achievements */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>🏆 Achievements</h3>

        <div className={styles.achievementsList}>
          <div className={styles.achievement}>
            <span className={styles.achievementIcon}>👋</span>
            <span>Account Created</span>
          </div>
          <div className={styles.achievement}>
            {(user?.totalSpins || 0) > 0 ? (
              <>
                <span className={styles.achievementIcon}>🎡</span>
                <span>First Spin</span>
              </>
            ) : (
              <>
                <span className={styles.achievementIconLocked}>🔒</span>
                <span>Spin the wheel to unlock</span>
              </>
            )}
          </div>
          <div className={styles.achievement}>
            {(user?.balance || 0) > 50 ? (
              <>
                <span className={styles.achievementIcon}>💰</span>
                <span>Major Win</span>
              </>
            ) : (
              <>
                <span className={styles.achievementIconLocked}>🔒</span>
                <span>Earn 50+ coins to unlock</span>
              </>
            )}
          </div>
          <div className={styles.achievement}>
            {user?.walletAddress ? (
              <>
                <span className={styles.achievementIcon}>🔗</span>
                <span>Wallet Connected</span>
              </>
            ) : (
              <>
                <span className={styles.achievementIconLocked}>🔒</span>
                <span>Connect a wallet to unlock</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>⚙️ Account</h3>

        <button className={styles.logoutButton} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* Info Box */}
      <div className={styles.infoBox}>
        <h4>ℹ️ About Your Account</h4>
        <ul>
          <li>Your data is securely stored and encrypted</li>
          <li>All transactions are verified by the backend</li>
          <li>You can withdraw to your TON wallet anytime</li>
          <li>Complete more tasks to earn more keys!</li>
        </ul>
      </div>
    </div>
  );
}
