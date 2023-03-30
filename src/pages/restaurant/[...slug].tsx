import {
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
import React from "react";
import RestaurantDetailBody from "~/components/ui/RestaurantDetailBody";
import RestaurantDetailHeader from "~/components/ui/RestaurantDetailHeader";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import haversine from "~/utils/haversine";

const RestarantDetail: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ restaurant, food, rating, distance }) => {
  return (
    <>
      <RestaurantDetailHeader
        restaurant={restaurant}
        rating={rating}
        distance={distance}
      />
      <RestaurantDetailBody food={food} />
    </>
  );
};

export default RestarantDetail;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);
  if (!context.query.slug || !context.query.slug[1]) {
    return {
      notFound: true,
    };
  }

  const id = context.query.slug[1];

  if (!session) {
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

    if (!restaurant) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        restaurant,
        food,
        rating: rating._avg.restaurantRating,
        distance: null,
      },
    };
  }

  const [restaurant, food, rating, user] = await Promise.all([
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
    prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    }),
  ]);

  if (!user) {
    context.res.statusCode = 500;
    return {
      notFound: true,
    };
  }

  if (
    !user.address ||
    !user.phoneNumber ||
    !user.addressId ||
    !user.latitude ||
    !user.longitude
  ) {
    return {
      redirect: {
        destination: "/account/information",
        permanent: false,
      },
    };
  }

  if (!restaurant) {
    return {
      notFound: true,
    };
  }

  const distance = haversine(
    restaurant.latitude,
    restaurant.longitude,
    user.latitude,
    user.longitude
  );

  return {
    props: {
      restaurant,
      food,
      rating: rating._avg.restaurantRating,
      distance,
    },
  };
};
