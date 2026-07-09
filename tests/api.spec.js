const { test, expect } = require('@playwright/test');

test.describe('Contact API', () => {
  test('should reject invalid contact submission (missing fields)', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        fullName: 'Test User',
        email: 'test@example.com',
        // missing fields
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  test('should reject invalid email format', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        fullName: 'Test User',
        email: 'invalid-email',
        phone: '1234567890',
        course: 'Web Development',
        university: 'Test Uni',
        college: 'Test College',
        semester: '5th',
        message: 'Hello World',
        turnstileToken: 'dummy-token'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid email format');
  });

  test('should reject invalid phone number length', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '12345', // must be 10 digits
        course: 'Web Development',
        university: 'Test Uni',
        college: 'Test College',
        semester: '5th',
        message: 'Hello World',
        turnstileToken: 'dummy-token'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Phone must be 10 digits');
  });

  test('should create contact successfully with valid data', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9876543210',
        course: 'Web Development',
        university: 'Test Uni',
        college: 'Test College',
        semester: '5th',
        message: 'Hello World',
        turnstileToken: 'dummy-token'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Contact saved successfully');
    expect(body.data._id).toBeDefined();
  });
});
