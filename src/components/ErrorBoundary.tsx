import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BVB 09 Client Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = window.location.origin + window.location.pathname + '?installed=true';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="w-full max-w-lg bg-[#0e1117] border border-[#FDE100]/40 rounded-2xl p-8 shadow-2xl shadow-black/80 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FDE100] text-black font-black flex items-center justify-center text-2xl mb-4 shadow-lg shadow-[#FDE100]/30 font-bvb">
              09
            </div>
            
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Wiederherstellungs-Modus</span>
            </div>

            <h1 className="text-2xl font-black text-white font-bvb uppercase tracking-wide mb-2">
              BVB 09 Client Rettungs-Schirm
            </h1>

            <p className="text-sm text-slate-400 mb-6">
              Ein Modul hat einen unerwarteten Fehler ausgelöst. Dein BVB-Client wurde sicher abgefangen, damit keine Daten verloren gehen.
            </p>

            {this.state.error && (
              <div className="w-full bg-black/60 rounded-lg p-3 font-mono text-xs text-rose-300 text-left overflow-x-auto border border-rose-950 mb-6 max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FDE100] hover:bg-[#ffe633] text-black font-extrabold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all shadow-md font-bvb cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Client neu laden</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 font-bvb cursor-pointer"
              >
                <span>Direkt in Transfermarkt</span>
                <ArrowRight className="w-4 h-4 text-[#FDE100]" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
