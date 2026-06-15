import { useEffect, useState } from "react";
import {
  Search,
  Sparkles,
  Box,
  User,
  Image,
  Film,
  Loader2,
  UserPlus,
  UserCheck,
  MessageSquare,
  Video,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAppStore } from "../store/useAppStore";
import { useCommunicationStore } from "../store/communicationStore";

const CATEGORIES = [
  "All",
  "Cinematography",
  "3D UI",
  "Motion Graphics",
  "Photography",
  "VFX",
  "Sound Design",
];

export function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [userResults, setUserResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [reelResults, setReelResults] = useState<any[]>([]);

  const fetchProfiles = useAppStore((state) => state.fetchProfiles);
  const currentUser = useAppStore((state) => state.currentUser);
  const friendRequests = useAppStore((state) => state.friendRequests);
  const toggleFollow = useAppStore((state) => state.toggleFollow);
  const following = useAppStore((state) => state.following);
  const sendFriendRequest = useAppStore((state) => state.sendFriendRequest);
  
  const posts = useAppStore((state) => state.posts) || [];
  const users = useAppStore((state) => state.users) || {};

  const getOrCreateDirectConversation = useCommunicationStore(
    (state) => state.getOrCreateDirectConversation,
  );
  const startCall = useCommunicationStore((state) => state.startCall);
  const setActiveConversation = useCommunicationStore(
    (state) => state.setActiveConversation,
  );

  const handleMessage = async (e: any, userId: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    const conversationId = await getOrCreateDirectConversation(userId);
    if (conversationId) {
      setActiveConversation(conversationId);
      navigate(`/messages/${conversationId}`);
    }
  };

  const handleAction = (e: any, action: () => void) => {
    e.stopPropagation();
    action();
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setUserResults([]);
        setPostResults([]);
        setReelResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const [profilesRes, postsRes, reelsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .or(`name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
            .limit(10),
          supabase
            .from("posts")
            .select("*")
            .ilike("content", `%${searchQuery}%`)
            .limit(10),
          supabase
            .from("reels")
            .select("*")
            .ilike("caption", `%${searchQuery}%`)
            .limit(10),
        ]);

        if (profilesRes.data) setUserResults(profilesRes.data);

        if (postsRes.data) {
          setPostResults(postsRes.data);
          await fetchProfiles(postsRes.data.map((p) => p.user_id));
        }

        if (reelsRes.data) {
          setReelResults(reelsRes.data);
          await fetchProfiles(reelsRes.data.map((r) => r.user_id));
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchProfiles]);

  const hasResults =
    userResults.length > 0 || postResults.length > 0 || reelResults.length > 0;

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-8 overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold tracking-tight">
            Search
          </h1>
          <p className="text-[var(--color-nexa-text-muted)] text-sm mt-1 uppercase tracking-widest text-[10px]">
            Discover creators, posts, and portfolios.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <button
            onClick={() => navigate("/gallery")}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] transition-colors text-sm font-semibold text-[var(--color-nexa-accent-light)] whitespace-nowrap"
          >
            <Box size={16} /> Showcase Gallery
          </button>
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, posts..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/20 focus:bg-white/10"
            />
          </div>
        </div>
      </div>

      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 text-indigo-400">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p className="text-sm font-mono tracking-widest uppercase">
            Querying Eternal Records...
          </p>
        </div>
      ) : searchQuery.trim() ? (
        <div className="space-y-8">
          {hasResults ? (
            <>
              {userResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Users
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userResults.map((user) => {
                      const isFriend = friendRequests.some(
                        (r) =>
                          (r.senderId === currentUser?.id &&
                            r.receiverId === user.id &&
                            r.status === "accepted") ||
                          (r.receiverId === currentUser?.id &&
                            r.senderId === user.id &&
                            r.status === "accepted"),
                      );
                      const isPending = friendRequests.some(
                        (r) =>
                          r.senderId === currentUser?.id &&
                          r.receiverId === user.id &&
                          r.status === "pending",
                      );
                      const isFollowed = following[user.id];

                      return (
                        <div
                          key={user.id}
                          onClick={() =>
                            navigate(`/u/${user.username || user.id}`)
                          }
                          className="flex flex-col gap-4 p-4 rounded-2xl bg-[var(--color-nexa-dark)] border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                user.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                              }
                              alt={user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-sm text-white truncate">
                                {user.name}
                              </div>
                              <div className="text-xs text-indigo-400 truncate">
                                @{user.username}
                              </div>
                            </div>
                          </div>

                          {currentUser && currentUser.id !== user.id && (
                            <div className="flex items-center gap-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) =>
                                  handleAction(e, () => toggleFollow(user.id))
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowed ? "bg-white/10 text-white hover:bg-white/20" : "bg-indigo-500 hover:bg-indigo-400 text-white"}`}
                                title={isFollowed ? "Unfollow" : "Follow"}
                              >
                                {isFollowed ? "Following" : "Follow"}
                              </button>
                              {!isFriend && !isPending && (
                                <button
                                  onClick={(e) =>
                                    handleAction(e, () =>
                                      sendFriendRequest(user.id),
                                    )
                                  }
                                  className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors tooltip-trigger relative"
                                  title="Add Friend"
                                >
                                  <UserPlus size={16} />
                                </button>
                              )}
                              {isPending && (
                                <button
                                  className="p-2 rounded-xl bg-white/5 text-white/50 cursor-default"
                                  title="Request Pending"
                                >
                                  <UserPlus size={16} />
                                </button>
                              )}
                              {isFriend && (
                                <>
                                  <button
                                    onClick={(e) => handleMessage(e, user.id)}
                                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                                    title="Message"
                                  >
                                    <MessageSquare size={16} />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleAction(e, () =>
                                        startCall(user.id, "audio"),
                                      )
                                    }
                                    className="p-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 transition-colors"
                                    title="Audio Call"
                                  >
                                    <Phone size={16} />
                                  </button>
                                  <button
                                    onClick={(e) =>
                                      handleAction(e, () =>
                                        startCall(user.id, "video"),
                                      )
                                    }
                                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                                    title="Video Call"
                                  >
                                    <Video size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {postResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <Image size={14} /> Posts
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {postResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="p-4 rounded-2xl bg-[var(--color-nexa-dark)] border border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="text-sm text-white/80 whitespace-pre-wrap">
                          {post.content}
                        </div>
                        {post.image && (
                          <img
                            src={post.image}
                            className="mt-4 rounded-xl w-full h-32 object-cover object-center"
                            alt="Attachment"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reelResults.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <Film size={14} /> Reels
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reelResults.map((reel) => (
                      <div
                        key={reel.id}
                        onClick={() => navigate("/reels")}
                        className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group"
                      >
                        <video
                          src={reel.video}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white line-clamp-2">
                            {reel.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-white/40 font-mono tracking-widest uppercase text-sm">
              No records found in the origin network.
            </div>
          )}
        </div>
      ) : (
        <>
          {posts.length === 0 && <div className="text-center text-white/50 py-10">No content available to explore yet.</div>}

          {/* Trending Hashtags */}
          <div className="mb-8 space-y-4">
             <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
               <Sparkles size={14} /> Trending Hashtags
             </h2>
             <div className="flex flex-wrap gap-2">
                {Array.from(new Set([...posts.map(p => p.content), ...(useAppStore.getState().reels || []).map(r => r.caption)].join(' ').match(/#[\w]+/g) || [])).slice(0, 10).map((tag: string) => (
                   <button 
                     key={tag}
                     onClick={() => setSearchQuery(tag)} 
                     className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold transition-colors text-indigo-300"
                   >
                     {tag}
                   </button>
                ))}
             </div>
          </div>

          {/* Explore Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.slice(0, 16).map((post) => {
              const creator = users[post.userId];
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/5"
                >
                  <img
                    src={post.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${post.id}`}
                    alt="Explore item"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <div className="font-medium text-sm text-white line-clamp-1">
                      {post.content}
                    </div>
                    <div className="text-xs text-white/60">@{creator?.username || 'unknown'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
