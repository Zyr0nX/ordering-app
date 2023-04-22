import { createServerSideHelpers } from "@trpc/react-query/server";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Form, Formik } from "formik";
import { isValidPhoneNumber } from "libphonenumber-js";
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
import Datepicker from "~/components/common/Datepicker";
import Loading from "~/components/common/Loading";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { getServerAuthSession } from "~/server/auth";
import { api } from "~/utils/api";

dayjs.extend(customParseFormat);

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

  if (session.user.role === "SHIPPER") {
    return {
      notFound: true,
    };
  }

  await helpers.user.getShipperRegistrationInformation.prefetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

const ShipperRegistration: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Restaurant Registration" />
        <ShipperRegistrationForm />
      </>
    </Guest>
  );
};

const ShipperRegistrationForm: React.FC = () => {
  const router = useRouter();
  const registrationMutation = api.shipper.registration.useMutation();
  const { data: registrationData } =
    api.user.getShipperRegistrationInformation.useQuery(undefined, {
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
          dateOfBirth: registrationData?.dateOfBirth
            ? {
                date: dayjs(registrationData.dateOfBirth).format("D"),
                month: dayjs(registrationData.dateOfBirth).format("MMM"),
                year: dayjs(registrationData.dateOfBirth).format("YYYY"),
              }
            : {
                date: "1",
                month: "Jan",
                year: "2000",
              },
          identificationNumber: registrationData?.identificationNumber || "",
          licensePlate: registrationData?.licensePlate || "",
          phoneNumber: registrationData?.phoneNumber || "",
        }}
        onSubmit={async (values) => {
          await toast.promise(
            registrationMutation.mutateAsync(
              {
                firstName: values.firstName,
                lastName: values.lastName,
                dateOfBirth: new Date(
                  `${values.dateOfBirth.year}-${values.dateOfBirth.month}-${values.dateOfBirth.date}`
                ),
                identificationNumber: values.identificationNumber,
                licensePlate: values.licensePlate,
                phoneNumber: values.phoneNumber,
              },
              {
                onSuccess: () => {
                  void router.push("/account");
                },
              }
            ),
            {
              loading: "Registering...",
              success: "Registration successful!",
              error: "Registration failed!",
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
            errors.dateOfBirth = "You must be at least 18 years old";
          }
          if (
            !z.string().nonempty().safeParse(values.identificationNumber)
              .success
          ) {
            errors.identificationNumber = "Identification number is required";
          }
          if (
            !z.string().max(20).safeParse(values.identificationNumber).success
          ) {
            errors.identificationNumber = "Identification number is too long";
          }
          if (!z.string().nonempty().safeParse(values.licensePlate).success) {
            errors.licensePlate = "License plate is required";
          }
          if (!z.string().max(20).safeParse(values.licensePlate).success) {
            errors.licensePlate = "License plate is too long";
          }
          if (!isValidPhoneNumber(values.phoneNumber)) {
            errors.phoneNumber = "Invalid phone number";
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
          <Datepicker label="* Date of birth:" name="dateOfBirth" />
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
          <div className="px-auto mt-4 flex w-full justify-center gap-4">
            {registrationMutation.isLoading ? (
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
  );
};

export default ShipperRegistration;
