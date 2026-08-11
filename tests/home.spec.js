const { test, expect } = require('@playwright/test');

test.describe('KpInterns Homepage', () => {
  test('should load the homepage and check title/links', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Verify key headings exist
    const heading = page.locator('h1');
    await expect(heading).toContainText("India's Leading");

    // Verify Navbar links are visible
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();

    const homeLink = navbar.locator('text=Home').first();
    const internshipLink = navbar.locator('text=Internship').first();
    const coursesLink = navbar.locator('text=Courses').first();

    await expect(homeLink).toBeVisible();
    await expect(internshipLink).toBeVisible();
    await expect(coursesLink).toBeVisible();
  });

  test('should navigate to Courses page', async ({ page }) => {
    await page.goto('/');
    const coursesLink = page.locator('nav').first().locator('text=Courses').first();
    await coursesLink.click({ force: true });
    await expect(page).toHaveURL(/\/courses/);
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.goto('/');
    const contactLink = page.locator('nav').first().locator('text=Contact').first();
    await contactLink.click({ force: true });
    await expect(page).toHaveURL(/\/contact/);
  });

  test('should submit the contact form successfully', async ({ page }) => {
    // Navigate directly to contact page
    await page.goto('/contact');
    
    // Wait for hydration to complete to prevent race conditions on state
    await page.waitForTimeout(1000);

    // Fill form fields
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'test.user@example.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="course"]', 'BCA');
    await page.fill('input[name="university"]', 'Patliputra University');
    await page.fill('input[name="college"]', 'AN College');
    await page.fill('input[name="semester"]', 'Semester 3');
    await page.fill('textarea[name="message"]', 'This is a test message to ensure the contact form works properly.');

    // Dismiss social banner modal if visible
    const exploreBtn = page.locator('text=Explore Website Features');
    if (await exploreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exploreBtn.click().catch(() => {});
    }

    // Click submit button
    await page.click('button[type="submit"]', { force: true });

    // Verify success message appears
    const successMsg = page.locator('text=Thank you! We\'ll get back to you soon.');
    await expect(successMsg).toBeVisible({ timeout: 30000 });
  });

  test('should load the About page and display content', async ({ page }) => {
    await page.goto('/about');
    const heading = page.locator('h2').first();
    await expect(heading).toContainText(/About/i);
  });

  test('should load the Internship page and display content', async ({ page }) => {
    await page.goto('/internship');
    const heading = page.locator('h1').first();
    // Verify we have some main heading or text
    await expect(heading).toBeVisible();
  });

  test('should load the Verify page and display content', async ({ page }) => {
    await page.goto('/verify');
    // Verify page has a main heading or verification card
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });
});
