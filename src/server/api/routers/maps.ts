import { type GeocodeResult, type PlaceAutocompleteResult } from "@googlemaps/google-maps-services-js";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { redis } from "~/server/cache";


export const mapsRouter = createTRPCRouter({
  getAutocomplete: protectedProcedure
    .input(
      z.object({
        query: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) => {
      const cached = await redis.get(`placeAutocomplete?query=${input.query}`);

      if (cached) {
        return cached as Pick<
          PlaceAutocompleteResult,
          "description" | "place_id"
        >[];
      }

      const autocomplete = await ctx.maps.placeAutocomplete({
        params: {
          input: input.query,
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      const data = autocomplete.data.predictions.map((prediction) => ({
        description: prediction.description,
        place_id: prediction.place_id,
      }));

      void redis.set(`placeAutocomplete?query=${input.query}`, data, {
        ex: 60 * 60 * 24 * 365,
      });

      return data;
    }),
  getReverseGeocode: protectedProcedure
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cached = await redis.get(
        `reverseGeocode?query=${input.lat},${input.lng}}`
      );

      if (cached) {
        return cached as GeocodeResult;
      }

      const reverseGeocode = await ctx.maps.reverseGeocode({
        params: {
          latlng: `${input.lat},${input.lng}`,
          key: env.GOOGLE_MAPS_API_KEY,
        },
      });

      await redis.set(
        `placeAutocomplete?query=${input.lat},${input.lng}`,
        reverseGeocode.data.results[0],
        { ex: 60 * 60 * 24 * 365 }
      );

      return reverseGeocode.data.results[0];
    }),
  getDistanceMatrixMutation: protectedProcedure
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
    .mutation(async ({ ctx, input }) => {
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
  getDistanceMatrixQuery: protectedProcedure
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