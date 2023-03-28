import FoodOptionInput from "./FoodOptionInput";
import { Dialog, Transition } from "@headlessui/react";
import { createId } from "@paralleldrive/cuid2";
import React, { Fragment, useState, useRef } from "react";
import { api } from "~/utils/api";

export interface FoodCategory {
  id: string;
  name: string;
  options: FoodOption[];
}

export interface FoodOption {
  id: string;
  name: string;
  price: number;
}

const AddFood = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
  const parent = useRef(null);

  const addFoodCategory = () =>
    setFoodCategories((foodCategories) => [
      ...foodCategories,
      {
        id: createId(),
        name: "",
        options: [{ id: createId(), name: "", price: 0 }],
      },
    ]);

  const [image, setImage] = useState<string>("");

  const createFoodMutation = api.food.create.useMutation();

  const handleAddFood = () => {
    const name = nameRef.current?.value;
    const price = Number(priceRef.current?.value);
    const quantity = Number(quantityRef.current?.value);
    const description = descriptionRef.current?.value;

    if (!name || !price || !quantity) {
      return;
    }

    createFoodMutation.mutate({
      name,
      description,
      price,
      quantity,
      image,
      categories: foodCategories.map((foodCategory) => ({
        ...foodCategory,
        options: foodCategory.options.filter((option) => option.name),
      })),
    });

    setIsOpen(false);
  };

  return (
    <>
      <button className="font-medium" onClick={() => setIsOpen(true)}>
        Add food to menu +
      </button>
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
                        <label htmlFor="name" className="font-medium">
                          * Name:
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Name..."
                          ref={nameRef}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="price" className="font-medium">
                          * Price:
                        </label>
                        <input
                          type="text"
                          id="price"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Price..."
                          ref={priceRef}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="quantity" className="font-medium">
                          * Quantity:
                        </label>
                        <input
                          type="text"
                          id="quantity"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Quantity..."
                          ref={quantityRef}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="description" className="font-medium">
                          Description:
                        </label>
                        <textarea
                          id="description"
                          className="h-20 w-full rounded-xl px-4 placeholder:leading-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Description..."
                          ref={descriptionRef}
                        />
                      </div>
                      {/* <CommonImageInput
                        image={image}
                        setImage={setImage}
                        label="* Image"
                      /> */}
                      <div className="h-0.5 bg-virparyasSeparator" />
                      <div className="flex flex-col gap-4" ref={parent}>
                        {foodCategories.map((foodCategory, index) => (
                          <FoodOptionInput
                            foodCategory={foodCategory}
                            index={index}
                            key={foodCategory.id}
                            setFoodCategories={setFoodCategories}
                            foodCategories={foodCategories}
                          />
                        ))}
                      </div>

                      <button className="font-medium" onClick={addFoodCategory}>
                        Add customization +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-36 rounded-xl bg-virparyasGreen py-2 font-medium text-white"
                    onClick={handleAddFood}
                  >
                    Confirm
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddFood;
