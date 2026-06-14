import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);
async function check() {
  const { data: user } = await supabase.from('profiles').select('*').limit(1).single();
  if(!user) return;
  const { data, error } = await supabase.from('call_sessions').insert({
    caller_id: user.id,
    receiver_id: user.id,
    type: "video",
    status: "ringing",
  }).select();
  console.log("INSERT CALL:", data, error);
}
check();
