import { type GetServerSidePropsContext, type NextPage } from "next";
import React from "react";
import type Stripe from "stripe";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe";

const Success: NextPage = () => {
  return null;
};

export default Success;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { session_id } = context.query;

  const [session, checkoutSession] = await Promise.all([
    getServerAuthSession(context),
    stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ["payment_intent", "line_items.data.price.product"],
    }),
  ]);

  if (
    !session ||
    !checkoutSession ||
    checkoutSession.payment_status === "unpaid"
  ) {
    return {
      notFound: true,
    };
  }

  const [order] = await Promise.all([
    prisma.order.create({
      data: {
        orderFood: {
          create: checkoutSession.line_items?.data.map((item) => ({
            foodName: (item.price?.product as Stripe.Product).name,
            foodOption:
              (item.price?.product as Stripe.Product).description || "",
            quantity: item.quantity as number,
            price: (item.price?.unit_amount as number) / 100,
          })),
        },
        userId: session?.user.id,
        restaurantId: checkoutSession.metadata?.restaurantId as string,
        shippingFee: 5,
      },
    }),
    prisma.cartItem.deleteMany({
      where: {
        userId: session?.user.id,
        food: {
          restaurant: {
            id: checkoutSession.metadata?.restaurantId as string,
          },
        },
      },
    }),
  ]);

  return {
    redirect: {
      destination: `/order?id=${order.id}`,
      permanent: false,
    },
  };
};