import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Brain, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";

export function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
      if (!email.trim()) {
        throw new Error(isLogin ? "Login failed: Email is required" : "Signup failed: Email is required");
      }
      if (password.length < 6) {
        throw new Error(isLogin ? "Login failed: Password must be at least 6 characters" : "Signup failed: Password must be at least 6 characters");
      }

      if (isLogin) {
        // 🔐 LOGIN
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("Login Supabase Error:", signInError);
          throw new Error(`Login failed: ${signInError.message}`);
        }

        if (!data.user) throw new Error("Login failed: No user returned");

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
          const sessionData = await supabase.auth.getSession();
          console.log("Current session:", sessionData);
          await useAppStore.getState().initializeSession(data.user.id);
          navigate("/"); // 🚀 FIXED: redirect to Home
        } else {
          throw new Error("Login failed: Profile could not be verified");
        }
      } else {
        // 🆕 SIGN UP
        if (!username.trim()) {
            throw new Error("Signup failed: Username is required");
        }
        
        const safeName = name.trim() || username.trim();

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: safeName, username: username.trim() },
          },
        });

        if (signUpError) {
          console.error("Signup Supabase Error:", signUpError);
          if (signUpError.message.includes("Database error saving new user")) {
             throw new Error(`Signup failed: Username "${username}" might already be correctly registered, or metadata validation failed.`);
          }
          throw new Error(`Signup failed: ${signUpError.message}`);
        }

        const user = data.user;
        const session = data.session;

        if (!user) throw new Error("Signup failed: No user created");

        // Wait to make sure profile trigger succeeds. Instead of navigating away immediately,
        // we'll check if a session exists (no email verification needed). If no session, go to verify screen.
        let profile = null;

        for (let i = 0; i < 5; i++) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!error && data) {
            profile = data;
            break;
          }

          await new Promise((r) => setTimeout(r, 500));
        }

        if (!profile) {
          const { data: manualProfile, error: manualError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: username.trim(),
              name: safeName,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
              banner: "",
              bio: "",
              website: "",
            })
            .select("*")
            .maybeSingle();

          if (!manualError) {
             profile = manualProfile;
          }
        }

        if (!session) {
           setIsVerifying(true);
           setLoading(false);
           return;
        }

        if (profile) {
           await useAppStore.getState().initializeSession(user.id);
           navigate("/");
        } else {
           throw new Error("Signup failed: Profile could not be created");
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

        {isVerifying ? (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-white/60 text-sm mb-6">
              We've sent a verification link to <span className="text-white font-medium">{email}</span>. Please verify your account before continuing.
            </p>
            <div className="flex flex-col gap-3">
               <button 
                  onClick={async () => {
                     setLoading(true);
                     try {
                        const { error } = await supabase.auth.resend({ type: 'signup', email });
                        if (error) throw error;
                        setError("Verification email resent! Please check your inbox.");
                     } catch (e: any) {
                        setError(e.message || "Failed to resend.");
                     } finally {
                        setLoading(false);
                     }
                  }} 
                  disabled={loading} 
                  className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center gap-2 transition-colors border border-white/10"
               >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null} Resend Email
               </button>
               <button 
                  onClick={async () => {
                     setLoading(true);
                     try {
                        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                        if (error) {
                           if (error.message.includes("Email not confirmed")) {
                              throw new Error("Email is still not confirmed. Please check your inbox.");
                           }
                           throw error;
                        }
                        if (data.session) {
                           const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
                           if (p) {
                              await useAppStore.getState().initializeSession(data.user.id);
                              navigate("/");
                           } else {
                              window.location.reload();
                           }
                        }
                     } catch (e: any) {
                        setError(e.message || "Verification failed");
                     } finally {
                        setLoading(false);
                     }
                  }} 
                  disabled={loading} 
                  className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2 transition-colors border border-indigo-400"
               >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null} I've Verified My Email
               </button>
               <button 
                  onClick={() => {
                     setIsVerifying(false);
                     setIsLogin(true);
                     setError("");
                  }} 
                  className="text-white/40 hover:text-white/60 text-sm transition-colors mt-2"
               >
                  Back to Login
               </button>
            </div>
          </div>
        ) : isReset ? (
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
