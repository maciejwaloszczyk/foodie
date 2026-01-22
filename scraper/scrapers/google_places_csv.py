import os
import requests
import time
import pandas as pd
from datetime import datetime

from scrapers.base_scraper import BaseScraper


class GooglePlacesCsv(BaseScraper):
    # Mapowanie typów z Google Places na Kategorie Strapi
    CATEGORY_MAPPING = {
        # Azjatycka (ID 5)
        'chinese_restaurant': 5,
        'asian_restaurant': 5,
        'thai_restaurant': 5,

        # Japońska (ID 24)
        'japanese_restaurant': 24,
        'sushi_restaurant': 24,

        # Wietnamska (ID 26)
        'vietnamese_restaurant': 26,

        # Włoska (ID 3)
        'italian_restaurant': 3,
        'pizza_restaurant': 3,

        # Amerykańska (ID 9) i Fast Food (ID 1)
        'hamburger_restaurant': 9,
        'american_restaurant': 9,
        'fast_food_restaurant': 1,
        'meal_takeaway': 1,

        # Kawiarnia (ID 15)
        'cafe': 15,
        'coffee_shop': 15,
        'bakery': 15,

        # Meksykańska (ID 11)
        'mexican_restaurant': 11,

        # Indyjska (ID 13)
        'indian_restaurant': 13,

        # Turecka (ID 19)
        'turkish_restaurant': 19,
        'kebab_shop': 19,

        # Zdrowa żywność (ID 21) / Wegańska (ID 17)
        'vegan_restaurant': 17,
        'vegetarian_restaurant': 17,
        'health_food_restaurant': 21,

        # Polska (ID 7) i Europejska (ID 31)
        'polish_restaurant': 7,
        'french_restaurant': 31,
        'spanish_restaurant': 31,
        'european_restaurant': 31,
    }

    # "Inne" (ID 33)
    DEFAULT_CATEGORY_ID = 33

    def fetch_data(self, query="restauracje+w+warszawie"):
        api = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
        api_key = os.environ.get("GOOGLE_PLACE_API_KEY")
        self.request = query
        if not api_key:
            raise ValueError(
                "GOOGLE_PLACE_API_KEY not found in environment variables."
            )
        print("Prosze o to twoje query = ", query)
        params = {"query": query, "key": api_key}
        all_results = []

        while True:
            try:
                response = requests.get(api, params=params, timeout=5)
                response.raise_for_status()
                data = response.json()
                print(data)
            except requests.exceptions.RequestException as e:
                self.logger.error(f"Blad podczas zapytania: {e}")
                break

            if "results" in data:
                all_results.extend(data["results"])

            next_page_token = data.get("next_page_token")
            if not next_page_token:
                break

            self.logger.debug("Oczekiwanie na aktywacje next_page_token...")
            time.sleep(3)
            params = {"pagetoken": next_page_token, "key": api_key}

        return {"results": all_results}

    def get_strapi_category_id(self, google_types):
        """Funkcja do znajdowania ID kategorii na podstawie listy typów Google."""
        if not google_types:
            return self.DEFAULT_CATEGORY_ID

        for g_type in google_types:
            if g_type in self.CATEGORY_MAPPING:
                return self.CATEGORY_MAPPING[g_type]

        return self.DEFAULT_CATEGORY_ID

    def parse_details_data(self, place_id):
        api = 'https://maps.googleapis.com/maps/api/place/details/json'
        api_key = os.environ["GOOGLE_PLACE_API_KEY"]
        params = {"place_id": place_id, "key": api_key}

        try:
            response = requests.get(api, params=params, timeout=5)
            response.raise_for_status()
            restaurant = response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Blad: {e}")
            return None

        if 'result' not in restaurant:
            return None

        result = restaurant['result']

        # Pobieranie opisu
        description = result.get('editorial_summary', {}).get('overview')

        # Pobieranie kategorii
        google_types = result.get('types', [])
        category_id = self.get_strapi_category_id(google_types)

        # Pobierania miasta
        city = None
        address_components = result.get('address_components', [])

        for component in address_components:
            types = component.get('types', [])

            # Dla większych miast
            if 'locality' in types:
                city = component.get('long_name')
                break

        # Dla małych miast
        if not city:
            for component in address_components:
                if 'administrative_area_level_3' in component.get('types', []):
                    city = component.get('long_name')
                    break

        restaurant_dict = {
            'name': result.get('name'),
            'address': result.get('formatted_address'),
            'city': city,
            'latitude': result.get('geometry', {}).get('location', {}).get('lat'),
            'longitude': result.get('geometry', {}).get('location', {}).get('lng'),
            'description': description,
            'category': category_id,
        }
        return restaurant_dict

    def save_to_csv(self, data, query):
        """Zapisuje listę słowników do pliku CSV przy użyciu Pandas."""
        if not data:
            self.logger.warning("Brak danych do zapisu CSV.")
            return

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{query}_import_{timestamp}.csv"

        try:
            df = pd.DataFrame(data)
            df.to_csv(filename, index=False, encoding='utf-8')
            self.logger.info(f"Pomyślnie zapisano dane do pliku: {filename}")
        except Exception as e:
            self.logger.error(f"Błąd zapisu do CSV: {e}")

    def parse_data(self, raw_data):
        if not raw_data:
            return []

        results = raw_data.get("results", [])
        if not results:
            return []

        data = []
        total = len(results)
        self.logger.info(f"Rozpoczynam parsowanie {total} miejsc...")

        for i, result in enumerate(results, start=1):
            place_id = result.get("place_id")
            if not place_id:
                continue

            details = self.parse_details_data(place_id)
            if details:
                data.append(details)
                self.logger.debug(f"[{i}/{total}] {details['name']} -> Kat ID: {details['category']}")

            time.sleep(0.5)

        self.save_to_csv(data, self.request)

        return data