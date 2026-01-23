'use client';

import { useState } from 'react';
import styles from './WalletPage.module.css';
import { useApp } from '@/context/AppContext';
import { PageType } from '@/utils/types';

export function WalletPage(props: { onNavigate?: (page: PageType) => void }) {
  const { user, token, connectWallet, withdrawCoins } = useApp();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [walletInput, setWalletInput] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);

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
        <h1 className={styles.title}>💰 Wallet</h1>
        <p className={styles.subtitle}>Manage your balance and withdraw to TON</p>
      </div>

      {/* Balance Section */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceContent}>
          <h3>Your Balance</h3>
          <div className={styles.balanceAmount}>{user?.balance || 0}</div>
          <p className={styles.balanceLabel}>💰 Coins</p>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Connected Wallet</h2>

        {user?.walletAddress ? (
          <div className={styles.walletConnected}>
            <div className={styles.walletIcon}>✓</div>
            <div className={styles.walletInfo}>
              <p className={styles.walletLabel}>TON Wallet Connected</p>
              <p className={styles.walletAddress}>{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-6)}</p>
            </div>
          </div>
        ) : (
          <div>
            {!showConnectForm ? (
              <button
                className={styles.connectButton}
                onClick={() => setShowConnectForm(true)}
              >
                🔗 Connect TON Wallet
              </button>
            ) : (
              <form onSubmit={handleConnectWallet} className={styles.connectForm}>
                <input
                  type="text"
                  placeholder="Enter your TON wallet address"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  className={styles.input}
                  disabled={loading}
                />
                <div className={styles.formButtons}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading || !walletInput.trim()}
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowConnectForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Section */}
      {user?.walletAddress && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Withdraw Coins</h2>

          <form onSubmit={handleWithdraw} className={styles.withdrawForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Amount</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={styles.input}
                  min="0"
                  max={maxWithdraw}
                  disabled={loading}
                />
                <span className={styles.inputUnit}>💰</span>
              </div>
              <div className={styles.limits}>
                <span>Min: {minWithdraw}</span>
                <span>Max: {maxWithdraw}</span>
              </div>
            </div>

            <div className={styles.quickAmount}>
              <p>Quick amounts:</p>
              <div className={styles.quickButtons}>
                {[10, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={styles.quickButton}
                    onClick={() => setWithdrawAmount(Math.min(amt, maxWithdraw).toString())}
                    disabled={amt > maxWithdraw || loading}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={styles.withdrawButton}
              disabled={!canWithdraw || !withdrawAmount || loading}
            >
              {loading ? '⏳ Processing...' : '✓ Withdraw'}
            </button>
          </form>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        <h3>About Withdrawals</h3>
        <ul>
          <li>💰 Minimum withdrawal: {minWithdraw} coins</li>
          <li>🔗 Must connect a TON wallet first</li>
          <li>⏱️ Withdrawals are processed instantly</li>
          <li>🔐 Your wallet address is encrypted and secure</li>
        </ul>
      </div>
    </div>
  );
}
