import { supabase } from "../lib/supabase";
import { useAppStore } from "./useAppStore";

class RealtimeManager {
  private mainChannel: ReturnType<typeof supabase.channel> | null = null;
  private unloadHandlerAdded = false;

  initGlobalSubscriptions() {
    if (this.mainChannel) return;

    const userId = useAppStore.getState().currentUser?.id;

    if (userId && !this.unloadHandlerAdded) {
       this.unloadHandlerAdded = true;
       window.addEventListener("beforeunload", () => {
          // Fire and forget beacon or simple beacon fetch isn't perfectly reliable, 
          // but we can try to use navigator.sendBeacon ideally. Since we can't easily construct a JWT for standard REST edge
          // we'll just fire an async upsert block.
          supabase.from("user_presence").upsert({
            user_id: userId,
            status: "offline",
            last_seen: new Date().toISOString()
          }).then();
       });
    }

    // Consolidate everything into a single channel to prevent Websocket resource limits & transport failures
    this.mainChannel = supabase.channel("nexa_main_v2", {
      config: {
        presence: userId ? { key: userId } : undefined,
        broadcast: { self: false },
      },
    });

    // Add global table subscriptions using a single binding for the public schema
    this.mainChannel.on(
      "postgres_changes",
      { event: "*", schema: "public" },
      (p) => {
        this.handlePayload(p.table, p);
      },
    );

    this.mainChannel.on("broadcast", { event: "call_signal" }, (payload) => {
      const state = useAppStore.getState();
      const currentUserId = state.currentUser?.id;
      if (currentUserId && payload.payload?.to === currentUserId) {
         import("./WebRTCManager").then((m) => {
            m.wrtcManager.handleSignal(payload.payload.from, payload.payload.signalData);
         });
      }
    });

    this.mainChannel.on("broadcast", { event: "typing" }, (payload) => {
      const state = useAppStore.getState();
      const currentUserId = state.currentUser?.id;
      if (currentUserId && payload.payload?.userId !== currentUserId) {
         import("./communicationStore").then((m) => {
            m.useCommunicationStore.getState().updateTypingState(
               payload.payload.chatId,
               payload.payload.userId,
               payload.payload.isTyping
            );
         });
      }
    });

    if (userId) {
      this.mainChannel.on("presence", { event: "sync" }, () => {
        const state = this.mainChannel?.presenceState();
        if (state) {
          const onlineIds = Object.keys(state);
          import("./communicationStore").then((m) =>
            m.useCommunicationStore.getState().setOnlineUsers(onlineIds),
          );
        }
      });
    }

    this.mainChannel.subscribe(async (status, err) => {
      if (status === "SUBSCRIBED") {
        console.log(`[RealtimeManager] Main channel subscribed successfully.`);
        if (userId) {
          await this.mainChannel?.track({
            online_at: new Date().toISOString(),
          });
          
          await supabase.from("user_presence").upsert({
            user_id: userId,
            status: "online",
            last_seen: new Date().toISOString()
          });
        }
      }
      if (status === "CHANNEL_ERROR") {
        // Supabase automatically reconnects sockets. Check if this is the generic transport timeout
        const errStr =
          typeof err === "string"
            ? err
            : err?.message || JSON.stringify(err) || "";
        if (!errStr.includes("transport failure") && !errStr.includes("1006")) {
          console.warn(`[RealtimeManager] Main channel error:`, err);
        }
      }
    });
  }

  broadcastTyping(chatId: string, isTyping: boolean) {
    const userId = useAppStore.getState().currentUser?.id;
    if (!userId || !this.mainChannel) return;
    this.mainChannel.send({
      type: "broadcast",
      event: "typing",
      payload: { userId, chatId, isTyping },
    });
  }

  broadcastCallSignal(to: string, type: string, signalData: any) {
    const from = useAppStore.getState().currentUser?.id;
    if (!from || !this.mainChannel) return;
    this.mainChannel.send({
      type: "broadcast",
      event: "call_signal",
      payload: { from, to, type, signalData },
    });
  }

  // Handle incoming payloads dynamically
  private handlePayload(table: string, payload: any) {
    const state = useAppStore.getState();
    const { event, new: newRec, old: oldRec } = payload;
    const currentUserId = state.currentUser?.id;

    switch (table) {
      case "posts": {
        if (event === "INSERT") {
          state.fetchProfiles([newRec.user_id]).then(() => {
            const p = {
              id: newRec.id,
              userId: newRec.user_id,
              content: newRec.caption,
              image: newRec.media_url,
              mediaType: newRec.media_type,
              musicTitle: newRec.music_title,
              musicArtist: newRec.music_artist,
              musicUrl: newRec.music_url,
              originalPostId: newRec.original_post_id,
              likes: newRec.likes || 0,
              comments: newRec.comments || 0,
              reposts: newRec.reposts || 0,
              createdAt: newRec.created_at,
            };
            useAppStore.setState((s) => {
              if (s.posts.find((x) => x.id === p.id)) return s;
              return { posts: [p, ...s.posts] };
            });
          });
        }
        if (event === "UPDATE") {
           useAppStore.setState((s) => ({
             posts: s.posts.map(p => p.id === newRec.id ? { 
                ...p, 
                likes: newRec.likes || 0,
                comments: newRec.comments || 0,
                reposts: newRec.reposts || 0,
                content: newRec.caption || p.content 
             } : p)
           }));
        }
        break;
      }
      case "comments": {
        if (event === "INSERT") {
          state.fetchProfiles([newRec.user_id]).then(() => {
            const comment = {
              id: newRec.id,
              postId: newRec.post_id,
              userId: newRec.user_id,
              content: newRec.content,
              likes: newRec.likes || 0,
              createdAt: newRec.created_at,
            };
            useAppStore.setState((s) => {
              const postComments = s.comments[newRec.post_id] || [];
              if (postComments.find((c) => c.id === comment.id)) return s;
              return {
                comments: {
                  ...s.comments,
                  [newRec.post_id]: [...postComments, comment],
                },
              };
            });
          });
        }
        break;
      }

      case "reels": {
        if (event === "INSERT") {
          state.fetchProfiles([newRec.user_id]).then(() => {
            const r = {
              id: newRec.id,
              userId: newRec.user_id,
              video: newRec.video_url || newRec.video,
              caption: newRec.caption,
              music: newRec.music,
              likes: newRec.likes || 0,
              comments: newRec.comments || 0,
              createdAt: newRec.created_at,
            };
            useAppStore.setState((s) => {
              if (s.reels.find((x) => x.id === r.id)) return s;
              return { reels: [r, ...s.reels] };
            });
          });
        }
        if (event === "UPDATE") {
           useAppStore.setState((s) => ({
             reels: s.reels.map(r => r.id === newRec.id ? { 
                ...r, 
                likes: newRec.likes || 0,
                comments: newRec.comments || 0,
                caption: newRec.caption || r.caption 
             } : r)
           }));
        }
        break;
      }

      case "profiles": {
        if (event === "UPDATE") {
          import("./useAppStore").then(({ normalizeProfile }) => {
             useAppStore.setState((s) => {
               const u = s.users[newRec.id];
               const normalized = normalizeProfile(newRec);
               const newUser = u ? { ...u, ...normalized } : normalized;
               return {
                 users: { ...s.users, [newRec.id]: newUser },
                 ...(s.currentUser?.id === newRec.id
                   ? { currentUser: { ...s.currentUser, ...newUser } as any }
                   : {}),
               };
             });
          });
        }
        break;
      }

      case "friend_requests": {
        if (
          currentUserId &&
          (newRec.sender_id === currentUserId ||
            newRec.receiver_id === currentUserId)
        ) {
          state.fetchFriendRequests();
        }
        break;
      }

      case "notifications": {
        if (event === "INSERT") {
          console.log(`[Failsafe] Notification received: ${newRec.type} from ${newRec.from_user_id}`);
          if (newRec.user_id === currentUserId) {
            state.fetchProfiles([newRec.from_user_id]).then(() => {
              const notif = {
                id: newRec.id,
                userId: newRec.user_id,
                fromUserId: newRec.from_user_id,
                type: newRec.type,
                postId: newRec.post_id,
                read: newRec.read || false,
                createdAt: newRec.created_at,
              };
              useAppStore.setState((s) => {
                if (s.notifications.find((n) => n.id === notif.id)) return s;
                return { notifications: [notif, ...s.notifications] };
              });
            });
          }
        }
        break;
      }

      case "conversations": {
        import("./communicationStore").then((m) => {
          m.useCommunicationStore.getState().fetchConversations();
        });
        break;
      }
      
      case "conversation_participants": {
        if (event === "INSERT" && newRec.user_id === currentUserId) {
          import("./communicationStore").then((m) => {
            m.useCommunicationStore.getState().fetchConversations();
          });
        }
        break;
      }
      case "messages": {
        if (event === "INSERT" && currentUserId) {
          import("./communicationStore").then((m) => {
            const cs = m.useCommunicationStore.getState();
            // Only care if we are in this conversation
            const isParticipant = cs.participants[newRec.conversation_id]?.some(
              (p) => p.userId === currentUserId,
            );

            if (!cs.participants[newRec.conversation_id]) {
              cs.fetchConversations();
            }

            if (
              isParticipant ||
              newRec.sender_id === currentUserId ||
              !cs.participants[newRec.conversation_id]
            ) {
              const msg = {
                id: newRec.id,
                conversationId: newRec.conversation_id,
                senderId: newRec.sender_id,
                content: newRec.content || "",
                image: newRec.image,
                voice: newRec.voice,
                createdAt: newRec.created_at,
                read: newRec.read || false,
              };
              useAppStore.getState().fetchProfiles([newRec.sender_id]);
              m.useCommunicationStore.setState((s) => {
                const existing = s.messages[newRec.conversation_id] || [];
                if (existing.find((x) => x.id === msg.id)) return s;

                // Remove optimistic temp message if it has exact same content and sender
                const filtered = existing.filter(
                  (x) =>
                    !(
                      x.id.startsWith("temp-") &&
                      x.content === msg.content &&
                      x.senderId === msg.senderId
                    ),
                );

                // Auto mark read if active
                if (
                  s.activeConversationId === newRec.conversation_id &&
                  newRec.sender_id !== currentUserId
                ) {
                  setTimeout(() => cs.markAsRead(newRec.conversation_id), 100);
                } else if (newRec.sender_id !== currentUserId) {
                  s.unreadCounts[newRec.conversation_id] =
                    (s.unreadCounts[newRec.conversation_id] || 0) + 1;
                }

                return {
                  messages: {
                    ...s.messages,
                    [newRec.conversation_id]: [...filtered, msg],
                  },
                  unreadCounts: s.unreadCounts,
                };
              });
            }
          });
        }
        if (event === "UPDATE") {
           import("./communicationStore").then((m) => {
              m.useCommunicationStore.setState((s) => {
                 const existing = s.messages[newRec.conversation_id] || [];
                 const updated = existing.map(msg => msg.id === newRec.id ? {
                     ...msg,
                     read: newRec.read !== undefined ? newRec.read : msg.read,
                     content: newRec.content || msg.content,
                     image: newRec.image !== undefined ? newRec.image : msg.image,
                     voice: newRec.voice !== undefined ? newRec.voice : msg.voice
                 } : msg);
                 return {
                    messages: {
                       ...s.messages,
                       [newRec.conversation_id]: updated
                    }
                 };
              });
           });
        }
        break;
      }
      case "typing_status": {
        if (currentUserId && newRec.user_id !== currentUserId) {
          import("./communicationStore").then((m) => {
            m.useCommunicationStore
              .getState()
              .updateTypingState(
                newRec.conversation_id || oldRec?.conversation_id,
                newRec.user_id || oldRec?.user_id,
                event === "INSERT" || event === "UPDATE"
                  ? newRec.is_typing
                  : false,
              );
          });
        }
        break;
      }
      case "stories": {
        if (event === "INSERT") {
          state.fetchProfiles([newRec.user_id]).then(() => {
            const s = {
              id: newRec.id,
              userId: newRec.user_id,
              mediaUrl: newRec.media_url,
              mediaType: newRec.media_type,
              caption: newRec.caption,
              expiresAt: newRec.expires_at,
              createdAt: newRec.created_at,
            };
            useAppStore.setState((st) => {
              if (st.stories.find((x) => x.id === s.id)) return st;
              return { stories: [s, ...st.stories] };
            });
          });
        }
        break;
      }
      
      case "notes": {
        if (event === "INSERT") {
          state.fetchProfiles([newRec.user_id]).then(() => {
            const n = {
              id: newRec.id,
              userId: newRec.user_id,
              content: newRec.content,
              musicTitle: newRec.music_title,
              musicUrl: newRec.music_url,
              gifUrl: newRec.gif_url,
              expiresAt: newRec.expires_at,
              createdAt: newRec.created_at,
            };
            useAppStore.setState((st) => {
              if (st.notes.find((x) => x.id === n.id)) return st;
              return { notes: [n, ...st.notes] };
            });
          });
        }
        break;
      }
      
      case "user_presence": {
         import("./communicationStore").then((m) => {
           const state = m.useCommunicationStore.getState();
           const currentOnline = state.onlineUsers;
           
           if (newRec.status === "online" && new Date(newRec.last_seen).getTime() > Date.now() - 5 * 60000) {
              if (!currentOnline.includes(newRec.user_id)) {
                 state.setOnlineUsers([...currentOnline, newRec.user_id]);
              }
           } else {
              if (currentOnline.includes(newRec.user_id)) {
                 state.setOnlineUsers(currentOnline.filter(id => id !== newRec.user_id));
              }
           }
         });
         break;
      }
      case "call_sessions": {
        if (event === "UPDATE" && newRec.status === "ended") {
           import("./communicationStore").then(m => {
              const state = m.useCommunicationStore.getState();
              if (state.currentCall.sessionId === newRec.id && state.currentCall.status !== "idle") {
                 // End it without updating DB again
                 state.endCall();
              }
           });
        }
        break;
      }
      case "webrtc_signals": {
        if (event === "INSERT" && newRec.receiver_id === currentUserId) {
          import("./WebRTCManager").then((m) => {
            m.wrtcManager.handleSignal(newRec.sender_id, newRec.signal);
          });
        }
        break;
      }
    }
  }

  cleanup() {
    if (this.mainChannel) {
      supabase.removeChannel(this.mainChannel);
      this.mainChannel = null;
    }
  }
}

export const realtimeManager = new RealtimeManager();
