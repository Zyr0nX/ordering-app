import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import { Dialog, Transition } from "@headlessui/react";
import { type Restaurant } from "@prisma/client";
import React, { Fragment, useState } from "react";
import { api } from "~/utils/api";

const AdminRestaurantsBody = () => {
  const [pendingList, setPendingList] = useState<
    (Restaurant & {
      user: {
        email: string | null;
      };
      restaurantType: {
        name: string;
      } | null;
    })[]
  >([]);

  const [isOpen, setIsOpen] = useState(true);

  const [selectedRestaurant, setSelectedRestaurant] = useState<
    Restaurant & {
      user: {
        email: string | null;
      };
      restaurantType: {
        name: string;
      } | null;
    }
  >();

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const pendingRestaurantRequestsQuery =
    api.admin.getPendingRestaurantRequests.useQuery(undefined, {
      onSuccess: (data) => {
        setPendingList(data);
      },
      refetchInterval: 5000,
    });

  const approveRestaurantMutation = api.admin.approveRestaurant.useMutation({
    onSuccess: () => pendingRestaurantRequestsQuery.refetch(),
  });
  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onSuccess: () => pendingRestaurantRequestsQuery.refetch(),
  });

  const handleApprove = (id: string) => {
    approveRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleReject = (id: string) => {
    rejectRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleSelect = (
    restaurant: Restaurant & {
      user: {
        email: string | null;
      };
      restaurantType: {
        name: string;
      } | null;
    }
  ) => {
    setSelectedRestaurant(restaurant);
    openModal();
  };
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pendingList.map((restaurant) => (
            <div
              key={restaurant.id}
              className="flex flex-auto cursor-pointer rounded-2xl bg-white p-4 pt-3 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)]"
              onClick={() => handleSelect(restaurant)}
            >
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
                    className="mr-2"
                    onClick={() => handleApprove(restaurant.id)}
                  >
                    <GreenCheckmark className="md:h-10 md:w-10" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(restaurant.id)}
                  >
                    <RedCross className="md:h-10 md:w-10" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Transition appear show={isOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                      View Mode
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label htmlFor="firstName" className="font-medium">
                            First name:
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.firstName}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="lastName" className="font-medium">
                            Last name:
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.lastName}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="phone" className="font-medium">
                            Phone number:
                          </label>
                          <input
                            type="text"
                            id="phone"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.phoneNumber}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="email" className="font-medium">
                            Email:
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.user?.email || ""}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="restaurantName"
                            className="font-medium"
                          >
                            Restaurant Name:
                          </label>
                          <input
                            type="text"
                            id="restaurantName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.name}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="address" className="font-medium">
                            Address:
                          </label>
                          <input
                            type="text"
                            id="address"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.address}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="additionalAddress"
                            className="font-medium"
                          >
                            Additional Address:
                          </label>
                          <input
                            type="text"
                            id="additionalAddress"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.additionalAddress || ""}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label htmlFor="category" className="font-medium">
                            Category:
                          </label>
                          <input
                            type="text"
                            id="category"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            value={selectedRestaurant?.restaurantType?.name}
                          />
                        </div>
                      </p>
                    </div>

                    <div className="px-auto mt-4 flex justify-center gap-4">
                      <button
                        type="button"
                        className="w-36 rounded-xl bg-virparyasRed py-2 px-10 font-medium text-white"
                        onClick={() =>
                          handleReject(selectedRestaurant?.id || "")
                        }
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="w-36 rounded-xl bg-virparyasGreen py-2 font-medium text-white"
                        onClick={() =>
                          handleApprove(selectedRestaurant?.id || "")
                        }
                      >
                        Approve
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default AdminRestaurantsBody;
