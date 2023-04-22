import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import fuzzysort from "fuzzysort";
import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
  type NextPage,
} from "next";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Loading from "~/components/common/Loading";
import TextArea from "~/components/common/TextArea";
import GreenCheckmark from "~/components/icons/GreenCheckmark";
import InfoIcon from "~/components/icons/InfoIcon";
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

  await helpers.admin.getPendingRestauranntAndShipperRequests.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Requests: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Requests" />
        <AdminRequestsBody />
      </>
    </Admin>
  );
};

const AdminRequestsBody: React.FC = () => {
  const [search, setSearch] = useState("");

  const { data: pendingData } =
    api.admin.getPendingRestauranntAndShipperRequests.useQuery(undefined, {
      refetchInterval: 5000,
    });

  if (!pendingData) return null;

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
        {fuzzysort.go(search, pendingData, {
          keys: [
            "data.firstName",
            "data.lastName",
            "data.phoneNumber",
            "data.name",
            "data.address",
            "data.user.email",
          ],
          all: true,
        }).length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No requests found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fuzzysort
              .go(search, pendingData, {
                keys: [
                  "data.firstName",
                  "data.lastName",
                  "data.phoneNumber",
                  "data.name",
                  "data.address",
                  "data.user.email",
                ],
                all: true,
              })
              .map((pending) => pending.obj)
              .map((pending) => {
                if (pending.type === "restaurant") {
                  return (
                    <RestaurantPendingAdminCard
                      data={pending.data}
                      key={pending.data.id}
                    />
                  );
                } else {
                  return (
                    <ShipperPendingAdminCard
                      data={pending.data}
                      key={pending.data.id}
                    />
                  );
                }
              })}
          </div>
        )}
      </div>
    </div>
  );
};

const RestaurantPendingAdminCard: React.FC<
  Pick<
    Extract<
      RouterOutputs["admin"]["getPendingRestauranntAndShipperRequests"][number],
      { type: "restaurant" }
    >,
    "data"
  >
> = ({ data: restaurant }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const utils = api.useContext();
  const approveRestaurantMutation = api.admin.approveRestaurant.useMutation({
    onMutate: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.cancel();
    },
    onSettled: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const rejectRestaurantMutation = api.admin.rejectRestaurant.useMutation({
    onMutate: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.cancel();
    },
    onSettled: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const handleApprove = async () => {
    await toast.promise(
      approveRestaurantMutation.mutateAsync({
        restaurantId: restaurant.id,
      }),
      {
        loading: "Approving restaurant...",
        success: "Restaurant approved",
        error:
          approveRestaurantMutation.error?.message ||
          "Failed to approve restaurant",
      }
    );
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
          <div className="flex gap-2">
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsOpen(true)}
            >
              <InfoIcon className="h-8 w-8 fill-virparyasLightBlue md:h-10 md:w-10" />
            </button>
            {approveRestaurantMutation.isLoading ? (
              <Loading className="h-8 w-8 animate-spin fill-virparyasMainBlue text-gray-200 md:h-10 md:w-10" />
            ) : (
              <>
                <button
                  type="button"
                  className="relative z-10"
                  onClick={() => void handleApprove()}
                >
                  <GreenCheckmark className="h-8 w-8 fill-virparyasGreen md:h-10 md:w-10" />
                </button>
                <button
                  type="button"
                  className="relative z-10"
                  onClick={() => setIsRejectOpen(true)}
                >
                  <RedCross className="h-8 w-8 fill-virparyasRed md:h-10 md:w-10" />
                </button>
              </>
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
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    {restaurant.name}
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
                        rejectRestaurantMutation.mutateAsync({
                          restaurantId: restaurant.id,
                          reason: values.reason,
                        }),
                        {
                          loading: "Rejecting restaurant request...",
                          success: "Restaurant request rejected",
                          error:
                            rejectRestaurantMutation.error?.message ||
                            "Failed to reject restaurant request",
                        }
                      );
                    }}
                    validate={(values) => {
                      const errors: {
                        reason?: string;
                      } = {};
                      if (
                        !z.string().nonempty().safeParse(values.reason).success
                      ) {
                        errors.reason = "Reason is required";
                      }
                      return errors;
                    }}
                  >
                    <Form className="grid grid-cols-1 gap-4">
                      <TextArea
                        label="* Reason for disable account:"
                        name="reason"
                        placeholder="Reason for disable account..."
                      />
                      <div className="mt-4 flex justify-center gap-4">
                        {rejectRestaurantMutation.isLoading ? (
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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

const ShipperPendingAdminCard: React.FC<
  Pick<
    Extract<
      RouterOutputs["admin"]["getPendingRestauranntAndShipperRequests"][number],
      { type: "shipper" }
    >,
    "data"
  >
> = ({ data: shipper }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const utils = api.useContext();
  const approveShipperMutation = api.admin.approveShipper.useMutation({
    onMutate: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.cancel();
    },
    onSettled: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const rejectShipperMutation = api.admin.rejectShipper.useMutation({
    onMutate: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.cancel();
    },
    onSettled: async () => {
      await utils.admin.getPendingRestauranntAndShipperRequests.invalidate();
    },
  });

  const handleApprove = async () => {
    await toast.promise(
      approveShipperMutation.mutateAsync({
        shipperId: shipper.id,
      }),
      {
        loading: "Approving shipper...",
        success: "Shipper approved",
        error:
          approveShipperMutation.error?.message || "Failed to approve shipper",
      }
    );
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
          <div className="flex gap-2">
            <button
              type="button"
              className="relative z-10"
              onClick={() => setIsOpen(true)}
            >
              <InfoIcon className="h-8 w-8 fill-virparyasLightBlue md:h-10 md:w-10" />
            </button>
            {approveShipperMutation.isLoading ? (
              <Loading className="h-8 w-8 animate-spin fill-virparyasMainBlue text-gray-200 md:h-10 md:w-10" />
            ) : (
              <>
                <button
                  type="button"
                  className="relative z-10"
                  onClick={() => void handleApprove()}
                >
                  <GreenCheckmark className="h-8 w-8 fill-virparyasGreen md:h-10 md:w-10" />
                </button>
                <button
                  type="button"
                  className="relative z-10"
                  onClick={() => setIsRejectOpen(true)}
                >
                  <RedCross className="h-8 w-8 fill-virparyasRed md:h-10 md:w-10" />
                </button>
              </>
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
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    {shipper.firstName} {shipper.lastName}
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
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
                            className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
                              className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
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
                          className="h-10 w-full rounded-xl px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-virparyasMainBlue"
                          placeholder="Restaurant name..."
                          value={shipper.phoneNumber}
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
                          value={shipper.user.email || ""}
                          disabled
                        />
                      </div>
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
                <Dialog.Panel className="w-11/12 transform overflow-hidden rounded-2xl bg-virparyasBackground p-6 text-virparyasMainBlue transition-all">
                  <Dialog.Title as="h3" className="text-3xl font-bold">
                    Disable {shipper.firstName} {shipper.lastName}
                  </Dialog.Title>
                  <Formik
                    initialValues={{
                      reason: "",
                    }}
                    onSubmit={async (values) => {
                      await toast.promise(
                        rejectShipperMutation.mutateAsync({
                          shipperId: shipper.id,
                          reason: values.reason,
                        }),
                        {
                          loading: "Rejecting restaurant request...",
                          success: "Restaurant request rejected",
                          error:
                            rejectShipperMutation.error?.message ||
                            "Failed to reject restaurant request",
                        }
                      );
                    }}
                    validate={(values) => {
                      const errors: {
                        reason?: string;
                      } = {};
                      if (
                        !z.string().nonempty().safeParse(values.reason).success
                      ) {
                        errors.reason = "Reason is required";
                      }
                      return errors;
                    }}
                  >
                    <Form className="grid grid-cols-1 gap-4">
                      <TextArea
                        label="* Reason for disable account:"
                        name="reason"
                        placeholder="Reason for disable account..."
                      />
                      <div className="mt-4 flex justify-center gap-4">
                        {rejectShipperMutation.isLoading ? (
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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Requests;
