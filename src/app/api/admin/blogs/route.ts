import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/require-admin";
import { slugify, calculateReadingTime } from "@/lib/blog-seo";

// GET /api/admin/blogs
//   Returns { ready, blogs }  (ready=false → migration not run)
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");
  const ping = searchParams.get("ping") === "1";

  const probe = await supabaseAdmin
    .from("blogs")
    .select("id", { count: "exact", head: true });
  if (probe.error) {
    return NextResponse.json({ ready: false, error: probe.error.message });
  }
  if (ping) return NextResponse.json({ ready: true });

  let query = supabaseAdmin
    .from("blogs")
    .select(
      "id, title, slug, excerpt, featured_image_url, status, published_at, scheduled_at, author_name, category, is_featured, view_count, seo_score, tags, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ready: true, success: true, blogs: data ?? [] });
}

// POST /api/admin/blogs
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      featured_image_url,
      meta_title,
      meta_description,
      focus_keyword,
      related_keywords,
      seo_score,
      status,
      published_at,
      scheduled_at,
      category,
      is_featured,
      affiliate_links,
      affiliate_disclosure,
      tags,
      author_name,
    } = body;

    if (typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title must be at least 3 characters" },
        { status: 400 }
      );
    }

    const slug = slugify(body.slug?.trim() || title);
    const reading = calculateReadingTime(content ?? "");

    const { data, error } = await supabaseAdmin
      .from("blogs")
      .insert({
        title: title.trim(),
        slug,
        content: content ?? "",
        excerpt: excerpt?.trim() || null,
        featured_image_url: featured_image_url?.trim() || null,
        meta_title: meta_title?.trim() || null,
        meta_description: meta_description?.trim() || null,
        focus_keyword: focus_keyword?.trim() || null,
        related_keywords: Array.isArray(related_keywords) ? related_keywords : [],
        seo_score: typeof seo_score === "number" ? seo_score : 0,
        status: ["draft", "published", "scheduled"].includes(status)
          ? status
          : "draft",
        published_at:
          status === "published"
            ? published_at ?? new Date().toISOString()
            : published_at ?? null,
        scheduled_at: status === "scheduled" ? scheduled_at ?? null : null,
        category: category?.trim() || null,
        author_id: auth.session.sub,
        author_name: author_name?.trim() || auth.session.email,
        is_featured: !!is_featured,
        affiliate_links: Array.isArray(affiliate_links) ? affiliate_links : [],
        affiliate_disclosure: affiliate_disclosure?.trim() || null,
        reading_time_minutes: reading,
        tags: Array.isArray(tags) ? tags : [],
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A blog with that slug already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
