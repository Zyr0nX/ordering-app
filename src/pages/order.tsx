import {
  type InferGetServerSidePropsType,
  type NextPage,
  type GetServerSidePropsContext,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import OrderBody from "~/components/ui/OrderBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Order: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ order }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Order Summary" />
        <OrderBody order={order} />
      </>
    </Guest>
  );
};

export default Order;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { id: orderId } = context.query;

  const session = await getServerAuthSession(context);

  if (!orderId || !session) {
    return {
      notFound: true,
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      userId: session?.user.id || "",
    },
    include: {
      orderFood: true,
      restaurant: true,
      user: true,
    },
  });

  if (!order) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      order,
    },
  };
};
