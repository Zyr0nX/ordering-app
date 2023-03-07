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
  addToCart: protectedProcedure
    .input(
      z.object({
        foodId: z.string().cuid(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cart.create({
        data: {
          userId: ctx.session.user.id,
          foodId: input.foodId,
          quantity: input.quantity,
        },
      });
    }),
  removeFromCart: protectedProcedure
    .input(
      z.object({
        foodId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cart.delete({
        where: {
          userId_foodId: {
            userId: ctx.session.user.id,
            foodId: input.foodId,
          },
        },
      });
    }),
});
