import { type InferGetServerSidePropsType, type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import CheckoutBody from "~/components/ui/CheckoutBody";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Checkout: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ order }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Checkout" />
        <CheckoutBody order={order} />
      </>
    </Guest>
  );
};

export default Checkout;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { orderId } = context.query;

  const order = await prisma.order.findUnique({
    where: {
      id: orderId as string,
    },
    include: {
      cartItem: {
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

  const session = await getServerAuthSession(context);

  if (!order || order.userId !== session?.user.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      order,
    },
  };
};
