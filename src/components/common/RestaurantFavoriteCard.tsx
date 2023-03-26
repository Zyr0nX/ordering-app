import HeartIcon from "../icons/HeartIcon";
import Loading from "./Loading";
import { type Restaurant, type Favorite } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { api } from "~/utils/api";

interface RestaurantFavoriteCardProps {
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

const RestaurantFavoriteCard: React.FC<RestaurantFavoriteCardProps> = ({
  restaurant,
  setRestaurantList,
  restaurantList,
}) => {
  const utils = api.useContext();
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

  const handleUnfavorite = (id: string) => {
    unfavotiteMutation.mutate({
      restaurantId: id,
    });
  };

  return (
    <div
      className="relative w-full min-w-[16rem] overflow-hidden rounded-2xl bg-white md:w-full md:min-w-0"
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
      {unfavotiteMutation.isLoading ? (
        <div className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2">
          <Loading className="h-5 w-5 animate-spin fill-virparyasMainBlue text-gray-200" />
        </div>
      ) : (
        <button
          type="button"
          className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white p-2"
          onClick={() => handleUnfavorite(restaurant.id)}
        >
          <HeartIcon className="fill-virparyasMainBlue" />
        </button>
      )}
    </div>
  );
};

export default RestaurantFavoriteCard;
