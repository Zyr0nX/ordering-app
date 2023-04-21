import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import fuzzysort from "fuzzysort";
import {
  type GetServerSidePropsContext,
  type NextPage,
  type InferGetServerSidePropsType,
} from "next";
import React, { Fragment, useRef, useState } from "react";
import SuperJSON from "superjson";
import { create } from "zustand";
import Input from "~/components/common/CommonInput";
import CuisineListbox from "~/components/common/CuisineListbox";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import BluePencil from "~/components/icons/BluePencil";
import RedCross from "~/components/icons/RedCross";
import SearchIcon from "~/components/icons/SearchIcon";
import SleepIcon from "~/components/icons/SleepIcon";
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from "~/components/ui/AdminCommonHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { RouterOutputs, api } from "~/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: session }),
    transformer: SuperJSON,
  });

  if (!session || session.user.role !== "ADMIN") {
    return {
      notFound: true,
    };
  }

  await Promise.all([
    helpers.admin.getApprovedRestaurants.prefetch(),
    helpers.cuisine.getAll.prefetch(),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

interface AdminRestaurantState {
  restaurantList: RouterOutputs["admin"]["getApprovedRestaurants"];
}

const useAdminRestaurantStore = create<AdminRestaurantState>((set) => ({
  restaurantList: [],
}));

const Restaurants: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Restaurants" />
        <AdminRestaurantsBody />
      </>
    </Admin>
  );
};

const AdminRestaurantsBody: React.FC = () => {
  const restaurantList = useAdminRestaurantStore(
    (state) => state.restaurantList
  );
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: restaurantsData } = api.admin.getApprovedRestaurants.useQuery(
    undefined,
    {
      refetchInterval: 5000,
      enabled: !searchRef.current?.value,
      onSuccess: (data) => {
        if (!searchRef.current?.value)
          useAdminRestaurantStore.setState({
            restaurantList: data,
          });
      },
    }
  );

  if (!restaurantsData) return null;

  const handleSearch = (query: string) => {
    if (query === "") {
      useAdminRestaurantStore.setState({
        restaurantList: restaurantsData,
      });
      return;
    }
    useAdminRestaurantStore.setState({
      restaurantList: fuzzysort
        .go(query, restaurantsData, {
          keys: ["name"],
          all: true,
        })
        .map((restaurant) => restaurant.obj),
    });
  };

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl bg-white">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search..."
          ref={searchRef}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex items-center bg-virparyasMainBlue px-4">
          <SearchIcon className="h-8 w-8 fill-white" />
        </div>
      </div>
      <div className="mt-4">
        {restaurantList.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No restaurants found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {restaurantList.map((restaurant) => (
              <RestaurantAdminCard
                restaurant={restaurant}
                key={restaurant.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RestaurantAdminCard: React.FC<{
  restaurant: RouterOutputs["admin"]["getApprovedRestaurants"][number];
}> = ({ restaurant }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {restaurant.name}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {restaurant.address}
            </p>
          </div>
          <div className="flex">
            <button
              type="button"
              className="relative z-10 mr-2"
              onClick={() => setIsEditOpen(true)}
            >
              <BluePencil className="md:h-10 md:w-10" />
            </button>
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsRejectOpen(true)}
            >
              <RedCross className="md:h-10 md:w-10" />
            </button>
          </div>
        </div>
      </div>
      <Transition appear show={isEditOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsEditOpen(false)}
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
                    <Formik>
                      <Form className="grid grid-cols-1 gap-4">
                        <CuisineListbox
                          label="* Cuisine:"
                          name="cuisine"
                          placeholder="Select a cuisine..."
                        />
                        <Input
                          type="text"
                          label="* Restaurant name:"
                          name="restaurantName"
                          placeholder="Restaurant name..."
                        />

                        <PlaceAutoCompleteCombobox
                          label="* Address"
                          name="address"
                          placeholder="Address..."
                          enableCurrentAddress={false}
                        />

                        <Input
                          type="text"
                          label="Additional address"
                          name="additionalAddress"
                          placeholder="Additional address..."
                        />

                        <div className="flex gap-4">
            <div className="grow">
              <Input
                type="text"
                label="* First name:"
                name="firstName"
                placeholder="First name..."
              />
            </div>
            <div className="grow">
              <Input
                type="text"
                label="* Last name:"
                name="lastName"
                placeholder="Last name..."
              />
            </div>
          </div>
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="phoneNumber"
                              className="whitespace-nowrap font-medium"
                            >
                              * Phone number:
                            </label>
                            {isInvalidPhoneNumber && (
                              <p className="text-xs text-virparyasRed">
                                Address is required
                              </p>
                            )}
                          </div>

                          <input
                            type="text"
                            id="phoneNumber"
                            className={`h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                              isInvalidPhoneNumber
                                ? "ring-2 ring-virparyasRed"
                                : ""
                            }`}
                            placeholder="Address..."
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col">
                          <label
                            htmlFor="email"
                            className="whitespace-nowrap font-medium"
                          >
                            Email:
                          </label>

                          <input
                            type="email"
                            id="email"
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                            disabled
                            value={restaurant.user.email || ""}
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="brandImage"
                              className="truncate font-medium"
                            >
                              * Image:
                            </label>
                            {isInvalidImage && (
                              <p className="text-xs text-virparyasRed">
                                Image is required
                              </p>
                            )}
                          </div>

                          <div
                            className={`relative h-[125px] w-full overflow-hidden rounded-xl ${
                              isInvalidImage ? "ring-2 ring-virparyasRed" : ""
                            }`}
                          >
                            <div className="absolute top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 bg-black/60">
                              <CloudIcon />
                              <p className="font-medium text-white">
                                Upload a new image
                              </p>
                            </div>
                            <input
                              type="file"
                              id="brandImage"
                              className="absolute top-0 z-10 h-full w-full cursor-pointer opacity-0"
                              accept="image/*"
                              onChange={(e) => void handleSelectImage(e)}
                            />
                            {base64Image ? (
                              <Image
                                src={base64Image}
                                alt="Image"
                                fill
                                className="object-cover"
                              ></Image>
                            ) : (
                              <Image
                                src={restaurant.image || ""}
                                alt="Image"
                                fill
                                className="object-cover"
                              ></Image>
                            )}
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <button
                              className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                              onClick={handleDiscard}
                            >
                              Discard
                            </button>
                            {cloudinaryUploadMutation.isLoading ||
                            editRestaurantMutation.isLoading ? (
                              <div className="flex justify-center">
                                <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                              </div>
                            ) : (
                              <button
                                className="h-10 w-full rounded-xl bg-virparyasLightBlue font-bold text-white"
                                onClick={() => void handleEditRestaurant()}
                              >
                                Confirm
                              </button>
                            )}
                          </div>
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
                    Disable {restaurant.name}
                  </Dialog.Title>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="phoneNumber"
                        className="whitespace-nowrap font-medium"
                      >
                        * Reason for disabling account:
                      </label>
                      {isInvalidReason && (
                        <p className="text-xs text-virparyasRed">
                          Reason is required
                        </p>
                      )}
                    </div>

                    <textarea
                      id="phoneNumber"
                      className={`h-40 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue ${
                        isInvalidReason ? "ring-2 ring-virparyasRed" : ""
                      }`}
                      placeholder="Reason for disabling account..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex justify-center gap-4">
                    {disableRestaurantMutation.isLoading ? (
                      <div className="flex justify-center">
                        <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                      </div>
                    ) : (
                      <button
                        className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                        onClick={() => void handleDisable()}
                      >
                        Disable account
                      </button>
                    )}
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

export default Restaurants;
