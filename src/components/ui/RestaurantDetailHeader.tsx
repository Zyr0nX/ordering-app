import BackArrowIcon from "../icons/BackArrowIcon";
import CartIcon from "../icons/CartIcon";
import React from "react";

const RestaurantDetailHeader = ({
  restaurant,
}: {
  restaurant: {
    address: string;
    food: {
      image: string;
      id: string;
      name: string;
      price: number;
    }[];
    id: string;
    name: string;
    brandImage: string | null;
  } | null;
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
        <div>
          <CartIcon />
        </div>
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