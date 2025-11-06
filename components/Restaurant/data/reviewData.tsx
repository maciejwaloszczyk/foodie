import {Review, ReviewDetails} from "@/types/review";

export const reviewsData: Review[] = [
  {
    id: 1,
    user_id: 1,
    dish_id: 1,
    comment: "Mięso soczyste. Sosy dobre.",
    overall_rating: 4.5,
    review_details: [1, 2],
  },
  {
    id: 2,
    user_id: 2,
    dish_id: 1,
    comment: "Mieso średnie. Sosy mogłyby być lepsze.",
    overall_rating: 3,
    review_details: [3, 4],
  }
];

export const reviewDetailsData: ReviewDetails[] = [
  {
    id: 1,
    rating: 8,
    review_id: 1,
    attribute_id: 1,
 },
 {    
    id: 2,
    rating: 7,
    review_id: 1,
    attribute_id: 2,
  },
  {
    id: 3,
    rating: 6,
    review_id: 2,
    attribute_id: 1,
  },
  {
    id: 4,
    rating: 5,
    review_id: 2,
    attribute_id: 2,
  }
];