import { notFound } from "next/navigation";
import restaurantData from "@/components/Restaurant/restaurantData";
import { Restaurant } from "@/types/restaurant";
import RestaurantCard from "@/components/Restaurant/RestaurantCard";

type Props = { params: { id: string } };

export default async function RestaurantPage({ params }: Props) {

  const { id } = await params;
  const numericId = Number(id);

  const restaurant: Restaurant | undefined = restaurantData.find((restaurant) => restaurant.id === numericId);

  if (!restaurant) return notFound();

  return (
    <main style={{ padding: 20 }}>
      <RestaurantCard restaurant={restaurant} />
    </main>
  );
}

export async function generateStaticParams() {
  return restaurantData.map((r) => ({
    id: String(r.id),
  }));
}