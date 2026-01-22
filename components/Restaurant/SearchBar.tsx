'use client';
import { useState, useRef } from 'react';
import { Restaurant } from '@/types/restaurant';
import { getRestaurants } from '@/lib/restaurants';

interface SearchBarProps {
  onSearch?: (results: Restaurant[]) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = 'Szukaj restauracji...' }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      // Jeśli puste - pobierz wszystkie restauracje
      try {
        setIsLoading(true);
        const response = await getRestaurants();
        const restaurants =
          response.data?.map((apiRestaurant: any) => ({
            id: apiRestaurant.id,
            name: apiRestaurant.name,
            address: apiRestaurant.address,
            cuisine: Array.isArray(apiRestaurant.categories) ? apiRestaurant.categories.map((c: any) => c.name || c).join(', ') : typeof apiRestaurant.categories === 'string' ? apiRestaurant.categories : 'Nieznana kuhnia',
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
        if (onSearch) {
          onSearch(restaurants);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        if (onSearch) onSearch([]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Jeśli jest tekst - wyszukaj w API
    try {
      setIsLoading(true);
      const response = await getRestaurants({ search: query });
      const restaurants =
        response.data?.map((apiRestaurant: any) => ({
          id: apiRestaurant.id,
          name: apiRestaurant.name,
          address: apiRestaurant.address,
          cuisine: Array.isArray(apiRestaurant.categories) ? apiRestaurant.categories.map((c: any) => c.name || c).join(', ') : typeof apiRestaurant.categories === 'string' ? apiRestaurant.categories : 'Nieznana kuhnia',
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
      if (onSearch) {
        onSearch(restaurants);
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
      if (onSearch) onSearch([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    handleSearch('');
  };

  return (
    <div className="search-container relative w-full max-w-[600px] mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-sm text-dark placeholder-gray-500 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-dark dark:text-white dark:placeholder-gray-400"
        />
        {isLoading ? (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : (
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}

        {searchQuery && !isLoading && (
          <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
