import { Food } from "@prisma/client";
import React from "react";
import RestaurantDetailBody from "~/components/ui/RestaurantDetailBody";
import RestaurantDetailHeader from "~/components/ui/RestaurantDetailHeader";
import { prisma } from "~/server/db";

const RestarantDetail = ({
  restaurant,
  food,
}: {
  restaurant: {
    address: string;
    food: {
      image: string;
      id: string;
      name: string;
      price: number;
    }[];
    id: string;
    name: string;
    brandImage: string | null;
  } | null;
  food: Food[];
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
    select: {
      id: true,
      name: true,
      address: true,
      brandImage: true,
      food: {
        select: {
          id: true,
          name: true,
          price: true,
          image: true,
        },
      },
    },
  });

  const food = await prisma.food.findMany({
    where: {
      restaurantId: id,
    },
  });

  return {
    props: {
      restaurant,
      food,
    },
  };
};
