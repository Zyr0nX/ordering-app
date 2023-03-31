import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from "next";
import React from "react";
import Shipper from "~/components/layouts/Shipper";
import ManageShipperHeader from "~/components/ui/ManageShipperHeader";
import ManageShipperRequestsBody from "~/components/ui/ManageShipperRequestsBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";


const InProgress: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ order }) => {
  return (
    <Shipper>
      <>
        <ManageShipperHeader title="Order Requests" />
        <ManageShipperRequestsBody order={order} />
      </>
    </Shipper>
  );
};

export default InProgress;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "SHIPPER") {
    return {
      notFound: true,
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      status: {
        notIn: [
          "PLACED",
          "REJECTED_BY_RESTAURANT",
          "REJECTED_BY_SHIPPER",
          "DELIVERED",
        ],
      },
      shipper: {
        userId: session?.user.id || "",
      }
    },
    include: {
      user: true,
      orderFood: true,
      restaurant: true,
    },
  });

  return {
    props: {
      order,
    },
  };
};