import {
  type CartItem,
  type Food,
  type FoodOptionItem,
  type Order,
  type Restaurant,
} from "@prisma/client";
import React from "react";

const CheckoutBody = ({
  order,
}: {
  order: Order & {
    cartItem: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
}) => {
  return <div>CheckoutBody</div>;
};

export default CheckoutBody;
