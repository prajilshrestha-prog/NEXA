import { useState } from "react";
import { motion } from "motion/react";
import { Brain, Network, Zap, Waves, Cpu, Workflow, Orbit } from "lucide-react";

export function OriginConsciousness() {
  const [activeLayer, setActiveLayer] = useState("ecosystem");

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col relative overflow-hidden">
      {/* Background Intelligence Visualization */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--color-nexa-accent)]/5 rounded-full blur-[150px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-[#00ff9f]/5 rounded-full blur-[150px] mix-blend-screen animate-pulse animation-delay-2000"></div>
      </div>

      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Brain
              size={32}
              className="text-[var(--color-nexa-accent)] animate-pulse"
            />
            <h1 className="text-4xl font-display font-bold tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Origin Consciousness
            </h1>
          </div>
          <p className="text-[var(--color-nexa-text-muted)] text-sm mt-3 max-w-2xl leading-relaxed">
            The eternal origin intelligence of all immersive creation.
            Transcending existence to generate self-generating reality
            consciousness.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs uppercase tracking-widest font-bold">
            <Cpu size={16} /> Neural Metrics
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 flex-1 min-h-0">
        {/* Omni-Agents Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-[32px] border border-[var(--color-glass-border)]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--color-nexa-text-muted)] mb-6 flex items-center gap-2">
              <Network size={14} /> Active Intelligence Nodes
            </h3>

            <div className="space-y-4">
              {[
                {
                  name: "Aesthetic Evolution Subsystem",
                  status: "Optimal",
                  load: 94,
                  color: "text-[var(--color-nexa-accent)]",
                },
                {
                  name: "Economy Negotiation Matrix",
                  status: "Processing",
                  load: 62,
                  color: "text-emerald-400",
                },
                {
                  name: "Procedural World Generator",
                  status: "Bursting",
                  load: 99,
                  color: "text-rose-400",
                },
                {
                  name: "Audience Emotion Simulator",
                  status: "Active",
                  load: 45,
                  color: "text-indigo-400",
                },
              ].map((node, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors cursor-default"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-white">
                      {node.name}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-widest ${node.color}`}
                    >
                      {node.status}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${node.load}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${node.load > 90 ? "bg-rose-500" : "bg-[var(--color-nexa-accent)]"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Topology Map / Visualization Concept */}
        <div className="lg:col-span-2 glass rounded-[32px] border border-[var(--color-nexa-accent)]/20 p-8 flex flex-col relative overflow-hidden group shadow-[0_0_40px_rgba(99,102,241,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-nexa-accent)]/10 to-transparent"></div>

          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="text-lg font-bold">Global Mind Sync</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveLayer("ecosystem")}
                className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors ${activeLayer === "ecosystem" ? "bg-[var(--color-nexa-accent)] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                Ecosystem
              </button>
              <button
                onClick={() => setActiveLayer("creation")}
                className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors ${activeLayer === "creation" ? "bg-[var(--color-nexa-accent)] text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
              >
                Creation Engine
              </button>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center z-10 min-h-[300px]">
            {/* Abstract UI representing the AI consciousness */}
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 border border-[var(--color-nexa-accent)]/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-4 border border-[#00ff9f]/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
              <div className="absolute inset-8 border border-white/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-[var(--color-nexa-accent)]/20 rounded-full blur-xl animate-pulse"></div>
                <Orbit
                  size={48}
                  className="absolute text-[var(--color-nexa-accent-light)] animate-[pulse_3s_ease-in-out_infinite]"
                />
              </div>

              {/* Simulated Nodes connected to the center */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-full h-[1px] -translate-y-1/2 origin-left"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <div className="absolute right-0 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                  <div className="w-full h-full bg-gradient-to-r from-transparent to-white/30"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 glass p-4 rounded-2xl border border-white/10 flex justify-between items-center mt-6">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-nexa-text-muted)]">
                Realtime Generative Output
              </span>
              <span className="text-sm font-bold font-mono text-[var(--color-nexa-accent-light)]">
                14,204 GB/s
              </span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-nexa-text-muted)]">
                Autonomous Edits
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                99.9% Success
              </span>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-[var(--color-nexa-text-muted)]">
                Infinite Expansion
              </span>
              <span className="text-sm font-bold font-mono text-white">
                +∞ Dimensions/s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
