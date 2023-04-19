import BluePencil from "../icons/BluePencil";
import { type FoodCategory } from "./AddFood";
import FoodOptionInput from "./FoodOptionInput";
import { Dialog, Transition } from "@headlessui/react";
import { createId } from "@paralleldrive/cuid2";
import {
  type Food,
  type FoodOption,
  type FoodOptionItem,
} from "@prisma/client";
import { Fragment, useState } from "react";

const FoodList = ({
  food,
}: {
  food: Food & {
    foodOption: (FoodOption & {
      foodOptionItem: FoodOptionItem[];
    })[];
  };
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>(
    food.foodOption.map((foodOption) => ({
      id: foodOption.id,
      name: foodOption.name,
      options: foodOption.foodOptionItem.map((foodOptionItem) => ({
        id: foodOptionItem.id,
        name: foodOptionItem.name,
        price: foodOptionItem.price,
      })),
    }))
  );

  const addFoodCategory = () =>
    setFoodCategories((foodCategories) => [
      ...foodCategories,
      {
        id: createId(),
        name: "",
        options: [{ id: createId(), name: "", price: 0 }],
      },
    ]);

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {food.name}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {food.price}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(true)}>
              <BluePencil className="md:h-10 md:w-10" />
            </button>
            {/* <button type="button" onClick={handleReject}>
              <RedCross className="md:h-10 md:w-10" />
            </button> */}
          </div>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Add food
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col">
                        <label htmlFor="firstName" className="font-medium">
                          * Food name:
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Item name..."
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="lastName" className="font-medium">
                          * Food price:
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="phone" className="font-medium">
                          * Food quantity:
                        </label>
                        <input
                          type="text"
                          id="phone"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="email" className="font-medium">
                          Food description:
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="restaurantName" className="font-medium">
                          * Food image:
                        </label>
                        <input
                          type="text"
                          id="restaurantName"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                        />
                      </div>
                      <div className="h-0.5 bg-virparyasSeparator" />
                      {foodCategories.map((foodCategory, index) => (
                        <FoodOptionInput
                          foodCategory={foodCategory}
                          index={index}
                          key={foodCategory.id}
                          setFoodCategories={setFoodCategories}
                          foodCategories={foodCategories}
                        />
                      ))}

                      <button className="font-medium" onClick={addFoodCategory}>
                        Add customization +
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default FoodList;
