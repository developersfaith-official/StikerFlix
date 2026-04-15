import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  let query = supabaseAdmin
    .from("users")
    .select("id, email, name, phone, email_verified, created_at")
    .order("created_at", { ascending: false });

  if (q) query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}
