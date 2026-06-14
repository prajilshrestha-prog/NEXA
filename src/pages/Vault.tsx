import { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  Lock,
  File,
  Folder,
  HardDrive,
  UploadCloud,
  Search,
  MoreVertical,
  Key,
} from "lucide-react";

const VAULT_ITEMS = [
  {
    id: 1,
    name: "Neon_Dystopia_Final_Render_4K.mp4",
    type: "video",
    size: "1.2 GB",
    date: "Oct 24, 2026",
    secured: true,
  },
  {
    id: 2,
    name: "Cyber_City_Assets_Pack.zip",
    type: "archive",
    size: "4.5 GB",
    date: "Oct 20, 2026",
    secured: true,
  },
  {
    id: 3,
    name: "Project_Alpha_Source_C4D.c4d",
    type: "source",
    size: "840 MB",
    date: "Oct 15, 2026",
    secured: true,
  },
  {
    id: 4,
    name: "Client_Pitch_Deck_Q4.pdf",
    type: "document",
    size: "12 MB",
    date: "Oct 12, 2026",
    secured: false,
  },
  {
    id: 5,
    name: "Ambient_Soundscape_01.wav",
    type: "audio",
    size: "145 MB",
    date: "Oct 10, 2026",
    secured: true,
  },
];

export function Vault() {
  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold tracking-tight uppercase">
              Absolute Sovereignty
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Singularity Secured
              </span>
            </div>
          </div>
          <p className="text-[var(--color-nexa-text-muted)] text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">
            Encrypted ownership, immutable creator existence history, and
            autonomous rights intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-nexa-text-muted)]"
              size={16}
            />
            <input
              type="text"
              placeholder="Search vault..."
              className="bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--color-nexa-accent)] transition-all w-full md:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-nexa-text)] text-[var(--color-nexa-dark)] font-bold text-sm tracking-tight hover:opacity-90 transition-opacity">
            <UploadCloud size={16} />
            Upload
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-nexa-text-muted)] mb-4">
              Storage Limits
            </h4>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-display font-bold">14.2</span>
              <span className="text-sm font-medium text-[var(--color-nexa-text-muted)] pb-1">
                / 100 GB
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-glass-surface)] overflow-hidden">
              <div className="h-full w-[14.2%] bg-gradient-to-r from-[var(--color-nexa-accent)] to-[var(--color-nexa-accent-light)]"></div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-glass-surface-hover)] text-sm font-semibold transition-colors">
                <HardDrive
                  size={18}
                  className="text-[var(--color-nexa-accent-light)]"
                />
                All Files
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-glass-surface)] text-sm font-medium text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)] transition-colors">
                <Folder size={18} />
                Projects
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-glass-surface)] text-sm font-medium text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)] transition-colors">
                <Key size={18} />
                Signatures
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-glass-surface)] text-sm font-medium text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)] transition-colors">
                <Shield size={18} />
                Copyright Hub
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 glass rounded-2xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-glass-border)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-nexa-text-muted)]">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-3">Date Added</div>
            <div className="col-span-1 text-center">Status</div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {VAULT_ITEMS.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-4 p-3 rounded-xl hover:bg-[var(--color-glass-surface)] transition-colors items-center group cursor-pointer border border-transparent hover:border-[var(--color-glass-border)]"
              >
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-nexa-dark)] border border-[var(--color-glass-border)] flex items-center justify-center shrink-0 text-[var(--color-nexa-text-muted)]">
                    <File size={18} />
                  </div>
                  <span className="font-medium text-sm truncate">
                    {item.name}
                  </span>
                </div>
                <div className="col-span-2 text-xs text-[var(--color-nexa-text-muted)]">
                  {item.size}
                </div>
                <div className="col-span-3 text-xs text-[var(--color-nexa-text-muted)]">
                  {item.date}
                </div>
                <div className="col-span-1 flex items-center justify-center gap-2">
                  {item.secured ? (
                    <div title="Fingerprint Verified">
                      <Lock size={14} className="text-emerald-400" />
                    </div>
                  ) : (
                    <div title="Unsecured">
                      <Lock
                        size={14}
                        className="text-[var(--color-nexa-text-muted)]/50"
                      />
                    </div>
                  )}
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical
                      size={16}
                      className="text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)]"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
