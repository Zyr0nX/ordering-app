import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getOrCreateStripeCustomerIdForUser } from "~/server/stripe/stripe-webhook-handlers";

const baseUrl =
  env.NODE_ENV === "development" ? "http://localhost:3000" : env.SITE_URL;

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, prisma } = ctx;

      const [customerId, user, restaurant, items] = await Promise.all([
        getOrCreateStripeCustomerIdForUser({
          prisma,
          stripe,
          userId: session.user?.id,
        }),
        prisma.user.findUnique({
          where: {
            id: session.user?.id,
          },
        }),
        prisma.restaurant.findUnique({
          where: {
            id: input.restaurantId,
          },
        }),
        prisma.cartItem.findMany({
          where: {
            userId: session.user?.id,
            food: {
              restaurantId: input.restaurantId,
            },
          },
          include: {
            food: true,
            foodOption: true,
          },
        }),
      ]);

      items.forEach((item) => {
        if (item.food.quantity < item.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Food item quantity is not available",
          });
        }
      });

      if (!customerId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create Stripe customer",
        });
      }

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not find user",
        });
      }

      if (!restaurant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Restaurant does not exist",
        });
      }

      if (
        !user.address ||
        !user.addressId ||
        !user.phoneNumber ||
        !user.name ||
        !user.latitude ||
        !user.longitude
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is missing required information",
        });
      }

      let distance: number | undefined;

      const cached = await ctx.redis.get(
        `distanceMatrix?origins=[${restaurant.latitude},${restaurant.longitude}],&destinations=[${user.latitude},${user.longitude}]}]`
      );
      if (cached) {
        distance = cached as number;
      } else {
        const distanceMatrix = await ctx.maps.distancematrix({
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

        if (distanceMatrix.data.status !== "OK") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not calculate distance",
          });
        }

        await ctx.redis.set(
          `distanceMatrix?origins=[${restaurant.latitude},${restaurant.longitude}],&destinations=[${user.latitude},${user.longitude}]}]`,
          distanceMatrix.data.rows[0]?.elements[0]?.distance.value,
          { ex: 60 * 60 * 24 * 365 }
        );

        distance = distanceMatrix.data.rows[0]?.elements[0]?.distance.value;
      }

      if (!distance) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not calculate distance",
        });
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        metadata: {
          restaurantId: input.restaurantId,
          deliveryAddress: user.address,
        },
        customer: customerId,
        client_reference_id: session.user?.id,
        payment_method_types: ["card"],
        mode: "payment",
        line_items: items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.food.name,
              description: item.foodOption
                .map((option) => option.name)
                .join(", ")
                ? item.foodOption.map((option) => option.name).join(", ")
                : undefined,
              images: item.food.image ? [item.food.image] : undefined,
              metadata: {
                foodId: item.foodId,
              },
            },
            unit_amount: parseInt(
              (
                (item.food.price +
                  item.foodOption.reduce(
                    (acc, option) => acc + option.price,
                    0
                  )) *
                100
              ).toFixed(0)
            ),
          },
          quantity: item.quantity,
        })),
        shipping_options: [
          {
            shipping_rate_data: {
              display_name: "Shipping fee",
              type: "fixed_amount",
              fixed_amount: {
                amount: Math.max(Math.round(distance / 500) / 2, 5) * 100,
                currency: "usd",
              },
            },
          },
        ],
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout?id=${input.restaurantId}`,
      });

      if (!checkoutSession) {
        throw new Error("Could not create checkout session");
      }

      return { checkoutUrl: checkoutSession.url };
    }),
  getCheckoutSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { stripe } = ctx;

      const checkoutSession = await stripe.checkout.sessions.retrieve(
        input.sessionId,
        {
          expand: ["payment_intent", "line_items.data.price.product"],
        }
      );
      if (!checkoutSession) {
        throw new Error("Could not find checkout session");
      }
      return checkoutSession;
    }),
  createRestaurantConnectedAccount: protectedProcedure.mutation(
    async ({ ctx }) => {
      const { stripe, prisma } = ctx;

      const restaurant = await prisma.restaurant.findUnique({
        where: {
          userId: ctx.session.user?.id,
        },
      });
      if (!restaurant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Restaurant does not exist",
        });
      }

      const account = await stripe.accounts.create({
        type: "express",
      });

      if (!account) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create Stripe account",
        });
      }

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${baseUrl}/dashboard`,
        return_url: `${baseUrl}/dashboard`,
        type: "account_onboarding",
      });

      return accountLink.url;
    }
  ),
});
