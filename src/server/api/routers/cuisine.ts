import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cuisineRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.cuisine.findMany();
  }),
});
