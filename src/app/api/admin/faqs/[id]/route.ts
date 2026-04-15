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
    if (typeof body.product_id === "number") update.product_id = body.product_id;
    if (typeof body.question === "string") update.question = body.question.trim();
    if (typeof body.answer === "string") update.answer = body.answer.trim();
    if (typeof body.category === "string") update.category = body.category.trim();

    const { data, error } = await supabaseAdmin
      .from("faqs")
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
    .from("faqs")
    .delete()
    .eq("id", parseInt(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
