import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cloudinaryRouter = createTRPCRouter({
  upload: publicProcedure
    .input(
      z.object({
        file: z.string().url().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.file)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No file provided",
        });
      const { secure_url } = await ctx.cloudinary.uploader.upload(input.file);
      return secure_url;
    }),
});
