import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.match("/account/restaurant-registration")) {
    const { nextUrl: url, geo } = request;
    const country = geo?.country;
    url.searchParams.set("country", country as string);
    return NextResponse.rewrite(url);
  }
}
