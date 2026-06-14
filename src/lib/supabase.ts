/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ttnhknvcgcsijvdjpxds.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_hXNMXK_GU9ySkhmwwGH3aw_ja_X0d5G";

export const hasSupabaseConfig = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== "undefined",
);

// Real client if configured, otherwise returning a mock structure to prevent crashes
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({} as ReturnType<typeof createClient>);
