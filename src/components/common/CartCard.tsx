import {
  type CartItem,
  type Food,
  type Restaurant,
  type FoodOptionItem,
} from "@prisma/client";
import React from "react";

const CartCard = ({
  cart,
}: {
  cart: (CartItem & {
    food: Food & {
      restaurant: Restaurant;
    };
    foodOption: FoodOptionItem[];
  })[];
}) => {
  return (
    <div className="overflow-hidden rounded-2xl shadow-lg">
      <div
        className="w-full bg-black/50 p-4 text-white"
        style={{
          background:
            "linear-gradient(#00000080, #00000080), url(https://res.cloudinary.com/dkxjgboi8/image/upload/v1677952239/photo-1504674900247-0877df9cc836_dieukj.jpg) no-repeat center center/cover",
        }}
      >
        <p className="mt-4 text-2xl font-bold">Sabrina’s Cafe</p>
        <p className="mt-1 text-xs">123 33th Street, Philadelphia, PA 19104</p>
      </div>
      <div>
        <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue">
          <div className="mx-4 my-2 flex justify-between">
            <ul className="list-decimal">
              {cart.map((item) => (
                <li className="marker:text-sm marker:font-bold" key={item.id}>
                  <p className="font-bold">{item.food.name}</p>
                  <p>
                    {item.foodOption.map((option) => (
                      <span key={option.id}>{option.name}, </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
