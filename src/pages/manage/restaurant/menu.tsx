import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import Restaurant from "~/components/layouts/Restaurant";
import ManageRestaurantHeader from "~/components/ui/ManageRestaurantHeader";
import ManageRestaurantMenuBody from "~/components/ui/ManageRestaurantMenuBody";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

const Requests: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ menu }) => {
  return (
    <Restaurant>
      <>
        <ManageRestaurantHeader title="Menu" />
        <ManageRestaurantMenuBody menu={menu} />
      </>
    </Restaurant>
  );
};

export default Requests;

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

  const menu = await prisma.food.findMany({
    where: {
      restaurant: {
        userId: session.user.id,
      },
    },
    include: {
      foodOption: {
        include: {
          foodOptionItem: true,
        },
      },
    },
  });

  return {
    props: {
      menu,
    },
  };
};
