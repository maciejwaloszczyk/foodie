import { Attribute, DishAttribute } from "@/types/attribute";

export const attributeData: Attribute[] = [
  { id: 1, name: "Świeżość", description: "Świeżość składników", weight: 1 },
  { id: 2, name: "Porcja", description: "Wielkość / sytość porcji", weight: 1 },
  { id: 3, name: "Ostrość", description: "Stopień przyprawienia / pikantność", weight: 1 },
  { id: 4, name: "Prezentacja", description: "Wygląd i podanie dania", weight: 1 },
  { id: 5, name: "Stosunek jakości do ceny", description: "Value for money", weight: 1 },
  { id: 6, name: "Temperatura", description: "Czy danie było podane w odpowiedniej temperaturze", weight: 1 },
  { id: 7, name: "Czas przygotowania", description: "Szybkość przygotowania / dostawy", weight: 1 },
];

export const dishAttributes: DishAttribute[] = [
  // dish 1 (Kebab) attributes
  { dish_id: 1, attribute_id: 1 },
  { dish_id: 1, attribute_id: 2 },
  { dish_id: 1, attribute_id: 5 },

  // dish 2 (Falafel Wrap)
  { dish_id: 2, attribute_id: 1 },
  { dish_id: 2, attribute_id: 2 },
  { dish_id: 2, attribute_id: 3 },
  { dish_id: 2, attribute_id: 5 },

  // dish 3 (Miska Meksykańska)
  { dish_id: 3, attribute_id: 1 },
  { dish_id: 3, attribute_id: 3 },
  { dish_id: 3, attribute_id: 4 },
  { dish_id: 3, attribute_id: 5 },

  // mappings dla nowych dań (id 4,5)
  { dish_id: 4, attribute_id: 1 },
  { dish_id: 4, attribute_id: 6 }, // temperatura
  { dish_id: 4, attribute_id: 7 }, // czas przygotowania
  { dish_id: 4, attribute_id: 5 },

  { dish_id: 5, attribute_id: 1 },
  { dish_id: 5, attribute_id: 4 }, // prezentacja
  { dish_id: 5, attribute_id: 6 },
  { dish_id: 5, attribute_id: 5 },
];