import { useState, useEffect } from 'react';
import type { Restaurant } from '@/types/restaurant';

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

        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
        const apiKey = process.env.NEXT_PUBLIC_STRAPI_KEY;

        // Pobieranie restauracji z API
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Dodaj Bearer token do nagłówka Authorization
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // Pobierz wszystkie restauracje ze wszystkich stron
        let allRestaurants: any[] = [];
        let page = 1;
        let pageCount = 1;

        while (page <= pageCount) {
          const response = await fetch(`${strapiUrl}/api/restaurants?pagination[page]=${page}&pagination[pageSize]=100`, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const json = await response.json();
          allRestaurants = [...allRestaurants, ...(json.data || [])];

          // Pobierz info o paginacji
          if (json.meta?.pagination) {
            pageCount = json.meta.pagination.pageCount;
          }

          page++;
        }

        // Transformacja danych z API na format aplikacji
        const transformedRestaurants = allRestaurants
          .map((item: any) => ({
            id: item.id || item.documentId,
            name: item.name || '',
            image: item.image || '',
            cuisine: item.cuisine || item.category || 'Różne',
            rating: item.avg_rating || item.rating || 0,
            reviewCount: item.review_count || item.reviewCount || 0,
            distance: item.distance || '',
            isPromoted: item.promoted || item.isPromoted || false,
            description: item.description || '',
            address: item.address || '',
            location: {
              lat: item.latitude,
              lng: item.longitude,
            },
          }))
          .filter((restaurant: Restaurant) => {
            // Filtruj restauracje bez nazwy i bez współrzędnych
            return restaurant.name && restaurant.location.lat && restaurant.location.lng;
          });

        setState({
          data: transformedRestaurants,
          loading: false,
          error: null,
        });

        console.log(`✅ Pobrano ${transformedRestaurants.length} restauracji (z ${allRestaurants.length} total)`);
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
