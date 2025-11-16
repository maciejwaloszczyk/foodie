import { Dish } from "@/types/dish";

/**
 * Testowe dania — tylko dla restaurant_id = 1 (zgodnie z prośbą)
 * Pola odpowiadają dokładnie typowi types/dish.ts
 */
export const dishData: Dish[] = [
  {
    id: 1,
    name: "Kebab z kurczaka",
    description: "Kebab z kurczaka z sosem czosnkowym i świeżymi warzywami.",
    price: 25.99,
    category: "Kebab",
    rating: 4.5,
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
    rating: 4.2,
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
    rating: 3.75,
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
    rating: 4.1,
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
    rating: 4.4,
    restaurant_id: 2,
    dish_attributes: [1, 4, 6, 5],
    reviews: [9],
  },
];