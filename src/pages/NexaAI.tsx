import { Brain } from "lucide-react";

export function NexaAI() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--color-nexa-dark)]">
      <div className="glass p-12 rounded-[32px] border border-[var(--color-nexa-accent)]/20 shadow-[0_0_40px_rgba(99,102,241,0.1)] flex flex-col items-center max-w-md text-center">
        <div className="w-20 h-20 bg-[var(--color-nexa-accent)]/10 rounded-full flex items-center justify-center mb-6">
          <Brain size={32} className="text-[var(--color-nexa-accent)]" />
        </div>
        <h2 className="text-2xl font-display font-bold tracking-tight mb-4 text-white">
          NEXA AI
        </h2>
        <p className="text-[var(--color-nexa-text-muted)] text-sm mb-6">
          AI assistant, caption generator, content ideas, portfolio feedback, creator insights, and productivity tools.
        </p>
      </div>
    </div>
  );
}
