import RestaurantPendingOrder from "../common/RestaurantPendingOrder";
import { type Order, type OrderFood, type User } from "@prisma/client";
import React, { useState } from "react";
import { api } from "~/utils/api";


const ManageShipperRequestsBody = ({
  orders,
}: {
  orders: (Order & {
    user: User;
    orderFood: OrderFood[];
  })[];
}) => {
  const [search, setSearch] = useState("");

  const [orderList, setOrderList] = useState<
    (Order & {
      user: User;
      orderFood: OrderFood[];
    })[]
  >(orders);

  api.order.getPlacedAndPreparingOrders.useQuery(undefined, {
    initialData: orders,
    refetchInterval: 5000,
    enabled: search === "",
    onSuccess: (data) => {
      if (search === "") setOrderList(data);
    },
  });
  return (
    <div className="text-virparyasMainBlue m-4">
      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {orderList.map((order) => (
            <RestaurantPendingOrder
              order={order}
              orderList={orderList}
              setOrderList={setOrderList}
              key={order.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageShipperRequestsBody;