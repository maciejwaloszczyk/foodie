"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { Restaurant } from "@/types/restaurant";

type Props = {
  restaurant: Restaurant;
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const max = 5;
  const filledColor = "#2563EB"; // blue-600 — filled stars stay blue
  const emptyColor = "#BFDBFE"; // light blue / nearly empty
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

function Header({ restaurant, count }: { restaurant: Restaurant; count: number }) {
  return (
    <header className="mb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-3">
          <span>{restaurant.name}</span>
          {restaurant.isPromoted && (
            <span title="Promowane" className="inline-flex items-center text-yellow-500 dark:text-yellow-400">
              <svg className="w-5 h-5 translate-y-[-1px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
              </svg>
            </span>
          )}
        </h1>

        <Link href={`/restaurant/${restaurant.id}`} className="text-sm text-primary underline">
          Powrót do lokalu
        </Link>
      </div>

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

      {/* Ocena ogólna pod informacjami */}
      <div className="mt-3">
        <div className="mt-1 flex items-center gap-2">
          <Stars rating={restaurant.rating} />
          <span className="text-sm text-gray-600 dark:text-gray-400">({restaurant.reviewCount})</span>
        </div>
      </div>
    </header>
  );
}

/*
  ReviewForm is client-side and checks auth using useAuth.
  Kept inside the same file as requested.
*/
function ReviewForm() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="mb-6 p-4 text-sm text-gray-600 dark:text-gray-400">Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mb-6 rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-3">Dodaj opinię</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Musisz się{" "}
          <Link href="/signin" className="text-primary underline">
            zalogować
          </Link>
          , aby dodać opinię.
        </p>
      </div>
    );
  }

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Dodaj opinię</h2>
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Twoje imię</label>
          <input className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Imię" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Ocena</label>
          <div className="inline-flex items-center gap-1">
            {[5, 4, 3, 2, 1].map((s) => (
              <button key={s} type="button" className="p-1" aria-label={`${s} gwiazdek`}>
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 flex items-end justify-end">
          <div className="text-xs text-gray-500">Polecam podać rzetelną ocenę i krótki opis.</div>
        </div>

        <div className="sm:col-span-6">
          <label className="block text-xs text-gray-500 mb-1">Treść opinii</label>
          <textarea className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Napisz, co Ci się podobało / nie podobało..." />
        </div>

        <div className="sm:col-span-6 flex justify-end gap-3">
          <button className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">Anuluj</button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">Dodaj opinię</button>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ rev }: { rev: any }) {
  const full = Math.floor(rev.rating || 0);
  const half = rev.rating - full >= 0.5;

  return (
    <div className="rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{rev.author}</div>
            <div className="text-xs text-gray-500">{rev.date}</div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < full || (i === full && half);
                return (
                  <svg key={i} className={`w-4 h-4 ${filled ? "text-blue-600" : "text-gray-300"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 .587l3.668 7.431 8.232 1.732-5.4 5.264 1.274 8.986L12 19.897 4.226 24l1.274-8.986L.1 9.75l8.232-1.732z" />
                  </svg>
                );
              })}
            </div>
            <div className="text-xs text-gray-500"> {rev.rating?.toFixed(1)}</div>
          </div>
        </div>

        <div className="text-sm text-gray-500" />
      </div>

      <p className="mt-3 text-gray-800 dark:text-gray-200 whitespace-pre-line">{rev.text}</p>
    </div>
  );
}

export default function RestaurantReviews({ restaurant }: Props) {
  const reviews = (restaurant as any).reviews ?? [
    { id: "r1", author: "Agnieszka", rating: 4.5, date: "2025-10-05", text: "Świetne miejsce, polecam pizzę. Obsługa miła, szybka dostawa." },
    { id: "r2", author: "Tomek", rating: 3.0, date: "2025-09-20", text: "Dobre jedzenie, ale trochę zimne przy dostawie." },
  ];

  return (
    <article className="bg-white dark:bg-gray-900 rounded-md p-4 sm:p-6 shadow-sm">
      <Header restaurant={restaurant} count={reviews.length} />

      <hr className="border-gray-700 my-6" />

      <ReviewForm />

      <hr className="border-gray-700 my-6" />

      <section>
        <h2 className="text-lg font-semibold mb-4">Opinie użytkowników</h2>
        <div className="space-y-4">
          {reviews.map((rev: any) => (
            <ReviewCard key={rev.id} rev={rev} />
          ))}
        </div>
      </section>
    </article>
  );
}