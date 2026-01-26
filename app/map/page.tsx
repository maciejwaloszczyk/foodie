'use client';

import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import dynamic from 'next/dynamic';
import { useFetchRestaurants } from '@/lib/useFetchRestaurants';
import { useGeolocation } from '@/lib/GeolocationContext';
import { calculateDistanceKm, formatDistance } from '@/lib/useGeolocation';
import Link from 'next/link';

// Dynamiczny import mapy - react-leaflet nie działa po stronie serwera
const RestaurantMap = dynamic(() => import('@/components/Restaurant/RestaurantMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
      <p className="text-gray-500 dark:text-gray-400">Ładowanie mapy...</p>
    </div>
  ),
});

export default function MapPage() {
  const { data: restaurants, loading, error } = useFetchRestaurants();
  const { userLocation, locationStatus, requestLocation, locationLabel } = useGeolocation();
  const [displayedRestaurants, setDisplayedRestaurants] = useState(restaurants);
  const [sortBy, setSortBy] = useState<'default' | 'distance' | 'rating' | 'reviews'>('default');

  // Aktualizuj wyświetlane restauracje gdy zmienią się dane lub lokalizacja
  useEffect(() => {
    let updated = [...restaurants];

    // Oblicz odległości jeśli użytkownik włączył lokalizację
    if (userLocation) {
      updated = updated.map((restaurant) => {
        if (!restaurant.location) return restaurant;
        const distanceKm = calculateDistanceKm(userLocation, restaurant.location);
        return {
          ...restaurant,
          distance: formatDistance(distanceKm),
        };
      });
    }

    // Sortuj restauracje
    if (sortBy === 'distance' && userLocation) {
      updated.sort((a, b) => {
        const distA = parseFloat(a.distance?.replace(' km', '') || '999');
        const distB = parseFloat(b.distance?.replace(' km', '') || '999');
        return distA - distB;
      });
    } else if (sortBy === 'rating') {
      updated.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'reviews') {
      updated.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setDisplayedRestaurants(updated);
  }, [restaurants, userLocation, sortBy]);

  // Statystyki
  const restaurantCount = displayedRestaurants.length;
  const cuisineCount = new Set(displayedRestaurants.map((r) => r.cuisine)).size;
  const averageRating = restaurantCount > 0 ? (displayedRestaurants.reduce((acc, r) => acc + r.rating, 0) / restaurantCount).toFixed(1) : '0';
  const totalReviews = displayedRestaurants.reduce((acc, r) => acc + r.reviewCount, 0);

  return (
    <>
      <Breadcrumb pageName="Mapa Restauracji" description="Odkryj najlepsze restauracje w Twojej okolicy. Kliknij w znacznik, aby zobaczyć szczegóły." />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">Znajdź Swoją Ulubioną Restaurację</h2>
            <p className="text-base !leading-relaxed text-body-color md:text-lg">{loading ? 'Ładowanie restauracji...' : error ? 'Nie udało się załadować restauracji' : `Przeglądaj ${restaurantCount} restauracji na mapie i wybierz idealną opcję dla siebie`}</p>
          </div>

          {/* Sekcja geolokalizacji */}
          {locationStatus !== 'granted' && (
            <div className="mb-8 flex flex-col items-center justify-center gap-4 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20 sm:flex-row">
              <div>
                <p className="font-semibold text-black dark:text-white">Włącz lokalizację aby zobaczyć odległości</p>
                <p className="text-sm text-body-color dark:text-body-color-dark">Poznaj jak daleko są restauracje od Twojej obecnej pozycji</p>
              </div>
              <button onClick={requestLocation} disabled={locationStatus === 'requesting'} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:bg-primary/60 disabled:cursor-not-allowed">
                {locationStatus === 'requesting' ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Pobieranie lokalizacji...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
                    </svg>
                    <span>Użyj mojej lokalizacji</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Wyświetl status lokalizacji */}
          {locationStatus === 'granted' && (
            <div className="mb-8 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">✓ Lokalizacja włączona: {locationLabel || 'Pobieranie adresu...'}</p>
            </div>
          )}

          {/* Mapa - pełna szerokość */}
          <div className="mx-auto w-full">
            {loading ? (
              <div className="flex h-[600px] w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">Ładowanie mapy...</p>
              </div>
            ) : error ? (
              <div className="flex h-[600px] w-full flex-col items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-red-600 dark:text-red-400">Błąd: {error}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upewnij się, że API Strapi jest uruchomione na {process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}</p>
              </div>
            ) : (
              <RestaurantMap
                restaurants={displayedRestaurants}
                userLocation={userLocation}
                center={[50.06, 19.94]} // Kraków centrum
                zoom={13}
                className="h-[600px] w-full rounded-lg shadow-lg"
              />
            )}
          </div>

          {/* Statystyki pod mapą */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">{restaurantCount}</h3>
              <p className="text-body-color">Restauracji na mapie</p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">{cuisineCount}</h3>
              <p className="text-body-color">Rodzaje kuchni</p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">{averageRating}</h3>
              <p className="text-body-color">Średnia ocena</p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">{totalReviews}</h3>
              <p className="text-body-color">Łącznie opinii</p>
            </div>
          </div>

          {/* Lista restauracji pod mapą */}
          <div className="mt-12">
            <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <h3 className="text-2xl font-bold text-black dark:text-white">Wszystkie Restauracje</h3>
              <div className="flex gap-2">
                <button onClick={() => setSortBy('default')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${sortBy === 'default' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>
                  Domyślnie
                </button>
                {userLocation && (
                  <button onClick={() => setSortBy('distance')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${sortBy === 'distance' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>
                    Po odległości
                  </button>
                )}
                <button onClick={() => setSortBy('rating')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${sortBy === 'rating' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>
                  Po ocenie
                </button>
                <button onClick={() => setSortBy('reviews')} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${sortBy === 'reviews' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>
                  Po opiniach
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Ładowanie restauracji...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 py-12 dark:bg-red-900/20">
                <p className="text-red-600 dark:text-red-400">Nie udało się załadować restauracji</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            ) : displayedRestaurants.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Brak restauracji do wyświetlenia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedRestaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                    <div className="h-full rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-dark cursor-pointer">
                      <div className="mb-3 flex items-start justify-between">
                        <h4 className="text-xl font-bold text-black dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">{restaurant.name}</h4>
                        {restaurant.isPromoted && <span className="rounded-full bg-primary px-3 py-1 text-xs text-white flex-shrink-0 ml-2">Promowane</span>}
                      </div>

                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm text-body-color">{restaurant.cuisine}</span>
                      </div>

                      <div className="mb-3 flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold text-black dark:text-white">{restaurant.rating.toFixed(1)}</span>
                        <span className="text-sm text-body-color">({restaurant.reviewCount})</span>
                      </div>

                      <div className="mb-3 flex items-center gap-1 text-sm font-semibold text-primary">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
                        </svg>
                        📍 {restaurant.distance || '—'}
                      </div>

                      {restaurant.address && <p className="text-xs text-body-color line-clamp-2">{restaurant.address}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
