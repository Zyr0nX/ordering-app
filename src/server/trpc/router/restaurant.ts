import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const restaurantRouter = router({
  sendrestaurantinfo: publicProcedure
    .input(
      z.object({
        name: z.string(),
        address: z.string(),
        additionaladdress: z.string().optional(),
        firstname: z.string(),
        lastname: z.string(),
        email: z.string().email(),
        phonenumber: z.string(),
      })
    )
    .query(async ({ input }) => {
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
        },
      });
    }),
});
