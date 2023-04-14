import CommonButton from "../common/CommonButton";
import Loading from "../common/Loading";
import PlaceAutoCompleteCombobox from "../common/PlaceAutoCompleteCombobox";
import BluePencil from "../icons/BluePencil";
import DropDownIcon from "../icons/DropDownIcon";
import { type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
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
import { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { api } from "~/utils/api";
import countries from "~/utils/countries.json";

interface CheckoutBodyProps {
  user: User & {
    cartItem: (CartItem & {
      food: Food & {
        restaurant: Restaurant;
      };
      foodOption: FoodOptionItem[];
    })[];
  };
  country: string;
  distance: number | undefined;
}

const CheckoutBody: React.FC<CheckoutBodyProps> = ({
  user,
  country,
  distance,
}) => {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<PlaceAutocompleteResult>({
      description: user.address || "",
      place_id: user.addressId || "",
      terms: [],
      types: [],
      matched_substrings: [],
      structured_formatting: {
        main_text: "",
        main_text_matched_substrings: [],
        secondary_text: "",
        secondary_text_matched_substrings: [],
      },
    });
  const [additionalAddress, setAdditionalAddress] = useState(
    user.additionalAddress
  );
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

  const [isInvalidName, setIsInvalidName] = useState<boolean | null>(null);
  const [isInvalidAddress, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);

  const [shippingFee, setShippingFee] = useState<number | null>(() => {
    if (distance) {
      return Math.max(Math.round(distance / 500) / 2, 5);
    }
    return null;
  });

  const [lat, setLat] = useState<number | null>(user.latitude || null);
  const [lng, setLng] = useState<number | null>(user.longitude || null);

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

  const itemTotal = user.cartItem.reduce(
    (acc, item) =>
      acc +
      (item.food.price +
        item.foodOption
          .map((option) => option.price)
          .reduce((a, b) => a + b, 0)) *
        item.quantity,
    0
  );

  const [total, setTotal] = useState<number>(itemTotal + (shippingFee || 0));

  const stripeMutation = api.stripe.createCheckoutSession.useMutation({
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) void router.push(data.checkoutUrl);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleCheckout = async () => {
    await toast.promise(stripeMutation.mutateAsync({
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
    }), {
      loading: "Creating checkout link...",
      success: "Checkout link created! Redirecting...",
      error: "Failed to create checkout link",
    });
  };

  const utils = api.useContext();

  const updateUserMutation = api.user.updateInfo.useMutation({
    onSuccess: (newUser) => {
      utils.user.getCart.setData(
        { restaurantId: router.query.id as string },
        (data) => {
          if (data) {
            return {
              ...data,
              name: newUser.name,
              address: newUser.address,
              addressId: newUser.addressId,
              additionalAddress: newUser.additionalAddress,
              phoneNumber: newUser.phoneNumber,
            };
          }
          return data;
        }
      );
      setLat(newUser.latitude);
      setLng(newUser.longitude);
    },
    onSettled: () => {
      void utils.user.getCart.invalidate();
    },
  });

  const reverseGeocodeQuery = api.maps.getReverseGeocode.useQuery(
    {
      query: `${lat as number},${lng as number}`,
    },
    {
      onSuccess: (data) => {
        if (!data) return;
        setPlaceAutocomplete({
          description: data.formatted_address,
          place_id: data.place_id,
          terms: [],
          types: [],
          matched_substrings: [],
          structured_formatting: {
            main_text: "",
            main_text_matched_substrings: [],
            secondary_text: "",
            secondary_text_matched_substrings: [],
          },
        });
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
    }
  );

  const handleUpdateUser = async () => {
    let isInvalidForm = true;

    if (!z.string().nonempty().safeParse(name).success) {
      setIsInvalidName(true);
      isInvalidForm = false;
    } else {
      setIsInvalidName(false);
    }

    if (
      !z.string().nonempty().safeParse(placeAutocomplete.description).success ||
      !z.string().nonempty().safeParse(placeAutocomplete.place_id).success
    ) {
      setIsInvalidAddress(true);
      isInvalidForm = false;
    } else {
      setIsInvalidAddress(false);
    }

    if (!z.string().nonempty().safeParse(phoneNumber).success) {
      setIsInvalidPhoneNumber(true);
      isInvalidForm = false;
    } else {
      setIsInvalidPhoneNumber(false);
    }

    if (!isInvalidForm) return;
    await updateUserMutation.mutateAsync({
      name: name as string,
      address: placeAutocomplete.description,
      addressId: placeAutocomplete.place_id,
      additionalAddress: additionalAddress,
      phoneNumber: `${
        phonePrefix?.dialCode ? `(${phonePrefix?.dialCode}) ` : ""
      }${phoneNumber || ""}`,
    });
    await reverseGeocodeQuery.refetch();
    setIsOpen(false);
    if (
      name &&
      phoneNumber &&
      placeAutocomplete.description &&
      placeAutocomplete.place_id
    ) {
      setIsDisabled(false);
      return;
    }
    setIsDisabled(true);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(
    user.address && user.phoneNumber && distance ? false : true
  );
  const [isOpen, setIsOpen] = useState(false);

  const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Only allow digits
    const newValue = value.replace(/\D/g, "");

    // Format the phone number
    const formattedValue = newValue.replace(
      /(\d{3})(\d{3})(\d{3})/,
      "$1-$2-$3"
    );
    setPhoneNumber(formattedValue);
  };

  api.maps.getDistanceMatrix.useQuery(
    {
      origins: {
        lat: restaurant?.latitude as number,
        lng: restaurant?.longitude as number,
      },
      destinations: {
        lat: lat as number,
        lng: lng as number,
      },
    },
    {
      enabled: !!lat && !!lng,
      onSuccess: (data) => {
        if (!data) return;

        setShippingFee(Math.max(Math.round(data / 500) / 2, 5));
        setTotal(itemTotal + Math.max(Math.round(data / 500) / 2, 5));
      },
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const handleCurrentAddress = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <>
      <div className="text-virparyasMainBlue m-4 flex flex-col gap-4 md:mx-32 md:my-8 md:flex-row md:gap-8">
        <div className="relative flex h-fit shrink-0 flex-col rounded-2xl bg-white p-4 shadow-md md:w-96 md:gap-4 md:p-8">
          <p className="text-xl font-bold md:text-3xl">Shipping address</p>
          <div className="flex flex-col text-sm md:gap-0.5 md:text-lg">
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {cartQuery.data?.name}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {cartQuery.data?.address}
            </p>
            <p>
              <span className="font-semibold">Additional address:</span>{" "}
              {cartQuery.data?.additionalAddress}
            </p>
            <p>
              <span className="font-semibold">Phone number:</span>{" "}
              {cartQuery.data?.phoneNumber}
            </p>
          </div>
          <button
            className="absolute right-4 top-4 md:right-8 md:top-8"
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
            <div className="bg-virparyasBackground h-0.5 w-full" />
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
            <div className="bg-virparyasBackground h-0.5 w-full" />
            <div className="text-sm md:text-base">
              <div className="flex justify-between">
                <p>Items:</p>
                <p>
                  $
                  {itemTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="flex justify-between">
                <p>Shipping:</p>
                <p>
                  {shippingFee
                    ? `${shippingFee.toLocaleString("en-US", {
                        currency: "USD",
                        style: "currency",
                      })}`
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-virparyasBackground h-0.5 w-full" />
            <div className="flex justify-between font-bold md:text-2xl">
              <p>Total:</p>
              <p>
                $
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            {isLoading ? (
              <Loading className="fill-virparyasMainBlue h-12 w-12 animate-spin text-gray-200" />
            ) : (
              <CommonButton
                text={`Proceed to Payment - $${total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                onClick={() => void handleCheckout()}
                disabled={isDisabled}
              ></CommonButton>
            )}
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
                <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 max-w-md transform overflow-hidden rounded-2xl p-6 transition-all md:p-12">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit Infomation
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label htmlFor="name" className="font-medium">
                            * Name:
                          </label>
                          {isInvalidName && (
                            <p className="text-virparyasRed text-xs">
                              Name is required
                            </p>
                          )}
                        </div>

                        <input
                          type="text"
                          id="name"
                          className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                            isInvalidName ? "ring-virparyasRed ring-2" : ""
                          }`}
                          placeholder="Name..."
                          value={name || ""}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label htmlFor="phoneNumber" className="font-medium">
                            * Phone number:
                          </label>
                          {isInvalidPhoneNumber && (
                            <p className="text-virparyasRed text-xs">
                              Phone number is required
                            </p>
                          )}
                        </div>
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
                                        ? "ring-virparyasMainBlue ring-2"
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
                                      <Listbox.Options className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white shadow-lg focus:outline-none">
                                        {countries.map((country) => (
                                          <Listbox.Option
                                            key={country.name}
                                            className={({ active }) =>
                                              `text-viparyasDarkBlue relative cursor-default select-none ${
                                                active
                                                  ? "bg-[#E9E9FF]"
                                                  : "text-gray-900"
                                              }`
                                            }
                                            value={country}
                                          >
                                            {({ selected }) => (
                                              <span
                                                className={`flex gap-2 truncate px-4 py-2 ${
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
                            id="phoneNumber"
                            className={`focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                              isInvalidPhoneNumber
                                ? "ring-virparyasRed ring-2"
                                : ""
                            }`}
                            placeholder="Phone..."
                            value={
                              phoneNumber?.startsWith(
                                `(${phonePrefix?.dialCode || ""}) `
                              )
                                ? phoneNumber?.slice(
                                    (phonePrefix?.dialCode.length || 0) + 3
                                  )
                                : phoneNumber || ""
                            }
                            onChange={(e) => formatPhoneNumber(e)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <label htmlFor="address" className="font-medium">
                            * Address:
                          </label>
                          {isInvalidAddress && (
                            <p className="text-virparyasRed text-xs">
                              Address is required
                            </p>
                          )}
                        </div>

                        <PlaceAutoCompleteCombobox
                          placeAutocomplete={placeAutocomplete}
                          setPlaceAutocomplete={setPlaceAutocomplete}
                          isInvalidAddress={isInvalidAddress}
                        />
                        <button onClick={handleCurrentAddress}>
                          Use your current address
                        </button>
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
                          className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                          placeholder="Additional address..."
                          value={additionalAddress || ""}
                          onChange={(e) => setAdditionalAddress(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="px-auto mt-4 flex w-full justify-center gap-4">
                      {updateUserMutation.isLoading ? (
                        <Loading className="fill-virparyasMainBlue h-10 w-10 animate-spin text-gray-200" />
                      ) : (
                        <>
                          <button
                            type="button"
                            className="bg-virparyasRed w-36 rounded-xl px-10 py-2 font-medium text-white"
                          >
                            Discard
                          </button>
                          <button
                            type="button"
                            className="bg-virparyasGreen w-36 rounded-xl px-10 py-2 font-medium text-white"
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
