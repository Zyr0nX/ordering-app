import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const restaurantRouter = router({
  sendrestaurantinfo: publicProcedure
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
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient();
      await prisma.restaurant.create({
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
  createFood: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string(),
        calories: z.number(),
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient();
      await prisma.food.create({
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          calories: input.calories,
          image: "",
          restaurantId: input.restaurantId,
        },
      });
    }),
});
