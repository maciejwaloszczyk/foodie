import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_KEY = process.env.STRAPI_KEY;

interface AttributeRating {
  attributeId?: number;
  attributeDocumentId?: string;
  rating: number;
}

export async function POST(request: NextRequest) {
  try {
    // Pobierz token JWT użytkownika z nagłówka
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Zweryfikuj użytkownika przez Strapi
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    const user = await userResponse.json();

    // Pobierz dane z requestu
    const body = await request.json();
    const { dishId, rating, comment, attributeRatings } = body;

    if (!dishId || !rating) {
      return NextResponse.json({ error: 'Missing required fields: dishId, rating' }, { status: 400 });
    }

    // Utwórz opinię używając tokenu serwera (STRAPI_KEY)
    const payload = {
      data: {
        dish: dishId,
        rating: Number(rating),
        comment: comment || '',
        users_permissions_user: user.id,
      },
    };

    const reviewResponse = await fetch(`${STRAPI_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!reviewResponse.ok) {
      const error = await reviewResponse.json();
      console.error('Strapi error:', error);
      return NextResponse.json({ error: error.error?.message || 'Failed to create review' }, { status: reviewResponse.status });
    }

    const review = await reviewResponse.json();
    const reviewDocumentId = review.data.documentId;
    console.log('Created review:', reviewDocumentId);
    console.log('Received attributeRatings:', JSON.stringify(attributeRatings));

    // Utwórz review_details dla każdego atrybutu
    if (attributeRatings && Array.isArray(attributeRatings) && attributeRatings.length > 0) {
      console.log(`Creating ${attributeRatings.length} review details...`);
      const detailPromises = attributeRatings.map(async (attrRating: AttributeRating) => {
        const detailPayload = {
          data: {
            review: reviewDocumentId,
            attribute: attrRating.attributeDocumentId || attrRating.attributeId,
            rating: Number(attrRating.rating),
          },
        };
        console.log('Creating review detail:', JSON.stringify(detailPayload));

        try {
          const detailResponse = await fetch(`${STRAPI_URL}/api/review-details`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${STRAPI_KEY}`,
            },
            body: JSON.stringify(detailPayload),
          });

          if (!detailResponse.ok) {
            const detailError = await detailResponse.json();
            console.error('Error creating review detail:', detailError);
          }
          return detailResponse.ok;
        } catch (err) {
          console.error('Error creating review detail:', err);
          return false;
        }
      });

      await Promise.all(detailPromises);
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
