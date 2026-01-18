'use client';
import { useMemo } from 'react';
import { getUniqueCuisines, getRatingRanges } from '@/lib/filterUtils';
import restaurantData from './data/restaurantData';

interface RestaurantFiltersProps {
  selectedCategory: string;
  selectedRating: number;
  onFilterChange?: (category: string, rating: number) => void;
}

const RestaurantFilters = ({ selectedCategory, selectedRating, onFilterChange }: RestaurantFiltersProps) => {
  const cuisines = useMemo(() => getUniqueCuisines(restaurantData), []);
  const ratingRanges = getRatingRanges();

  const handleCategoryChange = (category: string) => {
    if (onFilterChange) {
      onFilterChange(category, selectedRating);
    }
  };

  const handleRatingChange = (rating: number) => {
    if (onFilterChange) {
      onFilterChange(selectedCategory, rating);
    }
  };

  const handleClearFilters = () => {
    if (onFilterChange) {
      onFilterChange('', 0);
    }
  };

  const hasActiveFilters = selectedCategory || selectedRating > 0;

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-dark">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-dark dark:text-white">Filtry</h3>
        {hasActiveFilters && (
          <button onClick={handleClearFilters} className="text-sm text-primary hover:underline">
            Wyczyść
          </button>
        )}
      </div>

      {/* Kategoria */}
      <div className="mb-6 border-b border-gray-200 pb-6 dark:border-gray-700">
        <h4 className="mb-3 font-medium text-dark dark:text-white">Kuchnia</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center">
            <input type="radio" name="category" value="" checked={selectedCategory === ''} onChange={(e) => handleCategoryChange(e.target.value)} className="h-4 w-4 cursor-pointer text-primary" />
            <span className="ml-3 text-sm text-body-color dark:text-body-color-dark">Wszystkie</span>
          </label>
          {cuisines.map((cuisine) => (
            <label key={cuisine} className="flex cursor-pointer items-center">
              <input type="radio" name="category" value={cuisine} checked={selectedCategory === cuisine} onChange={(e) => handleCategoryChange(e.target.value)} className="h-4 w-4 cursor-pointer text-primary" />
              <span className="ml-3 text-sm text-body-color dark:text-body-color-dark">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ocena */}
      <div>
        <h4 className="mb-3 font-medium text-dark dark:text-white">Ocena</h4>
        <div className="space-y-2">
          {ratingRanges.map((range) => (
            <label key={range.min} className="flex cursor-pointer items-center">
              <input type="radio" name="rating" value={range.min} checked={selectedRating === range.min} onChange={() => handleRatingChange(range.min)} className="h-4 w-4 cursor-pointer text-primary" />
              <span className="ml-3 text-sm text-body-color dark:text-body-color-dark">{range.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantFilters;
