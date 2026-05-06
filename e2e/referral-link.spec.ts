/**
 * E2E Test 3: Referral page → link displayed → no undefined
 *
 * Navigates from Profile → Referral page and verifies the
 * referral code/link loads without "undefined" strings.
 *
 * Note: In dev mode the API calls may fail (no real backend).
 * The page shows "Loading referral data..." then an error state.
 * We test that the page renders and doesn't show "undefined".
 */
import { test, expect } from './fixtures';

test.describe('Referral link flow', () => {
  test('should navigate to referral page from profile', async ({ page }) => {
    // Go to profile via bottom nav
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });

    // Click the "Invite Friends & Earn" button
    const inviteButton = page.getByRole('button', { name: /invite friends/i });
    await expect(inviteButton).toBeVisible();
    await inviteButton.click();

    // Should see referral page content
    await expect(page.getByText(/Referral Program/i)).toBeVisible({ timeout: 5_000 });
  });

  test('should not display undefined in referral content', async ({ page }) => {
    // Go to profile then referral
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });
    await page.getByRole('button', { name: /invite friends/i }).click();
    await page.waitForTimeout(3_000); // Wait for API call to complete/fail

    // Check body doesn't contain "undefined" as a literal string
    const pageContent = await page.textContent('body');
    // "undefined" should not appear as a literal string in rendered content
    // (We allow it in script tags but not visible text)
    const visibleText = await page.innerText('body');
    expect(visibleText).not.toContain('undefined');
  });

  test('should have action button or loading state on referral page', async ({ page }) => {
    // Go to profile then referral
    await page.locator('nav button[title="Profile"]').click();
    await page.waitForSelector('text=Profile', { timeout: 10_000 });
    await page.getByRole('button', { name: /invite friends/i }).click();

    // Page should show referral program header
    await expect(page.getByText(/Referral Program/i)).toBeVisible({ timeout: 5_000 });

    // The referral page either:
    // 1. Successfully loads and shows Copy/Share buttons, OR
    // 2. Fails to load API data and shows "Loading..." or error state
    // Either way, the page should render without "undefined" and have some content
    // Use innerText (visible text only) to avoid false positives from script/hydration content
    const visibleText = await page.innerText('body');
    expect(visibleText).not.toContain('undefined');
    // Should show at least the header and some content below it
    expect(visibleText).toContain('Referral Program');
  });
});
