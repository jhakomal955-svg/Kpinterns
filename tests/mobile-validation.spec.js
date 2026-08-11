const { test, expect } = require('@playwright/test');

async function dismissModalIfPresent(page) {
  try {
    const exploreBtn = page.locator('text=Explore Website Features');
    if (await exploreBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await exploreBtn.click().catch(() => {});
    }
  } catch (e) {}
}

test.describe('Student Registration Indian Mobile Validation', () => {
  test('should validate and normalize Indian phone numbers', async ({ page }) => {
    // Navigate to student register page
    await page.goto('/register');
    await dismissModalIfPresent(page);
    
    // Fill in Personal Info step 1
    await page.fill('input[name="fullName"]', 'Test Student');
    await page.selectOption('select[name="gender"]', 'Male');
    
    // Use dynamic email to prevent duplicate registration check blocks
    const email = `teststudent_${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    
    await dismissModalIfPresent(page);

    // Intercept OTP send response to capture leaked dev OTP
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/otp/send') && res.status() === 200),
      page.click('button:has-text("Send OTP")', { force: true })
    ]);
    
    const resBody = await response.json();
    const otp = resBody.otp;
    expect(otp).toBeDefined();
    
    // Fill in OTP and verify
    await page.fill('input[placeholder="Enter 6-digit OTP"]', otp);
    await dismissModalIfPresent(page);
    await page.click('button:has-text("Verify Code")', { force: true });
    
    // Verify success label
    await expect(page.locator('text=Email verified successfully')).toBeVisible();
    
    await page.fill('input[name="parentName"]', 'Test Parent');
    
    // Test 1: Invalid mobile number (doesn't start with 6-9)
    await page.fill('input[name="phone"]', '1234567890');
    await page.click('button:has-text("Next")', { force: true });
    await expect(page.locator('text=Please enter a valid 10-digit Indian mobile number')).toBeVisible();
    
    // Test 2: Invalid length
    await page.fill('input[name="phone"]', '98765432');
    await page.click('button:has-text("Next")', { force: true });
    await expect(page.locator('text=Please enter a valid 10-digit Indian mobile number')).toBeVisible();
    
    // Test 3: Valid Indian mobile with +91 prefix and space
    await page.fill('input[name="phone"]', '+91 98765 43210');
    // Error message should disappear when valid number is entered and we attempt to proceed
    await page.click('button:has-text("Next")', { force: true });
    await expect(page.locator('text=Please enter a valid 10-digit Indian mobile number')).not.toBeVisible();
    
    // Check if we successfully proceeded to step 2 (Academic Information heading is visible)
    await expect(page.locator('h2:has-text("Academic Information")')).toBeVisible();
  });
});

test.describe('Admin Registration Indian Mobile Validation', () => {
  test('should validate and normalize admin mobile numbers', async ({ page }) => {
    // Navigate to admin register page
    await page.goto('/admin/auth/register');
    
    // Step 1: Verification
    const email = `testadmin_${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    
    // Intercept OTP send response
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/otp/send') && res.status() === 200),
      page.click('button:has-text("Send OTP")', { force: true })
    ]);
    
    const resBody = await response.json();
    const otp = resBody.otp;
    expect(otp).toBeDefined();
    
    // Fill in OTP and verify
    await page.fill('input[placeholder="Enter 6-digit OTP"]', otp);
    await page.click('button:has-text("Verify")', { force: true });
    
    // Verify success label
    await expect(page.locator('text=Email verified successfully')).toBeVisible();
    
    // Click Continue to proceed to Step 2
    await page.click('button:has-text("Continue")', { force: true });
    
    // Step 2: Admin Details
    await page.fill('input[name="name"]', 'Test Admin');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Test 1: Invalid mobile number
    await page.fill('input[name="mobile"]', '1234567890');
    await page.click('button:has-text("Continue")', { force: true });
    await expect(page.locator('text=Please enter a valid 10-digit Indian mobile number')).toBeVisible();
    
    // Test 2: Valid Indian mobile with leading 0
    await page.fill('input[name="mobile"]', '09876543210');
    await page.click('button:has-text("Continue")', { force: true });
    await expect(page.locator('text=Please enter a valid 10-digit Indian mobile number')).not.toBeVisible();
    
    // Check if we successfully proceeded to step 3 (Bank Account heading is visible)
    await expect(page.locator('h2:has-text("Bank Account")')).toBeVisible();
  });
});
