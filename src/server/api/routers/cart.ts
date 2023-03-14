import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
  addItems: publicProcedure
    .input(
      z.object({
        foodId: z.string().cuid(),
        foodOptionids: z.array(z.string().cuid()),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existCartItem = await ctx.prisma.cartItem.findFirst({
        where: {
          foodId: input.foodId,
          foodOption: {
            every: {
              id: {
                in: input.foodOptionids,
              },
            },
          },
        },
      });

      if (existCartItem) {
        await ctx.prisma.cartItem.update({
          where: {
            id: existCartItem.id,
          },
          data: {
            quantity: {
              increment: input.quantity,
            },
          },
        });
      } else {
        await ctx.prisma.cartItem.create({
          data: {
            foodId: input.foodId,
            foodOption: {
              connect: input.foodOptionids.map((id) => ({ id })),
            },
            quantity: input.quantity,
            userId: ctx.session?.user?.id as string,
          },
        });
      }
    }),
  updateItemQuantity: publicProcedure
    .input(
      z.object({
        cartItemId: z.string().cuid(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cartItem.update({
        where: {
          id: input.cartItemId,
        },
        data: {
          quantity: input.quantity,
        },
      });
    }),
  removeItem: publicProcedure
    .input(
      z.object({
        cartItemId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cartItem.delete({
        where: {
          id: input.cartItemId,
        },
      });
    }),
  removeItems: publicProcedure
    .input(
      z.object({
        cartItemIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.cartItem.deleteMany({
        where: {
          id: {
            in: input.cartItemIds,
          },
        },
      });
    }),
});
