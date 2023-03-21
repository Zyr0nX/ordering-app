import BackArrowIcon from "../icons/BackArrowIcon";
import CartIcon from "../icons/CartIcon";
import { type Restaurant } from "@prisma/client";
import Link from "next/link";
import React from "react";

const RestaurantDetailHeader = ({
  restaurant,
}: {
  restaurant: Restaurant | null;
}) => {
  return (
    <div
      className="bg-black/50 p-6 text-white"
      style={{
        background: `linear-gradient(#00000080, #00000080), url(${
          restaurant?.brandImage || ""
        }) no-repeat center center/cover`,
      }}
    >
      <div className="flex w-full items-center justify-between">
        <div>
          <BackArrowIcon className="fill-white" />
        </div>
        <Link href="/cart">
          <CartIcon />
        </Link>
      </div>
      <div className="mt-8">
        <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
        <p className="mt-2 text-sm">10am - 10pm, $2 - $10 Delivery Fee</p>
        <p className="mt-1 text-xs">{restaurant?.address}</p>
      </div>
    </div>
  );
};

export default RestaurantDetailHeader;
