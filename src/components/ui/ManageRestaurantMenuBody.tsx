import AddFood from "../common/AddFood";
import RestaurantPendingOrder from "../common/RestaurantPendingOrder";
import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import { Transition, Dialog } from "@headlessui/react";
import {
  type Restaurant,
  type Order,
  type OrderFood,
  type User,
  Food,
  FoodOption,
  FoodOptionItem,
} from "@prisma/client";
import React, { Fragment } from "react";
import { api } from "~/utils/api";
import FoodList from "../common/FoodList";

const ManageRestaurantMenuBody = ({
  menu,
}: {
  menu: (Food & {
    foodOption: (FoodOption & {
      foodOptionItem: FoodOptionItem[];
    })[];
  })[];
}) => {
  const menuQuery = api.food.getMenu.useQuery(undefined, {
    initialData: menu,
    refetchInterval: 5000,
  });

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex justify-center">
        <AddFood />
      </div>

      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {menuQuery.data.map((food) => (
            <FoodList food={food} key={food.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageRestaurantMenuBody;
