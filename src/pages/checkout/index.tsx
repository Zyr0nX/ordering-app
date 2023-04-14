import {
  type InferGetServerSidePropsType,
  type GetServerSidePropsContext,
  type NextPage,
} from "next";
import React from "react";
import Guest from "~/components/layouts/Guest";
import CheckoutBody from "~/components/ui/CheckoutBody";
import GuestCommonHeader from "~/components/ui/GuestCommonHeader";
import { env } from "~/env.mjs";
import { getServerAuthSession } from "~/server/auth";
import { redis } from "~/server/cache";
import { prisma } from "~/server/db";
import { maps } from "~/server/maps";

const Checkout: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ user, country, distance }) => {
  return (
    <Guest>
      <>
        <GuestCommonHeader text="Checkout" />
        <CheckoutBody user={user} country={country} distance={distance} />
      </>
    </Guest>
  );
};

export default Checkout;

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

  const { id, country } = context.query;

  if (!id) {
    return {
      notFound: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id || "",
    },
    include: {
      cartItem: {
        where: {
          food: {
            restaurantId: id as string,
          },
        },
        include: {
          food: {
            include: {
              restaurant: true,
            },
          },
          foodOption: true,
        },
      },
    },
  });

  if (!user || !user.cartItem[0]) {
    
    return {
      notFound: true,
    };
  }

  if (!user.latitude || !user.longitude) {
    return {
      props: {
        user,
        country: country as string,
      },
    };
  }
  let distance;
  const restaurant = user.cartItem[0].food.restaurant;
  const cached = await redis.get(
    `placeAutocomplete?query=${restaurant.latitude},${restaurant.longitude},${user.latitude},${user.longitude}`
  );

  if (cached === "notFound") {
    return {
      notFound: true,
    };
  }

  if (cached) {
    distance = cached as number;
  } else {
    const distanceMatrix = await maps.distancematrix({
      params: {
        origins: [
          {
            lat: restaurant.latitude,
            lng: restaurant.longitude,
          },
        ],
        destinations: [
          {
            lat: user.latitude,
            lng: user.longitude,
          },
        ],
        key: env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (
      distanceMatrix.data.status !== "OK" ||
      distanceMatrix.data.rows[0]?.elements[0]?.status !== "OK"
    ) {
      await redis.set(
        `placeAutocomplete?query=${restaurant.latitude},${restaurant.longitude},${user.latitude},${user.longitude}`,
        "notFound",
        { ex: 60 * 60 * 24 * 365 }
      );
      return {
        notFound: true,
      };
    }

    await redis.set(
      `placeAutocomplete?query=${restaurant.latitude},${restaurant.longitude},${user.latitude},${user.longitude}`,
      distanceMatrix.data.rows[0]?.elements[0]?.distance.value,
      { ex: 60 * 60 * 24 * 365 }
    );

    distance = distanceMatrix.data.rows[0]?.elements[0]?.distance.value;
  }
  return {
    props: {
      user,
      country: country as string,
      distance: distance,
    },
  };
};
