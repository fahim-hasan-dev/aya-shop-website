import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const clientSession = req.cookies.get("aya_client_session")?.value;

  const isBookingRoute = pathname.includes("/book");

  const protectedClient =
    pathname === "/profile" ||
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/notifications") ||
    isBookingRoute;

  if (protectedClient && !clientSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/client/login";
    if (pathname) {
      url.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile",
    "/bookings/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/services/:id/book",
    "/client/login",
    "/client/otp",
  ],
};

