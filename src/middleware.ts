import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { nextUrl: url, geo } = request;
  const country = geo?.country;
  url.searchParams.set("country", country as string);
  return NextResponse.rewrite(url);
}
