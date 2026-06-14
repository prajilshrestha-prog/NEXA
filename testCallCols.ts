import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);
async function check() {
  const { data, error } = await supabase.from('call_sessions').select('id, caller_id, receiver_id, type, status, participant_a, participant_b, caller, receiver, from_user, to_user, user_id').limit(1);
  console.log("CALLS COLS:", error);
}
check();
