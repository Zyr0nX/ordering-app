import { PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { Dialog, Transition } from "@headlessui/react";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { inferProcedureOutput } from "@trpc/server";
import { Form, Formik, useFormik } from "formik";
import { type InferGetServerSidePropsType, type GetServerSidePropsContext, type NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SuperJSON from "superjson";
import { create } from "zustand";
import Loading from "~/components/common/Loading";
import { CountrySelect } from "~/components/common/PhoneNumber";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import TextInput from "~/components/common/TextInput";
import BluePencil from "~/components/icons/BluePencil";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { env } from "~/env.mjs";
import { AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { redis } from "~/server/cache";
import { prisma } from "~/server/db";
import { maps } from "~/server/maps";
import { api } from "~/utils/api";


export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: session }),
    transformer: SuperJSON,
  });

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { id } = context.query;

  if (!id || Array.isArray(id)) {
    return {
      notFound: true,
    };
  }

  const user = await ssg.user.getCart.fetch({ restaurantId: id });

  if (!user || !user.cartItem[0]) {
    return {
      notFound: true,
    };
  }

  const restaurant = user.cartItem[0].food.restaurant;

  await ssg.maps.getDistanceMatrix.fetch({
    origins: {
      lat: restaurant.latitude,
      lng: restaurant.longitude,
    },
    destinations: {
      lat: user.latitude,
      lng: user.longitude,
    },
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

interface CheckoutState {
  user: inferProcedureOutput<AppRouter["user"]["getCart"]>;
  shippingFee: number | null;
}

const useCheckoutStore = create<CheckoutState>((set) => ({
  user: null,
  shippingFee: null,
}));

const Checkout: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data: userCartData } = api.user.getCart.useQuery(
    { restaurantId: id },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const restaurant = userCartData?.cartItem[0]?.food.restaurant;

  const { data: distanceData } = api.maps.getDistanceMatrix.useQuery({
    origins: {
      lat: restaurant?.latitude,
      lng: restaurant?.longitude,
    },
    destinations: {
      lat: userCartData?.latitude,
      lng: userCartData?.longitude,
    },
  });

  useEffect(() => {
    useCheckoutStore.setState({
      user: userCartData,
      shippingFee: distanceData,
    });
  }, [userCartData, distanceData]);

  return (
    <Guest>
      <>
        <GuestCommonHeader text="Checkout" />
        <CheckoutBody />
      </>
    </Guest>
  );
};

const CheckoutBody: React.FC = () => {
  return (
    <>
      <div className="text-virparyasMainBlue m-4 flex flex-col gap-4 md:mx-32 md:my-8 md:flex-row md:gap-8">
        <CheckoutAddress />
        <div className="flex grow flex-col gap-4 rounded-2xl bg-white p-4 shadow-md md:p-8">
          {/* <div className="flex flex-col gap-2 md:gap-4">
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
          </div> */}
        </div>
      </div>
    </>
  );
};

const CheckoutAddress = () => {
  const user = useCheckoutStore((state) => state.user);

  const [name, setName] = useState(user?.name);
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<PlaceAutocompleteResult>({
      description: user?.address || "",
      place_id: user?.addressId || "",
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
    user?.additionalAddress
  );
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber);

  const [isInvalidName, setIsInvalidName] = useState<boolean | null>(null);
  const [isInvalidAddress, setIsInvalidAddress] = useState<boolean | null>(
    null
  );
  const [isInvalidPhoneNumber, setIsInvalidPhoneNumber] = useState<
    boolean | null
  >(null);

  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }
  return (
    <>
      <div className="relative flex h-fit shrink-0 flex-col rounded-2xl bg-white p-4 shadow-md md:w-96 md:gap-4 md:p-8">
        <p className="text-xl font-bold md:text-3xl">Shipping address</p>
        <div className="flex flex-col text-sm md:gap-0.5 md:text-lg">
          <p>
            <span className="font-semibold">Name:</span> {user.name}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {user.address}
          </p>
          <p>
            <span className="font-semibold">Additional address:</span>{" "}
            {user.additionalAddress}
          </p>
          <p>
            <span className="font-semibold">Phone number:</span>{" "}
            {user.phoneNumber}
          </p>
        </div>
        <button
          className="absolute right-4 top-4 md:right-8 md:top-8"
          onClick={() => setIsOpen(true)}
        >
          <BluePencil />
        </button>
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
                  <DeliveryAddressForm></DeliveryAddressForm>
                  {/* <div className="mt-2">
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
                  </div> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const DeliveryAddressForm = () => {
  const user = useCheckoutStore((state) => state.user);

  return (
    <Formik
      initialValues={{
        name: user?.name || "",
        address: user?.address || "",
        additionalAddress: user?.additionalAddress || "",
        phonePrefix: "US",
        phoneNumber: user?.phoneNumber || "",
      }}
      onSubmit={(value) => {
        console.log(value);
      }}
      // onSubmit={async (values) => {
      //   const { name, address, additionalAddress, phoneNumber } = values;
      //   const { data } = await updateUserMutation.mutateAsync({
      //     name,
      //     address,
      //     additionalAddress,
      //     phoneNumber,
      //   });
      //   if (data) {
      //     useCheckoutStore.getState().setUser(data);
      //     setIsOpen(false);
      //   }
      // }}
    >
      <Form className="grid grid-cols-1 gap-4">
          <TextInput label="Name" name="name" type="text" placeholder="Name..." />
          <TextInput label="Address" name="address" type="text" placeholder="Address..." />
          <CountrySelect name="phonePrefix" label="prefix" />
          <TextInput label="Additional Address" name="additionalAddress" type="text" placeholder="Additional Address..." />
          <TextInput label="Phone Number" name="phoneNumber" type="text" placeholder="Phone Number..." />
          <button>Submit</button>
        {/* <div className="flex flex-col">
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
        </div>
        <PhoneNumberInput
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          isInvalidPhoneNumber={isInvalidPhoneNumber}
        />
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <label htmlFor="address" className="font-medium">
              * Address:
            </label>
            {isInvalidAddress && (
              <p className="text-virparyasRed text-xs">Address is required</p>
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
          <label htmlFor="additionalAddress" className="font-medium">
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
        </div> */}
      </Form>
    </Formik>
  );
};

export default Checkout;