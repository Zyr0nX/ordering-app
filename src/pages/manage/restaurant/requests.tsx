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

const Requests: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ orderList }) => {
  return (
    <Restaurant>
      <>
        <ManageRestaurantHeader title="Order Requests" />
        <ManageRestaurantRequestsBody orderList={orderList} />
      </>
    </Restaurant>
  );
};

export default Requests;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  const orderList = await prisma.order.findMany({
    where: {
      restaurant: {
        userId: session?.user.id,
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
      orderList,
    },
  };
};