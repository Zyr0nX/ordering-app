import { redis } from "./server/cache";
import { Ratelimit } from "@upstash/ratelimit";
import {
  type NextRequest,
  type NextFetchEvent,
  NextResponse,
} from "next/server";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.tokenBucket(5, "10 s", 10),
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

  const { nextUrl: url, geo } = request;
  const country = geo?.country || "US";
  url.searchParams.set("country", country);
  return NextResponse.rewrite(url);
}
