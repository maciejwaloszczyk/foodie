'use client';

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Common/Breadcrumb';
import dynamic from 'next/dynamic';
import { useFetchRestaurants } from '@/lib/useFetchRestaurants';

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
  const [displayedRestaurants, setDisplayedRestaurants] = useState(restaurants);

  useEffect(() => {
    setDisplayedRestaurants(restaurants);
  }, [restaurants]);

  // Liczba restauracji do wyświetlenia
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
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">Wszystkie Restauracje</h3>
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
                  <div key={restaurant.id} className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-dark">
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="text-xl font-bold text-black dark:text-white">{restaurant.name}</h4>
                      {restaurant.isPromoted && <span className="rounded-full bg-primary px-3 py-1 text-xs text-white">Promowane</span>}
                    </div>

                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm text-body-color">{restaurant.cuisine}</span>
                    </div>

                    <div className="mb-3 flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-black dark:text-white">{restaurant.rating}</span>
                      <span className="text-sm text-body-color">({restaurant.reviewCount})</span>
                    </div>

                    <div className="mb-3 space-y-1 text-sm text-body-color">{restaurant.distance && <p>📍 {restaurant.distance}</p>}</div>

                    {restaurant.address && <p className="text-xs text-body-color">{restaurant.address}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
