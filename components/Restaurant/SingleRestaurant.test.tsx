import { render, screen } from '@testing-library/react';
import SingleRestaurant from './SingleRestaurant';
import '@testing-library/jest-dom';

// 1. MOCKOWANIE NEXT/IMAGE

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// 2. DANE TESTOWE
// Tworzymy przykładowy obiekt restauracji zgodny z typem
const mockRestaurant = {
  id: 123,
  name: 'Pizzeria u Testera',
  image: '/images/pizza-test.jpg', 
  cuisine: 'Włoska',
  rating: 4.8,
  reviewCount: 99,
  priceRange: '$$',
  deliveryTime: '30 min',
  distance: '2.5 km',
  isPromoted: false, 
  description: 'Opis',
  location: { lat: 0, lng: 0 },
  address: 'Ulica Testowa'
};

describe('SingleRestaurant Component', () => {

  it('renderuje podstawowe informacje o restauracji', () => {
    render(<SingleRestaurant restaurant={mockRestaurant} />);

    expect(screen.getByText('Pizzeria u Testera')).toBeInTheDocument();
    
    // Sprawdzamy kuchnię i cenę
    // Używamy regex 
    expect(screen.getByText(/Włoska/)).toBeInTheDocument();
    expect(screen.getByText(/\$\$/)).toBeInTheDocument();

    // Sprawdzamy czas dostawy
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('wyświetla poprawnie ocenę i liczbę recenzji', () => {
    // @ts-ignore
    render(<SingleRestaurant restaurant={mockRestaurant} />);

    // Ocena 4.8
    expect(screen.getByText('4.8')).toBeInTheDocument();
    // Liczba recenzji w nawiasie
    expect(screen.getByText('(99 recenzji)')).toBeInTheDocument();
  });

  it('generuje poprawne linki do strony szczegółów', () => {
    // @ts-ignore
    render(<SingleRestaurant restaurant={mockRestaurant} />);


    const links = screen.getAllByRole('link');
    

    expect(links[0]).toHaveAttribute('href', '/restaurant/123');
  });

  it('wyświetla zdjęcie z poprawnym atrybutem alt i src', () => {
    render(<SingleRestaurant restaurant={mockRestaurant} />);

    const img = screen.getByRole('img');
    
    expect(img).toHaveAttribute('src', '/images/pizza-test.jpg');
    expect(img).toHaveAttribute('alt', 'Pizzeria u Testera');
  });

  it('warunkowo wyświetla badge "Promowane"', () => {

    const { rerender } = render(<SingleRestaurant restaurant={mockRestaurant} />);
    
    // queryByText zwraca null jak nie znajdzie (zamiast rzucać błąd), co pozwala użyć not.toBeInTheDocument
    expect(screen.queryByText('Promowane')).not.toBeInTheDocument();

    // SCENARIUSZ 2: Promowane
    const promotedRestaurant = { ...mockRestaurant, isPromoted: true };
    

    rerender(<SingleRestaurant restaurant={promotedRestaurant} />);
    
    expect(screen.getByText('Promowane')).toBeInTheDocument();
  });

  it('nie wyświetla dystansu, jeśli go brakuje', () => {
    // Tworzymy wersję bez dystansu (np. null lub undefined)
    const noDistRestaurant = { ...mockRestaurant, distance: undefined };


    render(<SingleRestaurant restaurant={noDistRestaurant} />);


    expect(screen.queryByText('2.5 km')).not.toBeInTheDocument();
  });
});