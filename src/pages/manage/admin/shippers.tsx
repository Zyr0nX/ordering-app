import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import fuzzysort from "fuzzysort";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import {
  type GetServerSidePropsContext,
  type NextPage,
  type InferGetServerSidePropsType,
} from "next";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import Input from "~/components/common/CommonInput";
import Datepicker from "~/components/common/Datepicker";
import ImageUpload from "~/components/common/ImageUpload";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import TextArea from "~/components/common/TextArea";
import BluePencil from "~/components/icons/BluePencil";
import GreenCheckmark from "~/components/icons/GreenCheckmark";
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
    helpers.admin.getShippers.prefetch(),
    helpers.cuisine.getAll.prefetch(),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Shippers: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Restaurants" />
        <AdminShippersBody />
      </>
    </Admin>
  );
};

const AdminShippersBody: React.FC = () => {
  const [search, setSearch] = useState("");

  const { data: shippersData } = api.admin.getShippers.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (!shippersData) return null;

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
        {fuzzysort.go(search, shippersData, {
          keys: ["firstName", "lastName", "phoneNumber"],
          all: true,
        }).length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No shippers found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fuzzysort
              .go(search, shippersData, {
                keys: ["firstName", "lastName", "phoneNumber"],
                all: true,
              })
              .map((shipper) => shipper.obj)
              .map((shipper) => (
                <ShipperAdminCard shipper={shipper} key={shipper.id} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ShipperAdminCard: React.FC<{
  shipper: RouterOutputs["admin"]["getShippers"][number];
}> = ({ shipper }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const utils = api.useContext();
  const editShipperMutation = api.admin.editShipper.useMutation({
    onMutate: async () => {
      await utils.admin.getShippers.cancel();
    },
    onSettled: async () => {
      await utils.admin.getShippers.invalidate();
      setIsEditOpen(false);
    },
  });

  const disableShipperMutation = api.admin.disableShipper.useMutation({
    onMutate: async () => {
      await utils.admin.getShippers.cancel();
    },
    onSettled: async () => {
      await utils.admin.getShippers.invalidate();
      setIsRejectOpen(false);
    },
  });
  const reactivateShipperMutation = api.admin.reactivateShipper.useMutation({
    onMutate: async () => {
      await utils.admin.getShippers.cancel();
    },
    onSettled: async () => {
      await utils.admin.getShippers.invalidate();
    },
  });

  const reactivate = async () => {
    await toast.promise(
      reactivateShipperMutation.mutateAsync({ shipperId: shipper.id }),
      {
        loading: "Reactivating shipper...",
        success: "Shipper reactivated",
        error:
          reactivateShipperMutation.error?.message ||
          "Failed to reactivate shipper",
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
            <p className="text-xs font-light md:mb-2 md:text-base">
              {shipper.phoneNumber}
            </p>
          </div>
          <div className="flex">
            {shipper.approved !== "APPROVED" ? (
              <>
                {reactivateShipperMutation.isLoading ? (
                  <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                ) : (
                  <button
                    type="button"
                    className="relative z-10"
                    onClick={() => void reactivate()}
                  >
                    <GreenCheckmark className="md:h-10 md:w-10" />
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                className="relative z-10"
                onClick={() => setIsRejectOpen(true)}
              >
                <RedCross className="md:h-10 md:w-10" />
              </button>
            )}
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
                    Edit {shipper.firstName} {shipper.lastName}
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        firstName: shipper.firstName,
                        lastName: shipper.lastName,
                        phoneNumber: shipper.phoneNumber,
                        identificationNumber: shipper.identificationNumber,
                        licensePlate: shipper.licensePlate,
                        dateOfBirth: {
                          date: dayjs(shipper.dateOfBirth).format("D"),
                          month: dayjs(shipper.dateOfBirth).format("MMM"),
                          year: dayjs(shipper.dateOfBirth).format("YYYY"),
                        },
                        image: shipper.image,
                      }}
                      onSubmit={async (values) => {
                        if (values.image === shipper.image || !values.image) {
                          await toast.promise(
                            editShipperMutation.mutateAsync({
                              shipperId: shipper.id,
                              firstName: values.firstName,
                              lastName: values.lastName,
                              phoneNumber: values.phoneNumber,
                              identificationNumber: values.identificationNumber,
                              licensePlate: values.licensePlate,
                              dateOfBirth: new Date(
                                `${values.dateOfBirth.year}-${values.dateOfBirth.month}-${values.dateOfBirth.date}`
                              ),
                            }),
                            {
                              loading: "Editing shipper...",
                              success: "Shipper edited!",
                              error:
                                editShipperMutation.error?.message ||
                                "Failed to edit restaurant",
                            }
                          );
                          return;
                        }
                        await toast.promise(
                          editShipperMutation.mutateAsync({
                            shipperId: shipper.id,
                            firstName: values.firstName,
                            lastName: values.lastName,
                            phoneNumber: values.phoneNumber,
                            identificationNumber: values.identificationNumber,
                            licensePlate: values.licensePlate,
                            dateOfBirth: new Date(
                              `${values.dateOfBirth.year}-${values.dateOfBirth.month}-${values.dateOfBirth.date}`
                            ),
                            image: values.image,
                          }),
                          {
                            loading: "Editing shipper...",
                            success: "Shipper edited!",
                            error:
                              editShipperMutation.error?.message ||
                              "Failed to edit restaurant",
                          }
                        );
                      }}
                      validate={(values) => {
                        const errors: {
                          firstName?: string;
                          lastName?: string;
                          dateOfBirth?: string;
                          identificationNumber?: string;
                          licensePlate?: string;
                          phoneNumber?: string;
                          image?: string;
                        } = {};
                        if (
                          !z.string().nonempty().safeParse(values.firstName)
                            .success
                        ) {
                          errors.firstName = "First name is required";
                        }
                        if (
                          !z.string().max(191).safeParse(values.firstName)
                            .success
                        ) {
                          errors.firstName = "First name is too long";
                        }
                        if (
                          !z.string().nonempty().safeParse(values.lastName)
                            .success
                        ) {
                          errors.lastName = "Last name is required";
                        }
                        if (
                          !z.string().max(191).safeParse(values.lastName)
                            .success
                        ) {
                          errors.lastName = "Last name is too long";
                        }
                        if (
                          !dayjs(
                            `${values.dateOfBirth.year}-${values.dateOfBirth.month}-${values.dateOfBirth.date}`,
                            "YYYY-MMM-D",
                            true
                          ).isValid()
                        ) {
                          errors.dateOfBirth = "Date of birth is invalid";
                        }
                        if (
                          dayjs().diff(
                            dayjs(
                              `${values.dateOfBirth.year}-${values.dateOfBirth.month}-${values.dateOfBirth.date}`,
                              "YYYY-MMM-D",
                              true
                            ),
                            "year"
                          ) < 18
                        ) {
                          errors.dateOfBirth =
                            "You must be at least 18 years old";
                        }
                        if (
                          !z
                            .string()
                            .nonempty()
                            .safeParse(values.identificationNumber).success
                        ) {
                          errors.identificationNumber =
                            "Identification number is required";
                        }
                        if (
                          !z
                            .string()
                            .regex(/^\d+$/)
                            .transform(Number)
                            .safeParse(values.identificationNumber).success
                        ) {
                          errors.identificationNumber =
                            "Identification number must be a number";
                        }
                        if (
                          !z
                            .string()
                            .max(20)
                            .safeParse(values.identificationNumber).success
                        ) {
                          errors.identificationNumber =
                            "Identification number is too long";
                        }
                        if (
                          !z.string().nonempty().safeParse(values.licensePlate)
                            .success
                        ) {
                          errors.licensePlate = "License plate is required";
                        }
                        if (
                          !z.string().max(20).safeParse(values.licensePlate)
                            .success
                        ) {
                          errors.licensePlate = "License plate is too long";
                        }
                        if (!isValidPhoneNumber(values.phoneNumber)) {
                          errors.phoneNumber = "Invalid phone number";
                        }
                        if (!z.string().url().safeParse(values.image).success) {
                          errors.image = "Invalid image url";
                        }
                        if (
                          new TextEncoder().encode(values.image || undefined)
                            .length >=
                          4 * 1024 * 1024
                        ) {
                          errors.image = "Image size is too large";
                        }
                        return errors;
                      }}
                    >
                      <Form className="grid grid-cols-1 gap-4">
                        <div className="flex gap-4">
                          <div className="grow">
                            <Input
                              label="* First name:"
                              name="firstName"
                              placeholder="First name..."
                            />
                          </div>
                          <div className="grow">
                            <Input
                              label="* Last name:"
                              name="lastName"
                              placeholder="Last name..."
                            />
                          </div>
                        </div>
                        <Datepicker
                          label="* Date of birth:"
                          name="dateOfBirth"
                        />
                        <Input
                          label="* Identification number:"
                          name="identificationNumber"
                          placeholder="Identification number..."
                        />
                        <Input
                          label="* License plate:"
                          name="licensePlate"
                          placeholder="License plate..."
                        />
                        <PhoneNumberInput
                          label="* Phone number:"
                          name="phoneNumber"
                          placeholder="Phone number..."
                        />

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
                          {editShipperMutation.isLoading ? (
                            <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
                          ) : (
                            <button
                              type="submit"
                              className="w-36 rounded-xl bg-virparyasGreen px-10 py-2 font-medium text-white"
                            >
                              Confirm
                            </button>
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
                    Disable {shipper.firstName} {shipper.lastName}
                  </Dialog.Title>
                  <Formik
                    initialValues={{
                      reason: "",
                    }}
                    onSubmit={async (values) => {
                      await toast.promise(
                        disableShipperMutation.mutateAsync({
                          shipperId: shipper.id,
                          reason: values.reason,
                        }),
                        {
                          loading: "Disabling shipper...",
                          success: "Shipper disabled",
                          error:
                            disableShipperMutation.error?.message ||
                            "Failed to disable shipper",
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
                        {disableShipperMutation.isLoading ? (
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

export default Shippers;
