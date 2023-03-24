import Checkbox from "./Checkbox";
import CommonButton from "./CommonButton";
import FoodOptionDialog from "./FoodOptionDialog";
import Loading from "./Loading";
import { type FoodOption, type FoodOptionItem, type Food } from "@prisma/client";
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
            <div role="status">
              <svg
                aria-hidden="true"
                className="mr-2 h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
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