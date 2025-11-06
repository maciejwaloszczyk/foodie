import { Attribute, DishAttribute } from "@/types/attribute";

export const attributeData: Attribute[] = [
  {
    id: 1,
    name: "Mięso",
    description: "Ocena jakości mięsa użytego w kebabie",
    weight: 0.5,
  },
  {
    id: 2,
    name: "Sos",
    description: "Ocena smaku i jakości sosu",
    weight: 0.5,
  }
];

export const dishAttributeData: DishAttribute[] = [
  {
    dish_id: 1,
    attribute_id: 1,
  },
  {
    dish_id: 1,
    attribute_id: 2,
  },
];