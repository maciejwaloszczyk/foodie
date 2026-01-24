'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import SearchBar from '@/components/Restaurant/SearchBar';
import RestaurantFilters from '@/components/Restaurant/RestaurantFilters';
import SingleRestaurant from '@/components/Restaurant/SingleRestaurant';
import { Restaurant } from '@/types/restaurant';
import { getRestaurantsWithStats } from '@/lib/restaurants';

const FilteredRestaurantsSection = () => {
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Load initial restaurants on mount
  useEffect(() => {
    const loadInitialRestaurants = async () => {
      try {
        setIsLoading(true);
        const response = await getRestaurantsWithStats();
        const restaurants =
          response.data?.map((apiRestaurant: any) => ({
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
        setSearchResults(restaurants);
      } catch (error) {
        console.error('Failed to load restaurants:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialRestaurants();
  }, []);

  const handleSearch = (results: Restaurant[]) => {
    setSearchResults(results);
  };

  // Resetuj stronę po zmianie wyników lub filtrów
  useEffect(() => {
    setCurrentPage(1);
  }, [searchResults, selectedCategory, selectedRating, sortBy]);

  // Scroll do góry listy przy zmianie strony
  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  // Kombinuj wyniki wyszukiwania z filtrami i sortowaniem
  const finalResults = useMemo(() => {
    let results = searchResults;

    if (selectedCategory) {
      results = results.filter((restaurant) => restaurant.cuisine?.includes(selectedCategory));
    }

    if (selectedRating > 0) {
      results = results.filter((restaurant) => restaurant.rating >= selectedRating);
    }

    // Sortowanie
    const sortedResults = [...results];
    switch (sortBy) {
      case 'default':
        sortedResults.sort((a, b) => a.id - b.id);
        break;
      case 'rating':
        sortedResults.sort((a, b) => b.rating - a.rating);
        break;
      case 'reviews':
        sortedResults.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'name':
        sortedResults.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sortedResults;
  }, [searchResults, selectedCategory, selectedRating, sortBy]);

  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(finalResults.length / pageSize));
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return finalResults.slice(start, start + pageSize);
  }, [finalResults, currentPage]);

  const handleFilterChange = (category: string, rating: number) => {
    setSelectedCategory(category);
    setSelectedRating(rating);
  };

  return (
    <section className="bg-white dark:bg-gray-dark py-16 md:py-20 lg:py-28">
      <div className="container">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} placeholder="Wyszukaj restauracje..." />
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filtry - sidebar */}
          <div className="lg:col-span-1">
            <RestaurantFilters selectedCategory={selectedCategory} selectedRating={selectedRating} onFilterChange={handleFilterChange} />
          </div>

          {/* Wyniki */}
          <div className="lg:col-span-3" ref={resultsRef}>
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-dark dark:text-white">Wszystkie restauracje</h2>
                  <p className="mt-2 text-sm text-body-color dark:text-body-color-dark">
                    Znaleziono <span className="font-bold">{isLoading ? '...' : finalResults.length}</span> restauracji
                  </p>
                </div>

                {/* Sortowanie */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm text-body-color dark:text-body-color-dark whitespace-nowrap">
                    Sortuj:
                  </label>
                  <div className="relative inline-block">
                    <select className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-dark focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-dark dark:text-white" value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={isLoading}>
                      <option value="default">Trafność (największa)</option>
                      <option value="rating">Ocena (malejąco)</option>
                      <option value="reviews">Liczba opinii (malejąco)</option>
                      <option value="name">Alfabetycznie (A-Z)</option>
                    </select>

                    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              </div>
            ) : finalResults.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedResults.map((restaurant) => (
                  <SingleRestaurant key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-dark dark:text-white">Brak restauracji</h3>
                <p className="mt-2 text-body-color dark:text-body-color-dark">Spróbuj zmienić kryteria wyszukiwania lub filtrowania</p>
              </div>
            )}

            {!isLoading && finalResults.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-dark transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:border-primary">
                  Poprzednia
                </button>
                <span className="text-sm text-body-color dark:text-body-color-dark">
                  Strona <span className="font-semibold text-dark dark:text-white">{currentPage}</span> z <span className="font-semibold text-dark dark:text-white">{totalPages}</span>
                </span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-dark transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-white dark:hover:border-primary">
                  Następna
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilteredRestaurantsSection;
