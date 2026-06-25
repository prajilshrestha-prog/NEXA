import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreVertical,
  Music,
  Sparkles,
  Plus,
  Loader2,
  Bookmark,
  Repeat,
  X,
  Eye
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { uploadMedia } from "../lib/upload";
import { shareContent } from "../lib/share";
import { useNavigate } from "react-router-dom";

export function Reels() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  const users = useAppStore((state) => state.users) || {};
  const reels = useAppStore((state) => state.reels) || [];
  const currentUser = useAppStore((state) => state.currentUser);
  const addReel = useAppStore((state) => state.addReel) || (async () => {});
  const likeReel = useAppStore((state) => state.likeReel) || (async () => {});
  const toggleSaveReel = useAppStore((state) => state.toggleSaveReel) || (async () => {});
  const repostReel = useAppStore((state) => state.repostReel) || (async () => {});
  const likedReels = useAppStore((state) => state.likedReels) || {};
  const savedReels = useAppStore((state) => state.savedReels) || {};
  const repostedReels = useAppStore((state) => state.repostedReels) || {};

  const fetchReels = useAppStore((state) => state.fetchReels) || (async () => {});
  const navigate = useNavigate();
  const fetchReelComments = useAppStore((state) => state.fetchReelComments) || (async () => {});
  const addReelComment = useAppStore((state) => state.addReelComment) || (async () => {});
  const deleteReelComment = useAppStore((state) => state.deleteReelComment) || (async () => {});
  const comments = useAppStore((state) => state.comments) || {};
  const [commentPanelOpenFor, setCommentPanelOpenFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const handleOpenComments = (reelId: string) => {
    setCommentPanelOpenFor(reelId);
    if (!comments[reelId]) {
      fetchReelComments(reelId);
    }
  };

  const handlePostComment = async (reelId: string) => {
    if (!commentText.trim()) return;
    await addReelComment(reelId, commentText.trim());
    setCommentText("");
  };

  const handleDeleteComment = async (reelId: string, commentId: string) => {
     await deleteReelComment(reelId, commentId);
  };

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const viewedReels = useRef<Set<string>>(new Set());

  useEffect(() => {
     if (reels.length > 0 && reels[activeIndex]) {
        const reelId = reels[activeIndex].id;
        if (!viewedReels.current.has(reelId)) {
          viewedReels.current.add(reelId);
          useAppStore.getState().viewReel(reelId);
        }
     }
  }, [activeIndex, reels]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      const index = Math.round(scrollY / height);
      setActiveIndex(index);
    };

    containerRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      containerRef.current?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      try {
        setIsUploading(true);
        setUploadProgress(0);
        const file = e.target.files[0];
        const publicUrl = await uploadMedia(file, "media", setUploadProgress);

        await addReel({
          userId: currentUser.id,
          video: publicUrl,
          caption: "New dimensional rendering.",
          music: "Original Audio",
        });

        if (containerRef.current) containerRef.current.scrollTop = 0;
      } catch (err) {
        console.error("Upload reel failed", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="w-full h-full bg-black flex justify-center overflow-hidden relative">
      {/* Upload Button */}
      {currentUser && (
        <div className="absolute top-6 right-6 z-50">
          <label
            className={`flex items-center gap-2 px-4 py-2 relative overflow-hidden ${isUploading ? "cursor-not-allowed border-indigo-500 bg-indigo-500/20 text-indigo-400" : "bg-indigo-500/20 hover:bg-indigo-500/40 cursor-pointer"} text-indigo-400 border border-indigo-500/30 rounded-full transition-colors backdrop-blur-md`}
          >
            {isUploading && (
              <div
                className="absolute inset-y-0 left-0 bg-indigo-500/40 transition-all pointer-events-none"
                style={{ width: `${uploadProgress}%` }}
              />
            )}
            <div className="relative z-10 flex items-center gap-2">
              {isUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              <span className="text-xs font-bold uppercase tracking-widest">
                {isUploading ? `Uploading (${uploadProgress}%)` : "New Reel"}
              </span>
            </div>
            <input
              type="file"
              accept="video/*,image/*"
              className="hidden"
              disabled={isUploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full max-w-lg h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative"
      >
        {reels.map((reel, index) => {
          const user = users[reel.userId] || {
            id: reel.userId,
            name: "Fetching Entity...",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.userId}`,
            verified: false,
          };
          const isActive = index === activeIndex;
          // Virtualize: Only render media elements if within +/- 2 of active index
          const shouldRenderMedia = Math.abs(index - activeIndex) <= 2;
          const isVideo = reel.video?.match(/\.(mp4|webm|mov|ogg)(\?.*)?$/i);
          const isImage = !isVideo;

          return (
            <div
              key={reel.id}
              className="w-full h-full snap-start relative bg-black"
            >
              {shouldRenderMedia ? (
                isImage ? (
                  <img
                    src={reel.video}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={reel.caption}
                  />
                ) : (
                  <video
                    src={reel.video}
                    autoPlay={isActive}
                    loop
                    muted={!isActive} // mute inactive to allow browser autoplay policies to be less annoying
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 w-full h-full bg-[var(--color-nexa-dark)] flex flex-col items-center justify-center text-white/10">
                  <span className="text-[10px] font-mono tracking-widest uppercase">
                    Optimizing Render
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 pointer-events-none">
                <div className="flex justify-between items-end">
                  {/* Left Bottom */}
                  <div className="flex-1 pointer-events-auto pr-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={
                          user?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "a"}`
                        }
                        alt={user?.name}
                        className="w-12 h-12 rounded-full border border-white/20"
                      />
                      <div>
                        <h3 className="font-bold text-white flex items-center gap-1">
                          {user?.name}{" "}
                          {user?.verified && (
                            <Sparkles size={12} className="text-indigo-400" />
                          )}
                        </h3>
                        <button className="px-3 py-1 mt-1 rounded-full border border-white/30 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors">
                          Synchronize
                        </button>
                      </div>
                    </div>
                    <p className="text-white text-sm mb-4 max-w-sm">
                      {reel.caption}
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-full bg-white/10 backdrop-blur-md w-max border border-white/10">
                      <Music size={14} className="text-white animate-pulse" />
                      <span className="text-xs text-white font-mono">
                        {reel.music}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col gap-6 items-center pointer-events-auto mb-4 relative z-50">
                    <div className="relative group/reaction">
                       <button
                         onClick={() => likeReel(reel.id, likedReels[reel.id] || "❤️")}
                         className="flex flex-col items-center gap-1 group"
                       >
                         <div className={`p-3 rounded-full backdrop-blur-md border transition-colors ${likedReels[reel.id] ? "bg-black/40 border-white/10" : "bg-black/40 border-white/10 group-hover:bg-rose-500/20"}`}>
                           {likedReels[reel.id] ? (
                              <span className="text-2xl leading-none select-none">{likedReels[reel.id]}</span>
                           ) : (
                              <Heart
                                size={24}
                                className="text-white group-hover:text-rose-400"
                              />
                           )}
                         </div>
                         <span className="text-xs text-white font-bold drop-shadow-md">
                           {reel.likes > 0 ? reel.likes : "Like"}
                         </span>
                       </button>
                       <div className="absolute right-[110%] top-0 mr-4 invisible opacity-0 group-hover/reaction:visible group-hover/reaction:opacity-100 transition-all duration-200">
                          <div className="flex flex-col-reverse bg-black/90 backdrop-blur-md rounded-full shadow-lg border border-white/10 p-1.5 gap-2">
                             {["❤️", "😂", "😮", "😢", "🔥", "👏"].map(reaction => (
                                <button 
                                   key={reaction}
                                   onClick={() => likeReel(reel.id, reaction)}
                                   className="p-2 text-2xl hover:scale-125 transition-transform origin-right cursor-pointer select-none"
                                >
                                   {reaction}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                    
                    <button onClick={() => handleOpenComments(reel.id)} className="flex flex-col items-center gap-1 group">
                      <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:bg-indigo-500/20 transition-colors">
                        <MessageCircle
                          size={24}
                          className="text-white group-hover:text-indigo-400"
                        />
                      </div>
                      <span className="text-xs text-white font-bold">
                        {reel.comments}
                      </span>
                    </button>

                    <button 
                       onClick={() => toggleSaveReel(reel.id)}
                       className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`p-3 rounded-full backdrop-blur-md border transition-colors ${savedReels[reel.id] ? "bg-amber-500/20 border-amber-500/50" : "bg-black/40 border-white/10 group-hover:bg-amber-500/20"}`}>
                        <Bookmark
                          size={24}
                          className={savedReels[reel.id] ? "text-amber-500 fill-amber-500" : "text-white group-hover:text-amber-400"}
                        />
                      </div>
                    </button>

                    <button 
                       onClick={() => repostReel(reel.id)}
                       className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`p-3 rounded-full backdrop-blur-md border transition-colors ${repostedReels[reel.id] ? "bg-emerald-500/20 border-emerald-500/50" : "bg-black/40 border-white/10 group-hover:bg-emerald-500/20"}`}>
                        <Repeat
                          size={24}
                          className={repostedReels[reel.id] ? "text-emerald-500" : "text-white group-hover:text-emerald-400"}
                        />
                      </div>
                    </button>

                    <button 
                      className="flex flex-col items-center gap-1 group cursor-default"
                    >
                      <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-colors">
                        <Eye
                          size={24}
                          className="text-white/50"
                        />
                      </div>
                      <span className="text-xs text-white/50 font-bold">
                        {reel.views || 0}
                      </span>
                    </button>

                    <button 
                      onClick={() => shareContent(`/reel/${reel.id}`, 'reel')}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 group-hover:bg-emerald-500/20 transition-colors">
                        <Share
                          size={24}
                          className="text-white group-hover:text-emerald-400"
                        />
                      </div>
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setMenuOpenFor(menuOpenFor === reel.id ? null : reel.id)}
                        className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <MoreVertical size={24} className="text-white" />
                      </button>

                      <AnimatePresence>
                        {menuOpenFor === reel.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 bottom-16 bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl shadow-black/80 whitespace-nowrap z-50 min-w-[200px]"
                            onClick={() => setMenuOpenFor(null)}
                          >
                            <div className="flex flex-col text-sm">
                              {currentUser?.id === reel.userId ? (
                                <>
                                  <button onClick={() => shareContent(`/reel/${reel.id}`, 'reel')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Copy Link</button>
                                  <button onClick={() => shareContent(`/reel/${reel.id}`, 'reel')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Share</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => shareContent(`/reel/${reel.id}`, 'reel')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Share</button>
                                  <button onClick={() => shareContent(`/reel/${reel.id}`, 'reel')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Copy Link</button>
                                  <button onClick={() => toggleSaveReel(reel.id)} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Save</button>
                                  <button onClick={() => { const a = document.createElement('a'); a.href = reel.video; a.download = 'nexa-media'; a.click(); }} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Download</button>
                                  <div className="h-px bg-white/10 my-1"></div>
                                  <button onClick={() => useAppStore.getState().blockUser?.(reel.userId)} className="text-left px-4 py-2 hover:bg-white/5 text-rose-400 rounded font-medium transition-colors">Block User</button>
                                  <button onClick={() => useAppStore.getState().reportContent?.(reel.id, 'reel')} className="text-left px-4 py-2 hover:bg-white/5 text-rose-400 rounded font-medium transition-colors">Report User</button>
                                  <button onClick={() => console.log('Interested')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Interested</button>
                                  <button onClick={() => console.log('Not Interested')} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Not Interested</button>
                                  <button onClick={() => navigate(`/u/${(user as any)?.username || (user as any)?.id}`)} className="text-left px-4 py-2 hover:bg-white/5 text-white/90 rounded font-medium transition-colors">Go To Profile</button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <img
                      src={
                        user?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "a"}`
                      }
                      className="w-10 h-10 rounded-xl border-2 border-white animate-spin-slow mt-2"
                      style={{ animationDuration: "8s" }}
                      alt="Audio"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {useAppStore((state) => state.hasMoreReels) && reels.length > 0 && (
          <div
             className="w-full h-full snap-start relative bg-black flex flex-col items-center justify-center text-white/30"
             ref={(el) => {
               if (el) {
                 const observer = new IntersectionObserver((entries) => {
                   if (entries[0].isIntersecting) {
                     observer.disconnect();
                     fetchReels(reels.length);
                   }
                 });
                 observer.observe(el);
               }
             }}
          >
             <Loader2 size={32} className="animate-spin mb-4" />
             <span className="text-[10px] font-mono tracking-widest uppercase">Loading Core Render...</span>
          </div>
        )}
      </div>

      {/* Comments Panel */}
      <AnimatePresence>
        {commentPanelOpenFor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommentPanelOpenFor(null)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="fixed bottom-0 left-0 right-0 md:absolute md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-96 bg-[#0a0a0a] border-t md:border-t-0 md:border-l border-white/10 z-50 flex flex-col h-[70vh] md:h-full rounded-t-3xl md:rounded-none shadow-2xl shadow-black"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-bold text-white">Comments</h3>
                <button onClick={() => setCommentPanelOpenFor(null)} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {comments[commentPanelOpenFor]?.length > 0 ? (
                  comments[commentPanelOpenFor].map((comment) => {
                    const cUser = useAppStore.getState().users[comment.userId];
                    return (
                      <div key={comment.id} className="flex gap-3 group">
                        <img 
                          src={cUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cUser?.id || "c"}`} 
                          className="w-8 h-8 rounded-full border border-white/10" 
                          alt="" 
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                             <span className="font-bold text-sm text-white">{cUser?.name || "User"}</span>
                             <span className="text-xs text-white/30 truncate">
                               {new Date(comment.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          <p className="text-sm text-white/80 mt-1">{comment.content}</p>
                          <div className="flex gap-4 mt-2">
                             <button className="text-xs text-white/40 hover:text-white transition-colors font-medium">Reply</button>
                             {comment.userId === currentUser?.id && (
                                <button onClick={() => handleDeleteComment(commentPanelOpenFor, comment.id)} className="text-xs text-rose-500/50 hover:text-rose-400 transition-colors font-medium opacity-0 group-hover:opacity-100">Delete</button>
                             )}
                          </div>
                        </div>
                        <button className="text-white/20 hover:text-rose-500 transition-colors self-start p-1">
                          <Heart size={14} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm">
                    No comments yet. Be the first!
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-black/40">
                <div className="flex gap-2">
                  <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=me`} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePostComment(commentPanelOpenFor);
                    }}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-sm text-white outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <button 
                    onClick={() => handlePostComment(commentPanelOpenFor)}
                    disabled={!commentText.trim()}
                    className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 font-bold text-sm px-2 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
