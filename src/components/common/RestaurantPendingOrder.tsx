import GreenCheckmark from "../icons/GreenCheckmark";
import InfoIcon from "../icons/InfoIcon";
import RedCross from "../icons/RedCross";
import TruckIcon from "../icons/TruckIcon";
import Loading from "./Loading";
import { Transition, Dialog } from "@headlessui/react";
import { type Order, type OrderFood, type User } from "@prisma/client";
import React, { Fragment, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";

interface RestaurantPendingOrderProps {
  order: Order & {
    user: User;
    orderFood: OrderFood[];
  };
  orderList: (Order & {
    user: User;
    orderFood: OrderFood[];
  })[];
  setOrderList: React.Dispatch<
    React.SetStateAction<
      (Order & {
        user: User;
        orderFood: OrderFood[];
      })[]
    >
  >;
}

const RestaurantPendingOrder: React.FC<RestaurantPendingOrderProps> = ({
  order,
  orderList,
  setOrderList,
}) => {
  const utils = api.useContext();

  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const [reason, setReason] = useState("");
  const [isInvalidReason, setIsInvalidReason] = useState(false);

  const total = order.orderFood.reduce(
    (acc, orderFood) => acc + orderFood.quantity * orderFood.price,
    0
  );

  const prepareOrderMutation = api.order.prepareOrder.useMutation({
    onSuccess: () => {
      setOrderList([
        ...orderList.map((o) => {
          if (o.id === order.id) {
            return { ...o, status: "PREPARING" as const };
          }
          return o;
        }),
      ]);
    },
    onSettled: () => {
      void utils.order.getPlacedAndPreparingOrders.invalidate();
    },
  });

  const handlePrepare = () => {
    prepareOrderMutation.mutate({ orderId: order.id });
  };

  const rejectOrderMutation = api.order.restaurantRejectOrder.useMutation({
    onSuccess: () => {
      setOrderList(orderList.filter((o) => o.id !== order.id));
    },
    onSettled: () => {
      void utils.order.getPlacedAndPreparingOrders.invalidate();
    },
  });

  const handleReject = async () => {
    if (!z.string().nonempty().safeParse(reason).success) {
      setIsInvalidReason(true);
      return;
    }
    await rejectOrderMutation.mutateAsync({ orderId: order.id, reason });
    setIsRejectOpen(false);
  };

  const readyOrderMutation = api.order.restaurantReadyOrder.useMutation({
    onSuccess: () => {
      setOrderList(orderList.filter((o) => o.id !== order.id));
    },
  });

  const handleReady = () => {
    readyOrderMutation.mutate({ orderId: order.id });
  };

  const totalPrice = order.orderFood.reduce(
    (acc, orderFood) => acc + orderFood.quantity * orderFood.price,
    0
  );

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
              <InfoIcon className="fill-virparyasMainBlue h-8 w-8 md:h-10 md:w-10" />
            </button>
            <div className="w-2" />
            {order.status === "PLACED" &&
              (prepareOrderMutation.isLoading ? (
                <Loading className="fill-virparyasMainBlue h-8 w-8 animate-spin text-gray-200 md:h-10 md:w-10" />
              ) : (
                <>
                  <button
                    type="button"
                    className="relative z-10"
                    onClick={handlePrepare}
                  >
                    <GreenCheckmark className="fill-virparyasGreen h-8 w-8 md:h-10 md:w-10" />
                  </button>
                  <div className="w-2" />
                  <button
                    type="button"
                    className="relative z-10"
                    onClick={() => setIsRejectOpen(true)}
                  >
                    <RedCross className="fill-virparyasRed h-8 w-8 md:h-10 md:w-10" />
                  </button>
                </>
              ))}
            {order.status === "PREPARING" &&
              (readyOrderMutation.isLoading ? (
                <Loading className="fill-virparyasMainBlue h-8 w-8 animate-spin text-gray-200 md:h-10 md:w-10" />
              ) : (
                <button
                  type="button"
                  className="relative z-10"
                  onClick={handleReady}
                >
                  <TruckIcon className="fill-virparyasLightBlue h-8 w-8 md:h-10 md:w-10" />
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
                <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 transform overflow-hidden rounded-2xl p-6 transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Order VP-{order.id}
                  </Dialog.Title>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p>{order.user.name}</p>
                      <p>{order.user.address}</p>
                      <p>{order.user.phoneNumber}</p>
                    </div>
                    <div className="bg-virparyasSeparator h-0.5" />
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
                    <div className="bg-virparyasSeparator h-0.5" />
                    <div className="flex justify-between">
                      <p>Total:</p>
                      <p>
                        $
                        {totalPrice.toLocaleString("en-US", {
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
                <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 transform overflow-hidden rounded-2xl p-6 transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Order VP-{order.id}
                  </Dialog.Title>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p>{order.user.name}</p>
                      <p>{order.user.address}</p>
                      <p>{order.user.phoneNumber}</p>
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
                          isInvalidReason ? "ring-virparyasRed ring-2" : ""
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
    // <>
    //   <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
    //     <div className="flex w-full items-center justify-between">
    //       <div className="text-virparyasMainBlue">
    //         <p className="text-xl font-medium md:mt-2 md:text-3xl">
    //           Order VP-{order.id}
    //         </p>
    //         <p className="text-xs font-light md:mb-2 md:text-base">{total}</p>
    //       </div>
    //       <div className="flex gap-2">
    //         <button type="button" onClick={() => setIsOpen(true)}>
    //           <InfoIcon className="md:h-10 md:w-10" />
    //         </button>
    //         {order.status === "PLACED" && (
    //           <>
    //             <button type="button" onClick={handlePrepare}>
    //               <GreenCheckmark className="md:h-10 md:w-10" />
    //             </button>
    //             <button type="button" onClick={handleReject}>
    //               <RedCross className="md:h-10 md:w-10" />
    //             </button>
    //           </>
    //         )}
    //         {order.status === "PREPARING" && (
    //           <button type="button" onClick={handleReady}>
    //             <TruckIcon className="md:h-10 md:w-10" />
    //           </button>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    //   <Transition appear show={isOpen} as={Fragment}>
    //     <Dialog
    //       as="div"
    //       className="relative z-10"
    //       onClose={() => setIsOpen(false)}
    //     >
    //       <Transition.Child
    //         as={Fragment}
    //         enter="ease-out duration-300"
    //         enterFrom="opacity-0"
    //         enterTo="opacity-100"
    //         leave="ease-in duration-200"
    //         leaveFrom="opacity-100"
    //         leaveTo="opacity-0"
    //       >
    //         <div className="fixed inset-0 bg-black bg-opacity-25" />
    //       </Transition.Child>

    //       <div className="fixed inset-0 overflow-y-auto">
    //         <div className="flex min-h-full items-center justify-center p-4">
    //           <Transition.Child
    //             as={Fragment}
    //             enter="ease-out duration-300"
    //             enterFrom="opacity-0 scale-95"
    //             enterTo="opacity-100 scale-100"
    //             leave="ease-in duration-200"
    //             leaveFrom="opacity-100 scale-100"
    //             leaveTo="opacity-0 scale-95"
    //           >
    //             <Dialog.Panel className="w-3/4 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">

    //           </Transition.Child>
    //         </div>
    //       </div>
    //     </Dialog>
    //   </Transition>
    // </>
  );
};

export default RestaurantPendingOrder;
