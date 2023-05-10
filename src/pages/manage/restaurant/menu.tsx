import { Dialog, Transition } from "@headlessui/react";
import { createId } from "@paralleldrive/cuid2";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React, { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Input from "~/components/common/CommonInput";
import FoodOptionInput from "~/components/common/FoodOptionInput";
import ImageUpload from "~/components/common/ImageUpload";
import Loading from "~/components/common/Loading";
import BluePencil from "~/components/icons/BluePencil";
import Restaurant from "~/components/layouts/Restaurant";
import ManageRestaurantHeader from "~/components/ui/ManageRestaurantHeader";
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

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  await helpers.food.getMenu.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Menu: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Restaurant>
      <>
        <ManageRestaurantHeader title="Menu" />
        <ManageRestaurantMenuBody />
      </>
    </Restaurant>
  );
};

const ManageRestaurantMenuBody = () => {
  const { data: menuData } = api.food.getMenu.useQuery();

  if (!menuData) {
    return null;
  }

  return (
    <div className="m-4 text-virparyasMainBlue">
      <div className="flex justify-center">
        <AddFood />
      </div>

      <div className="relative mt-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {menuData.map((food) => (
            <FoodList food={food} key={food.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

const AddFood: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const addFoodMutation = api.food.create.useMutation();
  return (
    <>
      <button className="font-medium" onClick={() => setIsOpen(true)}>
        Add food to menu +
      </button>
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
                    Add food
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        name: "",
                        price: 0,
                        quantity: 0,
                        description: "",
                        image: "",
                        foodOptions: [
                          {
                            id: createId(),
                            name: "",
                            options: [
                              {
                                id: createId(),
                                name: "",
                                price: 0,
                              },
                            ],
                          },
                        ],
                      }}
                      onSubmit={async (values) => {
                        await toast.promise(
                          addFoodMutation.mutateAsync({
                            name: values.name,
                            price: Number(values.price),
                            quantity: Number(values.quantity),
                            description: values.description,
                            image: values.image,
                            foodOptions: values.foodOptions
                              .filter((foodOption) => {
                                if (foodOption.name) {
                                  return true;
                                }
                                return false;
                              })
                              .map((foodOption) => ({
                                id: foodOption.id,
                                name: foodOption.name,
                                options: foodOption.options
                                  .filter((foodOptionItem) => {
                                    if (foodOptionItem.name) {
                                      return true;
                                    }
                                    return false;
                                  })
                                  .map((foodOptionItem) => ({
                                    id: foodOptionItem.id,
                                    name: foodOptionItem.name,
                                    price: foodOptionItem.price,
                                  })),
                              })),
                          }),
                          {
                            loading: "Adding food...",
                            success: "Food added",
                            error:
                              addFoodMutation.error?.message ||
                              "Failed to add food",
                          }
                        );
                      }}
                    >
                      <Form className="grid grid-cols-1 gap-4">
                        <Input
                          label="* Name:"
                          name="name"
                          placeholder="Name..."
                        />
                        <Input
                          label="* Price:"
                          name="price"
                          placeholder="Price..."
                        />

                        <Input
                          label="* Quantity:"
                          name="quantity"
                          placeholder="Quantity..."
                        />
                        <Input
                          label="Description:"
                          name="description"
                          placeholder="Description..."
                        />

                        <ImageUpload
                          label="* Image:"
                          name="image"
                          placeholder="Choose an image"
                        />
                        <FoodOptionInput name="foodOptions" />
                        <div className="px-auto mt-4 flex w-full justify-center gap-4">
                          {addFoodMutation.isLoading ? (
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

const FoodList: React.FC<{
  food: RouterOutputs["food"]["getMenu"][number];
}> = ({ food }) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFoodMutation = api.food.update.useMutation();

  return (
    <>
      <div className="flex flex-auto rounded-2xl bg-white p-4 pt-3 shadow-md">
        <div className="flex w-full items-center justify-between">
          <div className="text-virparyasMainBlue">
            <p className="text-xl font-medium md:mt-2 md:text-3xl">
              {food.name}
            </p>
            <p className="text-xs font-light md:mb-2 md:text-base">
              {food.price}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsOpen(true)}>
              <BluePencil className="md:h-10 md:w-10" />
            </button>
            {/* <button type="button" onClick={handleReject}>
              <RedCross className="md:h-10 md:w-10" />
            </button> */}
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
                    Add food
                  </Dialog.Title>
                  <div className="mt-2">
                    <Formik
                      initialValues={{
                        name: food.name,
                        price: Number(food.price),
                        quantity: Number(food.quantity),
                        description: food.description,
                        image: food.image,
                        foodOptions: food.foodOption.map((foodOption) => ({
                          id: foodOption.id,
                          name: foodOption.name,
                          options: foodOption.foodOptionItem.map(
                            (foodOptionItem) => ({
                              id: foodOptionItem.id,
                              name: foodOptionItem.name,
                              price: foodOptionItem.price,
                            })
                          ),
                        })),
                      }}
                      onSubmit={async (values) => {
                        await toast.promise(
                          updateFoodMutation.mutateAsync({
                            id: food.id,
                            name: values.name,
                            price: values.price,
                            quantity: values.quantity,
                            description: values.description,
                            image: values.image,
                            foodOptions: values.foodOptions
                              .filter((foodOption) => {
                                if (foodOption.name) {
                                  return true;
                                }
                                return false;
                              })
                              .map((foodOption) => ({
                                id: foodOption.id,
                                name: foodOption.name,
                                options: foodOption.options
                                  .filter((foodOptionItem) => {
                                    if (foodOptionItem.name) {
                                      return true;
                                    }
                                    return false;
                                  })
                                  .map((foodOptionItem) => ({
                                    id: foodOptionItem.id,
                                    name: foodOptionItem.name,
                                    price: foodOptionItem.price,
                                  })),
                              })),
                          }),
                          {
                            loading: "Updating food...",
                            success: "Food updated!",
                            error:
                              updateFoodMutation.error?.message ||
                              "Failed to update food",
                          }
                        );
                      }}
                      validate={(values) => {
                        const errors: {
                          name?: string;
                          price?: string;
                          quantity?: string;
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
                        if (Number(values.price) <= 0) {
                          errors.price = "Price must be a positive number";
                        }
                        if (Number(values.quantity) <= 0) {
                          errors.quantity =
                            "Quantity must be a positive number";
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
                        <Input
                          label="* Price:"
                          name="price"
                          placeholder="Price..."
                          type="number"
                        />

                        <Input
                          label="* Quantity:"
                          name="quantity"
                          placeholder="Quantity..."
                          type="number"
                        />
                        <Input
                          label="Description:"
                          name="description"
                          placeholder="Description..."
                        />

                        <ImageUpload
                          label="* Image:"
                          name="image"
                          placeholder="Choose an image"
                        />
                        <FoodOptionInput name="foodOptions" />
                        <div className="px-auto mt-4 flex w-full justify-center gap-4">
                          {updateFoodMutation.isLoading ? (
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

export default Menu;
