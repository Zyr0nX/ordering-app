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
        name: z.string(),
        address: z.string(),
        additionaladdress: z.string().optional(),
        firstname: z.string(),
        lastname: z.string(),
        email: z.string().email(),
        phonenumber: z
          .string()
          .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g),
        restaurantTypeId: z.string().cuid().optional(),
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
          email: input.email,
          phoneNumber: input.phonenumber,
          userId: ctx.session?.user?.id,
          restaurantTypeId: input.restaurantTypeId,
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
        email: z.string().email(),
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
          email: input.email,
          phoneNumber: input.phonenumber,
          userId: ctx.session?.user?.id as string,
          restaurantTypeId: input.restaurantTypeId,
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
        email: z.string().email(),
        phonenumber: z.string(),
        userId: z.string().cuid(),
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
          email: input.email,
          phoneNumber: input.phonenumber,
          userId: input.userId,
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
        brandImage: true,
        restaurantType: {
          select: {
            name: true,
          },
        },
      },
    });
    return restaurants;
  }),
});
