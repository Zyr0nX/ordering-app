import ItemCart from "./ItemCart";
import Loading from "./Loading";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);

  const [totalPrice, setTotalPrice] = useState(
    item.cart.reduce((acc, cur) => {
      return (
        acc +
        (cur.food.price +
          cur.foodOption
            .map((option) => option.price)
            .reduce((a, b) => a + b, 0)) *
          cur.quantity
      );
    }, 0)
  );

  if (cardItems.length === 0) return null;

  return (
    <div className="h-fit overflow-hidden rounded-2xl bg-white shadow-lg">
      <Link
        href={`/restaurant/${item.restaurant.name}/${item.restaurant.id}`}
        className="relative overflow-hidden text-white"
      >
        {item.restaurant.image && (
          <Image
            src={item.restaurant.image || ""}
            fill
            alt="Restaurant Image"
            className="object-cover brightness-50"
            priority
          />
        )}

        <div className="relative p-4 md:p-6">
          <p className="mt-4 text-2xl font-bold md:mt-12 md:text-4xl">
            {item.restaurant.name}
          </p>
          <p className="mt-1 text-xs md:text-base">{item.restaurant.address}</p>
        </div>
      </Link>

      <div>
        <div className="text-virparyasMainBlue m-4 md:m-6">
          <div className="mx-4 my-2 flex flex-col gap-4 md:gap-8">
            <ul className="flex list-decimal flex-col gap-2">
              {cardItems.map((cardItem) => (
                <ItemCart
                  cardItem={cardItem}
                  key={cardItem.id}
                  setCardItems={setCardItems}
                  setTotalPrice={setTotalPrice}
                  totalPrice={totalPrice}
                  setIsLoading={setIsLoading}
                />
              ))}
            </ul>
            <div className="flex justify-center">
              {isLoading ? (
                <Loading className="fill-virparyasMainBlue h-12 w-12 animate-spin text-gray-200" />
              ) : (
                <Link
                  href={{
                    pathname: "/checkout",
                    query: { id: item.restaurant.id },
                  }}
                  className="bg-virparyasMainBlue flex max-w-xs grow items-center justify-center rounded-xl p-3 font-bold text-white"
                >
                  Checkout -{" "}
                  {totalPrice.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
