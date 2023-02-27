import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country;
  request.nextUrl.searchParams.set("country", country as string);
  return NextResponse.rewrite(request.nextUrl);
}
