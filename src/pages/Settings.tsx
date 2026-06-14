import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Camera,
  Save,
  Palette,
  Brain,
  Globe,
  Lock,
  Bell,
  User as UserIcon,
  Layout,
  Eye,
  Fingerprint,
  Zap,
  Loader2,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAppStore } from "../store/useAppStore";
import { uploadMedia } from "../lib/upload";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");

  const currentUser = useAppStore((state) => state.currentUser);
  const updateProfile =
    useAppStore((state) => state.updateProfile) || (async () => {});

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
      setAvatarUrl(currentUser.avatar || "");
      setBannerUrl(currentUser.banner || "");
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
      setBannerUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      let finalAvatar = avatarUrl;
      let finalBanner = bannerUrl;

      if (avatarFile) {
        finalAvatar = await uploadMedia(avatarFile, "avatars");
        setAvatarUrl(finalAvatar);
      }
      if (bannerFile) {
        finalBanner = await uploadMedia(bannerFile, "banners");
        setBannerUrl(finalBanner);
      }

      await updateProfile({
        name,
        username,
        bio,
        avatar: finalAvatar,
        banner: finalBanner,
      });

      setAvatarFile(null);
      setBannerFile(null);
    } catch (e) {
      console.error(e);
      // Fallback alert
      alert("Save failed, check console for details");
    } finally {
      setIsSaving(false);
    }
  };

  const THEMES = [
    { id: "elegant-dark", name: "Elegant Dark", preview: "bg-[#050505]" },
    {
      id: "cyberpunk",
      name: "Cyberpunk",
      preview: "bg-[#090014] border-fuchsia-500",
    },
    {
      id: "corporate",
      name: "Corporate Grid",
      preview: "bg-[#0c0c0c] border-blue-500",
    },
    {
      id: "horror",
      name: "Nostromo / Horror",
      preview: "bg-[#1a0f0f] border-red-900",
    },
    { id: "music", name: "Synthwave", preview: "bg-[#090014] border-pink-500" },
  ];

  const TABS = [
    { id: "account", label: "Account", icon: UserIcon },
    { id: "security", label: "Security", icon: Lock },
    { id: "privacy", label: "Privacy", icon: Eye },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "blocked", label: "Blocked Users", icon: UserIcon },
    { id: "export", label: "Data Export", icon: Save },
  ];

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col md:flex-row gap-8 overflow-y-auto">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h1 className="text-3xl font-display font-bold tracking-tight mb-8">
          Settings
        </h1>

        <div className="flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide pb-4 md:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all whitespace-nowrap md:whitespace-normal font-semibold text-sm ${activeTab === tab.id ? "bg-[var(--color-nexa-accent)] text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]" : "glass hover:bg-white/10 text-[var(--color-nexa-text-muted)] hover:text-white"}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl space-y-8 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {activeTab === "account" && (
            <>
              <div className="glass p-8 rounded-[32px] border border-white/5 space-y-8 relative overflow-hidden">
                {/* Banner & Avatar Edit */}
                <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt="Banner"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full glass font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors">
                      <Camera size={14} /> Update Cinematic Banner
                    </div>
                  </label>
                </div>

                <div className="relative -mt-16 ml-8 group w-max">
                  <img
                    src={
                      avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || "d"}`
                    }
                    className="w-24 h-24 rounded-2xl border-4 border-[var(--color-nexa-dark)] object-cover bg-black"
                    alt="Avatar"
                  />
                  <label className="absolute inset-0 bg-black/60 rounded-2xl border-4 border-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Camera size={20} className="text-white" />
                  </label>
                </div>

                {/* Core Info */}
                <div className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-nexa-text-muted)]">
                        Digital Alias
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-nexa-accent)] transition-colors text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-nexa-text-muted)]">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-nexa-accent)] transition-colors text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-nexa-text-muted)]">
                      Cinematic Bio
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell your story..."
                      className="w-full bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-nexa-accent)] transition-colors text-white resize-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "appearance" && (
              <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Palette
                    size={20}
                    className="text-[var(--color-nexa-accent)]"
                  />{" "}
                  Platform Atmosphere
                </h3>
                <p className="text-sm text-[var(--color-nexa-text-muted)]">
                  Select your primary visual ecosystem. This affects your
                  profile presence, live rooms, and UI mechanics.
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${theme === t.id ? "bg-white/10 border-[var(--color-nexa-accent)] shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-[var(--color-glass-surface)] border-[var(--color-glass-border)] hover:bg-white/5"}`}
                    >
                      <div
                        className={`w-full h-8 rounded border ${t.preview}`}
                      ></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-center">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
          )}

          {activeTab === "security" && (
            <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lock size={24} className="text-emerald-400" /> Security
              </h3>
              <p className="text-sm text-[var(--color-nexa-text-muted)]">
                Manage your password and active sessions.
              </p>

              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] mt-8">
                  <h4 className="font-bold text-sm mb-4">Password Recovery</h4>
                  <div className="flex gap-4 items-center">
                     <form 
                       className="flex gap-4 flex-1 items-center"
                       onSubmit={async (e) => {
                         e.preventDefault();
                         const formData = new FormData(e.currentTarget);
                         const pwd = formData.get("password") as string;
                         if (pwd && pwd.length >= 6) {
                           const { supabase } = await import("../lib/supabase");
                           const { error } = await supabase.auth.updateUser({ password: pwd });
                           if (error) alert(error.message);
                           else alert("Password updated successfully");
                           (e.target as HTMLFormElement).reset();
                         } else {
                           alert("Password must be at least 6 characters.");
                         }
                       }}
                     >
                       <input 
                         name="password"
                         type="password" 
                         placeholder="New Password" 
                         className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white" 
                       />
                       <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold text-sm hover:bg-indigo-500/40 transition-colors border border-indigo-500/30 font-mono uppercase tracking-widest whitespace-nowrap">
                         Update
                       </button>
                     </form>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                     onClick={async () => {
                       const { supabase } = await import("../lib/supabase");
                       await supabase.auth.signOut();
                       useAppStore.getState().setCurrentUser(null);
                     }}
                     className="w-full flex justify-center py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500/20 transition-colors border border-rose-500/20 uppercase tracking-widest font-mono text-xs"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Eye size={24} className="text-indigo-400" /> Privacy
              </h3>
              <p className="text-sm text-[var(--color-nexa-text-muted)]">
                Control who can see your profile and activity.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Private Account</h4>
                    <p className="text-xs text-[var(--color-nexa-text-muted)] mt-1">
                      Only approved followers can see what you share.
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Bell size={24} className="text-amber-400" /> Notifications
              </h3>
              <p className="text-sm text-[var(--color-nexa-text-muted)]">
                Control your notification preferences.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="p-4 rounded-2xl bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Push Notifications</h4>
                    <p className="text-xs text-[var(--color-nexa-text-muted)] mt-1">
                      Receive alerts on your device.
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "blocked" && (
            <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserIcon size={24} className="text-rose-400" /> Blocked Users
              </h3>
              <p className="text-sm text-[var(--color-nexa-text-muted)]">
                You haven't blocked anyone yet.
              </p>
            </div>
          )}

          {activeTab === "export" && (
            <div className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Save size={24} className="text-blue-400" /> Download Data
              </h3>
              <p className="text-sm text-[var(--color-nexa-text-muted)]">
                Request a copy of your personal data on Nexa.
              </p>
              <button className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors">
                Request Data Export
              </button>
            </div>
          )}
        </motion.div>

        {/* Fixed Save Bar */}
        <div className="sticky bottom-4 w-full flex justify-end z-20">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-nexa-accent)] text-white font-bold text-sm tracking-tight shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Synchronizing..." : "Synchronize Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
