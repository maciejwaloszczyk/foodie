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

TOKEN = os.environ['NEXT_PUBLIC_STRAPI_KEY']
API = os.environ['NEXT_PUBLIC_STRAPI_URL'] + '/api'

# Pobierz dania
req = urllib.request.Request(f'{API}/dishes?pagination[limit]=10&populate=dish_attributes.attribute&sort=createdAt:desc')
req.add_header('Authorization', f'Bearer {TOKEN}')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
    for d in data['data']:
        attrs = d.get('dish_attributes', [])
        print(f'{d["id"]}: {d["name"]} - {len(attrs)} atrybutow')
        for a in attrs:
            if a.get('attribute'):
                print(f'    - {a["attribute"]["name"]} (docId: {a["attribute"]["documentId"]})')
