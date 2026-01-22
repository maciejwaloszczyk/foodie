'use client';
import { useState, useRef, useEffect } from 'react';
import SectionTitle from '../Common/SectionTitle';
import SingleRestaurant from './SingleRestaurant';
import { getRestaurants } from '@/lib/restaurants';
import { Restaurant } from '@/types/restaurant';

const FeaturedRestaurants = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  useEffect(() => {
    const loadFeaturedRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await getRestaurants();
        const restaurants =
          response.data
            ?.filter((apiRestaurant: any) => apiRestaurant.promoted)
            .map((apiRestaurant: any) => ({
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
        setFeaturedRestaurants(restaurants);
      } catch (error) {
        console.error('Failed to load featured restaurants:', error);
        setFeaturedRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedRestaurants();
  }, []);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left' ? scrollContainerRef.current.scrollLeft - scrollAmount : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(checkScrollability, 300);
    }
  };

  return (
    <section id="featured" className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle title="Proponowane" paragraph="Sprawdź najlepsze restauracje, które polecamy dzisiaj" center />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : featuredRestaurants.length > 0 ? (
          <div className="relative">
            {canScrollLeft && (
              <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 dark:bg-dark dark:hover:bg-gray-dark" aria-label="Przewiń w lewo">
                <svg className="h-6 w-6 fill-current text-dark dark:text-white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                </svg>
              </button>
            )}

            <div ref={scrollContainerRef} onScroll={checkScrollability} className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {featuredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="min-w-[300px] flex-shrink-0 sm:min-w-[350px] lg:min-w-[400px]">
                  <SingleRestaurant restaurant={restaurant} />
                </div>
              ))}
            </div>

            {canScrollRight && (
              <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 dark:bg-dark dark:hover:bg-gray-dark" aria-label="Przewiń w prawo">
                <svg className="h-6 w-6 fill-current text-dark dark:text-white" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">Brak proponowanych restauracji</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedRestaurants;