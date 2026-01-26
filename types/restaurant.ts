export type Restaurant = {
  id: number;
  name: string;
  image?: string | null;
  cuisine: string;
  rating: number;
  reviewCount: number;
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
