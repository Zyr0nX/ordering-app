import cloudinary from "cloudinary";
import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const fileRouter = router({
  upload: publicProcedure.mutation(async ({ input }) => {
    const CLOUDINARY_URL =
      "https://api.cloudinary.com/v1_1/dkxjgboi8/image/upload";
    const CLOUDINARY_UPLOAD_PRESET = "fn6bsq9s";
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });
    console.log(response);
  }),
});
