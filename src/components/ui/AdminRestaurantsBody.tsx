import CloudIcon from "../icons/CloudIcon";
import GreenCheckmark from "../icons/GreenCheckmark";
import RedCross from "../icons/RedCross";
import { Dialog, Transition } from "@headlessui/react";
import { type Restaurant } from "@prisma/client";
import Image from "next/image";
import React, { Fragment, useState } from "react";
import { api } from "~/utils/api";
import getBase64 from "~/utils/getBase64";

const AdminRequestsBody = () => {
  const [approvedList, setApprovedList] = useState<
    (Restaurant & {
      user: {
        email: string | null;
      };
      restaurantType: {
        name: string;
      } | null;
    })[]
  >([]);

  const [isOpen, setIsOpen] = useState(false);

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

  const [image, setImage] = useState<string | null>(null);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const approvedRestaurantRequestsQuery =
    api.admin.getApprovedRestaurants.useQuery(undefined, {
      onSuccess: (data) => {
        setApprovedList(data);
      },
      refetchInterval: 5000,
    });

  const approveRestaurantMutation = api.admin.approveRestaurant.useMutation({
    onSuccess: () => approvedRestaurantRequestsQuery.refetch(),
  });

  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onSuccess: () => approvedRestaurantRequestsQuery.refetch(),
  });

  const uploadImageMutation = api.external.uploadCloudinary.useMutation({
    onSuccess: (data) => {
      setImage(data);
    },
  });

  const handleApprove = (id: string) => {
    approveRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleReject = (id: string) => {
    rejectRestaurantMutation.mutate({ restaurantId: id });
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await getBase64(e.target.files[0]);
      uploadImageMutation.mutate(base64);
    }
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
    setImage(restaurant.brandImage);
    openModal();
  };
  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {approvedList.map((restaurant) => (
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
                  <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all md:w-3/4">
                    <Dialog.Title as="h3" className="text-3xl font-bold">
                      Edit Mode
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col">
                          <label
                            htmlFor="category"
                            className="truncate font-medium"
                          >
                            Category:
                          </label>
                          <input
                            type="text"
                            id="category"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={
                              selectedRestaurant?.restaurantType?.name
                            }
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="restaurantName"
                            className="truncate font-medium"
                          >
                            Restaurant Name:
                          </label>
                          <input
                            type="text"
                            id="restaurantName"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedRestaurant?.name}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="address"
                            className="truncate font-medium"
                          >
                            Address:
                          </label>
                          <input
                            type="text"
                            id="address"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedRestaurant?.address}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="additionalAddress"
                            className="truncate font-medium"
                          >
                            Additional Address:
                          </label>
                          <input
                            type="text"
                            id="additionalAddress"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={
                              selectedRestaurant?.additionalAddress || ""
                            }
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor="firstName"
                              className="truncate font-medium"
                            >
                              First name:
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                              placeholder="Email..."
                              defaultValue={selectedRestaurant?.firstName}
                            />
                          </div>
                          <div className="flex flex-col">
                            <label
                              htmlFor="lastName"
                              className="truncate font-medium"
                            >
                              Last name:
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                              placeholder="Email..."
                              defaultValue={selectedRestaurant?.lastName}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="phone"
                            className="truncate font-medium"
                          >
                            Phone number:
                          </label>
                          <input
                            type="text"
                            id="phone"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedRestaurant?.phoneNumber}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="email"
                            className="truncate font-medium"
                          >
                            Email:
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            placeholder="Email..."
                            defaultValue={selectedRestaurant?.user?.email || ""}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="brandImage"
                            className="truncate font-medium"
                          >
                            Brand image:
                          </label>
                          <div className="relative h-[125px] w-[300px] overflow-hidden rounded-xl">
                            <div className="absolute top-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60">
                              <CloudIcon />
                              <p className="font-medium text-white">
                                Upload a new brand image
                              </p>
                            </div>
                            {image && (
                              <Image
                                src={image}
                                alt="Brand Image"
                                width={300}
                                height={125}
                                className="h-auto w-auto"
                              ></Image>
                            )}

                            <input
                              type="file"
                              id="brandImage"
                              className="absolute top-0 h-full w-full cursor-pointer opacity-0"
                              accept="image/*"
                              onChange={(e) => void handleImage(e)}
                            />
                          </div>
                        </div>
                      </div>
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

export default AdminRequestsBody;
