import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);
async function check() {
  const { data, error } = await supabase.from('call_sessions').select('*').limit(1);
  console.log("CALLS SCHEMA:", data, error);
}
check();
