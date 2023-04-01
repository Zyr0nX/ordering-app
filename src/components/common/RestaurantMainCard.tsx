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
  distance: number | null;
}

const RestaurantMainCard: React.FC<RestaurantMainCardProps> = ({
  displayFavorite,
  restaurant,
  setRestaurantList,
  restaurantList,
  distance,
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
            src={restaurant.image || ""}
            fill
            alt="Restaurant Image"
            className="object-cover"
          />
        </div>
        <div className="px-4 py-3">
          <p className="text-xl font-semibold">{restaurant.name}</p>
          {distance && <p className="text-xs">${Math.max(Math.round(distance * 1.2), 5)} - ${Math.max(Math.round(distance * 1.5), 6)} Delivery Fee</p>}
        </div>
      </Link>
      {displayFavorite && (
        <>
          {favoriteMutation.isLoading || unfavotiteMutation.isLoading ? (
            <div className="absolute right-0 top-0 z-10 m-2 rounded-full bg-white p-2">
              <Loading className="fill-virparyasMainBlue h-5 w-5 animate-spin text-gray-200" />
            </div>
          ) : restaurant.favorite.length > 0 ? (
            <button
              type="button"
              className="absolute right-0 top-0 z-10 m-2 rounded-full bg-white p-2"
              onClick={handleUnfavorite}
            >
              <HeartIcon className="fill-virparyasMainBlue" />
            </button>
          ) : (
            <button
              type="button"
              className="absolute right-0 top-0 z-10 m-2 rounded-full bg-white p-2"
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
