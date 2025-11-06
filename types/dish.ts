export type Dish = {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  rating: number;
  dish_attributes: number[];
  reviews: number[];
};