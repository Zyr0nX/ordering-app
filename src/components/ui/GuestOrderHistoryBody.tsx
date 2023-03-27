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
    <div className="m-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orderHistory.map((order) => {
        return <OrderHistoryCard order={order} key={order.id} />;
      })}
    </div>
  );
};

export default GuestOrderHistoryBody;
