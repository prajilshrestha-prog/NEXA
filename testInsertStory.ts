import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function run() {
  console.log("URL:", process.env.VITE_SUPABASE_URL);

  const { data: list, error: fetchErr } = await supabase
    .from("stories")
    .select("*")
    .limit(5);

  console.log("SELECT STORIES:", JSON.stringify(list), JSON.stringify(fetchErr));
}
run();
