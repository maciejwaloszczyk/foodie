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
          <main className="w-full px-4 lg:w-8/12">
            <RestaurantCard restaurant={restaurant} />
          </main>

          <aside className="w-full px-4 lg:w-4/12">
            {/* make sidebar sticky on large screens, spaced blocks, responsive paddings */}
            <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">

              <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="mb-3 text-lg font-semibold">Zdjęcia</h3>
                <p className="text-sm text-gray-600">Brak dodatkowych zdjęć dla tej restauracji.</p>
              </div>

              {/* optional: Menu block placeholder — will be rendered only if menu data exists */}
              <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="mb-3 text-lg font-semibold">Menu</h3>
                <p className="text-sm text-gray-600">Jeśli menu jest dostępne, pojawi się tutaj link lub miniatury zdjęć.</p>
              </div>


              <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
                <h3 className="mb-3 text-lg font-semibold">Podobne restauracje</h3>
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {related.map((r) => (
                    <li key={r.id} className="py-3">
                      <Link
                        href={`/restaurant/${r.id}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-primary truncate">{r.name}</div>
                          <div className="text-xs text-gray-500 truncate">{r.cuisine}</div>
                        </div>

                        <div className="ml-3 flex items-center gap-2 shrink-0">
                          <span className="text-sm font-medium leading-none">{r.rating.toFixed(1)}</span>
                          <svg
                            className="w-3 h-3 text-yellow-400 translate-y-[-1px]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden
                          >
                            <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
                          </svg>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

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