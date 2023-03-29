import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Restaurant from "~/components/layouts/Restaurant";
import ManageRestaurantHeader from "~/components/ui/ManageRestaurantHeader";
import ManageRestaurantRequestsBody from "~/components/ui/ManageRestaurantRequestsBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const InProgress: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ orders }) => {
  return (
    <Restaurant>
      <>
        <ManageRestaurantHeader title="Order Requests" />
        <ManageRestaurantRequestsBody orders={orders} />
      </>
    </Restaurant>
  );
};

export default InProgress;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  const orders = await prisma.order.findMany({
    where: {
      restaurant: {
        userId: session?.user.id || "",
      },
      status: {
        in: ["PLACED", "PREPARING"],
      },
    },
    include: {
      user: true,
      orderFood: true,
    },
  });

  return {
    props: {
      orders,
    },
  };
};
