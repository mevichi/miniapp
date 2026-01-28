'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as api from '@/services/api';

interface User {
  userId: number;
  username: string;
  balance: number;
  totalKeys: number;
  totalDiamonds: number;
  totalSpins: number;
  walletAddress?: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Auth methods
  login: (initData: string, userId: number, username?: string) => Promise<void>;
  logout: () => void;

  // User methods
  refreshUser: () => Promise<void>;
  addKeys: (amount: number) => void;
  spendKeys: (amount: number) => void;
  addDiamonds: (amount: number) => void;
  updateBalance: (amount: number) => void;

  // Task methods
  completeTask: (taskId: string) => Promise<void>;

  // Wallet methods
  connectWallet: (address: string) => Promise<void>;
  withdrawCoins: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (initData: string, userId: number, username?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // Call backend to verify user and get token
        const response = await api.verifyUser(initData, userId, username);
        setToken(response.token);
        setUser({
          userId: response.userId,
          username: response.username,
          balance: response.balance,
          totalKeys: response.totalKeys,
          totalDiamonds: response.totalDiamonds || 0,
          totalSpins: 0,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const profile = await api.getUserProfile(token);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              balance: profile.balance,
              totalKeys: profile.totalKeys,
              totalDiamonds: profile.totalDiamonds || 0,
              totalSpins: profile.totalSpins,
              walletAddress: profile.walletAddress,
            }
          : null
      );
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [token]);

  const addKeys = useCallback((amount: number) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            totalKeys: prev.totalKeys + amount,
          }
        : null
    );
  }, []);

  const spendKeys = useCallback((amount: number) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            totalKeys: Math.max(0, prev.totalKeys - amount),
          }
        : null
    );
  }, []);

  const updateBalance = useCallback((amount: number) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            balance: prev.balance + amount,
          }
        : null
    );
  }, []);

  const addDiamonds = useCallback((amount: number) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            totalDiamonds: prev.totalDiamonds + amount,
          }
        : null
    );
  }, []);

  const completeTaskHandler = useCallback(
    async (taskId: string) => {
      if (!token) throw new Error('Not authenticated');

      try {
        const result = await api.completeTask(token, taskId);
        addKeys(result.keysEarned);
        addDiamonds(result.diamondsEarned || 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Task completion failed';
        setError(message);
        throw err;
      }
    },
    [token, addKeys]
  );

  const connectWalletHandler = useCallback(
    async (address: string) => {
      if (!token) throw new Error('Not authenticated');

      try {
        await api.connectWallet(token, address);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                walletAddress: address,
              }
            : null
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Wallet connection failed';
        setError(message);
        throw err;
      }
    },
    [token]
  );

  const withdrawCoinsHandler = useCallback(
    async (amount: number) => {
      if (!token) throw new Error('Not authenticated');

      try {
        const result = await api.withdrawCoins(token, amount);
        setUser((prev) =>
          prev
            ? {
                ...prev,
                balance: result.newBalance,
              }
            : null
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Withdrawal failed';
        setError(message);
        throw err;
      }
    },
    [token]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
        addKeys,
        spendKeys,
        addDiamonds,
        updateBalance,
        completeTask: completeTaskHandler,
        connectWallet: connectWalletHandler,
        withdrawCoins: withdrawCoinsHandler,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
