import { type GeocodeResult } from "@googlemaps/google-maps-services-js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import { protectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        name: true,
        address: true,
        addressId: true,
        additionalAddress: true,
        latitude: true,
        longitude: true,
        phoneNumber: true,
      },
    });
  }),
  favoriteRestaurant: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.favorite.create({
        data: {
          userId: ctx.session.user.id,
          restaurantId: input.restaurantId,
        },
      });
    }),
  unfavoriteRestaurant: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.favorite.delete({
        where: {
          userId_restaurantId: {
            userId: ctx.session.user.id,
            restaurantId: input.restaurantId,
          },
        },
      });
    }),
  updateInfo: protectedProcedure
    .input(
      z.object({
        name: z.string().nonempty().nonempty().max(191),
        address: z.string().nonempty().nonempty(),
        addressId: z.string().nonempty().nonempty().max(191),
        additionalAddress: z.string().nullish(),
        phoneNumber: z.string().nonempty().nonempty().max(191),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid address",
          });
        }

        geocodeResult = geocode.data.results[0];
      }
      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.name,
          address: input.address,
          addressId: input.addressId,
          latitude: geocodeResult.geometry.location.lat,
          longitude: geocodeResult.geometry.location.lng,
          additionalAddress: input.additionalAddress,
          phoneNumber: input.phoneNumber,
        },
      });
      return user;
    }),
  getCart: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const restaurant = await ctx.prisma.restaurant.findUnique({
        where: {
          id: input.restaurantId,
        },
        select: {
          approved: true,
        },
      });
      if (!restaurant || restaurant.approved !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid restaurant",
        });
      }
      return await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          cartItem: {
            where: {
              food: {
                restaurantId: input.restaurantId,
              },
            },
            select: {
              food: {
                select: {
                  restaurant: {
                    select: {
                      id: true,
                      name: true,
                      address: true,
                      latitude: true,
                      longitude: true,
                    },
                  },
                  name: true,
                  price: true,
                  image: true,
                },
              },
              foodOption: {
                select: {
                  name: true,
                  price: true,
                },
              },
              id: true,
              quantity: true,
              foodId: true,
            },
          },
          name: true,
          address: true,
          addressId: true,
          additionalAddress: true,
          phoneNumber: true,
          latitude: true,
          longitude: true,
        },
      });
    }),
  getInfomation: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        name: true,
        address: true,
        addressId: true,
        additionalAddress: true,
        phoneNumber: true,
      },
    });
    return user;
  }),
  getRestaurantRegistrationInformation: protectedProcedure.query(
    async ({ ctx }) => {
      const registrationInformation = await ctx.prisma.restaurant.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          address: true,
          addressId: true,
          additionalAddress: true,
          name: true,
          cuisineId: true,
          approved: true,
        },
      });
      if (!registrationInformation) {
        return null;
      }
      if (registrationInformation.approved !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already a restaurant",
        });
      }
      return registrationInformation;
    }
  ),
  getShipperRegistrationInformation: protectedProcedure.query(
    async ({ ctx }) => {
      const registrationInformation = await ctx.prisma.shipper.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
        select: {
          firstName: true,
          lastName: true,
          phoneNumber: true,
          dateOfBirth: true,
          identificationNumber: true,
          licensePlate: true,
          approved: true,
        },
      });
      if (!registrationInformation) {
        return null;
      }
      if (registrationInformation.approved !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already a shipper",
        });
      }
      return registrationInformation;
    }
  ),
});
