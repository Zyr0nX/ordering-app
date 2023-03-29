import AddFood from "../common/AddFood";
import FoodList from "../common/FoodList";
import {
  type Food,
  type FoodOption,
  type FoodOptionItem,
} from "@prisma/client";
import { api } from "~/utils/api";

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
    <div className="text-virparyasMainBlue m-4">
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
