import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  const tables = ["posts", "profiles", "reels", "call_sessions", "webrtc_signals"];
  for (const table of tables) {
    const { data } = await supabase.from(table).select("*").limit(2);
    console.log(`TABLE ${table}: `, data?.length);
  }
}

check();
