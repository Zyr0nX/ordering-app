import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cloudinaryRouter = createTRPCRouter({
  upload: publicProcedure
    .input(
      z.object({
        file: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (new TextEncoder().encode(input.file).length > 60 * 1024 * 1024)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File size is too large",
        });
      const { secure_url } = await ctx.cloudinary.uploader.upload(input.file);
      return secure_url;
    }),
});
