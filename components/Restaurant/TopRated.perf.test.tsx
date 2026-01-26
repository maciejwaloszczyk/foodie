import { render } from '@testing-library/react';
import TopRated from './TopRated';
import { getRestaurantsWithStats } from '@/lib/restaurants';

// 1. MOCKOWANIE 
jest.mock('@/lib/restaurants', () => ({
  getRestaurantsWithStats: jest.fn(),
}));


jest.mock('./SingleRestaurant', () => () => <div />);
jest.mock('../Common/SectionTitle', () => () => <div />);

describe('TopRated Performance Benchmark', () => {
  
  it('renderuje się 1000 razy w czasie poniżej 1 sekundy (Stress Test)', async () => {
    // Przygotowanie danych 
    (getRestaurantsWithStats as jest.Mock).mockResolvedValue({ data: [] });

    const iterations = 1000;
    const startTime = performance.now();

    // Pętla obciążeniowa
    for (let i = 0; i < iterations; i++) {

      const { unmount } = render(<TopRated />);
      unmount();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`Czas wykonania ${iterations} renderów: ${duration.toFixed(2)} ms`);
    console.log(`Średni czas na jeden render: ${(duration / iterations).toFixed(4)} ms`);

    // ASERCJA WYDAJNOŚCI
    expect(duration).toBeLessThan(1000); 
  });
});