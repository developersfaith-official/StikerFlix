-- ═══════════════════════════════════════════════════════════════════
-- StickerFlix — Categories table (replaces code-based CATEGORY_MAP)
-- Run in Supabase Dashboard → SQL Editor → Run
-- Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Categories (hierarchy via parent_id) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON public.categories (sort_order);

-- set_updated_at() was defined in migration 0001_auth_tables.sql
DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Deny anon; admin API uses service role.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- Seed — mirrors the original CATEGORY_MAP from src/data.ts
-- ═══════════════════════════════════════════════════════════════════

-- Only seed if the table is empty (idempotent for re-runs)
DO $$
DECLARE
  cat_sport UUID;
  cat_marvel UUID;
  cat_diy UUID;
  cat_animal UUID;
  cat_laptop UUID;
  cat_kitchen UUID;
  cat_kids UUID;
BEGIN
  IF (SELECT count(*) FROM public.categories) = 0 THEN

    -- Sport
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('Sport', 'sport', 1) RETURNING id INTO cat_sport;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Basketball',    'basketball',    cat_sport, 1),
      ('Football',      'football',      cat_sport, 2),
      ('Soccer',        'soccer',        cat_sport, 3),
      ('Formula 1',     'formula-1',     cat_sport, 4),
      ('Michael Jordan','michael-jordan',cat_sport, 5),
      ('NFL',           'nfl',           cat_sport, 6),
      ('NHL',           'nhl',           cat_sport, 7),
      ('Baseball',      'baseball',      cat_sport, 8),
      ('Cycling',       'cycling',       cat_sport, 9),
      ('Tennis',        'tennis',        cat_sport, 10),
      ('Golf',          'golf',          cat_sport, 11);

    -- Super Heroes / Marvel
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('Super Heroes / Marvel', 'super-heroes-marvel', 2) RETURNING id INTO cat_marvel;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Spider-Man',                      'spider-man',                      cat_marvel, 1),
      ('X-Men',                           'x-men',                           cat_marvel, 2),
      ('Guardians of the Galaxy',         'guardians-of-the-galaxy',         cat_marvel, 3),
      ('Teenage Mutant Ninja Turtles',    'teenage-mutant-ninja-turtles',    cat_marvel, 4),
      ('The Boys TV Series',              'the-boys-tv-series',              cat_marvel, 5),
      ('Superman',                        'superman',                        cat_marvel, 6),
      ('Iron Man',                        'iron-man',                        cat_marvel, 7),
      ('Hulk',                            'hulk',                            cat_marvel, 8),
      ('Captain America',                 'captain-america',                 cat_marvel, 9),
      ('Thor',                            'thor',                            cat_marvel, 10),
      ('Wolverine',                       'wolverine',                       cat_marvel, 11),
      ('Wonder Woman',                    'wonder-woman',                    cat_marvel, 12),
      ('Deadpool',                        'deadpool',                        cat_marvel, 13),
      ('Aquaman',                         'aquaman',                         cat_marvel, 14),
      ('Shazam',                          'shazam',                          cat_marvel, 15);

    -- DIY
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('DIY', 'diy', 3) RETURNING id INTO cat_diy;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Tools',            'tools',            cat_diy, 1),
      ('Crafts',           'crafts',           cat_diy, 2),
      ('Home Improvement', 'home-improvement', cat_diy, 3);

    -- Animal
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('Animal', 'animal', 4) RETURNING id INTO cat_animal;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Cat',   'cat',   cat_animal, 1),
      ('Horse', 'horse', cat_animal, 2),
      ('Dog',   'dog',   cat_animal, 3),
      ('Birds', 'birds', cat_animal, 4),
      ('Wild',  'wild',  cat_animal, 5);

    -- Laptop
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('Laptop', 'laptop', 5) RETURNING id INTO cat_laptop;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Coding',     'coding',     cat_laptop, 1),
      ('Gaming',     'gaming',     cat_laptop, 2),
      ('Minimalist', 'minimalist', cat_laptop, 3);

    -- Kitchen
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('Kitchen', 'kitchen', 6) RETURNING id INTO cat_kitchen;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Food',    'food',    cat_kitchen, 1),
      ('Cooking', 'cooking', cat_kitchen, 2),
      ('Coffee',  'coffee',  cat_kitchen, 3);

    -- Kids
    INSERT INTO public.categories (name, slug, sort_order) VALUES
      ('Kids', 'kids', 7) RETURNING id INTO cat_kids;
    INSERT INTO public.categories (name, slug, parent_id, sort_order) VALUES
      ('Cartoons', 'cartoons', cat_kids, 1),
      ('Toys',     'toys',     cat_kids, 2),
      ('Learning', 'learning', cat_kids, 3);

  END IF;
END
$$;

-- ═══════════════════════════════════════════════════════════════════
-- Verify:
--   SELECT name, slug, parent_id FROM public.categories ORDER BY sort_order;
-- ═══════════════════════════════════════════════════════════════════
