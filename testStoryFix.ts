import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function run() {
  const { data: user } = await supabase.from("profiles").select("id").eq("email", "prajilshrestha903@gmail.com").single();
  if(!user) return console.log("No user");
  console.log("User:", user.id);
  
  const { data, error } = await supabase.from("stories").insert({
     user_id: user.id,
     media_url: "https://example.com/a.jpg",
     media_type: "image",
     expires_at: new Date(Date.now() + 86400000).toISOString()
  });
  console.log("Insert:", data, error);
}
run();
