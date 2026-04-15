import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/categories
// Returns:
//   { ready: false }               — table not created yet
//   { ready: true, categories, stickerCounts } — with sticker count per name
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const ping = searchParams.get("ping") === "1";

  // Probe for existence
  const probe = await supabaseAdmin
    .from("categories")
    .select("id", { count: "exact", head: true });
  if (probe.error) {
    return NextResponse.json({ ready: false, error: probe.error.message });
  }

  if (ping) return NextResponse.json({ ready: true });

  const { data: categories, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Sticker counts by category name (matches Stickers.category which stores name)
  const { data: stickerRows } = await supabaseAdmin
    .from("Stickers")
    .select("category");

  const counts: Record<string, number> = {};
  (stickerRows ?? []).forEach((r: { category: string | null }) => {
    const c = r.category ?? "";
    counts[c] = (counts[c] ?? 0) + 1;
  });

  return NextResponse.json({
    ready: true,
    success: true,
    categories: categories ?? [],
    stickerCounts: counts,
  });
}

// POST /api/admin/categories — create
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { name, parent_id, sort_order } = await req.json();
    if (typeof name !== "string" || name.trim().length < 1)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = slugify(name);
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert({
        name: name.trim(),
        slug,
        parent_id: parent_id || null,
        sort_order: typeof sort_order === "number" ? sort_order : 0,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A category with that slug already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
