import { env } from "./env.mjs";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  type NextRequest,
  type NextFetchEvent,
  NextResponse,
} from "next/server";

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  }),
  limiter: Ratelimit.cachedFixedWindow(10, "10 s"),
  ephemeralCache: new Map(),
  analytics: true,
});

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (request.nextUrl.pathname.startsWith("/api/trpc" || "/api/auth")) {
    const ip = request.ip ?? "127.0.0.1";
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
      `ratelimit_middleware_${ip}`
    );
    event.waitUntil(pending);

    const res = success
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/api/blocked", request.url));

    res.headers.set("X-RateLimit-Limit", limit.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", reset.toString());
    return res;
  }

  if (
    request.nextUrl.pathname === "/account/restaurant-registration" ||
    request.nextUrl.pathname === "/checkout"
  ) {
    const { nextUrl: url, geo } = request;
    const country = geo?.country || "";
    url.searchParams.set("country", country);
    return NextResponse.rewrite(url);
  }
}
