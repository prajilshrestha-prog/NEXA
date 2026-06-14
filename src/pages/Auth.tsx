import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";

export function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setCurrentUser =
    useAppStore((state) => state.setCurrentUser) || (() => {});

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/update-password" });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // 🔐 LOGIN
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) throw signInError;

        if (!data.user) throw new Error("No user returned");

        // 👤 GET PROFILE
        const { data: fetchedProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        let profile = fetchedProfile;

        if (!profile) {
          console.warn("Profile not found on login, creating manually...");
          const emailPrefix =
            data.user.email?.split("@")[0] ||
            `user_${Math.random().toString(36).substring(2, 8)}`;
          const { data: manualProfile, error: manualError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              username: emailPrefix,
              name: emailPrefix,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
              banner: "",
              bio: "",
              website: "",
            })
            .select("*")
            .maybeSingle();

          if (manualError) throw manualError;
          profile = manualProfile;
        }

        if (profile) {
          setCurrentUser(profile);
          navigate("/"); // 🚀 FIXED: redirect to Home
        } else {
          throw new Error("Profile could not be verified");
        }
      } else {
        // 🆕 SIGN UP
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, username },
          },
        });

        if (signUpError) throw signUpError;

        const user = data.user;

        if (!user) throw new Error("No user created");

        // ⏳ wait for profile trigger (safe fallback)
        let profile = null;

        for (let i = 0; i < 5; i++) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (error) {
            console.error("Profile fetch loop error:", error);
          }

          if (!error && data) {
            profile = data;
            break;
          }

          await new Promise((r) => setTimeout(r, 500));
        }

        if (!profile) {
          // Manual fallback if trigger is missing or failed
          console.warn("Profile not found from trigger, creating manually...");
          const { data: manualProfile, error: manualError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: username,
              name: name,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
              banner: "",
              bio: "",
              website: "",
            })
            .select("*")
            .maybeSingle();

          if (manualError) throw manualError;
          profile = manualProfile;
        }

        if (profile) {
          setCurrentUser(profile);
          navigate("/"); // 🚀 FIXED NAVIGATION
        } else {
          throw new Error("Profile could not be created");
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-nexa-dark)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[var(--color-nexa-dark)]/90 to-[var(--color-nexa-dark)]" />
      </div>

      <div className="glass p-8 md:p-12 rounded-[40px] border border-white/10 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center mb-6">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">NEXA</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center rounded-xl">
            {error}
          </div>
        )}

        {isReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {resetSent ? (
              <div className="text-center text-emerald-400 text-sm py-4">
                Password reset instructions have been sent to your email.
              </div>
            ) : (
              <>
                <p className="text-white/60 text-sm mb-4 text-center">Enter your email to receive a password reset link.</p>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-white/5 text-white" required />
                <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-indigo-500 text-white flex items-center justify-center gap-2">{loading ? <Loader2 size={16} className="animate-spin" /> : null}Send Reset Link</button>
              </>
            )}
            <p className="text-center"><button type="button" onClick={() => { setIsReset(false); setError(""); setResetSent(false); }} className="text-indigo-400 text-sm">Back to Login</button></p>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <input type="text" placeholder="Display Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 rounded-xl bg-white/5 text-white" required />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl bg-white/5 text-white" required />
              </>
            )}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-white/5 text-white" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-white/5 text-white" required />
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setIsReset(true); setError(""); }} className="text-white/40 hover:text-white/60 text-xs transition-colors">Forgot password?</button>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-indigo-500 text-white flex items-center justify-center gap-2">{loading ? <Loader2 size={16} className="animate-spin" /> : null}{isLogin ? "Initiate Sync" : "Generate Identity"}</button>
          </form>
        )}

        {!isReset && (
          <p className="mt-6 text-center text-sm text-white/60">{isLogin ? "No account?" : "Already have one?"} <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-indigo-400">Switch</button></p>
        )}
      </div>
    </div>
  );
}
