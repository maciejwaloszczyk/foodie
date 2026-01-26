import { Restaurant } from '@/types/restaurant';
import Image from 'next/image';
import Link from 'next/link';

const SingleRestaurant = ({ restaurant }: { restaurant: Restaurant }) => {
  const { name, image, cuisine, rating, reviewCount, priceRange, deliveryTime, distance } = restaurant;

  return (
    <>
      <div
        className="wow fadeInUp hover:shadow-two dark:hover:shadow-gray-dark group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 dark:bg-bg-color-dark" // <-- ZMIANA (dark:bg-dark na dark:bg-bg-color-dark)
        data-wow-delay=".1s"
      >
        <Link href={`/restaurant/${restaurant.id}`} className="relative block aspect-[37/22] w-full">
          {restaurant.isPromoted && (
            <span className="absolute right-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white">
              {' '}
              {/* <-- SAM SIĘ NAPRAWIŁ (bg-primary) */}
              Promowane
            </span>
          )}
          <Image src={image} alt={name} fill className="object-cover" />
        </Link>
        <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
          <h3>
            <Link
              href={`/restaurant/${restaurant.id}`}
              className="mb-2 block overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold text-text-main hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl" // <-- ZMIANA (text-black na text-text-main)
              title={name}
            >
              {name}
            </Link>
          </h3>
          <p className="mb-4 text-sm font-medium text-light dark:text-body-color-dark">
            {' '}
            {/* <-- ZMIANA (text-body-color na text-light) */}
            {cuisine} • {priceRange}
          </p>

          <div className="mb-6 flex items-center border-b border-stroke border-opacity-10 pb-6 dark:border-white dark:border-opacity-10">
            {' '}
            {/* <-- ZMIANA (border-body-color na border-stroke) */}
            <div className="flex items-center">
              <svg
                className="mr-1 h-5 w-5 fill-current text-yellow" // <-- ZMIANA (text-yellow-400 na text-yellow)
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-base font-semibold text-text-main dark:text-white">
                {' '}
                {/* <-- ZMIANA (text-dark na text-text-main) */}
                {rating.toFixed(1)}
              </span>
              <span className="ml-2 text-sm text-light dark:text-body-color-dark">
                {' '}
                {/* <-- ZMIANA (text-body-color na text-light) */}({reviewCount} recenzji)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 fill-current text-light dark:text-body-color-dark" // <-- ZMIANA (text-body-color na text-light)
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.5-13H9v6l5.25 3.15.75-1.23-4.5-2.67V5z" />
              </svg>
              <span className="text-sm text-light dark:text-body-color-dark">
                {' '}
                {/* <-- ZMIANA (text-body-color na text-light) */}
                {deliveryTime}
              </span>
            </div>
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 fill-current text-light dark:text-body-color-dark" // <-- ZMIANA (text-body-color na text-light)
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
              </svg>
              <span className="text-sm text-light dark:text-body-color-dark">
                {' '}
                {/* <-- ZMIANA (text-body-color na text-light) */}
                {distance || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleRestaurant;
