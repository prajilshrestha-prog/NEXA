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

  likedPosts: Record<string, boolean>;
  savedPosts: Record<string, boolean>;
  repostedPosts: Record<string, boolean>;
  likedReels: Record<string, boolean>;
  savedReels: Record<string, boolean>;
  repostedReels: Record<string, boolean>;
  following: Record<string, boolean>;

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
    post: Omit<Post, "id" | "likes" | "comments" | "reposts" | "createdAt">,
  ) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
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

  addReel: (reel: Omit<Reel, "id" | "likes" | "comments" | "createdAt">) => Promise<void>;
  likeReel: (reelId: string) => Promise<void>;
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

      const likedPosts: Record<string, boolean> = {};
      const savedPosts: Record<string, boolean> = {};
      const repostedPosts: Record<string, boolean> = {};
      const likedReels: Record<string, boolean> = {};
      const savedReels: Record<string, boolean> = {};
      const repostedReels: Record<string, boolean> = {};
      const following: Record<string, boolean> = {};

      if (likesRes.data) {
        likesRes.data.forEach((l: any) => (likedPosts[l.post_id] = true));
      }
      // Optional fallback if saves table still used by another system, but we migrated to saved_posts
      if (savedPostsRes.data) {
        savedPostsRes.data.forEach((s: any) => (savedPosts[s.post_id] = true));
      }
      if (repostedPostsRes.data) {
        repostedPostsRes.data.forEach((r: any) => (repostedPosts[r.post_id] = true));
      }
      if (likedReelsRes.data) {
        likedReelsRes.data.forEach((l: any) => (likedReels[l.reel_id] = true));
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

    const { data } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: state.currentUser.id,
        receiver_id: receiverId,
        status: "pending",
      })
      .select()
      .single();

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
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);
    get().fetchFriendRequests();
  },

  declineFriendRequest: async (requestId: string) => {
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

    const likedPosts: Record<string, boolean> = {};
    const savedPosts: Record<string, boolean> = {};
    const repostedPosts: Record<string, boolean> = {};
    const likedReels: Record<string, boolean> = {};
    const savedReels: Record<string, boolean> = {};
    const repostedReels: Record<string, boolean> = {};
    const following: Record<string, boolean> = {};

    const [likesRes, savedPostsRes, repostedPostsRes, likedReelsRes, savedReelsRes, repostedReelsRes, followsRes] = await Promise.all([
      supabase
        .from("likes")
        .select("post_id")
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
        .select("reel_id")
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
    ]);

    if (likesRes.data) {
      likesRes.data.forEach((l) => (likedPosts[l.post_id] = true));
    }
    if (savedPostsRes.data) {
      savedPostsRes.data.forEach((s) => (savedPosts[s.post_id] = true));
    }
    if (repostedPostsRes.data) {
      repostedPostsRes.data.forEach((r) => (repostedPosts[r.post_id] = true));
    }
    if (likedReelsRes.data) {
      likedReelsRes.data.forEach((l) => (likedReels[l.reel_id] = true));
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

    set({ likedPosts, savedPosts, repostedPosts, likedReels, savedReels, repostedReels, following });
  },

  fetchStories: async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .gt('expires_at', new Date().toISOString())
      .order("created_at", { ascending: false });
    if (data) {
      const mapped = data.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        mediaUrl: s.media_url,
        mediaType: s.media_type,
        caption: s.caption,
        expiresAt: s.expires_at,
        createdAt: s.created_at,
      }));
      set({ stories: mapped });
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
      set(s => ({ stories: [newStory, ...s.stories] }));
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
    const { data } = await supabase.from("notes").insert({
      user_id: state.currentUser.id,
      content: note.content,
      music_title: note.musicTitle,
      music_url: note.musicUrl,
      gif_url: note.gifUrl,
      expires_at: note.expiresAt,
    }).select().single();
    if(data) {
      const newNote: Note = {
        id: data.id,
        userId: data.user_id,
        content: data.content,
        musicTitle: data.music_title,
        musicUrl: data.music_url,
        gifUrl: data.gif_url,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      };
      set(s => ({ notes: [newNote, ...s.notes] }));
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
       alert("Posts Fetch Error: " + error.message);
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
      alert("Post Insert Error: " + error.message);
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
        createdAt: data.created_at || new Date().toISOString(),
      };
      set((state) => ({ posts: [newPost, ...state.posts] }));
    }
  },

  likePost: async (postId) => {
    const state = get();
    const post = state.posts.find((p) => p.id === postId);
    if (!post || !state.currentUser) return;

    const isLiked = state.likedPosts[postId];

    set((state) => ({
      likedPosts: { ...state.likedPosts, [postId]: !isLiked },
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p,
      ),
    }));

    if (isLiked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", state.currentUser.id);
      await supabase
        .from("posts")
        .update({ likes: Math.max(0, post.likes - 1) })
        .eq("id", postId);
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: state.currentUser.id });
      if (!error) {
        await supabase
          .from("posts")
          .update({ likes: post.likes + 1 })
          .eq("id", postId);
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
        p.id === postId ? { ...p, reposts: Math.max(0, p.reposts + (isReposted ? -1 : 1)) } : p,
      ),
    }));

    if (isReposted) {
      await supabase
        .from("reposts")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", state.currentUser.id);
      await supabase
        .from("posts")
        .update({ reposts: Math.max(0, post.reposts - 1) })
        .eq("id", postId);
    } else {
      const { error } = await supabase
        .from("reposts")
        .insert({ post_id: postId, user_id: state.currentUser.id });
      if (!error) {
        await supabase
          .from("posts")
          .update({ reposts: post.reposts + 1 })
          .eq("id", postId);
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

    set((state) => ({
      savedPosts: { ...state.savedPosts, [postId]: !isSaved },
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
        content: c.content,
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
        content,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      // Also increment post comments count
      const post = state.posts.find((p) => p.id === postId);
      if (post) {
        await supabase
          .from("posts")
          .update({ comments: post.comments + 1 })
          .eq("id", postId);
      }

      const newComment: Comment = {
        id: data.id,
        postId: data.post_id,
        userId: data.user_id,
        content: data.content,
        likes: data.likes || 0,
        createdAt: data.created_at,
      };

      set((state) => {
        const postComments = state.comments[postId] || [];
        return {
          comments: {
            ...state.comments,
            [postId]: [...postComments, newComment],
          },
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, comments: p.comments + 1 } : p,
          ),
        };
      });

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
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c,
        ),
      },
    }));
    await supabase
      .from("comments")
      .update({ likes: comment.likes + 1 })
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
        content: c.content,
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
        content,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      const reel = state.reels.find((r) => r.id === reelId);
      if (reel) {
        await supabase
          .from("reels")
          .update({ comments: reel.comments + 1 })
          .eq("id", reelId);
      }

      const newComment: Comment = {
        id: data.id,
        postId: data.reel_id,
        userId: data.user_id,
        content: data.content,
        likes: data.likes || 0,
        createdAt: data.created_at,
      };

      set((state) => {
        const existing = state.comments[reelId] || [];
        return {
          comments: { ...state.comments, [reelId]: [...existing, newComment] },
          reels: state.reels.map((r) =>
            r.id === reelId ? { ...r, comments: r.comments + 1 } : r,
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
            r.id === reelId ? { ...r, comments: Math.max(0, r.comments - 1) } : r,
        ),
      };
    });
    
    const reel = state.reels.find(r => r.id === reelId);
    if (reel) {
       await supabase.from("reels").update({ comments: Math.max(0, reel.comments - 1) }).eq("id", reelId);
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
        createdAt: data.created_at || new Date().toISOString(),
      };
      set((state) => ({ reels: [r, ...state.reels] }));
    }
  },

  likeReel: async (reelId) => {
    const state = get();
    const reel = state.reels.find((r) => r.id === reelId);
    if (!reel || !state.currentUser) return;
    
    const isLiked = state.likedReels[reelId];

    set((state) => ({
      likedReels: { ...state.likedReels, [reelId]: !isLiked },
      reels: state.reels.map((r) =>
        r.id === reelId ? { ...r, likes: Math.max(0, r.likes + (isLiked ? -1 : 1)) } : r,
      ),
    }));

    if (isLiked) {
      await supabase
        .from("liked_reels")
        .delete()
        .eq("reel_id", reelId)
        .eq("user_id", state.currentUser.id);
    } else {
      await supabase
        .from("liked_reels")
        .insert({ reel_id: reelId, user_id: state.currentUser.id });
    }

    await supabase
      .from("reels")
      .update({ likes: Math.max(0, reel.likes + (isLiked ? -1 : 1)) })
      .eq("id", reelId);
  },

  toggleSaveReel: async (reelId) => {
    const state = get();
    if (!state.currentUser) return;
    const isSaved = state.savedReels[reelId];
    set((state) => ({
      savedReels: { ...state.savedReels, [reelId]: !isSaved },
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
    
    set((state) => ({
      repostedReels: { ...state.repostedReels, [reelId]: !isReposted },
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
