import {
  type GeocodeResult,
  type PlaceAutocompleteResult,
} from "@googlemaps/google-maps-services-js";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { redis } from "~/server/cache";

export const mapsRouter = createTRPCRouter({
  getAutocomplete: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const cached = await redis.get(`placeAutocomplete?query=${input.query}`);

      if (cached) {
        return cached as PlaceAutocompleteResult[];
      }

      const autocomplete = await ctx.maps.placeAutocomplete({
        params: {
          input: input.query,
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      await redis.set(
        `placeAutocomplete?query=${input.query}`,
        autocomplete.data.predictions,
        { ex: 60 * 60 * 24 * 365 }
      );

      return autocomplete.data.predictions;
    }),
  getReverseGeocode: protectedProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const cached = await redis.get(`reverseGeocode?query=${input.query}`);

      if (cached) {
        return cached as GeocodeResult;
      }

      const reverseGeocode = await ctx.maps.reverseGeocode({
        params: {
          latlng: input.query,
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      await redis.set(
        `placeAutocomplete?query=${input.query}`,
        reverseGeocode.data.results[0],
        { ex: 60 * 60 * 24 * 365 }
      );

      return reverseGeocode.data.results[0];
    }),
  getDistanceMatrix: protectedProcedure
    .input(
      z.object({
        origins: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        destinations: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      })
    )
    .query(async ({ ctx, input }) => {
      const cached = await redis.get(
        `distanceMatrix?origins=[${input.origins.lat},${input.origins.lng}],&destinations=[${input.destinations.lat},${input.destinations.lng}]}]`
      );

      if (cached) {
        return cached as number;
      }

      const distanceMatrix = await ctx.maps.distancematrix({
        params: {
          origins: [
            {
              lat: input.origins.lat,
              lng: input.origins.lng,
            },
          ],
          destinations: [
            {
              lat: input.destinations.lat,
              lng: input.destinations.lng,
            },
          ],
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      await redis.set(
        `distanceMatrix?origins=[${input.origins.lat},${input.origins.lng}],&destinations=[${input.destinations.lat},${input.destinations.lng}]}]`,
        distanceMatrix.data.rows[0]?.elements[0]?.distance.value,
        { ex: 60 * 60 * 24 * 365 }
      );

      return distanceMatrix.data.rows[0]?.elements[0]?.distance.value;
    }),
});