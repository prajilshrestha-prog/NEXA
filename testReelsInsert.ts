import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);
async function check() {
  const email = `testuser1780554615245@example.com`;
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password: "Password123!",
  });
  console.log("SIGNIN ERR:", authErr);
  if (authData?.user) {
    const { data: session } = await supabase.auth.getSession();
    console.log("SESSION EXISTS:", !!session?.session);
    const { data, error } = await supabase.from('reels').insert({
      user_id: authData.user.id,
      caption: "test schema",
      video: "https://test.com/video.mp4",
      music: "Original",
    }).select();
    console.log("INSERT REEL:", data, error);
  }
}
check();
