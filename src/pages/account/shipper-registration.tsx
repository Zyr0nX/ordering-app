import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import ShipperRegistrationForm from "~/components/ui/ShipperRegistrationForm";
import { getServerAuthSession } from "~/server/auth";

const ShipperRegistration: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ country }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Restaurant Registration" />
        <ShipperRegistrationForm country={country} />
      </>
    </Guest>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  let { country } = context.query;

  if (Array.isArray(country)) {
    country = country[0];
  }

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
    props: {
      country: country || "",
    },
  };
};

export default ShipperRegistration;
