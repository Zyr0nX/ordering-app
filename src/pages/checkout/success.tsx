import { type GetServerSidePropsContext, type InferGetServerSidePropsType, type NextPage } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import React from "react";
import type Stripe from "stripe";
import { prisma } from "~/server/prisma";
import { stripe } from "~/server/stripe";
import { api } from "~/utils/api";


const Success: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ checkoutSession }) => {
  console.log(checkoutSession)
  const router = useRouter();
  const session_id = router.query.session_id;

  const createOrderMutation = api.order.create.useMutation();

  const handleCreateOrder = async () => {
    await createOrderMutation.mutateAsync({
      items: checkoutSession.line_items?.data.map((item) => ({
        food: (item.price?.product as any).name as string,
        quantity: item.quantity as number,
        foodOption: (item.price?.product as any).description as string,
      })),
      restaurantid: checkoutSession.metadata?.restaurantId as string,
    });
  };
  return null;
};

export default Success;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getServerAuthSession(context);

  const { session_id } = context.query;
  if (!session_id) {
    return {
      notFound: true,
    };
  }
  
  const checkoutSession = await stripe.checkout.sessions.retrieve(
    session_id as string,
    {
      expand: ["payment_intent", "line_items.data.price.product"],
    }
  );

  if (!checkoutSession) {
    return {
      notFound: true,
    };
  }

  await prisma.order.create({
    data: {
      items: checkoutSession.line_items?.data.map((item) => ({
        food: (item.price?.product as any).name as string,
        quantity: item.quantity as number,
        foodOption: (item.price?.product as any).description as string,
      })),
      userId: session?.user.id,
      restaurantId: checkoutSession.metadata?.restaurantId as string,
    },
  });

  return {
    props: {
      checkoutSession,
    },
  };
};