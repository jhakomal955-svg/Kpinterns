const { test, expect } = require('@playwright/test');

test.describe('Admin Authentication UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should load the Admin Login page and verify form elements', async ({ page }) => {
    await page.goto('/admin/auth/login');

    // Verify page header
    const header = page.locator('h1');
    await expect(header).toContainText('Admin Login');

    // Verify inputs exist
    const emailInput = page.locator('input[name="emailOrPhone"]');
    const passwordInput = page.locator('input[name="password"]');
    const loginBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginBtn).toBeVisible();
  });

  test('should show error when submitting empty admin login form', async ({ page }) => {
    await page.goto('/admin/auth/login');
    await page.waitForTimeout(1000);

    // Click submit without entering anything
    await page.click('button[type="submit"]');

    // Should show error messages (like email or phone required)
    const emailError = page.locator('text=Email or phone number is required');
    await expect(emailError).toBeVisible();
  });
});

test.describe('Admin Login API Endpoints', () => {
  test('should reject admin login with missing credentials', async ({ request }) => {
    const response = await request.post('/api/admin/login', {
      data: {
        emailOrPhone: '',
        password: '',
        turnstileToken: 'dummy-token'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('password are required');
  });

  test('should reject login if Turnstile token is missing', async ({ request }) => {
    const response = await request.post('/api/admin/login', {
      data: {
        emailOrPhone: 'admin@example.com',
        password: 'password123'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('verification failed');
  });
});
