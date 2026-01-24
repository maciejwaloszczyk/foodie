# 🗺️ Integracja Mapy z API Strapi

## 📋 Podsumowanie

Mapa restauracji jest teraz podłączona do API Strapi. Dane restauracji są pobierane dynamicznie z backendu zamiast korzystać z danych testowych.

## 🔧 Zmiany

### 1. **Hook `useFetchRestaurants`** ✅
**Plik**: [lib/useFetchRestaurants.ts](../lib/useFetchRestaurants.ts)

- Pobiera restauracje z API Strapi endpoint: `GET /api/restaurants?populate=*`
- Transformuje dane z formatu Strapi do formatu aplikacji
- Obsługuje loading i error states
- Automatycznie filtruje restauracje bez nazwy

**Używanie**:
```typescript
const { data: restaurants, loading, error } = useFetchRestaurants();
```

### 2. **Zaktualizowana strona mapy** ✅
**Plik**: [app/map/page.tsx](../app/map/page.tsx)

- Używa `useFetchRestaurants()` hook do pobierania danych
- Wyświetla loading state podczas ładowania
- Wyświetla error state z informacją o konfiguracji
- Dynamicznie aktualizuje statystyki (liczba restauracji, średnia ocena itp.)
- Lista restauracji jest filtrowana i dynamiczna

### 3. **Ulepszona obsługa mapy** ✅
**Plik**: [components/Restaurant/RestaurantMap.tsx](../components/Restaurant/RestaurantMap.tsx)

- Dodana obsługa sytuacji, gdy brak restauracji do wyświetlenia
- Lepsze komunikaty dla użytkownika

## 🚀 Jak to działa

```
Strapi API
    ↓
useFetchRestaurants() hook
    ↓
app/map/page.tsx (pobiera dane + obsługuje stany)
    ↓
RestaurantMap (wyświetla markery)
    ↓
Użytkownik
```

## 🔌 Mapowanie pól Strapi

Dane z Strapi są automatycznie konwertowane:

```typescript
// Strapi format
{
  attributes: {
    name: "Bella Italia",
    cuisine: "Włoska",
    rating: 4.8,
    image: { data: { attributes: { url: "..." } } },
    latitude: 51.7592,
    longitude: 19.4560,
    // ...
  }
}

// ↓ Transformacja

// Format aplikacji
{
  id: 1,
  name: "Bella Italia",
  cuisine: "Włoska",
  rating: 4.8,
  image: "...",
  location: {
    lat: 51.7592,
    lng: 19.4560
  },
  // ...
}
```

## 📝 Wymagane pola w Strapi

Upewnij się, że model `Restaurant` w Strapi ma następujące pola:

- `name` (String) - nazwa restauracji
- `cuisine` (String) - typ kuchni
- `rating` (Number) - ocena
- `reviewCount` (Number) - liczba opinii
- `priceRange` (String) - zakres cen
- `deliveryTime` (String) - czas dostawy
- `distance` (String) - dystans od użytkownika
- `isPromoted` (Boolean) - czy promowana
- `description` (Text) - opis
- `address` (String) - adres
- `latitude` (Number) - szerokość geograficzna
- `longitude` (Number) - długość geograficzna
- `image` (Media) - zdjęcie restauracji

## 🔒 Permissje w Strapi

W Strapi Settings → Users & Permissions → Roles → Public, zaznacz:
- ✅ `api::restaurant.restaurant.find`
- ✅ `api::restaurant.restaurant.findOne`

## 🐛 Debugging

### Sprawdzenie czy API działa
```bash
curl http://localhost:1337/api/restaurants?populate=*
```

### DevTools konsola pokaże:
- `Loading...` - warunek loading
- Błędy sieci - sprawdź czy Strapi jest uruchomione
- Error fetching restaurants: ... - szczegóły błędu API

### Przydatne pliki
- Skrypt Strapi: [dev/strapi/](../dev/strapi/)
- Environment: Sprawdź `NEXT_PUBLIC_STRAPI_URL` w `.env.local`

## ✨ Dodatkowe funkcjonalności

### Dodanie filtrowania restauracji (opcjonalnie)

W `app/map/page.tsx` można dodać:

```typescript
const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

const filteredRestaurants = useMemo(() => {
  if (!selectedCuisine) return restaurants;
  return restaurants.filter(r => r.cuisine === selectedCuisine);
}, [restaurants, selectedCuisine]);
```

### Dodanie sortowania restauracji

```typescript
const sortedRestaurants = [...restaurants].sort((a, b) => 
  b.rating - a.rating // sortuj po ocenie malejąco
);
```

## 📱 Responsywność

Mapa ma dynamiczną wysokość:
- Na urządzeniach mobilnych: 400px (minimum)
- Na desktopie: 600px
- Szerokość: 100%

## 🎯 Następne kroki

1. ✅ Mapę podłączyć pod API
2. ⏳ Dodać filtry i sortowanie (opcjonalnie)
3. ⏳ Pobierać dane użytkownika (lokalizacja) - opcjonalnie
4. ⏳ Dodać funkcje "Dodaj do ulubionych" - opcjonalnie

