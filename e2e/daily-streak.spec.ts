/**
 * E2E Test 5: Daily streak → login tracking
 *
 * Verifies the profile page shows the daily login streak section.
 */
import { test, expect } from './fixtures';

test.describe('Daily streak display', () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });
  });

  test('should show streak section on profile page', async ({ page }) => {
    await expect(page.getByText(/Daily Login Streak/i)).toBeVisible();
    await expect(page.getByText(/Current Streak/i)).toBeVisible();
    await expect(page.getByText(/Best Streak/i)).toBeVisible();
  });

  test('should show streak numbers', async ({ page }) => {
    // Find the streak section and verify it contains numeric values
    const streakSection = page.locator('div').filter({ hasText: /Daily Login Streak/ }).first();
    await expect(streakSection).toBeVisible();
    // Should have at least one number in the streak area
    const numbers = streakSection.locator('text=/\\d+/');
    const count = await numbers.count();
    expect(count).toBeGreaterThanOrEqual(2); // current + best
  });
});
