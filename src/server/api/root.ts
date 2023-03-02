import { adminRouter } from "./routers/admin";
import { cartRouter } from "./routers/cart";
import { externalRouter } from "./routers/external";
import { foodRouter } from "./routers/food";
import { restaurantRouter } from "./routers/restaurant";
import { restaurantTypeRouter } from "./routers/restaurantType";
import { spamRouter } from "./routers/spam";
import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  admin: adminRouter,
  restaurant: restaurantRouter,
  food: foodRouter,
  cart: cartRouter,
  external: externalRouter,
  spam: spamRouter,
  restaurantType: restaurantTypeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
