const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface AttributeRating {
  attributeId?: number;
  attributeDocumentId?: string;
  rating: number;
}

interface ReviewPayload {
  data: {
    dish: string;
    rating: number;
    comment: string;
    attributeRatings?: AttributeRating[];
  };
}

export async function postReview(token: string, payload: ReviewPayload) {
  if (!token) {
    throw new Error('Authentication token is missing for API request.');
  }

  // Używamy lokalnego API route który pośredniczy w komunikacji ze Strapi
  const url = '/api/reviews';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      dishId: payload.data.dish,
      rating: payload.data.rating,
      comment: payload.data.comment,
      attributeRatings: payload.data.attributeRatings || [],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error || `Failed to create review. Status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function updateReview(
  token: string, 
  reviewDocumentId: string, 
  data: { comment?: string; rating?: number; attributeRatings?: any[] }
) {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  const response = await fetch('/api/reviews', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reviewDocumentId,
      comment: data.comment,
      rating: data.rating,
      attributeRatings: data.attributeRatings,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update review');
  }

  return response.json();
}

export async function deleteReview(token: string, reviewDocumentId: string) {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  const response = await fetch(`/api/reviews?documentId=${reviewDocumentId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete review');
  }

  return response.json();
}

export async function getDishesByRestaurant(restaurantId: number | string) {
  if (!restaurantId) {
    throw new Error('Restaurant ID is required');
  }

  const numericId = typeof restaurantId === 'string' ? parseInt(restaurantId, 10) : restaurantId;

  if (isNaN(numericId)) {
    throw new Error(`Invalid restaurant ID: ${restaurantId}`);
  }

  const url = new URL(`${STRAPI_URL}/api/dishes`);
  // Najpierw spróbuj po id, jeśli nie zadziała, frontend będzie mieć `documentId` do REST
  url.searchParams.append('filters[restaurant][id][$eq]', String(numericId));
  // Poprawny format dla nested populate w Strapi v4/v5
  url.searchParams.append('populate[dish_attributes][populate][attribute][fields][0]', 'id');
  url.searchParams.append('populate[dish_attributes][populate][attribute][fields][1]', 'documentId');
  url.searchParams.append('populate[dish_attributes][populate][attribute][fields][2]', 'name');
  url.searchParams.append('pagination[limit]', '100');

  console.log('Fetching dishes with URL:', url.toString());

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = process.env.NEXT_PUBLIC_STRAPI_KEY;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`Failed to fetch dishes. Status: ${response.status}`);
  }

  const data = await response.json();
  console.log('Dishes response:', data);
  if (data.data && data.data.length > 0) {
    console.log('Sample dish structure:', data.data[0]);
  }
  return data;
}

export async function getReviewsByRestaurant(restaurantId: number | string) {
  if (!restaurantId) {
    throw new Error('Restaurant ID is required');
  }

  const numericId = typeof restaurantId === 'string' ? parseInt(restaurantId, 10) : restaurantId;

  if (isNaN(numericId)) {
    throw new Error(`Invalid restaurant ID: ${restaurantId}`);
  }

  const url = new URL(`${STRAPI_URL}/api/reviews`);
  url.searchParams.append('filters[dish][restaurant][id][$eq]', String(numericId));
  url.searchParams.append('populate[users_permissions_user][fields][0]', 'username');
  url.searchParams.append('populate[users_permissions_user][fields][1]', 'email');
  url.searchParams.append('populate[dish][populate][restaurant][fields][0]', 'name');
  url.searchParams.append('populate[review_details][populate]', 'attribute');
  url.searchParams.append('sort[0]', 'createdAt:desc');

  console.log('Fetching reviews with URL:', url.toString());

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = process.env.NEXT_PUBLIC_STRAPI_KEY;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error Response:', errorText);
    throw new Error(`Failed to fetch reviews. Status: ${response.status}`);
  }

  return response.json();
}

export async function getRestaurantStats(restaurantId: number | string) {
  try {
    const reviewsData = await getReviewsByRestaurant(restaurantId);
    const reviews = reviewsData.data || [];

    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewCount : 0;

    return {
      reviewCount,
      avgRating: Math.round(avgRating * 10) / 10, // zaokrąglenie do 1 miejsca po przecinku
    };
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    return { reviewCount: 0, avgRating: 0 };
  }
}

// Pobiera wszystkie opinie i oblicza statystyki dla wszystkich restauracji
export async function getAllRestaurantStats(): Promise<Map<number, { reviewCount: number; avgRating: number }>> {
  const statsMap = new Map<number, { reviewCount: number; avgRating: number }>();

  try {
    const url = new URL(`${STRAPI_URL}/api/reviews`);
    url.searchParams.append('populate[dish][populate][restaurant][fields][0]', 'id');
    url.searchParams.append('pagination[limit]', '1000');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = process.env.NEXT_PUBLIC_STRAPI_KEY;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch all reviews for stats');
      return statsMap;
    }

    const data = await response.json();
    const reviews = data.data || [];

    // Grupuj opinie po restauracji
    const grouped: Record<number, number[]> = {};
    for (const review of reviews) {
      const restaurantId = review.dish?.restaurant?.id;
      if (restaurantId) {
        if (!grouped[restaurantId]) {
          grouped[restaurantId] = [];
        }
        grouped[restaurantId].push(review.rating || 0);
      }
    }

    // Oblicz statystyki
    for (const [restaurantId, ratings] of Object.entries(grouped)) {
      const count = ratings.length;
      const avg = count > 0 ? ratings.reduce((a, b) => a + b, 0) / count : 0;
      statsMap.set(Number(restaurantId), {
        reviewCount: count,
        avgRating: Math.round(avg * 10) / 10,
      });
    }
  } catch (error) {
    console.error('Error fetching all restaurant stats:', error);
  }

  return statsMap;
}
