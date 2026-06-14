import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);
async function check() {
  const { data, error } = await supabase.from('webrtc_signals').insert({ call_id: "7776cb2b-7cde-47cc-9eec-82d2a45a3059", sender_id: "7776cb2b-7cde-47cc-9eec-82d2a45a3059" }).select();
  console.log("INSERT: ", error);
}
check();
