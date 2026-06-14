import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen bg-[#050505] flex items-center justify-center p-8 text-white">
          <div className="glass p-8 rounded-3xl border border-red-500/30 max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full mx-auto flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight mb-2">
                System Anomaly Detected
              </h2>
              <p className="text-sm text-[var(--color-nexa-text-muted)] font-mono">
                The visual cortex encountered a render fault.
              </p>
            </div>

            <div className="bg-black/50 p-4 rounded-xl text-left border border-white/5 overflow-x-auto">
              <code className="text-xs text-red-400 font-mono">
                {this.state.error?.message || "Unknown rendering error"}
              </code>
            </div>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-bold text-sm tracking-widest text-white uppercase"
            >
              <RefreshCw size={16} /> Reinitialize Core
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
