export type Restaurant = {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: string; // e.g., "$$", "$$$"
  deliveryTime: string;
  distance?: string;
  isPromoted?: boolean;
  description?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  dishes?: number[];
};
