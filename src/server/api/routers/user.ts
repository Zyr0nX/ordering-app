import { GeocodeResult } from "@googlemaps/google-maps-services-js";
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
          throw new Error("Invalid address");
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
});
