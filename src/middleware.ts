import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.geo?.country || "unknown";
  NextResponse.next().headers.set("x-country", country);

  return NextResponse.next();
}
