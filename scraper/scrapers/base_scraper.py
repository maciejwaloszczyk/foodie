from abc import ABC, abstractmethod
from dotenv import load_dotenv
import json
import logging
from datetime import datetime

class BaseScraper(ABC):
    def __init__(self):
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        )
        load_dotenv("../../.env")
        self.logger = logging.getLogger(self.__class__.__name__)
        self.data = []

    @abstractmethod
    def fetch_data(self, query: str):
        """Pobiera dane z wybranego zrodla"""
        pass

    @abstractmethod
    def parse_data(self, raw_data):
        """Przetwarza dane"""
        pass

    def validate_item(self, item: dict):
        """
        Walidacja pojedynczego wpisu:
        - sprawdza, czy istnieją pola obowiązkowe (nazwa i adres)
        - opcjonalne pola
        """
        required = ["name", "address"]
        optional = ["phone", "website", "image"]

        # Sprawdź wymagane pola
        has_required = all(field in item and bool(item[field]) for field in required)

        # Wypisz ostrzezenie, jesli opcjonalne pola sa puste
        if has_required:
            for opt in optional:
                if opt not in item or not item[opt]:
                    self.logger.debug(f"Puste pole opcjonalne: {opt}")
            return True
        else:
            self.logger.warning(f"Nieprawidłowy wpis: {item}")
            return False

    def save_to_json(self, filename=None):
        """Zapisuje dane do pliku JSON."""
        if not filename:
            date_str = datetime.now().strftime("%Y-%m-%d_%H-%M")
            filename = f"restaurants_{date_str}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=4)
        self.logger.info(f"Saved {len(self.data)} records to {filename}")

    def run(self, query: str):
        """Uniwersalny workflow"""
        raw = self.fetch_data(query)
        parsed = self.parse_data(raw)
        self.data = [x for x in parsed if self.validate_item(x)]
        self.save_to_json()
