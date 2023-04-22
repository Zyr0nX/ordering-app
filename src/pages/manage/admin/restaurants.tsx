import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import fuzzysort from "fuzzysort";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import { type GetServerSidePropsContext, type NextPage, type InferGetServerSidePropsType } from "next";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import Input from "~/components/common/CommonInput";
import CuisineListbox from "~/components/common/CuisineListbox";
import ImageUpload from "~/components/common/ImageUpload";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import TextArea from "~/components/common/TextArea";
import BluePencil from "~/components/icons/BluePencil";
import RedCross from "~/components/icons/RedCross";
import SearchIcon from "~/components/icons/SearchIcon";
import SleepIcon from "~/components/icons/SleepIcon";
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from "~/components/ui/AdminCommonHeader";
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
  const [search, setSearch] = useState("");

  const { data: restaurantsData } = api.admin.getApprovedRestaurants.useQuery(
    undefined,
    {
      refetchInterval: 5000,
      enabled: !search,
    }
  );

  if (!restaurantsData) return null;

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex h-12 w-full overflow-hidden rounded-2xl bg-white">
        <input
          type="text"
          className="grow rounded-l-2xl px-4 text-xl placeholder:text-lg placeholder:font-light focus-within:outline-none"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center bg-virparyasMainBlue px-4">
          <SearchIcon className="h-8 w-8 fill-white" />
        </div>
      </div>
      <div className="mt-4">
        {fuzzysort.go(search, restaurantsData, {
          keys: ["name"],
          all: true,
        }).length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No restaurants found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fuzzysort
              .go(search, restaurantsData, {
                keys: ["name"],
                all: true,
              })
              .map((restaurant) => restaurant.obj)
              .map((restaurant) => (
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
  const utils = api.useContext();
  const editRestaurantMutation = api.admin.editRestaurant.useMutation({
    onMutate: async () => {
      await utils.admin.getApprovedRestaurants.cancel();
    },
    onSettled: async () => {
      await utils.admin.getApprovedRestaurants.invalidate();
      setIsEditOpen(false);
    },
  });

  const disableRestaurantMutation = api.admin.disableRestaurant.useMutation();

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
                    <Formik
                      initialValues={{
                        cuisine: restaurant.cuisineId,
                        restaurantName: restaurant.name,
                        address: {
                          description: restaurant.address,
                          place_id: restaurant.addressId,
                        },
                        additionalAddress: restaurant.additionalAddress,
                        phoneNumber: restaurant.phoneNumber,
                        firstName: restaurant.firstName,
                        lastName: restaurant.lastName,
                        email: restaurant.user.email,
                        image: restaurant.image,
                      }}
                      onSubmit={async (values) => {
                        if (
                          values.image === restaurant.image ||
                          !values.image
                        ) {
                          await toast.promise(
                            editRestaurantMutation.mutateAsync({
                              restaurantId: restaurant.id,
                              restaurantName: values.restaurantName,
                              address: values.address.description,
                              addressId: values.address.place_id,
                              additionalAddress: values.additionalAddress,
                              phoneNumber: values.phoneNumber,
                              cuisineId: values.cuisine,
                              firstName: values.firstName,
                              lastName: values.lastName,
                            }),
                            {
                              loading: "Editing restaurant...",
                              success: "Restaurant edited!",
                              error:
                                editRestaurantMutation.error?.message ||
                                "Failed to edit restaurant",
                            }
                          );
                          return;
                        }
                        await toast.promise(
                          editRestaurantMutation.mutateAsync({
                            restaurantId: restaurant.id,
                            restaurantName: values.restaurantName,
                            address: values.address.description,
                            addressId: values.address.place_id,
                            additionalAddress: values.additionalAddress,
                            phoneNumber: values.phoneNumber,
                            cuisineId: values.cuisine,
                            firstName: values.firstName,
                            lastName: values.lastName,
                            image: values.image,
                          }),
                          {
                            loading: "Editing restaurant...",
                            success: "Restaurant edited!",
                            error:
                              editRestaurantMutation.error?.message ||
                              "Failed to edit restaurant",
                          }
                        );
                      }}
                      validationSchema={toFormikValidationSchema(
                        z.object({
                          restaurantName: z
                            .string({
                              required_error: "Restaurant name is required",
                              invalid_type_error:
                                "Restaurant name must be a string",
                            })
                            .nonempty({
                              message: "Restaurant name is required",
                            })
                            .max(191, {
                              message: "Restaurant name is too long",
                            }),
                          address: z.object({
                            description: z
                              .string({
                                required_error: "Address is required",
                                invalid_type_error: "Address must be a string",
                              })
                              .nonempty({
                                message: "Address is required",
                              })
                              .max(191, {
                                message: "Address is too long",
                              }),
                            // place_id: z
                            //   .string({
                            //     required_error: "Address is required",
                            //     invalid_type_error: "Address must be a string",
                            //   })
                            //   .nonempty({
                            //     message: "Address is required",
                            //   })
                            //   .max(191, {
                            //     message: "Address is too long",
                            //   }),
                          }),
                          phoneNumber: z
                            .string({
                              required_error: "Phone number is required",
                              invalid_type_error:
                                "Phone number must be a string",
                            })
                            .refine((value) => isValidPhoneNumber(value), {
                              message: "Phone number is invalid",
                            }),
                          firstName: z
                            .string({
                              required_error: "First name is required",
                              invalid_type_error: "First name must be a string",
                            })
                            .nonempty({
                              message: "First name is required",
                            })
                            .max(191, {
                              message: "First name is too long",
                            }),
                          lastName: z
                            .string({
                              required_error: "Last name is required",
                              invalid_type_error: "Last name must be a string",
                            })
                            .nonempty({
                              message: "Last name is required",
                            })
                            .max(191, {
                              message: "Last name is too long",
                            }),
                          image: z
                            .string()
                            .url({
                              message: "Image is invalid",
                            })
                            .refine(
                              (value) =>
                                new TextEncoder().encode(value).length <=
                                4 * 1024 * 1024,
                              {
                                message: "Image is too large",
                              }
                            ),
                        })
                      )}
                    >
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
                        <PhoneNumberInput
                          label="* Phone number:"
                          name="phoneNumber"
                          placeholder="Phone number..."
                          enableCurrentLocation={false}
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

                        <Input
                          type="email"
                          label="Email:"
                          name="email"
                          placeholder="Email..."
                          disabled
                        />
                        <ImageUpload
                          label="* Image:"
                          name="image"
                          placeholder="Choose an image"
                        />
                        <div className="px-auto mt-4 flex w-full justify-center gap-4">
                          {editRestaurantMutation.isLoading ? (
                            <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                          ) : (
                            <>
                              <button
                                type="button"
                                className="w-36 rounded-xl bg-virparyasRed px-10 py-2 font-medium text-white"
                              >
                                Discard
                              </button>
                              <button
                                type="submit"
                                className="w-36 rounded-xl bg-virparyasGreen px-10 py-2 font-medium text-white"
                              >
                                Confirm
                              </button>
                            </>
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
                  <Formik
                    initialValues={{
                      reason: "",
                    }}
                    onSubmit={async (values) => {
                      await toast.promise(
                        disableRestaurantMutation.mutateAsync({
                          restaurantId: restaurant.id,
                          reason: values.reason,
                        }),
                        {
                          loading: "Disabling restaurant...",
                          success: "Restaurant disabled",
                          error:
                            disableRestaurantMutation.error?.message ||
                            "Failed to disable restaurant",
                        }
                      );
                    }}
                    validationSchema={toFormikValidationSchema(
                      z
                        .object({
                          reason: z
                            .string({
                              required_error: "Reason is required",
                              invalid_type_error: "Reason must be a string",
                            })
                            .nonempty({
                              message: "Reason is required",
                            })
                            .max(191, {
                              message: "Reason is too long",
                            }),
                        })
                        .nonstrict()
                    )}
                  >
                    <Form className="grid grid-cols-1 gap-4">
                      <TextArea
                        label="* Reason for disable account:"
                        name="reason"
                        placeholder="Reason for disable account..."
                      />
                      <div className="mt-4 flex justify-center gap-4">
                        {disableRestaurantMutation.isLoading ? (
                          <div className="flex justify-center">
                            <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="h-10 w-full rounded-xl bg-virparyasRed font-bold text-white"
                          >
                            Disable account
                          </button>
                        )}
                      </div>
                    </Form>
                  </Formik>
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