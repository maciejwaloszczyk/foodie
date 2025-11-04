import SectionTitle from "../Common/SectionTitle";
import restaurantData from "./restaurantData";
import Image from "next/image";
import Link from "next/link";

const OurChoice = () => {
  // Get the highest rated restaurant as editor's choice
  const editorChoice = restaurantData.reduce((prev, current) =>
    prev.rating > current.rating ? prev : current,
  );

  // Get 2 more highly rated restaurants for smaller cards
  const otherChoices = [...restaurantData]
    .filter((r) => r.id !== editorChoice.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2);

  return (
    <section className="bg-primary-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"> {/* <-- ZMIANA TŁA */}
      <div className="container">
        <SectionTitle
          title="Nasz wybór"
          paragraph="Redakcja Foodie poleca te wyjątkowe miejsca"
          center
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Main featured restaurant - larger card */}
          <div className="lg:col-span-2">
            <div
              className="wow fadeInUp hover:shadow-two dark:hover:shadow-gray-dark group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 dark:bg-bg-color-dark" // <-- ZMIANA (dark tło)
              data-wow-delay=".1s"
            >
              <Link
                href={`/restaurant/${editorChoice.id}`}
                className="relative block aspect-[16/9] w-full lg:aspect-[21/9]"
              >
                <span className="absolute left-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold capitalize text-white"> {/* <-- SAM SIĘ NAPRAWIŁ */}
                  🏆 Wybór Redakcji
                </span>
                <Image
                  src={editorChoice.image}
                  alt={editorChoice.name}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="p-8 sm:p-10 md:p-12 lg:p-14">
                <div className="mb-4 flex items-center justify-between">
                  <h3>
                    <Link
                      href={`/restaurant/${editorChoice.id}`}
                      className="text-2xl font-bold text-text-main hover:text-primary dark:text-white dark:hover:text-primary sm:text-3xl lg:text-4xl" // <-- ZMIANA (kolor tekstu)
                    >
                      {editorChoice.name}
                    </Link>
                  </h3>
                  <div className="flex items-center rounded-full bg-primary/10 px-4 py-2"> {/* <-- TŁO SAMO SIĘ NAPRAWIŁO */}
                    <svg
                      className="mr-2 h-6 w-6 fill-current text-yellow" // <-- ZMIANA (kolor gwiazdki)
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-xl font-bold text-text-main dark:text-white"> {/* <-- ZMIANA (kolor tekstu) */}
                      {editorChoice.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="mb-4 text-base font-medium text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                  {editorChoice.cuisine} • {editorChoice.priceRange}
                </p>

                <p className="mb-6 text-base leading-relaxed text-light dark:text-body-color-dark lg:text-lg"> {/* <-- ZMIANA (kolor tekstu) */}
                  {editorChoice.description}
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 fill-current text-light dark:text-body-color-dark" // <-- ZMIANA (kolor ikony)
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm.5-13H9v6l5.25 3.15.75-1.23-4.5-2.67V5z" />
                    </svg>
                    <span className="text-sm text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                      {editorChoice.deliveryTime}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 fill-current text-light dark:text-body-color-dark" // <-- ZMIANA (kolor ikony)
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5c-1.381 0-2.5-1.119-2.5-2.5S8.619 4.5 10 4.5s2.5 1.119 2.5 2.5S11.381 9.5 10 9.5z" />
                    </svg>
                    <span className="text-sm text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                      {editorChoice.distance}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                      {editorChoice.reviewCount} recenzji
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two smaller featured cards */}
          {otherChoices.map((restaurant, index) => (
            <div key={restaurant.id} className="w-full">
              <div
                className="wow fadeInUp hover:shadow-two dark:hover:shadow-gray-dark group relative overflow-hidden rounded-sm bg-white shadow-one duration-300 dark:bg-bg-color-dark" // <-- ZMIANA (dark tło)
                data-wow-delay={`.${index + 2}s`}
              >
                <Link
                  href={`/restaurant/${restaurant.id}`}
                  className="relative block aspect-[16/9] w-full"
                >
                  <span className="absolute right-6 top-6 z-20 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold capitalize text-white"> {/* <-- SAM SIĘ NAPRAWIŁ */}
                    Polecane
                  </span>
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="p-6 sm:p-8">
                  <h3>
                    <Link
                      href={`/restaurant/${restaurant.id}`}
                      className="mb-2 block text-xl font-bold text-text-main hover:text-primary dark:text-white dark:hover:text-primary sm:text-2xl" // <-- ZMIANA (kolor tekstu)
                    >
                      {restaurant.name}
                    </Link>
                  </h3>
                  <p className="mb-4 text-sm font-medium text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                    {restaurant.cuisine} • {restaurant.priceRange}
                  </p>
                  <p className="mb-6 text-base text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                    {restaurant.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-stroke border-opacity-10 pt-4 dark:border-white dark:border-opacity-10"> {/* <-- ZMIANA (kolor linii) */}
                    <div className="flex items-center">
                      <svg
                        className="mr-1 h-5 w-5 fill-current text-yellow" // <-- ZMIANA (kolor gwiazdki)
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-base font-semibold text-text-main dark:text-white"> {/* <-- ZMIANA (kolor tekstu) */}
                        {restaurant.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-light dark:text-body-color-dark"> {/* <-- ZMIANA (kolor tekstu) */}
                      {restaurant.deliveryTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurChoice;