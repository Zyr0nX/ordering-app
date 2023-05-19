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
        select: {
          id: true,
          status: true,
          orderFood: {
            select: {
              id: true,
              quantity: true,
              price: true,
              foodName: true,
              foodOption: true,
            },
          },
          user: {
            select: {
              name: true,
              address: true,
              phoneNumber: true,
            },
          },
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
          status: true,
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
      if (query.status !== "PLACED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order is not in placed status",
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
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to update order",
        });
      }
    }),
  restaurantRejectOrder: restaurantProtectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
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
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (ctx.session?.user.id !== order.restaurant.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not the owner of this restaurant",
        });
      }

      if (order.user.email) {
        await Promise.all([
          ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              status: "REJECTED_BY_RESTAURANT",
              restaurantCancelReason: input.reason,
            },
          }),
          ctx.nodemailer.sendMail({
            from: env.EMAIL_FROM,
            to: order.user.email,
            subject: "Your order has been rejected",
            text: `Your order has been rejected by the restaurant for the following reason: ${input.reason}`,
          }),
          ctx.stripe.refunds.create({
            payment_intent: order.paymentIntentId,
          }),
        ]);
        return;
      }
      await Promise.all([
        ctx.prisma.order.update({
          where: {
            id: input.orderId,
          },
          data: {
            status: "REJECTED_BY_RESTAURANT",
            restaurantCancelReason: input.reason,
          },
        }),
        ctx.stripe.refunds.create({
          payment_intent: order.paymentIntentId,
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
          status: query.shipperId ? "DELIVERING" : "READY_FOR_PICKUP",
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
  getShipperInProgressOrders: shipperProtectedProcedure.query(
    async ({ ctx }) => {
      const order = await ctx.prisma.order.findFirst({
        where: {
          status: {
            notIn: [
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
  shipperCompleteOrder: shipperProtectedProcedure
    .input(
      z.object({
        orderId: z.number().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.orderId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing orderId",
        });
      }
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          shipper: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!order || order.shipper?.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not the shipper of this order",
        });
      }

      await ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          status: "DELIVERED",
        },
      });
    }),
  shipperRejectOrder: shipperProtectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
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
          restaurant: {
            select: {
              latitude: true,
              longitude: true,
            },
          },
        },
      });
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (ctx.session.user.id !== order.shipper?.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not authorized to reject this order",
        });
      }

      let timesRun = 0;
      const intervalId = setIntervalAsync(async () => {
        timesRun += 1;
        // stop after 360 times (1 hour)
        if (timesRun >= 360) {
          if (order.user.email) {
            await Promise.all([
              ctx.prisma.order.update({
                where: {
                  id: input.orderId,
                },
                data: {
                  status: "REJECTED_BY_SHIPPER",
                },
              }),
              ctx.stripe.refunds.create({
                payment_intent: order.paymentIntentId,
              }),
              ctx.nodemailer.sendMail({
                from: env.EMAIL_FROM,
                to: order.user.email,
                subject: "Your order has been rejected",
                text: `Your order has been rejected because we can not find a shipper`,
              }),
            ]);
            await clearIntervalAsync(intervalId);
          }
          await Promise.all([
            ctx.prisma.order.update({
              where: {
                id: input.orderId,
              },
              data: {
                status: "REJECTED_BY_SHIPPER",
              },
            }),
            ctx.stripe.refunds.create({
              payment_intent: order.paymentIntentId,
            }),
          ]);
          await clearIntervalAsync(intervalId);
        }

        const onlineShippers = await ctx.prisma.shipper.findMany({
          where: {
            approved: "APPROVED",
            shipperLocation: {
              updatedAt: {
                gte: new Date(new Date().getTime() - 1000 * 60),
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
          select: {
            id: true,
            shipperLocation: {
              select: {
                latitude: true,
                longitude: true,
              },
            },
          },
        });

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
              order.restaurant.latitude,
              order.restaurant.longitude,
              prev.shipperLocation.latitude,
              prev.shipperLocation.longitude
            ) >
            haversine(
              order.restaurant.latitude,
              order.restaurant.longitude,
              curr.shipperLocation.latitude,
              curr.shipperLocation.longitude
            )
          )
            return curr;
          return prev;
        });

        const orderPresent = await ctx.prisma.order.findUnique({
          where: {
            id: input.orderId,
          },
          select: {
            status: true,
          },
        });

        if (!orderPresent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Order not found",
          });
        }

        await ctx.prisma.order.update({
          where: {
            id: input.orderId,
          },
          data: {
            shipperId: nearestShipper.id,
            status:
              orderPresent.status === "READY_FOR_PICKUP"
                ? "DELIVERING"
                : undefined,
          },
        });
        await clearIntervalAsync(intervalId);
      }, 10000);

      if (order.user.email) {
        await Promise.all([
          ctx.prisma.order.update({
            where: {
              id: input.orderId,
            },
            data: {
              shipperId: null,
              status: "READY_FOR_PICKUP",
            },
          }),
          ctx.nodemailer.sendMail({
            from: env.EMAIL_FROM,
            to: order.user.email,
            subject: "Your order has been rejected",
            text: `Your order has been rejected by the shipper for the following reason: ${input.reason}, we will find you another shipper soon`,
          }),
        ]);
        return;
      }
      await Promise.all([
        ctx.prisma.order.update({
          where: {
            id: input.orderId,
          },
          data: {
            status: "READY_FOR_PICKUP",
          },
        }),
      ]);
      return;
    }),
  getRestaurantOrderHistory: restaurantProtectedProcedure.query(
    async ({ ctx }) => {
      const orders = await ctx.prisma.order.findMany({
        where: {
          restaurant: {
            userId: ctx.session.user.id,
          },
          status: {
            notIn: ["PLACED", "PREPARING", "READY_FOR_PICKUP"],
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
  getShipperOrderHistory: shipperProtectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        shipper: {
          userId: ctx.session.user.id,
        },
        status: {
          in: ["DELIVERED"],
        },
      },
      include: {
        user: true,
        orderFood: true,
      },
    });
    return orders;
  }),
  getOrderHistoryForUser: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      select: {
        orderFood: {
          select: {
            id: true,
            foodName: true,
            foodOption: true,
            price: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            address: true,
            image: true,
          },
        },
        id: true,
        status: true,
        shippingFee: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  }),
  getOrderByUser: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          orderFood: {
            select: {
              id: true,
              foodName: true,
              foodOption: true,
              price: true,
              quantity: true,
            },
          },
          restaurant: {
            select: {
              name: true,
            },
          },
          shipper: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          userId: true,
          restaurantAddress: true,
          shippingFee: true,
          status: true,
          restaurantRating: true,
          shipperRating: true,
          createdAt: true,
        },
      });
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (order.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not authorized to view this order",
        });
      }
      return order;
    }),
  rateOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        restaurantRating: z.number().min(1).max(5),
        shipperRating: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: {
          id: input.orderId,
        },
        select: {
          status: true,
          userId: true,
        },
      });
      if (!order) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Order not found",
        });
      }
      if (order.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not authorized to rate this order",
        });
      }
      if (order.status !== "DELIVERED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only rate an order after it has been delivered",
        });
      }
      await ctx.prisma.order.update({
        where: {
          id: input.orderId,
        },
        data: {
          restaurantRating: input.restaurantRating,
          shipperRating: input.shipperRating,
        },
      });
    }),
});
