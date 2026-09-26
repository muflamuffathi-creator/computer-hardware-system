(async () => {
  try {
    const fetch = global.fetch || (await import('node-fetch')).default;
    const uri = 'http://localhost:5173/api/auth/register';
    const body = { firstName: 'ProxyTest', lastName: 'User', email: `proxy.${Date.now()}@example.com`, password: 'P@ssw0rd' };
    const resp = await fetch(uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await resp.text();
    console.log('STATUS', resp.status);
    console.log('BODY', text);
  } catch (e) {
    console.error('ERROR', e.message || e);
    process.exit(1);
  }
})();
