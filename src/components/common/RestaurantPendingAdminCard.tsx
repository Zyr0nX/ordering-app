import BluePencil from "../icons/BluePencil";
import RedCross from "../icons/RedCross";
import Loading from "./Loading";
import { Transition, Dialog } from "@headlessui/react";
import { type User, type Restaurant, type Cuisine, type Shipper } from "@prisma/client";
import React, { Fragment, useState } from "react";
import { api } from "~/utils/api";

interface RestaurantPendingAdminCardProps {
  restaurant: Restaurant & {
    user: User;
    cuisine: Cuisine;
  };
  pendingList: (
    | {
        type: "restaurant";
        data: Restaurant & {
          user: User;
          cuisine: Cuisine;
        };
      }
    | {
        type: "shipper";
        data: Shipper & {
          user: User;
        };
      }
  )[];
  setPendingList: React.Dispatch<
    React.SetStateAction<
      (
        | {
            type: "restaurant";
            data: Restaurant & {
              user: User;
              cuisine: Cuisine;
            };
          }
        | {
            type: "shipper";
            data: Shipper & {
              user: User;
            };
          }
      )[]
    >
  >;
}

const RestaurantPendingAdminCard: React.FC<RestaurantPendingAdminCardProps> = ({
  restaurant,
  pendingList,
  setPendingList,
}) => {
  const utils = api.useContext();
  const [isOpen, setIsOpen] = useState(false);

  const approveRestaurantMutation = api.admin.approveRestaurant.useMutation({
    onSuccess: () => {
      setPendingList(
        pendingList.filter(
          (item) => item.type !== "restaurant" || item.data.id !== restaurant.id
        )
      );
    },
    onSettled: () => {
      void utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onSuccess: () => {
      setPendingList(
        pendingList.filter(
          (item) => item.type !== "restaurant" || item.data.id !== restaurant.id
        )
      );
    },
    onSettled: () => {
      void utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const handleApprove = async () => {
    await approveRestaurantMutation.mutateAsync({
      restaurantId: restaurant.id,
    });
    setIsOpen(false);
  };

  const handleReject = async () => {
    await rejectRestaurantMutation.mutateAsync({
      restaurantId: restaurant.id,
    });
    setIsOpen(false);
  };
  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {restaurant.name}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              Restaurant
            </p>
          </div>
          <div className="flex">
            <button
              type="button"
              className="relative z-10 mr-2"
              onClick={() => setIsOpen(true)}
            >
              <BluePencil className="md:h-10 md:w-10" />
            </button>
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsOpen(true)}
            >
              <RedCross className="md:h-10 md:w-10" />
            </button>
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
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit {restaurant.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex flex-col">
                        <label htmlFor="cuisine" className="font-medium">
                          * Cuisine:
                        </label>
                        <input
                          type="text"
                          id="cuisine"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Cuisine..."
                          value={restaurant.cuisine.name}
                          disabled
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="restaurantName" className="font-medium">
                          * Restaurant name:
                        </label>

                        <input
                          type="text"
                          id="restaurantName"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Restaurant name..."
                          value={restaurant.name}
                          disabled
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
                          value={restaurant.address}
                          disabled
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="additionalAddress"
                          className="font-medium"
                        >
                          * Additional address:
                        </label>

                        <input
                          type="text"
                          id="additionalAddress"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Additional address..."
                          value={restaurant.additionalAddress || ""}
                          disabled
                        />
                      </div>

                      <div className="flex gap-4">
                        <div className="flex grow flex-col">
                          <label
                            htmlFor="firstName"
                            className="whitespace-nowrap font-medium"
                          >
                            First name:
                          </label>

                          <input
                            type="text"
                            id="firstName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="First name..."
                            value={restaurant.firstName}
                            disabled
                          />
                        </div>
                        <div className="flex grow flex-col">
                          <label
                            htmlFor="lastName"
                            className="whitespace-nowrap font-medium"
                          >
                            Last name:
                          </label>

                          <input
                            type="text"
                            id="lastName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Last name..."
                            value={restaurant.lastName}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="phoneNumber"
                          className="whitespace-nowrap font-medium"
                        >
                          Phone number:
                        </label>

                        <input
                          type="text"
                          id="phoneNumber"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Phone number..."
                          value={restaurant.phoneNumber}
                          disabled
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="additionalAddress"
                          className="whitespace-nowrap font-medium"
                        >
                          Email:
                        </label>

                        <input
                          type="text"
                          id="additionalAddress"
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Additional address..."
                          value={restaurant.user.email || ""}
                          disabled
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {rejectRestaurantMutation.isLoading ? (
                          <div className="flex justify-center">
                            <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                          </div>
                        ) : (
                          <button
                            className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                            onClick={() => void handleReject()}
                          >
                            Reject
                          </button>
                        )}
                        {approveRestaurantMutation.isLoading ? (
                          <div className="flex justify-center">
                            <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                          </div>
                        ) : (
                          <button
                            className="h-10 w-full rounded-xl bg-virparyasLightBlue font-bold text-white"
                            onClick={() => void handleApprove()}
                          >
                            Approve
                          </button>
                        )}
                      </div>
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

export default RestaurantPendingAdminCard;
