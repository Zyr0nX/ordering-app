import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import RestaurantRegistrationForm from "~/components/ui/RestaurantRegistrationForm";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const RestaurantRegistration: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ country, cuisines }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Restaurant Registration" />
        <RestaurantRegistrationForm country={country} cuisines={cuisines} />
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
  const [session, cuisines] = await Promise.all([
    getServerAuthSession(context),
    prisma.cuisine.findMany(),
  ]);

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

  return {
    props: {
      country: country || "",
      cuisines,
    },
  };
};

export default RestaurantRegistration;
