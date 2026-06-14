import { useEffect, useState } from "react";
import { Activity, Users, FileVideo, FileText, Heart, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";

export function CreatorHub() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [stats, setStats] = useState({
    posts: 0,
    reels: 0,
    followers: 0,
    likes: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentUser) return;
      try {
        const [postsRes, reelsRes, followersRes, likesRes, commentsRes] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
          supabase.from("reels").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
          supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", currentUser.id),
          supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
          supabase.from("comments").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
        ]);

        setStats({
          posts: postsRes.count || 0,
          reels: reelsRes.count || 0,
          followers: followersRes.count || 0,
          likes: likesRes.count || 0,
          comments: commentsRes.count || 0,
        });
      } catch (err) {
        console.error("Error fetching creator stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
         <Activity size={32} className="text-indigo-400 animate-spin" />
      </div>
    );
  }

  const engagementRate = stats.followers > 0 ? (((stats.likes + stats.comments) / stats.followers) * 10).toFixed(1) : "0.0";

  return (
    <div className="w-full h-full p-8 md:p-12 overflow-y-auto overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Creator Analytics</h1>
          <p className="text-[var(--color-nexa-text-muted)] font-mono text-sm uppercase tracking-widest">Global Outreach & Engagement Intelligence</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/5 space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.05)] text-white">
             <div className="flex items-center gap-4 text-indigo-400">
               <FileText size={24} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Total Broadcasts</span>
             </div>
             <div className="text-5xl font-display font-bold">{stats.posts}</div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/5 space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.05)] text-white">
             <div className="flex items-center gap-4 text-fuchsia-400">
               <FileVideo size={24} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Creator Reels</span>
             </div>
             <div className="text-5xl font-display font-bold">{stats.reels}</div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/5 space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.05)] text-white">
             <div className="flex items-center gap-4 text-emerald-400">
               <Users size={24} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Total Audience</span>
             </div>
             <div className="text-5xl font-display font-bold">{stats.followers}</div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/5 space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.05)] text-white">
             <div className="flex items-center gap-4 text-rose-400">
               <Heart size={24} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Lifetime Likes</span>
             </div>
             <div className="text-5xl font-display font-bold">{stats.likes}</div>
          </div>
          
          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/5 space-y-4 shadow-[0_0_40px_rgba(99,102,241,0.05)] text-white">
             <div className="flex items-center gap-4 text-sky-400">
               <MessageSquare size={24} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Total Conversations</span>
             </div>
             <div className="text-5xl font-display font-bold">{stats.comments}</div>
          </div>

          <div className="glass p-6 md:p-8 rounded-[32px] border border-white/5 space-y-4 shadow-[0_0_40px_rgba(234,179,8,0.05)] text-white relative overflow-hidden bg-white/5">
             <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-rose-500/10 mix-blend-overlay"></div>
             <div className="relative z-10">
               <div className="flex items-center gap-4 text-amber-400">
                 <Activity size={24} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Engagement Score</span>
               </div>
               <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">{engagementRate}%</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
