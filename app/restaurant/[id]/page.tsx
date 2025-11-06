import { notFound } from "next/navigation";
import restaurantData from "@/components/Restaurant/data/restaurantData";
import { Restaurant } from "@/types/restaurant";
import RestaurantCard, { Sidebar } from "@/components/Restaurant/RestaurantCard";

type Props = { params: { id: string } };

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  const restaurant: Restaurant | undefined = restaurantData.find(
    (restaurant) => restaurant.id === numericId
  );

  if (!restaurant) return notFound();

  return (
    <section className="overflow-hidden pb-[120px] pt-[120px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <main className="w-full px-4 lg:w-8/12">
            <RestaurantCard restaurant={restaurant} />
          </main>

          <aside className="w-full px-4 lg:w-4/12">
            <Sidebar restaurant={restaurant} />
          </aside>
        </div>
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  return restaurantData.map((r) => ({
    id: String(r.id),
  }));
}