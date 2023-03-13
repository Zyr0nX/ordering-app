import Checkbox from "./Checkbox";
import CommonButton from "./CommonButton";
import FoodOptionDialog from "./FoodOptionDialog";
import {
  type FoodOption,
  type FoodOptionItem,
  type Food,
} from "@prisma/client";
import Image from "next/image";
import React, { Fragment, useState } from "react";
import { api } from "~/utils/api";

const FoodCard = ({
  food,
}: {
  food: Food & {
    foodOption: (FoodOption & {
      foodOptionItem: FoodOptionItem[];
    })[];
  };
}) => {
  const [listFoodOptionItem, setListFoodOptionItem] = useState<
    FoodOptionItem[]
  >([]);

  const [totalPrice, setTotalPrice] = useState(food.price);

  const handleFoodOptionItem = (item: FoodOptionItem) => {
    if (listFoodOptionItem.includes(item)) {
      setListFoodOptionItem(listFoodOptionItem.filter((i) => i !== item));
      setTotalPrice(totalPrice - item.price);
    } else {
      setListFoodOptionItem((prevState) => [...prevState, item]);
      setTotalPrice(totalPrice + item.price);
    }
  };

  const resetState = () => {
    setTimeout(() => {
      setTotalPrice(food.price);
    }, 300);
    setListFoodOptionItem([]);
    setIsOpen(false);
  };

  const addToCartMutation = api.cart.addItems.useMutation();

  const AddToCart = () => {
    addToCartMutation.mutate({
      foodId: food.id,
      quantity: 1,
      foodOptionids: listFoodOptionItem.map((item) => item.id),
    });
    resetState();
  };

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
      <FoodOptionDialog
        isOpen={isOpen}
        onClose={resetState}
        setIsOpen={setIsOpen}
      >
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
        <div className="flex flex-col gap-4 bg-white p-4">
          {food.foodOption.map((option) => (
            <div key={option.id} className="text-virparyasMainBlue">
              <p className="mb-2 text-lg font-bold">{option.name}</p>
              <div className="flex flex-col gap-2">
                {option.foodOptionItem.map((item) => (
                  <Fragment key={item.id}>
                    <div className="flex justify-between">
                      <Checkbox
                        label={item.name}
                        handleChange={() => handleFoodOptionItem(item)}
                      />
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                    <div className="h-0.5 w-full bg-virparyasBackground last:hidden"></div>
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white px-8 pb-4">
          <CommonButton
            text={`Add to Cart - $${totalPrice.toFixed(2)}`}
            onClick={AddToCart}
          />
        </div>
      </FoodOptionDialog>
    </>
  );
};

export default FoodCard;
