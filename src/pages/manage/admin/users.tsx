import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
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
import Input from "~/components/common/CommonInput";
import ImageUpload from "~/components/common/ImageUpload";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import BluePencil from "~/components/icons/BluePencil";
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

  await helpers.admin.getUsers.prefetch();

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

  const { data: usersData } = api.admin.getUsers.useQuery(undefined, {
    refetchInterval: 5000,
    enabled: !search,
  });

  if (!usersData) return null;

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
        {fuzzysort.go(search, usersData, {
          keys: ["name", "email"],
          all: true,
        }).length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-2xl bg-white">
            <p className="text-xl font-semibold">No users found</p>
            <SleepIcon />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {fuzzysort
              .go(search, usersData, {
                keys: ["name", "email"],
                all: true,
              })
              .map((user) => user.obj)
              .map((user) => (
                <UserAdminCard user={user} key={user.id} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const UserAdminCard: React.FC<{
  user: RouterOutputs["admin"]["getUsers"][number];
}> = ({ user }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const utils = api.useContext();
  const editUserMutation = api.admin.editUser.useMutation({
    onMutate: async () => {
      await utils.admin.getUsers.cancel();
    },
    onSettled: async () => {
      await utils.admin.getUsers.invalidate();
      setIsEditOpen(false);
    },
  });

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {user.name || "N/A"}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {user.email || "N/A"}
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
                    Edit {user.name || ""}
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        name: user.name || "",
                        address: {
                          description: user.address || "",
                          place_id: user.addressId || "",
                        },
                        additionalAddress: user.additionalAddress || "",
                        phoneNumber: user.phoneNumber || "",
                        email: user.email || "",
                        image: user.image || "",
                      }}
                      onSubmit={async (values) => {
                        if (values.image === user.image || !values.image) {
                          await toast.promise(
                            editUserMutation.mutateAsync({
                              userId: user.id,
                              name: values.name,
                              address: values.address.description,
                              addressId: values.address.place_id,
                              additionalAddress: values.additionalAddress,
                              phoneNumber: values.phoneNumber,
                            }),
                            {
                              loading: "Editing user...",
                              success: "User edited!",
                              error:
                                editUserMutation.error?.message ||
                                "Failed to edit user",
                            }
                          );
                          return;
                        }
                        await toast.promise(
                          editUserMutation.mutateAsync({
                            userId: user.id,
                            name: values.name,
                            address: values.address.description,
                            addressId: values.address.place_id,
                            additionalAddress: values.additionalAddress,
                            phoneNumber: values.phoneNumber,
                            image: values.image,
                          }),
                          {
                            loading: "Editing user...",
                            success: "User edited!",
                            error:
                              editUserMutation.error?.message ||
                              "Failed to edit user",
                          }
                        );
                      }}
                      validate={(values) => {
                        const errors: {
                          name?: string;
                          phoneNumber?: string;
                          address?: string;
                          image?: string;
                        } = {};
                        if (
                          !z.string().nonempty().safeParse(values.name).success
                        ) {
                          errors.name = "Name is required";
                        }
                        if (
                          !z.string().max(191).safeParse(values.name).success
                        ) {
                          errors.name = "First name is too long";
                        }
                        if (
                          !z
                            .string()
                            .nonempty()
                            .safeParse(values.address.description).success
                        ) {
                          errors.address = "Address is required";
                        }
                        if (
                          !z
                            .string()
                            .nonempty()
                            .safeParse(values.address.place_id).success
                        ) {
                          errors.address = "Address is required";
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
                        <Input
                          label="* Name:"
                          name="name"
                          placeholder="Name..."
                        />
                        <PlaceAutoCompleteCombobox
                          label="* Address"
                          name="address"
                          placeholder="Address..."
                          enableCurrentAddress={false}
                        />
                        <Input
                          label="* Additional address:"
                          name="additionalAddress"
                          placeholder="Additional address..."
                        />
                        <PhoneNumberInput
                          label="* Phone number:"
                          name="phoneNumber"
                          placeholder="Phone number..."
                          enableCurrentLocation={false}
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
                          {editUserMutation.isLoading ? (
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
    </>
  );
};

export default Shippers;
