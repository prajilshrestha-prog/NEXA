import { Radio, Users, Eye, Maximize, Mic, Video, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export function LiveExperience() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden flex flex-col font-sans">
      {/* Background Live Stream Visual Mockup */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-80 mix-blend-screen"
          src="https://cdn.pixabay.com/vimeo/328940142/concert-23424.mp4?width=1280&hash=8b87d8487968af559c55b1ea27c00e1cf6fcaea6"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
      </div>

      {/* Overlay UI */}
      <div className="relative z-10 p-6 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex gap-2 items-center px-4 py-2 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 backdrop-blur-md">
            <Radio size={16} className="animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Live Holographic Broadcast
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
          <div className="flex items-center gap-2 text-white">
            <Eye size={16} className="text-white/50" />
            <span className="text-sm font-bold font-mono">142,809</span>
          </div>
        </div>
      </div>

      {/* Center Cinematic Title */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          SYNTH.WAVE // 2026
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-[var(--color-nexa-accent-light)] mt-4 text-xl tracking-[0.4em] font-semibold uppercase"
        >
          Volumetric Live Experience
        </motion.p>
      </div>

      {/* Bottom Controls & Interaction */}
      <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-6 bg-gradient-to-t from-black to-transparent pt-32">
        {/* Creator Info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150"
              alt="Creator"
              className="w-14 h-14 rounded-full border-2 border-[var(--color-nexa-accent)] object-cover shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Lexi Nova</h3>
            <p className="text-xs text-[var(--color-nexa-text-muted)] font-mono">
              Spatial Audio • Stage 4
            </p>
          </div>
        </div>

        {/* Stream Controls */}
        <div className="flex items-center gap-3 w-full justify-center md:w-auto">
          <button
            className="w-12 h-12 rounded-full glass hover:bg-[var(--color-nexa-accent)]/20 hover:border-[var(--color-nexa-accent)] transition-colors flex items-center justify-center group"
            title="Toggle Immersive VR/AR Mode"
          >
            <Maximize
              size={20}
              className="text-white group-hover:text-[var(--color-nexa-accent-light)] transition-colors"
            />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors flex items-center justify-center p-0 overflow-hidden">
            {/* Soundwave animation */}
            <div className="flex items-center gap-0.5 h-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-1 bg-[var(--color-nexa-accent-light)] rounded-full animate-pulse`}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </button>
          <button className="px-6 py-3 rounded-full bg-[var(--color-nexa-text)] text-[var(--color-nexa-dark)] font-bold text-sm tracking-tight hover:bg-white/90 transition-colors">
            Enter Virtual Stage
          </button>
        </div>

        {/* Interactions */}
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button className="w-12 h-12 rounded-full glass hover:bg-white/10 transition-colors flex items-center justify-center">
            <Share2 size={20} className="text-white" />
          </button>
          <button className="px-5 py-3 rounded-full glass border border-[var(--color-nexa-accent)]/30 bg-[var(--color-nexa-accent)]/10 text-[var(--color-nexa-accent-light)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-nexa-accent)]/20 transition-colors">
            Donate Creds
          </button>
        </div>
      </div>
    </div>
  );
}
