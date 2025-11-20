"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import RestaurantMap from "@/components/Restaurant/RestaurantMap";
import restaurantData from "@/components/Restaurant/restaurantData";

export default function MapPage() {
  return (
    <>
      <Breadcrumb
        pageName="Mapa Restauracji"
        description="Odkryj najlepsze restauracje w Twojej okolicy. Kliknij w znacznik, aby zobaczyć szczegóły."
      />

      <section className="pb-[120px] pt-[120px]">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]">
              Znajdź Swoją Ulubioną Restaurację
            </h2>
            <p className="text-base !leading-relaxed text-body-color md:text-lg">
              Przeglądaj {restaurantData.length} restauracji na mapie i wybierz
              idealną opcję dla siebie
            </p>
          </div>

          {/* Mapa - pełna szerokość */}
          <div className="mx-auto w-full">
            <RestaurantMap
              restaurants={restaurantData}
              center={[51.7592, 19.456]} // Łódź centrum
              zoom={13}
              className="h-[600px] w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Statystyki pod mapą */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">
                {restaurantData.length}
              </h3>
              <p className="text-body-color">Restauracji na mapie</p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">
                {new Set(restaurantData.map((r) => r.cuisine)).size}
              </h3>
              <p className="text-body-color">Rodzaje kuchni</p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">
                {(
                  restaurantData.reduce((acc, r) => acc + r.rating, 0) /
                  restaurantData.length
                ).toFixed(1)}
              </h3>
              <p className="text-body-color">Średnia ocena</p>
            </div>

            <div className="rounded-lg bg-white p-6 text-center shadow-md dark:bg-gray-dark">
              <h3 className="mb-2 text-3xl font-bold text-primary">
                {restaurantData.reduce((acc, r) => acc + r.reviewCount, 0)}
              </h3>
              <p className="text-body-color">Łącznie opinii</p>
            </div>
          </div>

          {/* Lista restauracji pod mapą */}
          <div className="mt-12">
            <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
              Wszystkie Restauracje
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurantData.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-dark"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h4 className="text-xl font-bold text-black dark:text-white">
                      {restaurant.name}
                    </h4>
                    {restaurant.isPromoted && (
                      <span className="rounded-full bg-primary px-3 py-1 text-xs text-white">
                        Promowane
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm text-body-color">
                      {restaurant.cuisine}
                    </span>
                    <span className="text-body-color">•</span>
                    <span className="text-sm font-semibold text-primary">
                      {restaurant.priceRange}
                    </span>
                  </div>

                  <div className="mb-3 flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-black dark:text-white">
                      {restaurant.rating}
                    </span>
                    <span className="text-sm text-body-color">
                      ({restaurant.reviewCount})
                    </span>
                  </div>

                  <div className="mb-3 space-y-1 text-sm text-body-color">
                    <p>🚚 {restaurant.deliveryTime}</p>
                    {restaurant.distance && <p>📍 {restaurant.distance}</p>}
                  </div>

                  {restaurant.address && (
                    <p className="text-xs text-body-color">
                      {restaurant.address}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
