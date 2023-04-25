import { type GeocodeResult } from "@googlemaps/google-maps-services-js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  restaurantProtectedProcedure,
} from "~/server/api/trpc";

export const restaurantRouter = createTRPCRouter({
  registration: protectedProcedure
    .input(
      z.object({
        restaurantName: z.string().nonempty().max(191),
        address: z.string().nonempty(),
        addressId: z.string().nonempty(),
        additionalAddress: z.string().nullish(),
        firstName: z.string().nonempty().max(191),
        lastName: z.string().nonempty().max(191),
        phoneNumber: z.string().nonempty().max(191),
        cuisineId: z.string().cuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let geocodeResult: GeocodeResult;

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

      await ctx.prisma.restaurant.upsert({
        where: {
          userId: ctx.session.user.id,
        },
        update: {
          name: input.restaurantName,
          address: input.address,
          addressId: input.addressId,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          cuisineId: input.cuisineId,
        },
        create: {
          name: input.restaurantName,
          address: input.address,
          addressId: input.addressId,
          latitude: geocodeResult.geometry.location.lat,
          longitude: geocodeResult.geometry.location.lng,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          userId: ctx.session.user.id,
          cuisineId: input.cuisineId,
        },
      });
    }),
  update: restaurantProtectedProcedure
    .input(
      z.object({
        restaurantName: z.string().nonempty().max(191),
        address: z.string().nonempty(),
        addressId: z.string().nonempty(),
        additionalAddress: z.string().nullish(),
        firstName: z.string().nonempty().max(191),
        lastName: z.string().nonempty().max(191),
        phoneNumber: z.string().nonempty().max(191),
        cuisineId: z.string().cuid(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (new TextEncoder().encode(input.image).length > 4 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Image size is too large",
        });
      }
      let geocodeResult: GeocodeResult;

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

      await ctx.prisma.restaurant.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          name: input.restaurantName,
          address: input.address,
          addressId: input.addressId,
          latitude: geocodeResult.geometry.location.lat,
          longitude: geocodeResult.geometry.location.lng,
          additionalAddress: input.additionalAddress,
          firstName: input.firstName,
          lastName: input.lastName,
          phoneNumber: input.phoneNumber,
          cuisineId: input.cuisineId,
          image: input.image,
        },
      });
    }),
  get: publicProcedure
    .input(
      z.object({
        id: z.string().cuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const restaurant = await ctx.prisma.restaurant.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          address: true,
          additionalAddress: true,
          latitude: true,
          longitude: true,
          image: true,
          favorite: {
            where: {
              userId: ctx.session?.user.id || "",
            },
          },
          rating: true,
          food: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              image: true,
              quantity: true,
              foodOption: {
                select: {
                  id: true,
                  name: true,
                  foodOptionItem: {
                    select: {
                      id: true,
                      name: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      return restaurant;
    }),
  getAllApproved: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      select: {
        id: true,
        name: true,
        address: true,
        additionalAddress: true,
        latitude: true,
        longitude: true,
        image: true,
        cuisineId: true,
        rating: true,
        favorite: {
          where: {
            userId: ctx.session?.user.id || "",
          },
        },
      },
    });
  }),
  getRestaurantForUser: publicProcedure.query(async ({ ctx }) => {
    const restaurants = await ctx.prisma.restaurant.findMany({
      where: {
        approved: "APPROVED",
      },
      include: {
        favorite: {
          where: {
            userId: ctx.session?.user.id || "",
          },
        },
      },
    });
    return restaurants;
  }),
  getInfomation: restaurantProtectedProcedure.query(async ({ ctx }) => {
    const restaurant = await ctx.prisma.restaurant.findUnique({
      where: {
        userId: ctx.session.user.id,
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
      },
    });
    return restaurant;
  }),
});
