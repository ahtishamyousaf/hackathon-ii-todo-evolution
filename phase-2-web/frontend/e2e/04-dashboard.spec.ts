import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `test_dash_${Date.now()}@playwright.com`,
  password: 'TestPassword123',
};

test.describe('Dashboard Analytics', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login
    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(tasks|dashboard)/, { timeout: 10000 });
  });

  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for common dashboard statistics
    const hasStats = await page.locator('text=/total.*task|completed|pending|overdue/i').count() > 0;
    expect(hasStats).toBeTruthy();
  });

  test('should show task breakdown by priority', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for priority-related elements (charts, stats, etc.)
    const hasPriorityData = await page.locator('text=/high|medium|low|priority/i').count() > 0;
    expect(hasPriorityData).toBeTruthy();
  });

  test('should display charts or visualizations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Look for SVG (charts) or canvas elements
    const hasCharts = await page.locator('svg, canvas, [class*="chart"]').count() > 0;

    // Or at least some visual data representation
    const hasVisualData = hasCharts || await page.locator('[class*="stat"], [class*="card"], [data-testid*="stat"]').count() > 0;

    expect(hasVisualData).toBeTruthy();
  });
});
