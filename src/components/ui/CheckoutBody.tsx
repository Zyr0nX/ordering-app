import CommonButton from "../common/CommonButton";
import Loading from "../common/Loading";
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
  const router = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const additionalAddressRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef<HTMLInputElement>(null);

  const restaurant = user.cartItem[0]?.food.restaurant;

  const cartQuery = api.user.getCart.useQuery(
    { restaurantId: (router.query.id as string) || "" },
    {
      initialData: user,
    }
  );

  const [phonePrefix, setPhonePrefix] = useState(
    countries.find((c) => c.isoCode === country)
  );

  const total = user.cartItem.reduce(
    (acc, item) => acc + item.food.price * item.quantity,
    0
  );

  const strapiMutation = api.stripe.createCheckoutSession.useMutation();

  const handleCheckout = async () => {
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

  const utils = api.useContext();

  const updateUserMutation = api.user.updateInfo.useMutation({
    onMutate: async (newUser) => {
      await utils.user.getCart.cancel();
      utils.user.getCart.setData({ restaurantId: router.query.id as string}, (old) => {
        if (old) {
          return {
            ...old,
            ...newUser,
          };
        }
        return old;
      });
    },
    onSettled: () => {
      void utils.user.getCart.invalidate();
    },
  });

  const handleUpdateUser = async () => {
    await updateUserMutation.mutateAsync({
      name: nameRef.current?.value || "",
      address: addressRef.current?.value || "",
      additionalAddress: additionalAddressRef.current?.value,
      phoneNumber: `${phonePrefix?.dialCode || ""}${
        phoneNumberRef.current?.value as string
      }`,
    });
    setIsOpen(false);
  };

  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue md:mx-32 md:my-8 md:flex-row md:gap-8">
        <div className="relative flex h-fit shrink-0 flex-col rounded-2xl bg-white p-4 shadow-md md:w-96 md:gap-4 md:p-8">
          <p className="text-xl font-bold md:text-3xl">Shipping address</p>
          <div className="flex flex-col text-sm md:gap-0.5 md:text-lg">
            <p>{cartQuery.data?.name}</p>
            <p>{cartQuery.data?.address}</p>
            <p>{cartQuery.data?.additionalAddress}</p>
            <p>{cartQuery.data?.phoneNumber}</p>
          </div>
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8"
            onClick={() => setIsOpen(true)}
          >
            <BluePencil />
          </button>
        </div>
        <div className="flex grow flex-col gap-4 rounded-2xl bg-white p-4 shadow-md md:p-8">
          <div className="flex flex-col gap-2 md:gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold md:text-3xl">Review Your Order</p>
              <div className="text-xs md:text-base">
                <p>{restaurant?.name}</p>
                <p>{restaurant?.address}</p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-virparyasBackground" />
            <ul className="flex list-decimal flex-col gap-2 pl-4 md:gap-4">
              {cartQuery.data?.cartItem.map((cardItem) => (
                <li
                  className="marker:font-bold marker:md:text-xl"
                  key={cardItem.id}
                >
                  <div className="flex justify-between font-bold md:text-xl">
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

                  <p className="my-1 text-sm font-light md:text-base">
                    {cardItem.foodOption
                      .map((option) => option.name)
                      .join(", ")}
                  </p>
                </li>
              ))}
            </ul>
            <div className="h-0.5 w-full bg-virparyasBackground" />
            <div className="text-sm md:text-base">
              <div className="flex justify-between">
                <p>Items:</p>
                <p>
                  $
                  {total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Shipping:</p>
                <p>$5.00</p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-virparyasBackground" />
            <div className="flex justify-between font-bold md:text-2xl">
              <p>Total:</p>
              <p>
                $
                {(total + 5).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <CommonButton
              text={`Proceed to Payment - $${(total + 5).toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`}
              onClick={() => void handleCheckout()}
            ></CommonButton>
          </div>
        </div>
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
                <Dialog.Panel className="w-11/12 max-w-md transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all md:p-12">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit Infomation
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
                          defaultValue={cartQuery.data?.name || ""}
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
                          defaultValue={cartQuery.data?.address || ""}
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
                          defaultValue={cartQuery.data?.additionalAddress || ""}
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
                            type="number"
                            id="phone"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            //   ${
                            //     emailSent === false ? "ring-2 ring-virparyasRed" : ""
                            //   }
                            defaultValue={
                              (cartQuery.data?.phoneNumber?.startsWith(
                                phonePrefix?.dialCode || ""
                              )
                                ? cartQuery.data.phoneNumber.slice(
                                    phonePrefix?.dialCode.length
                                  )
                                : cartQuery.data?.phoneNumber) || ""
                            }
                            placeholder="Phone..."
                            ref={phoneNumberRef}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-auto mt-4 flex w-full justify-center gap-4">
                      {updateUserMutation.isLoading ? (
                        <Loading />
                      ) : (
                        <>
                          <button
                            type="button"
                            className="w-36 rounded-xl bg-virparyasRed py-2 px-10 font-medium text-white"
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            className="w-36 rounded-xl bg-virparyasGreen py-2 px-10 font-medium text-white"
                            onClick={() => void handleUpdateUser()}
                          >
                            Confirm
                          </button>
                        </>
                      )}
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
