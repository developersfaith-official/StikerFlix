// One-time admin seed script.
// Usage:
//   node scripts/create-admin.mjs <email> <password> [name]
// Example:
//   node scripts/create-admin.mjs admin@stickerflix.com Admin@1234 "Site Admin"

import "dotenv/config";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// dotenv/config loads .env only — load .env.local manually
const envLocal = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const [, , emailArg, passwordArg, nameArg] = process.argv;
if (!emailArg || !passwordArg) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [name]");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = emailArg.trim().toLowerCase();
const name = nameArg ?? "Admin";

// Check existing
const { data: existing } = await supabase
  .from("admin_users")
  .select("id")
  .ilike("email", email)
  .maybeSingle();

const password_hash = await bcrypt.hash(passwordArg, 12);

if (existing) {
  // Update password
  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash, name })
    .eq("id", existing.id);
  if (error) {
    console.error("❌ Failed to update admin:", error.message);
    process.exit(1);
  }
  console.log(`✅ Existing admin "${email}" updated with new password.`);
} else {
  const { error } = await supabase.from("admin_users").insert({
    email,
    password_hash,
    name,
    role: "superadmin",
  });
  if (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
  console.log(`✅ Admin "${email}" created as superadmin.`);
}

console.log(`\nNow log in at: http://localhost:4000/admin/login`);
console.log(`  Email:    ${email}`);
console.log(`  Password: ${passwordArg}`);
