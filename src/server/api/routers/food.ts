import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const foodRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string(),
        calories: z.number(),
        image: z.string(),
        restaurantId: z.string().cuid(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.food.create({
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          calories: input.calories,
          image: input.image,
          restaurantId: input.restaurantId,
          quantity: input.quantity,
        },
      });
    }),

  getByRestaurantId: publicProcedure
    .input(z.object({ restaurantId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const food = await ctx.prisma.food.findMany({
        where: {
          restaurantId: input.restaurantId,
        },
      });
      return food;
    }),
});
