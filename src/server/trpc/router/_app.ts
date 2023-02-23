import { router } from "../trpc";
import { authRouter } from "./auth";
import { cartRouter } from "./cart";
import { exampleRouter } from "./example";
import { foodRouter } from "./food";
import { restaurantRouter } from "./restaurant";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  restaurant: restaurantRouter,
  food: foodRouter,
  cart: cartRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
