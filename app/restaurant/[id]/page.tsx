import Link from "next/link";
import { notFound } from "next/navigation";
import restaurantData from "@/components/Restaurant/restaurantData";
import { Restaurant } from "@/types/restaurant";
import RestaurantCard from "@/components/Restaurant/RestaurantCard";

type Props = { params: { id: string } };

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  const restaurant: Restaurant | undefined = restaurantData.find(
    (restaurant) => restaurant.id === numericId
  );

  if (!restaurant) return notFound();

  // TODO : Fetch related restaurants based on cuisine or location
  const related = restaurantData.filter((r) => r.id !== numericId).slice(0, 4);

  return (
    <section className="overflow-hidden pb-[120px] pt-[120px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-8/12">
            {/* main content: restaurant details */}
            <RestaurantCard restaurant={restaurant} />
          </div>

          <aside className="w-full px-4 lg:w-4/12">
            {/* simple sidebar */}
            <div className="mb-8 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
              <h3 className="mb-4 text-lg font-semibold">Podobne restauracje</h3>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/restaurant/${r.id}`} className="text-sm text-primary">
                      {r.name}
                    </Link>
                    <span className="text-sm mx-1 inline-flex items-center gap-1">
                      - <span className="font-medium leading-none">{r.rating.toFixed(1)}</span>
                      <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
                      </svg>
                    </span>
                    <div className="text-xs text-gray-500">{r.cuisine}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
              <h3 className="mb-4 text-lg font-semibold">Zdjęcia</h3>
              <p className="text-sm text-gray-600">
                Brak dodatkowych zdjęć dla tej restauracji.
              </p>
            </div>
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