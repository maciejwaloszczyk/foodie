'use client';
import ScrollUp from '@/components/Common/ScrollUp';
import Hero from '@/components/Hero';
import FeaturedRestaurants from '@/components/Restaurant/FeaturedRestaurants';
import TopRated from '@/components/Restaurant/TopRated';
import OurChoice from '@/components/Restaurant/OurChoice';
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
      <Hero />
      <FeaturedRestaurants />
      <TopRated />
      <OurChoice />
      <NearbyRestaurants />
    </>
  );
}
