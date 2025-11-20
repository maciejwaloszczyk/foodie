"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "@/types/restaurant";
import dynamic from "next/dynamic";

// Dynamiczny import Leaflet aby uniknąć problemów z SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface RestaurantMapProps {
  restaurants: Restaurant[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const RestaurantMap = ({
  restaurants,
  center = [51.7592, 19.456], // Domyślne centrum - Łódź
  zoom = 13,
  className = "",
}: RestaurantMapProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Ładowanie Leaflet i konfiguracja domyślnej ikony po stronie klienta
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Używamy domyślnej ikony Leaflet z CDN
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
      });
    }
  }, []);

  // Filtruj restauracje, które mają współrzędne
  const restaurantsWithLocation = restaurants.filter(
    (restaurant) => restaurant.location?.lat && restaurant.location?.lng
  );

  if (!isClient) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ minHeight: "400px" }}
      >
        <p className="text-gray-500 dark:text-gray-400">Ładowanie mapy...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", minHeight: "400px" }}
        className="z-0 rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurantsWithLocation.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.location!.lat, restaurant.location!.lng]}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="mb-2 text-lg font-bold text-black">
                  {restaurant.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-semibold">Kuchnia:</span>{" "}
                    {restaurant.cuisine}
                  </p>
                  <p>
                    <span className="font-semibold">Ocena:</span> ⭐{" "}
                    {restaurant.rating} ({restaurant.reviewCount} opinii)
                  </p>
                  <p>
                    <span className="font-semibold">Cena:</span>{" "}
                    {restaurant.priceRange}
                  </p>
                  <p>
                    <span className="font-semibold">Dostawa:</span>{" "}
                    {restaurant.deliveryTime}
                  </p>
                  {restaurant.distance && (
                    <p>
                      <span className="font-semibold">Odległość:</span>{" "}
                      {restaurant.distance}
                    </p>
                  )}
                  {restaurant.address && (
                    <p className="mt-2 text-xs text-gray-600">
                      📍 {restaurant.address}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;
