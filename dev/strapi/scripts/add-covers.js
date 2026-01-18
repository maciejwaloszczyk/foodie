/**
 * Skrypt do dodania cover image ID 2 (default.png) do wszystkich restauracji
 * Uruchomienie: node dev/strapi/scripts/add-covers.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../..', '.env') });

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_TOKEN || process.env.STRAPI_TOKEN;
const COVER_ID = 2; // ID default.png w media library

if (!STRAPI_TOKEN) {
  console.error('❌ Błąd: Token nie znaleziony w .env');
  console.log('Sprawdź czy masz NEXT_PUBLIC_STRAPI_TOKEN w .env');
  process.exit(1);
}

async function getAllRestaurants() {
  try {
    // populate=cover aby pobrać dane o cover
    const response = await fetch(`${STRAPI_URL}/api/restaurants?pagination[pageSize]=1000&populate=cover`, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    // Debug: Wyświetl pierwszą restaurację aby zobaczyć strukturę
    if (data.data && data.data.length > 0) {
      console.log('📋 Struktura pierwszej restauracji:');
      console.log(JSON.stringify(data.data[0], null, 2));
    }

    return data.data || [];
  } catch (error) {
    console.error('❌ Błąd przy pobieraniu restauracji:', error.message);
    throw error;
  }
}

async function updateRestaurantCover(documentId) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/restaurants/${documentId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          cover: [COVER_ID],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`   Szczegóły błędu: ${errorData}`);
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`❌ Błąd przy aktualizowaniu restauracji ${documentId}:`, error.message);
    throw error;
  }
}

async function publishRestaurant(documentId) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/restaurants/${documentId}/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Błąd przy publikowaniu restauracji ${documentId}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Uruchamianie skryptu dodawania cover images...\n');

  try {
    // Krok 1: Pobierz wszystkie restauracje
    console.log('📥 Pobieranie listy restauracji...');
    const restaurants = await getAllRestaurants();
    console.log(`✅ Znaleziono ${restaurants.length} restauracji\n`);

    if (restaurants.length === 0) {
      console.log('⚠️ Brak restauracji do aktualizacji');
      process.exit(0);
    }

    // Debug: Wyświetl ID restauracji
    const restaurantIds = restaurants.map((r) => r.id).join(', ');
    console.log(`🔍 Pobrane ID restauracji: ${restaurantIds}\n`);

    // Krok 2: Aktualizuj każdą restaurację
    console.log(`🔄 Dodawanie cover ID ${COVER_ID} do restauracji...\n`);
    let successCount = 0;
    let failCount = 0;

    for (const restaurant of restaurants) {
      const documentId = restaurant.documentId;
      const id = restaurant.id;
      const name = restaurant.name || `Restaurant ${id}`;
      const hasCover = restaurant.cover && (restaurant.cover.id || restaurant.cover.data);

      // Pomiń restauracje, które już mają cover
      if (hasCover) {
        console.log(`⏭️  ${name} (ID: ${id}) - już ma cover, pomijam\n`);
        continue;
      }

      try {
        await updateRestaurantCover(documentId);
        console.log(`✅ ${name} (ID: ${id}) - cover zaktualizowany`);

        // Spróbuj opublikować (jeśli draft system jest włączony)
        await publishRestaurant(documentId);
        console.log(`   📤 Opublikowano\n`);

        successCount++;
      } catch (error) {
        console.log(`   ⚠️ Błąd przy aktualizacji\n`);
        failCount++;
      }
    }

    // Podsumowanie
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Pomyślnie: ${successCount}/${restaurants.length}`);
    if (failCount > 0) {
      console.log(`❌ Błędy: ${failCount}/${restaurants.length}`);
    }
    console.log('='.repeat(50));

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Krytyczny błąd:', error.message);
    process.exit(1);
  }
}

main();
