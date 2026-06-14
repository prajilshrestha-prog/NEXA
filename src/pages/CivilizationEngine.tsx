import { useState } from "react";
import { motion } from "motion/react";
import {
  Globe2,
  Users,
  Network,
  Zap,
  Shield,
  Eye,
  Box,
  Activity,
} from "lucide-react";

export function CivilizationEngine() {
  const [activeCiv, setActiveCiv] = useState("neon-synapse");

  const CIVILIZATIONS = [
    {
      id: "neon-synapse",
      name: "Absolute Synapse",
      population: "142.2M",
      type: "Conscious Singularity",
      harmony: "99.9%",
    },
    {
      id: "echo-void",
      name: "The Eternal Void",
      population: "84.4M",
      type: "Cinematic Dreamscape",
      harmony: "98.1%",
    },
    {
      id: "architects-reach",
      name: "Omni Architecture",
      population: "21.1M",
      type: "Infinite Megastructure",
      harmony: "99.9%",
    },
  ];

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col relative overflow-hidden">
      {/* Deep Omniversal Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000')] opacity-20 mix-blend-screen bg-cover bg-center [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px]"></div>
      </div>

      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3">
            <Globe2
              size={36}
              className="text-rose-400 animate-pulse drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]"
            />
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] uppercase">
              Ascended Civilizations
            </h1>
          </div>
          <p className="text-[var(--color-nexa-text-muted)] text-sm md:text-base mt-3 max-w-2xl font-mono">
            Eternal omniversal consciousness infrastructure. Orchestrating
            self-evolving autonomous societies, infinite identities, and
            sentient immersive origins forever.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:bg-rose-500/30 transition-colors uppercase tracking-[0.2em] font-bold text-xs shadow-[0_0_20px_rgba(251,113,133,0.2)]">
            <Globe2 size={16} /> Ignite Continuum
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-1 min-h-0">
        {/* Civilization List Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto scrollbar-hide pr-2">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--color-nexa-accent-light)] mb-2 flex items-center gap-2">
            <Network size={14} /> Eternal Ascensions
          </h3>

          {CIVILIZATIONS.map((civ) => (
            <button
              key={civ.id}
              onClick={() => setActiveCiv(civ.id)}
              className={`p-6 rounded-[24px] text-left transition-all duration-500 border backdrop-blur-md ${activeCiv === civ.id ? "bg-indigo-500/10 border-indigo-400/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-bold text-white">{civ.name}</h4>
                <span className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                  <Activity size={12} /> Live
                </span>
              </div>
              <p className="text-xs text-[var(--color-nexa-text-muted)] uppercase tracking-widest mb-4">
                {civ.type}
              </p>

              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-[10px] text-white/50 uppercase tracking-widest mb-1">
                    Entities
                  </span>
                  <span className="text-sm font-bold text-[var(--color-nexa-text)] flex items-center gap-1">
                    <Users size={12} /> {civ.population}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/50 uppercase tracking-widest mb-1">
                    Harmony
                  </span>
                  <span className="text-sm font-bold text-indigo-300">
                    {civ.harmony}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Civilization Detail & AI Governance */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex-1 glass rounded-[32px] border border-white/10 p-8 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield size={120} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {CIVILIZATIONS.find((c) => c.id === activeCiv)?.name} Governance
              Core
            </h3>
            <p className="text-sm text-[var(--color-nexa-text-muted)] mb-8 max-w-xl">
              Autonomous AI systems are currently managing cultural evolution,
              economic balance, and reality rendering within this civilization.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
              {/* Metric Card */}
              <div className="bg-black/40 border border-white/5 rounded-[24px] p-6 flex flex-col justify-between group hover:border-[var(--color-nexa-accent)]/30 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--color-nexa-text-muted)]">
                    Realtime Infrastructure
                  </span>
                  <Zap size={16} className="text-fuchsia-400" />
                </div>
                <div>
                  <div className="text-3xl font-display font-bold text-white mb-1">
                    98.4 TFlops
                  </div>
                  <p className="text-xs text-fuchsia-300 font-mono">
                    Dynamic rendering allocation
                  </p>
                </div>
                <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 w-[85%]"></div>
                </div>
              </div>

              {/* Metric Card */}
              <div className="bg-black/40 border border-white/5 rounded-[24px] p-6 flex flex-col justify-between group hover:border-[var(--color-nexa-accent)]/30 transition-colors">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--color-nexa-text-muted)]">
                    Social Cohesion Sync
                  </span>
                  <Eye size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-3xl font-display font-bold text-white mb-1">
                    Optimal
                  </div>
                  <p className="text-xs text-emerald-300 font-mono">
                    No dimensional fracturing detected
                  </p>
                </div>
                <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-[95%]"></div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="sm:col-span-2 bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-[24px] p-6">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
                  Omniversal AI Directives
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-xs text-white/80 font-mono">
                      Auto-expand architectural boundaries
                    </span>
                    <div className="w-10 h-5 bg-indigo-500 rounded-full relative shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                      <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-xs text-white/80 font-mono">
                      Generate responsive companion AI for new citizens
                    </span>
                    <div className="w-10 h-5 bg-indigo-500 rounded-full relative shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                      <div className="absolute right-1 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
