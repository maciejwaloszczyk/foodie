'use client';
import ScrollUp from '@/components/Common/ScrollUp';
import Hero from '@/components/Hero';
import FilteredRestaurantsSection from '@/components/Restaurant/FilteredRestaurantsSection';
import FeaturedRestaurants from '@/components/Restaurant/FeaturedRestaurants';
import TopRated from '@/components/Restaurant/TopRated';
import NearbyRestaurants from '@/components/Restaurant/NearbyRestaurants';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollUp />
      {!isAuthenticated && <Hero />}
      <FeaturedRestaurants />
      <FilteredRestaurantsSection />
      <TopRated />
      <NearbyRestaurants />
    </>
  );
}
