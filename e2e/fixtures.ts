import { test as base, expect } from '@playwright/test';

/**
 * Extended test fixture with authenticated dev-mode session.
 *
 * The app auto-logs in when NEXT_PUBLIC_ENV=dev is set.
 * We wait for the Coinly home page to render.
 */
const test = base.extend<{ authenticated: void }>({
  authenticated: [
    async ({ page }, use) => {
      await page.goto('/');
      // Wait for the app to load and dev-login to complete
      await page.waitForSelector('text=Coinly', { timeout: 20_000 });
      await use();
    },
    { auto: true },
  ],
});

/**
 * Navigate to a page via the bottom navigation bar.
 * Uses the title attribute which is unique per nav button.
 */
export async function navigateTo(page: Page, title: string) {
  await page.locator(`nav button[title="${title}"]`).click();
}

// Re-export for convenience
import { Page } from '@playwright/test';
export { test, expect };
