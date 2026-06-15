import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  PhoneOff,
  Phone,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useCommunicationStore } from "../../store/communicationStore";
import { useAppStore } from "../../store/useAppStore";

export function CallOverlay() {
  const currentCall = useCommunicationStore((state) => state.currentCall);
  const { endCall, acceptCall, toggleMute, toggleVideo } =
    useCommunicationStore();
  const users = useAppStore((state) => state.users);
  const fetchProfiles = useAppStore((state) => state.fetchProfiles);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [duration, setDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const partner = currentCall.partnerId ? users[currentCall.partnerId] : null;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentCall.status === "ringing") {
      audioRef.current = new Audio(
        "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=telephone-ring-04-45306.mp3",
      );
      audioRef.current.loop = true;
      audioRef.current.play().catch((e) => console.log("Audio blocked", e));
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentCall.status]);

  useEffect(() => {
    if (currentCall.partnerId && !partner) {
      fetchProfiles([currentCall.partnerId]);
    }
  }, [currentCall.partnerId, partner, fetchProfiles]);

  useEffect(() => {
    let interval: any;
    if (currentCall.status === "connected" && currentCall.startedAt) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - currentCall.startedAt!) / 1000));
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [currentCall.status, currentCall.startedAt]);

  useEffect(() => {
    if (localVideoRef.current && currentCall.localStream) {
      localVideoRef.current.srcObject = currentCall.localStream;
    }
  }, [currentCall.localStream, isMinimized, currentCall.status]);

  useEffect(() => {
    if (remoteVideoRef.current && currentCall.remoteStream) {
      remoteVideoRef.current.srcObject = currentCall.remoteStream;
    }
  }, [currentCall.remoteStream, isMinimized, currentCall.status]);

  if (currentCall.status === "idle") return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 right-4 z-[100] w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl overflow-hidden cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="absolute top-2 right-2 flex gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1.5 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <Maximize2 size={12} />
            </button>
          </div>
          {currentCall.type === "video" && currentCall.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-32 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/40">
              <img
                src={
                  partner?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCall.partnerId}`
                }
                alt={partner?.name}
                className="w-12 h-12 rounded-full border border-white/20 mb-2"
              />
              <span className="text-white text-xs font-bold">
                {partner?.name}
              </span>
              <span className="text-white/60 text-[10px] font-mono">
                {currentCall.status === "connected"
                  ? formatDuration(duration)
                  : currentCall.status}
              </span>
            </div>
          )}
          <div className="p-3 flex justify-between items-center glass border-t border-white/10">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className={`p-2 rounded-full ${currentCall.isMuted ? "bg-rose-500/20 text-rose-400" : "bg-white/10 text-white"}`}
              >
                {currentCall.isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                endCall();
              }}
              className="p-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white transition-colors"
            >
              <PhoneOff size={14} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-3xl overflow-hidden"
      >
        {/* Background blur of remote user if connected, or ringing effect */}
        {currentCall.status === "connected" && currentCall.type === "video" ? (
          <>
            <div className="absolute inset-0 w-full h-full bg-[var(--color-nexa-dark)] scale-105 origin-center pointer-events-none">
              <div className="w-full h-full bg-indigo-900/20 blur-3xl absolute" />
              {currentCall.remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-30 animate-pulse">
                  <Video size={100} className="text-white mb-4" />
                  <p className="font-mono text-white/50 tracking-widest uppercase">
                    Encrypted Feed Synchronizing
                  </p>
                </div>
              )}
            </div>

            {/* Local Video Picture-in-Picture */}
            <motion.div
              drag
              dragConstraints={{
                left: -200,
                right: 200,
                top: -200,
                bottom: 200,
              }}
              className="absolute top-8 right-8 w-48 h-72 bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-10 cursor-move"
            >
              {currentCall.localStream &&
              !currentCall.isVideoOff &&
              currentCall.type === "video" ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/50 text-white/50">
                  <VideoOff size={24} />
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-fuchsia-900/20 animate-pulse pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center max-w-sm w-full p-8 glass rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.2)]">
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <Minimize2 size={18} />
          </button>

          <div className="relative mb-6">
            <img
              src={
                partner?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCall.partnerId}`
              }
              alt={partner?.name}
              className={`w-32 h-32 rounded-full object-cover border-4 border-indigo-500/30 ${currentCall.status === "ringing" ? "animate-bounce" : ""}`}
            />
            <div className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-20"></div>
            <div
              className="absolute inset-0 rounded-full border border-fuchsia-400 animate-ping opacity-10"
              style={{ animationDelay: "500ms" }}
            ></div>
          </div>

          <h2 className="text-2xl font-display font-bold text-white mb-1">
            {partner?.name || "Unknown Entity"}
          </h2>
          <p className="text-sm font-mono text-[var(--color-nexa-accent-light)] uppercase tracking-widest mb-10 text-center">
            {currentCall.status === "ringing"
              ? currentCall.isCaller
                ? `Initiating ${currentCall.type} sync...`
                : `Incoming ${currentCall.type} stream...`
              : currentCall.status === "connected"
                ? formatDuration(duration)
                : `Quantum ${currentCall.type} Link Established`}
          </p>

          <div className="flex items-center gap-6">
            {currentCall.status === "ringing" && !currentCall.isCaller && (
              <button
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-110"
              >
                {currentCall.type === "video" ? (
                  <Video size={24} />
                ) : (
                  <Phone size={24} />
                )}
              </button>
            )}

            {currentCall.status === "connected" && (
              <>
                <button
                  onClick={toggleMute}
                  className={`w-14 h-14 rounded-full glass border border-white/10 hover:bg-white/10 flex items-center justify-center text-white transition-all ${currentCall.isMuted ? "bg-rose-500/20 text-rose-400" : ""}`}
                >
                  {currentCall.isMuted ? (
                    <MicOff size={20} />
                  ) : (
                    <Mic size={20} />
                  )}
                </button>
                {currentCall.type === "video" && (
                  <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full glass border border-white/10 hover:bg-white/10 flex items-center justify-center text-white transition-all ${currentCall.isVideoOff ? "bg-rose-500/20 text-rose-400" : ""}`}
                  >
                    {currentCall.isVideoOff ? (
                      <VideoOff size={20} />
                    ) : (
                      <Video size={20} />
                    )}
                  </button>
                )}
              </>
            )}

            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center text-white shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all hover:scale-110"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
