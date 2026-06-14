import dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function check() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/reels`, {
    method: "OPTIONS",
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY || "",
    }
  });
  
  const text = await res.text();
  console.log("OPTIONS:", res.status, text);
}

check();
