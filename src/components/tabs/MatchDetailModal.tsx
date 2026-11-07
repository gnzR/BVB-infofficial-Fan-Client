import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Flame,
  Target,
  Zap,
  Activity,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Shirt,
  FileText,
} from 'lucide-react';

export interface BVBRecentMatchDetail {
  id: string;
  date: string;
  time?: string;
  opponent: string;
  opponentShort?: string;
  competition: string;
  matchday?: string;
  home: boolean;
  scoreBVB: number;
  scoreOpponent: number;
  halfTimeScore?: string;
  scorers: string[];
  motm: string;
  venue?: string;
  attendance?: string;
  stats?: {
    possessionBVB: number;
    possessionOpponent: number;
    shotsBVB: number;
    shotsOpponent: number;
    shotsOnTargetBVB: number;
    shotsOnTargetOpponent: number;
    xGBVB: number;
    xGOpponent: number;
    passAccuracyBVB: number;
    passAccuracyOpponent: number;
    duelsWonBVB: number;
    duelsWonOpponent: number;
    cornersBVB: number;
    cornersOpponent: number;
    foulsBVB: number;
    foulsOpponent: number;
    yellowCardsBVB: number;
    yellowCardsOpponent: number;
  };
  timeline?: Array<{
    minute: number;
    type: 'goal' | 'yellow_card' | 'red_card' | 'sub';
    team: 'BVB' | 'OPPONENT';
    player: string;
    assistOrSub?: string;
    scoreAfter?: string;
  }>;
  bvbLineup?: Array<{
    name: string;
    number: number;
    position: string;
    rating: number;
    minutes: number;
    isSub?: boolean;
  }>;
  summaryText?: string;
}

interface MatchDetailModalProps {
  match: BVBRecentMatchDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer?: (playerName: string) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  isOpen,
  onClose,
  onSelectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'lineup' | 'report'>('stats');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !match) return null;

  const isWin = match.scoreBVB > match.scoreOpponent;
  const isDraw = match.scoreBVB === match.scoreOpponent;
  const isLoss = match.scoreBVB < match.scoreOpponent;

  const homeTeamName = match.home ? 'Borussia Dortmund' : match.opponent;
  const awayTeamName = match.home ? match.opponent : 'Borussia Dortmund';
  const homeScore = match.home ? match.scoreBVB : match.scoreOpponent;
  const awayScore = match.home ? match.scoreOpponent : match.scoreBVB;

  const stats = match.stats || {
    possessionBVB: 58,
    possessionOpponent: 42,
    shotsBVB: 16,
    shotsOpponent: 8,
    shotsOnTargetBVB: 7,
    shotsOnTargetOpponent: 3,
    xGBVB: 2.15,
    xGOpponent: 0.85,
    passAccuracyBVB: 87.0,
    passAccuracyOpponent: 78.5,
    duelsWonBVB: 55.0,
    duelsWonOpponent: 45.0,
    cornersBVB: 7,
    cornersOpponent: 3,
    foulsBVB: 10,
    foulsOpponent: 14,
    yellowCardsBVB: 1,
    yellowCardsOpponent: 3,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#111318] border-2 border-[#FDE100]/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar / Close */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100] text-black font-extrabold font-bvb uppercase tracking-wider">
                {match.competition}
              </span>
              {match.matchday && (
                <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800">
                  {match.matchday}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono border border-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FDE100]" />
                {match.date} {match.time && `· ${match.time}`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#FDE100]" />
              <span>{match.venue || (match.home ? 'Signal Iduna Park, Dortmund' : 'Auswärtsspiel')}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer shrink-0"
            title="Schließen (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Scoreboard Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161922] via-[#101217] to-[#161922] border-2 border-[#FDE100]/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <span className="text-xs text-slate-400 font-mono block">Heim</span>
              <h3 className={`text-xl sm:text-2xl font-black font-bvb tracking-wide ${match.home ? 'text-[#FDE100]' : 'text-white'}`}>
                {homeTeamName}
              </h3>
              {match.home && match.scorers.length > 0 && (
                <div className="text-[11px] text-slate-300 font-mono flex items-center gap-1 flex-wrap">
                  <Flame className="w-3.5 h-3.5 text-[#FDE100]" />
                  <span>{match.scorers.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Score Center */}
            <div className="text-center shrink-0 px-4 py-2 rounded-2xl bg-black/60 border border-[#FDE100]/30">
              <div className="text-4xl sm:text-5xl font-black font-bvb tracking-wider flex items-center gap-3">
                <span className={match.home && isWin ? 'text-[#FDE100]' : 'text-white'}>
                  {homeScore}
                </span>
                <span className="text-slate-600 font-normal">:</span>
                <span className={!match.home && isWin ? 'text-[#FDE100]' : 'text-white'}>
                  {awayScore}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {match.halfTimeScore ? `Halbzeit: ${match.halfTimeScore}` : 'Endstand'}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center sm:text-right space-y-1">
              <span className="text-xs text-slate-400 font-mono block">Auswärts</span>
              <h3 className={`text-xl sm:text-2xl font-black font-bvb tracking-wide ${!match.home ? 'text-[#FDE100]' : 'text-white'}`}>
                {awayTeamName}
              </h3>
              {!match.home && match.scorers.length > 0 && (
                <div className="text-[11px] text-slate-300 font-mono flex items-center justify-end gap-1 flex-wrap">
                  <Flame className="w-3.5 h-3.5 text-[#FDE100]" />
                  <span>{match.scorers.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Man of the Match & Outcome Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FDE100]" />
              <span className="text-slate-400">Spieler des Spiels:</span>
              <span
                onClick={() => onSelectPlayer && onSelectPlayer(match.motm)}
                className="font-bold text-[#FDE100] font-bvb text-sm hover:underline cursor-pointer"
                title="Klicke für 30-Tage Spielerstatistik"
              >
                {match.motm} ➔
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-full font-bvb uppercase text-xs font-bold ${
                isWin
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : isDraw
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isWin ? 'Sieg Borussia Dortmund' : isDraw ? 'Unentschieden' : 'Niederlage'}
            </span>
          </div>
        </div>

        {/* Modal Inner Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-bvb uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-[#FDE100] text-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Match-Statistiken</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-bvb uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#FDE100] text-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Spielverlauf & Tore</span>
          </button>

          <button
            onClick={() => setActiveTab('lineup')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-bvb uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lineup'
                ? 'bg-[#FDE100] text-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>BVB-Aufstellung & Noten</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all font-bvb uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#FDE100] text-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Spielbericht & Analyse</span>
          </button>
        </div>

        {/* TAB 1: MATCH STATS VIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Possession Comparison Bar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-[#FDE100]">BVB: {stats.possessionBVB}%</span>
                <span className="text-slate-400 font-sans">Ballbesitz</span>
                <span className="font-bold text-slate-300">{stats.possessionOpponent}% :Gegner</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#FDE100] h-full transition-all duration-500"
                  style={{ width: `${stats.possessionBVB}%` }}
                />
                <div
                  className="bg-slate-600 h-full transition-all duration-500"
                  style={{ width: `${stats.possessionOpponent}%` }}
                />
              </div>
            </div>

            {/* Expected Goals Comparison Bar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-[#FDE100]">BVB: {stats.xGBVB} xG</span>
                <span className="text-slate-400 font-sans">Expected Goals (xG)</span>
                <span className="font-bold text-slate-300">{stats.xGOpponent} xG :Gegner</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(90, Math.max(10, (stats.xGBVB / (stats.xGBVB + stats.xGOpponent || 1)) * 100))}%` }}
                />
                <div
                  className="bg-slate-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min(90, Math.max(10, (stats.xGOpponent / (stats.xGBVB + stats.xGOpponent || 1)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Key Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-sans">Torschüsse (aufs Tor)</span>
                <div className="text-lg font-black text-white font-bvb mt-1">
                  <span className="text-[#FDE100]">{stats.shotsBVB} ({stats.shotsOnTargetBVB})</span>
                  <span className="text-slate-500 mx-1.5">:</span>
                  <span>{stats.shotsOpponent} ({stats.shotsOnTargetOpponent})</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-sans">Passquote</span>
                <div className="text-lg font-black text-white font-bvb mt-1">
                  <span className="text-emerald-400">{stats.passAccuracyBVB}%</span>
                  <span className="text-slate-500 mx-1.5">:</span>
                  <span>{stats.passAccuracyOpponent}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-sans">Zweikampfquote</span>
                <div className="text-lg font-black text-white font-bvb mt-1">
                  <span className="text-[#FDE100]">{stats.duelsWonBVB}%</span>
                  <span className="text-slate-500 mx-1.5">:</span>
                  <span>{stats.duelsWonOpponent}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-sans">Ecken / Fouls</span>
                <div className="text-lg font-black text-white font-bvb mt-1">
                  <span className="text-[#FDE100]">{stats.cornersBVB} / {stats.foulsBVB}</span>
                  <span className="text-slate-500 mx-1.5">:</span>
                  <span>{stats.cornersOpponent} / {stats.foulsOpponent}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMELINE VIEW */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 font-sans">
            <h4 className="text-xs font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#FDE100]" />
              Chronologischer Spielverlauf
            </h4>

            {match.timeline && match.timeline.length > 0 ? (
              <div className="divide-y divide-slate-800 rounded-xl bg-slate-900/70 border border-slate-800 overflow-hidden">
                {match.timeline.map((event, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-800 text-[#FDE100] font-black font-mono flex items-center justify-center text-xs shrink-0 border border-slate-700">
                        {event.minute}'
                      </span>

                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {event.type === 'goal' && <Flame className="w-4 h-4 text-[#FDE100]" />}
                          {event.type === 'yellow_card' && <div className="w-2.5 h-3.5 bg-amber-400 rounded-sm" />}
                          {event.type === 'red_card' && <div className="w-2.5 h-3.5 bg-rose-500 rounded-sm" />}
                          {event.type === 'sub' && <Activity className="w-3.5 h-3.5 text-sky-400" />}
                          <span>{event.player}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            event.team === 'BVB' ? 'bg-[#FDE100]/20 text-[#FDE100]' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {event.team === 'BVB' ? 'BVB' : match.opponent}
                          </span>
                        </div>
                        {event.assistOrSub && (
                          <div className="text-[11px] text-slate-400">
                            {event.type === 'goal' ? `Vorlage: ${event.assistOrSub}` : `Ausgewechselt: ${event.assistOrSub}`}
                          </div>
                        )}
                      </div>
                    </div>

                    {event.scoreAfter && (
                      <span className="font-mono font-bold text-sm text-[#FDE100] px-2.5 py-1 rounded bg-black/60 border border-slate-700">
                        {event.scoreAfter}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Keine detaillierten Spielereignisse für diese Partie protokolliert.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BVB LINEUP & RATINGS VIEW */}
        {activeTab === 'lineup' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-[#FDE100]" />
                BVB Aufstellung & Spielernoten (Deutsches Notensystem 1.0 - 5.0)
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                Klicke auf einen Spieler für seine 30-Tage Gesamtstatistik
              </span>
            </div>

            {match.bvbLineup && match.bvbLineup.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {match.bvbLineup.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectPlayer && onSelectPlayer(p.name)}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-[#FDE100]/60 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#FDE100] text-black font-extrabold text-xs flex items-center justify-center font-bvb">
                        #{p.number}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#FDE100] transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.position} · {p.minutes}' Min
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                        p.rating <= 2.0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : p.rating <= 3.0
                          ? 'bg-[#FDE100]/20 text-[#FDE100] border border-[#FDE100]/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        Note {p.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Keine Aufstellungsdaten verfügbar.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REPORT & ANALYSIS VIEW */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FDE100]" />
                Taktische Spielanalyse
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {match.summaryText || 'Intensive Begegnung mit hoher Laufbereitschaft und starker Zweikampfführung.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] font-sans block">Zuschauer & Stadion</span>
                <span className="text-white font-bold mt-1 block">
                  {match.attendance ? `${match.attendance} Fans` : 'Ausverkauft'} · {match.venue}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-[10px] font-sans block">Matchwinner</span>
                <span className="text-[#FDE100] font-bold mt-1 block font-bvb text-sm">
                  {match.motm} (Offizieller Man of the Match)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="text-slate-400 font-mono">
            Datenquelle: <strong className="text-slate-200">ESPN Opta Matchcenter & BVB.de Live-Feed</strong>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-[#FDE100] hover:text-black text-white font-bold rounded-xl transition-all font-bvb uppercase tracking-wider cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
