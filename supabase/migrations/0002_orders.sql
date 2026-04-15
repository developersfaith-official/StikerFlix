-- ═══════════════════════════════════════════════════════════════════
-- StickerFlix — Orders + order_items tables
-- Run in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Orders ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT UNIQUE NOT NULL,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  customer_email  TEXT NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  shipping_address JSONB,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','shipped','delivered','cancelled','refunded')),
  payment_method  TEXT NOT NULL
                  CHECK (payment_method IN ('card','cod','wallet')),
  payment_status  TEXT NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping        NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx    ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

-- Auto-updated_at trigger (set_updated_at function exists from 0001)
DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Order-number sequence (human-readable: SF-YYYYMMDD-XXXXX)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today_str TEXT := to_char(now(), 'YYYYMMDD');
  rand_str  TEXT := upper(substr(md5(random()::text), 1, 5));
BEGIN
  RETURN 'SF-' || today_str || '-' || rand_str;
END;
$$;

-- ── Order items ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sticker_id  BIGINT NOT NULL,
  title       TEXT NOT NULL,     -- snapshot at order time
  image       TEXT,              -- snapshot
  unit_price  NUMERIC(10,2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx   ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_sticker_id_idx ON public.order_items (sticker_id);

-- ── RLS — deny all anon; service role bypasses ─────────────────────
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- Verify:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema='public' AND table_name IN ('orders','order_items');
-- ═══════════════════════════════════════════════════════════════════
