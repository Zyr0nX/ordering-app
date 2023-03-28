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
          cuisine: {
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
        cuisine: true,
      },
    });
  }),
  editRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
        restaurantName: z.string(),
        address: z.string(),
        additionalAddress: z.string().nullish(),
        firstName: z.string(),
        lastName: z.string(),
        phoneNumber: z.string(),
        cuisineId: z.string().cuid(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.prisma.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          name: input.restaurantName,
          address: input.address,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          cuisineId: input.cuisineId,
          image: input.image,
        },
      });
      return restaurant;
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
          identificationNumber: input.ssn,
          phoneNumber: input.phonenumber,
          avatar: input.avatar,
          dateOfBirth: input.dateofbirth,
        },
        where: {
          id: input.shipperId,
        },
      });
    }),
  getUsers: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany();
  }),
  editUser: adminProtectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        name: z.string(),
        image: z.string().url().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.user.update({
        data: {
          name: input.name,
          image: input.image,
        },
        where: {
          id: input.userId,
        },
      });
    }),
});