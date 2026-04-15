import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyPassword, createSession } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { email, password, isAdmin, rememberMe } = await req.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const table = isAdmin ? "admin_users" : "users";

    // ── Look up user ─────────────────────────────────────────────
    // Generic error to avoid leaking which field was wrong
    const invalidCreds = () =>
      NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (error || !data) return invalidCreds();

    const user = data as {
      id: string;
      email: string;
      password_hash: string;
      name: string;
      phone?: string | null;
      role?: string;
    };

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return invalidCreds();

    // ── Create session + cookie ──────────────────────────────────
    const session = await createSession({
      userId: isAdmin ? undefined : user.id,
      adminUserId: isAdmin ? user.id : undefined,
      email: user.email,
      rememberMe: !!rememberMe,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ipAddress:
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        undefined,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: isAdmin ? null : user.phone ?? null,
        isAdmin: !!isAdmin,
      },
    });

    response.cookies.set(session.cookieName, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: session.expiresAt,
      // maxAgeSeconds undefined → session cookie (cleared on browser close)
      ...(session.maxAgeSeconds
        ? { maxAge: session.maxAgeSeconds }
        : {}),
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
