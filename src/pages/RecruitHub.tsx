import {
  Briefcase,
  Building2,
  MapPin,
  Search,
  Star,
  Filter,
  ArrowRight,
} from "lucide-react";

const CREATORS = [
  {
    id: 1,
    name: "Sia Valerius",
    role: "Lead Motion Designer",
    location: "Berlin, DE",
    rating: "98%",
    match: "High Match",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Aris Thorne",
    role: "VFX Lead",
    location: "London, UK",
    rating: "95%",
    match: "Good Match",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
  },
];

export function RecruitHub() {
  return (
    <div className="w-full h-full p-4 md:p-8 space-y-8 flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Recruit Hub
          </h1>
          <p className="text-[var(--color-nexa-text-muted)] text-sm mt-1">
            Discover elite talent and AI-matched professionals
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-glass-border)] bg-[var(--color-glass-surface)] text-sm font-semibold hover:bg-[var(--color-glass-surface-hover)] transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-nexa-text)] text-[var(--color-nexa-dark)] font-bold text-sm tracking-tight hover:opacity-90 transition-opacity">
            Post Opportunity
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* Active Openings */}
        <div className="md:col-span-8 flex flex-col space-y-6">
          <div className="glass rounded-3xl p-6">
            <h3 className="font-bold mb-4">Your Active Placements</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">
                    Senior Unreal Engine Artist
                  </h4>
                  <div className="flex items-center gap-3 mt-1 opacity-60">
                    <span className="flex items-center gap-1 text-xs">
                      <Building2 size={12} /> Genesis Studios
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <MapPin size={12} /> Remote
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[var(--color-nexa-accent-light)]">
                    14 Applicants
                  </div>
                  <div className="text-xs text-[var(--color-nexa-text-muted)] mt-1">
                    4 AI High Matches
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-[0.2em] text-[var(--color-nexa-text-muted)]">
              AI Curated Talent Pool
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CREATORS.map((creator) => (
                <div
                  key={creator.id}
                  className="p-5 rounded-3xl glass hover:shadow-2xl transition-shadow cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-14 h-14 rounded-full border border-[var(--color-glass-border)] object-cover"
                    />
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold tracking-wider uppercase border border-emerald-500/20">
                      {creator.match}
                    </span>
                  </div>
                  <h4 className="font-bold">{creator.name}</h4>
                  <p className="text-xs text-[var(--color-nexa-text-muted)] mt-0.5">
                    {creator.role}
                  </p>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-glass-border)]">
                    <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500">
                      <Star size={12} fill="currentColor" /> {creator.rating}{" "}
                      Client Score
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-[var(--color-nexa-text-muted)] group-hover:text-white transition-colors group-hover:translate-x-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass rounded-3xl p-6 bg-gradient-to-br from-[var(--color-glass-surface)] to-[var(--color-nexa-accent)]/5">
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-nexa-accent-light)] font-bold mb-2">
              Talent Velocity
            </p>
            <div className="flex items-end gap-1.5 h-16 mb-4">
              {[40, 20, 60, 80, 50, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[var(--color-nexa-accent-light)]/20 rounded-sm hover:bg-[var(--color-nexa-accent)] transition-colors cursor-pointer"
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
            <p className="text-xs font-medium text-[var(--color-nexa-text-muted)]">
              Candidate response rate is up 24% this week.
            </p>
          </div>

          <div className="glass rounded-3xl p-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-nexa-text-muted)] mb-4">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-xl bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] border border-[var(--color-glass-border)] transition-colors text-sm font-semibold">
                Generate Job Description (AI)
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] border border-[var(--color-glass-border)] transition-colors text-sm font-semibold">
                Review Shortlist
              </button>
              <button className="w-full text-left p-3 rounded-xl bg-[var(--color-glass-surface)] hover:bg-[var(--color-glass-surface-hover)] border border-[var(--color-glass-border)] transition-colors text-sm font-semibold text-[var(--color-nexa-accent-light)]">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
