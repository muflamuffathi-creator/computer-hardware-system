import json
import urllib.request

for action, payload in [
    ('register', {'firstName': 'Test', 'lastName': 'User', 'email': 'test.new.user@gmail.com', 'password': 'Password123'}),
    ('login', {'email': 'test.new.user@gmail.com', 'password': 'Password123'})
]:
    url = f'http://localhost:8080/api/auth/{action}'
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            print('ACTION', action)
            print('STATUS', resp.status)
            print(resp.read().decode('utf-8'))
    except Exception as e:
        print('ACTION', action)
        print('ERROR', type(e).__name__, str(e))
