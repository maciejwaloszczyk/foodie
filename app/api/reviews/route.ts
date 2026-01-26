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
    console.log('=== POST /api/reviews started ===');

    // Pobierz token JWT użytkownika z nagłówka
    const authHeader = request.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header, returning 401');
      return NextResponse.json({ error: 'Unauthorized - missing Bearer token' }, { status: 401 });
    }

    const userToken = authHeader.replace('Bearer ', '');
    console.log('Token length:', userToken.length);

    // Zweryfikuj użytkownika przez Strapi
    console.log('Attempting to verify user at:', `${STRAPI_URL}/api/users/me`);

    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    console.log('User verification status:', userResponse.status);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.log('User verification failed:', errorText.substring(0, 200));
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    const user = await userResponse.json();
    console.log('User verified, ID:', user.id);

    // Pobierz dane z requestu
    const body = await request.json();
    const { dishId, rating, comment, attributeRatings } = body;
    console.log('Request body:', { dishId, rating: !!rating, comment: !!comment, attributesCount: attributeRatings?.length });

    if (!dishId || !rating) {
      console.log('Missing required fields');
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

    console.log('Creating review with dish ID:', dishId);

    const reviewResponse = await fetch(`${STRAPI_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    console.log('Review creation status:', reviewResponse.status);

    if (!reviewResponse.ok) {
      const error = await reviewResponse.json();
      console.error('Review creation failed:', error);
      return NextResponse.json({ error: error.error?.message || 'Failed to create review' }, { status: reviewResponse.status });
    }

    const review = await reviewResponse.json();
    const reviewDocumentId = review.data.documentId;
    console.log('Review created with ID:', reviewDocumentId);

    // Utwórz review_details dla każdego atrybutu
    if (attributeRatings && Array.isArray(attributeRatings) && attributeRatings.length > 0) {
      console.log(`Creating ${attributeRatings.length} review details...`);
      const detailPromises = attributeRatings.map(async (attrRating: AttributeRating) => {
        // Konwertuj rating z skali 1-10 na skalę 1-5 (Strapi wymaga max 5)
        const convertedRating = Math.round((Number(attrRating.rating) / 2) * 10) / 10;
        const detailPayload = {
          data: {
            review: reviewDocumentId,
            attribute: attrRating.attributeDocumentId || attrRating.attributeId,
            rating: Math.min(5, Math.max(1, convertedRating)), // Upewnij się że jest w zakresie 1-5
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

// PUT - Update review
export async function PUT(request: NextRequest) {
  try {
    console.log('=== PUT /api/reviews started ===');

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Verify user
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    const user = await userResponse.json();

    const body = await request.json();
    const { reviewId, reviewDocumentId, comment, rating, attributeRatings } = body;
    console.log('Update request:', { reviewId, reviewDocumentId, comment, rating });

    if (!reviewDocumentId && !reviewId) {
      return NextResponse.json({ error: 'Missing reviewId or reviewDocumentId' }, { status: 400 });
    }

    const docId = reviewDocumentId || reviewId;

    // Update review
    const updatePayload = {
      data: {
        ...(comment !== undefined && { comment }),
        ...(rating !== undefined && { rating: Number(rating) }),
      },
    };

    const reviewResponse = await fetch(`${STRAPI_URL}/api/reviews/${docId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_KEY}`,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!reviewResponse.ok) {
      const error = await reviewResponse.json();
      console.error('Update failed:', error);
      return NextResponse.json({ error: error.error?.message || 'Failed to update review' }, { status: reviewResponse.status });
    }

    const review = await reviewResponse.json();
    console.log('Review updated:', review.data?.documentId);

    // Update attribute ratings if provided
    if (attributeRatings && Array.isArray(attributeRatings) && attributeRatings.length > 0) {
      console.log('Updating attribute ratings...');

      // First, delete existing review details for this review
      const existingDetailsResponse = await fetch(`${STRAPI_URL}/api/review-details?filters[review][documentId][$eq]=${docId}`, {
        headers: {
          Authorization: `Bearer ${STRAPI_KEY}`,
        },
      });

      if (existingDetailsResponse.ok) {
        const existingDetails = await existingDetailsResponse.json();
        const deletePromises = existingDetails.data.map((detail: any) =>
          fetch(`${STRAPI_URL}/api/review-details/${detail.documentId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${STRAPI_KEY}`,
            },
          }),
        );
        await Promise.all(deletePromises);
        console.log(`Deleted ${existingDetails.data.length} existing review details`);
      }

      // Create new review details
      const detailPromises = attributeRatings.map(async (attrRating: AttributeRating) => {
        const detailPayload = {
          data: {
            review: docId,
            attribute: attrRating.attributeDocumentId || attrRating.attributeId,
            rating: Math.min(5, Math.max(0.5, Number(attrRating.rating))),
          },
        };

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
      console.log(`Created ${attributeRatings.length} new review details`);
    }

    return NextResponse.json(review, { status: 200 });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete review
export async function DELETE(request: NextRequest) {
  try {
    console.log('=== DELETE /api/reviews started ===');

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Verify user
    const userResponse = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Invalid user token' }, { status: 401 });
    }

    const user = await userResponse.json();

    const { searchParams } = new URL(request.url);
    const reviewDocumentId = searchParams.get('documentId') || searchParams.get('id');
    console.log('Delete request for:', reviewDocumentId);

    if (!reviewDocumentId) {
      return NextResponse.json({ error: 'Missing documentId or id' }, { status: 400 });
    }

    // Delete review
    const deleteResponse = await fetch(`${STRAPI_URL}/api/reviews/${reviewDocumentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${STRAPI_KEY}`,
      },
    });

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.error('Delete failed:', error);
      return NextResponse.json({ error: error.error?.message || 'Failed to delete review' }, { status: deleteResponse.status });
    }

    console.log('Review deleted:', reviewDocumentId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
