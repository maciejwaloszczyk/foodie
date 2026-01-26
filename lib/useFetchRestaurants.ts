import { useState, useEffect } from 'react';
import type { Restaurant } from '@/types/restaurant';
import { getRestaurantsWithStats } from '@/lib/restaurants';

interface FetchState {
  data: Restaurant[];
  loading: boolean;
  error: string | null;
}

export function useFetchRestaurants() {
  const [state, setState] = useState<FetchState>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Używaj getRestaurantsWithStats zamiast bezpośredniego fetch
        const response = await getRestaurantsWithStats();
        const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

        // Transformacja danych z API na format aplikacji
        const transformedRestaurants = (response.data || [])
          .map((apiRestaurant: any) => {
            // Obsługuj kategorie - mogą być w różnych miejscach
            let cuisine = 'Różne';
            if (Array.isArray(apiRestaurant.categories)) {
              cuisine = apiRestaurant.categories.map((c: any) => c.name || c).join(', ');
            } else if (apiRestaurant.cuisine) {
              cuisine = apiRestaurant.cuisine;
            } else if (apiRestaurant.category) {
              cuisine = apiRestaurant.category;
            }

            // Pobierz URL obrazu - sprawdzaj różne ścieżki
            let image = '/images/hero/hero.jpg'; // Fallback
            if (apiRestaurant.cover) {
              if (apiRestaurant.cover.formats?.medium?.url) {
                image = apiRestaurant.cover.formats.medium.url;
              } else if (apiRestaurant.cover.formats?.large?.url) {
                image = apiRestaurant.cover.formats.large.url;
              } else if (apiRestaurant.cover.url) {
                image = apiRestaurant.cover.url;
              }
              // Dodaj URL Strapi jeśli to ścieżka względna
              if (image && !image.startsWith('http')) {
                image = `${STRAPI_URL}${image}`;
              }
            } else if (apiRestaurant.image) {
              image = apiRestaurant.image;
            }

            return {
              id: apiRestaurant.id || apiRestaurant.documentId,
              name: apiRestaurant.name || '',
              image: image,
              cuisine: cuisine,
              rating: apiRestaurant.avg_rating || apiRestaurant.rating || 0,
              reviewCount: apiRestaurant.reviewCount || apiRestaurant.review_count || 0,
              distance: apiRestaurant.distance || '',
              isPromoted: apiRestaurant.promoted || apiRestaurant.featured || false,
              description: apiRestaurant.description || '',
              address: apiRestaurant.address || '',
              location: {
                lat: apiRestaurant.latitude,
                lng: apiRestaurant.longitude,
              },
            };
          })
          .filter((restaurant: Restaurant) => {
            // Filtruj restauracje bez nazwy i bez współrzędnych
            return restaurant.name && restaurant.location.lat && restaurant.location.lng;
          });

        console.log(
          '✅ Restauracje z getRestaurantsWithStats:',
          transformedRestaurants.slice(0, 3).map((r) => ({ name: r.name, rating: r.rating, reviews: r.reviewCount, cuisine: r.cuisine })),
        );

        setState({
          data: transformedRestaurants,
          loading: false,
          error: null,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
        console.error('Error fetching restaurants:', errorMessage);
        setState({
          data: [],
          loading: false,
          error: errorMessage,
        });
      }
    };

    fetchRestaurants();
  }, []);

  return state;
}
