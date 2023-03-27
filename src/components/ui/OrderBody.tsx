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
    <div className="m-4 grid grid-cols-1 gap-4 text-virparyasMainBlue md:m-8 md:grid-cols-2 md:gap-8">
      <div className="h-fit rounded-2xl bg-white p-4 shadow-md md:col-start-2 md:row-start-1">
        <p className="text-xl font-bold md:text-3xl">Order Status</p>
        <div className="mt-4 grid grid-cols-4 grid-rows-1 gap-2">
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "PLACED" ||
                order.status === "PREPARING" ||
                order.status === "DELIVERING" ||
                order.status === "DELIVERED" ||
                order.status === "REJECTED_BY_RESTAURANT" ||
                order.status === "READY_FOR_PICKUP" ||
                order.status === "REJECTED_BY_SHIPPER"
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p className="text-[0.625rem] text-virparyasGreen">Order placed</p>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "PREPARING" ||
                order.status === "DELIVERING" ||
                order.status === "DELIVERED" ||
                order.status === "READY_FOR_PICKUP" ||
                order.status === "REJECTED_BY_SHIPPER"
                  ? "bg-virparyasGreen"
                  : order.status === "REJECTED_BY_RESTAURANT"
                  ? "bg-virparyasRed"
                  : "bg-virparyasBackground"
              }`}
            />
            <p
              className={`text-[0.625rem] ${
                order.status === "PREPARING" ||
                order.status === "DELIVERING" ||
                order.status === "DELIVERED" ||
                order.status === "READY_FOR_PICKUP" ||
                order.status === "REJECTED_BY_SHIPPER"
                  ? "text-virparyasGreen"
                  : order.status === "REJECTED_BY_RESTAURANT"
                  ? "text-virparyasRed"
                  : "text-virparyasBackground"
              }`}
            >
              {order.status === "REJECTED_BY_RESTAURANT"
                ? "Rejected"
                : "Preparing"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "DELIVERING" || order.status === "DELIVERED"
                  ? "bg-virparyasGreen"
                  : order.status === "REJECTED_BY_SHIPPER"
                  ? "bg-virparyasRed"
                  : "bg-virparyasBackground"
              }`}
            />
            <p
              className={`text-[0.625rem] ${
                order.status === "DELIVERING" || order.status === "DELIVERED"
                  ? "text-virparyasGreen"
                  : order.status === "REJECTED_BY_SHIPPER"
                  ? "text-virparyasRed"
                  : "text-virparyasBackground"
              }`}
            >
              {order.status === "REJECTED_BY_SHIPPER"
                ? "Rejected"
                : "Out for delivery"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "DELIVERED"
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p
              className={`text-[0.625rem] ${
                order.status === "DELIVERED"
                  ? "text-virparyasGreen"
                  : "text-virparyasBackground"
              }`}
            >
              Delivered
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-md md:row-start-1 md:p-6">
        <div className="flex flex-col gap-2 md:gap-4">
          <p className="text-xl font-bold md:text-3xl">Receipt</p>
          <div className="text-xs md:text-base">
            <p>
              {order.createdAt.toLocaleString([], {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
            <p>{order.restaurant.name}</p>
            <p>{order.restaurant.address}</p>
          </div>
          <div className="h-0.5 bg-virparyasSeparator" />
          <ul className="ml-4 flex list-decimal flex-col gap-2">
            {order.orderFood?.map((item) => (
              <li className="marker:font-bold md:marker:text-xl" key={item.id}>
                <div className="flex justify-between font-bold md:text-xl">
                  <p>
                    {item.foodName} ×{item.quantity}
                  </p>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <p className="my-1 text-xs font-light md:text-sm">
                  {item.foodOption}
                </p>
              </li>
            ))}
          </ul>
          <div className="h-0.5 bg-virparyasSeparator" />
          <div className="text-sm md:text-base">
            <div className="flex justify-between">
              <p>Items:</p>
              <p>${itemsPrice}</p>
            </div>
            <div className="flex justify-between">
              <p>Shipping:</p>
              <p>${order.shippingFee.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-0.5 bg-virparyasSeparator" />
          <div>
            <div className="flex justify-between text-lg font-bold md:text-2xl">
              <p>Total:</p>
              <p>${itemsPrice + order.shippingFee}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative top-32  md:col-start-2 md:row-start-1">
        <Link
          href="/"
          className=" flex h-fit w-full items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderBody;
