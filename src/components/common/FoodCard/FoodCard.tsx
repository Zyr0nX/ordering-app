import { trpc } from "../../../utils/api";
import type { Food } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import React from "react";

const FoodCard = ({ data }: { data: Food }) => {
  const cartMutation = trpc.cart.addItems.useMutation();

  const addToCart: MouseEventHandler<HTMLButtonElement> = () => {
    cartMutation.mutate({ foodId: data.id, quantity: 1 });
  };

  return (
    <div>
      <div className="relative">
        <Image src={data.image} alt="food image" width={500} height={500} />
      </div>

      <h2 className="">{data.name}</h2>
      <button onClick={addToCart}>Add to card</button>
    </div>
  );
};

export default FoodCard;
