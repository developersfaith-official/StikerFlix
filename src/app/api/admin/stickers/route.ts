import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

// ── GET /api/admin/stickers — list all (with optional search + category) ──
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");

  let query = supabaseAdmin
    .from("Stickers")
    .select("*")
    .order("createdAt", { ascending: false });

  if (q) query = query.ilike("Title", `%${q}%`);
  if (category && category !== "all") query = query.eq("category", category);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: data ?? [] });
}

// ── POST /api/admin/stickers — create ──
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { Title, description, price, category, image, isNew, isTreanding } =
      body;

    if (typeof Title !== "string" || Title.trim().length < 2) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof image !== "string" || !image.trim()) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }
    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("Stickers")
      .insert({
        Title: Title.trim(),
        description: description?.trim() ?? "",
        price,
        category: category.trim(),
        image: image.trim(),
        isNew: !!isNew,
        isTreanding: !!isTreanding,
      })
      .select("*")
      .single();

    if (error) {
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
