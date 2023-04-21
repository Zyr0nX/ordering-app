import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { env } from "~/env.mjs";
import { adminProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  approveRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          approved: "APPROVED",
        },
      });
    }),
  approveShipper: adminProtectedProcedure
    .input(
      z.object({
        shipperId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        where: {
          id: input.shipperId,
        },
        data: {
          approved: "APPROVED",
        },
      });
    }),
  rejectRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          approved: "REJECTED",
        },
      });
    }),
  rejectShipper: adminProtectedProcedure
    .input(
      z.object({
        shipperId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.shipper.update({
        where: {
          id: input.shipperId,
        },
        data: {
          approved: "REJECTED",
        },
      });
    }),
  disableRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.prisma.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          approved: "REJECTED",
        },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      if (!restaurant.user.email) {
        return;
      }
      await ctx.nodemailer.sendMail({
        from: env.EMAIL_FROM,
        to: restaurant.user.email,
        subject: "Your restaurant has been disabled",
        text: `Your restaurant has been disabled for the following reason: ${input.reason}`,
      });
    }),
  getPendingRestaurantRequests: adminProtectedProcedure.query(
    async ({ ctx }) => {
      return await ctx.prisma.restaurant.findMany({
        where: {
          approved: "PENDING",
        },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          cuisine: {
            select: {
              name: true,
            },
          },
        },
      });
    }
  ),
  getApprovedRestaurants: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        address: true,
        addressId: true,
        additionalAddress: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        image: true,
        cuisineId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }),
  editRestaurant: adminProtectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
        restaurantName: z.string(),
        address: z.string(),
        addressId: z.string(),
        additionalAddress: z.string().nullish(),
        firstName: z.string(),
        lastName: z.string(),
        phoneNumber: z.string(),
        cuisineId: z.string().cuid(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (new TextEncoder().encode(input.image).length > 4 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Image size is too large",
        });
      }
      if (input.image) {
        return await ctx.prisma.restaurant.update({
          where: {
            id: input.restaurantId,
          },
          data: {
            name: input.restaurantName,
            address: input.address,
            additionalAddress: input.additionalAddress,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber,
            cuisineId: input.cuisineId,
            image: (
              await ctx.cloudinary.uploader.upload(input.image)
            ).secure_url,
          },
        });
      }
      return await ctx.prisma.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          name: input.restaurantName,
          address: input.address,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          cuisineId: input.cuisineId,
        },
      });
    }),
  getApprovedShippers: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.shipper.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        user: true,
      },
    });
  }),
  editShipper: adminProtectedProcedure
    .input(
      z.object({
        shipperId: z.string().cuid(),
        firstName: z.string(),
        lastName: z.string(),
        identificationNumber: z.string(),
        licensePlate: z.string(),
        phoneNumber: z.string(),
        image: z.string().url().optional(),
        dateOfBirth: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shipper = await ctx.prisma.shipper.update({
        where: {
          id: input.shipperId,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
          image: input.image,
          dateOfBirth: input.dateOfBirth,
        },
      });
      return shipper;
    }),
  disableShipper: adminProtectedProcedure
    .input(
      z.object({
        shipperId: z.string().cuid(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shipper = await ctx.prisma.shipper.update({
        where: {
          id: input.shipperId,
        },
        data: {
          approved: "REJECTED",
        },
        include: {
          user: true,
        },
      });
      if (!shipper.user.email) {
        return;
      }
      await ctx.nodemailer.sendMail({
        from: env.EMAIL_FROM,
        to: shipper.user.email,
        subject: "Your shipper account has been disabled",
        text: `Your shipper account has been disabled for the following reason: ${input.reason}`,
      });
    }),
  getUsers: adminProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany();
  }),
  editUser: adminProtectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        name: z.string().nullish(),
        address: z.string().nullish(),
        additionalAddress: z.string().nullish(),
        phoneNumber: z.string().nullish(),
        image: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          name: input.name,
          address: input.address,
          additionalAddress: input.additionalAddress,
          phoneNumber: input.phoneNumber,
          image: input.image,
        },
      });
    }),
  disableUser: adminProtectedProcedure
    .input(
      z.object({
        userId: z.string().cuid(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          status: "DISABLED",
        },
      });
      if (!user.email) {
        return;
      }
      await ctx.nodemailer.sendMail({
        from: env.EMAIL_FROM,
        to: user.email,
        subject: "Your account has been disabled",
        text: `Your account has been disabled for the following reason: ${input.reason}`,
      });
    }),
  getPendingRestauranntAndShipperRequests: adminProtectedProcedure.query(
    async ({ ctx }) => {
      const [pendingRestaurant, pendingShipper] = await Promise.all([
        ctx.prisma.restaurant.findMany({
          where: {
            approved: "PENDING",
          },
          include: {
            cuisine: true,
            user: true,
          },
        }),
        ctx.prisma.shipper.findMany({
          where: {
            approved: "PENDING",
          },
          include: {
            user: true,
          },
        }),
      ]);
      return [
        ...pendingRestaurant.map((restaurant) => ({
          type: "restaurant" as const,
          data: restaurant,
        })),
        ...pendingShipper.map((shipper) => ({
          type: "shipper" as const,
          data: shipper,
        })),
      ].sort((a, b) => b.data.updatedAt.getTime() - a.data.updatedAt.getTime());
    }
  ),
});
