import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import CartBody from "~/components/ui/CartBody";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { api } from "~/utils/api";

const Cart: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ cart }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Cart" />
        <CartBody cart={cart} />
      </>
    </Guest>
  );
};

export default Cart;

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

  const cart = await prisma.cartItem.findMany({
    where: {
      userId: session.user.id || "",
    },
    include: {
      food: {
        include: {
          restaurant: true,
        },
      },
      foodOption: true,
    },
  });
  return {
    props: {
      cart,
    },
  };
};
