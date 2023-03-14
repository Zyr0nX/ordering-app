import CommonButton from "./CommonButton";
import ItemCart from "./ItemCart";
import { type CartItem, type Food, type Restaurant, type FoodOptionItem } from "@prisma/client";
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
  const router = useRouter();

  const [cardItems, setCardItems] = useState(item.cart);

  const removeItemsMutation = api.order.createOrder.useMutation();

  const handleCheckout = async () => {
    const orderId = await removeItemsMutation.mutateAsync({
      cartItemIds: cardItems.map((item) => item.id),
    });
    await router.push({
      pathname: "/checkout",
      query: { orderId },
    });
  };

  if (cardItems.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="relative overflow-hidden p-4 text-white">
        <Link
          href={`/restaurant/${item.restaurant.name}/${item.restaurant.id}`}
        >
          <Image
            src={item.restaurant.brandImage || ""}
            fill
            alt="Restaurant Image"
            className="object-cover brightness-50"
            priority
          />
          <div className="relative">
            <p className="mt-4 text-2xl font-bold">{item.restaurant.name}</p>
            <p className="mt-1 text-xs">{item.restaurant.address}</p>
          </div>
        </Link>
      </div>

      <div>
        <div className="m-4 text-virparyasMainBlue">
          <div className="mx-4 my-2 flex flex-col gap-4">
            <ul className="flex list-decimal flex-col gap-2">
              {cardItems.map((cardItem) => (
                <ItemCart
                  cardItem={cardItem}
                  key={cardItem.id}
                  setCardItems={setCardItems}
                />
              ))}
            </ul>
            <CommonButton text="Checkout" onClick={() => void handleCheckout()} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;