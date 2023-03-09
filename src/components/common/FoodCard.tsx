import { type Food } from "@prisma/client";
import Image from "next/image";
import React from "react";

const FoodCard = ({ food }: { food: Food }) => {
  const [quantity, setQuantity] = React.useState(0);

  const handleDecrement = () => {
    if (quantity === 0) return;
    setQuantity(quantity - 1);
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };
  return (
    <div
      className="flex h-36 overflow-hidden rounded-2xl bg-white"
      key={food.id}
    >
      <div className="relative w-36 shrink-0">
        <Image
          src={food.image}
          fill
          alt="Restaurant Image"
          className="object-cover"
          priority
        />
      </div>
      <div className="p-4 text-virparyasMainBlue">
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="font-bold">{food.name}</h2>
            <p className="mt-1 text-[10px]">${food.price.toString()}</p>
            <p className="h- mt-1 text-[8px] font-light">{food.description}</p>
          </div>
          <div className="mt-1 flex w-fit items-center rounded-lg bg-virparyasBackground ">
            <button type="button" className="px-2" onClick={handleDecrement}>
              -
            </button>
            <input
              type="text"
              className="w-8 bg-transparent text-center focus-within:outline-none"
              defaultValue={0}
              value={quantity}
            />
            <button type="button" className="px-2" onClick={handleIncrement}>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
