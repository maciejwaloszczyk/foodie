import Image from "next/image";
import { Restaurant } from "@/types/restaurant";

type Props = {
  restaurant: Restaurant;
};

const RestaurantDetails = ({ restaurant }: Props) => {
  return (
    <article className="container pt-24 pb-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold mb-2">{restaurant.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>{restaurant.cuisine}</span>
          <span>•</span>
          <span>{restaurant.priceRange}</span>
          <span>•</span>
          <span>{restaurant.deliveryTime}</span>
        </div>
      </header>

      {restaurant.image && (
        <div className="w-full max-w-4xl h-72 relative mb-6 rounded overflow-hidden">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            style={{ objectFit: "cover" }}
            className="rounded"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <p className="mb-4 text-gray-700">{restaurant.description ?? "Brak opisu."}</p>

          <div className="mb-4 text-sm text-gray-700">
            Ocena: {restaurant.rating} ({restaurant.reviewCount})
          </div>
        </div>

        <aside className="prose-sm text-sm text-gray-600">
          <div className="mb-3">
            <strong>Adres</strong>
            <div>{restaurant.address ?? "—"}</div>
          </div>

          <div className="mb-3">
            <strong>Odległość</strong>
            <div>{restaurant.distance ?? "—"}</div>
          </div>

          {restaurant.location && (
            <div className="mb-3">
              <strong>Współrzędne</strong>
              <div>
                {restaurant.location.lat}, {restaurant.location.lng}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
};

export default RestaurantDetails;