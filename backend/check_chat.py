import time
import requests
import sys

base='http://localhost:8080/api'
login_url='http://localhost:8080/api/auth/login'
print('Waiting for backend (polling login)...')
for i in range(30):
    try:
        r=requests.post(login_url, json={'email':'__health_check__','password':'x'}, timeout=2)
        # 404 or 401 indicates the server responded; treat as ready to attempt real login
        if r.status_code in (200, 401, 400, 404):
            print('Backend responding (status', r.status_code, ')')
            break
    except Exception:
        pass
    time.sleep(2)
else:
    print('Backend did not become ready in time')
    sys.exit(2)

creds={'email':'customer@example.com','password':'password123'}
try:
    login=requests.post(base+'/auth/login', json=creds, timeout=10)
    print('login', login.status_code)
    if login.status_code==200:
        token=login.json().get('token')
        headers={'Authorization':f'Bearer {token}'}
        resp=requests.post(base+'/chat', json={'message':'keyboard'}, headers=headers, timeout=10)
        print('chat', resp.status_code)
        print(resp.text)
    else:
        print('login failed', login.text)
except Exception as e:
    print('error', e)
    sys.exit(1)
