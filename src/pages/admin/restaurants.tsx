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

const Restaurants: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ restaurants, restaurantTypes }) => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Restaurants" />
        <AdminRestaurantsBody
          restaurants={restaurants}
          restaurantTypes={restaurantTypes}
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

  const restaurants = await prisma.restaurant.findMany({
    where: {
      approved: "APPROVED",
    },
    include: {
      restaurantType: true,
      user: true,
    },
  });

  const restaurantTypes = await prisma.restaurantType.findMany();

  return {
    props: {
      restaurants,
      restaurantTypes,
    },
  };
};

export default Restaurants;
