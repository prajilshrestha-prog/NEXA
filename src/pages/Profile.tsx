import { useEffect, useState } from "react";
import { 
  Shield,
  Sparkles,
  Link as LinkIcon,
  MapPin,
  Calendar,
  Key,
  Edit3,
  X,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  MessageSquare,
  Video,
  Grid,
  Film,
  FolderOpen,
  User as UserIcon,
  Users,
  Bookmark,
  Repeat2,
  Play, Music } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore, User } from "../store/useAppStore";
import { useCommunicationStore } from "../store/communicationStore";
import { uploadMedia } from "../lib/upload";
import { supabase } from "../lib/supabase";
import { PostCard } from "./Home";
import { AnimatePresence, motion } from "motion/react";

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const currentUser = useAppStore((state) => state.currentUser);
  const posts = useAppStore((state) => state.posts) || [];
  const reels = useAppStore((state) => state.reels) || [];
  const fetchPosts = useAppStore((state) => state.fetchPosts);
  const fetchReels = useAppStore((state) => state.fetchReels);
  const updateProfile =
    useAppStore((state) => state.updateProfile) || (async () => {});
  const fetchProfileByUsername = useAppStore(
    (state) => state.fetchProfileByUsername,
  );
  const toggleFollow = useAppStore((state) => state.toggleFollow);
  const following = useAppStore((state) => state.following);
  const stories = useAppStore((state) => state.stories) || [];
  const closeFriends = useAppStore((state) => state.closeFriends || {});
  const toggleCloseFriend = useAppStore((state) => state.toggleCloseFriend);

  const friendRequests = useAppStore((state) => state.friendRequests);
  const sendFriendRequest = useAppStore((state) => state.sendFriendRequest);
  const acceptFriendRequest = useAppStore((state) => state.acceptFriendRequest);
  const declineFriendRequest = useAppStore(
    (state) => state.declineFriendRequest,
  );

  const getOrCreateDirectConversation = useCommunicationStore(
    (state) => state.getOrCreateDirectConversation,
  );
  const initiateCall = useCommunicationStore((state) => state.startCall);

  const removeFriend = useAppStore((state) => state.removeFriend);

  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts"|"reels"|"portfolio"|"about"|"saved"|"reposts"|"followers"|"following">("posts");

  useEffect(() => {
    const fetchFollowStats = async (userId: string) => {
       const [followersRes, followingRes] = await Promise.all([
          supabase.from("follows").select("id, profiles!follower_id(*)").eq("following_id", userId),
          supabase.from("follows").select("id, profiles!following_id(*)").eq("follower_id", userId)
       ]);
       
       if (!followersRes.error) {
         setFollowerCount(followersRes.data.length);
         setFollowersList(followersRes.data.map((d: any) => ({
           id: d.profiles.id,
           email: d.profiles.email || "",
           username: d.profiles.username,
           name: d.profiles.name || d.profiles.username,
           avatar: d.profiles.avatar,
           bio: d.profiles.bio,
           website: d.profiles.website,
         })) as unknown as User[]);
       }
       if (!followingRes.error) {
         setFollowingCount(followingRes.data.length);
         setFollowingList(followingRes.data.map((d: any) => ({
           id: d.profiles.id,
           email: d.profiles.email || "",
           username: d.profiles.username,
           name: d.profiles.name || d.profiles.username,
           avatar: d.profiles.avatar,
           bio: d.profiles.bio,
           website: d.profiles.website,
         })) as unknown as User[]);
       }
    };

    const loadProfile = async () => {
      setIsLoading(true);
      let user = null;
      if (username) {
        if (
          currentUser &&
          (currentUser.username === username || currentUser.id === username)
        ) {
          user = currentUser;
        } else {
          user = await fetchProfileByUsername(username);
        }
      } else {
        user = currentUser;
      }
      setDisplayUser(user);
      if (user) {
         fetchFollowStats(user.id);
      }
      setIsLoading(false);
      fetchPosts();
      fetchReels();
      useAppStore.getState().fetchStories();
    };
    loadProfile();
  }, [username, currentUser, fetchProfileByUsername, fetchPosts, fetchReels]);

  const isOwnProfile =
    currentUser && displayUser && currentUser.id === displayUser.id;
  const isFollowing = displayUser ? following[displayUser.id] : false;

  const activeFriendRequest = displayUser
    ? friendRequests.find(
        (r) =>
          (r.senderId === currentUser?.id && r.receiverId === displayUser.id) ||
          (r.receiverId === currentUser?.id && r.senderId === displayUser.id),
      )
    : null;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedReel, setSelectedReel] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    website: "",
    avatar: "",
    banner: "",
    musicTitle: "",
    musicUrl: "",
    location: "",
    creatorCategory: "",
    skills: "",
    featuredProject: "",
  });

  useEffect(() => {
    if (isOwnProfile && displayUser) {
      setEditForm({
        name: displayUser.name || "",
        username: displayUser.username || "",
        bio: displayUser.bio || "",
        website: displayUser.website || "",
        avatar: displayUser.avatar || "",
        banner: displayUser.banner || "",
        musicTitle: displayUser.musicTitle || "",
        musicUrl: displayUser.musicUrl || "",
        location: displayUser.location || "",
        creatorCategory: displayUser.creatorCategory || "",
        skills: displayUser.skills ? displayUser.skills.join(", ") : "",
        featuredProject: displayUser.featuredProject || "",
      });
    }
  }, [displayUser, isOwnProfile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let avatarUrl = editForm.avatar;
      let bannerUrl = editForm.banner;

      if (avatarFile) avatarUrl = await uploadMedia(avatarFile, "avatars");
      if (bannerFile) bannerUrl = await uploadMedia(bannerFile, "banners");

      await updateProfile({
        ...editForm,
        skills: editForm.skills ? editForm.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        avatar: avatarUrl,
        banner: bannerUrl,
      });

      setIsEditing(false);
      setAvatarFile(null);
      setBannerFile(null);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const setActiveConversation = useCommunicationStore(
    (state) => state.setActiveConversation,
  );

  const handleMessage = async () => {
    if (!displayUser || !currentUser) return;
    const conversationId = await getOrCreateDirectConversation(displayUser.id);
    if (conversationId) {
      setActiveConversation(conversationId);
      navigate(`/messages/${conversationId}`);
    } else {
      console.error("Conversation creation failed.");
    }
  };

  const handleCall = () => {
    if (!displayUser || !currentUser) return;
    initiateCall(displayUser.id, "video");
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <div className="font-mono text-xs uppercase tracking-widest">
            Loading Profile
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="w-full h-full flex items-center justify-center text-rose-400">
        <div className="flex flex-col items-center gap-4">
          <div className="font-display text-xl uppercase tracking-widest">
            Profile Not Found
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 mt-4 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-xs font-mono transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const userPosts = posts.filter(p => p.userId === displayUser.id);
  const userReels = reels.filter(r => r.userId === displayUser.id);

  return (
    <div className="w-full h-full overflow-y-auto pb-12 relative bg-[var(--color-background)]">
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg relative animate-fade-in">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6">
              Edit Profile
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none h-24"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) =>
                    setEditForm({ ...editForm, website: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Profile Song Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lofi Chill Beats"
                  value={editForm.musicTitle}
                  onChange={(e) =>
                    setEditForm({ ...editForm, musicTitle: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Profile Song URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/song.mp3"
                  value={editForm.musicUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, musicUrl: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">Location</label>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">Creator Category</label>
                <input type="text" placeholder="e.g. 3D Artist, Filmmaker" value={editForm.creatorCategory} onChange={(e) => setEditForm({...editForm, creatorCategory: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">Skills (comma separated)</label>
                <input type="text" placeholder="Unity, Blender, React" value={editForm.skills} onChange={(e) => setEditForm({...editForm, skills: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">Featured Project URL</label>
                <input type="url" placeholder="https://behance.net/..." value={editForm.featuredProject} onChange={(e) => setEditForm({...editForm, featuredProject: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {editForm.avatar && (
                    <img
                      src={editForm.avatar}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-full object-cover border border-white/20"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAvatarFile(e.target.files[0]);
                        setEditForm({
                          ...editForm,
                          avatar: URL.createObjectURL(e.target.files[0]),
                        });
                      }
                    }}
                    className="w-full text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/50 mb-2">
                  Cover Photo
                </label>
                <div className="flex flex-col gap-4">
                  {editForm.banner && (
                    <img
                      src={editForm.banner}
                      alt="Banner Preview"
                      className="w-full h-24 rounded-xl object-cover border border-white/20"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBannerFile(e.target.files[0]);
                        setEditForm({
                          ...editForm,
                          banner: URL.createObjectURL(e.target.files[0]),
                        });
                      }
                    }}
                    className="w-full text-xs text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="relative w-full h-[250px] md:h-[320px] bg-[#111]">
        {displayUser.banner ? (
          <img
            src={displayUser.banner}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-indigo-900/40 via-purple-900/20 to-black opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative z-10 -mt-24">
        {/* User Info Block */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
             <div className="relative shrink-0">
               <img
                 src={displayUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.id}`}
                 onClick={() => {
                   const uStories = stories.filter(s => s.userId === displayUser.id);
                   if (uStories.length > 0) navigate(`/story/${uStories[0].id}`);
                 }}
                 alt="Avatar"
                 className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-[var(--color-background)] bg-black ${stories.some((s) => s.userId === displayUser.id) ? 'border-indigo-400 p-1 cursor-pointer' : ''}`}
               />
               {displayUser.verified && (
                 <div className="absolute -bottom-2 -right-2 bg-indigo-500 w-10 h-10 rounded-xl flex items-center justify-center border-4 border-[var(--color-background)]">
                   <Shield size={20} className="text-white" fill="currentColor" />
                 </div>
               )}
             </div>
             <div className="space-y-1 pb-2">
               <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
                 {displayUser.name}
               </h1>
               <p className="text-base text-white/50">
                 @{displayUser.username}
               </p>
             </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto pb-2">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/10"
              >
                <Edit3 size={18} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => toggleFollow(displayUser.id)}
                  className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    isFollowing
                      ? "bg-white/5 text-white/70 hover:bg-rose-500/10 hover:text-rose-400 border border-white/10"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={() => toggleCloseFriend?.(displayUser.id)}
                  title="Toggle Close Friend"
                  className={`px-4 py-3 rounded-xl transition-colors border ${
                     closeFriends[displayUser.id] 
                       ? "bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30" 
                       : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  ⭐
                </button>
                <button
                  onClick={handleMessage}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                >
                  <MessageSquare size={20} />
                </button>
                {activeFriendRequest ? (
                  activeFriendRequest.status === "accepted" ? (
                    <button
                      onClick={() => removeFriend(displayUser.id)}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-400 transition-colors border border-emerald-500/50 hover:border-rose-500/50"
                      title="Remove Friend"
                    >
                      <UserCheck size={20} />
                    </button>
                  ) : activeFriendRequest.senderId === currentUser.id ? (
                    <button
                      disabled
                      className="px-4 py-3 rounded-xl bg-white/5 text-white/50 border border-white/10"
                      title="Request Pending"
                    >
                      <Clock size={20} />
                    </button>
                  ) : (
                    <div className="flex gap-2">
                       <button
                         onClick={() => acceptFriendRequest(activeFriendRequest.id)}
                         className="px-4 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 transition-colors border border-emerald-500/50"
                         title="Accept"
                       >
                         <Check size={20} />
                       </button>
                       <button
                         onClick={() => declineFriendRequest(activeFriendRequest.id)}
                         className="px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 transition-colors border border-rose-500/50"
                         title="Decline"
                       >
                         <X size={20} />
                       </button>
                    </div>
                  )
                ) : (
                  <button
                     onClick={() => sendFriendRequest(displayUser.id)}
                     className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                     title="Add Friend"
                  >
                     <UserPlus size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          <div className="md:col-span-8 space-y-4">
             {displayUser.bio && (
                <p className="text-white/80 leading-relaxed max-w-2xl">{displayUser.bio}</p>
             )}
             <div className="flex flex-wrap gap-4 text-sm text-white/50 pt-2">
                {displayUser.website && (
                  <a href={displayUser.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                    <LinkIcon size={16} /> {displayUser.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> Global Creator
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={16} /> Joined {displayUser.createdAt ? new Date(displayUser.createdAt).getFullYear() : "2026"}
                </span>
             </div>
             
             {(displayUser.musicTitle || displayUser.musicUrl) && (
                <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 max-w-md flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
                     <Play size={16} className="text-white ml-1" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Current Favorite Track</span>
                      <span className="text-sm text-white font-medium">{displayUser.musicTitle || "Untitled Track"}</span>
                   </div>
                </div>
             )}
          </div>
          <div className="md:col-span-4">
             <div className="flex gap-8 md:justify-end">
                <div onClick={() => setActiveTab("followers" as any)} className="flex flex-col cursor-pointer group">
                  <span className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{followerCount}</span>
                  <span className="text-xs text-white/50 font-medium group-hover:text-indigo-400 transition-colors">Followers</span>
                </div>
                <div onClick={() => setActiveTab("following" as any)} className="flex flex-col cursor-pointer group">
                  <span className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{followingCount}</span>
                  <span className="text-xs text-white/50 font-medium group-hover:text-indigo-400 transition-colors">Following</span>
                </div>
                <div onClick={() => setActiveTab("posts" as any)} className="flex flex-col cursor-pointer group">
                  <span className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{userPosts.length + userReels.length}</span>
                  <span className="text-xs text-white/50 font-medium group-hover:text-indigo-400 transition-colors">Posts</span>
                </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-white/10 mb-8 overflow-x-auto scrollbar-hide py-2">
          {[
            { id: "posts", icon: Grid, label: "Posts" },
            { id: "reels", icon: Film, label: "Reels" },
            { id: "portfolio", icon: FolderOpen, label: "Portfolio" },
            { id: "about", icon: UserIcon, label: "About" },
            { id: "reposts", icon: Repeat2, label: "Reposts" },
            { id: "followers", icon: Users, label: "Followers" },
            { id: "following", icon: Users, label: "Following" },
            ...(isOwnProfile ? [{ id: "saved", icon: Bookmark, label: "Saved" }] : [])
          ].map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-2 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-white text-white" : "border-transparent text-white/50 hover:text-white"}`}
             >
                <tab.icon size={16} /> {tab.label}
             </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-20">
           {activeTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userPosts.length > 0 ? (
                  userPosts.map(post => (
                    <div key={post.id} onClick={() => setSelectedPost(post)} className="bg-white/5 border border-white/5 p-5 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer">
                      <p className="text-sm text-white/90 mb-4 line-clamp-3">{post.title ? <strong>{post.title}</strong> : null} {post.content}</p>
                      {post.image && (
                         <div className="aspect-square rounded-2xl overflow-hidden bg-black/50">
                           {post.mediaType === "video" ? (
                             <video src={post.image} className="w-full h-full object-cover" muted />
                           ) : (
                             <img src={post.image} className="w-full h-full object-cover" alt="" />
                           )}
                         </div>
                      )}
                      <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
                        <span>{post.likes} Likes</span>
                        <span>{post.comments} Comments</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                    No posts yet.
                  </div>
                )}
              </div>
           )}

           {activeTab === "reels" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {userReels.length > 0 ? (
                   userReels.map(reel => {
                      const isImage = reel.video?.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || !reel.video?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
                      return (
                        <div key={reel.id} onClick={() => setSelectedReel(reel)} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5 cursor-pointer group">
                           {isImage ? (
                             <img src={reel.video} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Reel" />
                           ) : (
                             <video src={reel.video} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop autoPlay playsInline />
                           )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-xs font-medium line-clamp-2">{reel.caption}</p>
                           </div>
                        </div>
                      )
                   })
                 ) : (
                   <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                     No reels yet.
                   </div>
                 )}
              </div>
           )}

           {activeTab === "portfolio" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[300px]">
                   <FolderOpen size={48} className="text-white/20" />
                   <h3 className="text-xl font-bold text-white">Portfolio Empty</h3>
                   <p className="text-sm text-white/50">This creator hasn't uploaded any distinct portfolio case studies yet.</p>
                   {isOwnProfile && (
                     <button className="px-6 py-2 bg-indigo-500 text-white font-bold text-sm rounded-xl hover:bg-indigo-400 transition-colors mt-2">Create Project</button>
                   )}
                </div>
             </div>
           )}

           {activeTab === "about" && (
             <div className="bg-white/5 rounded-3xl border border-white/5 p-8 max-w-3xl">
                <h3 className="text-lg font-bold text-white mb-4">About Creator</h3>
                <p className="text-white/70 leading-relaxed mb-8">{displayUser.bio || "No biography provided."}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                   {displayUser.creatorCategory && <div>
                      <div className="text-sm text-white/50 mb-1">Category</div>
                      <div className="text-base text-white font-medium">{displayUser.creatorCategory}</div>
                   </div>}
                   <div>
                      <div className="text-sm text-white/50 mb-1">Location</div>
                      <div className="text-base text-white font-medium">{displayUser.location || "Not specified"}</div>
                   </div>
                   {displayUser.skills && displayUser.skills.length > 0 && <div className="col-span-full">
                      <div className="text-sm text-white/50 mb-2">Skills</div>
                      <div className="flex flex-wrap gap-2">{displayUser.skills.map((skill, i) => <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs">{skill}</span>)}</div>
                   </div>}
                   {displayUser.featuredProject && <div className="col-span-full">
                      <div className="text-sm text-white/50 mb-1">Featured Project</div>
                      <a href={displayUser.featuredProject} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:underline break-all">{displayUser.featuredProject}</a>
                   </div>}
                </div>
             </div>
           )}

           {activeTab === "reposts" && (
             <div className="space-y-8">
               <div>
                  <h3 className="text-lg font-bold text-white mb-4">Reposts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.filter(p => isOwnProfile ? useAppStore.getState().repostedPosts[p.id] : p.userId === displayUser?.id && p.originalPostId).length > 0 ? (
                      posts.filter(p => isOwnProfile ? useAppStore.getState().repostedPosts[p.id] : p.userId === displayUser?.id && p.originalPostId).map(post => (
                        <PostCard key={post.id} post={post} />
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                        No reposts yet.
                      </div>
                    )}
                  </div>
               </div>
             </div>
           )}

           {activeTab === "saved" && isOwnProfile && (
             <div className="space-y-8">
               <div>
                  <h3 className="text-lg font-bold text-white mb-4">Saved Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.filter((p) => useAppStore.getState().savedPosts[p.id]).length > 0 ? (
                      posts.filter((p) => useAppStore.getState().savedPosts[p.id]).map(post => (
                        <div key={post.id} className="bg-white/5 border border-white/5 p-5 rounded-3xl hover:bg-white/10 transition-colors">
                          <p className="text-sm text-white/90 mb-4 line-clamp-3">{post.title ? <strong>{post.title}</strong> : null} {post.content}</p>
                          {post.image && (
                            <div className="aspect-square rounded-2xl overflow-hidden bg-black/50">
                              {post.mediaType === "video" ? (
                                <video src={post.image} className="w-full h-full object-cover" muted />
                              ) : (
                                <img src={post.image} className="w-full h-full object-cover" alt="" />
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                        No saved posts yet.
                      </div>
                    )}
                  </div>
               </div>

               <div>
                  <h3 className="text-lg font-bold text-white mb-4">Saved Reels</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reels.filter((r) => useAppStore.getState().savedReels[r.id]).length > 0 ? (
                      reels.filter((r) => useAppStore.getState().savedReels[r.id]).map(reel => {
                        const isImage = reel.video?.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) || !reel.video?.match(/\.(mp4|webm|mov)(\?.*)?$/i);
                        return (
                          <div key={reel.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-white/5 cursor-pointer group">
                             {isImage ? (
                               <img src={reel.video} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Reel" />
                             ) : (
                               <video src={reel.video} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" muted loop autoPlay playsInline />
                             )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                        No saved reels yet.
                      </div>
                    )}
                  </div>
               </div>
             </div>
           )}

           {activeTab === "reposts" && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.filter((p) => p.originalPostId && p.userId === displayUser?.id).length > 0 ? (
                   posts.filter((p) => p.originalPostId && p.userId === displayUser?.id).map(post => (
                     <div key={post.id} onClick={() => setSelectedPost(post)} className="cursor-pointer">
                        <PostCard post={post} />
                     </div>
                   ))
                ) : (
                  <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                    No reposts found.
                  </div>
                )}
             </div>
           )}

           {activeTab === "followers" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followersList.length > 0 ? followersList.map(u => (
                  <div key={u.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate(`/u/${u.username}`)}>
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-white">{u.name}</h4>
                      <p className="text-sm text-white/50">@{u.username}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                    No followers yet.
                  </div>
                )}
             </div>
           )}

           {activeTab === "following" && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followingList.length > 0 ? followingList.map(u => (
                  <div key={u.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => navigate(`/u/${u.username}`)}>
                    <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-white">{u.name}</h4>
                      <p className="text-sm text-white/50">@{u.username}</p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-white/50 bg-white/5 rounded-3xl border border-white/5">
                    Not following anyone yet.
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
         {selectedPost && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
               onClick={() => setSelectedPost(null)}
            >
               <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide relative"
                  onClick={e => e.stopPropagation()}
               >
                  <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/80">
                     <X size={20} />
                  </button>
                  <PostCard post={selectedPost} />
               </motion.div>
            </motion.div>
         )}

         {selectedReel && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
               onClick={() => setSelectedReel(null)}
            >
               <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="w-full max-w-sm aspect-[9/16] relative bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                  onClick={e => e.stopPropagation()}
               >
                  <button onClick={() => setSelectedReel(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/80">
                     <X size={20} />
                  </button>
                  {selectedReel.video?.match(/\.(mp4|webm|mov)(\?.*)?$/i) ? (
                     <video src={selectedReel.video} autoPlay loop controls className="w-full h-full object-cover" />
                  ) : (
                     <img src={selectedReel.video} alt="Reel" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none flex flex-col justify-end p-6">
                     <p className="text-white text-sm font-medium">{selectedReel.caption}</p>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
