(async () => {
  try {
    const fetch = global.fetch || (await import('node-fetch')).default;
    const email = `proxy.login.${Date.now()}@example.com`;
    const registerResp = await fetch('http://localhost:5173/api/auth/register', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({firstName:'Proxy', lastName:'Login', email, password: 'P@ssw0rd'})
    });
    console.log('REGISTER STATUS', registerResp.status);
    console.log(await registerResp.text());

    const loginResp = await fetch('http://localhost:5173/api/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password:'P@ssw0rd'})
    });
    console.log('LOGIN STATUS', loginResp.status);
    console.log(await loginResp.text());
  } catch(e) { console.error('ERROR', e); process.exit(1); }
})();
