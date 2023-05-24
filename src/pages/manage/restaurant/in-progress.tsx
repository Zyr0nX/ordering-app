import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Loading from "~/components/common/Loading";
import TextArea from "~/components/common/TextArea";
import GreenCheckmark from "~/components/icons/GreenCheckmark";
import InfoIcon from "~/components/icons/InfoIcon";
import RedCross from "~/components/icons/RedCross";
import SleepIcon from "~/components/icons/SleepIcon";
import TruckIcon from "~/components/icons/TruckIcon";
import Restaurant from "~/components/layouts/Restaurant";
import ManageRestaurantHeader from "~/components/ui/ManageRestaurantHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { type RouterOutputs, api } from "~/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: session }),
    transformer: SuperJSON,
  });

  if (!session || session.user.role !== "RESTAURANT") {
    return {
      notFound: true,
    };
  }

  await helpers.order.getPlacedAndPreparingOrders.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const InProgress: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Restaurant>
      <>
        <ManageRestaurantHeader title="Order Requests" />
        <ManageRestaurantRequestsBody />
      </>
    </Restaurant>
  );
};

const ManageRestaurantRequestsBody: React.FC = () => {
  const { data: ordersData } = api.order.getPlacedAndPreparingOrders.useQuery(
    undefined,
    {
      refetchInterval: 5000,
    }
  );
  if (!ordersData) return null;
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ordersData.length === 0 ? (
            <div className="grow">
              <div className="mx-auto mt-12 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 md:w-96 md:p-12">
                <SleepIcon />
                <p className="text-center text-xl font-bold">
                  Waiting for orders...
                </p>
              </div>
            </div>
          ) : (
            <>
              {ordersData.map((order) => (
                <RestaurantPendingOrder order={order} key={order.id} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const RestaurantPendingOrder: React.FC<{
  order: RouterOutputs["order"]["getPlacedAndPreparingOrders"][number];
}> = ({ order }) => {
  const utils = api.useContext();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const total = order.orderFood.reduce(
    (acc, orderFood) => acc + orderFood.quantity * orderFood.price,
    0
  );

  const prepareOrderMutation = api.order.prepareOrder.useMutation({
    onSuccess: async () => {
      await utils.order.getPlacedAndPreparingOrders.cancel();
    },
    onSettled: async () => {
      await utils.order.getPlacedAndPreparingOrders.invalidate();
    },
  });

  const handlePrepare = async () => {
    await toast.promise(
      prepareOrderMutation.mutateAsync({ orderId: order.id }),
      {
        loading: "Accepting order...",
        success: "Order accepted!",
        error: prepareOrderMutation.error?.message || "Failed to accept order",
      }
    );
  };

  const rejectOrderMutation = api.order.restaurantRejectOrder.useMutation({
    onSuccess: async () => {
      await utils.order.getPlacedAndPreparingOrders.cancel();
    },
    onSettled: async () => {
      await utils.order.getPlacedAndPreparingOrders.invalidate();
    },
  });

  const readyOrderMutation = api.order.restaurantReadyOrder.useMutation({
    onSuccess: async () => {
      await utils.order.getPlacedAndPreparingOrders.cancel();
    },
    onSettled: async () => {
      await utils.order.getPlacedAndPreparingOrders.invalidate();
    },
  });

  const handleReady = async () => {
    await toast.promise(readyOrderMutation.mutateAsync({ orderId: order.id }), {
      loading: "Finishing order...",
      success: "Order finished! Ready for pickup",
      error: readyOrderMutation.error?.message || "Failed to finish order",
    });
  };

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              Order VP-{order.id}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {total.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </p>
          </div>
          <div className="flex">
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsInfoOpen(true)}
            >
              <InfoIcon className="h-8 w-8 fill-virparyasMainBlue md:h-10 md:w-10" />
            </button>
            <div className="w-2" />
            {order.status === "PLACED" &&
              (prepareOrderMutation.isLoading ? (
                <Loading className="h-8 w-8 animate-spin fill-virparyasMainBlue text-gray-200 md:h-10 md:w-10" />
              ) : (
                <>
                  <button
                    type="button"
                    className="relative z-10"
                    onClick={() => void handlePrepare()}
                  >
                    <GreenCheckmark className="h-8 w-8 fill-virparyasGreen md:h-10 md:w-10" />
                  </button>
                  <div className="w-2" />
                  <button
                    type="button"
                    className="relative z-10"
                    onClick={() => setIsRejectOpen(true)}
                  >
                    <RedCross className="h-8 w-8 fill-virparyasRed md:h-10 md:w-10" />
                  </button>
                </>
              ))}
            {order.status === "PREPARING" &&
              (readyOrderMutation.isLoading ? (
                <Loading className="h-8 w-8 animate-spin fill-virparyasMainBlue text-gray-200 md:h-10 md:w-10" />
              ) : (
                <button
                  type="button"
                  className="relative z-10"
                  onClick={() => void handleReady()}
                >
                  <TruckIcon className="h-8 w-8 fill-virparyasLightBlue md:h-10 md:w-10" />
                </button>
              ))}
          </div>
        </div>
      </div>
      <Transition appear show={isInfoOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsInfoOpen(false)}
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
                    Order VP-{order.id}
                  </Dialog.Title>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p>{order.user.name}</p>
                      <p>{order.user.address}</p>
                      <p>{order.user.phoneNumber}</p>
                    </div>
                    <div className="h-0.5 bg-virparyasSeparator" />
                    <ul className="ml-4 flex list-decimal flex-col gap-2">
                      {order.orderFood.map((food) => (
                        <li
                          className="marker:text-sm marker:font-bold"
                          key={food.id}
                        >
                          <div className="flex justify-between font-bold">
                            <p>
                              {food.foodName} ×{food.quantity}
                            </p>
                            <p>
                              $
                              {(food.price * food.quantity).toLocaleString(
                                "en-US",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </p>
                          </div>

                          <p className="my-1 text-sm font-light">
                            {food.foodOption}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="h-0.5 bg-virparyasSeparator" />
                    <div className="flex justify-between">
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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isRejectOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsRejectOpen(false)}
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
                    Order VP-{order.id}
                  </Dialog.Title>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p>{order.user.name}</p>
                      <p>{order.user.address}</p>
                      <p>{order.user.phoneNumber}</p>
                    </div>
                    <div className="h-0.5 bg-virparyasSeparator" />
                    <Formik
                      initialValues={{
                        reason: "",
                      }}
                      onSubmit={async (values) => {
                        await toast.promise(
                          rejectOrderMutation.mutateAsync({
                            orderId: order.id,
                            reason: values.reason,
                          }),
                          {
                            loading: "Rejecting order...",
                            success: "Order rejected",
                            error:
                              rejectOrderMutation.error?.message ||
                              "Failed to reject order",
                          }
                        );
                      }}
                      validate={(values) => {
                        const errors: {
                          reason?: string;
                        } = {};
                        if (
                          !z.string().nonempty().safeParse(values.reason)
                            .success
                        ) {
                          errors.reason = "Reason is required";
                        }
                        return errors;
                      }}
                    >
                      <Form className="grid grid-cols-1 gap-4">
                        <TextArea
                          label="* Reason for rejecting order:"
                          name="reason"
                          placeholder="Reason for rejecting order..."
                        />
                        <p className="text-center font-semibold text-virparyasRed">
                          Cancelling order will affect your rating
                          <br />
                          Proceed with caution
                        </p>
                        <div className="mt-4 flex justify-center gap-4">
                          {rejectOrderMutation.isLoading ? (
                            <div className="flex justify-center">
                              <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                            </div>
                          ) : (
                            <button
                              type="submit"
                              className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                            >
                              Reject
                            </button>
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

export default InProgress;
