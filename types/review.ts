export type Review = {
  id: number;
  comment: string;
  dish: number;
  users_permissions_user: number;
  review_details: [number];
};

export type ReviewDetails = {
  rating: number;
  review: number;
  attribute: number;
};