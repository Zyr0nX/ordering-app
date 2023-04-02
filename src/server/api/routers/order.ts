import { TRPCError } from "@trpc/server";
import { env } from "process";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  restaurantProtectedProcedure,
  shipperProtectedProcedure,
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

      const order = await ctx.prisma.order.update({
        where: {
          id: input.orderId,
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
      let timesRun = 0;
      const intervalId = setIntervalAsync(async () => {
        timesRun += 1;
        console.log(timesRun);
        // stop after 30 times
        if (timesRun >= 30) {
          const [query] = await Promise.all([
            ctx.prisma.order.findUnique({
              where: {
                id: input.orderId,
              },
              select: {
                paymentIntentId: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            }),
            ctx.prisma.order.update({
              where: {
                id: input.orderId,
              },
              data: {
                status: "REJECTED_BY_SHIPPER",
              },
            }),
          ]);

          if (!query) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Order not found",
            });
          }

          if (query.user.email) {
            await transporter.sendMail({
              from: env.EMAIL_FROM,
              to: query.user.email,
              subject: "Your order has been rejected",
              text: `Your order has been rejected because we can not find a shipper`,
            });
          }

          await ctx.stripe.refunds.create({
            payment_intent: query.paymentIntentId,
          });
          await clearIntervalAsync(intervalId)
        }
        const [onlineShippers, order] = await Promise.all([
          ctx.prisma.shipper.findMany({
            where: {
              shipperLocation: {
                updatedAt: {
                  gte: new Date(new Date().getTime() - 1000 * 60 * 5),
                },
              },
              user: {
                id: {
                  not: ctx.session.user.id,
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
  getShipperInProgressOrders: shipperProtectedProcedure.query(
    async ({ ctx }) => {
      const order = await ctx.prisma.order.findFirst({
        where: {
          status: {
            notIn: [
              "PLACED",
              "REJECTED_BY_RESTAURANT",
              "REJECTED_BY_SHIPPER",
              "DELIVERED",
            ],
          },
          shipper: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          user: true,
          orderFood: true,
          restaurant: true,
        },
      });
      return order;
    }
  ),
  shipperCompleteOrder: shipperProtectedProcedure.mutation(async ({ ctx }) => {
    const order = await ctx.prisma.order.updateMany({
      where: {
        shipperId: ctx.session.user.id,
        status: {
          in: "DELIVERING",
        },
      },
      data: {
        status: "DELIVERED",
      },
    });
    return order;
  }),
  shipperRejectOrder: shipperProtectedProcedure
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
          shipper: {
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
      if (ctx.session?.user.id !== query.shipper?.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not authorized to reject this order",
        });
      }

      if (query.user.email) {
        const [order] = await Promise.all([
          ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              shipperId: null,
              status: "READY_FOR_PICKUP",
            },
          }),
          transporter.sendMail({
            from: env.EMAIL_FROM,
            to: query.user.email,
            subject: "Your order has been rejected",
            text: `Your order has been rejected by the shipper for the following reason: ${input.reason}, we will find you another shipper soon`,
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
            status: "READY_FOR_PICKUP",
          },
        }),
      ]);
      return order;
    }),
  getRestaurantOrderHistory: restaurantProtectedProcedure
    .query(async ({ ctx }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          restaurantId: ctx.session.user.id,
          status: {
            notIn: ["PLACED", "PREPARING", "REJECTED_BY_RESTAURANT", "READY_FOR_PICKUP"],
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
});