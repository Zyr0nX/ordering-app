import AccountIcon from "../icons/AccountIcon";
import BackArrowIcon from "../icons/BackArrowIcon";
import CartIcon from "../icons/CartIcon";
import EmptyStarIcon from "../icons/EmptyStarIcon";
import FullStarIcon from "../icons/FullStarIcon";
import HalfStarIcon from "../icons/HalfStarIcon";
import LoginIcon from "../icons/LoginIcon";
import UserIcon from "../icons/UserIcon";
import { type Restaurant } from "@prisma/client";
import { useSession } from "next-auth/react";
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
  const session = useSession();
  const roundedRating = Math.round(((rating || 5) * 2) / 2);
  return (
    <div className="relative">
      <Image
        src={restaurant?.brandImage || ""}
        fill
        alt="Restaurant Image"
        className="object-cover brightness-50"
        priority
      />
      <div className="relative w-full p-4 text-white md:p-8">
        <div className="flex w-full items-center justify-between md:absolute md:w-[calc(100%-4rem)]">
          <Link href="/">
            <BackArrowIcon className="fill-white md:h-10 md:w-10" />
          </Link>
          <div className="flex items-center gap-4">
            {session.status === "authenticated" ? (
              <Link href="/account">
                <AccountIcon className="fill-white md:h-10 md:w-10" />
              </Link>
            ) : (
              <Link href="/login">
                <LoginIcon className="fill-white md:h-10 md:w-10" />
              </Link>
            )}
            <Link href="/cart">
              <CartIcon className="fill-white md:h-10 md:w-10" />
            </Link>
          </div>
        </div>
        <div className="mt-4 md:mx-32 md:mt-2">
          <h1 className="text-2xl font-bold md:text-5xl">{restaurant?.name}</h1>
          <p className="mt-2 text-sm md:text-2xl">
            10am - 10pm, $2 - $10 Delivery Fee
          </p>
          <p className="mt-1 text-xs md:text-base">{restaurant?.address}</p>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const ratingDiff = i - roundedRating;
              if (ratingDiff <= -1) {
                return <FullStarIcon key={i} className="md:h-8 md:w-8" />;
              } else if (ratingDiff < 0) {
                return <HalfStarIcon key={i} className="md:h-8 md:w-8" />;
              } else {
                return <EmptyStarIcon key={i} className="md:h-8 md:w-8" />;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailHeader;
