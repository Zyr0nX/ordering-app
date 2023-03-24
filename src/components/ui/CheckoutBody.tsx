import CommonButton from "../common/CommonButton";
import BluePencil from "../icons/BluePencil";
import { Transition, Dialog } from "@headlessui/react";
import {
  type User,
  type CartItem,
  type Food,
  type FoodOptionItem,
  type Restaurant,
} from "@prisma/client";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { api } from "~/utils/api";

const CheckoutBody = ({
  user,
}: {
  user: User & {
    cartItem: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
}) => {
  const restaurant = user.cartItem[0]?.food.restaurant;

  const total = user.cartItem.reduce(
    (acc, item) => acc + item.food.price * item.quantity,
    0
  );

  const router = useRouter();

  const strapiMutation = api.stripe.createCheckoutSession.useMutation();

  const handleCheckout = async () => {
    localStorage.setItem("cart", JSON.stringify(user.cartItem));
    const { checkoutUrl } = await strapiMutation.mutateAsync({
      items: user.cartItem.map((item) => ({
        id: item.foodId,
        name: item.food.name,
        description: item.foodOption.map((option) => option.name).join(", "),
        image: item.food.image,
        amount: item.quantity,
        quantity: item.quantity,
        price:
          item.food.price +
          item.foodOption.reduce((acc, item) => acc + item.price, 0),
      })),
      restaurantId: restaurant?.id as string,
      deliveryAddress: user.address || "",
    });
    if (checkoutUrl) {
      void router.push(checkoutUrl);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue">
        <div className="relative rounded-2xl bg-white p-4 shadow-md">
          <p className="text-xl font-bold">Shipping address</p>
          <div className="text-sm">
            <p>John Doe</p>
            <p>123 45th Street</p>
            <p>Philadelphia, PA 19104</p>
            <p>123-456-789</p>
          </div>
          <button
            className="absolute top-4 right-4"
            onClick={() => setIsOpen(true)}
          >
            <BluePencil />
          </button>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <div className="flex flex-col gap-2">
            <div>
              <p>Review Your Order</p>
              <p>{restaurant?.name}</p>
              <p>{restaurant?.address}</p>
            </div>
            <div className="h-0.5 w-full bg-virparyasBackground" />
            <ul className="flex list-decimal flex-col gap-2">
              {user.cartItem.map((cardItem) => (
                <li
                  className="marker:text-sm marker:font-bold"
                  key={cardItem.id}
                >
                  <div className="flex justify-between font-bold">
                    <p>{cardItem.food.name}</p>
                    <p>
                      $
                      {(
                        (cardItem.food.price +
                          cardItem.foodOption.reduce(
                            (acc, item) => acc + item.price,
                            0
                          )) *
                        cardItem.quantity
                      ).toFixed(2)}
                    </p>
                  </div>

                  <p className="my-1 text-sm font-light">
                    {cardItem.foodOption
                      .map((option) => option.name)
                      .join(", ")}
                  </p>
                </li>
              ))}
            </ul>
            <div className="h-0.5 w-full bg-virparyasBackground" />
            <div>
              <div className="flex justify-between">
                <p>Items:</p>
                <p>${total}</p>
              </div>
              <div className="flex justify-between">
                <p>Shipping:</p>
                <p>$5.00</p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-virparyasBackground" />
            <div className="flex justify-between">
              <p>Total:</p>
              <p>$TODO</p>
            </div>
          </div>
        </div>
        <CommonButton
          text="Proceed to Payment - $TODO"
          onClick={() => void handleCheckout()}
        ></CommonButton>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col">
                        <label htmlFor="name" className="font-medium">
                          * Name:
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Item name..."
                          defaultValue={user.name || ""}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="address" className="font-medium">
                          * Address:
                        </label>
                        <input
                          type="text"
                          id="address"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                          defaultValue={user.address || ""}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="phone" className="font-medium">
                          * Additional address:
                        </label>
                        <input
                          type="text"
                          id="phone"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                          defaultValue={user.additionalAddress || ""}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="email" className="font-medium">
                          * Phone:
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Email..."
                          defaultValue={user.phoneNumber || ""}
                        />
                      </div>
                    </div>
                    <div className="px-auto mt-4 flex justify-center gap-4">
                      <button
                        type="button"
                        className="w-36 rounded-xl bg-virparyasRed py-2 px-10 font-medium text-white"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        className="w-36 rounded-xl bg-virparyasGreen py-2 px-10 font-medium text-white"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CheckoutBody;
