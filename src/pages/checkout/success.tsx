import { type GetServerSidePropsContext, type NextPage } from "next";
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
  //Retrieve the session_id from the query
  const { session_id } = context.query;
  if (!session_id || Array.isArray(session_id))
    return {
      notFound: true,
    };
  //Retrieve the session from Stripe
  const [session, checkoutSession] = await Promise.all([
    getServerAuthSession(context),
    stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items.data.price.product"],
    }),
  ]);

  if (
    !session ||
    !checkoutSession ||
    !checkoutSession.payment_intent ||
    checkoutSession.payment_status !== "paid"
  ) {
    return {
      notFound: true,
    };
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    checkoutSession.payment_intent as string,
    {
      expand: ["latest_charge"],
    }
  );

  if ((paymentIntent.latest_charge as Stripe.Charge).refunded) {
    return {
      notFound: true,
    };
  }

  //Check if the user is the same as the client_reference_id
  if (session.user.id !== checkoutSession.client_reference_id) {
    await stripe.refunds.create({
      payment_intent: checkoutSession.payment_intent as string,
    });
    context.res.statusCode = 403;
    return {
      notFound: true,
    };
  }

  //Check if the session has a restaurantId
  if (
    !checkoutSession.metadata?.restaurantId ||
    !checkoutSession.line_items ||
    !checkoutSession.shipping_cost
  ) {
    await stripe.refunds.create({
      payment_intent: checkoutSession.payment_intent as string,
    });
    context.res.statusCode = 500;
    return {
      notFound: true,
    };
  }

  //Find the restaurant and the shipper
  const [restaurant, user] = await Promise.all([
    prisma.restaurant.findUnique({
      where: {
        id: checkoutSession.metadata?.restaurantId,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    }),
  ]);

  //If the restaurant doesn't exist, return 400
  if (
    !restaurant ||
    !user ||
    !user.address ||
    !user.addressId ||
    !user.latitude ||
    !user.longitude
  ) {
    await stripe.refunds.create({
      payment_intent: checkoutSession.payment_intent as string,
    });
    context.res.statusCode = 400;
    return {
      notFound: true,
    };
  }
  //Create the order
  const [order] = await Promise.all([
    prisma.order.create({
      data: {
        orderFood: {
          create: checkoutSession.line_items.data.map((item) => ({
            foodName: (item.price?.product as Stripe.Product).name,
            foodOption:
              (item.price?.product as Stripe.Product).description || "",
            quantity: item.quantity as number,
            price: (item.price?.unit_amount as number) / 100,
          })),
        },
        userId: session.user.id,
        userAddress: user.address,
        userAddressId: user.addressId,
        userLatitude: user.latitude,
        userLongitude: user.longitude,
        restaurantId: checkoutSession.metadata?.restaurantId,
        restaurantAddress: restaurant.address,
        restaurantAddressId: restaurant.addressId,
        restaurantLatitude: restaurant.latitude,
        restaurantLongitude: restaurant.longitude,
        shippingFee: checkoutSession.shipping_cost.amount_total / 100,
        paymentIntentId:
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : checkoutSession.payment_intent.id,
      },
    }),
    prisma.cartItem.deleteMany({
      where: {
        userId: session?.user.id,
        food: {
          restaurant: {
            id: checkoutSession.metadata?.restaurantId,
          },
        },
      },
    }),
    checkoutSession.line_items.data.map(async (item) => {
      await prisma.food.update({
        where: {
          id: (item.price?.product as Stripe.Product).metadata?.foodId,
        },
        data: {
          quantity: {
            decrement: item.quantity as number,
          },
        },
      });
    }),
  ]);

  return {
    redirect: {
      destination: `/orders/VP-${order.id}`,
      permanent: false,
    },
  };
};
