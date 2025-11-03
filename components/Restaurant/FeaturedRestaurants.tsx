"use client";
import { useState, useRef } from "react";
import SectionTitle from "../Common/SectionTitle";
import SingleRestaurant from "./SingleRestaurant";
import restaurantData from "./restaurantData";

const FeaturedRestaurants = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const featuredRestaurants = restaurantData.filter(
    (restaurant) => restaurant.isPromoted,
  );

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(checkScrollability, 300);
    }
  };

  return (
    <section
      id="featured"
      className="bg-primary-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28" // <-- ZMIANA TŁA
    >
      <div className="container">
        <SectionTitle
          title="Proponowane"
          paragraph="Sprawdź najlepsze restauracje, które polecamy dzisiaj"
          center
        />

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 dark:bg-dark dark:hover:bg-gray-dark"
              aria-label="Przewiń w lewo"
            >
              <svg
                className="h-6 w-6 fill-current text-text-main dark:text-white" // <-- ZMIANA KOLORU IKONY
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="min-w-[300px] flex-shrink-0 sm:min-w-[350px] lg:min-w-[400px]"
              >
                <SingleRestaurant restaurant={restaurant} />
              </div>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 dark:bg-dark dark:hover:bg-gray-dark"
              aria-label="Przewiń w prawo"
            >
              <svg
                className="h-6 w-6 fill-current text-text-main dark:text-white" // <-- ZMIANA KOLORU IKONY
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedRestaurants;