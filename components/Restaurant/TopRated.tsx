import SectionTitle from "../Common/SectionTitle";
import SingleRestaurant from "./SingleRestaurant";
import restaurantData from "./data/restaurantData";

const TopRated = () => {
  // Sort by rating and take top 6
  const topRatedRestaurants = [...restaurantData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <section className="bg-primary-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"> {/* <-- ZMIANA TŁA */}
      <div className="container">
        <SectionTitle
          title="Najlepiej oceniane"
          paragraph="Odkryj restauracje z najwyższymi ocenami naszych użytkowników"
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
          {topRatedRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="w-full">
              <SingleRestaurant restaurant={restaurant} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRated;