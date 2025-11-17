import { Dish } from "@/types/dish";
import { reviewData } from "./reviewData";

function computeDishRating(dishId: number): number | null {
  const reviews = reviewData.filter((r) => r.dish_id === dishId);
  const values = reviews.map((r) => r.overall_rating ?? 0).filter((v) => v > 0);
  if (values.length === 0) return null;

  // jeśli najwyższa wartość > 5 to zakładamy skalę 1..10 i przeskalowujemy (/2),
  // w przeciwnym razie traktujemy wartości jako już w skali 1..5
  const maxVal = Math.max(...values);
  const scaledValues = values.map((v) => (maxVal > 5 ? v / 2 : v));

  const avg = scaledValues.reduce((acc, v) => acc + v, 0) / scaledValues.length;
  return Math.round(avg * 10) / 10; // 1 miejsce po przecinku
}

export const dishData: Dish[] = [
  {
    id: 1,
    name: "Kebab z kurczaka",
    description: "Kebab z kurczaka z sosem czosnkowym i świeżymi warzywami.",
    price: 25.99,
    category: "Kebab",
    rating: computeDishRating(1) ?? 0,
    restaurant_id: 1,
    dish_attributes: [1, 2, 5],
    reviews: [1, 2, 3],
  },
  {
    id: 2,
    name: "Falafel Wrap",
    description: "Wrap z domowymi falafelami, hummusem i surówką.",
    price: 22.5,
    category: "Wrap",
    rating: computeDishRating(2) ?? 0,
    restaurant_id: 1,
    dish_attributes: [1, 2, 3, 5],
    reviews: [4],
  },
  {
    id: 3,
    name: "Miska Meksykańska",
    description: "Miska z ryżem, fasolą, grillowanym kurczakiem, salsą i guacamole.",
    price: 29.0,
    category: "Meksykańskie",
    rating: computeDishRating(3) ?? 0,
    restaurant_id: 1,
    dish_attributes: [1, 3, 4, 5],
    reviews: [5, 6],
  },
  {
    id: 4,
    name: "Burger Premium",
    description: "Wołowy burger z karmelizowaną cebulą, serem cheddar i sosem BBQ.",
    price: 34.5,
    category: "Burgery",
    rating: computeDishRating(4) ?? 0,
    restaurant_id: 2,
    dish_attributes: [1, 6, 7, 5],
    reviews: [7, 8],
  },
  {
    id: 5,
    name: "Sałatka z krewetkami",
    description: "Sałatka z mieszanką sałat, grillowanymi krewetkami i sosem cytrynowym.",
    price: 39.0,
    category: "Sałatki",
    rating: computeDishRating(5) ?? 0,
    restaurant_id: 2,
    dish_attributes: [1, 4, 6, 5],
    reviews: [9],
  },
];