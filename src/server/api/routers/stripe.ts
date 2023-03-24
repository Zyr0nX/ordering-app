import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getOrCreateStripeCustomerIdForUser } from "~/server/stripe/stripe-webhook-handlers";
import { getBaseUrl } from "~/utils/api";

export const stripeRouter = createTRPCRouter({
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string().cuid(),
            name: z.string(),
            description: z.string(),
            image: z.string().url(),
            amount: z.number(),
            quantity: z.number(),
            price: z.number(),
          })
        ),
        restaurantId: z.string().cuid(),
        deliveryAddress: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe, session, prisma, req } = ctx;

      const customerId = await getOrCreateStripeCustomerIdForUser({
        prisma,
        stripe,
        userId: session.user?.id,
      });

      if (!customerId) {
        throw new Error("Could not create customer");
      }

      const checkoutSession = await stripe.checkout.sessions.create({
        metadata: {
          restaurantId: input.restaurantId,
          deliveryAddress: input.deliveryAddress,
        },
        customer: customerId,
        client_reference_id: session.user?.id,
        payment_method_types: ["card"],
        mode: "payment",
        line_items: input.items.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              description: item.description ? item.description : undefined,
              images: item.image ? [item.image] : undefined,
            },
            unit_amount: parseInt((item.price * 100).toFixed(0)),
          },
          quantity: item.quantity,
        })),
        shipping_options: [
          {
            shipping_rate_data: {
              display_name: "Shipping fee",
              type: "fixed_amount",
              fixed_amount: {
                amount: 500,
                currency: "usd",
              },
            },
          },
        ],
        success_url: `${getBaseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: req.headers.referer,
      });

      if (!checkoutSession) {
        throw new Error("Could not create checkout session");
      }

      return { checkoutUrl: checkoutSession.url };
    }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, session, prisma, req } = ctx;

    const customerId = await getOrCreateStripeCustomerIdForUser({
      prisma,
      stripe,
      userId: session.user?.id,
    });

    if (!customerId) {
      throw new Error("Could not create customer");
    }

    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req.headers.host ?? "localhost:3000"}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const stripeBillingPortalSession =
      await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${baseUrl}/dashboard`,
      });

    if (!stripeBillingPortalSession) {
      throw new Error("Could not create billing portal session");
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
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
});
