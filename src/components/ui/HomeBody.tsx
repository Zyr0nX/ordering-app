import HeartIcon from "../icons/HeartIcon";
import TacosIcon from "../icons/TacosIcon";
import { type Restaurant, type Favorite } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const HomeBody = ({
  restaurants,
}: {
  restaurants: (Restaurant & {
    Favorite: Favorite[];
  })[];
}) => {
  const handleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Favorite");
  };

  const getFavorites = () => {
    return restaurants.filter((restaurant) => {
      if (restaurant.Favorite.length > 0) {
        return true;
      }
      return false;
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-virparyasBackground px-4 py-6 text-virparyasMainBlue">
      <div>
        <p className="mb-4 text-xl font-bold">Categories</p>
        <div className="grid grid-flow-col grid-rows-2 gap-4 overflow-x-scroll">
          <div className="flex w-40 gap-4 rounded-xl bg-white p-4">
            <TacosIcon />
            <p className="text-sm font-semibold">Food</p>
          </div>
          <div className="w-40 rounded-xl bg-white p-4">
            <p className="text-sm font-semibold">Food</p>
          </div>
          <div className="w-40 rounded-xl bg-white p-4">
            <p className="text-sm font-semibold">Food</p>
          </div>
          <div className="w-40 rounded-xl bg-white p-4">
            <p className="text-sm font-semibold">Food</p>
          </div>
          <div className="w-40 rounded-xl bg-white p-4">
            <p className="text-sm font-semibold">Food</p>
          </div>
          <div className="w-40 rounded-xl bg-white p-4">
            <p className="text-sm font-semibold">Food</p>
          </div>
        </div>
      </div>
      {getFavorites().length > 0 && (
        <div>
          <p className="mb-4 text-xl font-bold">Favorites</p>
          <div className="grid grid-flow-col grid-rows-1 gap-4 overflow-x-scroll">
            {getFavorites().map((restaurant) => (
              <Link
                href="/restaurant/slug"
                className="relative w-64 overflow-hidden rounded-2xl bg-white"
                key={restaurant.id}
              >
                <div className="relative h-28">
                  <Image
                    src={restaurant.brandImage || ""}
                    fill
                    alt="Restaurant Image"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="py-3 px-4">
                  <p className="text-xl font-semibold">{restaurant.name}</p>
                  <p className="text-xs">$2 - $10 Delivery Fee</p>
                </div>
                <button
                  type="button"
                  className="absolute top-0 right-0 z-10 m-2 rounded-full bg-white"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="p-2">
                    <HeartIcon className="fill-virparyasMainBlue" />
                  </div>
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-4 text-xl font-bold">Recommeded for you</p>
        <div className="grid grid-cols-1 gap-4">
          {restaurants.map((restaurant) => (
            <Link
              href={`/restaurant/${restaurant.name}/${restaurant.id}`}
              className="relative overflow-hidden rounded-2xl bg-white"
              key={restaurant.id}
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
              <button
                type="button"
                className="pointer-events-auto absolute top-0 right-0 z-10 m-2 rounded-full bg-white"
                onClick={handleFavorite}
              >
                <div className="p-2">
                  <HeartIcon
                    className={
                      restaurant.Favorite.length > 0 ? "fill-virparyasMainBlue" : ""
                    }
                  />
                </div>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeBody;