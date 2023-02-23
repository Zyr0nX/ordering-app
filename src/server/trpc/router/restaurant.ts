import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const restaurantRouter = router({
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
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient();
      await prisma.restaurant.update({
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
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient();
      await prisma.restaurant.delete({
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
    .query(async ({ input }) => {
      const prisma = new PrismaClient();
      const restaurant = await prisma.restaurant.findUnique({
        where: {
          id: input.id,
        },
        include: {
          food: true,
        },
      });
      return restaurant;
    }),
  getAll: publicProcedure.query(async () => {
    const prisma = new PrismaClient();
    const restaurants = await prisma.restaurant.findMany();
    return restaurants;
  }),
});
