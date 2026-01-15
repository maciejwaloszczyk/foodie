import os
import requests
import time

from scrapers.base_scraper import BaseScraper


class GooglePlaces(BaseScraper):
    def fetch_data(self, query='restaurants+in+Krakow'):
        api = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
        api_key = os.environ.get("GOOGLE_PLACE_API_KEY")
        
        if not api_key:
            raise ValueError(
                "GOOGLE_PLACE_API_KEY not found in environment variables. "
                "Please add it to .env.local file in the project root."
            )
        
        params = {"query": query, "key": api_key}

        all_results = []

        while True:
            try:
                response = requests.get(api, params=params, timeout=5)
                response.raise_for_status()
                data = response.json()
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

            params = {"pagetoken": next_page_token, "key": os.environ["GOOGLE_PLACE_API_KEY"]}

        return {"results": all_results}

    def parse_details_data(self, place_id):
        api = 'https://maps.googleapis.com/maps/api/place/details/json'
        params = {"place_id": place_id, "key": os.environ["GOOGLE_PLACE_API_KEY"]}

        try:
            response = requests.get(api, params=params, timeout=5)
            response.raise_for_status()
            restaurant = response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Blad podczas pobierania szczegolow miejsca {place_id}: {e}")
            return None

        if 'result' not in restaurant:
            self.logger.warning(f"Brak danych szczegolowych dla place_id={place_id}")
            return None

        result = restaurant['result']

        restaurant_dict = {
            'place_id': result.get('place_id'),
            'name': result.get('name'),
            'address': result.get('formatted_address'),
            'phone': result.get('international_phone_number'),
            'lat': result.get('geometry', {}).get('location', {}).get('lat'),
            'lng': result.get('geometry', {}).get('location', {}).get('lng'),
            'photo': result.get('photos', [{}])[0].get('photo_reference'),
            'website': result.get('website')
        }

        return restaurant_dict

    def parse_data(self, raw_data):
        if not raw_data:
            self.logger.warning("Brak danych wejściowych do parsowania.")
            return []

        results = raw_data.get("results", [])
        if not results:
            self.logger.warning("Brak wyników w odpowiedzi API.")
            return []

        data = []
        total = len(results)
        self.logger.info(f"Rozpoczynam parsowanie {total} miejsc...")

        for i, result in enumerate(results, start=1):
            place_id = result.get("place_id")
            if not place_id:
                self.logger.debug(f"Pominięto wynik bez place_id: {result}")
                continue

            # pobieranie szczegolow dla pojedynczej restauracji
            details = self.parse_details_data(place_id)
            if details:
                data.append(details)
                self.logger.debug(f"[{i}/{total}] Dodano: {details.get('name')}")
            else:
                self.logger.warning(f"[{i}/{total}] Brak szczegółów dla place_id={place_id}")

            # delay zeby nie dostac bana
            time.sleep(0.5)

        self.logger.info(f"Parsowanie zakończone. Pobrano {len(data)} poprawnych rekordów.")
        return data





