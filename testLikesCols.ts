import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const { error: errorPost } = await supabase.from('likes').select('reaction').limit(1);
  console.log("Likes reaction column error:", errorPost ? errorPost.message : "✅ EXISTS");

  const { error: errorReel } = await supabase.from('liked_reels').select('reaction').limit(1);
  console.log("Liked_reels reaction column error:", errorReel ? errorReel.message : "✅ EXISTS");
}
check();
