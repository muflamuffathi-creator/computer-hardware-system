import { test, expect } from '@playwright/test';

test('register/login -> add to cart -> checkout flow', async ({ page, request }) => {
  const email = `e2e+${Date.now()}@example.com`;
  const password = 'P@ssw0rd';

  // Ensure we have a fresh user
  await request.post('/api/dev/users/delete', { params: { email } }).catch(() => {});

  // Register
  const registerResp = await request.post('/api/auth/register', {
    data: { firstName: 'E2E', lastName: 'Tester', email, password }
  });
  expect([200,201,204]).toContain(registerResp.status());

  // Login and capture token
  const loginResp = await request.post('/api/auth/login', { data: { email, password } });
  expect(loginResp.ok()).toBeTruthy();
  const loginJson = await loginResp.json();
  const token = loginJson.token;
  expect(token).toBeTruthy();

  // Inject token into localStorage before loading the app
  await page.addInitScript(tokenValue => {
    window.localStorage.setItem('token', tokenValue);
  }, token);

  // Visit products, add first item
  await page.goto('/products');
  await page.waitForSelector('text=Add');
  // Click first Add button
  const addButtons = await page.locator('button:has-text("Add")');
  await addButtons.first().click();

  // Go to cart and assert item is present
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Remove/i }).first()).toBeVisible();

  // Proceed to checkout
  await page.click('text=Proceed To Checkout');
  await page.waitForSelector('text=Checkout Portal');
  // Fill shipping address
  await page.fill('textarea, input[type="text"]', '123 E2E St, Test City, 00000');
  await page.click('text=Confirm & Place Order');

  // Expect order confirmation
  await expect(page.locator('text=Order Confirmed!')).toBeVisible();
});
