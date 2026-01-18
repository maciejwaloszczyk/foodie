import os
import requests
import time
from scrapers.base_scraper import BaseScraper

class TripAdvisorScraper(BaseScraper):
    def fetch_data(self, query='restaurants in Krakow'):
        """
        Wyszukuje miejsca pasujące do zapytania.
        TripAdvisor API search endpoint: /api/v1/location/search
        """
        api_key = os.environ.get("TRIPADVISOR_API_KEY")
        if not api_key:
            raise ValueError(
                "TRIPADVISOR_API_KEY not found in environment variables. "
                "Please add it to .env.local file."
            )

        # Endpoint wyszukiwania
        url = "https://api.content.tripadvisor.com/api/v1/location/search"
        
        # Parametry zapytania
        params = {
            "key": api_key,
            "searchQuery": query,
            "category": "restaurants",
            "language": "pl", 
            "limit": 10  # Maksymalna liczba wyników per zapytanie w API
        }
        
        headers = {"accept": "application/json"}

        try:
            self.logger.info(f"Wysyłanie zapytania do TripAdvisor API: {query}")
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # TripAdvisor zwraca listę w kluczu 'data'
            return {"results": data.get("data", [])}

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Błąd podczas wyszukiwania w TripAdvisor: {e}")
            return {"results": []}

    def get_place_details(self, location_id):
        """
        Pobiera szczegóły dla konkretnego location_id.
        TripAdvisor API details endpoint: /api/v1/location/{locationId}/details
        """
        api_key = os.environ.get("TRIPADVISOR_API_KEY")
        url = f"https://api.content.tripadvisor.com/api/v1/location/{location_id}/details"
        
        params = {
            "key": api_key,
            "language": "en",
            "currency": "PLN"
        }
        headers = {"accept": "application/json"}

        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Błąd podczas pobierania szczegółów dla ID {location_id}: {e}")
            return None

    def get_place_photos(self, location_id):
        """
        TripAdvisor często oddziela zdjęcia od szczegółów.
        Endpoint: /api/v1/location/{locationId}/photos
        """
        api_key = os.environ.get("TRIPADVISOR_API_KEY")
        url = f"https://api.content.tripadvisor.com/api/v1/location/{location_id}/photos"
        params = {"key": api_key, "limit": 1}
        headers = {"accept": "application/json"}

        try:
            response = requests.get(url, params=params, headers=headers, timeout=5)
            if response.status_code == 200:
                photos_data = response.json()
                if "data" in photos_data and len(photos_data["data"]) > 0:
                    # Pobieramy URL zdjęcia w dużej rozdzielczości (original lub large)
                    images = photos_data["data"][0].get("images", {})
                    return images.get("large", {}).get("url")
            return None
        except Exception:
            return None

    def parse_data(self, raw_data):
        if not raw_data:
            self.logger.warning("Brak danych wejściowych.")
            return []

        results = raw_data.get("results", [])
        if not results:
            self.logger.warning("Brak wyników wyszukiwania.")
            return []

        parsed_list = []
        total = len(results)
        self.logger.info(f"Znaleziono {total} miejsc. Rozpoczynam pobieranie szczegółów...")

        for i, item in enumerate(results, start=1):
            location_id = item.get("location_id")
            if not location_id:
                continue

            # 1. Pobierz szczegóły
            details = self.get_place_details(location_id)
            if not details:
                continue

            # 2. Pobierz zdjęcie (opcjonalnie - dodatkowy request zużywa limit API !)
            photo_url = self.get_place_photos(location_id)

            # 3. Parsowanie adresu
            address_obj = details.get("address_obj", {})
            address_str = item.get("address_obj", {}).get("address_string") 
            
            if not address_str and address_obj:
                street = address_obj.get("street1", "")
                city = address_obj.get("city", "")
                country = address_obj.get("country", "")
                address_str = f"{street}, {city}, {country}".strip(", ")

            # 4. Konstrukcja obiektu wyjściowego
            restaurant_dict = {
                'source_id': location_id,
                'name': details.get('name'),
                'address': address_str,
                'phone': details.get('phone'),
                'website': details.get('website'),
                'lat': details.get('latitude'),
                'lng': details.get('longitude'),
                'rating': details.get('rating'),
                'price_level': details.get('price_level'),
                'image': photo_url
            }

            parsed_list.append(restaurant_dict)
            self.logger.debug(f"[{i}/{total}] Przetworzono: {restaurant_dict.get('name')}")
            
            # Opóźnienie, aby nie przekroczyć limitów (Rate Limiting)
            time.sleep(0.5)

        self.logger.info(f"Zakończono. Przetworzono {len(parsed_list)} restauracji.")
        return parsed_list