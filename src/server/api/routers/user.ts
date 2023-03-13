import { z } from "zod";
import { protectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  likeRestaurant: protectedProcedure
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
  unlikeRestaurant: protectedProcedure
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
  getLikedRestaurants: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.favorite.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        restaurant: true,
      },
    });
  }),
});
