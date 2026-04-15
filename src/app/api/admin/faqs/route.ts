import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  let query = supabaseAdmin
    .from("faqs")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) query = query.or(`question.ilike.%${q}%,answer.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { product_id, question, answer, category } = await req.json();

    if (typeof product_id !== "number")
      return NextResponse.json({ error: "product_id is required (number)" }, { status: 400 });
    if (typeof question !== "string" || question.trim().length < 3)
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    if (typeof answer !== "string" || answer.trim().length < 3)
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("faqs")
      .insert({
        product_id,
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || "general",
        helpful_count: 0,
        views_count: 0,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
