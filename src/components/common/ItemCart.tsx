import RedTrashCan from "../icons/RedTrashCan";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import React from "react";
import { api } from "~/utils/api";

const ItemCart = ({
  cardItem,
  setCardItems,
}: {
  cardItem: CartItem & {
    food: Food & {
      restaurant: Restaurant;
    };
    foodOption: FoodOptionItem[];
  };
  setCardItems: (
    value: React.SetStateAction<
      (CartItem & {
        food: Food & {
          restaurant: Restaurant;
        };
        foodOption: FoodOptionItem[];
      })[]
    >
  ) => void;
}) => {
  const [quantity, setQuantity] = React.useState(cardItem.quantity);

  const updateItemQuantityMutation = api.cart.updateItemQuantity.useMutation();

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setQuantity(quantity - 1);
    updateItemQuantityMutation.mutate({
      cartItemId: cardItem.id,
      quantity: quantity - 1,
    });
  };

  const handleIncrement = () => {
    if (quantity >= Number(cardItem.food.quantity)) return;
    setQuantity(quantity + 1);
    updateItemQuantityMutation.mutate({
      cartItemId: cardItem.id,
      quantity: quantity + 1,
    });
  };

  const handleUpdateQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value));
    updateItemQuantityMutation.mutate({
      cartItemId: cardItem.id,
      quantity: Number(e.target.value),
    });
  };

  const removeItemMutation = api.cart.removeItem.useMutation({
    onMutate: () => {
      setCardItems((prev) => prev.filter((item) => item.id !== cardItem.id));
    },
  });

  const handleRemoveItem = () => {
    removeItemMutation.mutate({ cartItemId: cardItem.id });
  };

  const price =
    (cardItem.food.price +
      cardItem.foodOption
        .map((option) => option.price)
        .reduce((a, b) => a + b, 0)) *
    quantity;

  return (
    <li className="marker:text-sm marker:font-bold">
      <div className="flex justify-between font-bold">
        <p>{cardItem.food.name}</p>
        <p>${price.toFixed(2)}</p>
      </div>

      <p className="my-1 text-sm font-light">
        {cardItem.foodOption.map((option) => option.name).join(", ")}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex w-fit items-center rounded-lg bg-virparyasBackground text-sm font-medium">
          <button type="button" className="px-2 py-1" onClick={handleDecrement}>
            -
          </button>
          <input
            type="number"
            className="w-8 bg-transparent text-center focus-within:outline-none"
            min={1}
            max={Number(cardItem.food.quantity)}
            value={quantity}
            onChange={handleUpdateQuantity}
          />
          <button type="button" className="px-2 py-1" onClick={handleIncrement}>
            +
          </button>
        </div>
        <button type="button" onClick={handleRemoveItem}>
          <RedTrashCan />
        </button>
      </div>
    </li>
  );
};

export default ItemCart;
