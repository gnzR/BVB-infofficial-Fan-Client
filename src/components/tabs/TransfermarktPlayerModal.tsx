import React, { useEffect } from 'react';
import { TransferDeal } from '../../data/bvbTransferData';
import {
  X,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Calendar,
  Compass,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Award,
  Sparkles
} from 'lucide-react';

interface TransfermarktPlayerModalProps {
  player: TransferDeal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransfermarktPlayerModal: React.FC<TransfermarktPlayerModalProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !player) return null;

  const isBvbPlayer = player.currentClub.toLowerCase().includes('dortmund') || player.currentClub.toLowerCase().includes('bvb');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#111318] border-2 border-[#FDE100]/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar / Close Button */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100] text-black font-extrabold text-[11px] font-bvb uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                Transfermarkt.de Spielerprofil
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-bvb uppercase ${
                  player.rumorType.includes('Zugang')
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : player.rumorType.includes('Abgang')
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}
              >
                {player.rumorType}
              </span>
              {player.lastUpdated && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Stand: {player.lastUpdated}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-bvb tracking-wide">
                {player.playerName}
              </h2>
              {player.flag && <span className="text-xl" title={player.nationality}>{player.flag}</span>}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="text-[#FDE100] font-bold">{player.position}</span>
              <span>·</span>
              <span>{player.currentClub}</span>
              {player.age && (
                <>
                  <span>·</span>
                  <span className="font-mono text-slate-400">{player.age} Jahre</span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer shrink-0"
            title="Schließen (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Market Value Hero Card & Trend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#161922] to-[#0d0f14] border border-[#FDE100]/25 shadow-lg">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-sans block">Aktueller TM-Marktwert</span>
            <div className="text-3xl font-black text-[#FDE100] font-bvb tracking-tight">
              {player.marketValue}
            </div>
            {player.marketValueTrendText && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                {player.marketValueTrend === 'up' && (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {player.marketValueTrend === 'down' && (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                )}
                {player.marketValueTrend === 'stable' && (
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span
                  className={
                    player.marketValueTrend === 'up'
                      ? 'text-emerald-400 font-bold'
                      : player.marketValueTrend === 'down'
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {player.marketValueTrendText}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-sans block">Wechselwahrscheinlichkeit</span>
            <div className="text-2xl font-black text-white font-bvb flex items-center gap-2">
              <span>{player.probability}%</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({player.probability >= 80 ? 'Sehr hoch' : player.probability >= 50 ? 'Mittelhoch' : 'Spekulativ'})
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-[#FDE100] h-full transition-all duration-700"
                style={{ width: `${player.probability}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <span className="text-xs text-slate-400 font-sans block">Geschätzte Ablöse / Status</span>
            <div className="text-lg font-bold text-slate-100 font-bvb truncate">
              {player.estimatedFee || 'Freie Verhandlung'}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Vertrag bis: <strong className="text-white">{player.contractUntil || 'k. A.'}</strong>
            </span>
          </div>
        </div>

        {/* Detailed Player Bio & Transfer Specs Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Nationalität</span>
            <span className="text-white font-bold flex items-center gap-1.5 mt-0.5">
              <span>{player.flag}</span>
              <span className="truncate">{player.nationality || 'k. A.'}</span>
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Größe</span>
            <span className="text-white font-bold mt-0.5 block">{player.height || '1.85 m'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Starker Fuß</span>
            <span className="text-white font-bold mt-0.5 block capitalize">{player.foot || 'rechts'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-slate-400 block text-[10px] font-sans">Spielerberater</span>
            <span className="text-white font-bold mt-0.5 block truncate">{player.agent || 'Familienagentur'}</span>
          </div>
        </div>

        {/* Value History Chart (Transfermarkt Timeline) */}
        {player.valueHistory && player.valueHistory.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#FDE100] uppercase font-bvb flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#FDE100]" />
                Transfermarkt.de Marktwertverlauf (Historie in Mio. €)
              </span>
              <span className="text-slate-400 text-[11px] font-mono">Höchstwert: {player.marketValue}</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
              {player.valueHistory.map((h, idx) => {
                const maxVal = Math.max(...player.valueHistory!.map((v) => v.value), 40);
                const heightPct = Math.max(15, Math.round((h.value / maxVal) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white font-mono">€{h.value}M</span>
                    <div className="w-full bg-slate-800 h-16 rounded-lg relative flex items-end p-1">
                      <div
                        className="w-full bg-gradient-to-t from-amber-500 to-[#FDE100] rounded transition-all duration-500"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{h.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scouting & Tactical Fit */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#FDE100]" />
            Scout-Analyse & BVB-Einpassung
          </h4>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            <p className="mb-2">
              <strong className="text-white">Aktuelle Lage:</strong> {player.details}
            </p>
            {player.tacticalFit && (
              <p>
                <strong className="text-[#FDE100]">Taktische Rolle:</strong> {player.tacticalFit}
              </p>
            )}
          </div>

          {/* Strengths & Weaknesses Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {player.strengths && player.strengths.length > 0 && (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                <span className="font-bold text-emerald-400 font-bvb uppercase text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Stärken & Kernkompetenzen
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {player.strengths.map((str, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {player.weaknesses && player.weaknesses.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <span className="font-bold text-amber-400 font-bvb uppercase text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Potenzial / Herausforderung
                </span>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {player.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Community & TM Links Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            {player.userRating && (
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-[#FDE100]" />
                <span className="font-bold text-white font-mono">{player.userRating} / 10</span>
                <span>TM-Bewertung</span>
              </div>
            )}
            {player.discussionCount && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-slate-300">{player.discussionCount} Beiträge</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={
                player.url ||
                `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(
                  player.playerName
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-bvb uppercase tracking-wider shadow-md shadow-[#FDE100]/20"
            >
              <span>Auf Transfermarkt.de öffnen</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors font-bvb uppercase tracking-wider cursor-pointer"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
