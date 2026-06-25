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
  Loader2,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { uploadMedia } from "../lib/upload";
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
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSelectedUsers, setGroupSelectedUsers] = useState<string[]>([]);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteMusicTitle, setNoteMusicTitle] = useState("");
  const [noteMusicUrl, setNoteMusicUrl] = useState("");
  const [noteBgColor, setNoteBgColor] = useState("#2A2A35");

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

  useEffect(() => {
    console.log("activeConversationId:", activeConversationId);
    console.log("activeMessages count:", activeMessages.length);
  }, [activeConversationId, activeMessages.length]);

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

  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async (overrideText?: string, mediaUrl?: string, audioUrl?: string) => {
    const textToSend = overrideText !== undefined ? overrideText : inputText.trim();
    if ((!textToSend && !mediaUrl && !audioUrl) || !activeConversationId) return;
    try {
      const messageType = audioUrl ? "audio" : mediaUrl ? "image" : "text";
      await sendMessage(activeConversationId, { content: textToSend, mediaUrl, audioUrl, messageType });
      setInputText("");
    } catch (e: any) {
      console.error("Failed to send", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeConversationId) {
      try {
        setIsUploading(true);
        const file = e.target.files[0];
        const publicUrl = await uploadMedia(file, "media", () => {});
        await handleSend("", publicUrl, undefined);
      } catch (err: any) {
        console.error("Upload failed", err);
      } finally {
        setIsUploading(false);
        e.target.value = ''; // Reset input to allow attaching the same file again
      }
    }
  };

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleVoiceUpload = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        try {
          setIsUploading(true);
          const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
          const publicUrl = await uploadMedia(file, "media", () => {});
          await handleSend("", undefined, publicUrl);
        } catch (err: any) {
          console.error("Voice upload failed", err);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
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
                setGroupName("");
                setGroupSelectedUsers([]);
                setIsGroupModalOpen(true);
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
                 onClick={() => setIsNoteModalOpen(true)}
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
                          <div 
                             className="absolute -top-4 left-1/2 -translate-x-1/2 backdrop-blur-md text-white rounded-xl px-3 py-2 flex flex-col items-center justify-center text-xs shadow-lg shadow-black/50 border border-white/20 whitespace-normal min-w-[70px] max-w-[150px] text-center z-10 w-max"
                             style={{ backgroundColor: note.backgroundColor || 'rgba(0,0,0,0.8)' }}
                          >
                             <span className="line-clamp-2 leading-tight">{note.content}</span>
                             {note.musicTitle && (
                               <div className="mt-1 bg-black/40 px-1.5 py-0.5 rounded flex items-center gap-1 w-full overflow-hidden">
                                 <span className="text-[8px] truncate block w-full">{note.musicTitle}</span>
                               </div>
                             )}
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
                    onClick={() => navigate(`/u/${activePartner.username || activePartner.id}`)}
                    src={
                      activePartner.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.id}`
                    }
                    alt={activePartner.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20 cursor-pointer"
                  />
                  <div>
                    <h3 onClick={() => navigate(`/u/${activePartner.username || activePartner.id}`)} className="font-bold text-white text-sm md:text-base cursor-pointer hover:underline">
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
                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors" onClick={() => {
                      // Stub local action mute
                      console.log("Chat muted");
                      document.dispatchEvent(new CustomEvent('nav-alert', { detail: 'Chat muted' }));
                  }}>
                    Mute Chat
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors" onClick={() => {
                      console.log("Chat archived");
                      document.dispatchEvent(new CustomEvent('nav-alert', { detail: 'Chat archived' }));
                  }}>
                    Archive Chat
                  </button>
                  {activePartner && (
                    <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-white/80 transition-colors" onClick={() => {
                       console.log("User blocked");
                       document.dispatchEvent(new CustomEvent('nav-alert', { detail: 'User blocked' }));
                    }}>
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
                  <button className="w-full text-left px-4 py-3 hover:bg-white/10 text-sm text-rose-400 transition-colors" onClick={() => {
                     console.log("User reported");
                     document.dispatchEvent(new CustomEvent('nav-alert', { detail: 'User reported' }));
                  }}>
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
                          onClick={() => navigate(`/u/${sender.username || sender.id}`)}
                          src={
                            sender.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender.id}`
                          }
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-auto cursor-pointer"
                          alt="Avatar"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <div
                          className={`p-4 rounded-2xl md:rounded-3xl ${isMine ? "bg-indigo-600 rounded-br-sm" : "glass border border-white/10 rounded-bl-sm"} shadow-lg`}
                        >
                          {msg.mediaUrl && (
                            <img src={msg.mediaUrl} className="w-full max-w-sm rounded-xl mb-2 object-cover" alt="Attachment" />
                          )}
                          {msg.audioUrl && (
                            <audio src={msg.audioUrl} controls className="mb-2 max-w-[200px]" />
                          )}
                          {msg.content && msg.content.trim() !== "" && (
                            <p className="text-sm text-white/90 leading-relaxed break-words whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
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
                              ) : msg.seen ? (
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
                  <button onClick={handleVoiceUpload} disabled={isUploading} className={`p-3 transition-colors rounded-full ${isRecording ? 'text-rose-500 bg-rose-500/20 animate-pulse' : 'text-white/50 hover:text-white bg-white/5'}`}>
                    {isRecording ? <div className="w-5 h-5 rounded-sm bg-rose-500" /> : <Mic size={20} />}
                  </button>
                  <label className={`p-3 text-white/50 hover:text-white transition-colors bg-white/5 rounded-full ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input type="file" className="hidden" accept="image/*,video/*" disabled={isUploading} onChange={handleFileUpload}/>
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <FileImage size={20} />}
                  </label>
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() && !isUploading}
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

      {/* Group Creation Modal */}
      <AnimatePresence>
        {isGroupModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-center backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--color-nexa-dark)] w-full max-w-md rounded-2xl border border-white/10 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg">Create Group Matrix</h3>
                <button onClick={() => setIsGroupModalOpen(false)} className="p-2 text-white/50 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 flex flex-col gap-4">
                 <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter Group Name..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                 />
                 
                 <div>
                    <h4 className="text-white/50 text-xs font-mono uppercase mb-2 ml-1">Select Entities</h4>
                    <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-hide pr-2">
                       {Object.values(users).filter(u => u.id !== currentUser.id).map(user => {
                          const isSelected = groupSelectedUsers.includes(user.id);
                          return (
                             <div 
                                key={user.id} 
                                onClick={() => setGroupSelectedUsers(prev => isSelected ? prev.filter(id => id !== user.id) : [...prev, user.id])}
                                className={`flex flex-row items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${isSelected ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                             >
                                <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                   <h4 className="text-sm font-bold text-white">{user.name}</h4>
                                   <p className="text-xs text-white/50">@{user.username}</p>
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>
                 
                 <button 
                    disabled={!groupName.trim() || groupSelectedUsers.length === 0}
                    onClick={async () => {
                       const convId = await useCommunicationStore.getState().createGroupConversation(groupName.trim(), groupSelectedUsers);
                       if (convId) {
                          setActiveConversation(convId);
                          navigate(`/messages/${convId}`);
                          setIsGroupModalOpen(false);
                       }
                    }}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:bg-indigo-500 text-white font-bold tracking-widest rounded-xl transition-colors mt-2 uppercase text-sm"
                 >
                    Initialize Group
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isNoteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-center backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1A24] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-white/5"
            >
               <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold tracking-tight text-white">Share a Note</h2>
                     <button onClick={() => setIsNoteModalOpen(false)} className="text-white/40 hover:text-white p-2">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">What's on your mind?</label>
                        <textarea
                           value={noteContent}
                           onChange={e => setNoteContent(e.target.value)}
                           className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 resize-none h-24"
                           placeholder="Share a short thought..."
                        />
                     </div>
                     
                     <div className="flex gap-4">
                        <div className="flex-1">
                           <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Music Title (Optional)</label>
                           <input
                              type="text"
                              value={noteMusicTitle}
                              onChange={e => setNoteMusicTitle(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                              placeholder="e.g. Lofi Chill"
                           />
                        </div>
                        <div className="flex-1">
                           <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Music URL (Optional)</label>
                           <input
                              type="text"
                              value={noteMusicUrl}
                              onChange={e => setNoteMusicUrl(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
                              placeholder="https://..."
                           />
                        </div>
                     </div>
                     
                     <div>
                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Background Color</label>
                        <div className="flex gap-2">
                           {["#2A2A35", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"].map(color => (
                              <button
                                 key={color}
                                 onClick={() => setNoteBgColor(color)}
                                 className={`w-8 h-8 rounded-full border-2 transition-transform ${noteBgColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                 style={{ backgroundColor: color }}
                              />
                           ))}
                        </div>
                     </div>
                  </div>
                  
                  <button 
                     disabled={!noteContent.trim()}
                     onClick={() => {
                        addNote({
                           content: noteContent.trim(),
                           musicTitle: noteMusicTitle.trim() || undefined,
                           musicUrl: noteMusicUrl.trim() || undefined,
                           backgroundColor: noteBgColor,
                           expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                           userId: currentUser.id
                        });
                        setIsNoteModalOpen(false);
                        setNoteContent("");
                        setNoteMusicTitle("");
                        setNoteMusicUrl("");
                        setNoteBgColor("#2A2A35");
                     }}
                     className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:bg-indigo-500 text-white font-bold tracking-widest rounded-xl transition-colors mt-6 uppercase text-sm"
                  >
                     Share Note
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
