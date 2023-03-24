import { type InferGetServerSidePropsType, type NextPage } from "next";
import React from "react";
import RestaurantDetailBody from "~/components/ui/RestaurantDetailBody";
import RestaurantDetailHeader from "~/components/ui/RestaurantDetailHeader";
import { prisma } from "~/server/db";


const RestarantDetail: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ restaurant, food, rating }) => {
  return (
    <>
      <RestaurantDetailHeader restaurant={restaurant} rating={rating} />
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


  const [restaurant, food, rating] = await Promise.all([
    //get restaurant rating by restaurantRating
    prisma.restaurant.findUnique({
      where: {
        id,
      },
    }),
    prisma.food.findMany({
      where: {
        restaurantId: id,
      },
      include: {
        foodOption: {
          include: {
            foodOptionItem: true,
          },
        },
      },
    }),
    prisma.order.aggregate({
      _avg: {
        restaurantRating: true,
      },
      where: {
        restaurantId: id,
      },
    }),
  ]);

  return {
    props: {
      restaurant,
      food,
      rating: rating._avg.restaurantRating,
    },
  };
};