import { useAppStore } from "./store/useAppStore";
import { supabase } from "./lib/supabase";

async function run() {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User:", user?.id);
    
    // login as test user if needed
    if (!user) {
        console.log("No user, trying to login");
        await supabase.auth.signInWithPassword({ email: "test@example.com", password: "password123" });
    }
    
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    console.log("Token:", !!token);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    console.log("Inserting note...");
    const { data, error } = await supabase.from("notes").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        content: "Hello Note",
        expires_at: expiresAt
    }).select().single();
    
    console.log("insert res:", data, error);
}

run();
