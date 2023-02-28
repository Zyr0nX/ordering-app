import { z } from "zod";
import { adminProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  approveRestaurant: adminProtectedProcedure
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
  rejectRestaurant: adminProtectedProcedure
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
  getPendingRestaurantRequests: adminProtectedProcedure.query(
    async ({ ctx }) => {
      return await ctx.prisma.restaurant.findMany({
        where: {
          approved: "PENDING",
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
    }
  ),
});
