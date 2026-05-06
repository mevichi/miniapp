import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test configuration for Coinly mini app.
 *
 * Tests run against the dev server with NEXT_PUBLIC_ENV=dev to enable
 * auto-login with mock user data (no Telegram context needed).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'script -qc "NEXT_PUBLIC_ENV=dev PORT=3099 npx next dev --port 3099" /dev/null',
    url: 'http://localhost:3099',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_PUBLIC_ENV: 'dev',
      PORT: '3099',
    },
  },
});
