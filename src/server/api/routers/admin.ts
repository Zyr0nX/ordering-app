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
        email: z.string().email(),
        phonenumber: z.string(),
        userId: z.string().cuid(),
        restaurantTypeId: z.string().cuid(),
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
          email: input.email,
          phoneNumber: input.phonenumber,
          userId: input.userId,
          restaurantTypeId: input.restaurantTypeId,
        },
        where: {
          id: input.restaurantId,
        },
      });
    }),
});
