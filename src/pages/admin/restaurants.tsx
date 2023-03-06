import {
  type GetServerSidePropsContext,
  type NextPage,
  type InferGetServerSidePropsType,
} from "next";
import React from "react";
import Admin from "~/components/layouts/Admin";
import AdminCommonHeader from "~/components/ui/AdminCommonHeader";
import AdminRestaurantsBody from "~/components/ui/AdminRestaurantsBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Index: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ restaurant, restaurantType }) => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Restaurants" />
        <AdminRestaurantsBody
          restaurant={restaurant}
          restaurantType={restaurantType}
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
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const restaurant = await prisma.restaurant.findMany({
    where: {
      approved: "APPROVED",
    },
    include: {
      restaurantType: true,
      user: true,
    },
  });

  const restaurantType = await prisma.restaurantType.findMany();

  return {
    props: {
      restaurant,
      restaurantType,
    },
  };
};

export default Index;
