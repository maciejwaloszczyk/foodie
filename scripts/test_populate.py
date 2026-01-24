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

# Test nowego formatu populate
url = f'{API}/dishes?filters[restaurant][id][$eq]=628&populate[dish_attributes][populate][attribute][fields][0]=id&populate[dish_attributes][populate][attribute][fields][1]=documentId&populate[dish_attributes][populate][attribute][fields][2]=name&pagination[limit]=3'
print(f'URL: {url}')

req = urllib.request.Request(url)
req.add_header('Authorization', f'Bearer {TOKEN}')
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read())
    for d in data['data']:
        print(f'\n{d["id"]}: {d["name"]}')
        for da in d.get('dish_attributes', []):
            print(f'  dish_attr id={da["id"]}')
            if da.get('attribute'):
                print(f'    attribute: {da["attribute"]}')
            else:
                print(f'    NO ATTRIBUTE!')
