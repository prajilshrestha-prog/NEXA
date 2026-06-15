import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { X, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function StoryViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const stories = useAppStore(state => state.stories) || [];
  const users = useAppStore(state => state.users) || {};
  const currentUser = useAppStore(state => state.currentUser);
  const deleteStory = useAppStore(state => state.deleteStory) || (async () => {});
  const viewStory = useAppStore(state => state.viewStory) || (async () => {});
  
  const initialIndex = stories.findIndex(s => s.id === id);
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const story = stories[currentIndex];
  const user = story ? users[story.userId] : null;

  useEffect(() => {
     if (story) viewStory(story.id);
  }, [story, viewStory]);

  useEffect(() => {
    if (!story || isPaused) return;
    
    // Auto advance every 5s for images, videos will rely on duration but for now simple 5s interval or if video ends
    const isVideo = story.mediaType === "video";
    const duration = 5000;
    const interval = 50;
    
    if (isVideo) {
       // Video takes over progress via timeupdate
       return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + (interval / duration) * 100;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, story]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      navigate(-1);
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    } else {
      navigate(-1);
    }
  };

  if (!story) return (
     <div className="fixed inset-0 bg-black flex items-center justify-center text-white/50 z-50">
        <Loader2 className="animate-spin" />
     </div>
  );

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col items-center justify-center">
      <div 
        className="relative w-full max-w-[400px] h-full sm:h-[80vh] sm:rounded-3xl overflow-hidden bg-neutral-900 flex items-center justify-center"
        onPointerDown={() => setIsPaused(true)}
        onPointerUp={() => setIsPaused(false)}
        onPointerLeave={() => setIsPaused(false)}
      >
         {story.mediaType === 'video' ? (
            <video 
               src={story.mediaUrl} 
               autoPlay 
               playsInline 
               className="w-full h-full object-cover"
               onEnded={nextStory}
               onTimeUpdate={(e) => {
                  const vid = e.currentTarget;
                  if (vid.duration) setProgress((vid.currentTime / vid.duration) * 100);
               }}
            />
         ) : (
            <img src={story.mediaUrl} className="w-full h-full object-cover" />
         )}

         {/* Progress bars */}
         <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {stories.map((s, idx) => (
               <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                     className="h-full bg-white transition-all duration-75"
                     style={{ 
                        width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                     }}
                  />
               </div>
            ))}
         </div>

         {/* Header */}
         <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3 drop-shadow-md">
               <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`} className="w-10 h-10 rounded-full border border-white/20" />
               <div>
                  <h3 className="font-bold text-sm tracking-wide shadow-black">{user?.username || 'user'}</h3>
                  <p className="text-[10px] text-white/80">{formatDistanceToNow(new Date(story.createdAt))} ago</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               {currentUser?.id === story.userId && (
                  <button onClick={async (e) => { e.stopPropagation(); await deleteStory(story.id); navigate(-1); }} className="text-white hover:text-red-400">
                     <Trash2 size={18} />
                  </button>
               )}
               <button onClick={() => navigate(-1)} className="text-white hover:text-white/70">
                  <X size={24} />
               </button>
            </div>
         </div>

         {/* Navigation overlays */}
         <div className="absolute top-20 bottom-16 left-0 w-1/3 z-0" onClick={(e) => { e.stopPropagation(); prevStory(); }} />
         <div className="absolute top-20 bottom-16 right-0 w-2/3 z-0" onClick={(e) => { e.stopPropagation(); nextStory(); }} />

         {/* Caption */}
         {story.caption && (
            <div className="absolute bottom-20 left-4 right-4 text-center z-10 pointer-events-none">
               <p className="bg-black/50 text-white p-3 rounded-xl inline-block backdrop-blur-md text-sm">{story.caption}</p>
            </div>
         )}
         
         {/* Footer / Reply Action */}
         {currentUser?.id !== story.userId && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20 flex gap-2">
               <input 
                 type="text" 
                 placeholder="Reply..." 
                 className="flex-1 bg-black/50 border border-white/20 rounded-full px-4 text-sm text-white outline-none focus:border-white/50 backdrop-blur-md"
                 onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsPaused(true);
                 }}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       const val = e.currentTarget.value.trim();
                       if (val) {
                          import("../store/communicationStore").then(async ({ useCommunicationStore }) => {
                             const convId = await useCommunicationStore.getState().getOrCreateDirectConversation(story.userId);
                             if (convId) {
                                await useCommunicationStore.getState().sendMessage(convId, `[Replied to story]: ${val}`);
                                navigate(`/messages/${convId}`);
                             }
                          });
                       }
                    }
                 }}
               />
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    import("../store/communicationStore").then(async ({ useCommunicationStore }) => {
                       const convId = await useCommunicationStore.getState().getOrCreateDirectConversation(story.userId);
                       if (convId) {
                          await useCommunicationStore.getState().sendMessage(convId, `❤️`);
                          alert("Reaction sent!");
                       }
                    });
                  }}
                  className="p-3 text-white hover:text-red-500 bg-black/50 rounded-full border border-white/20 backdrop-blur-md"
               >
                  ❤️
               </button>
            </div>
         )}
      </div>
    </div>
  );
}
