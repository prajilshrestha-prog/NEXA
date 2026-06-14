import {
  Users,
  Plus,
  Mic,
  Video,
  Monitor,
  LayoutDashboard,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";

const SESSIONS = [
  {
    id: 1,
    name: "Genesis Project Review",
    status: "Live",
    members: 4,
    type: "Design Review",
  },
  {
    id: 2,
    name: "Brand Identity Async",
    status: "Idle",
    members: 2,
    type: "Workspace",
  },
];

export function Collaborations() {
  return (
    <div className="w-full h-full p-4 md:p-8 space-y-8 flex flex-col">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Shadow Sessions
          </h1>
          <p className="text-[var(--color-nexa-text-muted)] text-sm mt-1">
            Real-time encrypted collaboration rooms
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-nexa-text)] text-[var(--color-nexa-dark)] font-bold text-sm tracking-tight hover:opacity-90 transition-opacity">
          <Plus size={16} />
          New Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SESSIONS.map((session) => (
          <div
            key={session.id}
            className="glass rounded-3xl p-6 relative group overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-nexa-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {session.status === "Live" ? (
                  <>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-widest">
                      Live
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white/20"></span>
                    <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">
                      Idle
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-nexa-text-muted)] border border-[var(--color-glass-border)] px-2 py-0.5 rounded bg-[var(--color-glass-surface)]">
                {session.type}
              </span>
            </div>

            <h3 className="relative z-10 font-bold text-lg mb-2">
              {session.name}
            </h3>

            <div className="relative z-10 flex items-center gap-2 mb-6">
              <div className="flex -space-x-2">
                {[...Array(session.members)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[var(--color-nexa-dark)] bg-[var(--color-glass-surface)] overflow-hidden"
                  >
                    <img
                      src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000}?q=80&w=150&auto=format&fit=crop`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-[var(--color-nexa-text-muted)] ml-2">
                {session.members} Collaborators
              </span>
            </div>

            <div className="relative z-10 grid grid-cols-4 gap-2">
              <button className="col-span-1 p-2 rounded-xl bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] border border-[var(--color-glass-border)] flex items-center justify-center transition-colors text-[var(--color-nexa-text-muted)] hover:text-white">
                <Mic size={18} />
              </button>
              <button className="col-span-1 p-2 rounded-xl bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] border border-[var(--color-glass-border)] flex items-center justify-center transition-colors text-[var(--color-nexa-text-muted)] hover:text-white">
                <Video size={18} />
              </button>
              <button className="col-span-2 p-2 px-4 rounded-xl bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] border border-[var(--color-glass-border)] flex items-center justify-center gap-2 transition-colors text-[var(--color-nexa-text-muted)] hover:text-white font-semibold text-sm">
                Enter
              </button>
            </div>
          </div>
        ))}

        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[var(--color-nexa-accent)]/50 transition-colors border-dashed shadow-sm group">
          <div className="w-14 h-14 rounded-full bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-[var(--color-nexa-text-muted)] group-hover:text-[var(--color-nexa-accent-light)]">
            <Plus size={24} />
          </div>
          <h3 className="font-bold text-sm">Create New Workspace</h3>
          <p className="text-xs text-[var(--color-nexa-text-muted)] mt-1 max-w-[200px]">
            Start a real-time highly secure collaboration room.
          </p>
        </div>
      </div>
    </div>
  );
}
