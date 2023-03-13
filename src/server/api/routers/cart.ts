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
      const isExist = await ctx.prisma.cartItem.findFirst({
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

      if (isExist) {
        await ctx.prisma.cartItem.update({
          where: {
            id: isExist.id,
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
  // getItems: publicProcedure.query(async ({ ctx }) => {
  //   return await ctx.prisma.cart.findMany({
  //     where: {
  //       userId: ctx.session?.user?.id as string,
  //     },
  //   });
  // }),
  // deleteItem: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string().cuid(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.prisma.cart.delete({
  //       where: {
  //         id: input.id,
  //       },
  //     });
  //   }),
  // updateItem: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string().cuid(),
  //       quantity: z.number(),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.prisma.cart.update({
  //       where: {
  //         id: input.id,
  //       },
  //       data: {
  //         quantity: input.quantity,
  //       },
  //     });
  //   }),
});
