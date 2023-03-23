import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cuisineRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.cuisine.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
