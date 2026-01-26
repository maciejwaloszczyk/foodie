// Utility functions for geolocation

export const calculateDistanceKm = (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (distanceKm: number) => {
  if (Number.isNaN(distanceKm)) return undefined;
  const precision = distanceKm < 10 ? 1 : 0;
  return `${distanceKm.toFixed(precision)} km`;
};
