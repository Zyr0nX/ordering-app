import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
  addItems: publicProcedure
    .input(
      z.object({
        foodId: z.string().cuid(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(ctx.session?.user?.id);
      await ctx.prisma.cart.create({
        data: {
          foodId: input.foodId,
          quantity: input.quantity,
          userId: ctx.session?.user?.id as string,
        },
      });
    }),
  getItems: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.cart.findMany({
      where: {
        userId: ctx.session?.user?.id as string,
      },
    });
  }),
  deleteItem: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cart.delete({
        where: {
          id: input.id,
        },
      });
    }),
  updateItem: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cart.update({
        where: {
          id: input.id,
        },
        data: {
          quantity: input.quantity,
        },
      });
    }),
});
