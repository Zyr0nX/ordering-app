import { Transition, Dialog } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Formik, Form } from "formik";
import { isPossiblePhoneNumber } from "libphonenumber-js/min";
import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
  type NextPage,
} from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import { create } from "zustand";
import CommonButton from "~/components/common/CommonButton";
import Input from "~/components/common/CommonInput";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import BluePencil from "~/components/icons/BluePencil";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { type RouterOutputs, api } from "~/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({
      session,
    }),
    transformer: SuperJSON,
  });

  const { id, country } = context.query;

  if (!id || Array.isArray(id) || Array.isArray(country)) {
    return {
      notFound: true,
    };
  }

  const cart = await helpers.user.getCart.fetch({ restaurantId: id });

  if (!cart || !cart.cartItem[0]) {
    return {
      notFound: true,
    };
  }

  if (!cart.latitude || !cart.longitude) {
    return {
      props: {
        trpcState: helpers.dehydrate(),
        country: country,
        id: id,
      },
    };
  }

  const restaurant = cart.cartItem[0].food.restaurant;
  const distance = await helpers.maps.getDistanceMatrixQuery.fetch({
    origins: {
      lat: restaurant.latitude,
      lng: restaurant.longitude,
    },
    destinations: {
      lat: cart.latitude,
      lng: cart.longitude,
    },
  });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      cart: cart,
      distance: distance,
    },
  };
};

interface CheckoutState {
  cart: RouterOutputs["user"]["getCart"];
  shippingFee: number | null;
}

const useCheckoutStore = create<CheckoutState>(() => ({
  cart: null,
  shippingFee: null,
}));

const Checkout: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ cart, distance }) => {
  useEffect(() => {
    useCheckoutStore.setState({
      cart: cart,
    });
  }, [cart]);

  useEffect(() => {
    if (distance) {
      useCheckoutStore.setState({
        shippingFee: Math.max(Math.round(distance / 500) / 2, 5),
      });
    }
  }, [distance]);

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
    <div className="m-4 flex flex-col gap-4 text-virparyasMainBlue md:mx-32 md:my-8 md:flex-row md:gap-8">
      <ShippingAddress />
      <Receipt />
    </div>
  );
};

const ShippingAddress: React.FC = () => {
  const cart = useCheckoutStore((state) => state.cart);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const utils = api.useContext();

  const { data: user } = api.user.getCart.useQuery(
    { restaurantId: router.query.id as string },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

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
    },
    onSettled: () => {
      void utils.user.getCart.invalidate();
    },
  });

  const distanceMatrixMutation =
    api.maps.getDistanceMatrixMutation.useMutation();

  if (!user) return null;
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
                <Dialog.Panel className="w-11/12 max-w-md transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all md:p-12">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit Infomation
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        name: user.name || "",
                        phoneNumber: user.phoneNumber || "",
                        address: {
                          description: user.address || "",
                          place_id: user.addressId || "",
                        },
                        additionalAddress: user.additionalAddress,
                      }}
                      onSubmit={async (values) => {
                        if (updateUserMutation.isLoading) return;
                        if (
                          !values.name ||
                          !values.phoneNumber ||
                          !values.address.description ||
                          !values.address.place_id
                        )
                          return;
                        await toast.promise(
                          updateUserMutation.mutateAsync(
                            {
                              name: values.name,
                              phoneNumber: values.phoneNumber,
                              address: values.address.description,
                              addressId: values.address.place_id,
                              additionalAddress: values.additionalAddress,
                            },
                            {
                              onSuccess: (data) => {
                                if (
                                  !cart ||
                                  !cart.cartItem[0] ||
                                  !data.latitude ||
                                  !data.longitude
                                ) {
                                  return;
                                }
                                const restaurant =
                                  cart.cartItem[0].food.restaurant;
                                distanceMatrixMutation.mutate(
                                  {
                                    origins: {
                                      lat: restaurant.latitude,
                                      lng: restaurant.longitude,
                                    },
                                    destinations: {
                                      lat: data.latitude,
                                      lng: data.longitude,
                                    },
                                  },
                                  {
                                    onSuccess: (data) => {
                                      if (!data) return;
                                      useCheckoutStore.setState({
                                        shippingFee: Math.max(
                                          Math.round(data / 500) / 2,
                                          5
                                        ),
                                      });
                                    },
                                  }
                                );
                              },
                              onSettled: () => {
                                setIsOpen(false);
                              },
                            }
                          ),
                          {
                            loading: "Updating...",
                            success: "Updated",
                            error: "Failed to update",
                          }
                        );
                      }}
                      validate={(values) => {
                        const errors: {
                          name?: string;
                          phoneNumber?: string;
                          address?: string;
                        } = {};
                        if (!z.string().min(2).safeParse(values.name).success) {
                          errors.name = "Name is required";
                        }
                        if (
                          !z.string().max(191).safeParse(values.name).success
                        ) {
                          errors.name = "Name is too long";
                        }
                        if (!isPossiblePhoneNumber(values.phoneNumber)) {
                          errors.phoneNumber = "Invalid phone number";
                        }
                        if (
                          !z
                            .string()
                            .min(2)
                            .safeParse(values.address.description).success
                        ) {
                          errors.name = "Address is required";
                        }
                        return errors;
                      }}
                    >
                      <Form className="grid grid-cols-1 gap-4">
                        <Input type="text" label="* Name:" name="name" />
                        <PhoneNumberInput
                          label="* Phone number:"
                          name="phoneNumber"
                        />
                        <PlaceAutoCompleteCombobox
                          label="* Address"
                          name="address"
                        />
                        <Input
                          type="text"
                          label="Additional address"
                          name="additionalAddress"
                        />
                        <div className="px-auto mt-4 flex w-full justify-center gap-4">
                          {updateUserMutation.isLoading ? (
                            <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                          ) : (
                            <>
                              <button
                                type="button"
                                className="w-36 rounded-xl bg-virparyasRed px-10 py-2 font-medium text-white"
                              >
                                Discard
                              </button>
                              <button
                                type="submit"
                                className="w-36 rounded-xl bg-virparyasGreen px-10 py-2 font-medium text-white"
                              >
                                Confirm
                              </button>
                            </>
                          )}
                        </div>
                      </Form>
                    </Formik>
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

const Receipt: React.FC = () => {
  const stripeMutation = api.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) void router.push(data.checkoutUrl);
    },
  });
  const router = useRouter();
  const cart = useCheckoutStore((state) => state.cart);
  const shippingFee = useCheckoutStore((state) => state.shippingFee);

  if (!cart || !cart.cartItem[0]) return null;

  const restaurant = cart.cartItem[0].food.restaurant;
  const itemTotal = cart.cartItem.reduce(
    (acc, item) =>
      acc +
      (item.food.price +
        item.foodOption
          .map((option) => option.price)
          .reduce((a, b) => a + b, 0)) *
        item.quantity,
    0
  );
  const total = itemTotal + (shippingFee || 0);

  const handleCheckout = async () => {
    await toast.promise(
      stripeMutation.mutateAsync({
        restaurantId: restaurant.id,
      }),
      {
        loading: "Creating checkout link...",
        success: "Checkout link created! Redirecting...",
        error: "Failed to create checkout link",
      }
    );
  };

  return (
    <div className="flex grow flex-col gap-4 rounded-2xl bg-white p-4 shadow-md md:p-8">
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold md:text-3xl">Review Your Order</p>
          <div className="text-xs md:text-base">
            <p>{restaurant.name}</p>
            <p>{restaurant.address}</p>
          </div>
        </div>
        <div className="h-0.5 w-full bg-virparyasBackground" />
        <ul className="flex list-decimal flex-col gap-2 pl-4 md:gap-4">
          {cart.cartItem.map((cardItem) => (
            <li
              className="marker:font-bold marker:md:text-xl"
              key={cardItem.id}
            >
              <div className="flex justify-between font-bold md:text-xl">
                <p>
                  {cardItem.food.name} ×{cardItem.quantity}
                </p>
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
                {cardItem.foodOption.map((option) => option.name).join(", ")}
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
        <div className="h-0.5 w-full bg-virparyasBackground" />
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
        {stripeMutation.isLoading ? (
          <Loading className="h-12 w-12 animate-spin fill-virparyasMainBlue text-gray-200" />
        ) : (
          <CommonButton
            text={`Proceed to Payment - $${total.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            onClick={() => void handleCheckout()}
          ></CommonButton>
        )}
      </div>
    </div>
  );
};

export default Checkout;
