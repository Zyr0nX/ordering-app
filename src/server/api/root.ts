import { adminRouter } from "./routers/admin";
import { cartRouter } from "./routers/cart";
import { cloudinaryRouter } from "./routers/cloudinary";
import { cuisineRouter } from "./routers/cuisine";
import { foodRouter } from "./routers/food";
import { orderRouter } from "./routers/order";
import { restaurantRouter } from "./routers/restaurant";
import { shipperRouter } from "./routers/shipper";
import { spamRouter } from "./routers/spam";
import { stripeRouter } from "./routers/stripe";
import { userRouter } from "./routers/user";
import { createTRPCRouter } from "~/server/api/trpc";

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
  cloudinary: cloudinaryRouter,
  spam: spamRouter,
  cuisine: cuisineRouter,
  order: orderRouter,
  stripe: stripeRouter,
  user: userRouter,
  shipper: shipperRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
