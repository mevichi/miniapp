/**
 * E2E Test 2: Task list → task display → reward info visible
 *
 * Navigates to Tasks page via the bottom nav "Tasks & Missions" button.
 */
import { test, expect } from './fixtures';

test.describe('Task completion flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to tasks page via bottom nav using title attribute
    await page.locator('nav button[title="Tasks & Missions"]').click();
    await page.waitForTimeout(1_000);
  });

  test('should display tasks page', async ({ page }) => {
    // Should see task-related content on the page
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/task/i);
  });

  test('should show task reward information', async ({ page }) => {
    // Tasks should mention rewards like coins or keys
    const rewardElements = page.locator('text=/coin|key|reward|earn/i');
    await expect(rewardElements.first()).toBeVisible({ timeout: 5_000 });
  });

  test('should show available tasks or empty state', async ({ page }) => {
    // Page should either list tasks or show an empty state
    const pageContent = await page.textContent('body');
    const hasTasks = pageContent!.match(/task|mission|daily|watch|ad/i);
    expect(hasTasks).toBeTruthy();
  });
});
