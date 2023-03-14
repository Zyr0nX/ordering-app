import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


export const orderRouter = createTRPCRouter({
  createOrder: publicProcedure
    .input(
      z.object({
        cartItemIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const cartItem = await ctx.prisma.cartItem.findMany({
            where: {
                id: {
                    in: input.cartItemIds,
                },
            },
            include: {
                food: {
                    include: {
                        restaurant: true,
                        foodOption: true,
                    },
                },
            },
        });
        
        if (new Set(cartItem.map((item) => item.food.restaurantId)).size > 1) {
            throw new Error("Cart items are not from the same restaurant");
        }
        console.log(cartItem);
        const order = await ctx.prisma.order.create({
            data: {
                cartItem: {
                    connect: cartItem.map((item) => ({
                        id: item.id,
                    })),
                },
                userId: ctx.session?.user.id as string,
            }
        });

        return order.id;
    }),
});