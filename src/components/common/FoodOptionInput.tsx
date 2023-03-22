import { type FoodOption, type FoodCategory } from "./AddFood";
import { createId } from "@paralleldrive/cuid2";
import React, { useEffect } from "react";


const FoodOptionInput = ({
  foodCategory,
  index,
  setFoodCategories,
  foodCategories,
}: {
  foodCategory: FoodCategory;
  index: number;
  setFoodCategories: React.Dispatch<React.SetStateAction<FoodCategory[]>>;
  foodCategories: FoodCategory[];
}) => {
  const handleFoodOptionNameChange = (
    index: number,
    optionIndex: number,
    value: string
  ) =>
    setFoodCategories((foodCategories: FoodCategory[]) => {
      const newFoodCategories = [...foodCategories];
      (
        (newFoodCategories[index] as FoodCategory).options[
          optionIndex
        ] as FoodOption
      ).name = value;
      return newFoodCategories;
    });

  const handleFoodOptionPriceChange = (
    index: number,
    optionIndex: number,
    value: number
  ) =>
    setFoodCategories((foodCategories: FoodCategory[]) => {
      const newFoodCategories = [...foodCategories];
      (
        (newFoodCategories[index] as FoodCategory).options[
          optionIndex
        ] as FoodOption
      ).price = value;
      return newFoodCategories;
    });

  const handleFoodCategoryNameChange = (index: number, value: string) =>
    setFoodCategories((foodCategories: FoodCategory[]) => {
      const newFoodCategories = [...foodCategories];
      (newFoodCategories[index] as FoodCategory).name = value;
      return newFoodCategories;
    });

  //add new option to the category when the last option is not empty
  useEffect(() => {
    if (
      foodCategory.options.length > 0 &&
      (foodCategory.options[foodCategory.options.length - 1] as FoodOption)
        .name !== "" &&
      (foodCategory.options[foodCategory.options.length - 1] as FoodOption)
        .price !== 0
    ) {
      setFoodCategories((foodCategories: FoodCategory[]) => {
        const newFoodCategories = foodCategories.map(
          (foodCategory: FoodCategory, i: number) => {
            if (i === index) {
              const newOptions = [
                ...foodCategory.options,
                { id: createId(), name: "", price: 0 },
              ];
              return {
                ...foodCategory,
                options: newOptions,
              };
            }
            return foodCategory;
          }
        );
        return newFoodCategories;
      });
    }
  }, [foodCategory.options, index, setFoodCategories, foodCategories]);

  //remove option from the category when the last option is empty
  useEffect(() => {
    if (
      foodCategory.options.length > 1 &&
      (foodCategory.options[foodCategory.options.length - 1] as FoodOption)
        .name === "" &&
      (foodCategory.options[foodCategory.options.length - 1] as FoodOption)
        .price === 0 &&
      (foodCategory.options[foodCategory.options.length - 2] as FoodOption)
        .name === "" &&
      (foodCategory.options[foodCategory.options.length - 2] as FoodOption)
        .price === 0
    ) {
      setFoodCategories((foodCategories: FoodCategory[]) => {
        const newFoodCategories = [...foodCategories];
        const foodCategoryToUpdate = newFoodCategories[index] as FoodCategory;
        const options = foodCategoryToUpdate.options.slice(0, -1);
        const updatedFoodCategory = {
          ...foodCategoryToUpdate,
          options,
        };
        newFoodCategories[index] = updatedFoodCategory;
        return newFoodCategories;
      });
    }
  }, [foodCategory.options, index, setFoodCategories, foodCategories]);

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex flex-col">
        <label htmlFor="restaurantName" className="font-medium">
          * Customization category:
        </label>
        <input
          type="text"
          id="restaurantName"
          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
          placeholder="Email..."
          value={foodCategory.name}
          onChange={(e) => handleFoodCategoryNameChange(index, e.target.value)}
        />
        <div className="absolute top-6 left-4 bottom-5 -z-10 w-1 bg-virparyasMainBlue"></div>
      </div>
      {foodCategory.options.map((foodOption, optionIndex) => (
        <div className="relative ml-8 flex gap-2" key={foodOption.id}>
          <input
            type="text"
            id="restaurantName"
            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
            placeholder="Name..."
            value={foodOption.name}
            onChange={(e) =>
              handleFoodOptionNameChange(index, optionIndex, e.target.value)
            }
          />
          <input
            type="number"
            id="restaurantName"
            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
            placeholder="Price..."
            value={foodOption.price}
            onChange={(e) =>
              handleFoodOptionPriceChange(
                index,
                optionIndex,
                Number(e.target.value)
              )
            }
          />

          <div className="absolute right-0 -left-4 top-5 -z-10 h-1 bg-virparyasMainBlue"></div>
        </div>
      ))}
    </div>
  );
};

export default FoodOptionInput;