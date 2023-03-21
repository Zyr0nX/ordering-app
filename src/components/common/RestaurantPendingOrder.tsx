import GreenCheckmark from "../icons/GreenCheckmark";
import InfoIcon from "../icons/InfoIcon";
import RedCross from "../icons/RedCross";
import TruckIcon from "../icons/TruckIcon";
import { Transition, Dialog } from "@headlessui/react";
import { type Order, type OrderFood, type User } from "@prisma/client";
import React, { Fragment } from "react";
import { api } from "~/utils/api";

const RestaurantPendingOrder = ({
  order,
}: {
  order: Order & {
    user: User;
    orderFood: OrderFood[];
  };
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const total = order.orderFood.reduce(
    (acc, orderFood) => acc + orderFood.quantity * orderFood.price,
    0
  );

  const prepareOrderMutation = api.order.prepareOrder.useMutation();

  const handlePrepare = () => {
    prepareOrderMutation.mutate({ orderId: order.id });
  };

  const rejectOrderMutation = api.order.restaurantRejectOrder.useMutation();

  const handleReject = () => {
    rejectOrderMutation.mutate({ orderId: order.id });
  };

  const readyOrderMutation = api.order.restaurantReadyOrder.useMutation();

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
            <p className="text-xs font-light md:mb-2 md:text-base">{total}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(true)}>
              <InfoIcon className="md:h-10 md:w-10" />
            </button>
            {order.status === "PLACED" && (
              <>
                <button type="button" onClick={handlePrepare}>
                  <GreenCheckmark className="md:h-10 md:w-10" />
                </button>
                <button type="button" onClick={handleReject}>
                  <RedCross className="md:h-10 md:w-10" />
                </button>
              </>
            )}
            {order.status === "PREPARING" && (
              <button type="button" onClick={handleReady}>
                <TruckIcon className="md:h-10 md:w-10" />
              </button>
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
                <Dialog.Panel className="w-3/4 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
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
                    <ul className="flex list-decimal flex-col gap-2">
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
                              {food.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
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
    </>
  );
};

export default RestaurantPendingOrder;
