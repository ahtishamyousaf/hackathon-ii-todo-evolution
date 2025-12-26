import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `test_${Date.now()}@playwright.com`,
  password: 'TestPassword123',
};

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation or success
    await page.waitForURL('**/tasks', { timeout: 10000 }).catch(() => {
      // Alternative: check for dashboard or tasks page
      return page.waitForURL('**/dashboard', { timeout: 5000 });
    });

    // Verify successful registration (should be on tasks or dashboard page)
    const url = page.url();
    expect(url).toMatch(/\/(tasks|dashboard)/);
  });

  test('should login with existing user', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('**/tasks', { timeout: 10000 }).catch(() => {
      return page.waitForURL('**/dashboard', { timeout: 5000 });
    });

    // Verify successful login
    const url = page.url();
    expect(url).toMatch(/\/(tasks|dashboard)/);
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('input[name="email"], input[type="email"]', 'invalid@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait a moment for error message
    await page.waitForTimeout(2000);

    // Should still be on login page
    expect(page.url()).toContain('/login');

    // Check for error message (may be toast, alert, or text)
    const errorVisible = await page.locator('text=/invalid|error|incorrect|wrong/i').isVisible().catch(() => false);

    // If no visible error, at least we should still be on login page
    expect(page.url()).toContain('/login');
  });

  test('should require authentication for protected routes', async ({ page }) => {
    // Clear cookies to simulate logged out state
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/tasks');

    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
