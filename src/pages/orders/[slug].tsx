import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  type InferGetServerSidePropsType,
  type NextPage,
  type GetServerSidePropsContext,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import Loading from "~/components/common/Loading";
import EmptyStarIcon from "~/components/icons/EmptyStarIcon";
import FullStarIcon from "~/components/icons/FullStarIcon";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const helpers = createServerSideHelpers({
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

  const { slug: orderId } = context.query;

  if (!orderId || Array.isArray(orderId) || !orderId.startsWith("VP-")) {
    return {
      notFound: true,
    };
  }

  const order = await helpers.order.getOrderByUser.fetch({
    orderId: Number(orderId.replace("VP-", "")),
  });

  if (!order) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Order: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Order Summary" />
        <OrderBody />
      </>
    </Guest>
  );
};

const OrderBody: React.FC = () => {
  const router = useRouter();
  const { slug: orderId } = router.query;

  const { data: order } = api.order.getOrderByUser.useQuery({
    orderId: Number((orderId as string).replace("VP-", "")),
  });
  if (!order) return null;
  const itemsPrice = order.orderFood?.reduce(
    (acc, cur) => acc + cur.price * cur.quantity,
    0
  );
  return (
    <div className="m-4 grid grid-cols-1 gap-4 text-virparyasMainBlue md:m-8 md:grid-cols-2 md:gap-8">
      <div className="h-fit rounded-2xl bg-white p-4 shadow-md md:col-start-2 md:row-start-1">
        <p className="text-xl font-bold md:text-3xl">Order Status</p>
        <div className="mt-4 grid grid-cols-4 grid-rows-1 gap-2">
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "PLACED" ||
                order.status === "PREPARING" ||
                order.status === "DELIVERING" ||
                order.status === "DELIVERED" ||
                order.status === "REJECTED_BY_RESTAURANT" ||
                order.status === "READY_FOR_PICKUP" ||
                order.status === "REJECTED_BY_SHIPPER"
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p className="text-[0.625rem] text-virparyasGreen">Order placed</p>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "PREPARING" ||
                order.status === "DELIVERING" ||
                order.status === "DELIVERED" ||
                order.status === "READY_FOR_PICKUP" ||
                order.status === "REJECTED_BY_SHIPPER"
                  ? "bg-virparyasGreen"
                  : order.status === "REJECTED_BY_RESTAURANT"
                  ? "bg-virparyasRed"
                  : "bg-virparyasBackground"
              }`}
            />
            <p
              className={`text-[0.625rem] ${
                order.status === "PREPARING" ||
                order.status === "DELIVERING" ||
                order.status === "DELIVERED" ||
                order.status === "READY_FOR_PICKUP" ||
                order.status === "REJECTED_BY_SHIPPER"
                  ? "text-virparyasGreen"
                  : order.status === "REJECTED_BY_RESTAURANT"
                  ? "text-virparyasRed"
                  : "text-virparyasBackground"
              }`}
            >
              {order.status === "REJECTED_BY_RESTAURANT"
                ? "Rejected"
                : "Preparing"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "DELIVERING" || order.status === "DELIVERED"
                  ? "bg-virparyasGreen"
                  : order.status === "REJECTED_BY_SHIPPER"
                  ? "bg-virparyasRed"
                  : "bg-virparyasBackground"
              }`}
            />
            <p
              className={`text-[0.625rem] ${
                order.status === "DELIVERING" || order.status === "DELIVERED"
                  ? "text-virparyasGreen"
                  : order.status === "REJECTED_BY_SHIPPER"
                  ? "text-virparyasRed"
                  : "text-virparyasBackground"
              }`}
            >
              {order.status === "REJECTED_BY_SHIPPER"
                ? "Rejected"
                : "Out for delivery"}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-[0.325rem] w-full ${
                order.status === "DELIVERED"
                  ? "bg-virparyasGreen"
                  : "bg-virparyasBackground"
              }`}
            />
            <p
              className={`text-[0.625rem] ${
                order.status === "DELIVERED"
                  ? "text-virparyasGreen"
                  : "text-virparyasBackground"
              }`}
            >
              Delivered
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-md md:row-start-1 md:p-6">
        <div className="flex flex-col gap-2 md:gap-4">
          <p className="text-xl font-bold md:text-3xl">Receipt</p>
          <div className="text-xs md:text-base">
            <p>
              {order.createdAt.toLocaleString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
            <p>{order.restaurant.name}</p>
            <p>{order.restaurantAddress}</p>
          </div>
          <div className="h-0.5 bg-virparyasSeparator" />
          <ul className="ml-4 flex list-decimal flex-col gap-2">
            {order.orderFood?.map((item) => (
              <li className="marker:font-bold md:marker:text-xl" key={item.id}>
                <div className="flex justify-between font-bold md:text-xl">
                  <p>
                    {item.foodName} ×{item.quantity}
                  </p>
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <p className="my-1 text-xs font-light md:text-sm">
                  {item.foodOption}
                </p>
              </li>
            ))}
          </ul>
          <div className="h-0.5 bg-virparyasSeparator" />
          <div className="text-sm md:text-base">
            <div className="flex justify-between">
              <p>Items:</p>
              <p>
                {itemsPrice.toLocaleString("en-US", {
                  currency: "USD",
                  style: "currency",
                })}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Shipping:</p>
              <p>
                {order.shippingFee.toLocaleString("en-US", {
                  currency: "USD",
                  style: "currency",
                })}
              </p>
            </div>
          </div>
          <div className="h-0.5 bg-virparyasSeparator" />
          <div>
            <div className="flex justify-between text-lg font-bold md:text-2xl">
              <p>Total:</p>
              <p>
                {(itemsPrice + order.shippingFee).toLocaleString("en-US", {
                  currency: "USD",
                  style: "currency",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative top-32 flex flex-col gap-4 md:col-start-2 md:row-start-1">
        {order.status === "DELIVERED" && <Rating />}
        <Link
          href="/"
          className=" flex h-fit w-full items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

const Rating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { slug: orderId } = router.query;

  const { data: order } = api.order.getOrderByUser.useQuery({
    orderId: Number((orderId as string).replace("VP-", "")),
  });

  const ratingMutation = api.order.rateOrder.useMutation();

  const [restaurantRating, setRestaurantRating] = useState(
    order?.restaurantRating || 0
  );
  const [shipperRating, setShipperRating] = useState(order?.shipperRating || 0);
  if (!order || !order.shipper) return null;
  const handleSubmit = async () => {
    await toast.promise(
      ratingMutation.mutateAsync({
        orderId: Number((orderId as string).replace("VP-", "")),
        restaurantRating,
        shipperRating,
      }),
      {
        loading: "Submitting...",
        success: "Submitted!",
        error: "Error",
      }
    );
    setIsOpen(false);
  };

  return (
    <>
      <button
        className=" flex h-fit w-full items-center justify-center rounded-xl bg-virparyasMainBlue p-3 font-bold text-white"
        onClick={() => setIsOpen(true)}
      >
        Rate Your Experience
      </button>
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
                    Rate Your Experience
                  </Dialog.Title>
                  <div className="flex flex-col gap-4 font-semibold">
                    <div className="flex flex-col gap-2">
                      <p>
                        How would you rate your experience with{" "}
                        {order.restaurant.name}?
                      </p>
                      <div className="flex justify-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => {
                          if (restaurantRating > i) {
                            return (
                              <FullStarIcon
                                key={i}
                                className="cursor-pointer fill-virparyasMainBlue md:h-8 md:w-8"
                                onClick={() => setRestaurantRating(i + 1)}
                              />
                            );
                          } else {
                            return (
                              <EmptyStarIcon
                                key={i}
                                className="cursor-pointer fill-[#D9D9D9] md:h-8 md:w-8"
                                onClick={() => setRestaurantRating(i + 1)}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p>
                        How would you rate your experience with shipper{" "}
                        {`${order.shipper.firstName} ${order.shipper.lastName}`}
                        ?
                      </p>
                      <div className="flex justify-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => {
                          if (shipperRating > i) {
                            return (
                              <FullStarIcon
                                key={i}
                                className="cursor-pointer fill-virparyasMainBlue md:h-8 md:w-8"
                                onClick={() => setShipperRating(i + 1)}
                              />
                            );
                          } else {
                            return (
                              <EmptyStarIcon
                                key={i}
                                className="cursor-pointer fill-[#D9D9D9] md:h-8 md:w-8"
                                onClick={() => setShipperRating(i + 1)}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      {ratingMutation.isLoading ? (
                        <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                      ) : (
                        <button
                          type="button"
                          className="w-36 rounded-xl bg-virparyasMainBlue px-10 py-2 font-medium text-white"
                          onClick={() => void handleSubmit()}
                        >
                          Submit
                        </button>
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

export default Order;
