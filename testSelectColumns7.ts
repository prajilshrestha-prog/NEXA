import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const { data, error } = await supabase.from('posts').select('likes, comments, reposts, original_post_id, created_at, updated_at').limit(1);
  console.log("POSTS:", data, error);
}

check();
