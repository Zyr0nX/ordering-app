import { type InferGetServerSidePropsType, type NextPage } from "next";
import React from "react";
import RestaurantDetailBody from "~/components/ui/RestaurantDetailBody";
import RestaurantDetailHeader from "~/components/ui/RestaurantDetailHeader";
import { prisma } from "~/server/db";

const RestarantDetail: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  restaurant,
  food,
}) => {
  return (
    <>
      <RestaurantDetailHeader restaurant={restaurant} />
      <RestaurantDetailBody food={food} />
    </>
  );
};

export default RestarantDetail;

export const getServerSideProps = async ({
  query,
}: {
  query: { slug: string[] };
}) => {
  const id = query.slug[1];

  if (!id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  const restaurant = await prisma.restaurant.findUnique({
    where: {
      id,
    },
  });

  const food = await prisma.food.findMany({
    where: {
      restaurantId: id,
    },
    include: {
      FoodOption: {
        include: {
          FoodOptionItem: true
        },
      },
    },
  });

  return {
    props: {
      restaurant,
      food,
    },
  };
};
