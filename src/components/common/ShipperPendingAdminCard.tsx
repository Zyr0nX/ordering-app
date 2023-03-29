import BluePencil from "../icons/BluePencil";
import RedCross from "../icons/RedCross";
import Loading from "./Loading";
import { Transition, Dialog } from "@headlessui/react";
import {
  type User,
  type Restaurant,
  type Cuisine,
  type Shipper,
} from "@prisma/client";
import React, { Fragment, useState } from "react";
import { api } from "~/utils/api";

interface ShipperPendingAdminCardProps {
  shipper: Shipper & {
    user: User;
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

const ShipperPendingAdminCard: React.FC<ShipperPendingAdminCardProps> = ({
  shipper,
  pendingList,
  setPendingList,
}) => {
  const utils = api.useContext();
  const [isOpen, setIsOpen] = useState(false);

  const approveShipperMutation = api.admin.approveShipper.useMutation({
    onSuccess: () => {
      setPendingList(
        pendingList.filter(
          (item) => item.type !== "shipper" || item.data.id !== shipper.id
        )
      );
    },
    onSettled: () => {
      void utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const rejectShipperMutation = api.admin.rejectShipper.useMutation({
    onSuccess: () => {
      setPendingList(
        pendingList.filter(
          (item) => item.type !== "shipper" || item.data.id !== shipper.id
        )
      );
    },
    onSettled: () => {
      void utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const handleApprove = async () => {
    await approveShipperMutation.mutateAsync({
      shipperId: shipper.id,
    });
    setIsOpen(false);
  };

  const handleReject = async () => {
    await rejectShipperMutation.mutateAsync({
      shipperId: shipper.id,
    });
    setIsOpen(false);
  };
  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {shipper.firstName} {shipper.lastName}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">Shipper</p>
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
                <Dialog.Panel className="bg-virparyasBackground text-virparyasMainBlue w-11/12 transform overflow-hidden rounded-2xl p-6 transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Edit {shipper.firstName} {shipper.lastName}
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="grid grid-cols-1 gap-4">
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
                            className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                            placeholder="First name..."
                            value={shipper.firstName}
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
                            className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                            placeholder="Last name..."
                            value={shipper.lastName}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex grow flex-col">
                          <label
                            htmlFor="dateOfBirth"
                            className="whitespace-nowrap font-medium"
                          >
                            Date of birth:
                          </label>

                          <div className="grid grid-cols-3 gap-4">
                            <input
                              type="text"
                              id="date"
                              className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                              placeholder="First name..."
                              value={shipper.dateOfBirth.toLocaleString(
                                "en-US",
                                { day: "numeric" }
                              )}
                              disabled
                            />
                            <input
                              type="text"
                              id="firstName"
                              className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                              placeholder="First name..."
                              value={shipper.dateOfBirth.toLocaleString(
                                "en-US",
                                { month: "short" }
                              )}
                              disabled
                            />
                            <input
                              type="text"
                              id="firstName"
                              className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                              placeholder="First name..."
                              value={shipper.dateOfBirth.toLocaleString(
                                "en-US",
                                { year: "numeric" }
                              )}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="cuisine" className="font-medium">
                          * Identification number:
                        </label>
                        <input
                          type="text"
                          id="cuisine"
                          className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                          placeholder="Cuisine..."
                          value={shipper.identificationNumber}
                          disabled
                        />
                      </div>
                      <div className="flex flex-col">
                        <label htmlFor="phoneNumber" className="font-medium">
                          Phone number:
                        </label>

                        <input
                          type="text"
                          id="phoneNumber"
                          className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                          placeholder="Restaurant name..."
                          value={shipper.phoneNumber}
                          disabled
                        />
                      </div>

                      <div className="flex flex-col">
                        <label htmlFor="email" className="font-medium">
                          Email:
                        </label>

                        <input
                          type="email"
                          id="email"
                          className="focus-visible:ring-virparyasMainBlue h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2"
                          placeholder="Email..."
                          value={shipper.user.email || ""}
                          disabled
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {rejectShipperMutation.isLoading ? (
                          <div className="flex justify-center">
                            <Loading className="fill-virparyasMainBlue h-10 w-10 animate-spin text-gray-200" />
                          </div>
                        ) : (
                          <button
                            className="bg-virparyasRed h-10 w-full rounded-xl font-bold text-white"
                            onClick={() => void handleReject()}
                          >
                            Reject
                          </button>
                        )}
                        {approveShipperMutation.isLoading ? (
                          <div className="flex justify-center">
                            <Loading className="fill-virparyasMainBlue h-10 w-10 animate-spin text-gray-200" />
                          </div>
                        ) : (
                          <button
                            className="bg-virparyasLightBlue h-10 w-full rounded-xl font-bold text-white"
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

export default ShipperPendingAdminCard;
