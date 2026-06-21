import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAppStore } from "./useAppStore";

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: string;
  joinedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  image?: string;
  voice?: string;
  createdAt: string;
  read: boolean;
}

interface CommunicationState {
  conversations: Record<string, Conversation>;
  participants: Record<string, ConversationParticipant[]>;
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  activeConversationId: string | null;
  typingUsers: Record<string, Record<string, boolean>>; // conversationId -> userId -> boolean
  onlineUsers: string[];

  // Call state
  currentCall: {
    sessionId: string | null;
    status: "idle" | "ringing" | "connected";
    type: "audio" | "video" | null;
    partnerId: string | null;
    isCaller: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    isVideoOff: boolean;
    startedAt: number | null;
  };

  searchResults: any[];
  isSearching: boolean;

  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;

  fetchConversations: () => Promise<void>;
  getOrCreateDirectConversation: (
    targetUserId: string,
  ) => Promise<string | null>;
  createGroupConversation: (
    name: string,
    participantIds: string[],
  ) => Promise<string | null>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string) => void;

  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, payload: { content?: string, image?: string, voice?: string }) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;

  setTyping: (conversationId: string, isTyping: boolean) => void;
  updateTypingState: (
    conversationId: string,
    userId: string,
    isTyping: boolean,
  ) => void;

  setOnlineUsers: (users: string[]) => void;
  fetchOnlineUsers: () => Promise<void>;

  // Call actions
  startCall: (partnerId: string, type: "audio" | "video") => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => Promise<void>;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  toggleMute: () => void;
  toggleVideo: () => void;

  handleIncomingCall: (
    sessionId: string,
    callerId: string,
    type: "audio" | "video",
  ) => void;
  handleCallAccepted: (sessionId: string, partnerId: string) => void;
  handleCallEnded: (sessionId: string) => void;
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  conversations: {},
  participants: {},
  messages: {},
  unreadCounts: {},
  activeConversationId: null,
  typingUsers: {},
  onlineUsers: [],

  currentCall: {
    sessionId: null,
    status: "idle",
    type: null,
    partnerId: null,
    isCaller: false,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isVideoOff: false,
    startedAt: null,
  },

  searchResults: [],
  isSearching: false,

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isSearching: true });

    // Fuzzy search on name or username
    const currentUserId = useAppStore.getState().currentUser?.id;
    const { data } = await supabase
      .from("profiles")
      .select("id, name, username, avatar")
      .neq("id", currentUserId)
      .ilike("name", `%${query}%`)
      .limit(10);

    if (data) {
      set({ searchResults: data });
      // Add missing profiles to appStore
      useAppStore.setState((s) => {
        const newUsers = { ...s.users };
        data.forEach((p) => {
          if (!newUsers[p.id]) newUsers[p.id] = p as any;
        });
        return { users: newUsers };
      });
    }
    set({ isSearching: false });
  },

  clearSearch: () => set({ searchResults: [] }),

  fetchConversations: async () => {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId) return;

    // Fetch conversations where user is a participant
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id, role, joined_at, conversations(*)")
      .eq("user_id", userId);

    if (participations) {
      const convos: Record<string, Conversation> = {};
      const convIds = participations.map((p) => p.conversation_id);

      participations.forEach((p) => {
        const convData = p.conversations as any;
        if (convData) {
          convos[p.conversation_id] = {
            id: (Array.isArray(convData) ? convData[0] : convData).id,
            isGroup: (Array.isArray(convData) ? convData[0] : convData)
              .is_group,
            name: (Array.isArray(convData) ? convData[0] : convData).name,
            createdAt: (Array.isArray(convData) ? convData[0] : convData)
              .created_at,
            updatedAt: (Array.isArray(convData) ? convData[0] : convData)
              .updated_at,
          };
        }
      });

      set({ conversations: convos });

      // Fetch all participants for these conversations to know who we're talking to
      if (convIds.length > 0) {
        const { data: allParts } = await supabase
          .from("conversation_participants")
          .select("*")
          .in("conversation_id", convIds);

        if (allParts) {
          const partsMap: Record<string, ConversationParticipant[]> = {};
          const userIdsToFetch = new Set<string>();
          allParts.forEach((p) => {
            if (!partsMap[p.conversation_id]) partsMap[p.conversation_id] = [];
            partsMap[p.conversation_id].push({
              conversationId: p.conversation_id,
              userId: p.user_id,
              role: p.role,
              joinedAt: p.joined_at,
            });
            userIdsToFetch.add(p.user_id);
          });
          set({ participants: partsMap });
          await useAppStore
            .getState()
            .fetchProfiles(Array.from(userIdsToFetch));
        }

        // Fetch last messages & unread counts
        const { data: recentMessages } = await supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false }); // Needs optimization in real production, but supabase limits response anyway

        if (recentMessages) {
          const msgs: Record<string, Message[]> = {};
          const unreads: Record<string, number> = {};

          recentMessages.reverse().forEach((m) => {
            if (!msgs[m.conversation_id]) msgs[m.conversation_id] = [];
            msgs[m.conversation_id].push({
              id: m.id,
              conversationId: m.conversation_id,
              senderId: m.sender_id,
              content: m.content,
              createdAt: m.created_at,
              read: m.read || false, // we might need 'message_reads' table, but fallback to read column if present
            });
            // Calculate unread (if other sent it and not read)
            if (m.sender_id !== userId && !m.read) {
              unreads[m.conversation_id] =
                (unreads[m.conversation_id] || 0) + 1;
            }
          });
          set((s) => ({
            messages: { ...s.messages, ...msgs },
            unreadCounts: { ...s.unreadCounts, ...unreads },
          }));
        }
      }
    }
  },

  getOrCreateDirectConversation: async (targetUserId: string) => {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId) return null;

    // Check existing
    const state = get();
    for (const convId in state.participants) {
      const parts = state.participants[convId];
      const conv = state.conversations[convId];
      if (conv && parts.length === 2 && !conv.isGroup) {
        const hasMe = parts.some((p) => p.userId === userId);
        const hasTarget = parts.some((p) => p.userId === targetUserId);
        if (hasMe && hasTarget) return convId;
      }
    }

    const payload = { is_group: false };
    console.log("Current User", userId);
    console.log("Conversation Payload", payload);

    // Create new conversation
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert(payload)
      .select()
      .maybeSingle();

    if (convErr) {
      console.error("Conversation creation failed", convErr);
      return null;
    }

    if (conv) {
      console.log(`[Failsafe] Conversation created (direct): ${conv.id}`);
      await supabase.from("conversation_participants").insert([
        { conversation_id: conv.id, user_id: userId, role: "member" },
        { conversation_id: conv.id, user_id: targetUserId, role: "member" },
      ]);
      console.log(`[Failsafe] Participant created for conversation ${conv.id}`);
      await get().fetchConversations();
      return conv.id;
    }
    return null;
  },

  createGroupConversation: async (name: string, participantIds: string[]) => {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId) return null;

    const payload = {
        is_group: true,
        name
      };

    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert(payload)
      .select()
      .maybeSingle();

    if (convErr) {
      console.error("Conversation creation failed", convErr);
      return null;
    }

    if (conv) {
      const allParticipants = Array.from(new Set([userId, ...participantIds]));
      const inserts = allParticipants.map((pid) => ({
        conversation_id: conv.id,
        user_id: pid,
        role: pid === userId ? "admin" : "member",
      }));
      await supabase.from("conversation_participants").insert(inserts);
      await get().fetchConversations();
      return conv.id;
    }

    return null;
  },

  deleteConversation: async (conversationId: string) => {
    await supabase.from("conversations").delete().eq("id", conversationId);
    set((s) => {
      const newConvs = { ...s.conversations };
      delete newConvs[conversationId];
      return {
        conversations: newConvs,
        activeConversationId:
          s.activeConversationId === conversationId
            ? null
            : s.activeConversationId,
      };
    });
    get().fetchConversations();
  },

  setActiveConversation: (conversationId: string) => {
    set({ activeConversationId: conversationId });
    if (conversationId) {
      get().fetchMessages(conversationId);
      get().markAsRead(conversationId);
    }
  },

  fetchMessages: async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (data) {
      const mapped = data.map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content || "",
        image: m.image,
        voice: m.voice,
        createdAt: m.created_at,
        read: m.read || false,
      }));
      set((s) => ({ messages: { ...s.messages, [conversationId]: mapped } }));
    }
  },

  sendMessage: async (conversationId: string, payload) => {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId) return;

    // Optimistic
    const tempId = "temp-" + Date.now();
    const tempMsg: Message = {
      id: tempId,
      conversationId,
      senderId: userId,
      content: payload.content || "",
      image: payload.image,
      voice: payload.voice,
      createdAt: new Date().toISOString(),
      read: false,
    };

    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: [...(s.messages[conversationId] || []), tempMsg],
      },
    }));

    const { data } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: userId, content: payload.content, image: payload.image, voice: payload.voice })
      .select()
      .maybeSingle();

    if (data) {
      set((s) => {
        const msgs = s.messages[conversationId] || [];
        return {
          messages: {
            ...s.messages,
            [conversationId]: msgs.map((m) =>
              m.id === tempId
                ? { ...m, id: data.id, createdAt: data.created_at }
                : m,
            ),
          },
        };
      });
      // Updating conversation updated_at
      supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .then();
    }
  },

  markAsRead: async (conversationId: string) => {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId) return;

    set((s) => ({
      unreadCounts: { ...s.unreadCounts, [conversationId]: 0 },
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] || []).map((m) =>
          m.senderId !== userId && !m.read ? { ...m, read: true } : m,
        ),
      },
    }));

    // Update in DB (using message_reads logic, or fallback to simple update if we just use 'read' column)
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("read", false);
  },

  setTyping: (conversationId: string, isTyping: boolean) => {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId) return;

    import("./RealtimeManager").then((m) => {
      m.realtimeManager.broadcastTyping(conversationId, isTyping);
    });
  },

  updateTypingState: (
    conversationId: string,
    userId: string,
    isTyping: boolean,
  ) => {
    set((s) => {
      const typing = { ...s.typingUsers };
      if (!typing[conversationId]) typing[conversationId] = {};
      if (isTyping) {
        typing[conversationId][userId] = true;
      } else {
        delete typing[conversationId][userId];
      }
      return { typingUsers: typing };
    });
  },

  setOnlineUsers: (users: string[]) => set({ onlineUsers: users }),

  fetchOnlineUsers: async () => {
    const { data } = await supabase
      .from("user_presence")
      .select("user_id")
      .eq("status", "online")
      .gte("last_seen", new Date(Date.now() - 5 * 60000).toISOString()); // 5 mins threshold
      
    if (data) {
      set({ onlineUsers: data.map((d) => d.user_id) });
    }
  },

  // WebRTC Call Flow
  startCall: async (partnerId: string, type: "audio" | "video") => {
    console.log("INITIATE CALL", partnerId, type);
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId || userId === partnerId) return;

    const conversationId = await get().getOrCreateDirectConversation(partnerId);
    if (!conversationId) return;

    // Create call session mapped by UUID
    const sessionRes = await supabase
      .from("call_sessions")
      .insert({
        conversation_id: conversationId,
        initiated_by: userId,
        call_type: type,
        status: "ringing",
      })
      .select()
      .maybeSingle();

    console.log("CALL ROW CREATED", sessionRes.data, sessionRes.error);
    if (sessionRes.error) {
       console.error("Call Session Error:", sessionRes.error);
    }
    const session = sessionRes.data;

    if (session) {
      set({
        currentCall: {
          sessionId: session.id,
          status: "ringing",
          type,
          partnerId,
          isCaller: true,
          localStream: null,
          remoteStream: null,
          isMuted: false,
          isVideoOff: false,
          startedAt: null,
        },
      });

      import("./WebRTCManager").then(({ wrtcManager }) => {
        wrtcManager.initiateCall(session.id, partnerId, type);
      });
    }
  },

  acceptCall: async () => {
    const { currentCall } = get();
    if (!currentCall.sessionId || !currentCall.partnerId || !currentCall.type)
      return;

    await supabase
      .from("call_sessions")
      .update({ status: "connected" })
      .eq("id", currentCall.sessionId);

    set((s) => ({
      currentCall: {
        ...s.currentCall,
        status: "connected",
        startedAt: Date.now(),
      },
    }));

    import("./WebRTCManager").then(({ wrtcManager }) => {
      wrtcManager.acceptCall(
        currentCall.sessionId!,
        currentCall.partnerId!,
        currentCall.type!,
      );
    });
  },

  endCall: async () => {
    const { currentCall } = get();
    if (currentCall.localStream)
      currentCall.localStream.getTracks().forEach((t) => t.stop());
    if (currentCall.remoteStream)
      currentCall.remoteStream.getTracks().forEach((t) => t.stop());

    if (currentCall.sessionId) {
      await supabase
        .from("call_sessions")
        .update({ status: "ended" })
        .eq("id", currentCall.sessionId);
      import("./WebRTCManager").then(({ wrtcManager }) => {
        wrtcManager.endCall(currentCall.partnerId);
      });
      // Optionally log call length
      const duration = currentCall.startedAt ? Math.round((Date.now() - currentCall.startedAt) / 1000) : 0;
      if (currentCall.partnerId && currentCall.isCaller) {
        get().getOrCreateDirectConversation(currentCall.partnerId).then((convId) => {
           if (convId) {
             get().sendMessage(convId, { content: `📞 Call ended (${duration} seconds)` });
           }
        });
      }
    }

    set({
      currentCall: {
        sessionId: null,
        status: "idle",
        type: null,
        partnerId: null,
        isCaller: false,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isVideoOff: false,
        startedAt: null,
      },
    });
  },

  setLocalStream: (stream) =>
    set((s) => ({ currentCall: { ...s.currentCall, localStream: stream } })),
  setRemoteStream: (stream) =>
    set((s) => ({ currentCall: { ...s.currentCall, remoteStream: stream } })),

  toggleMute: () =>
    set((s) => {
      const muted = !s.currentCall.isMuted;
      if (s.currentCall.localStream) {
        s.currentCall.localStream
          .getAudioTracks()
          .forEach((t) => (t.enabled = !muted));
      }
      return { currentCall: { ...s.currentCall, isMuted: muted } };
    }),

  toggleVideo: () =>
    set((s) => {
      const videoOff = !s.currentCall.isVideoOff;
      if (s.currentCall.localStream) {
        s.currentCall.localStream
          .getVideoTracks()
          .forEach((t) => (t.enabled = !videoOff));
      }
      return { currentCall: { ...s.currentCall, isVideoOff: videoOff } };
    }),

  handleIncomingCall: (
    sessionId: string,
    callerId: string,
    type: "audio" | "video",
  ) => {
    const { currentCall } = get();

    console.log("INCOMING CALL RECEIVED", sessionId, callerId);

    if (currentCall.sessionId === sessionId) return;

    if (currentCall.status !== "idle") {
      // Auto-reject busy
      supabase
        .from("call_sessions")
        .update({ status: "busy" })
        .eq("id", sessionId)
        .then();
      import("./WebRTCManager").then(({ wrtcManager }) => {
        wrtcManager.sendSignal(callerId, { type: "busy", sessionId });
      });
      return;
    }
    set({
      currentCall: {
        sessionId,
        status: "ringing",
        partnerId: callerId,
        type,
        isCaller: false,
        localStream: null,
        remoteStream: null,
        isMuted: false,
        isVideoOff: false,
        startedAt: null,
      },
    });
  },

  handleCallAccepted: (sessionId: string, partnerId: string) => {
    const { currentCall } = get();
    if (currentCall.sessionId === sessionId) {
      set((s) => ({
        currentCall: {
          ...s.currentCall,
          status: "connected",
          startedAt: Date.now(),
        },
      }));
      // Start signaling
      import("./WebRTCManager").then(({ wrtcManager }) => {
        wrtcManager.startPeerConnection(partnerId, true, currentCall.type!);
      });
    }
  },

  handleCallEnded: (sessionId: string | null) => {
    const { currentCall } = get();
    if (!currentCall.sessionId) return;
    if (!sessionId || currentCall.sessionId === sessionId) {
      get().endCall();
    }
  },
}));
