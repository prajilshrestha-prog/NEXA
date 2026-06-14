import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);
async function run() {
  const { data: authData } = await supabase.auth.getUser();
  const authUid = authData?.user?.id || null;
  const payloadUserId = "00000000-0000-0000-0000-000000000000";
  const insertBody = {
    user_id: payloadUserId,
    video: "http://example.com/video.mp4",
    caption: "test",
    music: "Original",
  };
  const { data, error } = await supabase
    .from("reels")
    .insert(insertBody)
    .select()
    .maybeSingle();

  console.log("--- RESULTS ---");
  console.log("1.", authUid);
  console.log("2.", payloadUserId);
  console.log("3.", JSON.stringify(insertBody));
  console.log("4.", JSON.stringify(error));
  console.log("5.", JSON.stringify(data));
}
run();
