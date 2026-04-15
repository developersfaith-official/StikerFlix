// Protects /dashboard (customer) and /admin/* (admin) routes.
// Runs in the Edge runtime — no Node APIs allowed; we use `jose` for JWT.

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_JWT_SECRET ?? "");

const CUSTOMER_COOKIE = "sf_session";
const ADMIN_COOKIE = "sf_admin_session";

async function verify(
  token: string | undefined
): Promise<{ sub: string; isAdmin: boolean } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      sub: payload.sub as string,
      isAdmin: payload.isAdmin as boolean,
    };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Admin routes (except /admin/login itself)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = await verify(req.cookies.get(ADMIN_COOKIE)?.value);
    if (!session || !session.isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  // Customer protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/account")) {
    const session = await verify(req.cookies.get(CUSTOMER_COOKIE)?.value);
    if (!session || session.isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + search);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/admin/:path*"],
};
