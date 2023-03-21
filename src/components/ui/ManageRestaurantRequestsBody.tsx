import RestaurantPendingOrder from "../common/RestaurantPendingOrder";
import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import { Transition, Dialog } from "@headlessui/react";
import {
  type Restaurant,
  type Order,
  type OrderFood,
  type User,
} from "@prisma/client";
import React, { Fragment } from "react";
import { api } from "~/utils/api";

const ManageRestaurantRequestsBody = ({
  orderList,
}: {
  orderList: (Order & {
    user: User;
    orderFood: OrderFood[];
  })[];
}) => {
  const ordersQuery = api.order.getPlacedAndPreparingOrders.useQuery(
    undefined,
    {
      initialData: orderList,
      refetchInterval: 5000,
    }
  );
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ordersQuery.data.map((order) => (
            <RestaurantPendingOrder order={order} key={order.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageRestaurantRequestsBody;
