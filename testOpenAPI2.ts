import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env" });

async function check() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  fs.writeFileSync("openapi.json", JSON.stringify(spec, null, 2));
  console.log("Wrote openapi.json");
}

check();
