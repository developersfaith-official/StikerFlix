-- ═══════════════════════════════════════════════════════════════════
-- StickerFlix — Auth tables (users, admin_users, sessions)
-- Run in Supabase Dashboard → SQL Editor → Run
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ═══════════════════════════════════════════════════════════════════

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Shared updated_at trigger function ──────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- 1. users  (customers)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive email lookup
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uniq
  ON public.users (LOWER(email));

DROP TRIGGER IF EXISTS users_set_updated_at ON public.users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 2. admin_users
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'superadmin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_lower_uniq
  ON public.admin_users (LOWER(email));

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 3. sessions
-- Stores a hash of the session token (never the raw token).
-- Exactly one of user_id OR admin_user_id is set per session.
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES public.users(id)       ON DELETE CASCADE,
  admin_user_id  UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token_hash     TEXT UNIQUE NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  remember_me    BOOLEAN NOT NULL DEFAULT false,
  user_agent     TEXT,
  ip_address     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Exactly one owner
  CONSTRAINT sessions_one_owner_chk CHECK (
    (user_id IS NOT NULL AND admin_user_id IS NULL) OR
    (user_id IS NULL AND admin_user_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx       ON public.sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_admin_user_id_idx ON public.sessions (admin_user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx    ON public.sessions (expires_at);

-- ═══════════════════════════════════════════════════════════════════
-- 4. RLS — enable with no anon policies (deny by default).
-- The API routes will use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- This prevents the public anon key from ever reading password_hash or sessions.
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions    ENABLE ROW LEVEL SECURITY;

-- (No policies created — all access must go through the service role.)

-- ═══════════════════════════════════════════════════════════════════
-- Done. Verify with:
--   SELECT table_name FROM information_schema.tables
--   WHERE table_schema='public' AND table_name IN ('users','admin_users','sessions');
-- ═══════════════════════════════════════════════════════════════════
