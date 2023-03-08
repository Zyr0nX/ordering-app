import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const externalRouter = createTRPCRouter({
  uploadCloudinary: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
      const { secure_url } = await cloudinary.uploader.upload(input);
      return secure_url;
    }),
});
