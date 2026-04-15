import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

// ── GET /api/admin/stickers/[id] ──
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("Stickers")
    .select("*")
    .eq("id", parseInt(id))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

// ── PUT /api/admin/stickers/[id] — update ──
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const { Title, description, price, category, image, isNew, isTreanding } =
      body;

    const update: Record<string, unknown> = {};
    if (typeof Title === "string") update.Title = Title.trim();
    if (typeof description === "string") update.description = description.trim();
    if (typeof price === "number") update.price = price;
    if (typeof category === "string") update.category = category.trim();
    if (typeof image === "string") update.image = image.trim();
    if (typeof isNew === "boolean") update.isNew = isNew;
    if (typeof isTreanding === "boolean") update.isTreanding = isTreanding;

    const { data, error } = await supabaseAdmin
      .from("Stickers")
      .update(update)
      .eq("id", parseInt(id))
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// ── DELETE /api/admin/stickers/[id] ──
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("Stickers")
    .delete()
    .eq("id", parseInt(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
