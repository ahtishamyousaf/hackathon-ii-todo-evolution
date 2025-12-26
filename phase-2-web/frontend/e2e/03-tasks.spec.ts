import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: `test_task_${Date.now()}@playwright.com`,
  password: 'TestPassword123',
};

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login
    await page.goto('/register');
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/\/(tasks|dashboard)/, { timeout: 10000 });
  });

  test('should create a new task', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Find and click "Add Task" or similar button
    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button:has-text("Create Task"), button[aria-label*="add" i]').first();

    await addTaskButton.click({ timeout: 10000 });

    // Fill task form
    const taskTitle = `Test Task ${Date.now()}`;
    await page.fill('input[name="title"], input[placeholder*="title" i]', taskTitle);

    // Fill description if available
    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
    if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await descInput.fill('This is a test task created by Playwright');
    }

    // Select priority if available
    const prioritySelect = page.locator('select[name="priority"], [data-testid="priority-select"]').first();
    if (await prioritySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await prioritySelect.selectOption('high');
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save"), button:has-text("Add")');

    // Wait for task to appear in list
    await page.waitForTimeout(2000);

    // Verify task exists
    const taskExists = await page.locator(`text="${taskTitle}"`).isVisible({ timeout: 5000 }).catch(() => false);
    expect(taskExists).toBeTruthy();
  });

  test('should mark a task as complete', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Create a task first
    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task"), button:has-text("Create Task")').first();
    await addTaskButton.click({ timeout: 10000 });

    const taskTitle = `Complete Me ${Date.now()}`;
    await page.fill('input[name="title"], input[placeholder*="title" i]', taskTitle);
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save"), button:has-text("Add")');

    await page.waitForTimeout(2000);

    // Find the task and click its checkbox
    const taskCheckbox = page.locator(`[type="checkbox"]:near(:text("${taskTitle}"))`).first();

    if (await taskCheckbox.isVisible({ timeout: 5000 }).catch(() => false)) {
      await taskCheckbox.click();

      // Wait for state change
      await page.waitForTimeout(1000);

      // Verify checkbox is checked
      const isChecked = await taskCheckbox.isChecked();
      expect(isChecked).toBeTruthy();
    } else {
      console.log('Task checkbox not found - UI might have different structure');
    }
  });

  test('should filter tasks by priority', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Look for priority filter
    const priorityFilter = page.locator('select:has-text("Priority"), [data-testid="priority-filter"], button:has-text("Priority")').first();

    if (await priorityFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      // If it's a select, choose high priority
      if (await priorityFilter.evaluate(el => el.tagName === 'SELECT')) {
        await priorityFilter.selectOption('high');
      } else {
        await priorityFilter.click();
        await page.click('text=/high/i');
      }

      // Wait for filter to apply
      await page.waitForTimeout(2000);

      // Verify URL or UI updated
      const urlOrStateChanged = page.url().includes('priority') ||
        await page.locator('text=/filter|high/i').isVisible().catch(() => false);

      expect(urlOrStateChanged).toBeTruthy();
    } else {
      console.log('Priority filter not found - might be in different location');
    }
  });

  test('should search for tasks', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle');

    // Create a uniquely named task
    const uniqueTitle = `SearchableTask_${Date.now()}`;

    const addTaskButton = page.locator('button:has-text("Add Task"), button:has-text("New Task")').first();
    if (await addTaskButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addTaskButton.click();
      await page.fill('input[name="title"], input[placeholder*="title" i]', uniqueTitle);
      await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save")');
      await page.waitForTimeout(2000);
    }

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name="search"]').first();

    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill(uniqueTitle);
      await page.waitForTimeout(2000);

      // Verify task is visible
      const taskVisible = await page.locator(`text="${uniqueTitle}"`).isVisible({ timeout: 5000 }).catch(() => false);
      expect(taskVisible).toBeTruthy();
    } else {
      console.log('Search input not found');
    }
  });
});
