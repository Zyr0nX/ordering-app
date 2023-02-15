import { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const restaurantRouter = router({
  create: publicProcedure
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
          userId: input.userId,
        },
      });
    }),
});
