import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const orderRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            food: z.string(),
            quantity: z.number().min(1),
            foodOption: z.string().optional(),
          })
        ),
        restaurantid: z.string().cuid(),
        payment_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx;

      const cartItems = await prisma.order.create({
        data: {
          items: input.items.map((item) => ({
            food: item.food,
            quantity: item.quantity,
            foodOption: item.foodOption,
          })),
          userId: session?.user.id as string,
          restaurantId: input.restaurantid,
        },
      });
    }),

  //   createOrder: publicProcedure
  //     .input(
  //       z.object({
  //         cartItemIds: z.array(z.string().cuid()),
  //       })
  //     )
  //     .mutation(async ({ ctx, input }) => {
  //         const cartItem = await ctx.prisma.cartItem.findMany({
  //             where: {
  //                 id: {
  //                     in: input.cartItemIds,
  //                 },
  //             },
  //             include: {
  //                 food: {
  //                     include: {
  //                         restaurant: true,
  //                         foodOption: true,
  //                     },
  //                 },
  //             },
  //         });

  //         if (new Set(cartItem.map((item) => item.food.restaurantId)).size > 1) {
  //             throw new Error("Cart items are not from the same restaurant");
  //         }
  //         const order = await ctx.prisma.order.create({
  //             data: {
  //                 cartItem: {
  //                     connect: cartItem.map((item) => ({
  //                         id: item.id,
  //                     })),
  //                 },
  //                 userId: ctx.session?.user.id as string,
  //             }
  //         });

  //         return order.id;
  //     }),
});