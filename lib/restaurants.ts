const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function getRestaurants(params?: { search?: string; cuisine?: string; minRating?: number; sortBy?: string }) {
  const url = new URL(`${STRAPI_URL}/api/restaurants`);

  // Strapi używa qs (query string) do zaawansowanego filtrowania
  // Dla wyszukiwania po nazwie/lokalizacji:
  if (params?.search) {
    url.searchParams.append('filters[$or][0][name][$containsi]', params.search);
    url.searchParams.append('filters[$or][1][address][$containsi]', params.search);
    url.searchParams.append('filters[$or][2][cuisine][$containsi]', params.search);
  }

  // Filtrowanie po kuchni:
  if (params?.cuisine) {
    url.searchParams.append('filters[cuisine][$eq]', params.cuisine);
  }

  // Filtrowanie po ocenie:
  if (params?.minRating) {
    url.searchParams.append('filters[rating][$gte]', params.minRating.toString());
  }

  // Sortowanie:
  if (params?.sortBy) {
    switch (params.sortBy) {
      case 'rating':
        url.searchParams.append('sort[0]', 'rating:desc');
        break;
      case 'reviews':
        url.searchParams.append('sort[0]', 'reviewCount:desc');
        break;
      case 'name':
        url.searchParams.append('sort[0]', 'name:asc');
        break;
      default:
        url.searchParams.append('sort[0]', 'id:asc');
    }
  }

  // Populate relacji (jeśli masz)
  url.searchParams.append('populate', '*');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // lub 'force-cache' w zależności od potrzeb
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants. Status: ${response.status}`);
  }

  return response.json();
}
