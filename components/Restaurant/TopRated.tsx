'use client';
import { useState, useEffect } from 'react';
import SectionTitle from '../Common/SectionTitle';
import SingleRestaurant from './SingleRestaurant';
import { getRestaurants } from '@/lib/restaurants';
import { Restaurant } from '@/types/restaurant';

const TopRated = () => {
  const [topRatedRestaurants, setTopRatedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  useEffect(() => {
    const loadTopRatedRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await getRestaurants({ sortBy: 'rating' });
        const restaurants =
          response.data?.slice(0, 6).map((apiRestaurant: any) => ({
            id: apiRestaurant.id,
            name: apiRestaurant.name,
            address: apiRestaurant.address,
            cuisine: Array.isArray(apiRestaurant.categories) ? apiRestaurant.categories.map((c: any) => c.name || c).join(', ') : typeof apiRestaurant.categories === 'string' ? apiRestaurant.categories : 'Nieznana kuchnia',
            rating: apiRestaurant.avg_rating || 0,
            reviewCount: apiRestaurant.reviewCount || 0,
            priceRange: apiRestaurant.priceRange || '—',
            deliveryTime: apiRestaurant.deliveryTime || '—',
            distance: apiRestaurant.distance || '—',
            isPromoted: apiRestaurant.promoted || false,
            image: apiRestaurant.cover?.url ? `${STRAPI_URL}${apiRestaurant.cover.url}` : '',
            description: apiRestaurant.description || '',
            location: apiRestaurant.latitude && apiRestaurant.longitude ? { lat: apiRestaurant.latitude, lng: apiRestaurant.longitude } : undefined,
          })) || [];
        setTopRatedRestaurants(restaurants);
      } catch (error) {
        console.error('Failed to load top rated restaurants:', error);
        setTopRatedRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopRatedRestaurants();
  }, []);

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