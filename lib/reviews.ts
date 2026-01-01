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
