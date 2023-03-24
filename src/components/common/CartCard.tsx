import CommonButton from "./CommonButton";
import ItemCart from "./ItemCart";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { api } from "~/utils/api";

const CartCard = ({
  item,
}: {
  item: {
    restaurant: Restaurant;
    cart: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
}) => {
  const [cardItems, setCardItems] = useState(item.cart);

  // const createOrderMutation = api.order.createOrder.useMutation();

  // const createDraftOrder = async () => {
  //   const order = {
  //     restaurantId: item.restaurant.id,
  //     cartItem: cardItems.map((item) => ({
  //       foodId: item.food.id,
  //       foodOptionItemId: item.foodOption.map((item) => item.id),
  //       quantity: item.quantity,
  //     })),
  //   }
  //    await router.push({
  //     pathname: "/checkout",
  //     query: { data: JSON.stringify(order) },
  //   }, "/checkout");
  // }
  // const handleCheckout = async () => {
  //   const orderId = await createOrderMutation.mutateAsync({
  //     cartItemIds: cardItems.map((item) => item.id),
  //   });
  //   await router.push({
  //     pathname: "/checkout",
  //     query: { orderId },
  //   });
  // };

  if (cardItems.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <Link
        href={`/restaurant/${item.restaurant.name}/${item.restaurant.id}`}
        className="relative overflow-hidden text-white"
      >
        <Image
          src={item.restaurant.brandImage || ""}
          fill
          alt="Restaurant Image"
          className="object-cover brightness-50"
          priority
        />
        <div className="relative p-4 md:p-6">
          <p className="mt-4 text-2xl font-bold md:mt-12 md:text-4xl">
            {item.restaurant.name}
          </p>
          <p className="mt-1 text-xs md:text-base">{item.restaurant.address}</p>
        </div>
      </Link>

      <div>
        <div className="m-4 text-virparyasMainBlue md:m-6">
          <div className="mx-4 my-2 flex flex-col gap-4 md:gap-8">
            <ul className="flex list-decimal flex-col gap-2">
              {cardItems.map((cardItem) => (
                <ItemCart
                  cardItem={cardItem}
                  key={cardItem.id}
                  setCardItems={setCardItems}
                />
              ))}
            </ul>
            <div className="flex justify-center">
              <Link
                href={{
                  pathname: "/checkout",
                  query: { id: item.restaurant.id },
                }}
                className="flex max-w-xs grow items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
              >
                Checkout
              </Link>
            </div>

            {/* <CommonButton text="Checkout" onClick={() => void createDraftOrder()} /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
