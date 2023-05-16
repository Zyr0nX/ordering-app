import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Input from "~/components/common/CommonInput";
import CuisineListbox from "~/components/common/CuisineListbox";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
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

  if (session.user.role === "RESTAURANT") {
    return {
      notFound: true,
    };
  }

  await Promise.all([
    helpers.cuisine.getAll.prefetch(),
    helpers.user.getRestaurantRegistrationInformation.prefetch(),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const RestaurantRegistration: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Restaurant Registration" />
        <RestaurantRegistrationForm />
      </>
    </Guest>
  );
};

const RestaurantRegistrationForm: React.FC = () => {
  const router = useRouter();
  const registrationMutation = api.restaurant.registration.useMutation();
  const { data: registrationData } =
    api.user.getRestaurantRegistrationInformation.useQuery(undefined, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });
  return (
    <div className="mx-4 mt-6 text-virparyasMainBlue">
      <Formik
        initialValues={{
          firstName: registrationData?.firstName || "",
          lastName: registrationData?.lastName || "",
          phoneNumber: registrationData?.phoneNumber || "",
          restaurantName: registrationData?.name || "",
          address: {
            description: registrationData?.address || "",
            place_id: registrationData?.addressId || "",
          },
          additionalAddress: registrationData?.additionalAddress || "",
          cuisine: registrationData?.cuisineId || "",
        }}
        onSubmit={async (values) => {
          await toast.promise(
            registrationMutation.mutateAsync(
              {
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                restaurantName: values.restaurantName,
                address: values.address.description,
                addressId: values.address.place_id,
                additionalAddress: values.additionalAddress,
                cuisineId: values.cuisine,
              },
              {
                onSuccess: () => {
                  void router.push("/account");
                },
              }
            ),
            {
              loading: "Registering...",
              success: "Registered successfully! Redirecting...",
              error:
                registrationMutation.error?.message || "Failed to register",
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

          <div className="px-auto mt-4 flex w-full justify-center gap-4">
            {registrationMutation.isLoading ? (
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

export default RestaurantRegistration;
