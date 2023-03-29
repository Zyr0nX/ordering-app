import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
  type NextPage,
} from "next";
import React from "react";
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from "~/components/ui/AdminCommonHeader";
import AdminRequestsBody from "~/components/ui/AdminRequestsBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Requests: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ pendingRestaurantAndShipper }) => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Requests" />
        <AdminRequestsBody
          pendingRestaurantAndShipper={pendingRestaurantAndShipper}
        />
      </>
    </Admin>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  if (!session || session.user.role !== "ADMIN") {
    return {
      notFound: true,
    };
  }

  const [pendingRestaurant, pendingShipper] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        approved: "PENDING",
      },
      include: {
        cuisine: true,
        user: true,
      },
    }),
    prisma.shipper.findMany({
      where: {
        approved: "PENDING",
      },
      include: {
        user: true,
      },
    }),
  ]);

  const pendingRestaurantAndShipper = [
    ...pendingRestaurant.map((restaurant) => ({
      type: "restaurant" as const,
      data: restaurant,
    })),
    ...pendingShipper.map((shipper) => ({
      type: "shipper" as const,
      data: shipper,
    })),
  ].sort((a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime());

  return {
    props: {
      pendingRestaurantAndShipper,
    },
  };
};

export default Requests;
