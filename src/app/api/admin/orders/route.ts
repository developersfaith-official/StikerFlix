import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const ping = searchParams.get("ping") === "1";

  // Probe whether the orders table exists (HEAD count)
  const { error } = await supabaseAdmin
    .from("orders")
    .select("id", { count: "exact", head: true });

  if (error) {
    // Likely "relation does not exist" → table hasn't been created yet
    return NextResponse.json({ ready: false, error: error.message });
  }

  if (ping) return NextResponse.json({ ready: true });

  const { data, error: listErr } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });
  return NextResponse.json({ success: true, ready: true, data: data ?? [] });
}
