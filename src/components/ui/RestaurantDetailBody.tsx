import Image from "next/image";
import React from "react";

const RestaurantDetailBody = ({
  food,
}: {
  food: {
    image: string;
    id: string;
    name: string;
    price: number;
    description: string;
  }[];
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
      {food.map((item) => (
        <div
          className="flex h-36 overflow-hidden rounded-2xl bg-white"
          key={item.id}
        >
          <div className="relative w-36 shrink-0">
            <Image
              src={item.image}
              fill
              alt="Restaurant Image"
              className="object-cover"
              priority
            />
          </div>
          <div className="p-4 text-virparyasMainBlue">
            <h2 className="text-xs font-bold">{item.name}</h2>
            <p className="mt-1 text-[10px]">${item.price.toString()}</p>
            <p className="mt-1 text-[8px] font-light">{item.description}</p>
            <div className="mt-1 flex w-fit items-center rounded-lg bg-virparyasBackground ">
              <button type="button" className="px-2">
                -
              </button>
              <input
                type="text"
                className="w-8 bg-transparent text-center focus-within:outline-none"
                defaultValue={0}
              />
              <button type="button" className="px-2">
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantDetailBody;
