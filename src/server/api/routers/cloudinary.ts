import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const cloudinaryRouter = createTRPCRouter({
  upload: publicProcedure
    .input(
      z.object({
        file: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
      const { secure_url } = await cloudinary.uploader.upload(input.file);
      return secure_url;
    }),
});
