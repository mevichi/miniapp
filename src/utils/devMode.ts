/**
 * Development Mode Utilities
 * Provides helper functions to detect and handle development mode
 */

/**
 * Check if the app is running in development mode
 */
export const isDev = (): boolean => {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENV === 'dev') {
    return true;
  }
  if (typeof window !== 'undefined') {
    // Also check client-side if needed
    return true;
  }
  return false;
};

/**
 * Mock Telegram user data for development
 */
export const MOCK_DEV_USER = {
  id: 123456789,
  first_name: 'Dev',
  last_name: 'User',
  username: 'devuser',
  language_code: 'en',
};

/**
 * Mock init data for development
 */
export const createMockInitData = (): string => {
  const userData = JSON.stringify(MOCK_DEV_USER);
  const params = new URLSearchParams([
    ['user', userData],
    ['auth_date', Math.floor(Date.now() / 1000).toString()],
    ['hash', 'dev-mode-hash'],
  ]);
  return params.toString();
};

/**
 * Mock API response for user verification in dev mode
 */
export const getMockDevUserResponse = () => ({
  token: 'dev-mode-token-' + Date.now(),
  userId: MOCK_DEV_USER.id,
  username: MOCK_DEV_USER.username,
  balance: 500,
  totalKeys: 10,
  totalSpins: 0,
});

/**
 * Log dev mode info
 */
export const logDevMode = (): void => {
  console.info(
    '%c🔧 Development Mode Enabled',
    'color: orange; font-weight: bold; font-size: 14px;'
  );
  console.info(
    '%cℹ️ Running in dev mode - Telegram authentication is bypassed',
    'color: blue; font-size: 12px;'
  );
  console.info(
    '%cℹ️ Mock user data will be used for testing',
    'color: blue; font-size: 12px;'
  );
};
