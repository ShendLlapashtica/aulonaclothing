import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — set them in .env.local (dev) or the Vercel project's env vars (prod).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fixed admin identity for the single-owner login on /admin — the account
// itself is created by hand in Supabase Studio (Authentication → Users),
// the UI only ever prompts for a password.
export const ADMIN_EMAIL = "shendillapashtica@gmail.com";
