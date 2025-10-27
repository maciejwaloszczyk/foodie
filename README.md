# Foodie

<p align="center">
  <img src="https://waloszczyk.eu/public/foodie/image.png" width="300" alt="Logo">
</p>

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Strapi](https://img.shields.io/badge/strapi-%232E7EEA.svg?style=for-the-badge&logo=strapi&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)

[![GitHub Release][releases-shield]][releases]

### 🌟 O Projekcie

**Foodie** to innowacyjna platforma do oceniania restauracji i jedzenia, która rewolucjonizuje standardowy system gwiazdek (1-5). Nasza aplikacja pozwala użytkownikom na dogłębną analizę i ocenę poszczególnych **atrybutów** dania (np. *Kebab: sos, frytki, surówka, mięso*), z których następnie wyliczana jest **ważona średnia ocena końcowa**.

Celem projektu jest dostarczenie najbardziej precyzyjnych i szczegółowych recenzji kulinarnych, ułatwiając użytkownikom podejmowanie świadomych decyzji o tym, gdzie zjeść.

#### Kluczowe Funkcjonalności:

* **Szczegółowe oceny atrybutów:** Ocena komponentów dania na skali jakościowej (np. od "Złe" do "Dobre").
* **Ważona średnia ocen:** Algorytm obliczający końcową ocenę na podstawie ocen składników.
* **Rankingi specjalistyczne:** Dynamiczne rankingi najlepszych lokali w danej kategorii (np. "Top 10 Kebabów", "Najlepsze Pizze").
* **Odkrywanie lokali:** Główny ekran z wylistowanymi, najlepiej ocenianymi restauracjami w pobliżu.
* **Interaktywna mapa:** Zakładka z mapą prezentującą lokalizacje wszystkich lokali i ich ocenami.
* **Weryfikacja krytyków:** System weryfikacji kont dla znanych krytyków kulinarnych.
* **Autoryzacja użytkowników:** Wymagana rejestracja do wystawiania ocen.

### Etapy tworzenia projektu

<details>
  <summary>
    Tydzień 1: Konfiguracja środowiska
  </summary>

  **Serwer i repozytorium**
  - [x] 1) Instalacja i konfiguracja serwera (Linux)
    - [x] a) Aktualizacja systemu i podstawowe zabezpieczenia
    - [x] b) Instalacja Node.js (zalecana LTS)
    - [x] c) Instalacja i konfiguracja bazy danych (PostgreSQL i MariaDB)
  - [x] 2) Utworzenie repozytorium Git
    - [x] a) Ustalenie struktury branchy
    - [x] b) Dodanie pliku .gitignore i podstawowego README
  - [x] 3) Konfiguracja podstawowego projektu Node.js + Strapi
    - [x] a) Inicjalizacja projektu npm/yarn
    - [x] b) Instalacja Strapi i podstawowa konfiguracja
  - [ ] 4) Test połączenia z bazą danych
  - [x] 5) Prosty landing-page (coming-soon)

  **Modelowanie danych i API**
  - [ ] 1) Ustalenie modelu danych
  - [ ] 2) Definicja relacji w Strapi / modelach Node.js
  - [x] 3) Utworzenie pierwszych endpointów API
  - [ ] 4) Testowanie endpointów w Postmanie
    - [ ] a) Testy CRUD
    - [ ] b) Testy autoryzacji i walidacji
  - [ ] 5) Dokumentacja podstawowego API (krótki OpenAPI / README)
</details>

<details>
  <summary>
    Tydzień 2: Planowanie funkcji i frontu
  </summary>

  **Architektura**
  - [x] 1) Zaplanowanie architektury aplikacji (Front + API + DB)
  - [x] 2) Stworzenie szkicu ekranu głównego (lista lokali, mapa)
  - [ ] 3) Makieta ekranu logowania i ekranu oceny jedzenia
  - [x] 4) Ustalenie sposobu logowania (JWT / OAuth / inne)

  **Integracja front-endu**
  - [x] 1) Utworzenie projektu React + Tailwinds (strukturacja katalogów)
  - [ ] 2) Połączenie z API — testowe pobranie listy lokali
  - [ ] 3) Konfiguracja routingu (Home / Map / Login)
  - [ ] 4) Przygotowanie komponentu „Karta lokalu” (zdjęcie, nazwa, ocena, skrócony opis)
  - [ ] 5) Podstawowe testy integracyjne (sprawdzenie pobierania danych i renderowania komponentów)
</details>

### 🛠 Stos Technologiczny

Projekt został zbudowany na nowoczesnym i wydajnym stosie technologicznym:

| Obszar | Technologia | Opis |
| :--- | :--- | :--- |
| **Backend API** | **Node.js/Express.js** | Szybki i skalowalny silnik dla logiki biznesowej. |
| **CMS/Headless** | **Strapi** | Elastyczny Headless CMS do zarządzania danymi (restauracje, atrybuty dań, użytkownicy). |
| **Baza Danych** | **PostgreSQL / MariaDB** | Wytrzymałe systemy zarządzania bazą danych (wybór w trakcie implementacji). |
| **Frontend** | **React** | Biblioteka do budowania dynamicznego i responsywnego interfejsu użytkownika. |
| **Stylizacja** | **TailwindCSS** | Framework front-end do szybkiego prototypowania i responsywnego designu. |


### 🤝 Twórcy projektu

**Maciej Sulima** | [@VarSwasTaken](https://github.com/VarSwasTaken) <br>
**Maciej Waloszczyk** | [@maciejwaloszczyk](https://github.com/maciejwaloszczyk) <br>
**Wiktor Wybraniec** | [@Sigmen-bot](https://github.com/Sigmen-bot) <br>
**Jan Zieliński** | [@ZieloPL](https://github.com/ZieloPL) <br>


[releases-shield]: https://img.shields.io/github/release/maciejwaloszczyk/foodie.svg?style=for-the-badge
[releases]: https://github.com/maciejwaloszczyk/foodie/releases
[license-shield]: https://img.shields.io/github/license/maciejwaloszczyk/foodie.svg?style=for-the-badge
[license]: https://github.com/maciejwaloszczyk/foodie/blob/master/LICENSE
