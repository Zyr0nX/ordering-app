import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const cartRouter = createTRPCRouter({
  addItems: protectedProcedure
    .input(
      z.object({
        foodId: z.string().cuid(),
        foodOptionids: z.array(z.string().cuid()),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }

      const isFoodOptionValid = await ctx.prisma.foodOptionItem.findMany({
        where: {
          id: {
            in: input.foodOptionids,
          },
          foodOption: {
            foodId: input.foodId,
          },
        },
      });

      if (isFoodOptionValid.length !== input.foodOptionids.length) {
        throw new Error("Invalid food option");
      }

      const existCartItems = await ctx.prisma.cartItem.findMany({
        where: {
          foodId: input.foodId,
          userId: ctx.session?.user?.id,
        },
        include: {
          foodOption: true,
        },
      });

      const existCartItem = existCartItems.find((item) => {
        const foodOptionIds = item.foodOption.map((option) => option.id);
        return (
          foodOptionIds.length === input.foodOptionids.length &&
          foodOptionIds.every((id) => input.foodOptionids.includes(id))
        );
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
            quantity: input.quantity,
            foodId: input.foodId,
            userId: ctx.session?.user?.id,
            foodOption: {
              connect: input.foodOptionids.map((id) => ({
                id,
              })),
            },
          },
        });
      }
    }),
  updateItemQuantity: protectedProcedure
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
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const cart = ctx.prisma.cartItem.findMany({
      where: {
        userId: ctx.session.user.id || "",
      },
      include: {
        food: {
          include: {
            restaurant: true,
          },
        },
        foodOption: true,
      },
    });
    return cart;
  }),
});
