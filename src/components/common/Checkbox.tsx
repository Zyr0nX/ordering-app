import { Switch } from "@headlessui/react";
import { type FoodOptionItem } from "@prisma/client";
import React, { useState } from "react";


const Checkbox = ({
  foodOptionItem,
  listFoodOptionItem,
}: {
  foodOptionItem: FoodOptionItem;
  listFoodOptionItem: FoodOptionItem[];
}) => {
  const [enabled, setEnabled] = useState(false);

  const handleChange = () => {
    if (enabled) {
      listFoodOptionItem = listFoodOptionItem.filter(
        (item) => item.id !== foodOptionItem.id
      );
    } else {
      listFoodOptionItem.push(foodOptionItem);
    }
    setEnabled(!enabled);
  };

  return (
    <Switch
      checked={enabled}
      onChange={handleChange}
      className={`${
        enabled ? "bg-blue-600" : "bg-gray-200"
      } relative inline-flex h-6 w-11 items-center rounded-full`}
    >
      <span className="sr-only">Enable notifications</span>
      <span
        className={`${
          enabled ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition`}
      />
    </Switch>
  );
};

export default Checkbox;