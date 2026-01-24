import { notFound } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';
import RestaurantReviews from '@/components/Restaurant/RestaurantReviews';
import { getRestaurantById } from '@/lib/restaurants';
import { getRestaurantStats } from '@/lib/reviews';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

type Props = { params: { id: string } };

export default async function RestaurantReviewsPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  try {
    const result = await getRestaurantById(numericId);
    const apiRestaurant = result.data;

    if (!apiRestaurant) return notFound();

    // Pobierz dynamiczne statystyki z opinii
    const stats = await getRestaurantStats(numericId);

    // Pobierz kategorie i połącz je w jeden string
    const categories = Array.isArray(apiRestaurant.categories) ? apiRestaurant.categories.map((c: any) => c.name || c).join(', ') : typeof apiRestaurant.categories === 'string' ? apiRestaurant.categories : 'Nieznana kuchnia';

    const restaurant: Restaurant = {
      id: apiRestaurant.id,
      name: apiRestaurant.name,
      address: apiRestaurant.address,
      cuisine: categories,
      rating: stats.avgRating || apiRestaurant.avg_rating || 0,
      reviewCount: stats.reviewCount || apiRestaurant.reviewCount || 0,
      priceRange: apiRestaurant.priceRange || '—',
      deliveryTime: apiRestaurant.deliveryTime || '—',
      distance: apiRestaurant.distance || '—',
      isPromoted: apiRestaurant.promoted || false,
      image: apiRestaurant.cover?.url ? `${STRAPI_URL}${apiRestaurant.cover.url}` : null,
      description: apiRestaurant.description || 'Brak opisu.',
    };

    return (
      <section className="overflow-hidden pt-[180px] pb-12 md:pt-[200px] md:pb-[120px]">
        <div className="container">
          <div className="flex flex-col lg:flex-row -mx-4">
            <main className="w-full px-4 lg:pr-6 order-1">
              <RestaurantReviews restaurant={restaurant} />
            </main>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to fetch restaurant:', error);
    return notFound();
  }
}
