import { render, screen } from '@testing-library/react';
import TopRated from './TopRated';
import '@testing-library/jest-dom';
import { getRestaurantsWithStats } from '@/lib/restaurants';

// 1. MOCKOWANIE FUNKCJI API
jest.mock('@/lib/restaurants', () => ({
  getRestaurantsWithStats: jest.fn(),
}));

// 2. MOCKOWANIE KOMPONENTÓW DZIECI
jest.mock('./SingleRestaurant', () => {
  return function DummySingleRestaurant({ restaurant }: { restaurant: any }) {
    return (
      <div data-testid="restaurant-item">
        {restaurant.name} - {restaurant.rating}
      </div>
    );
  };
});

// Mockujemy SectionTitle
jest.mock('../Common/SectionTitle', () => {
  return function DummySectionTitle({ title }: { title: string }) {
    return <h1>{title}</h1>;
  };
});

// 3. DANE TESTOWE
const mockApiResponse = {
  data: [
    { id: 1, name: 'Restauracja 5.0', avg_rating: 5.0, categories: [] },
    { id: 2, name: 'Restauracja 4.9', avg_rating: 4.9, categories: [] },
    { id: 3, name: 'Restauracja 4.8', avg_rating: 4.8, categories: [] },
    { id: 4, name: 'Restauracja 4.7', avg_rating: 4.7, categories: [] },
    { id: 5, name: 'Restauracja 4.6', avg_rating: 4.6, categories: [] },
    { id: 6, name: 'Restauracja 4.5', avg_rating: 4.5, categories: [] },
    { id: 7, name: 'Restauracja 4.4', avg_rating: 4.4, categories: [] },
    { id: 8, name: 'Restauracja 4.3', avg_rating: 4.3, categories: [] },
    { id: 9, name: 'Restauracja 4.2', avg_rating: 4.2, categories: [] },
    // Ta restauracja jest najsłabsza i powinna zostać odcięta 
    { id: 10, name: 'Restauracja 3.0', avg_rating: 3.0, categories: [] },
  ]
};

describe('TopRated Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderuje tytuł sekcji', async () => {
    (getRestaurantsWithStats as jest.Mock).mockResolvedValue({ data: [] });
    
    render(<TopRated />);
    

    expect(await screen.findByText('Najlepiej oceniane')).toBeInTheDocument();
  });

  it('wyświetla spinner ładowania na początku', () => {
    // Nie musimy czekać na promise, sprawdzamy stan początkowy
    (getRestaurantsWithStats as jest.Mock).mockReturnValue(new Promise(() => {})); 
    
    render(<TopRated />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('pobiera dane, sortuje malejąco i wyświetla dokładnie 9 najlepszych', async () => {
    // Symulujemy odpowiedź API
    (getRestaurantsWithStats as jest.Mock).mockResolvedValue(mockApiResponse);

    render(<TopRated />);

    // Czekamy aż pojawią się elementy listy (to oznacza, że loading zniknął)
    const items = await screen.findAllByTestId('restaurant-item');

    // 1. Sprawdzamy limit (slice(0,9))
    expect(items).toHaveLength(9);

    // 2. Sprawdzamy kolejność 
    expect(items[0]).toHaveTextContent('Restauracja 5.0 - 5');

    // 3. Sprawdzamy ostatnią wyświetloną (powinna być ta z oceną 4.2)
    expect(items[8]).toHaveTextContent('Restauracja 4.2 - 4.2');
  });

  it('nie wyświetla restauracji, która nie mieści się w top 9', async () => {
    (getRestaurantsWithStats as jest.Mock).mockResolvedValue(mockApiResponse);

    render(<TopRated />);
    
    await screen.findAllByTestId('restaurant-item');

    // Restauracja z id 10 nie powinna być widoczna
    expect(screen.queryByText(/Restauracja 3.0/)).not.toBeInTheDocument();
  });

  it('wyświetla komunikat o braku danych, gdy API zwróci puste dane', async () => {
    (getRestaurantsWithStats as jest.Mock).mockResolvedValue({ data: [] });

    render(<TopRated />);

    const noDataMessage = await screen.findByText('Brak restauracji do wyświetlenia');
    expect(noDataMessage).toBeInTheDocument();
  });

  it('obsługuje błąd API wyświetlając brak restauracji (i logując błąd)', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    (getRestaurantsWithStats as jest.Mock).mockRejectedValue(new Error('Błąd API'));

    render(<TopRated />);

    const noDataMessage = await screen.findByText('Brak restauracji do wyświetlenia');
    expect(noDataMessage).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});