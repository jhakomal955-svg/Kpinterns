const { test, expect } = require('@playwright/test');

test.describe('Website Core Pages UI', () => {
  test('should load the home page and verify layout', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText("India's Leading");
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('should load the courses catalog page', async ({ page }) => {
    await page.goto('/courses');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Courses/i);
  });

  test('should load the internships list page', async ({ page }) => {
    await page.goto('/internship');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Internships/i);
  });

  test('should load the verification portal page', async ({ page }) => {
    await page.goto('/verify');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Verification/i);
  });

  test('should load the about information page', async ({ page }) => {
    await page.goto('/about');
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/About/i);
  });

  test('should load the contact form page', async ({ page }) => {
    await page.goto('/contact');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Touch/i);
  });

  test('should load the admin login portal page', async ({ page }) => {
    await page.goto('/admin/auth/login');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Admin Login/i);
  });
});

test.describe('Public APIs Integration', () => {
  test('should fetch active courses catalog via API', async ({ request }) => {
    const response = await request.get('/api/course');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch active internships list via API', async ({ request }) => {
    const response = await request.get('/api/internship');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('should fetch website testimonials via API', async ({ request }) => {
    const response = await request.get('/api/testimonial');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});

test.describe('Secured APIs Access Control', () => {
  test('should block unauthorized GET requests to contact logs API', async ({ request }) => {
    const response = await request.get('/api/contact');
    // Security check: Should reject with 401 Unauthorized since no token is provided
    expect([401, 403]).toContain(response.status());
  });

  test('should block unauthorized GET requests to user records API', async ({ request }) => {
    const response = await request.get('/api/user');
    // Security check: Should reject with 401 Unauthorized since no token is provided
    expect([401, 403]).toContain(response.status());
  });

  test('should block unauthorized PUT requests to user profile API', async ({ request }) => {
    const response = await request.put('/api/user?id=unauthorized-id', {
      data: {
        fullName: 'Attacker Name'
      }
    });
    // Security check: Should reject with 401 Unauthorized since no token is provided
    expect([401, 403]).toContain(response.status());
  });
});
