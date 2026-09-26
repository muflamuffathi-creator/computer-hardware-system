const fs = require('fs');
(async () => {
  try {
    const base = process.env.BACKEND_BASE_URL || 'http://localhost:8082';
    const email = `e2e.node${Date.now()}@example.com`;
    const password = 'P@ssw0rd';

    const regResp = await fetch(`${base}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'E2E', lastName: 'Node', email, password })
    });
    if (![200,201,204].includes(regResp.status)) {
      console.error('Register failed', regResp.status);
      const t = await regResp.text();
      console.error(t);
      process.exit(2);
    }

    const loginResp = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!loginResp.ok) {
      console.error('Login failed', loginResp.status);
      console.error(await loginResp.text());
      process.exit(3);
    }
    const login = await loginResp.json();
    const token = login.token;

    const chatResp = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: 'Which CPU cooler is best for an AM5 gaming CPU?' })
    });
    const chatJson = await (chatResp.headers.get('content-type') || '').includes('application/json') ? chatResp.json() : { text: await chatResp.text() };

    const out = { email, chatStatus: chatResp.status, chat: chatJson };
    fs.writeFileSync('chat_response.json', JSON.stringify(out, null, 2), 'utf8');
    console.log('WROTE frontend/chat_response.json');
  } catch (e) {
    console.error('ERROR', e);
    process.exit(4);
  }
})();
