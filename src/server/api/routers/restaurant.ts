import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const restaurantRouter = createTRPCRouter({
  registration: protectedProcedure
    .input(
      z.object({
        restaurantName: z.string(),
        address: z.string(),
        additionalAddress: z.string().nullish(),
        firstName: z.string(),
        lastName: z.string(),
        phoneNumber: z.string(),
        cuisineId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          name: input.restaurantName,
          address: input.address,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          cuisineId: input.cuisineId,
        },
        create: {
          name: input.restaurantName,
          address: input.address,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          userId: ctx.session.user.id,
          cuisineId: input.cuisineId,
        },
      });
    }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
        additionaladdress: z.string().nullish(),
        firstname: z.string(),
        lastname: z.string(),
        phonenumber: z.string(),
        userId: z.string().cuid(),
        restaurantTypeId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.create({
        data: {
          name: input.name,
          address: input.address,
          additionalAddress: input.additionaladdress,
          firstName: input.firstname,
          lastName: input.lastname,
          phoneNumber: input.phonenumber,
          userId: ctx.session?.user?.id as string,
          cuisineId: input.restaurantTypeId,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string(),
        address: z.string(),
        additionaladdress: z.string().nullish(),
        firstname: z.string(),
        lastname: z.string(),
        phonenumber: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.restaurant.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          address: input.address,
          additionalAddress: input.additionaladdress,
          firstName: input.firstname,
          lastName: input.lastname,
          phoneNumber: input.phonenumber,
        },
      });
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.restaurant.delete({
        where: {
          id: input.id,
        },
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const restaurant = await ctx.prisma.restaurant.findUnique({
        where: {
          id: input.id,
        },
        include: {
          food: true,
        },
      });
      return restaurant;
    }),
  getAllApproved: publicProcedure.query(async ({ ctx }) => {
    const restaurants = await ctx.prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        address: true,
        image: true,
        cuisine: {
          select: {
            name: true,
          },
        },
      },
    });
    return restaurants;
  }),
  getRestaurantForUser: publicProcedure.query(async ({ ctx }) => {
    const restaurants = await ctx.prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        favorite: {
          where: {
            userId: ctx.session?.user.id || "",
          },
        },
      },
    });
    return restaurants;
  }),
});
