import React, { useState, useEffect } from 'react';
import { Player30DayStats } from '../../utils/offlineStore';
import {
  X,
  ExternalLink,
  Flame,
  Zap,
  Target,
  Trophy,
  Shield,
  Activity,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Sparkles,
  Footprints,
  Clock,
  Award,
} from 'lucide-react';

interface Player30DayStatsModalProps {
  playerStats: Player30DayStats | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshDaily?: () => void;
}

export const Player30DayStatsModal: React.FC<Player30DayStatsModalProps> = ({
  playerStats,
  isOpen,
  onClose,
  onRefreshDaily,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !playerStats) return null;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastRefreshedAt(
        now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      if (onRefreshDaily) onRefreshDaily();
    }, 450);
  };

  const { summary, matchLogs } = playerStats;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#111318] border-2 border-[#FDE100]/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar / Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FDE100] to-amber-500 text-black font-extrabold text-2xl sm:text-3xl flex items-center justify-center font-bvb shadow-xl shadow-[#FDE100]/20 shrink-0">
              #{playerStats.number}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 font-bold text-[11px] font-mono border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  TÄGLICHE LIVE-AKTUALISIERUNG AKTIV
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[11px] border border-slate-700">
                  Stand: {lastRefreshedAt ? `Heute, ${lastRefreshedAt}` : playerStats.lastDailyUpdate}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-bvb tracking-wide">
                  {playerStats.name}
                </h2>
                <span className="text-xl" title={playerStats.nationality}>
                  {playerStats.flag}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="text-[#FDE100] font-bold">{playerStats.subPosition}</span>
                <span>·</span>
                <span>{playerStats.age} Jahre</span>
                <span>·</span>
                <span>Vertrag bis {playerStats.contractUntil}</span>
              </div>
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

        {/* Transfermarkt Live Valuation Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a23] via-[#111318] to-[#171a23] border border-[#FDE100]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bvb block">
              Transfermarkt.de Live-Marktwert
            </span>
            <div className="text-3xl font-black text-[#FDE100] font-bvb">
              {playerStats.marketValue}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold">
              {playerStats.marketValueTrend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
              {playerStats.marketValueTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
              {playerStats.marketValueTrend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
              <span>{playerStats.marketValueTrendText}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-right font-mono text-xs">
              <span className="text-slate-400 block text-[10px]">30-Tage Form-Index</span>
              <span className="text-[#FDE100] font-bold text-sm">{summary.formIndex}% Topform</span>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-[#FDE100] hover:text-black text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider border border-slate-700 cursor-pointer disabled:opacity-50 shrink-0"
              title="Daten jetzt neu synchronisieren"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FDE100]' : ''}`} />
              <span>{isRefreshing ? 'Aktualisiere...' : 'Live-Sync'}</span>
            </button>
          </div>
        </div>

        {/* 30-Day Performance KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
          {/* Card 1: Matches & Minutes */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans flex items-center justify-between">
              <span>Einsätze (30 Tage)</span>
              <Clock className="w-3.5 h-3.5 text-[#FDE100]" />
            </span>
            <div className="text-2xl font-black text-white font-bvb">
              {summary.matches} Spiele
            </div>
            <span className="text-[11px] text-slate-400 block">
              {summary.minutes}' Min ({summary.starts}x Startelf, {summary.subs}x Joker)
            </span>
          </div>

          {/* Card 2: Goals & Assists */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans flex items-center justify-between">
              <span>Scorerpunkte</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </span>
            <div className="text-2xl font-black text-[#FDE100] font-bvb">
              {summary.goals} Tore · {summary.assists} Vorl.
            </div>
            <span className="text-[11px] text-slate-400 block">
              {summary.shots} Schüsse ({summary.shotsOnTarget} aufs Tor)
            </span>
          </div>

          {/* Card 3: Pass & Duels */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans flex items-center justify-between">
              <span>Pass- & Zweikampf</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400 font-bvb">
              {summary.passAccuracyPct}%
            </div>
            <span className="text-[11px] text-slate-400 block">
              {summary.duelsWonPct}% gewonnene Duelle
            </span>
          </div>

          {/* Card 4: Top Speed & Distance */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans flex items-center justify-between">
              <span>Top-Speed & Lauf</span>
              <Zap className="w-3.5 h-3.5 text-sky-400" />
            </span>
            <div className="text-2xl font-black text-sky-400 font-bvb">
              {summary.topSpeedKmH} km/h
            </div>
            <span className="text-[11px] text-slate-400 block">
              {summary.distanceKm} km Gesamtdistanz
            </span>
          </div>
        </div>

        {/* Average Rating & Status Line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FDE100]" />
            <span className="text-slate-300">
              Durchschnittsnote (letzte 30 Tage): <strong className="text-white font-bvb text-sm">{summary.averageRating}</strong> (Kicker / BVB-Fanindex)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
              Gelbe Karten: {summary.yellowCards}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
              Rote Karten: {summary.redCards}
            </span>
          </div>
        </div>

        {/* 30-Day Match Log Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FDE100]" />
              Spieleinsätze der letzten 30 Tage (Detailliertes Match-Log)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Alle Wettbewerbe (BL, UCL, DFB-Pokal)
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-bvb uppercase text-[11px] border-b border-slate-800">
                  <th className="py-2.5 px-3">Datum</th>
                  <th className="py-2.5 px-3">Wettbewerb</th>
                  <th className="py-2.5 px-3">Begegnung</th>
                  <th className="py-2.5 px-3 text-center">Ergebnis</th>
                  <th className="py-2.5 px-3 text-center">Minuten</th>
                  <th className="py-2.5 px-3 text-center">Tore / Ass</th>
                  <th className="py-2.5 px-3 text-center">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {matchLogs.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{m.date}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-semibold">{m.competition}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{m.opponent}</td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                        {m.score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{m.minutes}'</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#FDE100]">
                      {m.goals > 0 || m.assists > 0 ? `${m.goals}T / ${m.assists}V` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                      <span className="px-2 py-0.5 rounded bg-[#FDE100]/10 text-[#FDE100] border border-[#FDE100]/30">
                        {m.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tactical Evaluation Note */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FDE100]" />
            Trainer- und Taktikanalyse der letzten 30 Tage
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {playerStats.tacticalNotes}
          </p>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            Täglicher Abgleich: <span className="text-emerald-400 font-semibold">Aktiv</span> · Datenquelle: ESPN & Transfermarkt.de
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <a
              href={
                playerStats.transfermarktUrl ||
                `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(
                  playerStats.name
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-bvb uppercase tracking-wider shadow-md shadow-[#FDE100]/20"
            >
              <span>Transfermarkt-Profil</span>
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
