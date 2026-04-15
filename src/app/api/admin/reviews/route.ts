import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const rating = searchParams.get("rating");

  let query = supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) query = query.or(`title.ilike.%${q}%,text.ilike.%${q}%,author_name.ilike.%${q}%`);
  if (rating && rating !== "all") query = query.eq("rating", parseInt(rating));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}
