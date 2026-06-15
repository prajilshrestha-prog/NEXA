import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "motion/react";
import { 
  Eye,
  Heart,
  Globe,
  Radio,
  Sparkles,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
  MoreVertical,
  Send,
  PlusSquare,
  Film,
  FolderPlus,
  Edit3
, Image as ImageIcon, Video, Music, BarChart2, MapPin, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAppStore } from "../store/useAppStore";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";

import { shareContent } from "../lib/share";
import { supabase } from "../lib/supabase";

const PostCard = ({ post }: { post: any }) => {
  const users = useAppStore((state) => state.users) || {};
  const currentUser = useAppStore((state) => state.currentUser);
  const likePost = useAppStore((state) => state.likePost) || (async () => {});
  const repostPost =
    useAppStore((state) => state.repostPost) || (async () => {});
  const deletePost =
    useAppStore((state) => state.deletePost) || (async () => {});
  const toggleSave =
    useAppStore((state) => state.toggleSave) || (async () => {});
  const toggleFollow =
    useAppStore((state) => state.toggleFollow) || (async () => {});
  const likedPosts = useAppStore((state) => state.likedPosts) || {};
  const savedPosts = useAppStore((state) => state.savedPosts) || {};
  const repostedPosts = useAppStore((state) => state.repostedPosts) || {};
  const following = useAppStore((state) => state.following) || {};
  const commentsMap = useAppStore((state) => state.comments) || {};
  const addComment =
    useAppStore((state) => state.addComment) || (async () => {});
  const likeComment =
    useAppStore((state) => state.likeComment) || (async () => {});

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [postMenuOpen, setPostMenuOpen] = useState<string | null>(null);

  const fetchComments =
    useAppStore((state) => state.fetchComments) || (async () => {});

  if (!post) return null;

  const user = users[post.userId];

  const allPosts = useAppStore((state) => state.posts) || [];
  const originalPost = post.originalPostId
    ? allPosts.find((p) => p.id === post.originalPostId)
    : null;
  const originalUser = originalPost ? users[originalPost.userId] : null;

  if (post.originalPostId && !originalPost) {
    return (
      <div className="feed-post bg-[var(--color-nexa-dark)] border border-white/5 rounded-[32px] p-6 text-center text-white/50 text-sm">
        Original post no longer exists.
      </div>
    );
  }

  const postToRender = originalPost || post;
  const authorToRender = originalUser ||
    user || {
      id: post.userId,
      name: "Fetching Creator...",
      username: "loading",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
      verified: false,
    };

  const postComments = commentsMap[post.id] || [];

  const handleToggleComments = () => {
    if (!showComments) {
      if (postComments.length === 0 && post.comments > 0) {
        fetchComments(post.id);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText("");
  };

  const authorName = authorToRender.name || "Unknown Creator";
  const authorUsername = authorToRender.username || "unknown";

  return (
    <div className="feed-post flex flex-col gap-4 bg-[var(--color-nexa-dark)] border border-white/5 rounded-[24px] p-6 shadow-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      {originalPost && (
        <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase font-bold tracking-widest pl-15 relative z-10 mb-[-8px]">
          <Repeat2 size={12} className="text-emerald-400" />
          <span>{user?.name || "Someone"} Reposted</span>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Link to={`/u/${authorUsername || authorToRender.id}`}>
            <img
              src={
                authorToRender.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorToRender.id}`
              }
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover border border-white/10"
            />
          </Link>
          <div>
            <h3 className="font-bold text-base tracking-wide text-white flex items-center gap-1">
              <Link
                to={`/u/${authorUsername || authorToRender.id}`}
                className="hover:underline"
              >
                {authorName}
              </Link>
              {authorToRender.verified && (
                <Sparkles size={12} className="text-indigo-400" />
              )}
              {currentUser?.id !== authorToRender.id && (
                <button
                  onClick={() => toggleFollow(authorToRender.id)}
                  className={`ml-2 px-2 py-0.5 rounded-full border text-[10px] uppercase font-bold transition-colors ${following[authorToRender.id] ? "border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 bg-indigo-500/10" : "border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20"}`}
                >
                  {following[authorToRender.id] ? "Following" : "Follow"}
                </button>
              )}
            </h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
              @{authorUsername} •{" "}
              {postToRender.createdAt ? format(new Date(postToRender.createdAt), "MMM d") : "Just now"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.id === post.userId && (
            <button
              onClick={() => deletePost(post.id)}
              className="text-white/30 hover:text-rose-400 transition-colors text-[10px] uppercase font-bold tracking-widest px-2"
            >
              Delete
            </button>
          )}
          <button 
             onClick={() => setPostMenuOpen(postMenuOpen === post.id ? null : post.id)} 
             className="text-white/30 hover:text-white transition-colors relative p-2"
          >
            <MoreVertical size={20} />
          </button>
          <AnimatePresence>
            {postMenuOpen === post.id && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="absolute top-12 right-0 bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl shadow-black/50 whitespace-nowrap z-50 min-w-[200px]"
                 onClick={() => setPostMenuOpen(null)}
               >
                 <div className="flex flex-col text-sm">
                   {currentUser?.id === postToRender.userId ? (
                     <>
                       {/* Removed Edit */}
                       <button onClick={() => deletePost(post.id)} className="text-left px-4 py-2 hover:bg-white/5 text-rose-400 rounded font-medium transition-colors">Delete</button>
                       <button onClick={() => shareContent(`/post/${post.id}`, 'post')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Copy Link</button>
                       {/* Removed Pin */}
                       {/* Removed Archive */}
                       <button onClick={() => shareContent(`/post/${post.id}`, 'post')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Share</button>
                       {/* Removed Report 1 */}
                     </>
                    ) : (
                      <>
                        <button onClick={() => shareContent(`/post/${post.id}`, 'post')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Share</button>
                       <button onClick={() => shareContent(`/post/${post.id}`, 'post')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Copy Link</button>
                       <button onClick={() => toggleSave(post.id)} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Save</button>
                        <div className="h-px bg-white/10 my-1"></div>
                        {/* Removed Mute */}
                       {/* Removed Block */}
                       {/* Removed Report 2 */}
                     </>
                   )}
                  </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Post Content */}
      <div className="text-white/90 text-sm md:text-base leading-relaxed pl-15 relative z-10 markdown-body">
        {postToRender.title && <h3 className="font-bold text-lg mb-2">{postToRender.title}</h3>}
        <Markdown remarkPlugins={[remarkGfm]}>{postToRender.content}</Markdown>
      </div>

      {/* Post Image/Video (if any) */}
      {postToRender.image && (
        <div
          onClick={() => {
             const v = document.getElementById("fullscreen-viewer") as any;
             const img = document.getElementById("fullscreen-img") as HTMLImageElement;
             const vid = document.getElementById("fullscreen-vid") as HTMLVideoElement;
             v.classList.remove("hidden");
             v.classList.add("flex");
             if (postToRender.mediaType === "video") {
                vid.src = postToRender.image;
                vid.classList.remove("hidden");
                img.classList.add("hidden");
             } else {
                img.src = postToRender.image;
                img.classList.remove("hidden");
                vid.classList.add("hidden");
             }
          }}
          className="mt-2 ml-15 relative rounded-2xl overflow-hidden bg-black/50 border border-white/10 cursor-pointer group z-10 w-full flex items-center justify-center"
          style={{ maxHeight: "800px" }}
        >
          {postToRender.mediaType === "video" ? (
            <video
              src={postToRender.image}
              preload="metadata"
              controls
              playsInline
              className="max-w-full max-h-[800px] object-contain transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <img
              src={postToRender.image}
              alt="Post"
              loading="lazy"
              decoding="async"
              className="max-w-full max-h-[800px] object-contain transition-transform duration-1000 group-hover:scale-105"
            />
          )}
        </div>
      )}

      {/* Music Card */}
      {postToRender.musicUrl && (
        <div className="mt-4 ml-15 bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3 relative z-10 max-w-sm hover:bg-white/10 transition-colors">
           <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-fuchsia-500/40 animate-pulse"></div>
             <Music size={18} className="text-indigo-400 relative z-10" />
           </div>
           <div className="flex-1 min-w-0 pr-4">
             <div className="text-white text-sm font-bold truncate">{(postToRender as any).musicTitle || "Unknown Track"}</div>
             <div className="text-white/50 text-[10px] font-mono truncate">{(postToRender as any).musicArtist || "Unknown Artist"}</div>
           </div>
           <audio controls src={postToRender.musicUrl} className="w-full absolute inset-0 opacity-0 cursor-pointer z-20" />
        </div>
      )}

      {/* Interactive Action Bar */}
      <div className="flex items-center justify-between mt-4 ml-15 pt-4 border-t border-white/5 relative z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={() => likePost(postToRender.id)}
            className={`flex items-center gap-2 transition-colors group ${likedPosts[postToRender.id] ? "text-rose-400" : "text-white/50 hover:text-rose-400"}`}
          >
            <Heart
              size={18}
              fill={likedPosts[postToRender.id] ? "currentColor" : "none"}
              className="group-active:scale-75 transition-transform"
            />
            <span className="text-xs font-mono">{postToRender.likes}</span>
          </button>
          <button
            onClick={handleToggleComments}
            className={`flex items-center gap-2 transition-colors group ${showComments ? "text-indigo-400" : "text-white/50 hover:text-indigo-400"}`}
          >
            <MessageCircle size={18} />
            <span className="text-xs font-mono">{postToRender.comments}</span>
          </button>
          <button
            onClick={() => repostPost(postToRender.id)}
            className={`flex items-center gap-2 transition-colors group ${repostedPosts[postToRender.id] ? "text-emerald-400" : "text-white/50 hover:text-emerald-400"}`}
          >
            <Repeat2 size={18} />
            <span className="text-xs font-mono">{postToRender.reposts}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleSave(postToRender.id)}
            className={`transition-colors ${savedPosts[postToRender.id] ? "text-indigo-400" : "text-white/50 hover:text-white"}`}
          >
            <Bookmark
              size={18}
              fill={savedPosts[postToRender.id] ? "currentColor" : "none"}
            />
          </button>
          <button 
             onClick={() => shareContent(`/post/${postToRender.id}`, 'post')}
             className="text-white/50 hover:text-white transition-colors"
          >
            <Share size={18} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-15 overflow-hidden flex flex-col gap-4 relative z-10"
          >
            {/* Comment Input */}
            <div className="flex items-center gap-3 mt-4">
              <img
                src={
                  currentUser?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || "d"}`
                }
                className="w-8 h-8 rounded-full object-cover"
                alt="User"
              />
              <div className="flex-1 flex items-center bg-white/5 rounded-full border border-white/10 pr-2 pl-4 py-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-white/30 h-8"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="p-1.5 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors disabled:opacity-50 text-white"
                >
                  <Send size={14} className="translate-x-px" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex flex-col gap-4 mt-4">
              {postComments.map((comment) => {
                const author = users[comment.userId];
                return (
                  <div key={comment.id} className="flex gap-3">
                    <Link to={`/u/${author?.username || author?.id}`}>
                      <img
                        src={
                          author?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.id || "d"}`
                        }
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="bg-white/5 p-3 rounded-2xl rounded-tl-sm text-sm">
                        <Link
                          to={`/u/${author?.username || author?.id}`}
                          className="font-bold text-white mb-0.5 hover:underline block"
                        >
                          {author?.name}
                        </Link>
                        <div className="text-white/80">{comment.content}</div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 ml-2">
                        <span className="text-[10px] text-white/40">
                          {format(new Date(comment.createdAt), "HH:mm")}
                        </span>
                        <button
                          onClick={() => likeComment(post.id, comment.id)}
                          className="text-[10px] text-white/40 hover:text-rose-400 font-bold transition-colors"
                        >
                          Like ({comment.likes})
                        </button>
                        <button className="text-[10px] text-white/40 hover:text-white font-bold transition-colors">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Home() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const posts = useAppStore((state) => state.posts) || [];
  
  const fetchPosts =
    useAppStore((state) => state.fetchPosts) || (async () => {});
  const fetchInteractions =
    useAppStore((state) => state.fetchInteractions) || (async () => {});

  useEffect(() => {
    try {
      fetchPosts();
      useAppStore.getState().fetchReels();
      fetchInteractions();
    } catch (e) {
      console.error("Fetch error:", e);
    }
  }, [fetchPosts, fetchInteractions]);

  const reels = useAppStore((state) => state.reels) || [];

  const getTrendingTags = () => {
    const tagsMap: Record<string, { count: number, score: number }> = {};
    posts.forEach(p => {
      const tags = p.content?.match(/#[\w]+/g);
      if (tags) {
        tags.forEach(t => {
          if (!tagsMap[t]) tagsMap[t] = { count: 0, score: 0 };
          tagsMap[t].count += 1;
          tagsMap[t].score += 1 + p.likes + (p.comments || 0);
        });
      }
    });
    reels.forEach(r => {
      const tags = r.caption?.match(/#[\w]+/g);
      if (tags) {
        tags.forEach(t => {
          if (!tagsMap[t]) tagsMap[t] = { count: 0, score: 0 };
          tagsMap[t].count += 1;
          tagsMap[t].score += 1 + r.likes + (r.comments || 0);
        });
      }
    });
    return Object.entries(tagsMap).map(([tag, data]) => ({ tag, count: data.count, score: data.score })).sort((a, b) => b.score - a.score).slice(0, 10);
  };

  const trendingTags = getTrendingTags();

  const users = useAppStore((state) => state.users) || {};
  const suggestedCreators = Object.values(users)
    .filter(u => u.id !== currentUser?.id && !useAppStore.getState().following[u.id])
    .sort((a, b) => ((b.followersCount || 0) + (b.followingCount || 0)) - ((a.followersCount || 0) + (a.followingCount || 0)))
    .slice(0, 5);

  return (
    <div className="w-full h-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto">
      {/* Welcome Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-nexa-dark)]/80 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <img 
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || "d"}`}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-white/10"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Welcome back, {currentUser?.name?.split(' ')[0] || "Creator"}
            </h1>
            <p className="text-sm text-white/50">
              Ready to share your next masterpiece?
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
             onClick={() => navigate('/create')}
             className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl transition-colors font-bold text-sm"
          >
            <PlusSquare size={16} /> Create Post
          </button>
          <button 
             onClick={() => navigate('/reels')}
             className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors font-bold text-sm border border-white/5"
          >
            <Film size={16} /> Upload Reel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Stories & Notes Bar */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1 relative z-20">
             <div onClick={() => navigate('/create?type=story')} className="shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-16 h-16 rounded-full border-2 border-white/20 border-dashed flex items-center justify-center bg-white/5 transition-colors group-hover:bg-white/10 group-hover:border-indigo-400">
                   <PlusSquare size={24} className="text-white/40 group-hover:text-indigo-400" />
                </div>
                <span className="text-xs text-white/50 font-medium">Your Story</span>
             </div>
             {useAppStore.getState().stories?.map((story) => {
                const author = users[story.userId];
                return (
                   <div 
                      key={story.id} 
                      onClick={() => navigate(`/story/${story.id}`)} 
                      className="shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
                   >
                      <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-fuchsia-500">
                         <img 
                            src={author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`} 
                            className="w-full h-full rounded-full object-cover border-2 border-black" 
                         />
                      </div>
                      <span className="text-xs text-white/90 font-medium">{author?.username || 'user'}</span>
                   </div>
                );
             })}
          </div>

          {/* Post Composer */}
          <div className="bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-3xl p-4 flex gap-4">
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || "d"}`} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" />
            <div className="flex-1">
               <textarea 
                  id="home-composer-text"
                  placeholder="What's inspiring you today?" 
                  className="w-full bg-transparent text-white placeholder-white/30 resize-none outline-none text-sm min-h-[60px] py-2"
               ></textarea>
               
               <div id="home-composer-preview" className="hidden mt-2 relative w-full h-32 rounded-xl bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center">
                  <button onClick={() => {
                     const preview = document.getElementById('home-composer-preview') as HTMLElement;
                     const img = document.getElementById('home-composer-img') as HTMLImageElement;
                     const vid = document.getElementById('home-composer-vid') as HTMLVideoElement;
                     const fileInput = document.getElementById('home-composer-file') as HTMLInputElement;
                     preview.classList.add('hidden');
                     img.src = '';
                     img.classList.add('hidden');
                     vid.src = '';
                     vid.classList.add('hidden');
                     fileInput.value = '';
                  }} className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-1.5 rounded-full z-10 transition-colors">
                     <PlusSquare size={14} className="rotate-45" />
                  </button>
                  <img id="home-composer-img" src="" className="hidden w-full h-full object-cover" />
                  <video id="home-composer-vid" src="" className="hidden w-full h-full object-cover" autoPlay muted loop />
               </div>

               <div id="home-composer-music" className="hidden mt-2 relative w-full rounded-xl bg-indigo-900/40 border border-indigo-500/30 p-3 flex items-center gap-3">
                  <Music className="text-indigo-400" size={16} />
                  <input id="home-composer-music-url" type="text" placeholder="Spotify/SoundCloud track URL..." className="bg-transparent text-white text-xs outline-none flex-1 placeholder-indigo-300/50" />
                  <button onClick={() => {
                     document.getElementById('home-composer-music')?.classList.add('hidden');
                     (document.getElementById('home-composer-music-url') as HTMLInputElement).value = '';
                  }} className="text-white/50 hover:text-white"><PlusSquare size={14} className="rotate-45" /></button>
               </div>
               
               <input type="file" id="home-composer-file" className="hidden" accept="image/*,video/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  const preview = document.getElementById('home-composer-preview') as HTMLElement;
                  const img = document.getElementById('home-composer-img') as HTMLImageElement;
                  const vid = document.getElementById('home-composer-vid') as HTMLVideoElement;
                  preview.classList.remove('hidden');
                  if (file.type.startsWith('video/')) {
                     vid.src = url;
                     vid.classList.remove('hidden');
                     img.classList.add('hidden');
                  } else {
                     img.src = url;
                     img.classList.remove('hidden');
                     vid.classList.add('hidden');
                  }
               }} />

               <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-3 mt-2 gap-2">
                 <div className="flex gap-1 text-white/50">
                    <button onClick={() => {
                       const input = document.getElementById('home-composer-file') as HTMLInputElement;
                       input.accept = 'image/*';
                       input.click();
                    }} className="p-2 hover:bg-white/5 rounded-full hover:text-indigo-400 transition-colors" title="Add Image"><ImageIcon size={18} /></button>
                    
                    <button onClick={() => {
                       const input = document.getElementById('home-composer-file') as HTMLInputElement;
                       input.accept = 'video/*';
                       input.click();
                    }} className="p-2 hover:bg-white/5 rounded-full hover:text-indigo-400 transition-colors" title="Add Video"><Video size={18} /></button>
                    
                    <button onClick={() => navigate('/reels')} className="p-2 hover:bg-white/5 rounded-full hover:text-indigo-400 transition-colors" title="Add Reel"><Film size={18} /></button>
                    
                    <button onClick={() => {
                       const musicPanel = document.getElementById('home-composer-music') as HTMLElement;
                       musicPanel.classList.remove('hidden');
                    }} className="p-2 hover:bg-white/5 rounded-full hover:text-indigo-400 transition-colors" title="Add Music"><Music size={18} /></button>
                    
                    <button onClick={() => navigate('/create')} className="p-2 hover:bg-white/5 rounded-full hover:text-indigo-400 transition-colors" title="Add Poll/Location"><MoreVertical size={18} /></button>
                 </div>
                 <button onClick={async () => {
                    const textArea = document.getElementById('home-composer-text') as HTMLTextAreaElement;
                    const fileInput = document.getElementById('home-composer-file') as HTMLInputElement;
                    const musicInput = document.getElementById('home-composer-music-url') as HTMLInputElement;
                    
                    const content = textArea.value.trim();
                    const file = fileInput.files?.[0];
                    const musicUrl = musicInput.value.trim() || undefined;
                    
                    if (!content && !file && !musicUrl) return;

                    const btn = event?.currentTarget as HTMLButtonElement;
                    const originalText = btn.innerText;
                    if (btn) {
                       btn.innerText = 'Posting...';
                       btn.disabled = true;
                    }

                    try {
                       let mediaUrl = undefined;
                       let mediaType = undefined;

                       if (file) {
                          const ext = file.name.split('.').pop();
                          const path = `${currentUser?.id}/${Date.now()}.${ext}`;
                          const { data: uploadData, error: uploadError } = await supabase.storage.from("media").upload(path, file);
                          if (uploadError) {
                             console.error(uploadError);
                          } else if (uploadData) {
                             const urlRes = supabase.storage.from("media").getPublicUrl(uploadData.path);
                             mediaUrl = urlRes.data.publicUrl;
                             mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                          }
                       }

                       await useAppStore.getState().addPost({
                          userId: currentUser!.id,
                          content,
                          image: mediaUrl,
                          mediaType: mediaType as any,
                          musicUrl,
                          musicTitle: musicUrl ? 'Attached Track' : undefined
                       });

                       textArea.value = '';
                       fileInput.value = '';
                       musicInput.value = '';
                       document.getElementById('home-composer-music')?.classList.add('hidden');
                       document.getElementById('home-composer-preview')?.classList.add('hidden');
                       document.getElementById('home-composer-img')?.classList.add('hidden');
                       document.getElementById('home-composer-vid')?.classList.add('hidden');
                    } catch (e) {
                       console.error(e);
                    } finally {
                       if (btn) {
                          btn.innerText = originalText;
                          btn.disabled = false;
                       }
                    }
                 }} className="bg-white hover:bg-gray-200 text-black px-5 py-1.5 rounded-full text-xs font-bold transition-colors">Post</button>
               </div>
            </div>
          </div>

          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Intersection Observer target for infinite scroll */}
          {useAppStore((state) => state.hasMorePosts) && (
            <div
               className="h-10 w-full flex items-center justify-center p-4 mt-4 bg-transparent"
               ref={(el) => {
                 if (el) {
                   const observer = new IntersectionObserver((entries) => {
                     if (entries[0].isIntersecting) {
                       observer.disconnect();
                       fetchPosts(posts.length);
                     }
                   });
                   observer.observe(el);
                 }
               }}
            >
               <span className="text-white/30 text-sm animate-pulse">Loading more posts...</span>
            </div>
          )}
        </div>

        {/* Discovery Sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* Suggested Creators */}
          <div className="bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-3xl p-6">
            <h3 className="text-white font-bold mb-4 font-display">Suggested Creators</h3>
            <div className="flex flex-col gap-4">
              {suggestedCreators.length > 0 ? (
                suggestedCreators.map((creator) => (
                    <div key={creator.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <img src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.id}`} className="w-10 h-10 rounded-full border border-white/10 object-cover" alt="Creator" />
                        <div>
                          <div onClick={() => navigate(`/u/${creator.username}`)} className="font-semibold text-sm text-white group-hover:underline cursor-pointer">{creator.name}</div>
                          <div className="text-xs text-white/50">{creator.bio ? creator.bio.slice(0, 20) : "Creator"}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => useAppStore.getState().toggleFollow(creator.id)}
                        className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors"
                      >
                        Follow
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-xs text-white/50 py-4 text-center">No creators available yet</div>
              )}
            </div>
          </div>

          {/* Trending Creators */}
          <div className="bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-3xl p-6">
            <h3 className="text-white font-bold mb-4 font-display">Trending Now</h3>
            <div className="flex flex-col gap-4">
              {trendingTags.length > 0 ? (
                trendingTags.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-indigo-400">{t.tag}</span>
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Top {i + 1}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-white/60">
                      <span>{t.count.toLocaleString()} Posts</span>
                      <span>Score: {t.score.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-white/50 py-4 text-center">No trends available yet</div>
              )}
            </div>
          </div>
        </aside>
      </div>
      
      {/* Fullscreen Viewer Overlay */}
      <div id="fullscreen-viewer" className="hidden fixed inset-0 z-[200] bg-black/95 backdrop-blur-md items-center justify-center pointer-events-auto">
         <button 
           onClick={() => {
              const v = document.getElementById("fullscreen-viewer") as any;
              const vid = document.getElementById("fullscreen-vid") as HTMLVideoElement;
              v.classList.remove("flex");
              v.classList.add("hidden");
              vid.pause();
              vid.src = "";
           }}
           className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
         >
            <X size={24} />
         </button>
         <img id="fullscreen-img" src="" className="hidden max-w-full max-h-full object-contain" />
         <video id="fullscreen-vid" src="" controls autoPlay className="hidden max-w-full max-h-full object-contain" />
      </div>
    </div>
  );
}

