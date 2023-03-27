import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
  type NextPage,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import CheckoutBody from "~/components/ui/CheckoutBody";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Checkout: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, country }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Checkout" />
        <CheckoutBody user={user} country={country} />
      </>
    </Guest>
  );
};

export default Checkout;

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

  const { id, country } = context.query;

  if (!id) {
    return {
      notFound: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id || "",
    },
    include: {
      cartItem: {
        where: {
          food: {
            restaurantId: id as string,
          },
        },
        include: {
          food: {
            include: {
              restaurant: true,
            },
          },
          foodOption: true,
        },
      },
    },
  });

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user,
      country: country as string,
    },
  };
};
