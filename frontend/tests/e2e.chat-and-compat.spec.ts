import { test, expect } from '@playwright/test';

test('AI chat -> history and compatibility check', async ({ page, request }) => {
  const backendBaseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:8082';
  const email = `e2e+chat${Date.now()}@example.com`;
  const password = 'P@ssw0rd';

  // Clean up
  await request.post(`${backendBaseUrl}/api/dev/users/delete`, { params: { email } }).catch(() => {});

  // Register & login
  await request.post(`${backendBaseUrl}/api/auth/register`, { data: { firstName: 'E2E', lastName: 'Chat', email, password } });
  const loginResp = await request.post(`${backendBaseUrl}/api/auth/login`, { data: { email, password } });
  const loginJson = await loginResp.json();
  const token = loginJson.token;

  // Send chat message via API
  const chatResp = await request.post(`${backendBaseUrl}/api/chat`, {
    data: { message: 'Hello, what GPU do you recommend for 1440p gaming?' },
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(chatResp.ok()).toBeTruthy();
  const chatJson = await chatResp.json();
  expect(chatJson.reply || chatJson.message || chatJson).toBeTruthy();

  // Send a CPU cooler query to validate cooler-specific AI handling
  const coolerResp = await request.post(`${backendBaseUrl}/api/chat`, {
    data: { message: 'Which CPU cooler is best for an AM5 gaming CPU?' },
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(coolerResp.ok()).toBeTruthy();
  const coolerJson = await coolerResp.json();
  const coolerReply = coolerJson.reply || coolerJson.message || coolerJson;
  expect(typeof coolerReply).toBe('string');
  expect(coolerReply.toLowerCase()).toContain('cooler');

  // Get chat history
  const historyResp = await request.get(`${backendBaseUrl}/api/chat/history`, { headers: { Authorization: `Bearer ${token}` } });
  expect(historyResp.ok()).toBeTruthy();
  const history = await historyResp.json();
  expect(Array.isArray(history)).toBeTruthy();

  // Compatibility check (use existing product ids 1 and 5 as example)
  const compatResp = await request.post(`${backendBaseUrl}/api/compatibility-check`, {
    data: { cpuId: 1, motherboardId: 5 }
  });
  expect(compatResp.ok()).toBeTruthy();
  const compatJson = await compatResp.json();
  expect(compatJson).toBeTruthy();
});
