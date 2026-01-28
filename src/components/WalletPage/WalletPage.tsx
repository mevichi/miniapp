'use client';

import { useState, useEffect } from 'react';
import styles from './WalletPage.module.css';
import { useApp } from '@/context/AppContext';
import { PageType } from '@/utils/types';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';

interface Withdrawal {
  withdrawalId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  transactionId: string;
}

export function WalletPage(props: { onNavigate?: (page: PageType) => void }) {
  const { user, token, refreshUser, connectWallet, withdrawCoins } = useApp();
  const wallet = useTonWallet();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [walletInput, setWalletInput] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [connectingTonWallet, setConnectingTonWallet] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<Withdrawal[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Sync wallet address from database on page load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch withdrawal history
  useEffect(() => {
    if (token && user?.walletAddress) {
      fetchWithdrawalHistory();
    }
  }, [token, user?.walletAddress]);

  const fetchWithdrawalHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/wallet/withdrawals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Withdrawal history fetched:', data.withdrawals);
        setWithdrawalHistory(data.withdrawals || []);
      } else {
        console.error('Failed to fetch withdrawals:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal history:', error);
    } finally {
      setLoadingHistory(false);
    }
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

  const handleConnectTonWallet = async () => {
    if (!wallet) {
      setMessage({ type: 'error', text: 'Please connect a TON wallet first' });
      return;
    }

    setConnectingTonWallet(true);
    try {
      const walletAddress = wallet.account?.address || '';
      if (!walletAddress) {
        setMessage({ type: 'error', text: 'Unable to retrieve wallet address' });
        return;
      }

      // Format the wallet address (remove network prefix if present)
      const formattedAddress = walletAddress.split(':').pop() || walletAddress;
      
      await connectWallet(formattedAddress);
      setMessage({ type: 'success', text: 'TON wallet connected successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to connect TON wallet',
      });
    } finally {
      setConnectingTonWallet(false);
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
      // Refresh withdrawal history after successful withdrawal
      await fetchWithdrawalHistory();
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
  const minWithdraw = 50000;
  const minDiamonds = 100;
  const totalDiamonds = user?.totalDiamonds || 0;
  const canWithdraw = maxWithdraw >= minWithdraw && user?.walletAddress && totalDiamonds >= minDiamonds;

  // TON conversion: 0.15 TON per 5000 coins
  const coinsPerTon = 5000;
  const tonPerCoins = 0.15;
  const getTonAmount = (coins: number) => ((coins / coinsPerTon) * tonPerCoins).toFixed(3);

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
            <div className={styles.connectionMethods}>
              {/* TonConnect Native Method */}
              <div className={styles.connectionMethod}>
                <h3 className={styles.methodTitle}>🔗 Connect with TON Wallet</h3>
                <p className={styles.methodDescription}>Use your native TON wallet (Tonkeeper, TonHub, etc.)</p>
                <div className={styles.tonConnectButtonWrapper}>
                  <TonConnectButton />
                </div>
                {wallet && (
                  <button
                    className={styles.useConnectedButton}
                    onClick={handleConnectTonWallet}
                    disabled={connectingTonWallet || loading}
                  >
                    {connectingTonWallet ? 'Connecting...' : '✓ Use This Wallet'}
                  </button>
                )}
              </div>

              {/* Manual Entry Method */}
              <div className={styles.divider}>or</div>
              <div className={styles.connectionMethod}>
                <h3 className={styles.methodTitle}>📝 Enter Manually</h3>
                <p className={styles.methodDescription}>Paste your wallet address directly</p>
                {!showConnectForm ? (
                  <button
                    className={styles.connectButton}
                    onClick={() => setShowConnectForm(true)}
                  >
                    Enter Wallet Address
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
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Section */}
      {user?.walletAddress && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Withdraw Coins</h2>

          {totalDiamonds < minDiamonds && (
            <div className={styles.requirementWarning}>
              💎 You need <strong>{minDiamonds}</strong> diamonds to withdraw
              <br />
              Current: <strong>{totalDiamonds}</strong> diamonds
              <br />
              Earn diamonds by completing tasks, spinning the wheel, and opening treasure boxes!
            </div>
          )}

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
              {withdrawAmount && (
                <div className={styles.tonConversion}>
                  💎 You will receive <strong>{getTonAmount(parseFloat(withdrawAmount))} TON</strong>
                  <br />
                  <small>(0.15 TON per 5,000 coins)</small>
                </div>
              )}
            </div>

            <div className={styles.quickAmount}>
              <p>Quick amounts:</p>
              <div className={styles.quickButtons}>
                {[50000, 100000, 150000].map((amt) => (
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

      {/* Withdrawal History */}
      {user?.walletAddress && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📋 Withdrawal History</h2>
          {loadingHistory ? (
            <p className={styles.loading}>Loading history...</p>
          ) : withdrawalHistory.length === 0 ? (
            <p className={styles.empty}>No withdrawals yet</p>
          ) : (
            <div className={styles.historyList}>
              {withdrawalHistory.map((withdrawal) => (
                <div key={withdrawal.withdrawalId} className={styles.historyItem}>
                  <div className={styles.historyContent}>
                    <div className={styles.historyMain}>
                      <span className={styles.historyAmount}>{withdrawal.amount} 💰</span>
                      <span className={styles.historyTon}>
                        {getTonAmount(withdrawal.amount)} TON
                      </span>
                    </div>
                    <div className={styles.historyDetails}>
                      <span className={styles.historyDate}>
                        {new Date(withdrawal.timestamp).toLocaleDateString()} {new Date(withdrawal.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className={`${styles.historyStatus} ${styles[withdrawal.status]}`}>
                    {withdrawal.status === 'pending' && '⏳'}
                    {withdrawal.status === 'completed' && '✓'}
                    {withdrawal.status === 'failed' && '✗'}
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
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
