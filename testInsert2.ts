import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const { data: user, error: userError } = await supabase.from('profiles').select('*').limit(1).single();
  if (!user) return;
  const { data, error } = await supabase.from('posts').insert({
    user_id: user.id
  }).select();
  console.log("INSERT: ", data, error);
}

check();
