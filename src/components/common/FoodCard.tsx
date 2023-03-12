import Checkbox from "./Checkbox";
import FoodOptionDialog from "./FoodOptionDialog";
import { type FoodOption, type FoodOptionItem, type Food } from "@prisma/client";
import Image from "next/image";
import React, { useState } from "react";


interface FoodOptionItemStates {
  FoodOptionItem: (FoodOptionItem & { isChecked: boolean });
}


const FoodCard = ({
  food,
}: {
  food: Food & {
    FoodOption: (FoodOption & {
      FoodOptionItem: FoodOptionItem[];
    })[];
  };
}) => {
  let listFoodOptionItem: FoodOptionItem[] = [];

  console.log(listFoodOptionItem);

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div
        className="flex h-28 overflow-hidden rounded-2xl bg-white"
        key={food.id}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-28 shrink-0">
          <Image
            src={food.image}
            fill
            alt="Restaurant Image"
            className="object-cover"
            priority
          />
        </div>
        <div className="p-4 text-virparyasMainBlue">
          <div className="h-full">
            <h2 className="font-bold">{food.name}</h2>
            <p className="mt-1 text-sm">${food.price.toString()}</p>
            <p className="mt-1 text-xs font-light">{food.description}</p>
          </div>
        </div>
      </div>
      <FoodOptionDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <div
          className="h-28 bg-black/50 p-4 text-white"
          style={{
            background: `linear-gradient(#00000080, #00000080), url(${
              food.image || ""
            }) no-repeat center center/cover`,
          }}
        >
          <div className="mt-8">
            <h2 className="text-lg font-bold">{food.name}</h2>
            <p className="mt-1 text-sm">${food.price.toString()}</p>
          </div>
        </div>
        <div className="m-4 flex flex-col gap-4">
          {food.FoodOption.map((option) => (
            <div key={option.id} className="text-virparyasMainBlue">
              <p className="text-lg font-semibold">{option.name}</p>
              {option.FoodOptionItem.map((item) => (
                <div className="flex gap-2" key={item.id}>
                  <Checkbox foodOptionItem={item} listFoodOptionItem={listFoodOptionItem} />
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </FoodOptionDialog>
    </>
  );
};

export default FoodCard;