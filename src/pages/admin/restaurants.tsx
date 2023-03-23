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
> = ({ restaurants, cuisines }) => {
  return (
    <Admin>
      <>
        <AdminCommonHeader title="Restaurants" />
        <AdminRestaurantsBody restaurants={restaurants} cuisines={cuisines} />
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

  const [restaurants, cuisines] = await Promise.all([
    prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        cuisine: true,
        user: true,
      },
    }),
    prisma.cuisine.findMany(),
  ]);

  return {
    props: {
      restaurants,
      cuisines,
    },
  };
};

export default Restaurants;
