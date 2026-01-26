'use client';

import { useEffect, useState, useMemo } from 'react';
import type { Restaurant } from '@/types/restaurant';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  userLocation?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const RestaurantMap = ({
  restaurants,
  userLocation = null,
  center = [51.7592, 19.456], // Domyślne centrum - Łódź
  zoom = 13,
  className = '',
}: RestaurantMapProps) => {
  const [isClient, setIsClient] = useState(false);

  const [userIcon, setUserIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    // Ładowanie Leaflet i konfiguracja domyślnej ikony po stronie klienta
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // Używamy domyślnej ikony Leaflet z CDN
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Tworzenie niestandardowej ikony dla lokalizacji użytkownika
        const customUserIcon = L.default.divIcon({
          className: 'custom-user-marker',
          html: `<div style="background-color: #4F46E5; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(79, 70, 229, 0.6);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        setUserIcon(customUserIcon);
      });
    }
  }, []);

  // Filtruj restauracje, które mają współrzędne
  const restaurantsWithLocation = restaurants.filter((restaurant) => restaurant.location?.lat && restaurant.location?.lng);

  // Dodaj mały offset do restauracji z tymi samymi współrzędnymi
  const restaurantsWithOffset = useMemo(() => {
    const coordMap = new Map<string, number>();

    return restaurantsWithLocation.map((restaurant) => {
      const key = `${restaurant.location!.lat.toFixed(4)},${restaurant.location!.lng.toFixed(4)}`;
      const count = coordMap.get(key) || 0;
      coordMap.set(key, count + 1);

      // Dodaj offset dla duplikatów (spirala wokół punktu)
      if (count > 0) {
        const angle = count * 45 * (Math.PI / 180); // co 45 stopni
        const offset = 0.0003 * count; // mały offset
        return {
          ...restaurant,
          location: {
            lat: restaurant.location!.lat + offset * Math.cos(angle),
            lng: restaurant.location!.lng + offset * Math.sin(angle),
          },
        };
      }
      return restaurant;
    });
  }, [restaurantsWithLocation]);

  console.log(`🗺️ Mapa otrzymała ${restaurants.length} restauracji, z lokalizacją: ${restaurantsWithLocation.length}`);

  // Generuj unikalny klucz dla mapy bazujący na center i zoom
  const mapKey = useMemo(() => `map-${center[0]}-${center[1]}-${zoom}`, [center, zoom]);

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`} style={{ minHeight: '400px' }}>
        <p className="text-gray-500 dark:text-gray-400">Ładowanie mapy...</p>
      </div>
    );
  }

  if (restaurantsWithLocation.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`} style={{ minHeight: '400px' }}>
        <p className="text-gray-500 dark:text-gray-400">Brak restauracji do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer key={mapKey} center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', minHeight: '400px' }} className="z-0 rounded-lg">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {restaurantsWithOffset.map((restaurant) => (
          <Marker key={restaurant.id} position={[restaurant.location!.lat, restaurant.location!.lng]}>
            <Popup>
              <Link href={`/restaurant/${restaurant.id}`}>
                <div className="min-w-[200px] cursor-pointer hover:bg-gray-50 rounded p-2 -m-2">
                  <h3 className="mb-2 text-lg font-bold text-black hover:text-primary transition">{restaurant.name}</h3>
                  <div className="text-sm text-gray-700">
                    <p className="!m-0 !p-0">
                      <span className="font-semibold">Kuchnie:</span> {restaurant.cuisine}
                    </p>
                    <p className="!m-0 !p-0">
                      <span className="font-semibold">Ocena:</span> ⭐ {restaurant.rating} ({restaurant.reviewCount} opinii)
                    </p>
                    {restaurant.distance && (
                      <p className="!m-0 !p-0">
                        <span className="font-semibold">Odległość:</span> {restaurant.distance}
                      </p>
                    )}
                    {restaurant.address && <p className="!mt-2 !mb-0 !mx-0 !p-0 text-xs text-gray-600">📍 {restaurant.address}</p>}
                  </div>
                  <p className="!mt-2 !mb-0 !mx-0 !p-0 text-xs text-primary font-semibold">Kliknij aby zobaczyć szczegóły →</p>
                </div>
              </Link>
            </Popup>
          </Marker>
        ))}

        {/* Marker lokalizacji użytkownika */}
        {userLocation && userIcon && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="mb-1 text-base font-bold text-primary">📍 Twoja lokalizacja</h3>
                <p className="text-xs text-gray-600">Jesteś tutaj</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;
