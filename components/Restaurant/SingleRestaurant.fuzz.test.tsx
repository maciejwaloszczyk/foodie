import { render } from '@testing-library/react';
import SingleRestaurant from './SingleRestaurant';
import '@testing-library/jest-dom';
import fc from 'fast-check'; 

// 1. MOCKOWANIE 
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => {
    return <img {...props} />;
  },
}));

describe('SingleRestaurant Fuzzing (Stability Test)', () => {
  
  it('nie powoduje crasha aplikacji przy losowych, dziwnych danych', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.integer(), // Losowa liczba całkowita
          name: fc.string(), // Losowy string (może być pusty, z emoji, bardzo długi)
          image: fc.constant('/placeholder.jpg'), 
          cuisine: fc.string(), 
          rating: fc.float({ noNaN: true, min: 0, max: 10 }), 
          reviewCount: fc.integer(),
          priceRange: fc.string(),
          deliveryTime: fc.string(),
          distance: fc.oneof(fc.string(), fc.constant(undefined)), // String albo brak
          isPromoted: fc.boolean(), 
          description: fc.string(),
          location: fc.constant({ lat: 0, lng: 0 }),
          address: fc.string()
        }),
        (randomRestaurant) => {

          const { container } = render(<SingleRestaurant restaurant={randomRestaurant} />);
          
          // ASERCJA:
          // Jedynym warunkiem sukcesu jest to, że render się udał i cokolwiek powstało.
          expect(container).toBeInTheDocument();
        }
      )
    );
  });
});