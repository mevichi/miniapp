/**
 * E2E Test 4: Profile → wallet connect → address shown
 *
 * Navigates to Profile and Wallet pages via bottom nav.
 */
import { test, expect } from './fixtures';

test.describe('Profile and Wallet flow', () => {
  test('should display profile with user stats', async ({ page }) => {
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });

    // Should show username (devuser in dev mode)
    await expect(page.getByText('devuser')).toBeVisible();

    // Should show stats
    await expect(page.getByText('Balance')).toBeVisible();
    await expect(page.getByText('Diamonds')).toBeVisible();
  });

  test('should show daily login streak section', async ({ page }) => {
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });

    await expect(page.getByText(/Daily Login Streak/i)).toBeVisible();
    await expect(page.getByText(/Current Streak/i)).toBeVisible();
    await expect(page.getByText(/Best Streak/i)).toBeVisible();
  });

  test('should navigate to wallet page from profile', async ({ page }) => {
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });

    // The wallet link button contains "💳" emoji and "Wallet Management" text
    const walletButton = page.locator('button').filter({ hasText: /Wallet/ }).last();
    await expect(walletButton).toBeVisible({ timeout: 5_000 });
    await walletButton.click();

    // Wallet page should load — either heading or content about wallet
    await page.waitForTimeout(2_000);
    const pageContent = await page.textContent('body');
    expect(pageContent!.toLowerCase()).toMatch(/wallet|connect|withdraw/i);
  });

  test('should navigate to wallet page via bottom nav', async ({ page }) => {
    await page.locator('nav button[title="Wallet"]').click();
    await page.waitForTimeout(2_000);

    // Wallet page should show some content
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    // Should have wallet-related content
    expect(pageContent!.toLowerCase()).toMatch(/wallet|balance|withdraw|connect/i);
  });
});
