import RestaurantAdminCard from "../common/RestaurantAdminCard";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import { type Restaurant, type User, type Cuisine } from "@prisma/client";
import fuzzysort from "fuzzysort";
import React, { useState } from "react";
import { api } from "~/utils/api";

interface AdminRestaurantsBodyProps {
  restaurants: (Restaurant & {
    user: User;
    cuisine: Cuisine;
  })[];
  cuisines: Cuisine[];
}

const AdminRestaurantsBody: React.FC<AdminRestaurantsBodyProps> = ({
  restaurants,
  cuisines,
}) => {
  const [search, setSearch] = useState("");

  const [restaurantList, setRestaurantList] = useState<
    (Restaurant & {
      user: User;
      cuisine: Cuisine;
    })[]
  >(restaurants);

  const restaurantQuery = api.admin.getApprovedRestaurants.useQuery(undefined, {
    initialData: restaurants,
    refetchInterval: 5000,
    enabled: search === "",
    onSuccess: (data) => {
      if (search === "") setRestaurantList(data);
    },
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    if (query === "") {
      setRestaurantList(restaurantQuery.data);
      return;
    }
    setRestaurantList(() => {
      const result = fuzzysort.go(search, restaurantQuery.data, {
        keys: ["name"],
        all: true,
      });
      return result.map((restaurant) => {
        return restaurant.obj;
      });
    });
  };

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl bg-white">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center bg-virparyasMainBlue px-4">
          <SearchIcon className="h-8 w-8 fill-white" />
        </div>
      </div>
      <div className="mt-4">
        {restaurantList.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No restaurants found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {restaurantList.map((restaurant) => (
              <RestaurantAdminCard
                restaurant={restaurant}
                cuisines={cuisines}
                restaurantList={restaurantList}
                setRestaurantList={setRestaurantList}
                key={restaurant.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRestaurantsBody;
