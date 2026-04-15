import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = {};
    if (typeof body.keyword === "string") update.keyword = body.keyword.trim();
    if (typeof body.search_volume === "number") update.search_volume = body.search_volume;
    if (typeof body.difficulty === "number") update.difficulty = body.difficulty;
    if (typeof body.category === "string") update.category = body.category.trim();

    const { data, error } = await supabaseAdmin
      .from("seo_keywords")
      .update(update)
      .eq("id", parseInt(id))
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("seo_keywords")
    .delete()
    .eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
