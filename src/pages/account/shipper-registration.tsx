import { Form, Formik } from "formik";
import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Input from "~/components/common/CommonInput";
import Datepicker from "~/components/common/Datepicker";
import PhoneNumberInput from "~/components/common/PhoneNumberInput";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

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

  return {
    props: {},
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
  return (
    <div className="mx-4 mt-6 text-virparyasMainBlue">
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          dateOfBirth: {
            date: "1",
            month: "Feb",
            year: "2000",
          },
          identificationNumber: "",
          licensePlate: "",
          phoneNumber: "",
        }}
        onSubmit={(values) => {
          console.log(values);
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
            {/* {registrationMutation.isLoading ? (
              <Loading className="h-10 w-10 animate-spin fill-virparyasMainBlue text-gray-200" />
            ) : ( */}
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
            {/* )} */}
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default ShipperRegistration;
