import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hashPassword } from "@/lib/auth-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    // ── Validation ────────────────────────────────────────────────
    if (typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ── Check for existing user (case-insensitive) ────────────────
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Create user ───────────────────────────────────────────────
    const password_hash = await hashPassword(password);
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({
        email: normalizedEmail,
        password_hash,
        name: name.trim(),
        phone: phone?.trim() || null,
      })
      .select("id, email, name, phone")
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isAdmin: false,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
