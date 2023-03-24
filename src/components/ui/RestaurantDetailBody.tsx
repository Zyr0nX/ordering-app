import FoodCard from "../common/FoodCard";
import {
  type FoodOption,
  type FoodOptionItem,
  type Food,
} from "@prisma/client";
import React from "react";

const RestaurantDetailBody = ({
  food,
}: {
  food: (Food & {
    foodOption: (FoodOption & {
      foodOptionItem: FoodOptionItem[];
    })[];
  })[];
}) => {
  const [quantity, setQuantity] = React.useState(0);

  return (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-3 sm:grid-cols-2 md:py-10 md:px-20" >
      {food.map((item) => (
        <FoodCard food={item} key={item.id} />
      ))}
    </div>
  );
};

export default RestaurantDetailBody;
