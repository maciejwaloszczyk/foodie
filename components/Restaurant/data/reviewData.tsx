import { Review, ReviewDetails } from "@/types/review";

/**
 * ReviewDetails — szczegółowe oceny poszczególnych atrybutów
 * (pola zgodne z types/review.ts)
 */
export const reviewDetailsData: ReviewDetails[] = [
  // review 1 (dish 1)
  { id: 101, rating: 9, review_id: 1, attribute_id: 1 },
  { id: 102, rating: 8, review_id: 1, attribute_id: 2 },
  { id: 103, rating: 10, review_id: 1, attribute_id: 5 },

  // review 2 (dish 1)
  { id: 104, rating: 6, review_id: 2, attribute_id: 1 },
  { id: 105, rating: 6, review_id: 2, attribute_id: 2 },
  { id: 106, rating: 6, review_id: 2, attribute_id: 5 },

  // review 3 (dish 1)
  { id: 107, rating: 10, review_id: 3, attribute_id: 1 },
  { id: 108, rating: 9, review_id: 3, attribute_id: 2 },
  { id: 109, rating: 10, review_id: 3, attribute_id: 5 },

  // review 4 (dish 2)
  { id: 110, rating: 8, review_id: 4, attribute_id: 1 },
  { id: 111, rating: 8, review_id: 4, attribute_id: 2 },
  { id: 112, rating: 9, review_id: 4, attribute_id: 3 },
  { id: 113, rating: 8, review_id: 4, attribute_id: 5 },

  // review 5 (dish 3)
  { id: 114, rating: 8, review_id: 5, attribute_id: 1 },
  { id: 115, rating: 8, review_id: 5, attribute_id: 3 },
  { id: 116, rating: 3, review_id: 5, attribute_id: 4 },
  { id: 117, rating: 8, review_id: 5, attribute_id: 5 },

  // review 6 (dish 3)
  { id: 118, rating: 7, review_id: 6, attribute_id: 1 },
  { id: 119, rating: 7, review_id: 6, attribute_id: 3 },
  { id: 120, rating: 6, review_id: 6, attribute_id: 4 },
  { id: 121, rating: 7, review_id: 6, attribute_id: 5 },

  // szczegóły dla nowych recenzji (dla review 7,8,9)
  { id: 122, rating: 8, review_id: 7, attribute_id: 1 }, // świeżość
  { id: 123, rating: 9, review_id: 7, attribute_id: 6 }, // temperatura
  { id: 124, rating: 7, review_id: 7, attribute_id: 7 }, // czas przygotowania

  { id: 125, rating: 8, review_id: 8, attribute_id: 1 },
  { id: 126, rating: 8, review_id: 8, attribute_id: 6 },
  { id: 127, rating: 8, review_id: 8, attribute_id: 5 },

  { id: 128, rating: 9, review_id: 9, attribute_id: 1 },
  { id: 129, rating: 9, review_id: 9, attribute_id: 4 },
  { id: 130, rating: 8, review_id: 9, attribute_id: 6 },
  { id: 131, rating: 9, review_id: 9, attribute_id: 5 },
];

/**
 * Główne recenzje — pola zgodne z types/review.ts
 * comment = treść opinii, overall_rating = średnia z review_details
 */
export const reviewData: Review[] = [
  {
    id: 1,
    comment: "Świetne! Kurczak soczysty, sos czosnkowy znakomity. Duża porcja.",
    overall_rating: (4.5 + 4.0 + 5.0) / 3,
    user_id: 1,
    dish_id: 1,
    review_details: [101, 102, 103],
  },
  {
    id: 2,
    comment: "Dobre jedzenie, ale przydałoby się więcej przypraw. Dostawa trochę zimna.",
    overall_rating: (3.0 + 3.0 + 3.0) / 3,
    user_id: 2,
    dish_id: 1,
    review_details: [104, 105, 106],
  },
  {
    id: 3,
    comment: "Rewelacja — chrupiąca bułka i świeże warzywa. Polecam!",
    overall_rating: (5.0 + 4.5 + 5.0) / 3,
    user_id: 3,
    dish_id: 1,
    review_details: [107, 108, 109],
  },
  {
    id: 4,
    comment: "Falafel bardzo dobrze przyprawiony, wrap świeży i sycący.",
    overall_rating: (4.2 + 4.0 + 4.5 + 4.0) / 4,
    user_id: 2,
    dish_id: 2,
    review_details: [110, 111, 112, 113],
  },
  {
    id: 5,
    comment: "Smaczna miska, fajne dodatki, ale w jednej porcji brakowało świeżości.",
    overall_rating: (3.8 + 4.0 + 4.2 + 4.0) / 4,
    user_id: 1,
    dish_id: 3,
    review_details: [114, 115, 116, 117],
  },
  {
    id: 6,
    comment: "Dobry smak, prezentacja mogłaby być lepsza — mniej sosu na wierzchu.",
    overall_rating: (3.5 + 3.5 + 3.0 + 3.5) / 4,
    user_id: 4,
    dish_id: 3,
    review_details: [118, 119, 120, 121],
  },
  {
    id: 7,
    comment: "Smaczny burger, dobra temperatura, hamburger mógłby być przygotowany szybciej.",
    overall_rating: (4.0 + 4.5 + 3.5) / 3,
    user_id: 5,
    dish_id: 4,
    review_details: [122, 123, 124],
  },
  {
    id: 8,
    comment: "Dobry stosunek jakości do ceny, polecam dodatki.",
    overall_rating: (4.2 + 4.0 + 4.1) / 3,
    user_id: 2,
    dish_id: 4,
    review_details: [125, 126, 127],
  },
  {
    id: 9,
    comment: "Krewetki świeże, prezentacja świetna — polecam.",
    overall_rating: (4.6 + 4.4 + 4.2 + 4.5) / 4,
    user_id: 6,
    dish_id: 5,
    review_details: [128, 129, 130, 131],
  },
];