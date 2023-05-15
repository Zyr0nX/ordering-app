import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  shipperProtectedProcedure,
} from "~/server/api/trpc";

export const shipperRouter = createTRPCRouter({
  registration: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date(),
        identificationNumber: z.string(),
        licensePlate: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
        },
        create: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
          userId: ctx.session.user.id,
        },
      });
    }),
  updateLocation: shipperProtectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          shipperLocation: {
            upsert: {
              update: {
                latitude: input.latitude,
                longitude: input.longitude,
              },
              create: {
                latitude: input.latitude,
                longitude: input.longitude,
              },
            },
          },
        },
      });
    }),
  getInfomation: shipperProtectedProcedure.query(async ({ ctx }) => {
    const shipper = await ctx.prisma.shipper.findUnique({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        shipperLocation: true,
      },
    });
    if (!shipper) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shipper not found",
      });
    }
    return shipper;
  }),
  update: shipperProtectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date(),
        identificationNumber: z.string(),
        licensePlate: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
        },
      });
    }),
  getStats: shipperProtectedProcedure.query(async ({ ctx }) => {
    const [totalRevenue, totalOrders, status] = await Promise.all([
      ctx.prisma.order.findMany({
        where: {
          status: "DELIVERED",
          shipperId: ctx.session.user.id,
        },
        select: {
          shippingFee: true,
          orderFood: {
            select: {
              price: true,
              quantity: true,
            },
          },
        },
      }), // total revenue
      ctx.prisma.order.count({
        where: {
          shipperId: ctx.session.user.id,
          status: "DELIVERED",
        },
      }),
      ctx.prisma.shipper.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          approved: true,
        },
      }),
    ]);
    return {
      totalRevenue: totalRevenue.reduce(
        (acc, order) => acc + order.shippingFee,
        0
      ),
      totalOrders,
      status: status?.approved !== "DISABLED",
    };
  }),
});
