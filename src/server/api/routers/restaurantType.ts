import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const restaurantTypeRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.restaurantType.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }),
});