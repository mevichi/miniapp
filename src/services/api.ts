/**
 * API Service for communicating with https://api.solfren.dev
 * All backend endpoints are documented with comments for easy deployment
 */

import { isDev, getMockDevUserResponse } from '@/utils/devMode';

const API_BASE_URL = 'https://api.solfren.dev';

/**
 * Helper to determine if we should use mock responses
 */
const useDevMode = (): boolean => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENV === 'dev') {
    return true;
  }
  return false;
};

/**
 * Dev mode state tracking - persists across page navigates
 */
const DEV_MODE_STORAGE_KEY = 'dev_mode_ad_state';

interface DevModeAdState {
  lastAdCompletedAt?: number; // Timestamp in milliseconds
  adProgress: number;
}

const getDevModeAdState = (): DevModeAdState => {
  if (typeof window === 'undefined') {
    return { adProgress: 0 };
  }
  
  try {
    const stored = localStorage.getItem(DEV_MODE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { adProgress: 0 };
  } catch (error) {
    console.error('Failed to get dev mode state:', error);
    return { adProgress: 0 };
  }
};

const setDevModeAdState = (state: DevModeAdState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(DEV_MODE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to set dev mode state:', error);
  }
};

const calculateDevModeCooldown = (lastAdCompletedAt?: number): number => {
  if (!lastAdCompletedAt) return 0;
  
  const THREE_MINUTES_MS = 3 * 60 * 1000;
  const now = Date.now();
  const timeSinceLastAd = now - lastAdCompletedAt;
  
  if (timeSinceLastAd >= THREE_MINUTES_MS) {
    return 0;
  }
  
  return Math.ceil((THREE_MINUTES_MS - timeSinceLastAd) / 1000);
};

/**
 * User authentication and verification
 * Endpoint: POST /api/auth/verify
 * Required for: Initial app load, verifying Telegram user
 */
export const verifyUser = async (initData: string, userId: number, username?: string) => {
  try {
    // Dev mode: return mock response
    if (useDevMode()) {
      console.info('📱 Dev Mode: Using mock verification response');
      return getMockDevUserResponse();
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        initData, // Telegram init data from @tma.js/sdk
        userId,
        username,
      }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: { token, userId, username, balance, totalKeys }
    return data;
  } catch (error) {
    console.error('User verification error:', error);
    throw error;
  }
};

/**
 * Get user profile and balance
 * Endpoint: GET /api/user/profile
 * Required headers: Authorization: Bearer {token}
 */
export const getUserProfile = async (token: string) => {
  try {
    // Dev mode: return mock response
    if (useDevMode()) {
      return {
        userId: 123456789,
        username: 'devuser',
        balance: 500,
        totalKeys: 10,
        totalSpins: 0,
        wins: 0,
        walletAddress: undefined,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: { userId, username, balance, totalKeys, totalSpins, wins, walletAddress }
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Get all available tasks for the user
 * Endpoint: GET /api/tasks
 * Required headers: Authorization: Bearer {token}
 */
export const getTasks = async (token: string) => {
  try {
    // Dev mode: return mock tasks with persistent state
    if (useDevMode()) {
      const devState = getDevModeAdState();
      const cooldownRemaining = calculateDevModeCooldown(devState.lastAdCompletedAt);
      
      return [
        {
          taskId: 'task-1',
          name: 'Watch 50 Ads',
          description: 'Watch advertisements to earn 500 coins',
          reward: 1,
          completed: false,
          type: 'watch_ad',
          totalAds: 50,
          adProgress: devState.adProgress,
          cooldownRemaining: cooldownRemaining,
          canRetryAt: null,
        },
        {
          taskId: 'task-3',
          name: 'Daily Bonus',
          description: 'Complete your daily login to earn 2 keys',
          reward: 2,
          completed: false,
          type: 'daily',
          canRetryAt: null,
        }
      ];
    }

    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: Array<{ taskId, name, description, reward, completed, type, totalAds, adProgress, cooldownRemaining }>
    return data;
  } catch (error) {
    console.error('Get tasks error:', error);
    throw error;
  }
};

/**
 * Complete a task (e.g., watch ad video)
 * Endpoint: POST /api/tasks/{taskId}/complete
 * Required headers: Authorization: Bearer {token}
 */
export const completeTask = async (token: string, taskId: string) => {
  try {
    // Dev mode: return mock success with ad progress
    if (useDevMode()) {
      console.info(`✅ Dev Mode: Task ${taskId} completed (mock)`);
      
      const devState = getDevModeAdState();
      
      // Check if user is trying to watch an ad but cooldown still active
      const cooldownRemaining = calculateDevModeCooldown(devState.lastAdCompletedAt);
      if (cooldownRemaining > 0) {
        throw {
          response: {
            status: 400,
            data: {
              error: `Wait ${cooldownRemaining} seconds before watching the next ad`,
              cooldownRemaining: cooldownRemaining,
              adProgress: devState.adProgress,
            }
          }
        };
      }
      
      // Update dev mode state
      const newAdProgress = Math.min(devState.adProgress + 1, 50);
      const isClaimingReward = newAdProgress >= 50 && devState.adProgress < 50;
      
      setDevModeAdState({
        adProgress: newAdProgress,
        lastAdCompletedAt: Date.now(), // Record when ad was completed
      });
      
      if (isClaimingReward) {
        // Claiming the 500 coins reward after all 50 ads watched
        return {
          success: true,
          keysEarned: 50,
          diamondsEarned: 50,
          coinsAwarded: 500,
          newBalance: 1012,
          totalKeys: 61,
          totalDiamonds: 55,
          adProgress: 50,
          taskCompleted: true,
          isClaim: true,
        };
      } else {
        // Just watched an ad - no rewards yet
        return {
          success: true,
          keysEarned: 0,
          diamondsEarned: 0,
          adBonus: 0,
          newBalance: 512,
          totalKeys: 11,
          totalDiamonds: 5,
          adProgress: newAdProgress,
          taskCompleted: false,
          isClaim: false,
        };
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: { success, keysEarned, diamondsEarned, coinsAwarded, newBalance, totalKeys, totalDiamonds, adProgress, taskCompleted, isClaim }

    return data;
  } catch (error) {
    console.error('Complete task error:', error);
    throw error;
  }
};

/**
 * Record a spin result
 * Endpoint: POST /api/wheel/spin
 * Required headers: Authorization: Bearer {token}
 * This should be called AFTER the wheel spins to record the prize
 */
export const recordWheelSpin = async (
  token: string,
  prize: string,
  keysSpent: number,
  prizeValue: number
) => {
  try {
    // Dev mode: return mock success
    if (useDevMode()) {
      console.info(`🎡 Dev Mode: Wheel spin recorded - Prize: ${prize}, Value: ${prizeValue}`);
      return {
        success: true,
        newBalance: 500 + prizeValue,
        totalWins: 1,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/wheel/spin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        prize,
        keysSpent,
        prizeValue,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to record spin: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: { success, newBalance, totalWins }
    return data;
  } catch (error) {
    console.error('Record wheel spin error:', error);
    throw error;
  }
};

/**
 * Initiate TON wallet connection
 * Endpoint: POST /api/wallet/connect
 * Required headers: Authorization: Bearer {token}
 */
export const connectWallet = async (token: string, walletAddress: string) => {
  try {
    // Dev mode: return mock success
    if (useDevMode()) {
      console.info(`💳 Dev Mode: Wallet connected - Address: ${walletAddress}`);
      return {
        connected: true,
        walletAddress,
        balance: 500,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/wallet/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        walletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to connect wallet: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: { connected, walletAddress, balance }
    return data;
  } catch (error) {
    console.error('Connect wallet error:', error);
    throw error;
  }
};

/**
 * Withdraw coins to TON wallet
 * Endpoint: POST /api/wallet/withdraw
 * Required headers: Authorization: Bearer {token}
 */
export const withdrawCoins = async (token: string, amount: number) => {
  try {
    // Dev mode: return mock success
    if (useDevMode()) {
      console.info(`💸 Dev Mode: Withdrawal of ${amount} coins requested`);
      return {
        success: true,
        transactionId: 'dev-tx-' + Date.now(),
        newBalance: 500 - amount,
        withdrawnAmount: amount,
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to withdraw: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: { success, transactionId, newBalance, withdrawnAmount }
    return data;
  } catch (error) {
    console.error('Withdraw error:', error);
    throw error;
  }
};

/**
 * Get leaderboard (top users by balance)
 * Endpoint: GET /api/leaderboard
 * Optional query params: limit=10, offset=0
 */
export const getLeaderboard = async (token: string, limit: number = 10, offset: number = 0) => {
  try {
    // Dev mode: return mock leaderboard
    if (useDevMode()) {
      return [
        { rank: 1, userId: 987654321, username: 'Player1', balance: 5000, totalSpins: 50 },
        { rank: 2, userId: 876543210, username: 'Player2', balance: 4500, totalSpins: 45 },
        { rank: 3, userId: 123456789, username: 'devuser', balance: 500, totalSpins: 0 },
      ];
    }

    const response = await fetch(
      `${API_BASE_URL}/api/leaderboard?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }

    const data = await response.json();
    // Expected response: Array<{ rank, userId, username, balance, totalSpins }>
    return data;
  } catch (error) {
    console.error('Get leaderboard error:', error);
    throw error;
  }
};
