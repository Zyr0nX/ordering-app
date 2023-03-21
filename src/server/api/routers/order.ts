import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  getPlacedAndPreparingOrders: publicProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        restaurant: {
          userId: ctx.session?.user.id,
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
            userId: ctx.session?.user.id,
          },
        },
        data: {
          status: "PREPARING",
        },
      });
      return order;
    }),
  restaurantRejectOrder: publicProcedure
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
            userId: ctx.session?.user.id,
          },
        },
        data: {
          status: "REJECTED_BY_RESTAURANT",
        },
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
            userId: ctx.session?.user.id,
          },
        },
        data: {
          status: "READY_FOR_PICKUP",
        },
      });
      return order;
    }),
});
