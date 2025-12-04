'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Review } from '@/types/review';

// data imports used to resolve names/attributes for rendering reviews
import { dishData } from './data/dishData';
import { userData } from './data/userData';
import { reviewData, reviewDetailsData } from './data/reviewData';
import { attributeData } from './data/attributeData';
import type { Dish } from '@/types/dish';

type Props = {
  restaurant: Restaurant;
};

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

function ReviewForm({ selectedDishId, setSelectedDishId, dishes, onAdd, onOpenEdit }: { selectedDishId: number | 'all'; setSelectedDishId: (v: number | 'all') => void; dishes: Dish[]; onAdd?: () => void; onOpenEdit?: (reviewId: number) => void }) {
  const { isAuthenticated, loading, user, token } = useAuth();
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [attrRatings, setAttrRatings] = useState<Record<number, number | string>>({});
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateTargetId, setDuplicateTargetId] = useState<number | null>(null);

  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [submissionError, setSubmissionError] = useState<string | null>(null);

  const selectedDish = selectedDishId === 'all' ? null : dishData.find((d) => d.id === selectedDishId);

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
          Aby dodać opinię, musisz być{' '}
          <Link href="/signin" className="text-primary underline">
            zalogowany
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!selectedDish) return;

    if (!user) {
      console.warn('Brak zalogowanego użytkownika przy dodawaniu opinii.');
      return;
    }

    // prevent same user from adding multiple reviews for the same dish
    const existingReview = reviewData.find((r) => r.dish_id === selectedDish.id && r.user_id === user.id);
    if (existingReview) {
      setDuplicateTargetId(existingReview.id);
      setShowDuplicatePopup(true);
      return;
    }

    // // generate new review id
    const maxReviewId = reviewData.reduce((m, r) => (r.id > m ? r.id : m), 0);
    const newReviewId = maxReviewId + 1;

    // // generate new review detail ids and push details
    const maxDetailId = reviewDetailsData.reduce((m, d) => (d.id > m ? d.id : m), 100);
    let nextDetailId = maxDetailId + 1;
    const newDetailIds: number[] = [];

    // build weighted list of attribute ratings (and persist review detail records)
    const weightedItems: { rating: number; weight: number }[] = [];
    Object.entries(attrRatings).forEach(([attrIdStr, v]) => {
      const attrId = Number(attrIdStr);
      const attr = attributeData.find((a) => a.id === attrId);
      const weight = attr?.weight ?? 1;
      const ratingValRaw = Number(v as any);
      const ratingVal = Number.isNaN(ratingValRaw) ? 8 : Math.max(1, Math.min(10, ratingValRaw));
      const detail = { id: nextDetailId++, rating: ratingVal, review_id: newReviewId, attribute_id: attrId };
      reviewDetailsData.push(detail);
      newDetailIds.push(detail.id);
      weightedItems.push({ rating: ratingVal, weight });
    });

    // compute overall_rating scaled to 1..5 using weighted average of attributes (attributes rated 1..10)
    const totalWeight = weightedItems.reduce((s, it) => s + it.weight, 0);
    const weightedSum = weightedItems.reduce((s, it) => s + it.rating * it.weight, 0);
    const avgOn10 = totalWeight > 0 ? weightedSum / totalWeight : 0;
    // normalize to 1..5 scale and round to one decimal
    const overall = avgOn10 > 0 ? Math.round((avgOn10 / 2) * 10) / 10 : 0;

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

      // recalc dish rating as average of stored overall_rating values (assumed 1..5 scale)
      const values = reviewData
        .filter((r) => r.dish_id === dishObj.id)
        .map((r) => r.overall_rating ?? 0)
        .filter((v) => v > 0);
      const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
      dishObj.rating = avg;
    }

    // add review id to demo user (user id 1) if exists
    const userObj = userData.find((u) => u.id === user.id);
    if (userObj) {
      userObj.reviews = Array.isArray(userObj.reviews) ? [...userObj.reviews, newReviewId] : [newReviewId];
    } else {
      // jeśli brak użytkownika w lokalnym userData, dodajemy wpis (minimalny)
      userData.push({ id: user.id, username: (user.username as string) ?? 'user', reviews: [newReviewId] });
    }

    setAttrRatings({});
    setComment('');
    setName('');
    setSelectedDishId('all');
    if (onAdd) onAdd();
  };

  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Dodaj opinię</h2>

      {/* select for choosing which dish user will rate - moved under the "Dodaj opinię" header */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 font-semibold dark:text-gray-300 mb-2">Wybierz danie do oceny:</label>
        <select value={selectedDishId} onChange={(e) => setSelectedDishId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
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
          <div className="rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">Wybierz danie z menu powyżej, aby ocenić jego atrybuty i dodać opinię.</div>
        ) : (
          <>
            {/* dynamic attribute sliders for the selected dish */}
            {(selectedDish.dish_attributes ?? []).map((attrId) => {
              const attr = attributeData.find((a) => a.id === attrId);
              return (
                <div key={attrId}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{attr?.name}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={10} step={1} value={Number(attrRatings[attrId] ?? 8)} onChange={(e) => setAttrRatings((prev) => ({ ...prev, [attrId]: Number(e.target.value) }))} className="w-full accent-blue-600" />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      value={attrRatings[attrId] === '' ? '' : (attrRatings[attrId] ?? 8)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          setAttrRatings((prev) => ({ ...prev, [attrId]: '' }));
                          return;
                        }
                        const v = Number(raw);
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

        {/* Name + comment - only visible when a dish is selected */}
        {selectedDish ? (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs text-white mb-1">Treść opinii</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Napisz, co Ci się podobało / nie podobało..." />
            </div>

            <div className="sm:col-span-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAttrRatings({});
                  setName('');
                  setComment('');
                }}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
              >
                Wyczyść
              </button>
              <button type="button" onClick={handleAdd} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                Dodaj opinię
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* success is handled globally by parent */}

      {showDuplicatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Nie można dodać opinii</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Nie możesz dodać kilku opinii dla tego samego dania. Edytuj swoją istniejącą opinię zamiast dodawać nową.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDuplicatePopup(false)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                OK
              </button>
              {onOpenEdit && duplicateTargetId && (
                <button
                  onClick={() => {
                    onOpenEdit(duplicateTargetId as number);
                    setShowDuplicatePopup(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edytuj opinię
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewCard({ rev, onModify, editOpen, onCloseEdit }: { rev: any; onModify?: (opts?: { showSuccess?: boolean; action?: 'add' | 'edit' | 'delete' }) => void; editOpen?: boolean; onCloseEdit?: () => void }) {
  const auth = useAuth();
  const authUser = auth?.user;
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState<string>(rev.comment ?? '');
  const [editDetailsMap, setEditDetailsMap] = useState<Record<number, number>>({});

  // first try to resolve from local userData, fallback to auth user if ids match
  let user = userData.find((u) => u.id === rev.user_id) as any | undefined;
  if (!user && authUser && authUser.id === rev.user_id) {
    user = { id: authUser.id, username: (authUser.username as string) ?? 'user', reviews: [] };
  }

  const dish = dishData.find((d) => d.id === rev.dish_id);

  const details = (rev.review_details ?? []).map((id: number) => reviewDetailsData.find((rd) => rd.id === id)).filter(Boolean) as any[];

  // populate edit map when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const map: Record<number, number> = {};
      details.forEach((d) => {
        if (d) map[d.attribute_id] = d.rating;
      });
      setEditDetailsMap(map);
      setEditComment(rev.comment ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // open editor when parent requests it
  useEffect(() => {
    if (editOpen) setIsEditing(true);
  }, [editOpen]);

  const getBadgeClasses = (value: number) => {
    if (value <= 3) return 'bg-red-500 text-white';
    else if (value <= 6) return 'bg-amber-400 text-white';
    return 'bg-emerald-500 text-white';
  };

  return (
    <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      {/* HEADER: username and overall rating */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{user?.username ?? 'Anonim'}</div>

            {/* ocena ogólna pod nazwą użytkownika */}
            <div className="mt-2 flex items-center gap-3">
              <Stars rating={rev.overall_rating ?? 0} />
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {authUser && authUser.id === rev.user_id && (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(true)} className="text-xs text-primary underline">
                  Edytuj
                </button>
                <button
                  onClick={() => {
                    // delete flow
                    if (!confirm('Czy na pewno chcesz usunąć tę opinię?')) return;
                    // remove review from reviewData
                    const idx = reviewData.findIndex((r) => r.id === rev.id);
                    if (idx !== -1) reviewData.splice(idx, 1);
                    // remove review details
                    for (let i = reviewDetailsData.length - 1; i >= 0; i--) {
                      if (reviewDetailsData[i].review_id === rev.id) reviewDetailsData.splice(i, 1);
                    }
                    // remove from dish.reviews and recalc dish.rating
                    const dishObj = dishData.find((d) => d.id === rev.dish_id);
                    if (dishObj) {
                      dishObj.reviews = Array.isArray(dishObj.reviews) ? dishObj.reviews.filter((id) => id !== rev.id) : [];
                      const values = reviewData
                        .filter((r) => r.dish_id === dishObj.id)
                        .map((r) => r.overall_rating ?? 0)
                        .filter((v) => v > 0);
                      dishObj.rating = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
                    }
                    // remove from userData
                    const u = userData.find((uu) => uu.id === rev.user_id);
                    if (u) u.reviews = Array.isArray(u.reviews) ? u.reviews.filter((id) => id !== rev.id) : [];
                    if (onModify) onModify({ showSuccess: true, action: 'delete' });
                    if (onCloseEdit) onCloseEdit();
                  }}
                  className="text-xs text-red-600 underline"
                >
                  Usuń
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESCRIPTION + Produkt (produkt przeniesiony tutaj ponad opis) */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="text-sm text-gray-500 mb-2">
          Danie: <span className="font-semibold text-gray-800 dark:text-gray-200">{dish?.name ?? '—'}</span>
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
                  <span title={`${d.rating}/10`} className={`inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-semibold ${getBadgeClasses(d.rating)}`}>
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

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Edytuj opinię</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treść opinii</label>
                <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Oceny atrybutów</div>
                <div className="space-y-3">
                  {Object.keys(editDetailsMap).length > 0 ? (
                    Object.keys(editDetailsMap).map((k) => {
                      const attrId = Number(k);
                      const attr = attributeData.find((a) => a.id === attrId);
                      const val = editDetailsMap[attrId] ?? 8;
                      return (
                        <div key={attrId} className="flex items-center gap-3">
                          <div className="w-full">
                            <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{attr?.name ?? `Atrybut ${attrId}`}</label>
                            <input type="range" min={1} max={10} step={1} value={val} onChange={(e) => setEditDetailsMap((prev) => ({ ...prev, [attrId]: Number(e.target.value) }))} className="w-full accent-blue-600" />
                          </div>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            step={1}
                            value={val}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const v = Number(raw);
                              if (!Number.isNaN(v)) setEditDetailsMap((prev) => ({ ...prev, [attrId]: Math.max(1, Math.min(10, v)) }));
                            }}
                            className="w-16 rounded-md border border-gray-200 px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500">Brak atrybutów do edycji.</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    // apply edits: update reviewDetailsData and reviewData, recalc overall and dish rating
                    // ensure numeric ratings
                    const weightedItems: { rating: number; weight: number }[] = [];
                    // update existing detail entries or create if missing
                    let maxDetailId = reviewDetailsData.reduce((m, d) => (d.id > m ? d.id : m), 100);
                    Object.entries(editDetailsMap).forEach(([attrIdStr, v]) => {
                      const attrId = Number(attrIdStr);
                      const ratingVal = Number(v as any);
                      const attr = attributeData.find((a) => a.id === attrId);
                      const weight = attr?.weight ?? 1;
                      // find existing detail record
                      const existing = reviewDetailsData.find((rd) => rd.review_id === rev.id && rd.attribute_id === attrId);
                      if (existing) {
                        existing.rating = ratingVal;
                      } else {
                        maxDetailId += 1;
                        reviewDetailsData.push({ id: maxDetailId, rating: ratingVal, review_id: rev.id, attribute_id: attrId });
                        // also add to review's review_details array if present
                        if (Array.isArray(rev.review_details)) rev.review_details.push(maxDetailId);
                      }
                      weightedItems.push({ rating: ratingVal, weight });
                    });

                    const totalWeight = weightedItems.reduce((s, it) => s + it.weight, 0);
                    const weightedSum = weightedItems.reduce((s, it) => s + it.rating * it.weight, 0);
                    const avgOn10 = totalWeight > 0 ? weightedSum / totalWeight : 0;
                    const overall = avgOn10 > 0 ? Math.round((avgOn10 / 2) * 10) / 10 : 0;

                    const reviewObj = reviewData.find((r) => r.id === rev.id);
                    if (reviewObj) {
                      reviewObj.comment = editComment;
                      reviewObj.overall_rating = overall;
                    }

                    // recalc dish rating
                    const dishObj = dishData.find((d) => d.id === rev.dish_id);
                    if (dishObj) {
                      const values = reviewData
                        .filter((r) => r.dish_id === dishObj.id)
                        .map((r) => r.overall_rating ?? 0)
                        .filter((v) => v > 0);
                      dishObj.rating = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
                    }

                    setIsEditing(false);
                    if (onModify) onModify({ showSuccess: true, action: 'edit' });
                    if (onCloseEdit) onCloseEdit();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestaurantReviews({ restaurant }: Props) {
  const rest = restaurant as any;

  const restaurantReviewIds: number[] = rest.reviews ?? [];
  const restaurantDishIds: number[] = rest.dishes ?? [];

  const [selectedDishFilter, setSelectedDishFilter] = useState<number | 'all'>('all');
  const [selectedDishToRate, setSelectedDishToRate] = useState<number | 'all'>('all');

  const [version, setVersion] = useState(0);
  const [showGlobalSuccess, setShowGlobalSuccess] = useState(false);
  const [globalSuccessAction, setGlobalSuccessAction] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);

  const dishesForRestaurant = dishData.filter((d) => restaurantDishIds.includes(d.id));

  let baseReviews: Review[] = [];
  if (restaurantReviewIds.length > 0) {
    baseReviews = reviewData.filter((r) => restaurantReviewIds.includes(r.id));
  } else if (restaurantDishIds.length > 0) {
    baseReviews = reviewData.filter((r) => restaurantDishIds.includes(r.dish_id));
  } else {
    baseReviews = [];
  }

  // currently selected dish for review-filtering (null = wszystkie)
  const selectedDish = selectedDishFilter === 'all' ? null : dishesForRestaurant.find((d) => d.id === selectedDishFilter);

  // apply dish filter for reviews (shows all when "all")
  const reviewsToShow = selectedDishFilter === 'all' ? baseReviews : baseReviews.filter((r) => r.dish_id === selectedDishFilter);

  // split reviews into current user's and others
  const auth = useAuth();
  const currentUserId = auth?.user?.id ?? null;
  const userReviews = currentUserId ? reviewsToShow.filter((r) => r.user_id === currentUserId) : [];
  const otherReviews = currentUserId ? reviewsToShow.filter((r) => r.user_id !== currentUserId) : reviewsToShow;

  const handleModify = (opts?: { showSuccess?: boolean; action?: 'add' | 'edit' | 'delete' }) => {
    setVersion((v) => v + 1);
    if (opts?.showSuccess) {
      setGlobalSuccessAction(opts.action ?? 'add');
      setShowGlobalSuccess(true);
    }
  };

  const handleOpenEdit = (reviewId: number) => {
    setEditReviewId(reviewId);
  };

  return (
    <article className="bg-white dark:bg-gray-900 rounded-md p-4 sm:p-6 shadow-sm">
      <Header restaurant={restaurant} />

      <hr className="border-gray-700 my-6" />

      <ReviewForm selectedDishId={selectedDishToRate} setSelectedDishId={setSelectedDishToRate} dishes={dishesForRestaurant} onAdd={() => handleModify({ showSuccess: true, action: 'add' })} onOpenEdit={handleOpenEdit} />

      <hr className="border-gray-700 my-6" />

      <section>
        {/* user's reviews are shown below the filter */}

        <h2 className="text-lg font-semibold mb-4">Opinie użytkowników</h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 font-semibold dark:text-gray-300 mb-2">Filtruj po daniu:</label>
          <select value={selectedDishFilter} onChange={(e) => setSelectedDishFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <option value="all">— Wszystkie dania —</option>
            {dishesForRestaurant.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

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

        {userReviews.length > 0 && (
          <div className="mb-6">
            <div className="space-y-4">
              {userReviews.map((rev: any) => (
                <ReviewCard key={rev.id} rev={rev} onModify={handleModify} editOpen={editReviewId === rev.id} onCloseEdit={() => setEditReviewId(null)} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">{otherReviews.length > 0 ? otherReviews.map((rev: any) => <ReviewCard key={rev.id} rev={rev} onModify={handleModify} editOpen={editReviewId === rev.id} onCloseEdit={() => setEditReviewId(null)} />) : <div className="text-sm text-gray-500">Brak opinii dla tego lokalu.</div>}</div>

        {showGlobalSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-sm mx-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{globalSuccessAction === 'edit' ? 'Opinia zaktualizowana!' : globalSuccessAction === 'delete' ? 'Opinia usunięta!' : 'Opinia dodana!'}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{globalSuccessAction === 'edit' ? 'Twoja opinia została pomyślnie zaktualizowana.' : globalSuccessAction === 'delete' ? 'Twoja opinia została pomyślnie usunięta.' : 'Twoja opinia została pomyślnie dodana.'}</p>
              <button
                onClick={() => {
                  setShowGlobalSuccess(false);
                  setGlobalSuccessAction(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </section>
    </article>
  );
}
