import Checkbox from "./Checkbox";
import CommonButton from "./CommonButton";
import FoodOptionDialog from "./FoodOptionDialog";
import Loading from "./Loading";
import {
  type FoodOption,
  type FoodOptionItem,
  type Food,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
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

  const session = useSession();

  const addToCartMutation = api.cart.addItems.useMutation();

  const AddToCart = async () => {
    await addToCartMutation.mutateAsync({
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
        className="flex h-28 overflow-hidden rounded-2xl bg-white md:h-36"
        key={food.id}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-28 shrink-0 md:w-36">
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
            <h2 className="font-bold line-clamp-1">{food.name}</h2>
            <p className="mt-1 text-sm">${food.price.toString()}</p>
            <p className="mt-1 text-xs font-light line-clamp-2 md:line-clamp-4">
              {food.description}
            </p>
          </div>
        </div>
      </div>
      <FoodOptionDialog
        isOpen={isOpen}
        onClose={resetState}
        setIsOpen={setIsOpen}
      >
        <div className="relative">
          <Image
            src={food.image}
            fill
            alt="Restaurant Image"
            className="object-cover brightness-50"
          />
          <div className="relative px-6 pt-16 pb-4 text-white md:px-16 md:pt-20 md:pb-6">
            <h2 className="text-lg font-bold md:text-4xl">{food.name}</h2>
            <p className="mt-1 text-sm md:text-2xl">${food.price.toString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 bg-white p-4 md:grid-cols-2 md:gap-16 md:px-16 md:py-8">
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
        <div className="flex justify-center bg-white px-8 pb-4">
          {addToCartMutation.isLoading ? (
            <Loading className="h-12 w-12 animate-spin fill-virparyasMainBlue text-gray-200" />
          ) : session.status === "unauthenticated" ? (
            <Link
              href="/signin"
              className="flex w-full max-w-md items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
            >
              Login to Add to Cart
            </Link>
          ) : (
            <CommonButton
              text={`Add to Cart - $${totalPrice.toFixed(2)}`}
              onClick={() => void AddToCart()}
            />
          )}
        </div>
      </FoodOptionDialog>
    </>
  );
};

export default FoodCard;
