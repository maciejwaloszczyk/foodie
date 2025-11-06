export type Dish = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  rating: number;
  restaurant: number;
  dish_attributes: [number];
  reviews: [number];
};