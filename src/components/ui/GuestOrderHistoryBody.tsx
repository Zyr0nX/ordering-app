import OrderHistoryCard from "../common/OrderHistoryCard";
import { type Order, type Restaurant, type OrderFood } from "@prisma/client";
import React from "react";

const GuestOrderHistoryBody = ({
  orderHistory,
}: {
  orderHistory: (Order & {
    restaurant: Restaurant;
    orderFood: OrderFood[];
  })[];
}) => {
  return (
    <div className="flex flex-col gap-4 m-4">
      {orderHistory.map((order) => {
        return <OrderHistoryCard order={order} key={order.id} />;
      })}
    </div>
  );
};

export default GuestOrderHistoryBody;
