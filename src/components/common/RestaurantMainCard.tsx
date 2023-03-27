import HeartIcon from "../icons/HeartIcon";
import Loading from "./Loading";
import { createId } from "@paralleldrive/cuid2";
import { type Favorite, type Restaurant } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { api } from "~/utils/api";

interface RestaurantMainCardProps {
  displayFavorite: boolean;
  restaurant: Restaurant & {
    favorite: Favorite[];
  };
  setRestaurantList: React.Dispatch<
    React.SetStateAction<
      (Restaurant & {
        favorite: Favorite[];
      })[]
    >
  >;
  restaurantList: (Restaurant & {
    favorite: Favorite[];
  })[];
}

const RestaurantMainCard: React.FC<RestaurantMainCardProps> = ({
  displayFavorite,
  restaurant,
  setRestaurantList,
  restaurantList,
}) => {
  const utils = api.useContext();
  const favoriteMutation = api.user.favoriteRestaurant.useMutation({
    onSuccess: () => {
      setRestaurantList(
        restaurantList.map((r) => {
          if (r.id === restaurant.id) {
            return {
              ...r,
              favorite: [
                {
                  id: createId(),
                  restaurantId: restaurant.id,
                  userId: "",
                },
              ],
            };
          }
          return r;
        })
      );
    },

    onSettled: () => {
      void utils.restaurant.getRestaurantForUser.invalidate();
    },
  });

  const unfavotiteMutation = api.user.unfavoriteRestaurant.useMutation({
    onSuccess: () => {
      setRestaurantList(
        restaurantList.map((r) => {
          if (r.id === restaurant.id) {
            return {
              ...r,
              favorite: [],
            };
          }
          return r;
        })
      );
    },
    onSettled: () => {
      void utils.restaurant.getRestaurantForUser.invalidate();
    },
  });

  const handleFavorite = () => {
    favoriteMutation.mutate({
      restaurantId: restaurant.id,
    });
  };

  const handleUnfavorite = () => {
    unfavotiteMutation.mutate({
      restaurantId: restaurant.id,
    });
  };
  return (
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
      {displayFavorite && (
        <>
          {favoriteMutation.isLoading || unfavotiteMutation.isLoading ? (
            <div className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2">
              <Loading className="h-5 w-5 animate-spin fill-virparyasMainBlue text-gray-200" />
            </div>
          ) : restaurant.favorite.length > 0 ? (
            <button
              type="button"
              className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
              onClick={handleUnfavorite}
            >
              <HeartIcon className="fill-virparyasMainBlue" />
            </button>
          ) : (
            <button
              type="button"
              className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
              onClick={handleFavorite}
            >
              <HeartIcon />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RestaurantMainCard;
