import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Send,
  FileImage,
  Mic,
  Phone,
  Video,
  MoreVertical,
  Plus,
  MessageSquare,
  ChevronLeft,
  X,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useCommunicationStore } from "../store/communicationStore";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export function Messages() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const users = useAppStore((state) => state.users) || {};

  const {
    conversations,
    participants,
    messages,
    unreadCounts,
    activeConversationId,
    typingUsers,
    onlineUsers,
    isSearching,
    searchResults,

    searchUsers,
    clearSearch,
    fetchConversations,
    getOrCreateDirectConversation,
    deleteConversation,
    setActiveConversation,
    sendMessage,
    setTyping,
    startCall,
  } = useCommunicationStore();

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (id && id !== activeConversationId) {
      setActiveConversation(id);
    }
  }, [id, activeConversationId, setActiveConversation]);

  const activeMessages = activeConversationId
    ? messages[activeConversationId] || []
    : [];

  // Get active partner UI details for direct messages
  const activePartner = useMemo(() => {
    if (!activeConversationId || conversations[activeConversationId]?.isGroup)
      return null;
    const parts = participants[activeConversationId] || [];
    const otherId = parts.find((p) => p.userId !== currentUser?.id)?.userId;
    return otherId ? users[otherId] : null;
  }, [
    activeConversationId,
    participants,
    users,
    currentUser?.id,
    conversations,
  ]);

  // Derived list of conversations sorted by latest message
  const sortedConversations = useMemo(() => {
    return Object.values(conversations).sort((a, b) => {
      const timeA = new Date(a.updatedAt).getTime();
      const timeB = new Date(b.updatedAt).getTime();
      return timeB - timeA;
    });
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, inputText);
    setInputText("");
  };

  let typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (activeConversationId) {
      setTyping(activeConversationId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(activeConversationId, false);
      }, 2000);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    searchUsers(q);
  };

  const startDirectChat = async (targetUserId: string) => {
    const convId = await getOrCreateDirectConversation(targetUserId);
    if (convId) {
      setSearchQuery("");
      clearSearch();
      setActiveConversation(convId);
    }
  };

  if (!currentUser) return null;

  const friendRequests = useAppStore((state) => state.friendRequests);
  const notes = useAppStore((state) => state.notes) || [];
  const addNote = useAppStore((state) => state.addNote) || (async () => {});
  const isFriend = activePartner
    ? friendRequests.some(
        (r) =>
          r.status === "accepted" &&
          ((r.senderId === currentUser.id &&
            r.receiverId === activePartner.id) ||
            (r.receiverId === currentUser.id &&
              r.senderId === activePartner.id)),
      )
    : false;

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${activeConversationId ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-white/5 flex-col glass z-10 flex-shrink-0`}
      >
        <div className="p-4 border-b border-white/5">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex justify-between items-center">
            Quantum Comm
            <button
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Establish Group Sync"
              onClick={() => {
                const name = window.prompt("Enter Group Matrix Name:");
                if (name) {
                  // Get all friends to invite
                  // For now, let's just create an empty group and we can add later, or we just prompt for usernames
                  const usernames = window.prompt(
                    "Enter comma-separated usernames to invite (leave empty for none):",
                  );
                  if (usernames !== null) {
                    const names = usernames
                      .split(",")
                      .map((u) => u.trim())
                      .filter(Boolean);
                    const userIds = names
                      .map(
                        (n) =>
                          Object.values(users).find((u) => u.username === n)
                            ?.id,
                      )
                      .filter(Boolean) as string[];
                    useCommunicationStore
                      .getState()
                      .createGroupConversation(name, userIds)
                      .then((convId) => {
                        if (convId) {
                          setActiveConversation(convId);
                          navigate(`/messages/${convId}`);
                        }
                      });
                  }
                }
              }}
            >
              <Plus size={18} />
            </button>
          </h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search origin networks..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  clearSearch();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Notes Bar */}
        <div className="border-b border-white/5 py-4 overflow-x-auto scrollbar-hide">
           <div className="flex gap-4 px-4">
              <div 
                 className="relative shrink-0 flex flex-col items-center gap-1 cursor-pointer"
                 onClick={() => {
                    const text = window.prompt("Share a thought (Note):");
                    if (text) {
                       addNote({
                          content: text,
                          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                          userId: currentUser.id
                       });
                    }
                 }}
              >
                  <div className="relative">
                     <img src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`} className="w-14 h-14 rounded-full object-cover border border-white/20" />
                     <div className="absolute -top-3 -right-2 bg-indigo-500 text-white rounded-xl px-2 py-1 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-black/50 border border-white/20">
                        <Plus size={10} className="mr-0.5" /> Note
                     </div>
                  </div>
                  <span className="text-[10px] text-white/50 font-medium">Your Note</span>
              </div>
              
              {notes?.map(note => {
                 const author = users[note.userId];
                 return (
                    <div key={note.id} className="relative shrink-0 flex flex-col items-center gap-1 cursor-pointer group">
                       <div className="relative">
                          <img src={author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${note.userId}`} className="w-14 h-14 rounded-full object-cover border border-white/20" />
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white rounded-xl px-3 py-2 flex items-center justify-center text-xs shadow-lg shadow-black/50 border border-white/20 whitespace-normal max-w-[100px] text-center line-clamp-2 leading-tight z-10 w-max">
                             {note.content}
                          </div>
                       </div>
                       <span className="text-[10px] text-white/90 font-medium">{author?.username || 'user'}</span>
                    </div>
                 );
              })}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-2 relative">
          {searchQuery ? (
            // Search Results
            <div className="px-2">
              {isSearching ? (
                <p className="text-center text-xs text-white/50 py-4 font-mono">
                  Scanning network...
                </p>
              ) : searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startDirectChat(u.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors rounded-lg mb-1"
                  >
                    <img
                      src={
                        u.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`
                      }
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      alt={u.name}
                    />
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-white/40">@{u.username}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-center text-xs text-white/50 py-4 font-mono">
                  No entities found.
                </p>
              )}
            </div>
          ) : (
            // Conversations List
            sortedConversations.map((conv) => {
              const parts = participants[conv.id] || [];
              const otherPart = parts.find((p) => p.userId !== currentUser.id);
              const otherUser = otherPart ? users[otherPart.userId] : null;

              if (!conv.isGroup && !otherUser) return null; // Skip if user data not loaded yet

              const title = conv.isGroup ? conv.name : otherUser?.name;
              const avatar = conv.isGroup
                ? `https://api.dicebear.com/7.x/shapes/svg?seed=${conv.id}`
                : otherUser?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.id}`;

              const convMsgs = messages[conv.id] || [];
              const lastMessage = convMsgs[convMsgs.length - 1];
              const unreadCount = unreadCounts[conv.id] || 0;

              const isOtherTyping =
                otherUser && typingUsers[conv.id]?.[otherUser.id];

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    navigate(`/messages/${conv.id}`);
                  }}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border-l-2 ${activeConversationId === conv.id ? "border-indigo-500 bg-white/5" : "border-transparent"}`}
                >
                  <div className="relative">
                    <img
                      src={avatar}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                      alt={title}
                    />
                    {!conv.isGroup &&
                      otherUser &&
                      onlineUsers.includes(otherUser.id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--color-nexa-dark)]"></div>
                      )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span
                        className={`text-sm truncate ${unreadCount > 0 ? "font-bold text-white" : "font-medium text-white/80"}`}
                      >
                        {title}
                      </span>
                      <div className="flex items-center gap-2">
                        {lastMessage && (
                          <span className="text-[10px] text-white/40">
                            {format(new Date(lastMessage.createdAt), "HH:mm")}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-white/60 truncate">
                      {isOtherTyping ? (
                        <span className="text-emerald-400 italic">
                          Synchronizing thought...
                        </span>
                      ) : lastMessage ? (
                        lastMessage.content
                      ) : (
                        "Initiate sync..."
                      )}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeConversationId ? (
        <div
          className={`${!activeConversationId ? "hidden md:flex" : "flex"} flex-1 flex-col relative w-full h-full`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 pointer-events-none" />

          {/* Chat Header */}
          <header className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center glass z-10 sticky top-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setActiveConversation("");
                  navigate("/messages");
                }}
                className="md:hidden p-2 -ml-2 text-white/50 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              {conversations[activeConversationId]?.isGroup ? (
                <>
                  <img
                    src={`https://api.dicebear.com/7.x/shapes/svg?seed=${activeConversationId}`}
                    alt={conversations[activeConversationId].name || "Group"}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-base">
                      {conversations[activeConversationId].name ||
                        "Group Matrix"}
                    </h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-nexa-accent-light)]">
                      {participants[activeConversationId]?.length || 0} Entities
                    </p>
                  </div>
                </>
              ) : activePartner ? (
                <>
                  <img
                    src={
                      activePartner.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.id}`
                    }
                    alt={activePartner.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-base">
                      {activePartner.name}
                    </h3>
                    <p
                      className={`text-[10px] font-mono uppercase tracking-widest ${onlineUsers.includes(activePartner.id) ? "text-emerald-400" : "text-white/40"}`}
                    >
                      {onlineUsers.includes(activePartner.id)
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-3 text-white/60">
              {activePartner && isFriend && (
                <>
                  <button
                    onClick={() => startCall(activePartner.id, "audio")}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors tooltip-trigger relative group"
                  >
                    <Phone size={18} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-black text-white text-[10px] uppercase font-bold px-2 py-1 rounded whitespace-nowrap z-50">
                      Audio Sync
                    </span>
                  </button>
                  <button
                    onClick={() => startCall(activePartner.id, "video")}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors tooltip-trigger relative group"
                  >
                    <Video size={18} />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-black text-white text-[10px] uppercase font-bold px-2 py-1 rounded whitespace-nowrap z-50">
                      Video Sync
                    </span>
                  </button>
                </>
              )}
              <div className="relative group">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <MoreVertical size={18} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-white/10 rounded-2xl overflow-hidden glass shadow-2xl scale-0 group-hover:scale-100 origin-top-right transition-transform z-50 flex flex-col">
                  {activePartner && (
                    <button 
                      className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors"
                      onClick={() => navigate(`/u/${activePartner.username}`)}
                    >
                      View Profile
                    </button>
                  )}
                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors" onClick={() => alert("Chat muted")}>
                    Mute Chat
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors" onClick={() => alert("Chat archived")}>
                    Archive Chat
                  </button>
                  {activePartner && (
                    <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors" onClick={() => alert("User blocked")}>
                      Block User
                    </button>
                  )}
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-rose-500/20 text-sm text-rose-500 transition-colors border-y border-white/5"
                    onClick={async () => {
                      if (window.confirm("Permanently delete conversation?")) {
                        try {
                          await deleteConversation(activeConversationId);
                          navigate("/messages");
                        } catch (e) {}
                      }
                    }}
                  >
                    Delete Conversation
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-rose-400 transition-colors" onClick={() => alert("User reported")}>
                    Report User
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 flex flex-col">
            <div className="flex-1" />{" "}
            {/* Spacer to push messages down if few */}
            {activeMessages.map((msg, idx) => {
              const isMine = msg.senderId === currentUser.id;
              const sender = users[msg.senderId];

              const prevMsg = activeMessages[idx - 1];
              const msgDate = new Date(msg.createdAt);
              const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

              const showDate =
                !prevDate || msgDate.toDateString() !== prevDate.toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-6">
                      <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] text-white/50 uppercase tracking-widest font-mono">
                        {format(msgDate, "MMM d, yyyy")}
                      </div>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] md:max-w-[60%] flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isMine && sender && (
                        <img
                          src={
                            sender.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender.id}`
                          }
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto"
                          alt="Avatar"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <div
                          className={`p-4 rounded-2xl md:rounded-3xl ${isMine ? "bg-indigo-600 rounded-br-sm" : "glass border border-white/10 rounded-bl-sm"} shadow-lg`}
                        >
                          <p className="text-sm text-white/90 leading-relaxed break-words whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-[10px] text-white/30 font-mono ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <span>
                            {format(new Date(msg.createdAt), "HH:mm")}
                          </span>
                          {isMine && (
                            <span className="flex items-center gap-0.5">
                              {msg.id.startsWith("temp-") ? (
                                <span className="opacity-50">Sending...</span>
                              ) : msg.read ? (
                                <span className="text-emerald-400">Seen</span>
                              ) : (
                                <span>Sent</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            {/* Show other participants typing */}
            {activePartner &&
              typingUsers[activeConversationId]?.[activePartner.id] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[75%] md:max-w-[60%] flex gap-3 flex-row">
                    <img
                      src={
                        activePartner.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.id}`
                      }
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto"
                      alt="Avatar"
                    />
                    <div className="p-4 rounded-2xl md:rounded-3xl glass border border-white/10 rounded-bl-sm shadow-lg flex items-center justify-center gap-1.5 h-12 w-16">
                      <span
                        className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 md:p-6 glass border-t border-white/5 z-10 w-full">
            {!activePartner || isFriend ? (
              <div className="w-full max-w-4xl mx-auto flex items-end gap-3 p-2 rounded-3xl bg-white/5 border border-white/10 focus-within:border-indigo-500/50 transition-colors">
                <button className="p-3 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full">
                  <Plus size={20} />
                </button>
                <textarea
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Synchronize thought..."
                  className="flex-1 bg-transparent border-none text-white text-sm max-h-32 min-h-[44px] py-3 focus:outline-none resize-none placeholder:text-white/30 scrollbar-hide"
                />
                <div className="flex gap-2">
                  <button onClick={() => alert("Voice messaging coming in next release!")} className="p-3 text-white/50 hover:text-white transition-colors">
                    <Mic size={20} />
                  </button>
                  <label className="p-3 text-white/50 hover:text-white transition-colors cursor-pointer">
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => {
                       if (e.target.files?.[0]) alert("Image attached: " + e.target.files[0].name);
                    }}/>
                    <FileImage size={20} />
                  </label>
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:bg-indigo-500 text-white rounded-full transition-colors flex items-center justify-center"
                  >
                    <Send size={18} className="translate-x-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full text-center text-sm font-mono tracking-widest text-white/50 bg-white/5 rounded-full p-3 border border-white/10">
                You must become friends with this entity to exchange data
                streams.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center p-8 z-10">
          <div className="glass p-10 rounded-full border border-white/10 mb-6 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <MessageSquare size={48} className="text-white/20" />
          </div>
          <h3 className="text-2xl font-display font-bold text-white mb-2">
            Omniversal Sync Required
          </h3>
          <p className="text-white/40 text-sm font-mono uppercase tracking-widest text-center max-w-md">
            Select an entity from the network stream to initiate encrypted
            consciousness transfer.
          </p>
        </div>
      )}
    </div>
  );
}
