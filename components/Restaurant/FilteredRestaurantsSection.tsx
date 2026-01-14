'use client';
import { useState, useMemo } from 'react';
import SearchBar from '@/components/Restaurant/SearchBar';
import RestaurantFilters from '@/components/Restaurant/RestaurantFilters';
import SingleRestaurant from '@/components/Restaurant/SingleRestaurant';
import { Restaurant } from '@/types/restaurant';
import restaurantData from '@/components/Restaurant/data/restaurantData';

const FilteredRestaurantsSection = () => {
  const [searchResults, setSearchResults] = useState<Restaurant[]>(restaurantData);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');

  const handleSearch = (results: Restaurant[]) => {
    setSearchResults(results);
  };

  // Kombinuj wyniki wyszukiwania z filtrami i sortowaniem
  const finalResults = useMemo(() => {
    let results = searchResults;

    if (selectedCategory) {
      results = results.filter((restaurant) => restaurant.cuisine === selectedCategory);
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
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-dark dark:text-white">Wszystkie restauracje</h2>
                  <p className="mt-2 text-sm text-body-color dark:text-body-color-dark">
                    Znaleziono <span className="font-bold">{finalResults.length}</span> restauracji
                  </p>
                </div>

                {/* Sortowanie */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm text-body-color dark:text-body-color-dark whitespace-nowrap">
                    Sortuj:
                  </label>
                  <div className="relative inline-block">
                    <select className="appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-dark focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-dark dark:text-white" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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

            {finalResults.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {finalResults.map((restaurant) => (
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilteredRestaurantsSection;
