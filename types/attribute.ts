export type Attribute = {
  id: number;
  name: string;
  description?: string;
  weight: number;
}

export type DishAttribute = {
  dish_id: number;
  attribute_id: number;
};