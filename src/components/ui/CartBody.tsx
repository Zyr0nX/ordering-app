import CartCard from "../common/CartCard";
import CommonButton from "../common/CommonButton";
import NoCartIcon from "../icons/NoCartIcon";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import Link from "next/link";
import React, { useState } from "react";
import { api } from "~/utils/api";

const CartBody = ({
  cart,
}: {
  cart: (CartItem & {
    food: Food & {
      restaurant: Restaurant;
    };
    foodOption: FoodOptionItem[];
  })[];
}) => {
  const [cartList, setCartList] = useState<
    {
      restaurant: Restaurant;
      cart: (CartItem & {
        food: Food & {
          restaurant: Restaurant;
        };
        foodOption: FoodOptionItem[];
      })[];
    }[]
  >(
    cart
      .map((item) => item.food.restaurant)
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      )
      .map((restaurant) => {
        return {
          restaurant,
          cart: cart.filter(
            (item) => item.food.restaurant.id === restaurant.id
          ),
        };
      })
  );

  api.cart.getCart.useQuery(undefined, {
    initialData: cart,
    onSuccess: (data) => {
      setCartList(
        data
          .map((item) => item.food.restaurant)
          .filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.id === value.id)
          )
          .map((restaurant) => {
            return {
              restaurant,
              cart: data.filter(
                (item) => item.food.restaurant.id === restaurant.id
              ),
            };
          })
      );
    },
  });

  if (cartList.length === 0) {
    return (
      <div className="text-virparyasMainBlue m-4 mx-auto flex flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 md:w-fit">
        <NoCartIcon className="md:h-32 md:w-32" />
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold md:text-3xl">
            Your cart is currently empty
          </h2>
          <p className="text-xs font-light md:text-base">
            but we have plenty of options for you to choose from
          </p>
        </div>

        <Link href="/" className="w-full">
          <CommonButton text="Continue Shopping" />
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-4 my-6 grid grid-cols-1 gap-4 md:mx-32 md:my-8 md:grid-cols-2 md:gap-8">
      {cartList.map((item) => (
        <CartCard item={item} key={item.restaurant.id} />
      ))}
    </div>
  );
};

export default CartBody;
