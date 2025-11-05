import { notFound } from "next/navigation";
import restaurantData from "@/components/Restaurant/restaurantData";
import { Restaurant } from "@/types/restaurant";
import RestaurantReviews from "@/components/Restaurant/RestaurantReviews";

type Props = { params: { id: string } };

export default async function RestaurantReviewsPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  const restaurant: Restaurant | undefined = restaurantData.find(
    (r) => r.id === numericId
  );

  if (!restaurant) return notFound();

  return (
    <section className="overflow-hidden pt-12 pb-12 md:pt-[120px] md:pb-[120px]">
      <div className="container">
        <div className="flex flex-col lg:flex-row -mx-4">
          <main className="w-full px-4 lg:pr-6 order-1">
            <RestaurantReviews restaurant={restaurant} />
          </main>
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