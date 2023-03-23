import AccountIcon from "../icons/AccountIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import CartIcon from "../icons/CartIcon";
import EmptyStarIcon from "../icons/EmptyStarIcon";
import FullStarIcon from "../icons/FullStarIcon";
import HalfStarIcon from "../icons/HalfStarIcon";
import UserIcon from "../icons/UserIcon";
import { type Restaurant } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const RestaurantDetailHeader = ({
  restaurant,
  rating,
}: {
  restaurant: Restaurant | null;
  rating: number | null;
}) => {
  // const roundedRating = Math.round(((rating || 5) * 2) / 2);
  const roundedRating = 3.5;
  return (
    <div className="relative">
      <Image
        src={restaurant?.brandImage || ""}
        fill
        alt="Restaurant Image"
        className="object-cover brightness-50"
        priority
      />
      <div className="relative p-4 text-white">
        <div className="flex w-full items-center justify-between">
          <Link href="/">
            <BackArrowIcon className="fill-white" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/account">
              <AccountIcon />
            </Link>
            <Link href="/cart">
              <CartIcon />
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
          <p className="mt-2 text-sm">10am - 10pm, $2 - $10 Delivery Fee</p>
          <p className="mt-1 text-xs">{restaurant?.address}</p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingDiff = i - roundedRating;
              if (ratingDiff <= -1) {
                return <FullStarIcon key={i} />;
              } else if (ratingDiff < 0) {
                return <HalfStarIcon key={i} />;
              } else {
                return <EmptyStarIcon key={i} />;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailHeader;
