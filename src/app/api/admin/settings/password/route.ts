import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  requireAdmin,
} from "@/lib/require-admin";
import { verifyPassword, hashPassword } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { currentPassword, newPassword } = await req.json();
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const { data: me } = await supabaseAdmin
      .from("admin_users")
      .select("id, password_hash")
      .eq("id", auth.session.sub)
      .maybeSingle();

    if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ok = await verifyPassword(currentPassword, me.password_hash);
    if (!ok)
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );

    const newHash = await hashPassword(newPassword);
    const { error } = await supabaseAdmin
      .from("admin_users")
      .update({ password_hash: newHash })
      .eq("id", auth.session.sub);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
