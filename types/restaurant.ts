export type Restaurant = {
  id: number;
  name: string;
  image?: string | null;
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
