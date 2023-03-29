import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  shipperProtectedProcedure,
} from "~/server/api/trpc";

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
      await ctx.prisma.shipper.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          firstName: input.firstName,
          lastName: input.lastName,
          dateOfBirth: input.dateOfBirth,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
        },
        create: {
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
  updateLocation: shipperProtectedProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          shipperLocation: {
            upsert: {
              update: {
                latitude: input.latitude,
                longitude: input.longitude,
              },
              create: {
                latitude: input.latitude,
                longitude: input.longitude,
              },
            }
          }
        },
      });
    }),
});
