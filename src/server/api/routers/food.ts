import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  restaurantProtectedProcedure,
} from "~/server/api/trpc";

export const foodRouter = createTRPCRouter({
  getByRestaurantId: publicProcedure
    .input(z.object({ restaurantId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const food = await ctx.prisma.food.findMany({
        where: {
          restaurantId: input.restaurantId,
        },
      });
      return food;
    }),
  getMenu: restaurantProtectedProcedure.query(async ({ ctx }) => {
    const food = await ctx.prisma.food.findMany({
      where: {
        restaurant: {
          userId: ctx.session.user.id || "",
        },
      },
      include: {
        foodOption: {
          include: {
            foodOptionItem: true,
          },
        },
      },
    });
    return food;
  }),
  update: restaurantProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string(),
        price: z.number(),
        description: z.string().nullable(),
        image: z.string(),
        quantity: z.number(),
        foodOptions: z.array(
          z.object({
            name: z.string(),
            options: z.array(
              z.object({
                name: z.string(),
                price: z.number(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const food = await ctx.prisma.food.findUnique({
        where: {
          id: input.id,
        },
        select: {
          restaurant: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!food) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Food not found",
        });
      }
      if (food.restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not authorized to update this food",
        });
      }
      if (input.image) {
        await ctx.prisma.food.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            price: input.price,
            description: input.description,
            image: (
              await ctx.cloudinary.uploader.upload(input.image)
            ).secure_url,
            quantity: input.quantity,
            restaurant: {
              connect: {
                userId: ctx.session?.user.id || "",
              },
            },
            foodOption: {
              deleteMany: {},
              create: input.foodOptions.map((category) => ({
                name: category.name,
                maxOption: 1,
                foodOptionItem: {
                  create: category.options.map((option) => ({
                    name: option.name,
                    price: option.price,
                  })),
                },
              })),
            },
          },
        });
        return;
      }
      await ctx.prisma.food.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          quantity: input.quantity,
          restaurant: {
            connect: {
              userId: ctx.session?.user.id || "",
            },
          },
          foodOption: {
            deleteMany: {},
            create: input.foodOptions.map((category) => ({
              name: category.name,
              maxOption: 1,
              foodOptionItem: {
                create: category.options.map((option) => ({
                  name: option.name,
                  price: option.price,
                })),
              },
            })),
          },
        },
      });
    }),
  delete: restaurantProtectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const food = await ctx.prisma.food.findUnique({
        where: {
          id: input.id,
        },
        select: {
          restaurant: {
            select: {
              userId: true,
            },
          },
        },
      });
      if (!food) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Food not found",
        });
      }
      if (food.restaurant.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are not authorized to delete this food",
        });
      }
      await ctx.prisma.food.delete({
        where: {
          id: input.id,
        },
      });
    }),
  create: restaurantProtectedProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string().optional(),
        image: z.string(),
        quantity: z.number(),
        foodOptions: z.array(
          z.object({
            name: z.string(),
            options: z.array(
              z.object({
                name: z.string(),
                price: z.number(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.food.create({
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          image: (await ctx.cloudinary.uploader.upload(input.image)).secure_url,
          quantity: input.quantity,
          restaurant: {
            connect: {
              userId: ctx.session.user.id || "",
            },
          },
          foodOption: {
            create: input.foodOptions.map((category) => ({
              name: category.name,
              maxOption: 1,
              foodOptionItem: {
                create: category.options.map((option) => ({
                  name: option.name,
                  price: option.price,
                })),
              },
            })),
          },
        },
      });
    }),
});
