import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  restaurantProtectedProcedure,
} from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  getPlacedAndPreparingOrders: publicProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        restaurant: {
          userId: ctx.session?.user.id || "",
        },
        status: {
          in: ["PLACED", "PREPARING"],
        },
      },
      include: {
        user: true,
        orderFood: true,
      },
    });
    return orders;
  }),
  prepareOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.updateMany({
        where: {
          id: input.orderId,
          restaurant: {
            userId: ctx.session?.user.id || "",
          },
        },
        data: {
          status: "PREPARING",
        },
      });
      return order;
    }),
  restaurantRejectOrder: restaurantProtectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          status: "REJECTED_BY_RESTAURANT",
        },
      });
      await ctx.stripe.refunds.create({
        payment_intent: order.paymentIntentId,
      });
      return order;
    }),
  restaurantReadyOrder: publicProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.updateMany({
        where: {
          id: input.orderId,
          restaurant: {
            userId: ctx.session?.user.id || "",
          },
        },
        data: {
          shipperId: "abc",
          status: "READY_FOR_PICKUP",
        },
      });
      return order;
    }),
  getRestaurantCompletedOrders: publicProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        restaurant: {
          userId: ctx.session?.user.id || "",
        },
        status: {
          in: ["DELIVERING", "DELIVERED", "REJECTED_BY_SHIPPER"],
        },
      },
      include: {
        user: true,
        orderFood: true,
      },
    });
    return orders;
  }),
  GetRestaurantCancelledOrders: publicProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        restaurant: {
          userId: ctx.session?.user.id || "",
        },
        status: {
          in: ["REJECTED_BY_RESTAURANT"],
        },
      },
      include: {
        user: true,
        orderFood: true,
      },
    });
    return orders;
  }),
});
