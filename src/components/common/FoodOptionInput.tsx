import TrashCanIcon from "../icons/TrashCanIcon";
import { createId } from "@paralleldrive/cuid2";
import { useField } from "formik";
import React, { useEffect, useRef } from "react";


interface FoodCategory {
  id: string;
  name: string;
  options: FoodOption[];
}

interface FoodOption {
  id: string;
  name: string;
  price: number;
}

interface FoodOptionInputProps {
  name: string;
}

const FoodOptionInput: React.FC<FoodOptionInputProps> = ({ name }) => {
  const [field,, helpers] = useField<FoodCategory[]>(name);
  const handleFoodOptionNameChange = (
    index: number,
    optionIndex: number,
    value: string
  ) => {
    const newFoodCategories = [...field.value];
    (
      (newFoodCategories[index] as FoodCategory).options[
        optionIndex
      ] as FoodOption
    ).name = value;
    helpers.setValue(newFoodCategories);
  };

  const handleFoodOptionPriceChange = (
    index: number,
    optionIndex: number,
    value: number
  ) => {
    const newFoodCategories = [...field.value];
    (
      (newFoodCategories[index] as FoodCategory).options[
        optionIndex
      ] as FoodOption
    ).price = value;
    helpers.setValue(newFoodCategories);
  };

  const helpersRef = useRef(helpers);

  const handleFoodCategoryNameChange = (index: number, value: string) => {
    const newFoodCategories = [...field.value];
    (newFoodCategories[index] as FoodCategory).name = value;
    helpers.setValue(newFoodCategories);
  };

  const addFoodCategory = () =>
    helpers.setValue([
      ...field.value,
      {
        id: createId(),
        name: "",
        options: [
          {
            id: createId(),
            name: "",
            price: 0,
          },
        ],
      },
    ]);

  const handleDeleteCategory = (index: number) => {
    const newFoodCategories = [...field.value];
    newFoodCategories.splice(index, 1);
    helpers.setValue(newFoodCategories);
  };

  // add new option to the category when the last option is not empty
  useEffect(() => {
    field.value.forEach((foodCategory, index) => {
      if (
        foodCategory.options.length > 0 &&
        (foodCategory.options[foodCategory.options.length - 1] as FoodOption)
          .name !== "" &&
        (foodCategory.options[foodCategory.options.length - 1] as FoodOption)
          .price !== 0
      ) {
        const newFoodCategories = [...field.value];
        const foodCategoryToUpdate = newFoodCategories[index] as FoodCategory;
        const options = foodCategoryToUpdate.options.concat({
          id: createId(),
          name: "",
          price: 0,
        });
        const updatedFoodCategory = {
          ...foodCategoryToUpdate,
          options,
        };
        newFoodCategories[index] = updatedFoodCategory;
        helpersRef.current.setValue(newFoodCategories);
      }
    });
  }, [field.value]);

  //remove option from the category when the last option is empty
  useEffect(() => {
    field.value.forEach((foodCategory, index) => {
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
        const newFoodCategories = [...field.value];
        const foodCategoryToUpdate = newFoodCategories[index] as FoodCategory;
        const options = foodCategoryToUpdate.options.slice(0, -1);
        const updatedFoodCategory = {
          ...foodCategoryToUpdate,
          options,
        };
        newFoodCategories[index] = updatedFoodCategory;
        helpersRef.current.setValue(newFoodCategories);
      }
    });
  }, [field.value]);

  //remove option from the category when the option is empty except for the last one
  useEffect(() => {
    field.value.forEach((foodCategory, index) => {
      foodCategory.options.forEach((foodOption, optionIndex) => {
        if (
          foodOption.name === "" &&
          foodOption.price === 0 &&
          optionIndex !== foodCategory.options.length - 1
        ) {
          const newFoodCategories = [...field.value];
          const foodCategoryToUpdate = newFoodCategories[index] as FoodCategory;
          const options = foodCategoryToUpdate.options.filter(
            (option) => option.id !== foodOption.id
          );
          const updatedFoodCategory = {
            ...foodCategoryToUpdate,
            options,
          };
          newFoodCategories[index] = updatedFoodCategory;
          helpersRef.current.setValue(newFoodCategories);
        }
      });
    });
  }, [field.value]);

  if (!field.value) return null;

  return (
    <>
      {field.value.map((foodCategory, index) => (
        <div className="relative flex flex-col gap-2" key={foodCategory.id}>
          <div className="flex flex-col">
            <label className="font-medium">* Customization category:</label>
            <div className="flex items-center gap-2">
              <div className="grow">
                <input
                  type="text"
                  id="restaurantName"
                  className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                  placeholder="Category..."
                  value={foodCategory.name}
                  onChange={(e) =>
                    handleFoodCategoryNameChange(index, e.target.value)
                  }
                />
              </div>
              <button type="button" className="rounded-xl bg-virparyasRed p-2">
                <TrashCanIcon
                  className="h-6 w-6 fill-white"
                  onClick={() => handleDeleteCategory(index)}
                />
              </button>
            </div>

            <div className="absolute bottom-5 left-4 top-6 -z-10 w-1 bg-virparyasMainBlue"></div>
          </div>
          {foodCategory.options.map((foodOption, optionIndex) => (
            <div className="relative ml-8 flex gap-2" key={foodOption.id}>
              <input
                type="text"
                className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                placeholder="Name..."
                value={foodOption.name}
                onChange={(e) =>
                  handleFoodOptionNameChange(index, optionIndex, e.target.value)
                }
              />
              <input
                type="number"
                className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                placeholder="Price..."
                value={Number(foodOption.price).toString()}
                onChange={(e) =>
                  handleFoodOptionPriceChange(
                    index,
                    optionIndex,
                    Number(e.target.value)
                  )
                }
              />

              <div className="absolute -left-4 right-0 top-5 -z-10 h-1 bg-virparyasMainBlue"></div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" className="font-medium" onClick={addFoodCategory}>
        Add customization +
      </button>
    </>
  );
};

export default FoodOptionInput;