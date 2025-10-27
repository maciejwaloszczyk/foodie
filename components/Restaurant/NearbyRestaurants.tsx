"use client";
import { useState, useEffect } from "react";
import SectionTitle from "../Common/SectionTitle";
import restaurantData from "./restaurantData";
import Image from "next/image";
import Link from "next/link";

const NearbyRestaurants = () => {
  const [nearbyRestaurants, setNearbyRestaurants] = useState(restaurantData);
  const [isLoading, setIsLoading] = useState(false);

  // In the future, this will fetch from /api/nearby
  // For now, we sort by distance
  useEffect(() => {
    const sortedByDistance = [...restaurantData].sort((a, b) => {
      const distanceA = parseFloat(a.distance?.replace(" km", "") || "999");
      const distanceB = parseFloat(b.distance?.replace(" km", "") || "999");
      return distanceA - distanceB;
    });
    setNearbyRestaurants(sortedByDistance);
  }, []);

  return (
    <section className="bg-white dark:bg-gray-dark py-16 md:py-20 lg:py-28">
      <div className="container">
        <SectionTitle
          title="W twojej okolicy"
          paragraph="Znajdź najlepsze restauracje w Twojej okolicy"
          center
        />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {nearbyRestaurants.map((restaurant, index) => (
              <div
                key={restaurant.id}
                className="wow fadeInUp hover:shadow-two dark:hover:shadow-gray-dark group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 dark:bg-dark"
                data-wow-delay={`.${index + 1}s`}
              >
                <Link
                  href={`/restaurant/${restaurant.id}`}
                  className="flex flex-col sm:flex-row"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full sm:aspect-square sm:w-48 md:w-56 lg:w-64">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div>
                      <div className="mb-2 flex items-start justify-between">
                        <h3 className="text-xl font-bold text-black hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl">
                          {restaurant.name}
                        </h3>
                        <div className="ml-4 flex items-center rounded-full bg-primary/10 px-3 py-1">
                          <svg
                            className="mr-1 h-4 w-4 fill-current text-yellow-400"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-sm font-semibold text-dark dark:text-white">
                            {restaurant.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <p className="mb-3 text-sm font-medium text-body-color dark:text-body-color-dark">
                        {restaurant.cuisine} • {restaurant.priceRange}
                      </p>

                      {restaurant.description && (
                        <p className="mb-4 text-base text-body-color dark:text-body-color-dark">
                          {restaurant.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-body-color border-opacity-10 pt-4 dark:border-white dark:border-opacity-10">
                      {restaurant.distance && (
                        <div className="flex items-center">
                          <svg
                            className="mr-2 h-5 w-5 fill-current text-primary"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
                          </svg>
                          <span className="font-semibold text-dark dark:text-white">
                            {restaurant.distance}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 fill-current text-body-color dark:text-body-color-dark"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.5-13H9v6l5.25 3.15.75-1.23-4.5-2.67V5z" />
                        </svg>
                        <span className="text-sm text-body-color dark:text-body-color-dark">
                          {restaurant.deliveryTime}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-5 w-5 fill-current text-body-color dark:text-body-color-dark"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-body-color dark:text-body-color-dark">
                          {restaurant.reviewCount} recenzji
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyRestaurants;
