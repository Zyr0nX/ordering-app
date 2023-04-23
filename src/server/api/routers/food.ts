import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";


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
  getMenu: publicProcedure.query(async ({ ctx }) => {
    const food = await ctx.prisma.food.findMany({
      where: {
        restaurant: {
          userId: ctx.session?.user.id || "",
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
  update: publicProcedure
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
      await ctx.prisma.food.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          image: input.image,
          quantity: input.quantity,
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
  create: publicProcedure
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
          image: input.image,
          quantity: input.quantity,
          restaurant: {
            connect: {
              userId: ctx.session?.user.id || "",
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