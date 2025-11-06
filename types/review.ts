export type Review = {
  id: number;
  user_id: number;
  dish_id: number;
  comment: string;
  overall_rating: number;
  review_details: number[];
};

export type ReviewDetails = {
  id: number;
  rating: number;
  review_id: number;
  attribute_id: number;
};