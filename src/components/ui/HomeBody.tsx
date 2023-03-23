import HeartIcon from "../icons/HeartIcon";
import { type Restaurant, type Favorite, type Cuisine } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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
  const utils = api.useContext();

  const [selectedCuisine, setSelectedCuisine] = useState<Cuisine | null>(null);

  const restaurantQuery = api.restaurant.getRestaurantForUser.useQuery(
    undefined,
    {
      initialData: restaurants,
    }
  );

  const favoriteMutation = api.user.favoriteRestaurant.useMutation({
    onMutate: async (data) => {
      await utils.restaurant.getRestaurantForUser.cancel();
      const prevData = utils.restaurant.getRestaurantForUser.getData();
      utils.restaurant.getRestaurantForUser.setData(undefined, (old) => {
        return old?.map((restaurant) => {
          if (restaurant.id === data.restaurantId) {
            restaurant.favorite = [
              {
                id: "1",
                userId: "1",
                restaurantId: restaurant.id,
              },
            ];
          }
          return restaurant;
        });
      });
      return { prevData };
    },
    onSettled: async () => {
      await utils.restaurant.getRestaurantForUser.invalidate();
    },
  });

  const unfavotiteMutation = api.user.unfavoriteRestaurant.useMutation({
    onMutate: async (data) => {
      await utils.restaurant.getRestaurantForUser.cancel();
      const prevData = utils.restaurant.getRestaurantForUser.getData();
      utils.restaurant.getRestaurantForUser.setData(undefined, (old) => {
        return old?.map((restaurant) => {
          if (restaurant.id === data.restaurantId) {
            restaurant.favorite = [];
          }
          return restaurant;
        });
      });
      return { prevData };
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

  const [allRestaurants, setAllRestaurants] = useState<
    | (Restaurant & {
        favorite: Favorite[];
      })[]
    | undefined
  >(undefined);
  console.log(allRestaurants);

  const handleSelectCuisine = async (cuisine: Cuisine) => {
    if (selectedCuisine?.id === cuisine.id || selectedCuisine !== null) {
      await utils.restaurant.getRestaurantForUser.cancel();
      utils.restaurant.getRestaurantForUser.setData(undefined, () => {
        return allRestaurants;
      });
      setSelectedCuisine(null);
      await utils.restaurant.getRestaurantForUser.invalidate();
      return;
    }
    await utils.restaurant.getRestaurantForUser.cancel();
    setAllRestaurants(utils.restaurant.getRestaurantForUser.getData());
    utils.restaurant.getRestaurantForUser.setData(undefined, (old) => {
      return old?.filter((restaurant) => {
        if (restaurant.cuisineId === cuisine.id) {
          return true;
        }
        return false;
      });
    });
    setSelectedCuisine(cuisine);
  };

  return (
    <div className="flex flex-col gap-4 bg-virparyasBackground px-4 py-6 text-virparyasMainBlue">
      <div>
        <p className="mb-4 text-xl font-bold">Cuisines</p>
        <div className="grid grid-flow-col grid-rows-2 gap-4 overflow-x-scroll">
          {cuisines.map((cuisine) => (
            <button
              className={`flex w-40 min-w-full items-center gap-4  rounded-xl p-4 ${
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
      {restaurantQuery.data.filter((restaurant) => {
        if (restaurant.favorite.length > 0) {
          return true;
        }
        return false;
      }).length > 0 && (
        <div>
          <p className="mb-4 text-xl font-bold">Favorites</p>
          <div className="grid grid-flow-col grid-rows-1 gap-4 overflow-x-scroll">
            {restaurantQuery.data
              .filter((restaurant) => {
                if (restaurant.favorite.length > 0) {
                  return true;
                }
                return false;
              })
              .map((restaurant) => (
                <div
                  className="relative w-64 overflow-hidden rounded-2xl bg-white"
                  key={restaurant.id}
                >
                  <Link
                    href={`/restaurant/${restaurant.name}/${restaurant.id}`}
                    className="relative"
                  >
                    <div className="relative h-28">
                      <Image
                        src={restaurant.brandImage || ""}
                        fill
                        alt="Restaurant Image"
                        className="object-cover"
                      />
                    </div>
                    <div className="py-3 px-4">
                      <p className="text-xl font-semibold">{restaurant.name}</p>
                      <p className="text-xs">$2 - $10 Delivery Fee</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
                    onClick={() => handleUnfavorite(restaurant.id)}
                  >
                    <HeartIcon className="fill-virparyasMainBlue" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-4 text-xl font-bold">Recommeded for you</p>
        <div className="grid grid-cols-1 gap-4">
          {restaurantQuery.data.map((restaurant) => (
            <div
              className="relative overflow-hidden rounded-2xl bg-white"
              key={restaurant.id}
            >
              <Link
                href={`/restaurant/${restaurant.name}/${restaurant.id}`}
                className="relative"
              >
                <div className="relative h-36">
                  <Image
                    src={restaurant.brandImage || ""}
                    fill
                    alt="Restaurant Image"
                    className="object-cover"
                  />
                </div>
                <div className="py-3 px-4">
                  <p className="text-xl font-semibold">{restaurant.name}</p>
                  <p className="text-xs">$2 - $10 Delivery Fee</p>
                </div>
              </Link>
              {restaurant.favorite.length > 0 ? (
                <button
                  type="button"
                  className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
                  onClick={() => handleUnfavorite(restaurant.id)}
                >
                  <HeartIcon className="fill-virparyasMainBlue" />
                </button>
              ) : (
                <button
                  type="button"
                  className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
                  onClick={() => handleFavorite(restaurant.id)}
                >
                  <HeartIcon />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBody;