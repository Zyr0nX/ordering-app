import RestaurantFavoriteCard from "../common/RestaurantFavoriteCard";
import RestaurantCard from "../common/RestaurantMainCard";
import AccountIcon from "../icons/AccountIcon";
import CartIcon from "../icons/CartIcon";
import HouseIcon from "../icons/HouseIcon";
import LoginIcon from "../icons/LoginIcon";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import {
  type Restaurant,
  type Favorite,
  type Cuisine,
  type User,
} from "@prisma/client";
import fuzzysort from "fuzzysort";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api } from "~/utils/api";
import haversine from "~/utils/haversine";

interface HomeBodyProps {
  cuisines: Cuisine[];
  restaurants: (Restaurant & {
    favorite: Favorite[];
  })[];
  user: User | null | undefined;
}

const HomeBody: React.FC<HomeBodyProps> = ({ cuisines, restaurants, user }) => {
  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);

  const [restaurantList, setRestaurantList] = useState<
    (Restaurant & {
      favorite: Favorite[];
    })[]
  >(restaurants);

  const [search, setSearch] = useState("");

  const restaurantQuery = api.restaurant.getRestaurantForUser.useQuery(
    undefined,
    {
      initialData: restaurants,
      onSuccess: (data) => {
        setRestaurantList(data);
      },
      refetchOnWindowFocus: false,
      enabled: search === "" && selectedCuisine === null,
    }
  );

  const handleSelectCuisine = (cuisine: Cuisine) => {
    if (selectedCuisine?.id === cuisine.id) {
      setRestaurantList(() => {
        const result = fuzzysort.go(search, restaurantQuery.data, {
          keys: ["name"],
          all: true,
        });
        return result.map((restaurant) => {
          return restaurant.obj;
        });
      });
      setSelectedCuisine(null);
      return;
    }
    setRestaurantList(() => {
      const result = fuzzysort.go(search, restaurantQuery.data, {
        keys: ["name"],
        all: true,
      });
      return result
        .map((restaurant) => {
          return restaurant.obj;
        })
        .filter((restaurant) => {
          if (restaurant.cuisineId === cuisine.id) {
            return true;
          }
          return false;
        });
    });
    setSelectedCuisine(cuisine);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    const result = fuzzysort.go(query, restaurantQuery.data, {
      keys: ["name"],
      all: true,
    });
    setRestaurantList(
      result
        .map((restaurant) => {
          return restaurant.obj;
        })
        .filter((restaurant) => {
          if (selectedCuisine) {
            if (restaurant.cuisineId === selectedCuisine.id) {
              return true;
            }
            return false;
          }
          return true;
        })
    );
  };

  return (
    <>
      <div className="from-viparyasDarkBlue/80 to-virparyasLightBrown/80 bg-gradient-to-r p-4 text-white md:p-8">
        <div className="flex w-full items-center justify-between">
          {user?.address ? (
            <Link
              className="flex items-center gap-2 rounded-xl bg-white/40 px-4 py-2"
              href="/account/information"
            >
              <HouseIcon className="md:h-6 md:w-6" />
              <p className="text-virparyasMainBlue text-xs font-semibold md:text-base md:font-bold">
                {user.address}
              </p>
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/account">
                <AccountIcon className="h-8 w-8 fill-white md:h-10 md:w-10" />
              </Link>
            ) : (
              <Link href="/login">
                <LoginIcon className="h-8 w-8 fill-white md:h-10 md:w-10" />
              </Link>
            )}
            <Link href="/cart">
              <CartIcon className="h-8 w-8 fill-white md:h-10 md:w-10" />
            </Link>
          </div>
        </div>
        <div className="mx-auto md:w-[45rem]">
          <p className="py-4 text-xl font-medium md:text-4xl">
            What are you craving for?
          </p>
          <div className="flex h-12 w-full items-center rounded-xl bg-white/40">
            <div className="p-3">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="h-full w-full bg-transparent placeholder:text-sm placeholder:font-light placeholder:text-white focus-within:outline-none"
              placeholder="Food, drinks, restaurants, ..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="bg-virparyasBackground text-virparyasMainBlue flex flex-col gap-4 px-4 py-6 md:flex-row md:gap-8">
        <div className="shrink-0">
          <p className="mb-4 text-xl font-bold">Cuisines</p>
          <div className="grid grid-flow-col grid-rows-2 gap-4 overflow-x-auto md:grid-flow-row md:grid-cols-1 md:grid-rows-none">
            {cuisines.map((cuisine) => (
              <button
                className={`flex w-40 min-w-full items-center gap-4 rounded-xl p-4 md:w-48 ${
                  selectedCuisine?.id === cuisine.id
                    ? "bg-virparyasMainBlue text-white"
                    : "bg-white"
                }`}
                key={cuisine.id}
                onClick={() => void handleSelectCuisine(cuisine)}
              >
                <Image
                  src={cuisine.image}
                  width={24}
                  height={24}
                  alt="cuisine-logo"
                  className={`${
                    selectedCuisine?.id === cuisine.id
                      ? "brightness-0 invert"
                      : ""
                  }`}
                />
                <p className="truncate text-sm font-semibold">{cuisine.name}</p>
              </button>
            ))}
          </div>
        </div>
        {restaurantList.length > 0 ? (
          <div className="flex grow flex-col gap-4">
            {restaurantList.filter((restaurant) => {
              if (restaurant.favorite.length > 0) {
                return true;
              }
              return false;
            }).length > 0 && (
              <div>
                <p className="mb-4 text-xl font-bold">Favorites</p>
                <div className="grid grid-flow-col grid-rows-1 gap-4 overflow-x-scroll md:grid-cols-3 md:grid-rows-none md:overflow-x-visible">
                  {restaurantList
                    .filter((restaurant) => {
                      if (restaurant.favorite.length > 0) {
                        return true;
                      }
                      return false;
                    })
                    .map((restaurant) => (
                      <RestaurantFavoriteCard
                        restaurant={restaurant}
                        key={restaurant.id}
                        setRestaurantList={setRestaurantList}
                        restaurantList={restaurantList}
                        distance={
                          !user || !user.latitude || !user.longitude
                            ? null
                            : haversine(
                                restaurant.latitude,
                                restaurant.longitude,
                                user.latitude,
                                user.longitude
                              )
                        }
                      />
                    ))}
                </div>
              </div>
            )}

            <div>
              <p className="mb-4 text-xl font-bold">
                {!selectedCuisine ? "Recommeded for you" : selectedCuisine.name}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {restaurantList.map((restaurant) => (
                  <RestaurantCard
                    displayFavorite={!!user}
                    restaurant={restaurant}
                    key={restaurant.id}
                    setRestaurantList={setRestaurantList}
                    restaurantList={restaurantList}
                    distance={
                      !user || !user.latitude || !user.longitude
                        ? null
                        : haversine(
                            restaurant.latitude,
                            restaurant.longitude,
                            user.latitude,
                            user.longitude
                          )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grow">
            <div className="mx-auto mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 md:w-96 md:p-12">
              <SleepIcon />
              <p className="text-center text-xl font-bold">
                Sorry, we couldn&apos;t find what you&apos;re looking for
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomeBody;
