import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const { data, error } = await supabase.from('posts').select('id, user_id, content, caption, image, video, media_type, type').limit(1);
  console.log("POSTS:", data, error);
}

check();
