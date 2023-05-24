import { TRPCError } from "@trpc/server";
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
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quantity must be greater than 0",
        });
      }

      const [food, isFoodOptionValid, cartItems] = await Promise.all([
        ctx.prisma.food.findUnique({
          where: {
            id: input.foodId,
          },
          select: {
            quantity: true,
          },
        }),
        ctx.prisma.foodOptionItem.findMany({
          where: {
            id: {
              in: input.foodOptionids,
            },
            foodOption: {
              foodId: input.foodId,
            },
          },
        }),
        ctx.prisma.cartItem.findMany({
          where: {
            foodId: input.foodId,
            userId: ctx.session?.user?.id,
          },
          include: {
            foodOption: true,
          },
        }),
      ]);
      if (isFoodOptionValid.length !== input.foodOptionids.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Food option is not valid",
        });
      }

      if (!food) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Food not found",
        });
      }

      const existCartItem = cartItems.find((item) => {
        const foodOptionIds = item.foodOption.map((option) => option.id);
        return (
          foodOptionIds.length === input.foodOptionids.length &&
          foodOptionIds.every((id) => input.foodOptionids.includes(id))
        );
      });

      if (existCartItem) {
        if (food.quantity < existCartItem.quantity + input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Quantity is not enough",
          });
        }
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
        if (food.quantity < input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Quantity is not enough",
          });
        }
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
      const cartItem = await ctx.prisma.cartItem.findUnique({
        where: {
          id: input.cartItemId,
        },
        select: {
          food: {
            select: {
              quantity: true,
            },
          },
        },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart item not found",
        });
      }

      if (cartItem.food.quantity < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quantity is not enough",
        });
      }

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
        food: {
          restaurant: {
            approved: "APPROVED",
          },
        },
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
