import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'posts' }); // No RPC for this usually, but let's query pg_policies using rest if we can, or just try to insert!
  console.log(data, error);
}

check();
