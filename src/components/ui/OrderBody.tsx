import CommonButton from "../common/CommonButton";
import {
  type OrderFood,
  type Order,
  type Restaurant,
  type User,
} from "@prisma/client";
import Link from "next/link";
import React from "react";

const OrderBody = ({
  order,
}: {
  order: Order & {
    user: User;
    restaurant: Restaurant;
    orderFood: OrderFood[];
  };
}) => {
  const itemsPrice = order.orderFood?.reduce(
    (acc, cur) => acc + cur.price * cur.quantity,
    0
  );
  return (
    <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue">
      <div className="rounded-2xl bg-white p-4 shadow-md">
        <p className="text-xl font-bold">Order Status</p>
        <div className="mt-4 flex gap-2">
          <div className="grow">
            <div
              className={`h-[0.325rem] w-full ${
                order.status ===
                ("PLACED" || "PREPARING" || "DELIVERING" || "DELIVERED")
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p className="mt-1 text-[0.625rem] text-virparyasGreen">
              Order placed
            </p>
          </div>
          <div className="grow">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === ("PREPARING" || "DELIVERING" || "DELIVERED")
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p className="mt-1 text-[0.625rem] text-virparyasGreen">
              Order placed
            </p>
          </div>
          <div className="grow">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === ("DELIVERING" || "DELIVERED")
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p className="mt-1 text-[0.625rem] text-virparyasGreen">
              Order placed
            </p>
          </div>
          <div className="grow">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "DELIVERED"
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p className="mt-1 text-[0.625rem] text-virparyasGreen">
              Order placed
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-md">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold">Receipt</p>
          <div>
            <p className="text-xs">
              {order.createdAt.toLocaleString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
            <p className="text-xs">{order.restaurant.name}</p>
            <p className="text-xs">{order.restaurant.address}</p>
          </div>
          <div className="h-0.5 bg-virparyasBackground" />
          <ul className="ml-4 flex list-decimal flex-col gap-2">
            {order.orderFood?.map((item) => (
              <li className="marker:text-sm marker:font-bold" key={item.id}>
                <div className="flex justify-between font-medium">
                  <p className="">
                    {item.foodName} ×{item.quantity}
                  </p>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <p className="my-1 text-xs font-light">{item.foodOption}</p>
              </li>
            ))}
          </ul>
          <div className="h-0.5 bg-virparyasBackground" />
          <div>
            <div className="flex justify-between text-sm">
              <p>Items:</p>
              <p>${itemsPrice}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Shipping:</p>
              <p>${order.shippingFee.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-0.5 bg-virparyasBackground" />
          <div>
            <div className="flex justify-between text-lg font-bold">
              <p>Total:</p>
              <p>${itemsPrice + order.shippingFee}</p>
            </div>
          </div>
        </div>
      </div>
      <Link
        href="/"
        className="flex w-full items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
      >
        Continue Shopping
      </Link>
    </div>
  );
};

export default OrderBody;
