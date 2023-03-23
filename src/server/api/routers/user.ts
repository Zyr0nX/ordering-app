import { z } from "zod";
import { protectedProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  favoriteRestaurant: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.favorite.create({
        data: {
          userId: ctx.session.user.id,
          restaurantId: input.restaurantId,
        },
      });
    }),
  unfavoriteRestaurant: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.favorite.delete({
        where: {
          userId_restaurantId: {
            userId: ctx.session.user.id,
            restaurantId: input.restaurantId,
          },
        },
      });
    }),
});
