'use client';
import { useState, useEffect } from 'react';
import SectionTitle from '../Common/SectionTitle';
import SingleRestaurant from './SingleRestaurant';
import { getRestaurantsWithStats } from '@/lib/restaurants';
import { Restaurant } from '@/types/restaurant';
import { useGeolocation } from '@/lib/GeolocationContext';
import { calculateDistanceKm, formatDistance } from '@/lib/useGeolocation';

const TopRated = () => {
  const [allTopRated, setAllTopRated] = useState<Restaurant[]>([]);
  const [topRatedRestaurants, setTopRatedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userLocation } = useGeolocation();
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  useEffect(() => {
    const loadTopRatedRestaurants = async () => {
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
              cuisine: Array.isArray(apiRestaurant.categories) ? apiRestaurant.categories.map((c: any) => c.name || c).join(', ') : typeof apiRestaurant.categories === 'string' ? apiRestaurant.categories : 'Nieznana kuchnia',
              rating: apiRestaurant.avg_rating || 0,
              reviewCount: apiRestaurant.reviewCount || 0,
              isPromoted: apiRestaurant.promoted || false,
              image: apiRestaurant.cover?.url ? `${STRAPI_URL}${apiRestaurant.cover.url}` : '',
              description: apiRestaurant.description || '',
              location,
            };
          }) || [];
        const sorted = [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 9);
        setAllTopRated(sorted);
        setTopRatedRestaurants(sorted);
      } catch (error) {
        console.error('Failed to load top rated restaurants:', error);
        setAllTopRated([]);
        setTopRatedRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopRatedRestaurants();
  }, []);

  useEffect(() => {
    if (!userLocation || allTopRated.length === 0) {
      setTopRatedRestaurants(allTopRated);
      return;
    }

    const withDistance = allTopRated.map((restaurant) => {
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

    const sortedByDistance = [...withDistance]
      .sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      })
      .map((entry) => entry.restaurant || entry);

    setTopRatedRestaurants(sortedByDistance);
  }, [userLocation, allTopRated]);

  return (
    <section className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle title="Najlepiej oceniane" paragraph="Odkryj restauracje z najwyższymi ocenami naszych użytkowników" center />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : topRatedRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
            {topRatedRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="w-full">
                <SingleRestaurant restaurant={restaurant} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Brak restauracji do wyświetlenia</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopRated;
