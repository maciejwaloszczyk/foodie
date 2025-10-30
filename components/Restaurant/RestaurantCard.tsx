import Image from "next/image";
import { Restaurant } from "@/types/restaurant";

type Props = {
  restaurant: Restaurant;
};

function Header({ restaurant }: Props) {
  return (
    <header className="mb-4">
      <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-3">
        <span>{restaurant.name}</span>
        {restaurant.isPromoted && (
          <span title="Promowane" className="inline-flex items-center text-yellow-500 dark:text-yellow-400">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
            </svg>
          </span>
        )}
      </h1>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
        <span className="text-gray-800 dark:text-gray-200">{restaurant.cuisine}</span>
        <span className="text-gray-800 dark:text-gray-200">•</span>
        <span className="text-gray-800 dark:text-gray-200">{restaurant.priceRange}</span>
        <span className="text-gray-800 dark:text-gray-200">•</span>
        <span className="text-gray-800 dark:text-gray-200">{restaurant.deliveryTime}</span>
        {restaurant.isPromoted && (
          <>
            <span className="text-gray-800 dark:text-gray-200">•</span>
            <span className="text-gray-800 dark:text-gray-200">Promowane</span>
          </>
        )}
      </div>
    </header>
  );
}

function ImageBlock({ restaurant }: Props) {
  const imageSrc = restaurant.image ? restaurant.image : "/images/blog/image-placeholder.jpg";
  const imageAlt = restaurant.image == "" ? "Brak zdjęcia restauracji" : restaurant.name;

  return (
    <div className="w-full h-96 relative mb-6 rounded overflow-hidden">
      <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: "cover" }} />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const max = 5;
  const filledColor = "oklch(62.3% 0.214 259.815)"; // blue-500
  const emptyColor = "oklch(70.7% 0.022 261.325)"; // gray-400
  const uid = Math.random().toString(36).slice(2, 9);
  const pathD =
    "M12 .587l3.668 7.431L23.6 9.75l-5.4 5.264L19.335 24 12 19.897 4.665 24l1.135-8.986L.4 9.75l7.932-1.732z";

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          let fillValue = 0;
          if (i < full) fillValue = 1;
          else if (i === full && hasHalf) fillValue = 0.5;
          const percent = Math.round(fillValue * 100);
          const gradId = `grad-${uid}-${i}`;

          return (
            <svg key={i} className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
              <defs>
                <linearGradient id={gradId} x1="0" x2="1" gradientUnits="objectBoundingBox">
                  <stop offset={`${percent}%`} stopColor={filledColor} />
                  <stop offset={`${percent}%`} stopColor={emptyColor} />
                </linearGradient>
              </defs>
              <path d={pathD} fill={`url(#${gradId})`} />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rating.toFixed(1)}</span>
    </div>
  );
}

function mapSearchUrl(restaurant: Restaurant) {
  if (restaurant.location?.lat && restaurant.location?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${restaurant.location.lat},${restaurant.location.lng}`;
  }
  if (restaurant.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`;
  }
  return "https://www.google.com/maps";
}

function QuickFacts({ restaurant }: Props) {
  return (      
    <div className="flex flex-wrap items-center justify-start gap-6 mb-6">
        {/* Ocena + gwiazdki */}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <div className="font-bold text-gray-900 dark:text-gray-100">Ocena</div>
          <div className="mt-1 flex items-center gap-1">
            <Stars rating={restaurant.rating} />
            <span className="text-sm text-gray-600 dark:text-gray-400">({restaurant.reviewCount})</span>
          </div>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300">
          <div className="font-bold text-gray-900 dark:text-gray-100">Kuchnia</div>
          <div className="mt-1 text-gray-800 dark:text-gray-200">{restaurant.cuisine}</div>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-300">
          <div className="font-bold text-gray-900 dark:text-gray-100">Czas dostawy</div>
          <div className="mt-1 text-gray-800 dark:text-gray-200">{restaurant.deliveryTime}</div>
        </div>
    </div>
    );
  }

function Description({ restaurant }: Props) {
  return (
    <div>
      <strong className="text-2xl text-gray-900 dark:text-gray-100 block mb-3">Opis lokalu</strong>
      <p className="mb-6 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
        {restaurant.description ?? "Brak opisu."}
      </p>
    </div>
  );
}

function LocationInfo({ restaurant }: Props) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-4">
      <div className="flex items-center gap-4 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">Adres</div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">{restaurant.address ?? "—"}</div>
        </div>
        <a
          href={mapSearchUrl(restaurant)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l3 7h7l-5.6 4 2 7L12 16l-6.4 4 2-7L2 9h7z" />
          </svg>
          Pokaż na mapie
        </a>
      </div>

      <div className="flex items-center gap-4 rounded-lg bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z" />
        </svg>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Odległość</div>
          <div className="text-base font-medium text-gray-900 dark:text-gray-100">{restaurant.distance ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}

function InfoColumn({ restaurant }: Props) {
  return (
    <div>
      {/* szybkie fakty (ocena, kuchnia, czas) */}
      <QuickFacts restaurant={restaurant} />

      <hr className="border-gray-700 my-6" /> 

      {/* krótki opis poniżej szybkich faktów */}
      <Description restaurant={restaurant} />

      {/* wyeksponowany adres + odległość z przyciskiem "Pokaż na mapie" */}
      <LocationInfo restaurant={restaurant} />
    </div>
  );
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <article className="container pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Header restaurant={restaurant} />
          <ImageBlock restaurant={restaurant} />
          <InfoColumn restaurant={restaurant} />
        </div>
      </div>
    </article>
  );
}