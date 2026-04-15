import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { slugify, calculateReadingTime } from "@/lib/blog-seo";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("blogs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

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
    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.slug === "string" && body.slug.trim())
      update.slug = slugify(body.slug);
    if (typeof body.content === "string") {
      update.content = body.content;
      update.reading_time_minutes = calculateReadingTime(body.content);
    }
    if (typeof body.excerpt === "string") update.excerpt = body.excerpt.trim();
    if ("featured_image_url" in body)
      update.featured_image_url = body.featured_image_url?.trim() || null;
    if ("meta_title" in body)
      update.meta_title = body.meta_title?.trim() || null;
    if ("meta_description" in body)
      update.meta_description = body.meta_description?.trim() || null;
    if ("focus_keyword" in body)
      update.focus_keyword = body.focus_keyword?.trim() || null;
    if (Array.isArray(body.related_keywords))
      update.related_keywords = body.related_keywords;
    if (typeof body.seo_score === "number") update.seo_score = body.seo_score;
    if (["draft", "published", "scheduled"].includes(body.status)) {
      update.status = body.status;
      if (body.status === "published" && !body.published_at)
        update.published_at = new Date().toISOString();
    }
    if ("published_at" in body) update.published_at = body.published_at ?? null;
    if ("scheduled_at" in body) update.scheduled_at = body.scheduled_at ?? null;
    if ("category" in body) update.category = body.category?.trim() || null;
    if (typeof body.is_featured === "boolean")
      update.is_featured = body.is_featured;
    if (Array.isArray(body.affiliate_links))
      update.affiliate_links = body.affiliate_links;
    if ("affiliate_disclosure" in body)
      update.affiliate_disclosure = body.affiliate_disclosure?.trim() || null;
    if (Array.isArray(body.tags)) update.tags = body.tags;
    if (typeof body.author_name === "string")
      update.author_name = body.author_name.trim();

    const { data, error } = await supabaseAdmin
      .from("blogs")
      .update(update)
      .eq("id", id)
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
  const { error } = await supabaseAdmin.from("blogs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
