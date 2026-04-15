import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  deleteSessionByToken,
} from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const { isAdmin } = await req.json().catch(() => ({ isAdmin: false }));
  const cookieName = isAdmin ? ADMIN_SESSION_COOKIE : SESSION_COOKIE;

  const token = req.cookies.get(cookieName)?.value;
  if (token) {
    await deleteSessionByToken(token).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
