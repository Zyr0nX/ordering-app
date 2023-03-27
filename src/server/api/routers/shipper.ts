import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const shipperRouter = createTRPCRouter({
  registration: protectedProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        dateOfBirth: z.date(),
        identificationNumber: z.string(),
        licensePlate: z.string(),
        phoneNumber: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
          userId: ctx.session.user.id,
        },
      });
    }),
});
