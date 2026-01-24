#!/usr/bin/env python3
import urllib.request
import json
import os
from pathlib import Path

env_file = Path(__file__).parent.parent / '.env.local'
with open(env_file) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            os.environ[key] = value

TOKEN = os.environ['STRAPI_KEY']  # Write token
API = os.environ['NEXT_PUBLIC_STRAPI_URL'] + '/api'

# Test tworzenia opinii
payload = {'data': {'dish': 'g4md7ztiw3u4nfa185rktnt9', 'rating': 4.5, 'comment': 'Test opinia z API'}}

req = urllib.request.Request(f'{API}/reviews', data=json.dumps(payload).encode('utf-8'), method='POST')
req.add_header('Authorization', f'Bearer {TOKEN}')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        print('SUCCESS:', json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print(f'ERROR: {e.code}')
    print(e.read().decode('utf-8'))
