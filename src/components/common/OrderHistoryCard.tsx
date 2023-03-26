import CommonButton from "./CommonButton";
import ItemCart from "./ItemCart";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
  type Order,
  type OrderFood,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { api } from "~/utils/api";

const OrderHistoryCard = ({
  order,
}: {
  order: Order & {
    restaurant: Restaurant;
    orderFood: OrderFood[];
  };
}) => {
  const total = order.orderFood.reduce((acc, cur) => {
    return acc + cur.price;
  }, 0);

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <Link
        href={`/orders/VP-${order.id}`}
      >
        <div className="relative overflow-hidden text-white">
          <Image
            src={order.restaurant.brandImage || ""}
            fill
            alt="Restaurant Image"
            className="object-cover brightness-50"
            priority
          />
          <div
            className={`absolute top-4 right-4 flex w-fit justify-center rounded-xl px-2 py-1 font-medium ${
              order.status === "PLACED" ||
              order.status === "PREPARING" ||
              order.status === "READY_FOR_PICKUP" ||
              order.status === "DELIVERING"
                ? "bg-virparyasLightBlue"
                : ""
            }${order.status === "DELIVERED" ? "bg-virparyasGreen" : ""}${
              order.status === "REJECTED_BY_RESTAURANT" ||
              order.status === "REJECTED_BY_SHIPPER"
                ? "bg-virparyasRed"
                : ""
            }`}
          >
            {(order.status === "PLACED" ||
              order.status === "PREPARING" ||
              order.status === "READY_FOR_PICKUP" ||
              order.status === "DELIVERING") && <p>In Progress</p>}
            {order.status === "DELIVERED" && <p>Delivered</p>}
            {order.status === "REJECTED_BY_RESTAURANT" ||
              (order.status === "REJECTED_BY_SHIPPER" && <p>Cancelled</p>)}
          </div>
          <div className="relative p-4 md:p-6">
            <p className="mt-12 text-2xl font-bold md:mt-12 md:text-4xl">
              {order.restaurant.name}
            </p>
            <p className="mt-1 text-xs md:text-base">
              {order.restaurant.address}
            </p>
          </div>
        </div>

        <div className="p-4 text-virparyasMainBlue md:p-6">
          <div className="my-2 flex flex-col gap-4 md:gap-8">
            <ul className="flex list-decimal flex-col gap-2">
              {order.orderFood.map((food) => (
                <li
                  className="ml-4 marker:font-bold md:marker:text-lg"
                  key={food.id}
                >
                  <div className="flex justify-between font-bold md:text-lg">
                    <p>{food.foodName}</p>
                    <p>${food.price.toFixed(2)}</p>
                  </div>

                  <p className="my-1 text-sm font-light md:font-normal">
                    {food.foodOption}
                  </p>
                </li>
              ))}
            </ul>
            <div className="h-0.5 bg-virparyasSeparator" />
            <div className="flex justify-between font-bold md:text-lg">
              <p>Total:</p>
              <p>${total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default OrderHistoryCard;
