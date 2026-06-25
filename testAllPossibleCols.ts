import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function check() {
  // We can try to select specific column configurations to see which ones exist without error
  const candidates = [
    "id",
    "conversation_id",
    "initiated_by",
    "call_type",
    "status",
    "created_at"
  ];
  
  for (const col of candidates) {
    const { error } = await supabase.from('call_sessions').select(col).limit(1);
    console.log(`Column ${col}:`, error ? "❌ Does NOT exist" : "✅ EXISTS");
  }
}
check();
