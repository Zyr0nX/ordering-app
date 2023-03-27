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
  const session = await getServerAuthSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { slug: orderId } = context.query;

  if (!orderId) {
    return {
      notFound: true,
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: Number((orderId as string).replace("VP-", "")),
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
