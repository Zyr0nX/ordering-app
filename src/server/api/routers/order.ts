import { TRPCError } from "@trpc/server";
import { env } from "process";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  restaurantProtectedProcedure,
} from "~/server/api/trpc";
import { transporter } from "~/server/email";
import haversine from "~/utils/haversine";

export const orderRouter = createTRPCRouter({
  getPlacedAndPreparingOrders: restaurantProtectedProcedure.query(
    async ({ ctx }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          restaurant: {
            userId: ctx.session.user.id,
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
    }
  ),
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
          shipperId: true,
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
      const order = await ctx.prisma.order.update({
        where: {
          id: input.orderId,
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
  findShipper: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      const intervalId = setIntervalAsync(async () => {
        const [onlineShippers, order] = await Promise.all([
          ctx.prisma.shipper.findMany({
            where: {
              shipperLocation: {
                updatedAt: {
                  gte: new Date(new Date().getTime() - 1000 * 60 * 5),
                },
              },
              order: {
                every: {
                  status: {
                    in: ["DELIVERED"],
                  },
                },
              },
            },
            include: {
              shipperLocation: true,
            },
          }),
          ctx.prisma.order.findUnique({
            where: {
              id: input.orderId,
            },
            select: {
              restaurant: {
                select: {
                  latitude: true,
                  longitude: true,
                },
              },
            },
          }),
        ]);

        if (!order) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order not found",
          });
        }
        if (!onlineShippers.length) {
          return;
        }

        const nearestShipper = onlineShippers.reduce((prev, curr) => {
          if (!prev.shipperLocation) return curr;
          if (!curr.shipperLocation) return prev;

          if (
            haversine(
              order?.restaurant.latitude,
              order?.restaurant.longitude,
              prev?.shipperLocation?.latitude,
              prev.shipperLocation?.longitude
            ) >
            haversine(
              order?.restaurant.latitude,
              order?.restaurant.longitude,
              curr?.shipperLocation?.latitude,
              curr.shipperLocation?.longitude
            )
          )
            return curr;
          return prev;
        });

        await Promise.all([
          ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              shipperId: nearestShipper.id,
              status: "DELIVERING",
            },
          }),
          clearIntervalAsync(intervalId),
        ]);
      }, 10000);
    }),
});
