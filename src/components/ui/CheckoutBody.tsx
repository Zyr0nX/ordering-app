import CommonButton from "../common/CommonButton";
import BluePencil from "../icons/BluePencil";
import DropDownIcon from "../icons/DropDownIcon";
import { Transition, Dialog, Listbox } from "@headlessui/react";
import {
  type User,
  type CartItem,
  type Food,
  type FoodOptionItem,
  type Restaurant,
} from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { Fragment, useRef, useState } from "react";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";

const CheckoutBody = ({
  user,
  country,
}: {
  user: User & {
    cartItem: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
  country: string;
}) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const additionalAddressRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);

  const restaurant = user.cartItem[0]?.food.restaurant;

  const [phonePrefix, setPhonePrefix] = useState(
    countries.find((c) => c.isoCode === country)
  );

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

  const updateUserMutation = api.user.updateInfo.useMutation();

  const handleUpdateUser = async () => {
    await updateUserMutation.mutateAsync({
      name: nameRef.current?.value || "",
      address: addressRef.current?.value || "",
      additionalAddress: additionalAddressRef.current?.value,
      phoneNumber: phoneNumberRef.current?.value || "",
    });
    setIsOpen(false);
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue">
        <div className="relative rounded-2xl bg-white p-4 shadow-md">
          <p className="text-xl font-bold">Shipping address</p>
          <div className="text-sm">
            <p>{user.name}</p>
            <p>{user.additionalAddress}</p>
            <p>{user.address}</p>
            <p>{user.phoneNumber}</p>
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
                          placeholder="Name..."
                          defaultValue={user.name || ""}
                          ref={nameRef}
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
                          placeholder="Address..."
                          defaultValue={user.address || ""}
                          ref={addressRef}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="additionalAddress"
                          className="font-medium"
                        >
                          Additional address:
                        </label>
                        <input
                          type="text"
                          id="additionalAddress"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Additional address..."
                          defaultValue={user.additionalAddress || ""}
                          ref={additionalAddressRef}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="phone" className="font-medium">
                          * Phone:
                        </label>
                        <div className="flex gap-2">
                          {phonePrefix && (
                            <Listbox
                              value={phonePrefix}
                              onChange={setPhonePrefix}
                            >
                              {({ open }) => (
                                <div className="relative w-24 shrink-0">
                                  <Listbox.Button
                                    className={`relative h-10 w-full rounded-xl bg-white px-4 text-left ${
                                      open
                                        ? "ring-2 ring-virparyasMainBlue"
                                        : ""
                                    }`}
                                  >
                                    <span className="truncate">
                                      {phonePrefix?.dialCode}
                                    </span>
                                    <span className="pointer-events-none absolute right-0 top-1/2 mr-4 flex -translate-y-1/2 items-center">
                                      <DropDownIcon />
                                    </span>
                                  </Listbox.Button>
                                  {countries && (
                                    <Transition
                                      as={Fragment}
                                      leave="transition ease-in duration-100"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                                        {countries.map((country) => (
                                          <Listbox.Option
                                            key={country.name}
                                            className={({ active }) =>
                                              `relative cursor-default select-none text-viparyasDarkBlue ${
                                                active
                                                  ? "bg-[#E9E9FF]"
                                                  : "text-gray-900"
                                              }`
                                            }
                                            value={country}
                                          >
                                            {({ selected }) => (
                                              <span
                                                className={`flex gap-2 truncate py-2 px-4 ${
                                                  selected
                                                    ? "bg-virparyasMainBlue font-semibold text-white"
                                                    : ""
                                                }`}
                                              >
                                                <Image
                                                  src={country.flag}
                                                  width={20}
                                                  height={10}
                                                  alt="flag"
                                                ></Image>
                                                {country.dialCode}
                                              </span>
                                            )}
                                          </Listbox.Option>
                                        ))}
                                      </Listbox.Options>
                                    </Transition>
                                  )}
                                </div>
                              )}
                            </Listbox>
                          )}
                          <input
                            type="text"
                            id="phone"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            //   ${
                            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
                            //   }

                            placeholder="Phone..."
                            ref={phoneNumberRef}
                          />
                        </div>
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
