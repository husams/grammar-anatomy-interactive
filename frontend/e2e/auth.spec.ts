import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('User can register, login, and request password reset (real backend)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    const registerLink = page.locator('a[href="/register"].text-blue-600');
    await expect(registerLink).toBeVisible();
    await expect(page.getByText(/forgot password/i)).toBeVisible();

    // Go to registration page
    await registerLink.click();
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();

    // Register a new user
    const email = `testuser${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.click('button:has-text("Register")');

    // After successful registration the user should be redirected to the dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/dashboard - coming soon/i)).toBeVisible();

    // Request password reset
    await page.goto('/reset-password');
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("Send Reset Link")');
    await expect(page.getByText(/you will receive a password reset link/i)).toBeVisible();
  });

  test('User sees an error when trying to register with an existing email', async ({ page }) => {
    // First, register a user.
    await page.goto('/register');
    const email = `testuser${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.fill('input[name="confirmPassword"]', 'TestPass123!');
    await page.click('button:has-text("Register")');
    await expect(page).toHaveURL('/dashboard');

    // Logout the user so we can access the registration page again
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');

    // Now, try to register again with the same email.
    await page.goto('/register');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="name"]', 'Another User');
    await page.fill('input[name="password"]', 'AnotherPassword123!');
    await page.fill('input[name="confirmPassword"]', 'AnotherPassword123!');
    await page.click('button:has-text("Register")');

    // Check for the error message.
    await expect(page.getByText(/email already registered/i)).toBeVisible();
  });

  test('User sees an error when trying to register with an invalid password', async ({ page }) => {
    await page.goto('/register');
    const email = `testuser${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="password"]', 'short');
    await page.fill('input[name="confirmPassword"]', 'short');
    await page.click('button:has-text("Register")');

    // Check for the error message.
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });
});