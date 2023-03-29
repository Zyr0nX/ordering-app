import { TRPCError } from "@trpc/server";
import { env } from "process";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  restaurantProtectedProcedure,
} from "~/server/api/trpc";
import { transporter } from "~/server/email";

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
  prepareOrder: restaurantProtectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          restaurant: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!query) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (ctx.session.user.id !== query.restaurant.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not the owner of this restaurant",
        });
      }

      const order = await ctx.prisma.order.updateMany({
        where: {
          id: input.orderId,
          restaurant: {
            userId: ctx.session.user.id,
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
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          restaurant: {
            select: {
              userId: true,
            },
          },
          paymentIntentId: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      if (!query) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (ctx.session?.user.id !== query.restaurant.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not the owner of this restaurant",
        });
      }

      if (query.user.email) {
        const [order] = await Promise.all([
          ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              status: "REJECTED_BY_RESTAURANT",
            },
          }),
          transporter.sendMail({
            from: env.EMAIL_FROM,
            to: query.user.email,
            subject: "Your order has been rejected",
            text: `Your order has been rejected by the restaurant for the following reason: ${input.reason}`,
          }),
          ctx.stripe.refunds.create({
            payment_intent: query.paymentIntentId,
          }),
        ]);
        return order;
      }
      const [order] = await Promise.all([
        ctx.prisma.order.update({
          where: {
            id: input.orderId,
          },
          data: {
            status: "REJECTED_BY_RESTAURANT",
          },
        }),
        ctx.stripe.refunds.create({
          payment_intent: query.paymentIntentId,
        }),
      ]);
      return order;
    }),
  restaurantReadyOrder: restaurantProtectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const query = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          restaurant: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!query) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (ctx.session.user.id !== query.restaurant.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not the owner of this restaurant",
        });
      }

      const order = await ctx.prisma.order.updateMany({
        where: {
          id: input.orderId,
          restaurant: {
            userId: ctx.session?.user.id || "",
          },
        },
        data: {
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
