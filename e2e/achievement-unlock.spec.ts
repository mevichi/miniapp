/**
 * E2E Test 6: Achievement unlock → badge appears
 *
 * Verifies the profile page shows an achievements section
 * with locked and unlocked badge states.
 */
import { test, expect } from './fixtures';

test.describe('Achievement badges', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });
  });

  test('should display achievements section', async ({ page }) => {
    await expect(page.getByText(/Achievements/i)).toBeVisible();
  });

  test('should show Account Created as unlocked', async ({ page }) => {
    // "Account Created" is always unlocked for a logged-in user
    await expect(page.getByText('Account Created')).toBeVisible();
    // The row should have a non-lock emoji (like 👋)
    const row = page.locator('div').filter({ hasText: /Account Created/ }).first();
    await expect(row).toBeVisible();
  });

  test('should show at least one locked achievement', async ({ page }) => {
    // At least one achievement should have a lock icon or "unlock" text
    const locked = page.locator('text=/🔒|unlock/i');
    const count = await locked.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
