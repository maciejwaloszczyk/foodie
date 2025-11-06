export type Attribute = {
  name: string;
  description?: string;
  rating: number;
  dish_attributes: [number];
  review_details: [number];
}

export type DishAttribute = {
  dish: number;
  attribute: number;
};