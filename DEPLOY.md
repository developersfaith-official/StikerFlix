# StickerFlix — Vercel Deployment Checklist

Everything you need to check before + after pushing to Vercel.

---

## 1. Environment variables (Vercel Dashboard → Settings → Environment Variables)

Required for the app to boot. Add each to **Production**, **Preview**, and **Development** environments.

| Variable | Where to find it | Sensitive? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | No (prefixed `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` secret key | **YES — never prefix `NEXT_PUBLIC_`** |
| `AUTH_JWT_SECRET` | Any random 32+ character string | **YES** |
| `GEMINI_API_KEY` | Only if AI features are wired up later | YES |
| `APP_URL` | Your production URL (e.g. `https://stickerflix.vercel.app`) | No |

Generate a JWT secret if you don't have one:
```powershell
[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()
```

⚠️ **The service role key bypasses Row Level Security.** If it leaks, anyone can read/write your database. Rotate it immediately if exposed.

---

## 2. Database migrations (Supabase → SQL Editor)

Run in order. Each is idempotent — safe to re-run.

| # | File | What it creates |
|---|---|---|
| 1 | `supabase/migrations/0001_auth_tables.sql` | `users`, `admin_users`, `sessions` |
| 2 | `supabase/migrations/0002_orders.sql` | `orders`, `order_items` |
| 3 | `supabase/migrations/0003_categories.sql` | `categories` (hierarchical) + seeds from `CATEGORY_MAP` |
| 4 | `supabase/migrations/0004_blogs.sql` | `blogs`, `affiliate_links`, `blog_analytics` + seeds 2 sample posts |

Verify after each:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 3. Seed an admin user

Before you can log into `/admin/login` in production:

```powershell
# Locally, from project root:
node scripts/create-admin.mjs you@yourdomain.com YourStrongPassword "Your Name"
```

This uses your local `.env.local` to talk to the same Supabase instance. If your production Supabase is a different project, run the SQL directly:

```sql
-- Get the bcrypt hash locally first:
-- node -e "require('bcryptjs').hash('YourPassword', 12).then(h => console.log(h))"

INSERT INTO public.admin_users (email, password_hash, name, role)
VALUES ('you@yourdomain.com', '<bcrypt-hash>', 'Your Name', 'superadmin');
```

---

## 4. Vercel project settings

- **Framework**: Next.js (auto-detected)
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 20.x or newer (Next.js 16 requires 18.18+, recommend 20)
- **Root Directory**: leave blank (`./`)

---

## 5. Post-deploy smoke tests

Open the deployed URL and click through:

### Public
- [ ] `/` — home loads, StickerRow renders real Supabase stickers
- [ ] `/blog` — 3-col layout, sidebars visible on desktop, featured card shown
- [ ] `/blog/how-to-style-your-laptop-with-stickers` — reader loads, language selector works, RTL flips for AR/UR
- [ ] `/search` — sticker search/filter works
- [ ] `/sticker/<id>` — detail page, pricing tiers, Add to Cart works
- [ ] `/cart` — cart state persists across reloads, quantity + / − works, confirm order shows success screen
- [ ] Category dropdown (header) — loads from DB, search works, clicking a subcategory navigates

### Auth
- [ ] `/signup` — create a test customer, redirects to `/login?signup=success`
- [ ] `/login` — log in, redirects home, cart still works
- [ ] `/admin/login` — admin creds from step 3, dark theme loads
- [ ] `/admin/dashboard` — shows stat cards, recent stickers, blog count
- [ ] Logout from admin sidebar — returns to `/admin/login`

### Admin CRUD
- [ ] `/admin/stickers` — list loads, filter by category, click to edit
- [ ] `/admin/stickers/new` — create a test sticker with image URL
- [ ] `/admin/categories` — add/edit/delete category, homepage dropdown updates live
- [ ] `/admin/blogs` — create a test blog, SEO score updates live, publish it
- [ ] `/admin/faqs`, `/admin/keywords`, `/admin/reviews`, `/admin/customers`, `/admin/settings` — each loads with data
- [ ] `/admin/orders` — if migration 0002 ran, shows "ready"; otherwise shows migration instructions

---

## 6. Known issues & follow-ups

- **`middleware.ts` deprecation warning** — Next.js 16 prefers `proxy.ts`. Rename when convenient; current file still works but emits a warning at build time.
- **Cart is localStorage-only** — not tied to the user account. Logging in on a different device won't restore the cart.
- **Order placement is simulated** — `/cart` confirm order shows success UI but does **not** write to the `orders` table. Wiring this up is the next task.
- **Blog translations are client-only (MyMemory free API)** — 10k words/day per IP, no SEO indexing of translated pages. Consider server-side translation + per-language slugs later.
- **Newsletter signup is a placeholder** — integrate Resend / ConvertKit when ready.
- **Featured image uploads** — currently URL-only for both stickers and blogs. Set up a Supabase Storage bucket for real uploads.

---

## 7. Security reminders

- `SUPABASE_SERVICE_ROLE_KEY` must **never** have the `NEXT_PUBLIC_` prefix — it would leak to the browser.
- `AUTH_JWT_SECRET` changes invalidate every active session. Don't rotate casually.
- Admin-only API routes (`/api/admin/*`) are protected by `requireAdmin()` + middleware redirect. Verify no admin route is reachable without a session.
- Row-Level Security is **enabled with no policies** on all auth + category + blog tables, so the anon key can't touch them. All writes go through service-role API routes.
