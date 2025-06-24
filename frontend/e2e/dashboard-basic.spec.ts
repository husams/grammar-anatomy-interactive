import { test, expect } from '@playwright/test';

const testUser = {
  email: 'dashboard-test@example.com',
  password: 'TestPassword123!',
  name: 'Dashboard Test User'
};

test.describe('Dashboard Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    try {
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      if (await page.locator('text=Invalid credentials').isVisible()) {
        await page.goto('/register');
        await page.fill('input[name="name"]', testUser.name);
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="password"]', testUser.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
      }
    } catch (error) {
      await page.goto('/login');
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
    }
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should load dashboard successfully', async ({ page }) => {
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Your Progress")')).toBeVisible();
    await expect(page.locator('h2:has-text("Grammar Modules")')).toBeVisible();
    await expect(page.locator('h2:has-text("Quick Actions")')).toBeVisible();
    
    const startTime = Date.now();
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('should display progress information', async ({ page }) => {
    await expect(page.locator('text=Total Modules')).toBeVisible();
    await expect(page.locator('text=Completed Lessons')).toBeVisible();
    await expect(page.locator('text=Exercises Done')).toBeVisible();
    
    const progressText = page.locator('text=/\\d+%/');
    await expect(progressText.first()).toBeVisible();
  });

  test('should navigate with continue learning button', async ({ page }) => {
    const continueButton = page.locator('button:has-text("Continue Learning")');
    await expect(continueButton).toBeVisible();
    await continueButton.click();
    await expect(page).toHaveURL(/\/(modules|lessons)/);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await button.focus();
        await expect(button).toBeFocused();
        await page.keyboard.press('Tab');
      }
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible();
    await expect(page.locator('h2:has-text("Your Progress")')).toBeVisible();
    await expect(page.locator('h2:has-text("Quick Actions")')).toBeVisible();
    
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
    
    const progressBars = page.locator('[role="progressbar"]');
    const count = await progressBars.count();
    
    for (let i = 0; i < count; i++) {
      const progressBar = progressBars.nth(i);
      await expect(progressBar).toHaveAttribute('aria-valuenow');
      await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      await expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    }
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('h3')).toBeVisible();
  });

  test('should handle quick actions navigation', async ({ page }) => {
    const anatomyLabButton = page.locator('button:has-text("Anatomy Lab")');
    await anatomyLabButton.click();
    await expect(page).toHaveURL('/anatomy-lab');
    
    await page.goto('/dashboard');
    
    const glossaryLink = page.locator('a:has-text("Glossary")');
    if (await glossaryLink.isVisible()) {
      await glossaryLink.click();
      await expect(page).toHaveURL('/glossary');
    }
  });
});