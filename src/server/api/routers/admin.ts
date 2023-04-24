import { type GeocodeResult } from "@googlemaps/google-maps-services-js";
import { TRPCError } from "@trpc/server";
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
      const restaurant = await ctx.prisma.restaurant.update({
        where: {
          id: input.restaurantId,
        },
        data: {
          approved: "APPROVED",
          user: {
            update: {
              role: "RESTAURANT",
            },
          },
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
      void ctx.nodemailer.sendMail({
        from: env.EMAIL_FROM,
        to: restaurant.user.email,
        subject: "Your restaurant has been approved",
        text: "Your restaurant has been approved",
      });
    }),
  approveShipper: adminProtectedProcedure
    .input(
      z.object({
        shipperId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const shipper = await ctx.prisma.shipper.update({
        where: {
          id: input.shipperId,
        },
        data: {
          approved: "APPROVED",
          user: {
            update: {
              role: "SHIPPER",
            },
          },
        },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      if (!shipper.user.email) {
        return;
      }
      void ctx.nodemailer.sendMail({
        from: env.EMAIL_FROM,
        to: shipper.user.email,
        subject: "Your shipper account has been approved",
        text: "Your shipper account has been approved",
      });
    }),
  rejectRestaurant: adminProtectedProcedure
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
        subject: "Your restaurant has been rejected",
        text: `Your restaurant has been rejected for the following reason: ${input.reason}`,
      });
    }),
  rejectShipper: adminProtectedProcedure
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
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });
      if (!shipper.user.email) {
        return;
      }
      await ctx.nodemailer.sendMail({
        from: env.EMAIL_FROM,
        to: shipper.user.email,
        subject: "Your shipper account has been rejected",
        text: `Your shipper account has been rejected for the following reason: ${input.reason}`,
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
      let geocodeResult;

      const cached = await ctx.redis.get(`geocode?query=${input.addressId}`);

      if (cached) {
        geocodeResult = cached as GeocodeResult;
      } else {
        const geocode = await ctx.maps.geocode({
          params: {
            place_id: input.addressId,
            key: env.GOOGLE_MAPS_API_KEY,
          },
        });

        await ctx.redis.set(
          `geocode?query=${input.addressId}`,
          geocode.data.results[0],
          { ex: 60 * 60 * 24 * 365 }
        );

        if (!geocode.data.results[0]) {
          throw new Error("Invalid address");
        }

        geocodeResult = geocode.data.results[0];
      }
      if (input.image) {
        return await ctx.prisma.restaurant.update({
          where: {
            id: input.restaurantId,
          },
          data: {
            name: input.restaurantName,
            address: input.address,
            addressId: input.addressId,
            additionalAddress: input.additionalAddress,
            latitude: geocodeResult.geometry.location.lat,
            longitude: geocodeResult.geometry.location.lng,
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        identificationNumber: true,
        licensePlate: true,
        phoneNumber: true,
        image: true,
        dateOfBirth: true,
        user: {
          select: {
            email: true,
          },
        },
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
      if (new TextEncoder().encode(input.image).length > 4 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Image size is too large",
        });
      }
      if (input.image) {
        return await ctx.prisma.shipper.update({
          where: {
            id: input.shipperId,
          },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            identificationNumber: input.identificationNumber,
            licensePlate: input.licensePlate,
            phoneNumber: input.phoneNumber,
            image: (
              await ctx.cloudinary.uploader.upload(input.image)
            ).secure_url,
            dateOfBirth: input.dateOfBirth,
          },
        });
      }
      return await ctx.prisma.shipper.update({
        where: {
          id: input.shipperId,
        },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          identificationNumber: input.identificationNumber,
          licensePlate: input.licensePlate,
          phoneNumber: input.phoneNumber,
          dateOfBirth: input.dateOfBirth,
        },
      });
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
        name: z.string(),
        address: z.string(),
        addressId: z.string(),
        additionalAddress: z.string(),
        phoneNumber: z.string(),
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
        return await ctx.prisma.user.update({
          where: {
            id: input.userId,
          },
          data: {
            name: input.name,
            address: input.address,
            additionalAddress: input.additionalAddress,
            phoneNumber: input.phoneNumber,
            image: (
              await ctx.cloudinary.uploader.upload(input.image)
            ).secure_url,
          },
        });
      }
      return await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          name: input.name,
          address: input.address,
          additionalAddress: input.additionalAddress,
          phoneNumber: input.phoneNumber,
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
  updateCuisine: adminProtectedProcedure
    .input(
      z.object({
        cuisineId: z.string().cuid(),
        name: z.string(),
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
        return await ctx.prisma.cuisine.update({
          where: {
            id: input.cuisineId,
          },
          data: {
            name: input.name,
            image: (
              await ctx.cloudinary.uploader.upload(input.image)
            ).secure_url,
          },
        });
      }
      return await ctx.prisma.cuisine.update({
        where: {
          id: input.cuisineId,
        },
        data: {
          name: input.name,
        },
      });
    }),
  deleteCuisine: adminProtectedProcedure
    .input(
      z.object({
        cuisineId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cuisine = await ctx.prisma.cuisine.findUnique({
        where: {
          id: input.cuisineId,
        },
        select: {
          _count: {
            select: {
              restaurant: true,
            },
          },
        },
      });
      if (!cuisine) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cuisine not found",
        });
      }
      if (cuisine._count.restaurant > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete cuisine with restaurants",
        });
      }
      return await ctx.prisma.cuisine.delete({
        where: {
          id: input.cuisineId,
        },
      });
    }),
  getStats: adminProtectedProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      totalRestaurants,
      totalShippers,
      totalRestaurantRequests,
      totalShipperRequests,
      totalRevenue,
      totalOrdersThisMonth,
      totalRevenueThisMonth,
    ] = await Promise.all([
      ctx.prisma.user.count(), // total users
      ctx.prisma.restaurant.count({
        where: {
          approved: "APPROVED",
        },
      }), // total restaurants
      ctx.prisma.shipper.count({
        where: {
          approved: "APPROVED",
        },
      }), // total shippers
      ctx.prisma.restaurant.count({
        where: {
          approved: "PENDING",
        },
      }), // total restaurant requests
      ctx.prisma.shipper.count({
        where: {
          approved: "PENDING",
        },
      }), // total shipper requests
      ctx.prisma.order.findMany({
        where: {
          status: "DELIVERED",
        },
        select: {
          shippingFee: true,
          orderFood: {
            select: {
              price: true,
              quantity: true,
            },
          },
        },
      }), // total revenue
      ctx.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
      }), // total orders this month
      ctx.prisma.order.findMany({
        where: {
          status: "DELIVERED",
          createdAt: {
            gte: new Date(new Date().setDate(1)),
          },
        },
        select: {
          shippingFee: true,
          orderFood: {
            select: {
              price: true,
              quantity: true,
            },
          },
        },
      }), // total revenue this month
    ]);
    return {
      totalUsers,
      totalRestaurants,
      totalShippers,
      totalRequests: totalRestaurantRequests + totalShipperRequests,
      totalRevenue: totalRevenue.reduce(
        (acc, order) =>
          acc +
          order.shippingFee +
          order.orderFood.reduce(
            (acc, orderFood) => acc + orderFood.price * orderFood.quantity,
            0
          ),
        0
      ),
      totalOrdersThisMonth,
      totalRevenueThisMonth: totalRevenueThisMonth.reduce(
        (acc, order) =>
          acc +
          order.shippingFee +
          order.orderFood.reduce(
            (acc, orderFood) => acc + orderFood.price * orderFood.quantity,
            0
          ),
        0
      ),
    };
  }),
});
