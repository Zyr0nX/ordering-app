import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Input from "~/components/common/CommonInput";
import CuisineListbox from "~/components/common/CuisineListbox";
import ImageUpload from "~/components/common/ImageUpload";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import Guest from "~/components/layouts/Guest";
import ManageRestaurantHeader from "~/components/ui/ManageRestaurantHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

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
  await Promise.all([
    helpers.restaurant.getInfomation.prefetch(),
    helpers.cuisine.getAll.prefetch(),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const Information: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Guest>
      <>
        <ManageRestaurantHeader title="Profile" />
        <RestaurantAccountInformation />
      </>
    </Guest>
  );
};

const RestaurantAccountInformation = () => {
  const updateRestaurantMutation = api.restaurant.update.useMutation();
  const { data: restaurant } = api.restaurant.getInfomation.useQuery();
  if (!restaurant) return null;
  return (
    <div className="m-4 text-virparyasMainBlue md:m-8">
      <Formik
        initialValues={{
          firstName: restaurant?.firstName || "",
          lastName: restaurant?.lastName || "",
          phoneNumber: restaurant?.phoneNumber || "",
          restaurantName: restaurant?.name || "",
          address: {
            description: restaurant?.address || "",
            place_id: restaurant?.addressId || "",
          },
          additionalAddress: restaurant?.additionalAddress || "",
          cuisine: restaurant?.cuisineId || "",
          image: restaurant?.image || "",
        }}
        onSubmit={async (values) => {
          if (values.image === restaurant.image || !values.image) {
            await toast.promise(
              updateRestaurantMutation.mutateAsync({
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
                loading: "Updating profile...",
                success: "Profile updated",
                error:
                  updateRestaurantMutation.error?.message ||
                  "Failed to update profile",
              }
            );
            return;
          }
          await toast.promise(
            updateRestaurantMutation.mutateAsync({
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
              loading: "Updating profile...",
              success: "Profile updated",
              error:
                updateRestaurantMutation.error?.message ||
                "Failed to update profile",
            }
          );
        }}
        validate={(values) => {
          const errors: {
            firstName?: string;
            lastName?: string;
            phoneNumber?: string;
            restaurantName?: string;
            address?: string;
            cuisine?: string;
            image?: string;
          } = {};
          if (!z.string().nonempty().safeParse(values.firstName).success) {
            errors.firstName = "First name is required";
          }
          if (!z.string().max(191).safeParse(values.firstName).success) {
            errors.firstName = "First name is too long";
          }
          if (!z.string().nonempty().safeParse(values.lastName).success) {
            errors.lastName = "Last name is required";
          }
          if (!z.string().max(191).safeParse(values.lastName).success) {
            errors.lastName = "Last name is too long";
          }
          if (!z.string().nonempty().safeParse(values.restaurantName).success) {
            errors.restaurantName = "Restaurant name is required";
          }
          if (!z.string().max(191).safeParse(values.restaurantName).success) {
            errors.restaurantName = "Restaurant name is too long";
          }
          if (
            !z.string().nonempty().safeParse(values.address.description).success
          ) {
            errors.address = "Address is required";
          }
          if (!z.string().cuid().safeParse(values.cuisine).success) {
            errors.cuisine = "Cuisine is required";
          }
          if (!isValidPhoneNumber(values.phoneNumber)) {
            errors.phoneNumber = "Invalid phone number";
          }
          if (!z.string().url().safeParse(values.image).success) {
            errors.image = "Invalid image url";
          }
          if (
            new TextEncoder().encode(values.image || undefined).length >=
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
            label="* Restaurant name:"
            name="restaurantName"
            placeholder="Restaurant name..."
          />
          <PlaceAutoCompleteCombobox
            label="* Address"
            name="address"
            placeholder="Address..."
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

          <PhoneNumberInput
            label="* Phone number:"
            name="phoneNumber"
            placeholder="Phone number..."
          />

          <CuisineListbox
            label="* Cuisine:"
            name="cuisine"
            placeholder="Select a cuisine..."
          />

          <ImageUpload
            label="* Image:"
            name="image"
            placeholder="Choose an image"
          />

          <div className="px-auto mt-4 flex w-full justify-center gap-4">
            {updateRestaurantMutation.isLoading ? (
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
  );
};

export default Information;
