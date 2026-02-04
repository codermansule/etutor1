import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anon key");
}

export const createBrowserClient = () =>
  createBrowserSupabaseClient(supabaseUrl, supabaseAnonKey);
