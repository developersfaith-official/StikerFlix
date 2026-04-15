// Server-side Supabase client using the SERVICE_ROLE key.
// NEVER import this from client components — it bypasses RLS.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  // Thrown at import time so misconfiguration fails loudly during build/dev.
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (server-side only)."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
