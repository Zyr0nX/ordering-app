import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from "next";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Loading from "~/components/common/Loading";
import TextArea from "~/components/common/TextArea";
import Shipper from "~/components/layouts/Shipper";
import ManageShipperHeader from "~/components/ui/ManageShipperHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
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

  if (!session || session.user.role !== "SHIPPER") {
    return {
      notFound: true,
    };
  }

  await helpers.order.getShipperInProgressOrders.prefetch();

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
    <Shipper>
      <>
        <ManageShipperHeader title="Order Requests" />
        <ManageShipperRequestsBody />
      </>
    </Shipper>
  );
};

const ManageShipperRequestsBody: React.FC = () => {
  const { data: inProgressOrder } =
    api.order.getShipperInProgressOrders.useQuery(undefined, {
      refetchInterval: 5000
    });
  const utils = api.useContext();
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const completeOrderMutation = api.order.shipperCompleteOrder.useMutation();
  const handleComplete = () => {
    completeOrderMutation.mutate();
  };

  const rejectOrderMutation = api.order.shipperRejectOrder.useMutation();

  return (
    <>
      <div className="m-4 text-virparyasMainBlue">
        <div className="mt-4">
          {inProgressOrder ? (
            <>
              <div className="flex flex-col rounded-2xl bg-white p-4">
                <p>Order: VP-{inProgressOrder.id}</p>
                <div className="h-0.5 bg-virparyasSeparator"></div>
                <p>Restaurant Info</p>
                <p>Name: {inProgressOrder.restaurant.name}</p>
                <p>Address: {inProgressOrder.restaurant.address}</p>
                {inProgressOrder.restaurant.additionalAddress && (
                  <p>
                    Additional address:{" "}
                    {inProgressOrder.restaurant.additionalAddress}
                  </p>
                )}
                <p>Phone number: {inProgressOrder.restaurant.phoneNumber}</p>
                <div className="h-0.5 bg-virparyasSeparator"></div>
                <p>Customer Info</p>
                <p>Name: {inProgressOrder.user.name}</p>
                <p>Address: {inProgressOrder.user.address}</p>
                <p>
                  Additional address: {inProgressOrder.user.additionalAddress}
                </p>
                <p>Phone number: {inProgressOrder.user.phoneNumber}</p>
                <button
                  onClick={handleComplete}
                  disabled={inProgressOrder.status !== "DELIVERING"}
                >
                  Complete
                </button>
                <button onClick={() => void setIsRejectOpen(true)}>
                  Reject
                </button>
              </div>
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
                            Order VP-{inProgressOrder.id}
                          </Dialog.Title>
                          <div className="flex flex-col gap-2">
                            <div>
                              <p>{inProgressOrder.user.name}</p>
                              <p>{inProgressOrder.user.address}</p>
                              <p>{inProgressOrder.user.phoneNumber}</p>
                            </div>
                            <div className="h-0.5 bg-virparyasSeparator" />
                            <Formik
                              initialValues={{
                                reason: "",
                              }}
                              onSubmit={async (values) => {
                                await toast.promise(
                                  rejectOrderMutation.mutateAsync({
                                    orderId: inProgressOrder.id,
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
                                  !z
                                    .string()
                                    .nonempty()
                                    .safeParse(values.reason).success
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
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default InProgress;