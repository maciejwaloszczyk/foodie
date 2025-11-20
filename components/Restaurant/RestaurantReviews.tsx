"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useState, useEffect } from "react";
import { Restaurant } from "@/types/restaurant";
import { Review } from "@/types/review";

// data imports used to resolve names/attributes for rendering reviews
import { dishData } from "./data/dishData";
import { userData } from "./data/userData";
import { reviewData, reviewDetailsData } from "./data/reviewData";
import { attributeData } from "./data/attributeData";
import type { Dish } from "@/types/dish";

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

function Header({ restaurant }: { restaurant: Restaurant }) {
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

function ReviewForm({
  selectedDishId,
  setSelectedDishId,
  dishes,
  onAdd,
}: {
  selectedDishId: number | "all";
  setSelectedDishId: (v: number | "all") => void;
  dishes: Dish[];
  onAdd?: () => void;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const [name, setName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [attrRatings, setAttrRatings] = useState<Record<number, number>>({});

  const selectedDish = selectedDishId === "all" ? null : dishData.find((d) => d.id === selectedDishId);

  useEffect(() => {
    if (selectedDish) {
      const init: Record<number, number> = {};
      (selectedDish.dish_attributes ?? []).forEach((attrId) => {
        init[attrId] = 8;
      });
      setAttrRatings(init);
    } else {
      setAttrRatings({});
    }
  }, [selectedDishId]);

  if (loading) {
    return <div className="mb-6 p-4 text-sm text-gray-600 dark:text-gray-400">Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mb-6 rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-3">Dodaj opinię</h2>
        <p className="text-sm italic text-gray-700 dark:text-gray-300">
          Aby dodać opinię, musisz być{" "}
          <Link href="/signin" className="text-primary underline">
            zalogowany
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleAdd = () => {
    if (!selectedDish) return;

    // require authenticated user object
    if (!user) {
      console.warn("Brak zalogowanego użytkownika przy dodawaniu opinii.");
      return;
    }

    // generate new review id
    const maxReviewId = reviewData.reduce((m, r) => (r.id > m ? r.id : m), 0);
    const newReviewId = maxReviewId + 1;

    // generate new review detail ids and push details
    const maxDetailId = reviewDetailsData.reduce((m, d) => (d.id > m ? d.id : m), 100);
    let nextDetailId = maxDetailId + 1;
    const newDetailIds: number[] = [];

    const ratingsArr = Object.entries(attrRatings).map(([attrIdStr, v]) => {
      const attrId = Number(attrIdStr);
      const detail = { id: nextDetailId++, rating: Number(v), review_id: newReviewId, attribute_id: attrId };
      reviewDetailsData.push(detail);
      newDetailIds.push(detail.id);
      return detail.rating;
    });

    // compute overall_rating (integer 1..10) as average of attribute ratings
    const overall = ratingsArr.length > 0 ? Math.round(ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length) : 0;

    const newReview = {
      id: newReviewId,
      comment,
      overall_rating: overall,
      user_id: user.id,
      dish_id: selectedDish.id,
      review_details: newDetailIds,
    };

    // push into reviewData
    reviewData.push(newReview);

    // update dish's reviews array and recalc dish.rating
    const dishObj = dishData.find((d) => d.id === selectedDish.id);
    if (dishObj) {
      dishObj.reviews = Array.isArray(dishObj.reviews) ? [...dishObj.reviews, newReviewId] : [newReviewId];

      // recalc rating: detect scale and compute avg in 1..5
      const values = reviewData.filter((r) => r.dish_id === dishObj.id).map((r) => r.overall_rating ?? 0).filter((v) => v > 0);
      const maxVal = values.length ? Math.max(...values) : 0;
      const scaled = values.map((v) => (maxVal > 5 ? v / 2 : v));
      const avg = scaled.length ? Math.round((scaled.reduce((a, b) => a + b, 0) / scaled.length) * 10) / 10 : 0;
      dishObj.rating = avg;
    }

    // add review id to demo user (user id 1) if exists
    const userObj = userData.find((u) => u.id === user.id);
    if (userObj) {
      userObj.reviews = Array.isArray(userObj.reviews) ? [...userObj.reviews, newReviewId] : [newReviewId];
    } else {
      // jeśli brak użytkownika w lokalnym userData, dodajemy wpis (minimalny)
      userData.push({ id: user.id, username: (user.username as string) ?? "user", reviews: [newReviewId] });
    }

    // clear form
    setAttrRatings({});
    setComment("");
    setName("");

    // notify parent to re-render if provided
    if (onAdd) onAdd();
  };

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Dodaj opinię</h2>

      {/* select for choosing which dish user will rate - moved under the "Dodaj opinię" header */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 font-semibold dark:text-gray-300 mb-2">Wybierz danie do oceny:</label>
        <select
          value={selectedDishId}
          onChange={(e) => setSelectedDishId(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">— Wybierz danie —</option>
          {dishes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {/* If no dish selected, instruct user and hide attribute sliders */}
        {!selectedDish ? (
          <div className="rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
            Wybierz danie z menu powyżej, aby ocenić jego atrybuty i dodać opinię.
          </div>
        ) : (
          <>
            {/* dynamic attribute sliders for the selected dish */}
            {(selectedDish.dish_attributes ?? []).map((attrId) => {
              const attr = attributeData.find((a) => a.id === attrId);
              return (
                <div key={attrId}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{attr?.name}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={attrRatings[attrId] ?? 8}
                      onChange={(e) =>
                        setAttrRatings((prev) => ({ ...prev, [attrId]: Number(e.target.value) }))
                      }
                      className="w-full accent-blue-600"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      value={attrRatings[attrId] ?? 8}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v)) setAttrRatings((prev) => ({ ...prev, [attrId]: Math.max(1, Math.min(10, v)) }));
                      }}
                      className="w-16 rounded-md border border-gray-200 px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Name + comment */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="sm:col-span-6">
            <label className="block text-xs text-white mb-1">Treść opinii</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Napisz, co Ci się podobało / nie podobało..."
            />
          </div>

          <div className="sm:col-span-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setAttrRatings({});
                setName("");
                setComment("");
              }}
              className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
            >
              Wyczyść
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              // disable submit until a dish is selected
              disabled={!selectedDish}
            >
              Dodaj opinię
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ rev }: { rev: any }) {
  const auth = useAuth();
  const authUser = auth?.user;

  // first try to resolve from local userData, fallback to auth user if ids match
  let user = userData.find((u) => u.id === rev.user_id) as any | undefined;
  if (!user && authUser && authUser.id === rev.user_id) {
    user = { id: authUser.id, username: (authUser.username as string) ?? "user", reviews: [] };
  }

  const dish = dishData.find((d) => d.id === rev.dish_id);

  const details = (rev.review_details ?? [])
    .map((id: number) => reviewDetailsData.find((rd) => rd.id === id))
    .filter(Boolean) as any[];

  const getBadgeClasses = (value: number) => {
    if (value <= 3) return "bg-red-500 text-white";
    else if (value <= 6) return "bg-amber-400 text-white";
    return "bg-emerald-500 text-white";
  };

  return (
    <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      {/* HEADER: username and overall rating */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {user?.username ?? "Anonim"}
            </div>

            {/* ocena ogólna pod nazwą użytkownika */}
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={rev.overall_rating ?? 0} />
            </div>
          </div>

          <div className="text-sm text-gray-500" />
        </div>
      </div>

      {/* DESCRIPTION + Produkt (produkt przeniesiony tutaj ponad opis) */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="text-sm text-gray-500 mb-2">
          Danie: <span className="font-semibold text-gray-800 dark:text-gray-200">{dish?.name ?? "—"}</span>
        </div>
        <p className="text-gray-800 dark:text-gray-200 text-base whitespace-pre-line font-medium">{rev.comment}</p>
      </div>

      {/* ATTRIBUTES */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900">
        <div className="text-xs text-gray-500 mb-2">Oceny atrybutów</div>
        <div className="space-y-2">
          {details.length > 0 ? (
            details.map((d) => {
              const attr = attributeData.find((a) => a.id === d.attribute_id);
              return (
                <div key={d.id} className="flex items-center gap-3 text-sm text-gray-700 font-medium dark:text-gray-300">
                  <span
                    title={`${d.rating}/10`}
                    className={`inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-semibold ${getBadgeClasses(d.rating)}`}
                  >
                    {d.rating}
                  </span>
                  <div>{attr?.name ?? `Atrybut ${d.attribute_id}`}</div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-gray-500">Brak ocen atrybutów dla tej opinii.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RestaurantReviews({ restaurant }: Props) {
  const rest = restaurant as any;

  const restaurantReviewIds: number[] = rest.reviews ?? [];
  const restaurantDishIds: number[] = rest.dishes ?? [];

  // NEW: two separate selects
  // selectedDishFilter = which dish's reviews are shown in the list
  const [selectedDishFilter, setSelectedDishFilter] = useState<number | "all">("all");
  // selectedDishToRate = which dish is chosen in the "Dodaj opinię" form
  const [selectedDishToRate, setSelectedDishToRate] = useState<number | "all">("all");

  // version bump to force re-render after adding a review
  const [version, setVersion] = useState(0);

  // all dishes objects for this restaurant
  const dishesForRestaurant = dishData.filter((d) => restaurantDishIds.includes(d.id));

  // base reviews derived from restaurant (unchanged logic)
  let baseReviews: Review[] = [];
  if (restaurantReviewIds.length > 0) {
    baseReviews = reviewData.filter((r) => restaurantReviewIds.includes(r.id));
  } else if (restaurantDishIds.length > 0) {
    baseReviews = reviewData.filter((r) => restaurantDishIds.includes(r.dish_id));
  } else {
    baseReviews = [];
  }

  // currently selected dish for review-filtering (null = wszystkie)
  const selectedDish = selectedDishFilter === "all" ? null : dishesForRestaurant.find((d) => d.id === selectedDishFilter);

  // apply dish filter for reviews (shows all when "all")
  const reviewsToShow = selectedDishFilter === "all" ? baseReviews : baseReviews.filter((r) => r.dish_id === selectedDishFilter);

  return (
    <article className="bg-white dark:bg-gray-900 rounded-md p-4 sm:p-6 shadow-sm">
      <Header restaurant={restaurant} />

      <hr className="border-gray-700 my-6" />

      <ReviewForm
        selectedDishId={selectedDishToRate}
        setSelectedDishId={setSelectedDishToRate}
        dishes={dishesForRestaurant}
        onAdd={() => setVersion((v) => v + 1)}
      />

      <hr className="border-gray-700 my-6" />

      <section>
        <h2 className="text-lg font-semibold mb-4">Opinie użytkowników</h2>

        {/* NEW: filter menu — wybór dania */}
        <div className="mb-4">
          <label className="block text-sm text-gray-600 font-semibold dark:text-gray-300 mb-2">Filtruj po daniu:</label>
          <select
            value={selectedDishFilter}
            onChange={(e) => setSelectedDishFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">— Wszystkie dania —</option>
            {dishesForRestaurant.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Jeśli wybrano konkretne danie, pokaż jego zapisane rating (z dishData) */}
        {selectedDish ? (
          <div className="mb-4 flex items-center gap-2">
            <div className="text-sm text-gray-600 font-semibold dark:text-gray-300">Ocena dania:</div>
            <div className="flex items-center gap-2">
              <Stars rating={selectedDish.rating ?? 0} />
              <span className="text-sm text-gray-600 dark:text-gray-400">({reviewsToShow.length})</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2">
            <div className="text-sm text-gray-600 font-semibold dark:text-gray-300">Ocena restauracji:</div>
            <div className="flex items-center gap-2">
              <Stars rating={restaurant.rating ?? 0} />
              <span className="text-sm text-gray-600 dark:text-gray-400">({reviewsToShow.length})</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {reviewsToShow.length > 0 ? (
            reviewsToShow.map((rev: any) => <ReviewCard key={rev.id} rev={rev} />)
          ) : (
            <div className="text-sm text-gray-500">Brak opinii dla tego lokalu.</div>
          )}
        </div>
      </section>
    </article>
  );
}