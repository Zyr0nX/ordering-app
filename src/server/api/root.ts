import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";

import { cartRouter } from "./routers/cart";
import { foodRouter } from "./routers/food";
import { restaurantRouter } from "./routers/restaurant";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  restaurant: restaurantRouter,
  food: foodRouter,
  cart: cartRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
