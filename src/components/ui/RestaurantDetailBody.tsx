import { type Food } from "@prisma/client";
import React from "react";
import FoodCard from "../common/FoodCard";

const RestaurantDetailBody = ({
  food,
}: {
  food: Food[];
}) => {
  const [quantity, setQuantity] = React.useState(0);

  return (
    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
      {food.map((item) => (
        <FoodCard food={item} key={item.id} />
      ))}
    </div>
  );
};

export default RestaurantDetailBody;
