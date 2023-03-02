import { publicProcedure, createTRPCRouter } from "~/server/api/trpc";

export const spamRouter = createTRPCRouter({
  test: publicProcedure.query(() => {
    return "test";
  }),
});
