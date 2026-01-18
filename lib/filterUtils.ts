import { Restaurant } from '@/types/restaurant';

/**
 * Filtruje restauracje po kategorii (kuchni)
 */
export const filterRestaurantsByCategory = (restaurants: Restaurant[], category: string): Restaurant[] => {
  if (!category) return restaurants;
  return restaurants.filter((r) => r.cuisine?.toLowerCase().includes(category.toLowerCase()));
};

/**
 * Filtruje restauracje po ocenie
 */
export const filterRestaurantsByRating = (restaurants: Restaurant[], minRating: number, maxRating?: number): Restaurant[] => {
  return restaurants.filter((r) => {
    const ratingInRange = r.rating >= minRating;
    return maxRating ? ratingInRange && r.rating <= maxRating : ratingInRange;
  });
};

/**
 * Pobiera unikalne kategorie (kuchnie) z listy restauracji
 */
export const getUniqueCuisines = (restaurants: Restaurant[]): string[] => {
  const cuisines = new Set(restaurants.map((r) => r.cuisine).filter(Boolean));
  return Array.from(cuisines).sort();
};

/**
 * Pobiera oceny do filtrowania
 */
export const getRatingRanges = () => [
  { label: 'Wszystkie', min: 0 },
  { label: '4.5+ ★', min: 4.5 },
  { label: '4.0+ ★', min: 4.0 },
  { label: '3.5+ ★', min: 3.5 },
  { label: '3.0+ ★', min: 3.0 },
];
