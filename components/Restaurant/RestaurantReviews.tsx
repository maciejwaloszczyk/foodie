'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { Review } from '@/types/review';
import { getReviewsByRestaurant, getDishesByRestaurant, postReview, updateReview, deleteReview } from '@/lib/reviews';
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

function ReviewForm({ restaurant, selectedDishId, setSelectedDishId, dishes, baseReviews, onAdd, onOpenEdit }: { restaurant: Restaurant; selectedDishId: number | 'all'; setSelectedDishId: (v: number | 'all') => void; dishes: Dish[]; baseReviews: any[]; onAdd?: () => void; onOpenEdit?: (reviewId: number) => void }) {
  const { isAuthenticated, loading, user, token } = useAuth();
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [rating, setRating] = useState<number>(3);
  const [attrRatings, setAttrRatings] = useState<Record<number, number | string>>({});
  const [dishAttributes, setDishAttributes] = useState<any[]>([]);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [duplicateTargetId, setDuplicateTargetId] = useState<number | null>(null);

  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [submissionError, setSubmissionError] = useState<string | null>(null);

  const selectedDish = selectedDishId === 'all' ? null : dishes.find((d) => d.id === selectedDishId);

  useEffect(() => {
    if (selectedDishId === 'all' || !selectedDishId) {
      setDishAttributes([]);
      setAttrRatings({});
      return;
    }

    // Atrybuty są już w selectedDish.dish_attributes
    if (selectedDish && selectedDish.dish_attributes) {
      const attributes = selectedDish.dish_attributes;
      setDishAttributes(attributes);

      // Initialize attribute ratings with attribute.id as key
      const init: Record<number, number> = {};
      attributes.forEach((attr: any) => {
        const attrId = attr.attribute?.id || attr.id;
        init[attrId] = 8;
      });
      setAttrRatings(init);
    } else {
      setDishAttributes([]);
      setAttrRatings({});
    }
  }, [selectedDishId, selectedDish]);

  if (loading) {
    return <div className="mb-6 p-4 text-sm text-gray-600 dark:text-gray-400">Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="mb-6 rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
        <h2 className="text-lg font-semibold mb-3">Dodaj opinię</h2>
        <p className="text-sm italic text-gray-700 dark:text-gray-300">
          Aby dodać opinię, musisz być{' '}
          <Link href={`/signin?redirect=/restaurant/${restaurant.id}/reviews`} className="text-primary underline">
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

    if (!token) {
      console.warn('Brak tokenu uwierzytelniania.');
      return;
    }

    // Check if user already has a review for this dish
    const existingReview = baseReviews.find((r) => r.dish_id === selectedDish.id && r.user_id === user.id);
    if (existingReview) {
      setDuplicateTargetId(existingReview.id);
      setShowDuplicatePopup(true);
      return;
    }

    // Oblicz średnią ocenę z atrybutów (atrybuty są 1-10, rating ma być 1-5)
    const attrValues = Object.values(attrRatings).filter((v) => typeof v === 'number') as number[];
    // Średnia z atrybutów (1-10) podzielona przez 2 daje skalę 0.5-5
    const avgAttr = attrValues.length > 0 ? attrValues.reduce((a, b) => a + b, 0) / attrValues.length : 10;
    const overallRating = Math.round((avgAttr / 2) * 10) / 10; // Zaokrąglij do 1 miejsca po przecinku

    // Przygotuj oceny atrybutów do wysłania
    // dishAttributes to tablica dish_attribute, każdy ma nested attribute z documentId
    console.log('dishAttributes:', dishAttributes);
    console.log('attrRatings:', attrRatings);
    const attributeRatings = dishAttributes.map((dishAttr: any) => {
      console.log('Processing dishAttr:', dishAttr);
      const attrId = dishAttr.attribute?.id || dishAttr.id;
      return {
        attributeId: attrId,
        attributeDocumentId: dishAttr.attribute?.documentId || dishAttr.documentId,
        rating: Number(attrRatings[attrId]) || 8,
      };
    });
    console.log('attributeRatings to send:', attributeRatings);

    try {
      const payload = {
        data: {
          dish: selectedDish.documentId || selectedDish.id,
          rating: overallRating,
          comment: comment || '',
          attributeRatings, // Dodajemy oceny atrybutów
        },
      };

      await postReview(token, payload);

      // Reset formularza
      setComment('');
      setAttrRatings({});
      setSelectedDishId('all');

      // Powiadom rodzica o dodaniu opinii
      if (onAdd) onAdd();
    } catch (error) {
      console.error('Błąd podczas dodawania opinii:', error);
      alert('Nie udało się dodać opinii. Spróbuj ponownie.');
    }
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
        {/* If no dish selected, instruct user and hide sliders */}
        {!selectedDish ? (
          <div className="rounded-md border border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">Wybierz danie z menu powyżej, aby ocenić je i dodać opinię.</div>
        ) : (
          <>
            {/* Attribute sliders for the selected dish */}
            {dishAttributes.map((attr) => {
              const attrId = attr.attribute?.id || attr.id;
              const val = attrRatings[attrId] ?? 8;
              return (
                <div key={attrId}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{attr.name}</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={10} step={1} value={Number(val)} onChange={(e) => setAttrRatings((prev) => ({ ...prev, [attrId]: Number(e.target.value) }))} className="w-full accent-blue-600" />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      value={val === '' ? '' : val}
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

            {/* Comment section */}
            <div>
              <label className="block text-xs text-white mb-1">Treść opinii</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[120px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Napisz, co Ci się podobało / nie podobało..." />
            </div>
          </>
        )}

        {/* Buttons - only visible when a dish is selected */}
        {selectedDish ? (
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAttrRatings({});
                  setComment('');
                  setName('');
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

function ReviewCard({ rev, onModify, editOpen, onCloseEdit, dishes }: { rev: any; onModify?: (opts?: { showSuccess?: boolean; action?: 'add' | 'edit' | 'delete' }) => void; editOpen?: boolean; onCloseEdit?: () => void; dishes?: any[] }) {
  const auth = useAuth();
  const authUser = auth?.user;
  const token = auth?.token;
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState<string>(rev.comment ?? '');
  const [editAttrRatings, setEditAttrRatings] = useState<Record<string, number>>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get user from API data or auth user if they are the reviewer
  let user = { id: rev.user_id, username: rev.username ?? 'Anonim' } as any;
  if (!user && authUser && authUser.id === rev.user_id) {
    user = { id: authUser.id, username: (authUser.username as string) ?? 'user' };
  }

  const details = [] as any[];

  // Get dish attributes for this review's dish
  const dish = dishes?.find((d) => d.id === rev.dish_id);
  const dishAttrs = dish?.dish_attributes || [];

  // populate edit map when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditComment(rev.comment ?? '');

      // Initialize attribute ratings from current review
      const attrRatings: Record<string, number> = {};
      if (rev.attribute_ratings && typeof rev.attribute_ratings === 'object') {
        Object.entries(rev.attribute_ratings).forEach(([attrId, rating]: [string, any]) => {
          // Backend stores 0-5, UI displays 1-10
          attrRatings[attrId] = Number(rating) * 2;
        });
      }
      setEditAttrRatings(attrRatings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // open editor when parent requests it
  useEffect(() => {
    if (editOpen) setIsEditing(true);
  }, [editOpen]);

  const handleDelete = async () => {
    if (!confirm('Czy na pewno chcesz usunąć tę opinię?')) return;
    if (!token || !rev.documentId) {
      alert('Błąd: brak autoryzacji lub ID opinii');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteReview(token, rev.documentId);
      if (onModify) onModify({ showSuccess: true, action: 'delete' });
      if (onCloseEdit) onCloseEdit();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Nie udało się usunąć opinii');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!token || !rev.documentId) {
      alert('Błąd: brak autoryzacji lub ID opinii');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare attribute ratings for update (convert back from 1-10 to 0-5 scale)
      const attributeRatings = dishAttrs.map((dishAttr: any) => {
        const attrId = dishAttr.attribute?.id || dishAttr.id;
        const uiRating = editAttrRatings[attrId] || editAttrRatings[String(attrId)] || 8;
        return {
          attributeId: attrId,
          attributeDocumentId: dishAttr.attribute?.documentId || dishAttr.documentId,
          rating: uiRating / 2, // Convert from 1-10 UI scale to 0-5 backend scale
        };
      });

      // Calculate new overall rating from attribute averages
      const avgAttr = attributeRatings.length > 0 ? attributeRatings.reduce((sum, ar) => sum + ar.rating, 0) / attributeRatings.length : rev.overall_rating || 3;

      await updateReview(token, rev.documentId, {
        comment: editComment,
        rating: Math.round(avgAttr * 10) / 10, // Round to 1 decimal place
        attributeRatings,
      });
      setIsEditing(false);
      if (onModify) onModify({ showSuccess: true, action: 'edit' });
      if (onCloseEdit) onCloseEdit();
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Nie udało się zaktualizować opinii');
    } finally {
      setIsSaving(false);
    }
  };

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
                <button onClick={handleDelete} disabled={isDeleting} className="text-xs text-red-600 underline disabled:opacity-50">
                  {isDeleting ? 'Usuwanie...' : 'Usuń'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DESCRIPTION + Produkt (produkt przeniesiony tutaj ponad opis) */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
        <div className="text-sm text-gray-500 mb-2">
          Danie: <span className="font-semibold text-gray-800 dark:text-gray-200">{rev.dish_name ?? '—'}</span>
        </div>
        <p className="text-gray-800 dark:text-gray-200 text-base whitespace-pre-line font-medium">{rev.comment}</p>
      </div>

      {/* ATTRIBUTES */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-900">
        {rev.attribute_ratings && Object.keys(rev.attribute_ratings).length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 font-semibold dark:text-gray-400 mb-2">Oceny atrybutów:</div>
            {Object.entries(rev.attribute_ratings).map(([attrId, rating]: [string, any]) => {
              const dish = dishes?.find((d) => d.id === rev.dish_id);
              const dishAttrs = dish?.dish_attributes || [];
              const keyNum = Number(attrId);
              let attrName = dishAttrs.find((a: any) => a?.attribute?.id === keyNum)?.attribute?.name as string | undefined;
              if (!attrName && !Number.isNaN(keyNum)) {
                // Some payloads key by dish_attribute.id
                attrName = dishAttrs.find((a: any) => a?.id === keyNum)?.name || dishAttrs.find((a: any) => a?.id === keyNum)?.attribute?.name;
              }
              if (!attrName) {
                // Some payloads key by attribute.documentId
                attrName = dishAttrs.find((a: any) => String(a?.attribute?.documentId) === String(attrId))?.attribute?.name;
              }
              if (!attrName) {
                // Fallback: names carried in review_details mapping by attribute.id
                attrName = (rev.attribute_names && (rev.attribute_names[keyNum] || rev.attribute_names[attrId])) || (rev.attribute_names_by_docId && rev.attribute_names_by_docId[String(attrId)]) || attrName;
              }
              attrName = attrName || `Atrybut #${attrId}`;
              const displayRating = Number(rating) * 2; // backend stores 0-5, show as 0-10
              return (
                <div key={attrId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{attrName}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeClasses(displayRating)}`}>{displayRating}/10</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-gray-500">Brak szczegółowych ocen atrybutów</div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Edytuj opinię</h3>
            <div className="space-y-4">
              {/* Attribute rating sliders */}
              {dishAttrs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Oceny atrybutów:</h4>
                  {dishAttrs.map((attr: any) => {
                    const attrId = attr.attribute?.id || attr.id;
                    const attrName = attr.name || attr.attribute?.name || `Atrybut #${attrId}`;
                    const val = editAttrRatings[attrId] || editAttrRatings[String(attrId)] || 8;
                    return (
                      <div key={attrId}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{attrName}</label>
                        <div className="flex items-center gap-3">
                          <input type="range" min={1} max={10} step={1} value={Number(val)} onChange={(e) => setEditAttrRatings((prev) => ({ ...prev, [attrId]: Number(e.target.value) }))} className="w-full accent-blue-600" />
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[3rem] text-right">{val}/10</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treść opinii</label>
                <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[100px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
                  Anuluj
                </button>
                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {isSaving ? 'Zapisuję...' : 'Zapisz'}
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

  const [selectedDishFilter, setSelectedDishFilter] = useState<number | 'all'>('all');
  const [selectedDishToRate, setSelectedDishToRate] = useState<number | 'all'>('all');

  const [version, setVersion] = useState(0);
  const [showGlobalSuccess, setShowGlobalSuccess] = useState(false);
  const [globalSuccessAction, setGlobalSuccessAction] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [editReviewId, setEditReviewId] = useState<number | null>(null);
  const [baseReviews, setBaseReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dishesForRestaurant, setDishesForRestaurant] = useState<any[]>([]);

  // Fetch reviews from API on mount and when version changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for restaurant ID:', rest.id, 'Type:', typeof rest.id);

        // Fetch all dishes for this restaurant
        const dishesResponse = await getDishesByRestaurant(rest.id);
        console.log('Raw dishes response:', dishesResponse);
        const allDishes = (dishesResponse.data || []).map((dish: any) => {
          console.log('Processing dish:', dish.name, 'dish_attributes:', dish.dish_attributes);
          return {
            id: dish.id,
            documentId: dish.documentId,
            name: dish.name,
            dish_attributes: (dish.dish_attributes || []).map((da: any) => {
              console.log('Processing dish_attribute:', da);
              return {
                id: da.id, // id dish_attribute (używane jako klucz w attrRatings)
                attribute: da.attribute, // cały obiekt attribute z id, documentId, name
                name: da.attribute?.name || `Atrybut #${da.id}`,
              };
            }),
          };
        });
        setDishesForRestaurant(allDishes);
        console.log('Dishes fetched:', allDishes);

        // Fetch reviews
        const response = await getReviewsByRestaurant(rest.id);
        const apiReviews = response.data || [];
        console.log('API reviews raw:', apiReviews);

        // Map API reviews to component format
        const mappedReviews = apiReviews.map((review: any) => {
          const detailRatings = Array.isArray(review.review_details) ? Object.fromEntries(review.review_details.filter((d: any) => d.attribute && typeof d.rating !== 'undefined').map((d: any) => [d.attribute.id, d.rating])) : {};

          const detailNames = Array.isArray(review.review_details) ? Object.fromEntries(review.review_details.filter((d: any) => d.attribute).map((d: any) => [d.attribute.id, d.attribute.name])) : {};

          const detailNamesByDocId = Array.isArray(review.review_details) ? Object.fromEntries(review.review_details.filter((d: any) => d.attribute?.documentId).map((d: any) => [d.attribute.documentId, d.attribute.name])) : {};

          return {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            dish_id: review.dish?.id,
            dish_name: review.dish?.name,
            user_id: review.users_permissions_user?.id,
            username: review.users_permissions_user?.username,
            overall_rating: review.rating,
            documentId: review.documentId,
            attribute_ratings: review.attribute_ratings || detailRatings || {},
            attribute_names: detailNames,
            attribute_names_by_docId: detailNamesByDocId,
          };
        });

        setBaseReviews(mappedReviews);
        console.log('Reviews fetched:', mappedReviews);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBaseReviews([]);
        setDishesForRestaurant([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rest.id, version]);

  // currently selected dish for review-filtering (null = wszystkie)
  const selectedDish = selectedDishFilter === 'all' ? null : dishesForRestaurant.find((d) => d.id === selectedDishFilter);

  // apply dish filter for reviews (shows all when "all")
  const reviewsToShow = selectedDishFilter === 'all' ? baseReviews : baseReviews.filter((r) => r.dish_id === selectedDishFilter);

  // compute average rating for selected dish (from displayed reviews)
  const dishAvgRating = selectedDish ? (reviewsToShow.length ? Math.round((reviewsToShow.reduce((sum, r) => sum + (r.overall_rating ?? r.rating ?? 0), 0) / reviewsToShow.length) * 10) / 10 : 0) : undefined;

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

      <ReviewForm restaurant={restaurant} selectedDishId={selectedDishToRate} setSelectedDishId={setSelectedDishToRate} dishes={dishesForRestaurant} baseReviews={baseReviews} onAdd={() => handleModify({ showSuccess: true, action: 'add' })} onOpenEdit={handleOpenEdit} />

      <hr className="border-gray-700 my-6" />

      <section>
        {/* user's reviews are shown below the filter */}

        <h2 className="text-lg font-semibold mb-4">Opinie użytkowników</h2>

        {loading ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">Ładowanie opinii...</div>
        ) : (
          <>
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
                  <Stars rating={dishAvgRating ?? 0} />
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
                    <ReviewCard key={rev.id} rev={rev} onModify={handleModify} editOpen={editReviewId === rev.id} onCloseEdit={() => setEditReviewId(null)} dishes={dishesForRestaurant} />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">{otherReviews.length > 0 ? otherReviews.map((rev: any) => <ReviewCard key={rev.id} rev={rev} onModify={handleModify} editOpen={editReviewId === rev.id} onCloseEdit={() => setEditReviewId(null)} dishes={dishesForRestaurant} />) : <div className="text-sm text-gray-500">Brak opinii dla tego lokalu.</div>}</div>
          </>
        )}

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
