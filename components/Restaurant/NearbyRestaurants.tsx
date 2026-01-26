'use client';
import { useState, useEffect } from 'react';
import SectionTitle from '../Common/SectionTitle';
import Image from 'next/image';
import Link from 'next/link';
import { getRestaurantsWithStats } from '@/lib/restaurants';
import { Restaurant } from '@/types/restaurant';
import { useGeolocation } from '@/lib/GeolocationContext';
import { calculateDistanceKm, formatDistance } from '@/lib/useGeolocation';

const NearbyRestaurants = () => {
  const RESULT_LIMIT = 30;
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLocation, locationLabel, isResolvingLocation, locationStatus, locationError, requestLocation } = useGeolocation();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  useEffect(() => {
    const loadNearbyRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await getRestaurantsWithStats();
        const restaurants =
          response.data?.map((apiRestaurant: any) => {
            const hasLocation = apiRestaurant.latitude !== undefined && apiRestaurant.latitude !== null && apiRestaurant.longitude !== undefined && apiRestaurant.longitude !== null;

            const location = hasLocation ? { lat: Number(apiRestaurant.latitude), lng: Number(apiRestaurant.longitude) } : undefined;

            return {
              id: apiRestaurant.id,
              name: apiRestaurant.name,
              address: apiRestaurant.address,
              cuisine: Array.isArray(apiRestaurant.categories) ? apiRestaurant.categories.map((c: any) => c.name || c).join(', ') : typeof apiRestaurant.categories === 'string' ? apiRestaurant.categories : 'Nieznana kuhnia',
              rating: apiRestaurant.avg_rating || 0,
              reviewCount: apiRestaurant.reviewCount || 0,
              distance: apiRestaurant.distance || undefined,
              isPromoted: apiRestaurant.promoted || false,
              image: apiRestaurant.cover?.url ? `${STRAPI_URL}${apiRestaurant.cover.url}` : '',
              description: apiRestaurant.description || '',
              location,
            } as Restaurant;
          }) || [];

        const sortedByExistingDistance = [...restaurants].sort((a, b) => {
          const distanceA = parseFloat(a.distance?.replace(' km', '') || '999');
          const distanceB = parseFloat(b.distance?.replace(' km', '') || '999');
          return distanceA - distanceB;
        });

        setAllRestaurants(sortedByExistingDistance);
        setNearbyRestaurants(sortedByExistingDistance.slice(0, RESULT_LIMIT));
      } catch (error) {
        console.error('Failed to load nearby restaurants:', error);
        setAllRestaurants([]);
        setNearbyRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNearbyRestaurants();
  }, []);

  useEffect(() => {
    if (!userLocation || allRestaurants.length === 0) {
      setNearbyRestaurants(allRestaurants.slice(0, RESULT_LIMIT));
      return;
    }

    const withDistance = allRestaurants.map((restaurant) => {
      if (!restaurant.location) return { restaurant, distanceKm: null };
      const distanceKm = calculateDistanceKm(userLocation, restaurant.location);
      return {
        restaurant: {
          ...restaurant,
          distance: formatDistance(distanceKm) ?? restaurant.distance,
        },
        distanceKm,
      };
    });

    const sortedByUserLocation = [...withDistance]
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .map((entry) => entry.restaurant)
      .slice(0, RESULT_LIMIT);

    setNearbyRestaurants(sortedByUserLocation);
  }, [userLocation, allRestaurants]);

  return (
    <section className="bg-white dark:bg-gray-dark py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle title="W twojej okolicy" paragraph="Znajdź najlepsze restauracje w Twojej okolicy" center />

        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg bg-primary/5 p-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-black dark:text-white">Pokaż {RESULT_LIMIT} najbliższych restauracji</p>
            <p className="text-sm text-body-color dark:text-body-color-dark">Użyj swojej lokalizacji, aby posortować listę według faktycznej odległości.</p>
            {locationStatus === 'granted' && userLocation && (
              <p className="mt-1 text-xs text-primary">
                Lokalizacja włączona{isResolvingLocation ? '...' : ''}: {locationLabel || `${userLocation.lat.toFixed(3)}°, ${userLocation.lng.toFixed(3)}°`}
              </p>
            )}
            {locationStatus === 'denied' && locationError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{locationError}</p>}
            {locationStatus === 'unavailable' && locationError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{locationError}</p>}
          </div>
          <button onClick={requestLocation} disabled={locationStatus === 'requesting'} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/60">
            {locationStatus === 'requesting' ? 'Pobieranie lokalizacji...' : 'Użyj mojej lokalizacji'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div> {/* <-- SAM SIĘ NAPRAWIŁ */}
          </div>
        ) : nearbyRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {nearbyRestaurants.map((restaurant, index) => (
              <div key={restaurant.id} className="wow fadeInUp hover:shadow-two dark:hover:shadow-gray-dark group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 dark:bg-dark" data-wow-delay={`.${index + 1}s`}>
                <Link href={`/restaurant/${restaurant.id}`} className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full sm:aspect-square sm:w-48 md:w-56 lg:w-64">
                    {restaurant.image ? (
                      <Image src={restaurant.image} alt={restaurant.name} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400">Brak zdjęcia</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl">{restaurant.name}</h3>
                        <div className="ml-4 flex items-center rounded-full bg-primary/10 px-3 py-1">
                          <svg className="mr-1 h-4 w-4 fill-current text-yellow-400" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-sm font-semibold text-dark dark:text-white">{restaurant.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="mb-2 text-sm font-medium text-body-color dark:text-body-color-dark">{restaurant.cuisine}</p>

                      {restaurant.address && (
                        <p className="mb-3 text-xs text-body-color dark:text-body-color-dark flex items-center">
                          <svg className="mr-1 h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
                          </svg>
                          {restaurant.address}
                        </p>
                      )}

                      {restaurant.description && <p className="mb-4 text-base text-body-color dark:text-body-color-dark">{restaurant.description}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-stroke border-opacity-10 pt-4 dark:border-white dark:border-opacity-10">
                      {' '}
                      {/* <-- ZMIANA (kolor linii) */}
                      {restaurant.distance && (
                        <div className="flex items-center">
                          <svg className="mr-2 h-5 w-5 fill-current text-primary" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
                          </svg>
                          <span className="font-semibold text-dark dark:text-white">{restaurant.distance}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg className="mr-2 h-5 w-5 fill-current text-body-color dark:text-body-color-dark" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-body-color dark:text-body-color-dark">{restaurant.reviewCount} recenzji</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Brak restauracji w Twojej okolicy</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyRestaurants;
