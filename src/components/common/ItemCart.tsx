import RedTrashCan from "../icons/RedTrashCan";
import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "~/utils/api";

interface ItemCartProps {
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
  totalPrice: number;
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ItemCart: React.FC<ItemCartProps> = ({
  cardItem,
  totalPrice,
  setTotalPrice,
  setIsLoading,
}) => {
  const updateItemQuantityMutation = api.cart.updateItemQuantity.useMutation();
  const utils = api.useContext();
  const [quantity, setQuantity] = React.useState(cardItem.quantity);

  const updateDebounce = useDebouncedCallback(async () => {
    await updateItemQuantityMutation.mutateAsync({
      cartItemId: cardItem.id,
      quantity: quantity,
    });
    setIsLoading(false);
  }, 500);

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setIsLoading(true);
    setQuantity(quantity - 1);
    setTotalPrice(totalPrice - cardItem.food.price);
    void updateDebounce();
  };

  const handleIncrement = () => {
    if (quantity >= Number(cardItem.food.quantity)) return;
    setIsLoading(true);
    setQuantity(quantity + 1);
    setTotalPrice(totalPrice + cardItem.food.price);
    void updateDebounce();
  };

  const handleUpdateQuantity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    setQuantity(Number(e.target.value));
    setTotalPrice(
      totalPrice -
        cardItem.food.price * quantity +
        cardItem.food.price * Number(e.target.value)
    );
    void updateDebounce();
  };

  const removeItemMutation = api.cart.removeItem.useMutation({
    onSettled: () => {
      void utils.cart.getCart.invalidate();
      setIsLoading(false);
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
    <li className="marker:font-bold md:marker:text-lg">
      <div className="flex justify-between font-bold md:text-lg">
        <p>{cardItem.food.name}</p>
        <p>${price.toFixed(2)}</p>
      </div>

      <p className="my-1 text-sm font-light md:font-normal">
        {cardItem.foodOption.map((option) => option.name).join(", ")}
      </p>
      <div className="flex items-center gap-4">
        <div className="bg-virparyasBackground flex w-fit items-center rounded-lg text-sm font-medium">
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
