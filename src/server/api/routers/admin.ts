import { z } from "zod";
import { adminProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  approveRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.update({
        data: {
          approved: "APPROVED",
        },
        where: {
          id: input.restaurantId,
        },
      });
    }),
  rejectRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.update({
        data: {
          approved: "REJECTED",
        },
        where: {
          id: input.restaurantId,
        },
      });
    }),
  getPendingRestaurantRequests: adminProtectedProcedure.query(
    async ({ ctx }) => {
      return await ctx.prisma.restaurant.findMany({
        where: {
          approved: "PENDING",
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          restaurantType: {
            select: {
              name: true,
            },
          },
        },
      });
    }
  ),
  getApprovedRestaurants: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        user: true,
        restaurantType: true,
      },
    });
  }),
  editRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
        name: z.string(),
        address: z.string(),
        additionaladdress: z.string().nullish(),
        firstname: z.string(),
        lastname: z.string(),
        phonenumber: z.string(),
        restaurantTypeId: z.string().cuid(),
        brandImage: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.update({
        data: {
          name: input.name,
          address: input.address,
          additionalAddress: input.additionaladdress,
          firstName: input.firstname,
          lastName: input.lastname,
          phoneNumber: input.phonenumber,
          restaurantTypeId: input.restaurantTypeId,
          brandImage: input.brandImage,
        },
        where: {
          id: input.restaurantId,
        },
      });
    }),
  getApprovedShippers: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.shipper.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        user: true,
      },
    });
  }),
  rejectShipper: adminProtectedProcedure
    .input(
      z.object({
        shipperId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        data: {
          approved: "REJECTED",
        },
        where: {
          id: input.shipperId,
        },
      });
    }),

  editShipper: adminProtectedProcedure
    
    .input(
      z.object({
        shipperId: z.string().cuid(),
        firstname: z.string(),
        lastname: z.string(),
        ssn: z.string(),
        phonenumber: z.string(),
        avatar: z.string().url().nullable(),
        dateofbirth: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        data: {
          firstName: input.firstname,
          lastName: input.lastname,
          ssn: input.ssn,
          phone: input.phonenumber,
          avatar: input.avatar,
          dateOfBirth: input.dateofbirth,
        },
        where: {
          id: input.shipperId,
        },
      });
    }
  ),
});
