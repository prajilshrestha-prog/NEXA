import { supabase } from "./src/lib/supabase";
async function run() {
  const { data, error } = await supabase.from("stories").select("*");
  console.log("Stories:", data);
}
run();
