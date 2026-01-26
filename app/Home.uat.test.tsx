import { render, screen, fireEvent } from '@testing-library/react';
import Home from './page'; 
import { useAuth } from '@/lib/useAuth';
import '@testing-library/jest-dom';

// 1. MOCKOWANIE Nawigacji
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// 2. MOCKOWANIE AUTH
jest.mock('@/lib/useAuth', () => ({
  useAuth: jest.fn(),
}));

// 3. MOCKOWANIE KOMPONENTÓW DZIECI
jest.mock('@/components/Hero', () => {
  return () => (
    <div data-testid="hero-section">
      <h1>Witaj w Foodie!</h1>
      <button onClick={() => require('next/navigation').useRouter().push('/restaurants')}>
        Odkryj Restauracje
      </button>
    </div>
  );
});

// Resztę mockujemy prosto, żeby nie przeszkadzała
jest.mock('@/components/Restaurant/FeaturedRestaurants', () => () => <div>Featured</div>);
jest.mock('@/components/Restaurant/FilteredRestaurantsSection', () => () => <div>Filtered</div>);
jest.mock('@/components/Restaurant/TopRated', () => () => <div>Top Rated</div>);
jest.mock('@/components/Restaurant/NearbyRestaurants', () => () => <div>Nearby</div>);
jest.mock('@/components/Common/ScrollUp', () => () => null);

describe('Home Page UAT - Scenariusz Startowy', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Użytkownik (Gość) wchodzi na stronę i klika przycisk nawigacji w Hero', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });


    render(<Home />);


    expect(screen.getByText('Witaj w Foodie!')).toBeInTheDocument();


    const ctaButton = screen.getByText('Odkryj Restauracje');
    fireEvent.click(ctaButton);


    expect(mockPush).toHaveBeenCalledWith('/restaurants');
  });
});