import RestaurantFavoriteCard from "../common/RestaurantFavoriteCard";
import RestaurantCard from "../common/RestaurantMainCard";
import AccountIcon from "../icons/AccountIcon";
import CartIcon from "../icons/CartIcon";
import HeartIcon from "../icons/HeartIcon";
import HouseIcon from "../icons/HouseIcon";
import SearchIcon from "../icons/SearchIcon";
import SleepIcon from "../icons/SleepIcon";
import { createId } from "@paralleldrive/cuid2";
import { type Restaurant, type Favorite, type Cuisine } from "@prisma/client";
import fuzzysort from "fuzzysort";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRef } from "react";
import { api } from "~/utils/api";

const HomeBody = ({
  cuisines,
  restaurants,
}: {
  cuisines: Cuisine[];
  restaurants: (Restaurant & {
    favorite: Favorite[];
  })[];
}) => {
  const session = useSession();
  const utils = api.useContext();

  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);

  const [restaurantList, setRestaurantList] = useState<
    (Restaurant & {
      favorite: Favorite[];
    })[]
  >(restaurants);

  const restaurantQuery = api.restaurant.getRestaurantForUser.useQuery(
    undefined,
    {
      initialData: restaurants,
      onSuccess: (data) => {
        setRestaurantList(data);
      },
      refetchOnWindowFocus: false,
    }
  );

  const favoriteMutation = api.user.favoriteRestaurant.useMutation({
    onMutate: (data) => {
      setRestaurantList((old) => {
        return old.map((restaurant) => {
          if (restaurant.id === data.restaurantId) {
            restaurant.favorite = [
              {
                id: createId(),
                userId: session.data?.user.id || "",
                restaurantId: restaurant.id,
              },
            ];
          }
          return restaurant;
        });
      });
    },
    onSettled: async () => {
      await utils.restaurant.getRestaurantForUser.invalidate();
    },
  });

  const unfavotiteMutation = api.user.unfavoriteRestaurant.useMutation({
    onMutate: (data) => {
      setRestaurantList((old) => {
        return old.map((restaurant) => {
          if (restaurant.id === data.restaurantId) {
            restaurant.favorite = [];
          }
          return restaurant;
        });
      });
    },
    onSettled: async () => {
      await utils.restaurant.getRestaurantForUser.invalidate();
    },
  });

  const handleFavorite = (id: string) => {
    favoriteMutation.mutate({
      restaurantId: id,
    });
  };
  const handleUnfavorite = (id: string) => {
    unfavotiteMutation.mutate({
      restaurantId: id,
    });
  };

  // const [allRestaurants, setAllRestaurants] = useState<
  //   | (Restaurant & {
  //       favorite: Favorite[];
  //     })[]
  //   | undefined
  // >(undefined);
  // console.log(allRestaurants);

  const searchRef = useRef<HTMLInputElement>(null);

  const handleSelectCuisine = (cuisine: Cuisine) => {
    if (selectedCuisine?.id === cuisine.id) {
      setRestaurantList(() => {
        if (searchRef.current?.value === "") {
          return restaurantQuery.data;
        } else {
          const result = fuzzysort.go(
            searchRef.current?.value as string,
            restaurantQuery.data,
            {
              keys: ["name"],
            }
          );
          return result.map((restaurant) => {
            return restaurant.obj;
          });
        }
      });
      setSelectedCuisine(null);
      return;
    }
    setRestaurantList(() => {
      if (searchRef.current?.value === "") {
        return restaurantQuery.data.filter((restaurant) => {
          if (restaurant.cuisineId === cuisine.id) {
            return true;
          }
          return false;
        });
      } else {
        const result = fuzzysort.go(
          searchRef.current?.value as string,
          restaurantQuery.data,
          {
            keys: ["name"],
          }
        );
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
      }
    });
    setSelectedCuisine(cuisine);
  };

  const handleSearch = (query: string) => {
    if (query === "") {
      setRestaurantList(() => {
        if (selectedCuisine) {
          return restaurantQuery.data.filter((restaurant) => {
            if (restaurant.cuisineId === selectedCuisine.id) {
              return true;
            }
            return false;
          });
        }
        return restaurantQuery.data;
      });

      return;
    }
    const result = fuzzysort.go(query, restaurantQuery.data, {
      keys: ["name"],
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
      <div className="bg-gradient-to-r from-viparyasDarkBlue/80 to-virparyasLightBrown/80 p-4 text-white md:p-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl bg-white/40 py-2 px-4">
            <HouseIcon className="md:h-6 md:w-6" />
            <p className="text-xs font-semibold text-virparyasMainBlue md:text-base md:font-bold">
              123 34th St
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/account">
              <AccountIcon className="fill-white md:h-10 md:w-10" />
            </Link>
            <Link href="/cart">
              <CartIcon className="fill-white md:h-10 md:w-10" />
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
              ref={searchRef}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 bg-virparyasBackground px-4 py-6 text-virparyasMainBlue md:flex-row md:gap-8">
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
                  // <div
                  //   className="relative overflow-hidden rounded-2xl bg-white"
                  //   key={restaurant.id}
                  // >
                  //   <Link
                  //     href={`/restaurant/${restaurant.name}/${restaurant.id}`}
                  //     className="relative"
                  //   >
                  //     <div className="relative h-36">
                  //       <Image
                  //         src={restaurant.brandImage || ""}
                  //         fill
                  //         alt="Restaurant Image"
                  //         className="object-cover"
                  //       />
                  //     </div>
                  //     <div className="py-3 px-4">
                  //       <p className="text-xl font-semibold">
                  //         {restaurant.name}
                  //       </p>
                  //       <p className="text-xs">$2 - $10 Delivery Fee</p>
                  //     </div>
                  //   </Link>
                  //   {restaurant.favorite.length > 0 ? (
                  //     <button
                  //       type="button"
                  //       className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
                  //       onClick={() => handleUnfavorite(restaurant.id)}
                  //     >
                  //       <HeartIcon className="fill-virparyasMainBlue" />
                  //     </button>
                  //   ) : (
                  //     <button
                  //       type="button"
                  //       className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
                  //       onClick={() => handleFavorite(restaurant.id)}
                  //     >
                  //       <HeartIcon />
                  //     </button>
                  //   )}
                  // </div>
                  <RestaurantCard
                    restaurant={restaurant}
                    key={restaurant.id}
                    setRestaurantList={setRestaurantList}
                    restaurantList={restaurantList}
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
