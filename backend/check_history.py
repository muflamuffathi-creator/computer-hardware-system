import requests
import time

base='http://localhost:8080/api'
login_url=base+'/auth/login'
print('Waiting for backend...')
for i in range(20):
    try:
        r=requests.post(login_url, json={'email':'__health_check__','password':'x'}, timeout=2)
        if r.status_code in (200,401,400,404):
            print('Backend responding', r.status_code)
            break
    except Exception:
        pass
    time.sleep(1)

creds={'email':'customer@example.com','password':'password123'}
login=requests.post(login_url, json=creds, timeout=10)
print('login', login.status_code)
if login.status_code==200:
    token=login.json().get('token')
    headers={'Authorization':f'Bearer {token}'}
    resp=requests.get(base+'/chat/history', headers=headers, timeout=10)
    print('history', resp.status_code)
    try:
        print(resp.json())
    except Exception:
        print(resp.text)
else:
    print('login failed', login.text)
