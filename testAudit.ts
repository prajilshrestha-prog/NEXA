import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function run() {
  const email = `prajilshrestha903@gmail.com`;
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password: "123456",
  });

  if (!authData?.user) {
    console.error("Sign up failed", authError);
    return;
  }

  const { data: userAuth } = await supabase.auth.getUser();
  console.log("AUTH UID:", userAuth?.user?.id);
  console.log("CURRENT USER ID:", authData.user.id);
  
  const payload = {
    userId: authData.user.id,
    video: "http://example.com/video.mp4",
    caption: "caption",
    music: "Original",
  };
  
  console.log("PAYLOAD USER ID:", payload.userId);

  const { data, error } = await supabase
    .from("reels")
    .insert({
      user_id: payload.userId,
      video: payload.video,
      caption: payload.caption,
      music: payload.music,
    })
    .select()
    .maybeSingle();

  console.log("INSERT DATA:", data);
  console.log("INSERT ERROR:", error);
}
run();
