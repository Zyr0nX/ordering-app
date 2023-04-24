import { Dialog, Transition } from "@headlessui/react";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import fuzzysort from "fuzzysort";
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

  await helpers.cuisine.getAllIncludingRestaurants.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Cuisines: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Cuisines" />
        <AdminCuisinesBody />
      </>
    </Admin>
  );
};

const AdminCuisinesBody: React.FC = () => {
  const [search, setSearch] = useState("");

  const { data: cuisinesData } =
    api.cuisine.getAllIncludingRestaurants.useQuery(undefined, {
      refetchInterval: 5000,
    });

  if (!cuisinesData) return null;

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
        {fuzzysort.go(search, cuisinesData, {
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
              .go(search, cuisinesData, {
                keys: ["name"],
                all: true,
              })
              .map((cuisine) => cuisine.obj)
              .map((cuisine) => (
                <CuisineAdminCard cuisine={cuisine} key={cuisine.id} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CuisineAdminCard: React.FC<{
  cuisine: RouterOutputs["cuisine"]["getAllIncludingRestaurants"][number];
}> = ({ cuisine }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const utils = api.useContext();
  const updateCuisineMutation = api.admin.updateCuisine.useMutation({
    onMutate: async () => {
      await utils.cuisine.getAll.cancel();
    },
    onSettled: async () => {
      await utils.cuisine.getAll.invalidate();
      setIsEditOpen(false);
    },
  });

  const deleteCuisineMutation = api.admin.deleteCuisine.useMutation();

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {cuisine.name}
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
              disabled={!cuisine._count.restaurant}
              onClick={() => {
                if (
                  confirm("Are you sure you want to disable this restaurant?")
                ) {
                  deleteCuisineMutation.mutate({
                    cuisineId: cuisine.id,
                  });
                }
              }}
            >
              <RedCross
                className={`md:h-10 md:w-10 ${
                  cuisine._count.restaurant
                    ? "fill-virparyasRed"
                    : "fill-gray-300"
                }`}
              />
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
                    Edit {cuisine.name}
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        name: cuisine.name,
                        image: cuisine.image,
                      }}
                      onSubmit={async (values) => {
                        if (values.image === cuisine.image || !values.image) {
                          await toast.promise(
                            updateCuisineMutation.mutateAsync({
                              cuisineId: cuisine.id,
                              name: values.name,
                            }),
                            {
                              loading: "Editing cuisine...",
                              success: "Cuisine edited!",
                              error:
                                updateCuisineMutation.error?.message ||
                                "Failed to edit cuisine",
                            }
                          );
                          return;
                        }
                        await toast.promise(
                          updateCuisineMutation.mutateAsync({
                            cuisineId: cuisine.id,
                            name: values.name,
                            image: values.image,
                          }),
                          {
                            loading: "Editing cuisine...",
                            success: "Cuisine edited!",
                            error:
                              updateCuisineMutation.error?.message ||
                              "Failed to edit cuisine",
                          }
                        );
                      }}
                      validate={(values) => {
                        const errors: {
                          name?: string;
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
                          errors.name = "Name is too long";
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
                          type="text"
                          label="* Name:"
                          name="name"
                          placeholder="Name..."
                        />
                        <ImageUpload
                          label="* Image:"
                          name="image"
                          placeholder="Choose an image"
                        />
                        <div className="px-auto mt-4 flex w-full justify-center gap-4">
                          {updateCuisineMutation.isLoading ? (
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
    </>
  );
};

export default Cuisines;
