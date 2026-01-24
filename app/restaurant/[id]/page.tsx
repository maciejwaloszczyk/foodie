import { notFound } from 'next/navigation';
import { Restaurant } from '@/types/restaurant';
import RestaurantCard from '@/components/Restaurant/RestaurantCard';
import { getRestaurantById, getRestaurants } from '@/lib/restaurants';
import { getRestaurantStats } from '@/lib/reviews';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

type Props = { params: { id: string } };

export default async function RestaurantPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  try {
    const result = await getRestaurantById(numericId);
    const apiRestaurant = result.data;

    if (!apiRestaurant) return notFound();

    // Pobierz dynamiczne statystyki z opinii
    const stats = await getRestaurantStats(numericId);

    // Mapowanie danych z API na typ Restaurant
    const cover = apiRestaurant.cover;

    const imageUrl = cover?.formats?.large?.url ? `${STRAPI_URL}${cover.formats.large.url}` : cover?.formats?.medium?.url ? `${STRAPI_URL}${cover.formats.medium.url}` : cover?.url ? `${STRAPI_URL}${cover.url}` : null;

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
      image: imageUrl,
      description: apiRestaurant.description || 'Brak opisu.',
      location:
        apiRestaurant.latitude && apiRestaurant.longitude
          ? {
              lat: apiRestaurant.latitude,
              lng: apiRestaurant.longitude,
            }
          : undefined,
    };

    return (
      <section className="overflow-hidden pb-[120px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <main className="w-full px-4 lg:w-12/12">
              <RestaurantCard restaurant={restaurant} />
            </main>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Failed to fetch restaurant:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Jeśli to problem z API (502, 500), pokaż error zamiast 404
    if (message.includes('Status: 502') || message.includes('Status: 500')) {
      return (
        <section className="overflow-hidden pb-[120px] pt-[120px]">
          <div className="container">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Serwer niedostępny</h1>
              <p className="text-gray-600">Nie udało się załadować restauracji. Spróbuj ponownie za chwilę.</p>
            </div>
          </div>
        </section>
      );
    }

    // Jeśli restauracja nie istnieje (404 z API), pokaż notFound
    return notFound();
  }
}
