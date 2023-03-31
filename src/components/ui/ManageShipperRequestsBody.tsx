import Loading from "../common/Loading";
import { Dialog, Transition } from "@headlessui/react";
import {
  type Restaurant,
  type Order,
  type OrderFood,
  type User,
} from "@prisma/client";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";

interface ManageShipperRequestsBodyProps {
  order:
    | (Order & {
        user: User;
        restaurant: Restaurant;
        orderFood: OrderFood[];
      })
    | null;
}

const ManageShipperRequestsBody: React.FC<ManageShipperRequestsBodyProps> = ({
  order,
}) => {
  const utils = api.useContext();

  const [reason, setReason] = useState("");
  const [isInvalidReason, setIsInvalidReason] = useState(false);

  const [disabled, setDisabled] = useState(false);

  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const [inProgressOrder, setInProgressOrder] = useState<
    | (Order & {
        user: User;
        restaurant: Restaurant;
        orderFood: OrderFood[];
      })
    | null
  >(order);

  api.order.getShipperInProgressOrders.useQuery(undefined, {
    initialData: order,
    onSuccess: (data) => {
      setInProgressOrder(data);
      if (data?.status !== "DELIVERING") {
        setDisabled(true);
      }
    },
  });

  const completeOrderMutation = api.order.shipperCompleteOrder.useMutation();
  const handleComplete = () => {
    completeOrderMutation.mutate();
  };

  const rejectOrderMutation = api.order.shipperRejectOrder.useMutation({
    onSuccess: () => {
      setInProgressOrder(null);
    },
    onSettled: () => {
      void utils.order.getShipperInProgressOrders.invalidate();
    },
  });

  const findShipperMutation = api.order.findShipper.useMutation();

  const handleReject = async () => {
    if (!z.string().nonempty().safeParse(reason).success) {
      setIsInvalidReason(true);
      return;
    }
    if (inProgressOrder && reason) {
      await rejectOrderMutation.mutateAsync({
        orderId: inProgressOrder.id,
        reason,
      });
      findShipperMutation.mutate({
        orderId: inProgressOrder.id,
      });
    }
    setIsRejectOpen(false);
  };

  return (
    <>
      <div className="text-virparyasMainBlue m-4">
        <div className="mt-4">
          {inProgressOrder ? (
            <>
              <div className="flex flex-col rounded-2xl bg-white p-4">
                <p>Order: VP-{inProgressOrder.id}</p>
                <div className="bg-virparyasSeparator h-0.5"></div>
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
                <div className="bg-virparyasSeparator h-0.5"></div>
                <p>Customer Info</p>
                <p>Name: {inProgressOrder.user.name}</p>
                <p>Address: {inProgressOrder.user.address}</p>
                <p>
                  Additional address: {inProgressOrder.user.additionalAddress}
                </p>
                <p>Phone number: {inProgressOrder.user.phoneNumber}</p>
                <button onClick={handleComplete} disabled={disabled}>
                  complete
                </button>
                <button onClick={() => void setIsRejectOpen(true)}>Reject</button>
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
                        <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 transform overflow-hidden rounded-2xl p-6 transition-all">
                          <Dialog.Title as="h3" className="text-3xl font-bold">
                            Order VP-{inProgressOrder.id}
                          </Dialog.Title>
                          <div className="flex flex-col gap-2">
                            <div>
                              <p>{inProgressOrder.user.name}</p>
                              <p>{inProgressOrder.user.address}</p>
                              <p>{inProgressOrder.user.phoneNumber}</p>
                            </div>
                            <div className="bg-virparyasSeparator h-0.5" />
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between">
                                <label
                                  htmlFor="phoneNumber"
                                  className="whitespace-nowrap font-medium"
                                >
                                  * Reason for cancelling:
                                </label>
                                {isInvalidReason && (
                                  <p className="text-virparyasRed text-xs">
                                    Reason is required
                                  </p>
                                )}
                              </div>

                              <textarea
                                id="phoneNumber"
                                className={`focus-visible:ring-virparyasMainBlue h-40 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 ${
                                  isInvalidReason
                                    ? "ring-virparyasRed ring-2"
                                    : ""
                                }`}
                                placeholder="Reason for cancelling..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                            </div>
                            <p className="text-virparyasRed text-center font-semibold">
                              Cancelling order will affect your rating
                              <br />
                              Proceed with caution
                            </p>
                            <div className="flex justify-center">
                              {rejectOrderMutation.isLoading ? (
                                <div className="flex justify-center">
                                  <Loading className="fill-virparyasMainBlue h-10 w-10 animate-spin text-gray-200" />
                                </div>
                              ) : (
                                <button
                                  className="bg-virparyasRed h-10 w-full rounded-xl font-bold text-white"
                                  onClick={() => void handleReject()}
                                >
                                  Cancel order
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
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageShipperRequestsBody;
