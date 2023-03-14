import CommonButton from "./CommonButton";
import ItemCart from "./ItemCart";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import Image from "next/image";
import React, { useState } from "react";

const CartCard = ({
  item,
}: {
  item: {
    restaurant: Restaurant;
    cart: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
}) => {
  const [quantities, setQuantities] = useState(
    item.cart.reduce((acc, item) => {
      return { ...acc, [item.id]: item.quantity };
    }, {})
  );
  const [totalPrice, setTotalPrice] = useState(
    item.cart.reduce((acc, item) => {
      return (
        acc +
        (item.food.price +
          item.foodOption
            .map((option) => option.price)
            .reduce((a, b) => a + b, 0) *
            item.quantity)
      );
    }, 0)
  );

  const price = item.cart.reduce((acc, item) => {
    return (
      acc +
      (item.food.price +
        item.foodOption
          .map((option) => option.price)
          .reduce((a, b) => a + b, 0) *
          item.quantity)
    );
  }, 0);
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="relative w-full bg-black/50 p-4 text-white">
        <Image
          src={item.restaurant.brandImage || ""}
          fill
          alt="Restaurant Image"
          className="object-cover brightness-50"
          priority
        />
        <div className="relative z-10">
          <p className="mt-4 text-2xl font-bold">{item.restaurant.name}</p>
          <p className="mt-1 text-xs">{item.restaurant.address}</p>
        </div>
      </div>
      <div>
        <div className="m-4 text-virparyasMainBlue">
          <div className="mx-4 my-2 flex flex-col gap-4">
            <ul className="flex list-decimal flex-col gap-2">
              {item.cart.map((item) => (
                <ItemCart item={item} key={item.id} />
              ))}
            </ul>
            <CommonButton text={`Checkout - $${totalPrice.toFixed(2)}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
