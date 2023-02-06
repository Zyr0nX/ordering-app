import { PrismaClient } from "@prisma/client";
import { useSession } from "next-auth/react";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const restaurantRouter = router({
  sendrestaurantinfo: publicProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
        additionaladdress: z.string().nullish(),
        firstname: z.string(),
        lastname: z.string(),
        email: z.string().email(),
        phonenumber: z.string(),
        userId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient();
      await prisma.restaurant.create({
        data: {
          name: input.name,
          address: input.address,
          additionalAddress: input.additionaladdress,
          firstName: input.firstname,
          lastName: input.lastname,
          email: input.email,
          phoneNumber: input.phonenumber,
          user: { connect: { id: useSession().data?.user?.id } },
        },
      });
    }),
  createFood: publicProcedure
    .input(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string(),
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const prisma = new PrismaClient();
      await prisma.food.create({
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          calories: 0,
          image: "",
          restaurantId: await prisma.restaurant.findFirst({
            where: { userId: useSession().data?.user?.id },
          }),
        },
      });
    }),
});
