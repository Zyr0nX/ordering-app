import { adminRouter } from "./routers/admin";
import { cartRouter } from "./routers/cart";
import { externalRouter } from "./routers/external";
import { foodRouter } from "./routers/food";
import { restaurantRouter } from "./routers/restaurant";
import { restaurantTypeRouter } from "./routers/restaurantType";
import { spamRouter } from "./routers/spam";
import { createTRPCRouter } from "~/server/api/trpc";
import { orderRouter } from "./routers/order";
import { stripeRouter } from "./routers/stripe";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  admin: adminRouter,
  restaurant: restaurantRouter,
  food: foodRouter,
  cart: cartRouter,
  external: externalRouter,
  spam: spamRouter,
  restaurantType: restaurantTypeRouter,
  order: orderRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
