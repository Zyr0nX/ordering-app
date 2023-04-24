import { adminProtectedProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cuisineRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.cuisine.findMany({
      select: {
        id: true,
        name: true,
        image: true,
      },
    });
  }),
  getAllIncludingRestaurants: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.cuisine.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            restaurant: true,
          },
        },
      },
    });
  }),
});
