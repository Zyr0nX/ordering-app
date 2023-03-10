import { type CartItem, type Cart, type Food } from "@prisma/client";
import React from "react";
import CartCard from "../common/CartCard";


const CartBody = ({
  cart,
}: {
  cart:
    | (Cart & {
        CartItem: (CartItem & {
          food: Food;
        })[];
      })
    | null;
}) => {
  console.log(cart);
  return <div className="m-4"><CartCard /></div>;
};

export default CartBody;