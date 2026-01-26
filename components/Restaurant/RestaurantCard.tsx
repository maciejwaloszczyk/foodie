import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/types/restaurant';
import { getRestaurants } from '@/lib/restaurants';

type Props = {
  restaurant: Restaurant;
};

function Header({ restaurant }: Props) {
  return (
    <header className="mb-4">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-3 min-w-0">
        <span className="truncate" title={restaurant.name}>
          {restaurant.name}
        </span>
        {restaurant.isPromoted && (
          <span title="Promowane" className="inline-flex items-center text-yellow-500 dark:text-yellow-400">
            <svg className="w-5 h-5 translate-y-[-1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
            </svg>
          </span>
        )}
      </h1>
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
        <span className="text-gray-800 dark:text-gray-200">{restaurant.cuisine}</span>
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
  const imageSrc = restaurant.image ?? '/images/blog/image-placeholder.jpg';
  const imageAlt = restaurant.image ? restaurant.name : 'Brak zdjęcia restauracji';

  return (
    <div className="w-full rounded overflow-hidden mb-6">
      <div className="relative w-full h-56 sm:h-72 md:h-96">
        <Image src={imageSrc} alt={imageAlt} fill priority quality={90} sizes="(max-width: 768px) 100vw, 1024px" className="object-cover" />
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const max = 5;
  const filledColor = '#2563EB'; // blue-600 — filled stars stay blue
  const emptyColor = '#BFDBFE'; // light blue / nearly empty
  const uid = Math.random().toString(36).slice(2, 9);
  const pathD = 'M12 .587l3.668 7.431L23.6 9.75l-5.4 5.264L19.335 24 12 19.897 4.665 24l1.135-8.986L.4 9.75l7.932-1.732z';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          let fillValue = 0;
          if (i < full) fillValue = 1;
          else if (i === full && hasHalf) fillValue = 0.5;
          const percent = Math.round(fillValue * 100); // 0,50,100
          const gradId = `grad-${uid}-${i}`;

          return (
            <svg key={i} className="w-4 h-4 md:w-5 md:h-5 translate-y-[-1px]" viewBox="0 0 24 24" aria-hidden>
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
  return 'https://www.google.com/maps';
}

function QuickFacts({ restaurant }: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-bold text-gray-900 dark:text-gray-100">Ocena ogólna</div>
          <div className="mt-1 flex items-center gap-2">
            <Stars rating={restaurant.rating} />
            <span className="text-sm text-gray-600 dark:text-gray-400">({restaurant.reviewCount})</span>
          </div>
        </div>

        {/*
        <div className="text-sm">
          <div className="font-bold text-gray-900 dark:text-gray-100">Kuchnia</div>
          <div className="mt-1 text-gray-800 dark:text-gray-200">{restaurant.cuisine}</div>
        </div>

        <div className="text-sm">
          <div className="font-bold text-gray-900 dark:text-gray-100">Czas dostawy</div>
          <div className="mt-1 text-gray-800 dark:text-gray-200">{restaurant.deliveryTime}</div>
        </div>
        */}
      </div>

      <div className="flex-shrink-0">
        <Link href={`/restaurant/${restaurant.id}/reviews`} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700" aria-label="Zobacz opinie / Dodaj opinię">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21 6.5a2.5 2.5 0 0 0-2.5-2.5H5.5A2.5 2.5 0 0 0 3 6.5v9A2.5 2.5 0 0 0 5.5 18H7l3 3 3-3h6.5A2.5 2.5 0 0 0 21 15.5v-9zM7 9h10v2H7V9zm0 3h7v2H7v-2z" />
          </svg>
          Opinie
        </Link>
      </div>
    </div>
  );
}

function Description({ restaurant }: Props) {
  return (
    <div className="mb-4">
      <strong className="text-lg md:text-2xl text-gray-900 dark:text-gray-100 block mb-2">Opis lokalu</strong>
      <p className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line text-sm md:text-base text-justify">{restaurant.description ?? 'Brak opisu.'}</p>
    </div>
  );
}

function LocationInfo({ restaurant }: Props) {
  return (
    <div className="mt-2 grid grid-cols-1 gap-3">
      <div className="flex items-start gap-3 rounded-lg bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <svg className="w-5 h-5 text-blue-500 mt-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
        </svg>

        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400">Adres</div>
          <div className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100 break-words">{restaurant.address ?? '—'}</div>
        </div>

        <a href={mapSearchUrl(restaurant)} target="_blank" rel="noopener noreferrer" className="ml-2 sm:ml-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l3 7h7l-5.6 4 2 7L12 16l-6.4 4 2-7L2 9h7z" />
          </svg>
          <span className="hidden md:inline">Pokaż na mapie</span>
        </a>
      </div>

      <div className="flex items-center gap-3 rounded-lg bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z" />
        </svg>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Odległość</div>
          <div className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">{restaurant.distance ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <article className="container px-4 md:px-0 pb-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Header restaurant={restaurant} />
            <ImageBlock restaurant={restaurant} />
            <div className="px-0 md:px-2">
              <QuickFacts restaurant={restaurant} />
              <hr className="border-gray-700 my-6" />
              <Description restaurant={restaurant} />
              <hr className="border-gray-700 my-6" />
              <LocationInfo restaurant={restaurant} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export async function Sidebar({ restaurant }: Props) {
  const parseDistanceKm = (d?: string | number) => {
    if (d === undefined || d === null) return Infinity;
    if (typeof d === 'number') return d;
    const num = parseFloat(String(d).replace(',', '.'));
    return Number.isFinite(num) ? num : Infinity;
  };

  try {
    const data = await getRestaurants();
    const restaurants = data.data || [];

    // Mapowanie danych z API
    const mappedRestaurants = restaurants.map((r: any) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine || 'Nieznana kuchnia',
      distance: r.distance || '—',
      rating: r.avg_rating || 0,
    }));

    const sameCuisine = mappedRestaurants
      .filter((r: any) => r.id !== restaurant.id && r.cuisine === restaurant.cuisine)
      .map((r: any) => ({ r, dist: parseDistanceKm(r.distance) }))
      .sort((a: any, b: any) => a.dist - b.dist)
      .map(({ r }: any) => r);

    const others = mappedRestaurants
      .filter((r: any) => r.id !== restaurant.id && r.cuisine !== restaurant.cuisine)
      .map((r: any) => ({ r, dist: parseDistanceKm(r.distance) }))
      .sort((a: any, b: any) => a.dist - b.dist)
      .map(({ r }: any) => r);

    const related = [...sameCuisine, ...others].slice(0, 4);

    return (
      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="mb-3 text-lg font-semibold">Zdjęcia</h3>
          <p className="text-sm text-gray-600">Brak dodatkowych zdjęć dla tej restauracji.</p>
        </div>

        <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="mb-3 text-lg font-semibold">Menu</h3>
          <p className="text-sm text-gray-600">Jeśli menu jest dostępne, pojawi się tutaj link lub miniatury zdjęć.</p>
        </div>

        <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="mb-3 text-lg font-semibold">Podobne restauracje</h3>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {related.map((r: any) => (
              <li key={r.id} className="py-3">
                <Link href={`/restaurant/${r.id}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-primary truncate">{r.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {r.cuisine} • {r.distance}
                    </div>
                  </div>

                  <div className="ml-3 flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium leading-none">{r.rating.toFixed(1)}</span>
                    <svg className="w-3 h-3 text-yellow-400 translate-y-[-1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch related restaurants:', error);
    return (
      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm bg-white p-4 sm:p-6 shadow-three dark:bg-gray-dark dark:shadow-none">
          <h3 className="mb-3 text-lg font-semibold">Podobne restauracje</h3>
          <p className="text-sm text-gray-600">Nie udało się załadować podobnych restauracji.</p>
        </div>
      </div>
    );
  }
}
