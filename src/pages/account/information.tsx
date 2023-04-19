import { createServerSideHelpers } from "@trpc/react-query/server";
import { Form, Formik } from "formik";
import { isPossiblePhoneNumber } from "libphonenumber-js/min";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { toast } from "react-hot-toast";
import SuperJSON from "superjson";
import { z } from "zod";
import Input from "~/components/common/CommonInput";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import PlaceAutoCompleteCombobox from "~/components/common/PlaceAutoCompleteCombobox";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
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
  await helpers.user.getInfomation.prefetch();

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
        <GuestCommonHeader text="Account Information" />
        <GuestAccountInformation />
      </>
    </Guest>
  );
};

const GuestAccountInformation = () => {
  const router = useRouter();
  const updateUserMutation = api.user.updateInfo.useMutation();
  const { data: user } = api.user.getInfomation.useQuery();
  if (!user) return null;
  console.log(user.name);
  return (
    <div className="m-4 text-virparyasMainBlue md:m-8">
      <Formik
        initialValues={{
          name: user.name || "",
          phoneNumber: user.phoneNumber || "",
          address: {
            description: user.address || "",
            place_id: user.addressId || "",
          },
          additionalAddress: user.additionalAddress,
        }}
        onSubmit={async (values) => {
          await toast.promise(
            updateUserMutation.mutateAsync(
              {
                name: values.name,
                phoneNumber: values.phoneNumber,
                address: values.address.description,
                addressId: values.address.place_id,
                additionalAddress: values.additionalAddress,
              },
              {
                onSuccess: () => {
                  void router.push("/account");
                },
              }
            ),
            {
              loading: "Updating...",
              success: "Updated successfully! Redirecting...",
              error: "Failed to update",
            }
          );
        }}
        validate={(values) => {
          const errors: {
            name?: string;
            phoneNumber?: string;
            address?: string;
          } = {};
          if (!z.string().nonempty().safeParse(values.name).success) {
            errors.name = "Name is required";
          }
          if (!z.string().max(191).safeParse(values.name).success) {
            errors.name = "Name is too long";
          }
          if (
            !z.string().nonempty().safeParse(values.address.description).success
          ) {
            errors.address = "Address is required";
          }
          if (!isPossiblePhoneNumber(values.phoneNumber)) {
            errors.phoneNumber = "Invalid phone number";
          }
          return errors;
        }}
      >
        <Form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            type="text"
            label="* Name:"
            name="name"
            placeholder="Name..."
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
          <PhoneNumberInput
            label="* Phone number:"
            name="phoneNumber"
            placeholder="Phone number..."
          />
          <div className="px-auto mt-4 flex w-full justify-center gap-4 md:col-span-2">
            {updateUserMutation.isLoading ? (
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
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="flex flex-col gap-2">
          <Link
            href="/account/restaurant-registration"
            className="text-center text-lg font-medium"
          >
            Add your restaurant
          </Link>
          <Link
            href="/account/shipper-registration"
            className="text-center text-lg font-medium"
          >
            Sign up to deliver
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Information;
