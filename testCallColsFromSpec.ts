import dotenv from "dotenv";
dotenv.config({ path: ".env" });
async function check() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${process.env.VITE_SUPABASE_ANON_KEY}`);
  const spec = await res.json();
  console.log(spec.definitions.call_sessions.properties);
}
check();
