'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
}

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export interface GeolocationContextType {
  userLocation: UserLocation | null;
  locationLabel: string | null;
  isResolvingLocation: boolean;
  locationStatus: LocationStatus;
  locationError: string | null;
  requestLocation: () => void;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Reverse geocoding effect
  useEffect(() => {
    const resolveLocationName = async () => {
      if (!userLocation) return;
      setIsResolvingLocation(true);
      setLocationLabel(null);

      try {
        const query = new URL('https://nominatim.openstreetmap.org/reverse');
        query.searchParams.append('format', 'jsonv2');
        query.searchParams.append('lat', String(userLocation.lat));
        query.searchParams.append('lon', String(userLocation.lng));
        query.searchParams.append('zoom', '18');
        query.searchParams.append('addressdetails', '1');

        const response = await fetch(query.toString(), {
          headers: {
            'Accept-Language': 'pl,en;q=0.8',
          },
        });

        if (!response.ok) throw new Error('Reverse geocoding failed');

        const data = await response.json();
        const street = data?.address?.road;
        const houseNumber = data?.address?.house_number;
        const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.municipality;
        const district = data?.address?.suburb || data?.address?.city_district;
        const country = data?.address?.country;

        let label = '';
        if (street) {
          label = houseNumber ? `${street} ${houseNumber}` : street;
          if (city) label += `, ${city}`;
        } else if (city) {
          label = city;
        } else if (district) {
          label = district;
        } else if (country) {
          label = country;
        }

        setLocationLabel(label || null);
      } catch (err) {
        console.error('Reverse geocoding error:', err);
        setLocationLabel(null);
      } finally {
        setIsResolvingLocation(false);
      }
    };

    resolveLocationName();
  }, [userLocation]);

  const requestLocation = useCallback(() => {
    if (!navigator?.geolocation) {
      setLocationStatus('unavailable');
      setLocationError('Twoja przeglądarka nie wspiera geolokalizacji.');
      return;
    }

    setLocationError(null);
    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus('granted');
      },
      (error) => {
        setLocationStatus('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Brak zgody na udostępnienie lokalizacji.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Lokalizacja niedostępna. Spróbuj ponownie.');
            break;
          case error.TIMEOUT:
            setLocationError('Przekroczono limit czasu podczas pobierania lokalizacji.');
            break;
          default:
            setLocationError('Nie udało się pobrać lokalizacji.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return (
    <GeolocationContext.Provider
      value={{
        userLocation,
        locationLabel,
        isResolvingLocation,
        locationStatus,
        locationError,
        requestLocation,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (context === undefined) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
};
