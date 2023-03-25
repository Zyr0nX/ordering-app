import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import GuestOrderHistoryBody from "~/components/ui/GuestOrderHistoryBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const History: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ orderHistory }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Order History" />
        <GuestOrderHistoryBody orderHistory={orderHistory} />
      </>
    </Guest>
  );
};

export default History;

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

  const orderHistory = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      orderFood: true,
      restaurant: true,
    },
  });

  return {
    props: {
      orderHistory,
    },
  };
};
