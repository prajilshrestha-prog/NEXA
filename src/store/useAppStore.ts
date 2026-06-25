import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  website?: string;
  location?: string;
  verified: boolean;
  banner: string;
  musicTitle?: string;
  musicUrl?: string;
  creatorCategory?: string;
  skills?: string[];
  socialLinks?: Record<string, string>;
  featuredProject?: string;
  metadata?: any;
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
}

export const normalizeProfile = (p: any): User => ({
  id: p.id,
  username: p.username,
  name: p.name || p.full_name || p.username,
  avatar: p.avatar || p.avatar_url || "",
  bio: p.bio || "",
  website: p.website,
  location: p.location,
  verified: !!p.verified,
  banner: p.banner || p.banner_url || "",
  followersCount: p.followers_count || 0,
  musicTitle: p.music_title,
  musicUrl: p.music_url,
  creatorCategory: p.creator_category,
  skills: p.skills,
  socialLinks: p.social_links,
  featuredProject: p.featured_project,
  followingCount: p.following_count || 0,
  createdAt: p.created_at,
});

export interface Post {
  id: string;
  userId: string;
  title?: string;
  content: string;
  image?: string;
  mediaType?: "image" | "video";
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  originalPostId?: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  saves: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Reel {
  id: string;
  userId: string;
  video: string;
  caption: string;
  music: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  saves: number;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  musicTitle?: string;
  musicUrl?: string;
  gifUrl?: string;
  backgroundColor?: string;
  expiresAt: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId: string;
  type: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  users: Record<string, User>;
  posts: Post[];
  reels: Reel[];
  comments: Record<string, Comment[]>;
  notifications: Notification[];
  friendRequests: FriendRequest[];
  stories: Story[];
  notes: Note[];

  likedPosts: Record<string, string>;
  savedPosts: Record<string, boolean>;
  repostedPosts: Record<string, boolean>;
  likedReels: Record<string, string>;
  savedReels: Record<string, boolean>;
  repostedReels: Record<string, boolean>;
  following: Record<string, boolean>;
  closeFriends: Record<string, boolean>;
  toggleCloseFriend: (userId: string) => Promise<void>;

  blockUser?: (userId: string) => void;
  reportContent?: (id: string, type: 'post' | 'reel') => void;

  setCurrentUser: (user: User | null) => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  fetchProfiles: (userIds: string[]) => Promise<void>;
  fetchProfileByUsername: (identifier: string) => Promise<User | null>;
  fetchInteractions: () => Promise<void>;

  sendFriendRequest: (receiverId: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (targetId: string) => Promise<void>;
  fetchFriendRequests: () => Promise<void>;
  initializeSession: (userId: string) => Promise<void>;

  fetchStories: () => Promise<void>;
  addStory: (story: Omit<Story, "id" | "createdAt">) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  viewStory: (storyId: string) => Promise<void>;

  fetchNotes: () => Promise<void>;
  addNote: (note: Omit<Note, "id" | "createdAt">) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;

  hasMorePosts: boolean;
  hasMoreReels: boolean;
  fetchPosts: (cursor?: number) => Promise<void>;
  fetchReels: (cursor?: number) => Promise<void>;
  addPost: (
    post: Omit<Post, "id" | "likes" | "comments" | "reposts" | "views" | "saves" | "createdAt">,
  ) => Promise<void>;
  likePost: (postId: string, reaction?: string) => Promise<void>;
  repostPost: (postId: string) => Promise<void>;

  deletePost: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  toggleFollow: (userId: string) => Promise<void>;

  fetchComments: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;

  fetchReelComments: (reelId: string) => Promise<void>;
  addReelComment: (reelId: string, content: string) => Promise<void>;
  deleteReelComment: (reelId: string, commentId: string) => Promise<void>;

  addReel: (reel: Omit<Reel, "id" | "likes" | "comments" | "reposts" | "views" | "saves" | "createdAt">) => Promise<void>;
  viewPost: (postId: string) => Promise<void>;
  viewReel: (reelId: string) => Promise<void>;
  likeReel: (reelId: string, reaction?: string) => Promise<void>;
  toggleSaveReel: (reelId: string) => Promise<void>;
  repostReel: (reelId: string) => Promise<void>;

  fetchNotifications: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;

  initRealtime: () => () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: {},
  posts: [],
  reels: [],
  hasMorePosts: true,
  hasMoreReels: true,
  comments: {},
  notifications: [],
  friendRequests: [],
  stories: [],
  notes: [],

  likedPosts: {},
  savedPosts: {},
  repostedPosts: {},
  likedReels: {},
  savedReels: {},
  repostedReels: {},
  following: {},
  closeFriends: {},

  setCurrentUser: (user) =>
    set((state) => ({
      currentUser: user,
      users: user ? { ...state.users, [user.id]: user } : state.users,
    })),

  fetchProfiles: async (userIds) => {
    if (!userIds || !userIds.length) return;
    const missingIds = userIds.filter((id) => id && !get().users[id]);
    if (!missingIds.length) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .in("id", missingIds);
    if (data) {
      const newUsers = { ...get().users };
      data.forEach((p) => {
        newUsers[p.id] = normalizeProfile(p);
      });
      set({ users: newUsers });
    }
  },

  fetchProfileByUsername: async (identifier: string) => {
    const state = get();
    // Check cache first
    const existingUser = Object.values(state.users).find(
      (u) => u.username === identifier || u.id === identifier,
    );
    if (existingUser) return existingUser;

    // Determine if identifier is UUID
    const isUuid =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        identifier,
      );

    // Check by username OR id safely
    const query = isUuid
      ? supabase
          .from("profiles")
          .select("*")
          .eq("id", identifier)
          .limit(1)
          .maybeSingle()
      : supabase
          .from("profiles")
          .select("*")
          .eq("username", identifier)
          .limit(1)
          .maybeSingle();

    const { data, error } = await query;
    if (error)
      console.error("Error fetching profile identifier", identifier, error);

    if (data) {
      const newUser = normalizeProfile(data);
      set({ users: { ...get().users, [newUser.id]: newUser } });
      return newUser;
    }
    return null;
  },

  initializeSession: async (userId: string) => {
    try {
      const [profileRes, requestsRes, likesRes, savedPostsRes, repostedPostsRes, likedReelsRes, savedReelsRes, repostedReelsRes, followsRes] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase
            .from("friend_requests")
            .select("*")
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
          supabase.from("likes").select("post_id").eq("user_id", userId),
          supabase.from("saved_posts").select("post_id").eq("user_id", userId),
          supabase.from("reposts").select("post_id").eq("user_id", userId),
          supabase.from("liked_reels").select("reel_id").eq("user_id", userId),
          supabase.from("saved_reels").select("reel_id").eq("user_id", userId),
          supabase.from("reel_reposts").select("reel_id").eq("user_id", userId),
          supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", userId),
        ]);

      const updates: Partial<AppState> = {};

      let profileData = profileRes.data;
      
      if (!profileData && !profileRes.error) {
        // Fallback: create emergency profile if missing
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const emailPrefix = authData.user.email?.split("@")[0] || `user_${userId.substring(0, 8)}`;
          const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              username: emailPrefix,
              name: emailPrefix,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
              banner: "",
              bio: "",
              website: "",
            })
            .select("*")
            .maybeSingle();
          if (newProfile) {
            profileData = newProfile;
          }
        }
      }

      let user: User | null = null;
      if (profileData) {
        user = normalizeProfile(profileData);
        updates.currentUser = user;
        updates.users = { ...get().users, [user.id]: user };
      }

      let missingUserIds: string[] = [];
      if (requestsRes.data) {
        const mapped: FriendRequest[] = requestsRes.data.map((r: any) => ({
          id: r.id,
          senderId: r.sender_id,
          receiverId: r.receiver_id,
          status: r.status,
          createdAt: r.created_at,
        }));
        updates.friendRequests = mapped;
        missingUserIds = [
          ...new Set([
            ...mapped.map((m) => m.senderId),
            ...mapped.map((m) => m.receiverId),
          ]),
        ].filter(Boolean) as string[];
      }

      const likedPosts: Record<string, string> = {};
      const savedPosts: Record<string, boolean> = {};
      const repostedPosts: Record<string, boolean> = {};
      const likedReels: Record<string, string> = {};
      const savedReels: Record<string, boolean> = {};
      const repostedReels: Record<string, boolean> = {};
      const following: Record<string, boolean> = {};

      if (likesRes.data) {
        likesRes.data.forEach((l: any) => (likedPosts[l.post_id] = l.reaction || "❤️"));
      }
      // Optional fallback if saves table still used by another system, but we migrated to saved_posts
      if (savedPostsRes.data) {
        savedPostsRes.data.forEach((s: any) => (savedPosts[s.post_id] = true));
      }
      if (repostedPostsRes.data) {
        repostedPostsRes.data.forEach((r: any) => (repostedPosts[r.post_id] = true));
      }
      if (likedReelsRes.data) {
        likedReelsRes.data.forEach((l: any) => (likedReels[l.reel_id] = l.reaction || "❤️"));
      }
      if (savedReelsRes.data) {
        savedReelsRes.data.forEach((s: any) => (savedReels[s.reel_id] = true));
      }
      if (repostedReelsRes.data) {
        repostedReelsRes.data.forEach((r: any) => (repostedReels[r.reel_id] = true));
      }
      if (followsRes.data) {
        followsRes.data.forEach((f: any) => (following[f.following_id] = true));
      }

      updates.likedPosts = likedPosts;
      updates.savedPosts = savedPosts;
      updates.repostedPosts = repostedPosts;
      updates.likedReels = likedReels;
      updates.savedReels = savedReels;
      updates.repostedReels = repostedReels;
      updates.following = following;

      set((state) => ({ ...state, ...updates }));

      if (missingUserIds.length > 0) {
        await get().fetchProfiles(missingUserIds);
      }
      
      // Fetch async non-blocking
      get().fetchNotifications();
      get().fetchStories();
      get().fetchNotes();
      import("./communicationStore").then(m => m.useCommunicationStore.getState().fetchOnlineUsers());
      
    } catch (e) {
      console.error("Failed to initialize session details", e);
    }
  },

  fetchFriendRequests: async () => {
    const state = get();
    if (!state.currentUser) return;
    const { data } = await supabase
      .from("friend_requests")
      .select("*")
      .or(
        `sender_id.eq.${state.currentUser.id},receiver_id.eq.${state.currentUser.id}`,
      );

    if (data) {
      const mapped: FriendRequest[] = data.map((r) => ({
        id: r.id,
        senderId: r.sender_id,
        receiverId: r.receiver_id,
        status: r.status,
        createdAt: r.created_at,
      }));
      set({ friendRequests: mapped });
      const userIds = [
        ...new Set([
          ...mapped.map((m) => m.senderId),
          ...mapped.map((m) => m.receiverId),
        ]),
      ].filter(Boolean);
      await get().fetchProfiles(userIds);
    }
  },

  sendFriendRequest: async (receiverId: string) => {
    const state = get();
    if (!state.currentUser) return;
    const existing = state.friendRequests.find(
      (r) =>
        (r.senderId === state.currentUser?.id && r.receiverId === receiverId) ||
        (r.receiverId === state.currentUser?.id && r.senderId === receiverId),
    );
    if (existing) return;

    // Optimistic update
    const optimisticReq = {
      id: "opt_" + Date.now(),
      senderId: state.currentUser.id,
      receiverId,
      status: "pending" as const,
      createdAt: new Date().toISOString()
    };
    set(s => ({ friendRequests: [...s.friendRequests, optimisticReq] }));

    const { data, error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: state.currentUser.id,
        receiver_id: receiverId,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
       console.error("sendFriendReq error", error);
       set(s => ({ friendRequests: s.friendRequests.filter(r => r.id !== optimisticReq.id) }));
    }

    if (data) {
      get().fetchFriendRequests();
      const { error: notifErr } = await supabase.from("notifications").insert({
        user_id: receiverId,
        from_user_id: state.currentUser.id,
        type: "friend_request",
      });
      if (!notifErr) {
        console.log(`[Failsafe] Notification inserted (friend_request) for ${receiverId}`);
      }
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    set(s => ({ 
        friendRequests: s.friendRequests.map(r => r.id === requestId ? { ...r, status: "accepted" } : r) 
    }));
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);
    get().fetchFriendRequests();
  },

  declineFriendRequest: async (requestId: string) => {
    set(s => ({ 
        friendRequests: s.friendRequests.map(r => r.id === requestId ? { ...r, status: "declined" } : r) 
    }));
    await supabase
      .from("friend_requests")
      .update({ status: "declined" })
      .eq("id", requestId);
    get().fetchFriendRequests();
  },

  removeFriend: async (targetId: string) => {
    const state = get();
    if (!state.currentUser) return;
    const req = state.friendRequests.find(
      (r) =>
        (r.senderId === state.currentUser?.id && r.receiverId === targetId) ||
        (r.receiverId === state.currentUser?.id && r.senderId === targetId),
    );
    if (req) {
      set(s => ({ friendRequests: s.friendRequests.filter(r => r.id !== req.id) }));
      await supabase.from("friend_requests").delete().eq("id", req.id);
      get().fetchFriendRequests();
    }
  },

  updateProfile: async (updates) => {
    const state = get();
    if (!state.currentUser) return;

    const mappedUpdates: any = {...updates};
    if (updates.musicTitle !== undefined) { mappedUpdates.music_title = updates.musicTitle; delete mappedUpdates.musicTitle; }
    if (updates.musicUrl !== undefined) { mappedUpdates.music_url = updates.musicUrl; delete mappedUpdates.musicUrl; }
    if (updates.creatorCategory !== undefined) { mappedUpdates.creator_category = updates.creatorCategory; delete mappedUpdates.creatorCategory; }
    if (updates.featuredProject !== undefined) { mappedUpdates.featured_project = updates.featuredProject; delete mappedUpdates.featuredProject; }
    if (updates.socialLinks !== undefined) { mappedUpdates.social_links = updates.socialLinks; delete mappedUpdates.socialLinks; }

    const { error } = await supabase
      .from("profiles")
      .update(mappedUpdates)
      .eq("id", state.currentUser.id);
    if (!error) {
      const updatedUser = { ...state.currentUser, ...updates };
      set((s) => ({
        currentUser: updatedUser,
        users: { ...s.users, [updatedUser.id]: updatedUser },
      }));
    }
  },

  fetchInteractions: async () => {
    const state = get();
    if (!state.currentUser) return;

    const likedPosts: Record<string, string> = {};
    const savedPosts: Record<string, boolean> = {};
    const repostedPosts: Record<string, boolean> = {};
    const likedReels: Record<string, string> = {};
    const savedReels: Record<string, boolean> = {};
    const repostedReels: Record<string, boolean> = {};
    const following: Record<string, boolean> = {};
    const closeFriends: Record<string, boolean> = {};

    const [likesRes, savedPostsRes, repostedPostsRes, likedReelsRes, savedReelsRes, repostedReelsRes, followsRes, closeFriendsRes] = await Promise.all([
      supabase
        .from("likes")
        .select("post_id, reaction")
        .eq("user_id", state.currentUser.id),
      supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", state.currentUser.id),
      supabase
        .from("reposts")
        .select("post_id")
        .eq("user_id", state.currentUser.id),
      supabase
        .from("liked_reels")
        .select("reel_id, reaction")
        .eq("user_id", state.currentUser.id),
      supabase
        .from("saved_reels")
        .select("reel_id")
        .eq("user_id", state.currentUser.id),
      supabase
        .from("reel_reposts")
        .select("reel_id")
        .eq("user_id", state.currentUser.id),
      supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", state.currentUser.id),
      supabase
        .from("close_friends")
        .select("friend_id")
        .eq("user_id", state.currentUser.id),
    ]);

    if (likesRes.data) {
      likesRes.data.forEach((l) => (likedPosts[l.post_id] = l.reaction));
    }
    if (savedPostsRes.data) {
      savedPostsRes.data.forEach((s) => (savedPosts[s.post_id] = true));
    }
    if (repostedPostsRes.data) {
      repostedPostsRes.data.forEach((r) => (repostedPosts[r.post_id] = true));
    }
    if (likedReelsRes.data) {
      likedReelsRes.data.forEach((l) => (likedReels[l.reel_id] = l.reaction));
    }
    if (savedReelsRes.data) {
      savedReelsRes.data.forEach((s) => (savedReels[s.reel_id] = true));
    }
    if (repostedReelsRes.data) {
      repostedReelsRes.data.forEach((r) => (repostedReels[r.reel_id] = true));
    }
    if (followsRes.data) {
      followsRes.data.forEach((f) => (following[f.following_id] = true));
    }
    if (closeFriendsRes.data) {
      closeFriendsRes.data.forEach((f) => (closeFriends[f.friend_id] = true));
    }

    set({ likedPosts, savedPosts, repostedPosts, likedReels, savedReels, repostedReels, following, closeFriends });
  },

  fetchStories: async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .gt('expires_at', new Date().toISOString())
      .order("created_at", { ascending: false });
    if (data) {
      const mapped: Story[] = data.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        mediaUrl: s.media_url,
        mediaType: s.media_type,
        caption: s.caption,
        expiresAt: s.expires_at,
        createdAt: s.created_at,
      }));
      set(s => {
         const newStories = [...mapped];
         s.stories.forEach(st => {
            if (!newStories.find(m => m.id === st.id)) {
               newStories.push(st);
            }
         });
         return { stories: newStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) };
      });
      get().fetchProfiles(mapped.map((s) => s.userId));
    }
  },

  addStory: async (story) => {
    const state = get();
    if (!state.currentUser) return;
    const { data, error } = await supabase.from("stories").insert({
      user_id: state.currentUser.id,
      media_url: story.mediaUrl,
      media_type: story.mediaType,
      caption: story.caption,
      expires_at: story.expiresAt,
    }).select().single();
    if (error) console.error("STORY INSERT DB ERROR:", error);
    console.log("Story insert data:", data);
    
    if (data) {
      const newStory: Story = {
        id: data.id,
        userId: data.user_id,
        mediaUrl: data.media_url,
        mediaType: data.media_type,
        caption: data.caption,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      };
      set(s => {
         if (s.stories.find(x => x.id === newStory.id)) return s;
         return { stories: [newStory, ...s.stories] };
      });
    }
  },

  deleteStory: async (storyId) => {
    const state = get();
    if (!state.currentUser) return;
    await supabase.from("stories").delete().eq("id", storyId).eq("user_id", state.currentUser.id);
    set(s => ({ stories: s.stories.filter(story => story.id !== storyId) }));
  },

  viewStory: async (storyId) => {
    const state = get();
    if (!state.currentUser) return;
    await supabase.from("story_views").insert({ story_id: storyId, viewer_id: state.currentUser.id });
  },

  fetchNotes: async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .gt('expires_at', new Date().toISOString())
      .order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        content: n.content,
        musicTitle: n.music_title,
        musicUrl: n.music_url,
        gifUrl: n.gif_url,
        backgroundColor: n.background_color,
        expiresAt: n.expires_at,
        createdAt: n.created_at,
      }));
      set({ notes: mapped });
      get().fetchProfiles(mapped.map((n) => n.userId));
    }
  },

  addNote: async (note) => {
    const state = get();
    if (!state.currentUser) return;
    
    const optimisticNote: Note = {
      id: "optimistic_" + Date.now(),
      userId: state.currentUser.id,
      content: note.content,
      musicTitle: note.musicTitle,
      musicUrl: note.musicUrl,
      gifUrl: note.gifUrl,
      backgroundColor: note.backgroundColor,
      expiresAt: note.expiresAt,
      createdAt: new Date().toISOString()
    };
    
    set(s => ({ notes: [optimisticNote, ...s.notes] }));

    const { data, error } = await supabase.from("notes").insert({
      user_id: state.currentUser.id,
      content: note.content,
      music_title: note.musicTitle,
      music_url: note.musicUrl,
      gif_url: note.gifUrl,
      background_color: note.backgroundColor,
      expires_at: note.expiresAt,
    }).select().single();
    
    if(error) {
       console.error("Error adding note:", error);
       set(s => ({ notes: s.notes.filter(n => n.id !== optimisticNote.id) }));
    } else if(data) {
       set(s => {
          // If RealtimeManager already inserted it, we need to replace optimistic and deduplicate
          const existsFromRealtime = s.notes.some(n => n.id === data.id);
          let newNotes = s.notes;
          
          if (existsFromRealtime) {
             // Remove optimistic, keep realtime one
             newNotes = newNotes.filter(n => n.id !== optimisticNote.id);
          } else {
             newNotes = newNotes.map(n => n.id === optimisticNote.id ? {
                id: data.id,
                userId: data.user_id,
                content: data.content,
                musicTitle: data.music_title,
                musicUrl: data.music_url,
                gifUrl: data.gif_url,
                backgroundColor: data.background_color,
                expiresAt: data.expires_at,
                views: 0,
          saves: 0,
          createdAt: data.created_at,
             } : n);
          }
          return { notes: newNotes };
       });
    }
  },

  deleteNote: async (noteId) => {
    const state = get();
    if (!state.currentUser) return;
    await supabase.from("notes").delete().eq("id", noteId).eq("user_id", state.currentUser.id);
    set(s => ({ notes: s.notes.filter(note => note.id !== noteId) }));
  },

  fetchPosts: async (cursor = 0) => {
    console.log("FETCH POSTS CALLED:", cursor);
    const limit = 20;
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(cursor, cursor + limit - 1);
    
    if (error) {
       console.error(error);
    }
    console.log("POSTS FROM DB", data, error);
    if (data) {
      const mappedPosts: Post[] = data.map((p) => ({
        id: p.id,
        userId: p.user_id,
        content: p.caption,
        image: p.media_url,
        mediaType: p.media_type,
        musicTitle: p.music_title,
        musicArtist: p.music_artist,
        musicUrl: p.music_url,
        originalPostId: p.original_post_id || undefined,
        likes: p.likes || 0,
        comments: p.comments || 0,
        reposts: p.reposts || 0,
        views: p.views || 0,
        saves: p.saves || 0,
        createdAt: p.created_at,
      }));

      set((state) => {
        const dbIds = new Set(mappedPosts.map((p) => p.id));
        
        let merged = [];
        if (cursor === 0) {
           const missingOptimistic = state.posts.filter(
             (p) =>
               !dbIds.has(p.id) &&
               Date.now() - new Date(p.createdAt || new Date()).getTime() < 15000,
           );
           merged = [...missingOptimistic, ...mappedPosts];
        } else {
           const existingIds = new Set(state.posts.map((p) => p.id));
           const newUnique = mappedPosts.filter((p) => !existingIds.has(p.id));
           merged = [...state.posts, ...newUnique];
        }

        merged.sort(
          (a, b) =>
            new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime(),
        );
        return { posts: merged, hasMorePosts: data.length === limit };
      });

      const userIds = [...new Set(mappedPosts.map((p) => p.userId))].filter(
        Boolean,
      );
      await get().fetchProfiles(userIds);
    }
  },

  addPost: async (post) => {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: post.userId,
        caption: post.content,
        media_url: post.image,
        media_type: post.mediaType,
        music_title: post.musicTitle,
        music_artist: post.musicArtist,
        music_url: post.musicUrl,
        original_post_id: (post as any).originalPostId,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("addPost error:", error);
    }

    if (!error && data) {
      const newPost: Post = {
        id: data.id,
        userId: data.user_id,
        content: data.caption || "",
        image: data.media_url,
        mediaType: data.media_type,
        musicTitle: data.music_title,
        musicArtist: data.music_artist,
        musicUrl: data.music_url,
        originalPostId: data.original_post_id,
        likes: 0,
        comments: 0,
        reposts: 0,
        views: 0,
        saves: 0,
        createdAt: data.created_at || new Date().toISOString(),
      };
      set((state) => ({ posts: [newPost, ...state.posts] }));
    }
  },

  likePost: async (postId, reaction = "❤️") => {
    const state = get();
    const post = state.posts.find((p) => p.id === postId);
    if (!post || !state.currentUser) return;

    const currentReaction = state.likedPosts[postId];
    const isRemoving = currentReaction === reaction;
    const isLikeAddition = !currentReaction && !isRemoving;

    set((state) => {
      const newLikedPosts = { ...state.likedPosts };
      if (isRemoving) {
        delete newLikedPosts[postId];
      } else {
        newLikedPosts[postId] = reaction;
      }
      return {
        likedPosts: newLikedPosts,
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) + (isRemoving ? -1 : isLikeAddition ? 1 : 0)) } : p,
        ),
      };
    });

    if (isRemoving) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", state.currentUser.id);
        
      await supabase.from("posts").update({ likes: Math.max(0, (post.likes || 0) - 1) }).eq("id", postId);
    } else {
      const { error } = await supabase
        .from("likes")
        .upsert({ post_id: postId, user_id: state.currentUser.id }, { onConflict: "user_id, post_id" });
        
      if (isLikeAddition) {
        await supabase.from("posts").update({ likes: Math.max(0, (post.likes || 0) + 1) }).eq("id", postId);
      }
      
      if (!error) {
        if (post.userId !== state.currentUser.id) {
          const { error: err } = await supabase
            .from("notifications")
            .insert({
              user_id: post.userId,
              from_user_id: state.currentUser.id,
              type: "like",
              post_id: postId,
            });
          if (!err) console.log(`[Failsafe] Notification inserted (like) for ${post.userId}`);
        }
      }
    }
  },

  repostPost: async (postId) => {
    const state = get();
    const post = state.posts.find((p) => p.id === postId);
    if (!post || !state.currentUser) return;

    const isReposted = state.repostedPosts[postId];

    set((state) => ({
      repostedPosts: { ...state.repostedPosts, [postId]: !isReposted },
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, reposts: Math.max(0, (p.reposts || 0) + (isReposted ? -1 : 1)) } : p,
      ),
    }));

    if (isReposted) {
      await supabase
        .from("reposts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", state.currentUser.id);
    } else {
      const { error } = await supabase
        .from("reposts")
        .insert({ post_id: postId, user_id: state.currentUser.id });
      if (!error) {
        // Create repost feed item
        await get().addPost({
          userId: state.currentUser.id,
          content: "",
          originalPostId: postId,
        });
      }
    }
  },

  deletePost: async (postId) => {
    const state = get();
    if (!state.currentUser) return;

    const post = state.posts.find((p) => p.id === postId);
    if (!post) return;

    set((state) => ({ posts: state.posts.filter((p) => p.id !== postId) }));
    await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", state.currentUser.id);

    if (post.image) {
      const match = post.image.match(/\/media\/(.+)$/);
      if (match) {
        await supabase.storage.from("media").remove([match[1]]);
      }
    }
  },

  toggleSave: async (postId) => {
    const state = get();
    if (!state.currentUser) return;
    const isSaved = state.savedPosts[postId];
    const post = state.posts.find(p => p.id === postId);

    set((state) => ({
      savedPosts: { ...state.savedPosts, [postId]: !isSaved },
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, saves: Math.max(0, (p.saves || 0) + (isSaved ? -1 : 1)) } : p
      ),
    }));

    if (isSaved) {
      await supabase
        .from("saved_posts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", state.currentUser.id);
    } else {
      await supabase
        .from("saved_posts")
        .insert({ user_id: state.currentUser.id, post_id: postId });
    }
  },

  toggleFollow: async (userId) => {
    const state = get();
    if (!state.currentUser) return;

    const isFollowing = state.following[userId];
    set((state) => ({
      following: { ...state.following, [userId]: !isFollowing },
    }));

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("following_id", userId)
        .eq("follower_id", state.currentUser.id);
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: state.currentUser.id, following_id: userId });
      if (!error) {
        await supabase
          .from("notifications")
          .insert({
            user_id: userId,
            from_user_id: state.currentUser.id,
            type: "follow",
          });
        console.log(`[Failsafe] Notification inserted (follow) for ${userId}`);
      }
    }
  },

  toggleCloseFriend: async (userId) => {
    const state = get();
    if (!state.currentUser) return;

    const isCF = state.closeFriends?.[userId];
    set((state) => ({
      closeFriends: { ...(state.closeFriends || {}), [userId]: !isCF },
    }));

    if (isCF) {
      await supabase
        .from("close_friends")
        .delete()
        .eq("friend_id", userId)
        .eq("user_id", state.currentUser.id);
    } else {
      await supabase
        .from("close_friends")
        .insert({ user_id: state.currentUser.id, friend_id: userId });
    }
  },

  fetchComments: async (postId) => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) {
      const mappedComments: Comment[] = data.map((c) => ({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        content: c.text || c.content,
        likes: c.likes || 0,
        createdAt: c.created_at,
      }));
      set((state) => ({
        comments: { ...state.comments, [postId]: mappedComments },
      }));
      const userIds = [...new Set(mappedComments.map((c) => c.userId))].filter(
        Boolean,
      );
      await get().fetchProfiles(userIds);
    }
  },

  addComment: async (postId, content) => {
    const state = get();
    if (!state.currentUser) return;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: state.currentUser.id,
        text: content,
      })
      .select()
      .maybeSingle();
      
    if (error) console.error("Comment Insert Error", error);

    if (!error && data) {
      const newComment: Comment = {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        content: data.text || data.content,
        likes: data.likes || 0,
        createdAt: data.created_at,
      };

      set((state) => {
        const postComments = state.comments[postId] || [];
        if (postComments.find((c) => c.id === newComment.id)) return state;
        return {
          comments: {
            ...state.comments,
            [postId]: [...postComments, newComment],
          },
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, comments: Math.max(0, (p.comments || 0) + 1) } : p,
          ),
        };
      });

      let post = state.posts.find((p) => p.id === postId);
      if (!post) {
        const { data: pData } = await supabase.from("posts").select("user_id").eq("id", postId).maybeSingle();
        if (pData) {
          post = { userId: pData.user_id } as any;
        }
      }

      if (post && post.userId !== state.currentUser.id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: post.userId,
            from_user_id: state.currentUser.id,
            type: "comment",
            post_id: postId,
          });
        console.log(`[Failsafe] Notification inserted (comment) for ${post.userId}`);
      }
      
      const p = get().posts.find((p) => p.id === postId);
      if (p) {
        await supabase.from("posts").update({ comments: p.comments }).eq("id", postId);
      }
    }
  },

  likeComment: async (postId, commentId) => {
    const comments = get().comments[postId] || [];
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    set((state) => ({
      comments: {
        ...state.comments,
        [postId]: state.comments[postId].map((c) =>
          c.id === commentId ? { ...c, likes: Math.max(0, (c.likes || 0) + 1) } : c,
        ),
      },
    }));
    await supabase
      .from("comments")
      .update({ likes: Math.max(0, (comment.likes || 0) + 1) })
      .eq("id", commentId);
  },

  fetchReels: async (cursor = 0) => {
    const limit = 20;
    try {
      const { data, error } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false })
        .range(cursor, cursor + limit - 1);

      if (error) {
        console.error("fetchReels error:", error);
        return;
      }
      if (data) {
        const mapped: Reel[] = data.map((r) => ({
          id: r.id,
          userId: r.user_id,
          video: r.video,
          caption: r.caption,
          music: r.music,
          likes: r.likes || 0,
          comments: r.comments || 0,
          reposts: r.reposts || 0,
          views: r.views || 0,
          saves: r.saves || 0,
          createdAt: r.created_at || new Date().toISOString(),
        }));
        set((state) => {
          let merged = [];
          if (cursor === 0) {
              const dbIds = new Set(mapped.map((r) => r.id));
              const missingOptimistic = state.reels.filter((r) => !dbIds.has(r.id));
              merged = [...missingOptimistic, ...mapped];
          } else {
              const existingIds = new Set(state.reels.map((r) => r.id));
              const newUnique = mapped.filter((r) => !existingIds.has(r.id));
              merged = [...state.reels, ...newUnique];
          }
          merged.sort(
            (a, b) =>
              new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime(),
          );
          return { 
            reels: merged, 
            hasMoreReels: data.length === limit 
          };
        });
        const uIds = [...new Set(mapped.map((m) => m.userId))].filter(Boolean);
        await get().fetchProfiles(uIds);
      }
    } catch (e) {
      console.error("fetchReels exception:", e);
    }
  },

  fetchReelComments: async (reelId) => {
    const { data } = await supabase
      .from("reel_comments")
      .select("*")
      .eq("reel_id", reelId)
      .order("created_at", { ascending: true });
    if (data) {
      const mappedComments: Comment[] = data.map((c) => ({
        id: c.id,
        postId: c.reel_id, // map postId to reelId for consistency across views if needed
        userId: c.user_id,
        content: c.text || c.content,
        likes: c.likes || 0,
        createdAt: c.created_at,
      }));
      set((state) => ({
        comments: { ...state.comments, [reelId]: mappedComments },
      }));
      const userIds = [...new Set(mappedComments.map((c) => c.userId))].filter(Boolean);
      await get().fetchProfiles(userIds);
    }
  },

  addReelComment: async (reelId, content) => {
    const state = get();
    if (!state.currentUser) return;

    const { data, error } = await supabase
      .from("reel_comments")
      .insert({
        reel_id: reelId,
        user_id: state.currentUser.id,
        text: content,
      })
      .select()
      .maybeSingle();

    if (error) console.error("Reel Comment Insert Error", error);

    if (!error && data) {
      let reel = state.reels.find((r) => r.id === reelId);
      if (!reel) {
        const { data: rData } = await supabase.from("reels").select("user_id").eq("id", reelId).maybeSingle();
        if (rData) {
          reel = { userId: rData.user_id } as any;
        }
      }

      const newComment: Comment = {
        id: data.id,
        postId: data.reel_id,
        userId: data.user_id,
        content: data.text || data.content,
        likes: data.likes || 0,
        createdAt: data.created_at,
      };

      set((state) => {
        const existing = state.comments[reelId] || [];
        return {
          comments: { ...state.comments, [reelId]: [...existing, newComment] },
          reels: state.reels.map((r) =>
            r.id === reelId ? { ...r, comments: Math.max(0, (r.comments || 0) + 1) } : r,
          ),
        };
      });
      if (reel && reel.userId !== state.currentUser.id) {
         await supabase.from("notifications").insert({
            user_id: reel.userId,
            from_user_id: state.currentUser.id,
            type: "comment",
            post_id: reelId,
         });
      }
      
      const r = get().reels.find((r) => r.id === reelId);
      if (r) {
        await supabase.from("reels").update({ comments: r.comments }).eq("id", reelId);
      }
    }
  },

  deleteReelComment: async (reelId, commentId) => {
    const state = get();
    if (!state.currentUser) return;

    await supabase.from("reel_comments").delete().eq("id", commentId).eq("user_id", state.currentUser.id);

    set((state) => {
      const existing = state.comments[reelId] || [];
      return {
        comments: { ...state.comments, [reelId]: existing.filter(c => c.id !== commentId) },
        reels: state.reels.map((r) =>
            r.id === reelId ? { ...r, comments: Math.max(0, (r.comments || 0) - 1) } : r,
        ),
      };
    });
    
    const r = get().reels.find((r) => r.id === reelId);
    if (r) {
      await supabase.from("reels").update({ comments: r.comments }).eq("id", reelId);
    }
  },

  addReel: async (payload) => {
    const { data, error } = await supabase
      .from("reels")
      .insert({
        user_id: payload.userId,
        video: payload.video,
        caption: payload.caption,
        music: payload.music,
      })
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      const r: Reel = {
        id: data.id,
        userId: data.user_id,
        video: data.video,
        caption: data.caption,
        music: data.music,
        likes: data.likes || 0,
        comments: data.comments || 0,
        reposts: data.reposts || 0,
        views: data.views || 0,
        saves: data.saves || 0,
        createdAt: data.created_at || new Date().toISOString(),
      };
      set((state) => ({ reels: [r, ...state.reels] }));
    }
  },

  viewPost: async (postId) => {
    console.log("VIEW POST FIRED", postId);
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? { ...p, views: (p.views || 0) + 1 } : p)),
    }));
    await supabase.rpc("increment_post_views", { post_uuid: postId });
  },

  viewReel: async (reelId) => {
    console.log("VIEW REEL FIRED", reelId);
    const reel = get().reels.find((r) => r.id === reelId);
    if (!reel) return;
    set((state) => ({
      reels: state.reels.map((r) => (r.id === reelId ? { ...r, views: (r.views || 0) + 1 } : r)),
    }));
    await supabase.rpc("increment_reel_views", { reel_uuid: reelId });
  },

  likeReel: async (reelId, reaction = "❤️") => {
    const state = get();
    const reel = state.reels.find((r) => r.id === reelId);
    if (!reel || !state.currentUser) return;
    
    const currentReaction = state.likedReels[reelId];
    const isRemoving = currentReaction === reaction;
    const isLikeAddition = !currentReaction && !isRemoving;

    set((state) => {
       const newLikedReels = { ...state.likedReels };
       if (isRemoving) {
          delete newLikedReels[reelId];
       } else {
          newLikedReels[reelId] = reaction;
       }
       return {
          likedReels: newLikedReels,
          reels: state.reels.map((r) =>
             r.id === reelId ? { ...r, likes: Math.max(0, (r.likes || 0) + (isRemoving ? -1 : isLikeAddition ? 1 : 0)) } : r,
          ),
       };
    });

    if (isRemoving) {
      await supabase
        .from("liked_reels")
        .delete()
        .eq("reel_id", reelId)
        .eq("user_id", state.currentUser.id);
        
      await supabase.from("reels").update({ likes: Math.max(0, (reel.likes || 0) - 1) }).eq("id", reelId);
    } else {
      await supabase
        .from("liked_reels")
        .upsert({ reel_id: reelId, user_id: state.currentUser.id }, { onConflict: "user_id, reel_id" });
        
      if (isLikeAddition) {
        await supabase.from("reels").update({ likes: Math.max(0, (reel.likes || 0) + 1) }).eq("id", reelId);
      }
    }
  },

  toggleSaveReel: async (reelId) => {
    const state = get();
    if (!state.currentUser) return;
    const isSaved = state.savedReels[reelId];
    const reel = state.reels.find((r) => r.id === reelId);

    set((state) => ({
      savedReels: { ...state.savedReels, [reelId]: !isSaved },
      reels: state.reels.map((r) =>
        r.id === reelId ? { ...r, saves: Math.max(0, (r.saves || 0) + (isSaved ? -1 : 1)) } : r
      ),
    }));

    if (isSaved) {
      await supabase
        .from("saved_reels")
        .delete()
        .eq("reel_id", reelId)
        .eq("user_id", state.currentUser.id);
    } else {
      await supabase
        .from("saved_reels")
        .insert({ user_id: state.currentUser.id, reel_id: reelId });
    }
  },

  repostReel: async (reelId) => {
    const state = get();
    if (!state.currentUser) return;
    const isReposted = state.repostedReels[reelId];
    const reel = state.reels.find((r) => r.id === reelId);
    
    set((state) => ({
      repostedReels: { ...state.repostedReels, [reelId]: !isReposted },
      reels: state.reels.map((r) =>
        r.id === reelId ? { ...r, reposts: Math.max(0, (r.reposts || 0) + (isReposted ? -1 : 1)) } : r
      ),
    }));

    if (isReposted) {
      await supabase
        .from("reel_reposts")
        .delete()
        .eq("reel_id", reelId)
        .eq("user_id", state.currentUser.id);
    } else {
      await supabase
        .from("reel_reposts")
        .insert({ user_id: state.currentUser.id, reel_id: reelId });
    }
  },

  fetchNotifications: async () => {
    const state = get();
    if (!state.currentUser) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", state.currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      const mappedNotifs: Notification[] = data.map((n) => ({
        id: n.id,
        userId: n.user_id,
        fromUserId: n.from_user_id,
        type: n.type,
        postId: n.post_id,
        read: n.read || false,
        createdAt: n.created_at,
      }));
      set({ notifications: mappedNotifs });

      const fromUserIds = [...new Set(mappedNotifs.map((n) => n.fromUserId))].filter(
        Boolean,
      );
      await get().fetchProfiles(fromUserIds);
    }
  },

  markNotificationsAsRead: async () => {
    const state = get();
    if (!state.currentUser) return;

    const unreadIds = state.notifications
      .filter((n) => !n.read)
      .map((n) => n.id);
    if (!unreadIds.length) return;

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));

    await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);
  },

  initRealtime: () => {
    // We defer to the centralized RealtimeManager
    // but we can optionally import it at usage site to avoid circular deps if needed
    // Actually, RealtimeManager imports useAppStore, so we should be careful.
    // Let's just import it dynamically or just call an event.
    import("./RealtimeManager").then(({ realtimeManager }) => {
      realtimeManager.initGlobalSubscriptions();
    });

    return () => {
      import("./RealtimeManager").then(({ realtimeManager }) => {
        realtimeManager.cleanup();
      });
    };
  },
}));
