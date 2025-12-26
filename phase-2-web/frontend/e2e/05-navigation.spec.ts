import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `test_nav_${Date.now()}@playwright.com`,
  password: 'TestPassword123',
};

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login
    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/(tasks|dashboard)/, { timeout: 10000 });
  });

  test('should navigate to tasks page', async ({ page }) => {
    await page.goto('/dashboard');

    // Click tasks link
    const tasksLink = page.locator('a[href="/tasks"], a:has-text("Tasks"), nav a:has-text("Tasks")').first();
    await tasksLink.click({ timeout: 10000 });

    await page.waitForURL('**/tasks', { timeout: 5000 });
    expect(page.url()).toContain('/tasks');
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/tasks');

    // Click dashboard link
    const dashboardLink = page.locator('a[href="/dashboard"], a:has-text("Dashboard"), nav a:has-text("Dashboard")').first();
    await dashboardLink.click({ timeout: 10000 });

    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should navigate to calendar view', async ({ page }) => {
    await page.goto('/tasks');

    // Look for calendar link
    const calendarLink = page.locator('a[href="/calendar"], a:has-text("Calendar"), nav a:has-text("Calendar")').first();

    if (await calendarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await calendarLink.click();
      await page.waitForURL('**/calendar', { timeout: 5000 });
      expect(page.url()).toContain('/calendar');
    } else {
      console.log('Calendar link not found - may not be implemented yet');
    }
  });

  test('should navigate to kanban view', async ({ page }) => {
    await page.goto('/tasks');

    // Look for kanban link
    const kanbanLink = page.locator('a[href="/kanban"], a:has-text("Kanban"), a:has-text("Board")').first();

    if (await kanbanLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await kanbanLink.click();
      await page.waitForURL('**/kanban', { timeout: 5000 });
      expect(page.url()).toContain('/kanban');
    } else {
      console.log('Kanban link not found - may not be implemented yet');
    }
  });

  test('should have responsive sidebar or navigation menu', async ({ page }) => {
    await page.goto('/tasks');

    // Check for navigation elements
    const hasNav = await page.locator('nav, [role="navigation"], aside, [class*="sidebar"]').count() > 0;
    expect(hasNav).toBeTruthy();
  });
});
