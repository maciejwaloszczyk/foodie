'use client';
import { useState, useRef, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import restaurantData from './data/restaurantData';

interface SearchBarProps {
  onSearch?: (results: Restaurant[]) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = 'Szukaj restauracji...' }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Restaurant[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [maxDropdownHeight, setMaxDropdownHeight] = useState(400);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Wyszukiwanie po nazwie, lokalizacji i kuhni
    const results = restaurantData.filter((restaurant) => {
      const queryLower = query.toLowerCase();
      const matchesName = restaurant.name.toLowerCase().includes(queryLower);
      const matchesLocation = restaurant.address?.toLowerCase().includes(queryLower);
      const matchesCuisine = restaurant.cuisine?.toLowerCase().includes(queryLower);

      return matchesName || matchesLocation || matchesCuisine;
    });

    setSuggestions(results.slice(0, 8)); // Max 8 sugestii
    setIsOpen(true);

    if (onSearch) {
      onSearch(results);
    }
  };

  // Oblicz maksymalną wysokość dropdown'u aby nie wystawał poza ekran
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - 16; // 16px marginesu
      const calculatedHeight = Math.min(400, spaceBelow); // Max 400px lub dostępne miejsce
      setMaxDropdownHeight(Math.max(200, calculatedHeight)); // Min 200px
    }
  }, [isOpen]);

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSearchQuery(restaurant.name);
    setSuggestions([]);
    setIsOpen(false);
    if (onSearch) {
      onSearch([restaurant]);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSearch) onSearch([]);
  };

  return (
    <div className="search-container relative w-full max-w-[600px] mx-auto">
      <div className="relative">
        <input ref={inputRef} type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onFocus={() => searchQuery && setIsOpen(true)} placeholder={placeholder} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pl-12 text-sm text-dark placeholder-gray-500 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-dark dark:text-white dark:placeholder-gray-400" />
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {searchQuery && (
          <button onClick={handleClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Sugestie */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full mt-2 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-dark z-[9999]"
          style={{
            maxHeight: `${maxDropdownHeight}px`,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((restaurant) => (
            <button key={restaurant.id} onClick={() => handleSelectRestaurant(restaurant)} className="w-full border-b border-gray-200 px-4 py-3 text-left hover:bg-gray-100 last:border-b-0 dark:border-gray-700 dark:hover:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-dark dark:text-white">{restaurant.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {restaurant.cuisine} • {restaurant.address}
                  </p>
                </div>
                <div className="ml-2 flex items-center gap-1 whitespace-nowrap text-sm">
                  <span className="text-yellow-500">★ {restaurant.rating}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Brak wyników */}
      {isOpen && searchQuery && suggestions.length === 0 && <div className="absolute top-full mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-gray-500 shadow-lg dark:border-gray-600 dark:bg-dark dark:text-gray-400 z-[9999]">Brak wyników dla "{searchQuery}"</div>}
    </div>
  );
};

export default SearchBar;
