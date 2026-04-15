import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { hashPassword } from "@/lib/auth-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, name, role, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [], currentId: auth.session.sub });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { email, password, name, role } = await req.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email))
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    if (typeof password !== "string" || password.length < 8)
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    if (role !== "admin" && role !== "superadmin")
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);
    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .insert({
        email: normalizedEmail,
        password_hash,
        name: name?.trim() || "Admin",
        role,
      })
      .select("id, email, name, role, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
