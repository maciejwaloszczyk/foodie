# 🤖 Instrukcje dla GitHub Copilot - Projekt Foodie

## 📋 Informacje o projekcie

### Nazwa projektu
**Foodie** - Aplikacja do odkrywania i zamawiania jedzenia z restauracji

### Stack technologiczny
- **Frontend**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS
- **Język**: TypeScript
- **Backend**: Strapi (headless CMS)
- **Autentykacja**: Strapi Users & Permissions + JWT tokens
- **State Management**: React Context API (AuthContext)

---

## 🏗️ Struktura projektu

### Kluczowe katalogi
```
app/                    # Next.js App Router
├── page.tsx           # Strona główna (tylko Hero ukryte dla zalogowanych)
├── layout.tsx         # Root layout z AuthProvider
├── signin/            # Strona logowania (Strapi integration)
├── signup/            # Strona rejestracji (Strapi integration)
└── [inne strony]

components/
├── Restaurant/        # Komponenty restauracji
│   ├── FeaturedRestaurants.tsx    # Slider z promowanymi restauracjami
│   ├── TopRated.tsx               # Grid najlepiej ocenianych
│   ├── OurChoice.tsx              # Wybór redakcji
│   ├── NearbyRestaurants.tsx      # Lista restauracji w okolicy
│   ├── SingleRestaurant.tsx       # Karta pojedynczej restauracji
│   └── restaurantData.tsx         # Dane testowe restauracji
├── Header/            # Header z dynamiczną autentykacją
├── Hero/              # Hero section (ukryte dla zalogowanych)
└── [inne komponenty]

lib/
├── AuthContext.tsx    # React Context dla globalnej autentykacji
├── useAuth.ts         # Hook exportujący z AuthContext
└── utils.ts

types/
├── restaurant.ts      # Typy dla restauracji
└── [inne typy]
```

---

## 🔐 System autentykacji

### Architektura
- **Provider**: `AuthContext` opakowuje całą aplikację w `layout.tsx`
- **Hook**: `useAuth()` - dostęp do globalnego stanu autentykacji
- **Storage**: JWT token w `localStorage` (klucz: `jwt`)
- **Backend**: Strapi API endpoints

### Używanie autentykacji w komponentach
```typescript
import { useAuth } from "@/lib/useAuth";

const MyComponent = () => {
  const { user, isAuthenticated, loading, login, logout, register } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (isAuthenticated) {
    return <div>Witaj, {user.username}!</div>;
  }
  
  return <LoginButton />;
};
```

### Strapi API Endpoints
- `POST /api/auth/local` - Logowanie
- `POST /api/auth/local/register` - Rejestracja
- `GET /api/users/me` - Pobieranie danych zalogowanego użytkownika

### Environment Variables
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

---

## 🎨 Style i konwencje

### Tailwind CSS
- Używamy Tailwind utility classes
- Dark mode: `dark:` prefix
- Responsive: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Główny kolor primary jest już zdefiniowany w konfiguracji

### Konwencje nazewnictwa
- Komponenty: PascalCase (np. `SingleRestaurant.tsx`)
- Hooki: camelCase z prefixem "use" (np. `useAuth.ts`)
- Typy: PascalCase (np. `Restaurant`, `User`)
- Pliki danych: camelCase (np. `restaurantData.tsx`)

### Struktura komponentu
```typescript
"use client"; // Jeśli używa useState, useEffect, lub kontekstu

import { useState } from "react";
import type { Restaurant } from "@/types/restaurant";

interface Props {
  restaurant: Restaurant;
}

const ComponentName = ({ restaurant }: Props) => {
  // Hooks
  // State
  // Functions
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

---

## 🍔 Typy restauracji

### Restaurant Interface
```typescript
export type Restaurant = {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: string; // "$", "$$", "$$$", "$$$$"
  deliveryTime: string; // "20-30 min"
  distance?: string; // "1.2 km"
  isPromoted?: boolean;
  description?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
};
```

---

## 📄 Logika wyświetlania stron

### Strona główna (app/page.tsx)
```typescript
// WAŻNE: Hero jest ukryte dla zalogowanych
// Wszystkie sekcje restauracji są widoczne zawsze

if (!isAuthenticated) {
  <Hero /> // Tylko dla niezalogowanych
}

// Zawsze widoczne (dla wszystkich):
<FeaturedRestaurants />  // Slider z promowanymi
<TopRated />             // Grid najlepiej ocenianych
<OurChoice />            // Wybór redakcji
<NearbyRestaurants />    // Lista w okolicy
```

### Header (components/Header/index.tsx)
```typescript
// Dynamiczne przyciski w zależności od statusu logowania

if (isAuthenticated) {
  <span>Witaj, {user.username}</span>
  <button onClick={logout}>Wyloguj</button>
} else {
  <Link href="/signin">Zaloguj się</Link>
  <Link href="/signup">Zarejestruj się</Link>
}
```

---

## 🔧 Częste zadania

### Dodawanie nowej sekcji restauracji
1. Utwórz komponent w `components/Restaurant/`
2. Importuj `restaurantData` z `./restaurantData.tsx`
3. Użyj `SingleRestaurant` dla pojedynczych kart
4. Dodaj do `app/page.tsx`

### Dodawanie nowego typu danych
1. Utwórz interface w `types/`
2. Export jako `export type`
3. Importuj gdzie potrzeba: `import type { TypeName } from "@/types/filename"`

### Tworzenie nowego formularza z autentykacją
1. Użyj `"use client"` na górze
2. Import `useAuth` hook
3. Obsługa submit:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const result = await login(email, password);
  if (result.success) {
    router.push("/");
  } else {
    setError(result.error);
  }
  setLoading(false);
};
```

### Dodawanie protected route
```typescript
const ProtectedPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, loading, router]);
  
  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  
  return <YourContent />;
};
```

---

## ⚠️ Ważne uwagi dla Copilota

### DO:
✅ Zawsze używaj TypeScript z odpowiednimi typami
✅ Używaj `"use client"` dla komponentów z hooks/state
✅ Import typów: `import type { Type } from ...`
✅ Używaj Tailwind classes zamiast CSS modules
✅ Obsługuj dark mode: `dark:...`
✅ Dodawaj loading states dla async operations
✅ Obsługuj błędy i wyświetlaj komunikaty użytkownikowi
✅ Używaj `useAuth()` do sprawdzania autentykacji
✅ Zachowuj spójność z istniejącym stylem kodu

### DON'T:
❌ Nie twórz nowych systemów autentykacji (używaj AuthContext)
❌ Nie używaj inline styles (tylko Tailwind)
❌ Nie twórz duplikatów komponentów (sprawdź `components/`)
❌ Nie hardcoduj URL Strapi (używaj env variable)
❌ Nie modyfikuj `AuthContext.tsx` bez konsultacji
❌ Nie usuwaj `"use client"` z komponentów które tego wymagają
❌ Nie mieszaj różnych stanów autentykacji (jeden AuthContext!)

---

## 🧪 Testowanie

### Sprawdzanie autentykacji
1. Otwórz DevTools → Application → Local Storage
2. Sprawdź klucz `jwt`
3. Console nie powinno mieć błędów

### Sprawdzanie responsywności
- Mobile: < 640px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Sprawdzanie dark mode
- Toggle w Header (ThemeToggler component)
- Wszystkie komponenty powinny wspierać `dark:` classes

---

## 📚 Dodatkowe zasoby

### Dokumentacja
- **STRAPI_AUTH_README.md** - Szczegółowa dokumentacja autentykacji
- **TESTING_AUTH.md** - Instrukcje testowania
- **FIX_HEADER_UPDATE.md** - Wyjaśnienie React Context implementation

### Strapi Setup
1. Uruchom Strapi: `http://localhost:1337`
2. Settings → Users & Permissions → Roles → Public
3. Zaznacz: `auth/local`, `auth/local/register`
4. CORS: dodaj `http://localhost:3000` do allowed origins

---

## 🚀 Polecenia

### Development
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run start        # Start production server
```

### Strapi (jeśli osobny projekt)
```bash
npm run develop      # Start Strapi dev server (port 1337)
```

---

## 💡 Tips dla przenoszenia plików

### Importy absolutne
Używamy `@/` jako alias dla root:
```typescript
import { useAuth } from "@/lib/useAuth";
import { Restaurant } from "@/types/restaurant";
import Header from "@/components/Header";
```

### Kluczowe zależności
Po przeniesieniu sprawdź:
1. ✅ `AuthProvider` w `app/layout.tsx`
2. ✅ `.env.local` z `NEXT_PUBLIC_STRAPI_URL`
3. ✅ Wszystkie komponenty Restaurant w `components/Restaurant/`
4. ✅ `lib/AuthContext.tsx` i `lib/useAuth.ts`
5. ✅ Typy w `types/`

### Kolejność migracji (zalecana)
1. **Typy** (`types/`)
2. **Lib/Utils** (`lib/`)
3. **Komponenty bazowe** (`components/Common/`, `components/Header/`)
4. **Komponenty Restaurant** (`components/Restaurant/`)
5. **Pages** (`app/`)
6. **Pliki konfiguracyjne** (`.env.local`, `tailwind.config.js`, etc.)

---

## 🎯 Obecny stan projektu

### ✅ Zaimplementowane
- Autentykacja Strapi (login, register, logout)
- React Context dla globalnego stanu
- Strona główna z 4 sekcjami restauracji
- Dynamiczny Header
- Responsive design
- Dark mode support
- Protected routes
- Form validation
- Error handling

### 🔜 Do zrobienia (sugestie)
- Profile użytkownika
- Zamawianie jedzenia
- Historia zamówień
- Ulubione restauracje
- Integracja z Google Maps dla "W twojej okolicy"
- Filtry i wyszukiwanie restauracji
- System recenzji
- Notifications
- Reset hasła

---

**Wersja**: 1.0  
**Ostatnia aktualizacja**: 27 października 2025  
**Autor**: GitHub Copilot Assistant

---

## 📝 Notatki końcowe

Ta aplikacja jest w pełni funkcjonalna z autentykacją Strapi. Wszystkie komponenty są zaprojektowane modułowo i można je łatwo rozszerzać. Zachowaj spójność ze stylem i konwencjami obecnymi w kodzie.

Przy dodawaniu nowych features zawsze:
1. Sprawdź czy podobny komponent już istnieje
2. Użyj istniejących typów TypeScript
3. Integruj się z AuthContext dla user-specific features
4. Testuj w dark mode
5. Sprawdź responsywność na wszystkich urządzeniach
