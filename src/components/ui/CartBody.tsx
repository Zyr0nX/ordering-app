import CartCard from "../common/CartCard";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import React from "react";

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
  const cartList = cart
    .map((item) => item.food.restaurant)
    .filter(
      (value, index, self) => index === self.findIndex((t) => t.id === value.id)
    )
    .map((restaurant) => {
      return cart
        .filter((item) => item.food.restaurant.id === restaurant.id)
        .map((item) => ({
          ...item,
          food: {
            ...item.food,
            restaurant,
          },
        }));
    });
  return (
    <div className="m-4 flex flex-col gap-4">
      {cartList.map((cart) => (
        <CartCard cart={cart} key={cart.toString()} />
      ))}
    </div>
  );
};

export default CartBody;
