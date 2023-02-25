import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
  approveRestaurant: publicProcedure
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
  rejectRestaurant: publicProcedure
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
  getRestaurants: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.restaurant.findMany({
      where: {
        approved: "PENDING",
      },
    });
  }),
});
