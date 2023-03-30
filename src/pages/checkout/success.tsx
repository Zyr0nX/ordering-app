import { type GetServerSidePropsContext, type NextPage } from "next";
import type Stripe from "stripe";
import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";
import { stripe } from "~/server/stripe";
import haversine from "~/utils/haversine";

const Success: NextPage = () => {
  return null;
};

export default Success;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  //Retrieve the session_id from the query
  const { session_id } = context.query;
  if (!session_id)
    return {
      notFound: true,
    };
  //Retrieve the session from Stripe
  const [session, checkoutSession] = await Promise.all([
    getServerAuthSession(context),
    stripe.checkout.sessions.retrieve(session_id as string, {
      expand: ["payment_intent", "line_items.data.price.product"],
    }),
  ]);

  if (
    !session ||
    !checkoutSession ||
    !checkoutSession.payment_intent ||
    checkoutSession.payment_status === "unpaid"
  ) {
    return {
      notFound: true,
    };
  }

  //Check if the user is the same as the client_reference_id
  if (session.user.id !== checkoutSession.client_reference_id) {
    context.res.statusCode = 403;
    return {
      notFound: true,
    };
  }

  //Check if the session has a restaurantId
  if (!checkoutSession.metadata?.restaurantId) {
    await stripe.refunds.create({
      payment_intent: checkoutSession.payment_intent as string,
    });
    context.res.statusCode = 500;
    return {
      notFound: true,
    };
  }

  //Find the restaurant and the shipper
  const [restaurant, onlineShippers] = await Promise.all([
    prisma.restaurant.findUnique({
      where: {
        id: checkoutSession.metadata?.restaurantId,
      },
    }),
    prisma.shipper.findMany({
      where: {
        shipperLocation: {
          updatedAt: {
            gte: new Date(new Date().getTime() - 1000 * 60 * 5),
          },
        },
      },
      include: {
        shipperLocation: true,
      },
    }),
  ]);

  //If the restaurant doesn't exist, return 400
  if (!restaurant) {
    await stripe.refunds.create({
      payment_intent: checkoutSession.payment_intent as string,
    });
    context.res.statusCode = 400;
    return {
      notFound: true,
    };
  }

  //If there is no shipper, create the order without a shipper
  if (!onlineShippers.length) {
    //Create the order
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
          restaurantId: checkoutSession.metadata?.restaurantId,
          shippingFee: 5,
          paymentIntentId: (
            checkoutSession.payment_intent as Stripe.PaymentIntent
          ).id,
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
    ]);

    return {
      redirect: {
        destination: `/orders/VP-${order.id}`,
        permanent: false,
      },
    };
  }
  //Find the nearest shipper
  const nearestShipper = onlineShippers.reduce((prev, curr) => {
    if (!prev.shipperLocation) return curr;
    if (!curr.shipperLocation) return prev;

    if (
      haversine(
        restaurant.latitude,
        restaurant.longitude,
        prev.shipperLocation.latitude,
        prev.shipperLocation.longitude
      ) >
      haversine(
        restaurant.latitude,
        restaurant.longitude,
        curr.shipperLocation.latitude,
        curr.shipperLocation.longitude
      )
    )
      return curr;
    return prev;
  });

  console.log(checkoutSession);

  //Create the order
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
        restaurantId: checkoutSession.metadata?.restaurantId,
        shippingFee: 5,
        paymentIntentId: (
          checkoutSession.payment_intent as Stripe.PaymentIntent
        ).id,
        shipperId: nearestShipper.id,
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
  ]);

  return {
    redirect: {
      destination: `/orders/VP-${order.id}`,
      permanent: false,
    },
  };
};
