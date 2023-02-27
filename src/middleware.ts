import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "unknown";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-country", country);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
