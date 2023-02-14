import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { fileRouter } from "./file";
import { restaurantRouter } from "./restaurant";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  restaurant: restaurantRouter,
  file: fileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
