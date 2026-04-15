-- ═══════════════════════════════════════════════════════════════════
-- StickerFlix — Blogs + affiliate_links + blog_analytics
-- Run in Supabase Dashboard → SQL Editor → Run
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Blogs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blogs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  content               TEXT NOT NULL DEFAULT '',
  excerpt               TEXT,
  featured_image_url    TEXT,

  -- SEO
  meta_title            TEXT,
  meta_description      TEXT,
  focus_keyword         TEXT,
  related_keywords      TEXT[] NOT NULL DEFAULT '{}',
  seo_score             INTEGER NOT NULL DEFAULT 0 CHECK (seo_score >= 0 AND seo_score <= 100),

  -- Status + publishing
  status                TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','published','scheduled')),
  published_at          TIMESTAMPTZ,
  scheduled_at          TIMESTAMPTZ,

  -- Author + category
  author_id             UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  author_name           TEXT,             -- snapshot (visible even if admin removed)
  category              TEXT,

  -- Features
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  view_count            INTEGER NOT NULL DEFAULT 0,

  -- Affiliate
  affiliate_links       JSONB NOT NULL DEFAULT '[]'::jsonb,
  affiliate_disclosure  TEXT,

  -- Metadata
  reading_time_minutes  INTEGER NOT NULL DEFAULT 0,
  tags                  TEXT[] NOT NULL DEFAULT '{}',

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blogs_slug_idx         ON public.blogs (slug);
CREATE INDEX IF NOT EXISTS blogs_status_idx       ON public.blogs (status);
CREATE INDEX IF NOT EXISTS blogs_published_at_idx ON public.blogs (published_at DESC);
CREATE INDEX IF NOT EXISTS blogs_category_idx     ON public.blogs (category);
CREATE INDEX IF NOT EXISTS blogs_is_featured_idx  ON public.blogs (is_featured);

-- set_updated_at() defined in migration 0001
DROP TRIGGER IF EXISTS blogs_set_updated_at ON public.blogs;
CREATE TRIGGER blogs_set_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Affiliate links (per-link tracking; authoritative source) ─────
CREATE TABLE IF NOT EXISTS public.affiliate_links (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id             UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  url                 TEXT NOT NULL,
  product_name        TEXT,
  platform            TEXT NOT NULL DEFAULT 'custom'
                      CHECK (platform IN ('amazon','etsy','custom','internal')),
  commission_percent  NUMERIC(5,2) NOT NULL DEFAULT 0,
  clicks              INTEGER NOT NULL DEFAULT 0,
  conversions         INTEGER NOT NULL DEFAULT 0,
  revenue             NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_links_blog_id_idx ON public.affiliate_links (blog_id);

-- ── Blog analytics (per-day rollup) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_analytics (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id                UUID REFERENCES public.blogs(id) ON DELETE CASCADE,
  date                   DATE NOT NULL,
  views                  INTEGER NOT NULL DEFAULT 0,
  unique_visitors        INTEGER NOT NULL DEFAULT 0,
  bounce_rate            NUMERIC(5,2),
  avg_time_on_page       INTEGER,
  affiliate_clicks       INTEGER NOT NULL DEFAULT 0,
  affiliate_conversions  INTEGER NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blog_id, date)
);

CREATE INDEX IF NOT EXISTS blog_analytics_blog_id_date_idx
  ON public.blog_analytics (blog_id, date DESC);

-- ── RLS — anon bypassed; service role (API routes) bypasses ────────
ALTER TABLE public.blogs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_analytics   ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- Seed (mirrors existing BLOG_POSTS from src/data.ts)
-- Only seeds when the table is empty.
-- ═══════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF (SELECT count(*) FROM public.blogs) = 0 THEN
    INSERT INTO public.blogs (title, slug, content, excerpt, featured_image_url,
                              meta_title, meta_description, focus_keyword,
                              status, published_at, category, author_name,
                              reading_time_minutes, tags, seo_score, is_featured)
    VALUES
      (
        'How to Style Your Laptop with Stickers',
        'how-to-style-your-laptop-with-stickers',
        '<h2>Introduction</h2><p>Your laptop is a blank canvas. Stickers are the paint. But bad placement can turn a statement into chaos.</p><h2>The 70/30 Rule</h2><p>Cover about 70% of the lid and leave 30% negative space. Cluttered lids look messy; empty ones look unfinished.</p><h2>Color Theory</h2><p>Pick 2–3 accent colors and stick to them. Complementary palettes unify the composition.</p><h2>Layering</h2><p>Big stickers go down first, small ones layer on top. Leave small gaps so individual stickers remain readable.</p><h2>Sealing</h2><p>A vinyl laminate spray keeps edges from peeling after months of backpack friction.</p>',
        'Learn the secrets to creating a cohesive sticker bomb on your laptop without making it look messy.',
        'https://picsum.photos/seed/blog1/800/400',
        'How to Style Your Laptop with Stickers | StickerFlix',
        'Master laptop sticker placement with the 70/30 rule, color theory, and layering tips. Make your laptop look intentional, not chaotic.',
        'laptop stickers',
        'published',
        '2026-03-25'::timestamptz,
        'tutorial',
        'StickerFlix Team',
        4,
        ARRAY['laptop','styling','guide'],
        78,
        true
      ),
      (
        'The Rise of Vinyl Stickers in 2026',
        'the-rise-of-vinyl-stickers-in-2026',
        '<h2>Why Vinyl Won</h2><p>Paper stickers peel. Vinyl stickers survive. That one detail ended the format war.</p><h2>What Changed in 2026</h2><p>Print fidelity hit a threshold — matte vinyls now reproduce gradients indistinguishable from glossy prints.</p><h2>Artist Adoption</h2><p>Independent designers moved en masse from paper to vinyl because customers actually keep vinyl stickers.</p><h2>Where It''s Heading</h2><p>Transparent holographic vinyls and soft-touch finishes are the next experimental frontier.</p>',
        'Why vinyl stickers are becoming the preferred choice for artists and collectors alike.',
        'https://picsum.photos/seed/blog2/800/400',
        'The Rise of Vinyl Stickers in 2026 | StickerFlix',
        'Vinyl stickers dominate the market in 2026. Here''s why artists and collectors abandoned paper for waterproof, durable, gradient-rich vinyl prints.',
        'vinyl stickers',
        'published',
        '2026-03-20'::timestamptz,
        'trends',
        'StickerFlix Team',
        3,
        ARRAY['vinyl','industry','trends'],
        72,
        false
      );
  END IF;
END
$$;

-- ═══════════════════════════════════════════════════════════════════
-- Verify:
--   SELECT id, title, slug, status, is_featured FROM public.blogs;
-- ═══════════════════════════════════════════════════════════════════
