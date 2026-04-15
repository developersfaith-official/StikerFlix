import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  let query = supabaseAdmin
    .from("seo_keywords")
    .select("*")
    .order("search_volume", { ascending: false });

  if (q) query = query.ilike("keyword", `%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { keyword, search_volume, difficulty, category } = await req.json();

    if (typeof keyword !== "string" || keyword.trim().length < 1)
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 });
    if (typeof search_volume !== "number" || search_volume < 0)
      return NextResponse.json({ error: "Invalid search volume" }, { status: 400 });
    if (typeof difficulty !== "number" || difficulty < 0 || difficulty > 100)
      return NextResponse.json({ error: "Difficulty must be 0–100" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("seo_keywords")
      .insert({
        keyword: keyword.trim(),
        search_volume,
        difficulty,
        category: category?.trim() || "general",
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
