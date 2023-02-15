import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const foodRouter = router({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string(),
        calories: z.number(),
        image: z.string(),
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
          image: input.image,
          restaurantId: input.restaurantId,
        },
      });
    }),
  getByRestaurantId: publicProcedure
    .input(z.object({ restaurantId: z.string().cuid() }))
    .query(async ({ input }) => {
      const prisma = new PrismaClient();
      const food = await prisma.food.findMany({
        where: {
          restaurantId: input.restaurantId,
        },
      });
      return food;
    }),
});
