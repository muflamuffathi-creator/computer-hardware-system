import requests
base='http://localhost:8080/api'
creds={'email':'customer@example.com','password':'password123'}
login=requests.post(base+'/auth/login', json=creds, timeout=10)
print('login', login.status_code)
if login.status_code==200:
    token=login.json().get('token')
    headers={'Authorization':f'Bearer {token}'}
    resp=requests.post(base+'/chat', json={'message':'gamming chair'}, headers=headers, timeout=10)
    print('chat', resp.status_code)
    print(resp.text)
else:
    print('login failed', login.text)
