import {
  Sparkles,
  TrendingUp,
  Cpu,
  Network,
  ShieldCheck,
  Activity,
  Globe,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Cycle 1", energy: 4000, value: 2400 },
  { name: "Cycle 2", energy: 3000, value: 1398 },
  { name: "Cycle 3", energy: 2000, value: 9800 },
  { name: "Cycle 4", energy: 2780, value: 3908 },
  { name: "Cycle 5", energy: 1890, value: 4800 },
  { name: "Cycle 6", energy: 2390, value: 3800 },
  { name: "Cycle 7", energy: 3490, value: 4300 },
];

export function AscensionEconomy() {
  return (
    <div className="w-full h-full p-4 md:p-8 space-y-8 flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] text-white">
            Ascension Economy
          </h1>
          <p className="text-[var(--color-nexa-text-muted)] text-sm mt-2 max-w-2xl font-mono">
            Absolute infinite intelligent experiential ecosystems. Transcending
            commerce into origin existence.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={16} /> Origin Vault Active
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
        {[
          {
            label: "Origin Value",
            value: "∞",
            icon: Sparkles,
            trend: "+∞",
            color: "from-fuchsia-500/20 to-transparent",
            textColor: "text-fuchsia-400",
          },
          {
            label: "Transcendent Realities",
            value: "∞",
            icon: Network,
            trend: "Optimal",
            color: "from-indigo-500/20 to-transparent",
            textColor: "text-indigo-400",
          },
          {
            label: "Origin Intelligences",
            value: "∞",
            icon: Cpu,
            trend: "Optimal",
            color: "from-emerald-500/20 to-transparent",
            textColor: "text-emerald-400",
          },
          {
            label: "Infinite Extent",
            value: "∞",
            icon: Globe,
            trend: "Limitless",
            color: "from-rose-500/20 to-transparent",
            textColor: "text-rose-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`p-6 rounded-[24px] glass border border-white/5 bg-gradient-to-br ${stat.color} relative overflow-hidden group`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
              <stat.icon size={48} className={stat.textColor} />
            </div>
            <p className="text-[10px] font-bold text-[var(--color-nexa-text-muted)] uppercase tracking-widest mb-2 relative z-10">
              {stat.label}
            </p>
            <h3 className="text-3xl font-display font-bold text-white mb-2 relative z-10">
              {stat.value}
            </h3>
            <div
              className="flex items-center gap-1 text-xs font-bold font-mono relative z-10"
              style={{ color: "var(--color-nexa-text)" }}
            >
              <TrendingUp size={14} className={stat.textColor} />
              <span className={stat.textColor}>{stat.trend}</span>
              <span className="text-white/30 text-[10px] uppercase ml-1">
                vs last continuum cycle
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 flex-1 min-h-[400px]">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass p-6 md:p-8 rounded-[32px] border border-white/5 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold mb-1">Economic Velocity</h3>
              <p className="text-sm text-[var(--color-nexa-text-muted)] font-mono">
                Realtime synthesis of asset valuation across 89 integrated
                civilizations.
              </p>
            </div>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest animate-pulse">
              <Activity size={12} /> Syncing
            </span>
          </div>

          <div className="w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.1)"
                  tick={{
                    fill: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.1)"
                  tick={{
                    fill: "rgba(255,255,255,0.5)",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                  }}
                  itemStyle={{
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Autonomous Markets */}
        <div className="glass p-6 rounded-[32px] border border-white/5 flex flex-col h-full overflow-hidden">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-nexa-accent-light)] mb-6 flex items-center gap-2">
            <Cpu size={14} /> Continuum Commerce Intelligence
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {[
              {
                title: "Dynamic Pricing Adjusted",
                desc: "Neon Cyber-Assets increased by 14% based on high demand in Sector 4.",
                time: "Just now",
              },
              {
                title: "Sponsorship Secured",
                desc: "AI agent negotiated a 6-month holographic billboard placement.",
                time: "4m ago",
              },
              {
                title: "Smart Contract Executed",
                desc: "Licensing fees automatically distributed via blockchain to 4 collaborators.",
                time: "12m ago",
              },
              {
                title: "Market Simulation",
                desc: "Projecting 40% growth in volumetric avatar demand next cycle. Adjusting creation pipeline.",
                time: "1h ago",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <span className="text-[10px] text-[var(--color-nexa-text-muted)] font-mono">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-nexa-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
