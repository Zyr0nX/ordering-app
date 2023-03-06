import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const restaurantTypeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.restaurantType.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});
