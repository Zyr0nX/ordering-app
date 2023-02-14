import { z } from "zod";

import { publicProcedure, router } from "../trpc";

export const fileRouter = router({
  upload: publicProcedure.mutation(async ({ input }) => {
    console.log(input);
  }),
});
