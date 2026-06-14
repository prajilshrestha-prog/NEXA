import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || "", process.env.VITE_SUPABASE_ANON_KEY || "");
async function run() { 
  const { data, error } = await supabase.from("reel_likes").select("*").limit(1); 
  console.log("reel_likes error:", error?.message); 
  const { data: d2, error: e2 } = await supabase.from("likes").select("*").limit(1);
  console.log("likes columns:", d2 ? Object.keys(d2[0] || {}) : "none", "error:", e2?.message); 
  const { data: d3, error: e3 } = await supabase.from("saves").select("*").limit(1);
  console.log("saves columns:", d3 ? Object.keys(d3[0] || {}) : "none", "error:", e3?.message);
} 
run();
