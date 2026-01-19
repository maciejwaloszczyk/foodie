const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function postReview(token: string, payload: any) {
  if (!token) {
    throw new Error('Authentication token is missing for API request.');
  }

  const url = `${STRAPI_URL}/api/reviews`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData.error?.message || `Failed to create review. Status: ${response.status}`;
    throw new Error(errorMessage);
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
  url.searchParams.append('populate[dish_attributes][populate]', 'attribute');
  url.searchParams.append('pagination[limit]', '100');

  console.log('Fetching dishes with URL:', url.toString());

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
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

  const token = process.env.NEXT_PUBLIC_STRAPI_TOKEN;
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
