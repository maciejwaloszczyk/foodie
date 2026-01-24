#!/usr/bin/env python3
import requests
import random
import time
import os
from pathlib import Path

# Wczytaj zmienne z .env.local
env_file = Path(__file__).parent.parent / ".env.local"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key] = value

READ_TOKEN = os.environ.get("NEXT_PUBLIC_STRAPI_KEY", "")
WRITE_TOKEN = os.environ.get("STRAPI_KEY", "")
API = os.environ.get("NEXT_PUBLIC_STRAPI_URL", "https://api-agh.waloszczyk.eu") + "/api"

print(f"API: {API}")
print(f"READ_TOKEN: {READ_TOKEN[:30]}..." if READ_TOKEN else "READ_TOKEN: BRAK!")
print(f"WRITE_TOKEN: {WRITE_TOKEN[:30]}..." if WRITE_TOKEN else "WRITE_TOKEN: BRAK!")

read_headers = {
    "Authorization": f"Bearer {READ_TOKEN}",
    "Content-Type": "application/json"
}

write_headers = {
    "Authorization": f"Bearer {WRITE_TOKEN}",
    "Content-Type": "application/json"
}

# Lista dań do losowego wyboru
DISHES = [
    ("Pizza Margherita", 28), ("Pizza Pepperoni", 32), ("Pizza Capricciosa", 35),
    ("Spaghetti Carbonara", 26), ("Spaghetti Bolognese", 24), ("Lasagne", 30),
    ("Burger Classic", 25), ("Burger Bacon", 29), ("Burger Cheese", 27),
    ("Sałatka Cezar", 22), ("Sałatka Grecka", 20), ("Sałatka z kurczakiem", 24),
    ("Zupa pomidorowa", 14), ("Zupa ogórkowa", 12), ("Krem z brokułów", 16),
    ("Kurczak grillowany", 28), ("Kurczak w sosie", 30), ("Nuggetsy", 22),
    ("Ryba smażona", 32), ("Łosoś z grilla", 38), ("Dorsz w panierce", 34),
    ("Steak wołowy", 45), ("Kotlet schabowy", 26), ("Golonka", 35),
    ("Pierogi z mięsem", 22), ("Pierogi z kapustą", 20), ("Kopytka", 18),
    ("Risotto", 28), ("Pad Thai", 30), ("Kurczak Tikka", 32),
    ("Hummus z pitą", 18), ("Falafel", 22), ("Kebab", 25),
    ("Sushi mix", 45), ("Ramen", 32), ("Dim sum", 28),
    ("Tacos", 24), ("Burrito", 28), ("Quesadilla", 22),
    ("Tiramisu", 18), ("Brownie", 16), ("Sernik", 15),
]

# Komentarze do opinii
COMMENTS = [
    "Bardzo smaczne, polecam!",
    "Danie świeże i dobrze przyprawione.",
    "Porcja duża, smak wyśmienity.",
    "Trochę za słone, ale ogólnie ok.",
    "Rewelacja! Na pewno wrócę.",
    "Średnio, mogło być lepiej.",
    "Świetna jakość za tę cenę.",
    "Jedzenie przyszło ciepłe i smaczne.",
    "Najlepsze w okolicy!",
    "Smak jak w domu, bardzo domowe.",
    "Idealne na lunch.",
    "Polecam wszystkim!",
    "Danie dnia było przepyszne.",
    "Szybka obsługa i smaczne jedzenie.",
    "Warto spróbować.",
]

# Atrybuty (documentId)
ATTRIBUTES = [
    "wbug1fvk58inxrgb5oey8g0s",  # mieso
    "a7ddth3xmtglnwophc1rgx3u",  # sos
    "m5y5gnru57xtzhudav9r9zu5",  # Smak
    "nqc76dtm08nyw79pkxz21ngz",  # Porcja
    "l655ged5lhxk8mt0nuc4qk0e",  # Swiezosc
]

def create_dish(restaurant_id, name, price):
    """Tworzy danie dla restauracji"""
    data = {"data": {"name": name, "price": price, "restaurant": restaurant_id}}
    try:
        r = requests.post(f"{API}/dishes", headers=write_headers, json=data, timeout=10)
        if r.status_code == 200 or r.status_code == 201:
            return r.json()["data"]["documentId"]
        else:
            print(f"  Błąd dania: {r.status_code} - {r.text[:100]}")
            return None
    except Exception as e:
        print(f"  Błąd: {e}")
        return None

def create_review(dish_id, rating, comment):
    """Tworzy opinię dla dania"""
    data = {"data": {"rating": rating, "comment": comment, "dish": dish_id}}
    try:
        r = requests.post(f"{API}/reviews", headers=write_headers, json=data, timeout=10)
        if r.status_code == 200 or r.status_code == 201:
            return r.json()["data"]["documentId"]
        else:
            print(f"  Błąd opinii: {r.status_code}")
            return None
    except Exception as e:
        print(f"  Błąd: {e}")
        return None

def create_dish_attribute(dish_id, attr_id):
    """Tworzy powiązanie dania z atrybutem"""
    data = {"data": {"dish": dish_id, "attribute": attr_id}}
    try:
        r = requests.post(f"{API}/dish-attributes", headers=write_headers, json=data, timeout=10)
        return r.status_code == 200 or r.status_code == 201
    except:
        return False

def create_review_detail(review_id, attr_id, rating):
    """Tworzy szczegół oceny atrybutu"""
    data = {"data": {"review": review_id, "attribute": attr_id, "rating": rating}}
    try:
        r = requests.post(f"{API}/review-details", headers=write_headers, json=data, timeout=10)
        return r.status_code == 200 or r.status_code == 201
    except:
        return False

# Pobierz listę restauracji
print("\nPobieram restauracje...")
r = requests.get(f"{API}/restaurants?pagination[limit]=100", headers=read_headers)
if r.status_code != 200:
    print(f"Błąd pobierania restauracji: {r.status_code} - {r.text[:200]}")
    exit(1)
restaurants = r.json()["data"]
print(f"Znaleziono {len(restaurants)} restauracji\n")

# Iteruj przez restauracje
for rest in restaurants:
    rest_id = rest["documentId"]
    rest_name = rest["name"]
    print(f"=== {rest_name} ===")
    
    # Wybierz 3 losowe dania
    selected_dishes = random.sample(DISHES, 3)
    dish_ids = []
    
    for dish_name, dish_price in selected_dishes:
        dish_id = create_dish(rest_id, dish_name, dish_price)
        if dish_id:
            dish_ids.append(dish_id)
            print(f"  + Danie: {dish_name}")
            
            # Dodaj 1-2 atrybuty do dania
            for attr in random.sample(ATTRIBUTES, random.randint(1, 2)):
                create_dish_attribute(dish_id, attr)
        time.sleep(0.3)  # Małe opóźnienie
    
    # Dodaj 2-4 opinie dla różnych dań
    num_reviews = random.randint(2, 4)
    for i in range(num_reviews):
        if dish_ids:
            dish_id = random.choice(dish_ids)
            rating = round(random.uniform(3.0, 5.0), 1)
            comment = random.choice(COMMENTS)
            review_id = create_review(dish_id, rating, comment)
            if review_id:
                print(f"  + Opinia: {rating}★")
                # Dodaj szczegół oceny atrybutu
                attr = random.choice(ATTRIBUTES)
                attr_rating = random.randint(3, 5)
                create_review_detail(review_id, attr, attr_rating)
            time.sleep(0.3)
    
    print()

print("Gotowe!")
