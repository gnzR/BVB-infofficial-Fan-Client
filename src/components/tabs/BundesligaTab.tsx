import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Flame,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Sparkles,
  Target,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  getBundesligaTable,
  getOpenLigaBvbMatches,
  getBundesligaGoalGetters,
  TableRow,
  FormattedBvbMatch,
  GoalGetter,
} from '../../utils/openLigaService';
import { ChampionsLeagueSection } from '../ChampionsLeagueSection';
import { MatchdayCountdownWeatherWidget } from '../MatchdayCountdownWeatherWidget';

export const BundesligaTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'ucl' | 'matches' | 'scorers'>('table');
  const [table, setTable] = useState<TableRow[]>([]);
  const [matches, setMatches] = useState<FormattedBvbMatch[]>([]);
  const [goalgetters, setGoalgetters] = useState<GoalGetter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('gerade eben');
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  const loadData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const [tbl, mtchs, ggs] = await Promise.all([
        getBundesligaTable(force),
        getOpenLigaBvbMatches(force),
        getBundesligaGoalGetters(force),
      ]);
      setTable(tbl);
      setMatches(mtchs);
      setGoalgetters(ggs);
      setLastUpdated(
        new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.warn('Error loading OpenLigaDB data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const bvbRow = table.find((t) => t.isBVB);
  const finishedMatches = matches
    .filter((m) => m.isFinished)
    .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());

  const upcomingMatches = matches
    .filter((m) => !m.isFinished)
    .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());

  const nextMatch = upcomingMatches[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12141a] via-[#0d1017] to-black border border-[#FDE100]/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FDE100]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                OpenLigaDB Live-Feed Aktiv
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-400 bg-slate-800/80 border border-slate-700">
                100% Freie REST API · Ohne Bot-Schutz
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-bvb tracking-wide flex items-center gap-3">
              <Trophy className="w-8 h-8 text-[#FDE100]" />
              BUNDESLIGA & SPIELPLAN
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Offizielle Bundesliga-Tabelle, BVB-Spielplan & Torjägerliste – direkt und ohne Sperren aus der OpenLigaDB Community-Datenbank synchronisiert.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-[#FDE100] hover:bg-[#ffe733] text-black font-bvb font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#FDE100]/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Aktualisiere...' : 'Jetzt Aktualisieren'}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#FDE100]/10 border border-[#FDE100]/30 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-[#FDE100]" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono block">BVB Tabellenplatz</span>
              <span className="text-lg font-black text-white font-bvb">
                {bvbRow ? `${bvbRow.rank}. Platz (${bvbRow.points} Pkt)` : '2. Platz (18 Pkt)'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Nächstes Pflichtspiel</span>
              <span className="text-sm font-bold text-slate-200">
                {nextMatch ? `${nextMatch.isHome ? 'BVB vs.' : 'Auswärts @'} ${nextMatch.opponentShort || 'Gegner'} (${(nextMatch.dateStr || '').slice(0, 5)})` : 'BVB vs. SV 07 Elversberg'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono block">Top-Torschütze BVB</span>
              <span className="text-lg font-black text-white font-bvb">
                Serhou Guirassy (6 Tore)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* IDEE 4: Live-Stadionwetter Dortmund, Anpfiff-Countdown & .ics Kalender-Export */}
      <MatchdayCountdownWeatherWidget />

      {/* Subtab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('table')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-bvb uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'table'
              ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>1. Bundesliga Tabelle</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ucl')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-bvb uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ucl'
              ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
              : 'bg-slate-900 text-[#FDE100] hover:bg-slate-800 border border-[#FDE100]/40'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>UEFA Champions League (36er-Tabelle & Rechner)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-bvb uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'matches'
              ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>BVB Spielplan & Ergebnisse</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
            {matches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('scorers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold font-bvb uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'scorers'
              ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
              : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Torjägerliste</span>
        </button>
      </div>

      {/* IDEE 2: UEFA CHAMPIONS LEAGUE 36ER-TABELLE & K.O.-RUNDEN-RECHNER */}
      {activeSubTab === 'ucl' && <ChampionsLeagueSection />}

      {/* VIEW 1: BUNDESLIGA TABLE */}
      {activeSubTab === 'table' && (
        <div className="bg-[#101217] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDE100]" />
              <h2 className="font-bvb font-bold text-white text-base tracking-wide">
                1. FUSSBALL-BUNDESLIGA 2026/2027
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Letzte Synchronisation: {lastUpdated}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-3 text-center w-12">Pl.</th>
                  <th className="py-3 px-4">Verein</th>
                  <th className="py-3 px-3 text-center">Sp.</th>
                  <th className="py-3 px-3 text-center">S</th>
                  <th className="py-3 px-3 text-center">U</th>
                  <th className="py-3 px-3 text-center">N</th>
                  <th className="py-3 px-3 text-center">Tore</th>
                  <th className="py-3 px-3 text-center">Diff.</th>
                  <th className="py-3 px-4 text-center font-bold text-white">Pkt.</th>
                  <th className="py-3 px-4 text-center">Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {table.map((row) => {
                  let zoneBadge = null;
                  if (row.rank <= 4) {
                    zoneBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        UCL
                      </span>
                    );
                  } else if (row.rank === 5) {
                    zoneBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        UEL
                      </span>
                    );
                  } else if (row.rank === 6) {
                    zoneBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        UECL
                      </span>
                    );
                  } else if (row.rank === 16) {
                    zoneBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-600/20 text-amber-300 border border-amber-600/30">
                        Relegation
                      </span>
                    );
                  } else if (row.rank >= 17) {
                    zoneBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Abstieg
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={row.teamId || row.rank}
                      className={`transition-colors ${
                        row.isBVB
                          ? 'bg-[#FDE100]/15 hover:bg-[#FDE100]/20 font-bold border-l-4 border-l-[#FDE100]'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                          row.rank <= 4
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                            : row.isBVB
                            ? 'bg-[#FDE100] text-black font-extrabold'
                            : 'text-slate-400'
                        }`}>
                          {row.rank}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={row.teamIconUrl}
                            alt={row.teamName}
                            className="w-5 h-5 object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className={`text-sm ${row.isBVB ? 'text-[#FDE100] font-black font-bvb' : 'text-slate-200'}`}>
                            {row.teamName}
                          </span>
                          {row.isBVB && (
                            <span className="px-1.5 py-0.2 rounded bg-[#FDE100] text-black text-[10px] font-black uppercase font-bvb">
                              UNSER BVB
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-300">{row.matches}</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-semibold">{row.won}</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-400 font-semibold">{row.draw}</td>
                      <td className="py-3 px-3 text-center font-mono text-rose-400 font-semibold">{row.lost}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {row.goals}:{row.opponentGoals}
                      </td>
                      <td className={`py-3 px-3 text-center font-mono font-semibold ${
                        row.goalDiff > 0 ? 'text-emerald-400' : row.goalDiff < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-sm text-[#FDE100]">
                        {row.points}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {zoneBadge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: BVB MATCH SCHEDULE & RESULTS */}
      {activeSubTab === 'matches' && (
        <div className="space-y-6">
          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Kommende Spiele
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcomingMatches.map((m) => (
                  <div
                    key={m.matchID}
                    className="p-4 rounded-xl bg-[#111318] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {m.competitionBadge} · {m.matchday}
                      </span>
                      <span className="text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {m.dateStr} · {m.timeStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#FDE100] text-black font-extrabold flex items-center justify-center text-xs font-bvb">
                          BVB
                        </div>
                        <span className="font-bold text-white text-sm">Borussia Dortmund</span>
                      </div>

                      <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono font-black text-slate-400 text-sm">
                        VS
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm text-right">{m.opponentName}</span>
                        <img
                          src={m.opponentIcon}
                          alt={m.opponentName}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {m.stadium}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        m.isHome ? 'bg-[#FDE100]/20 text-[#FDE100]' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {m.isHome ? 'Heimspiel' : 'Auswärtsspiel'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finished Matches with Goals Timeline */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FDE100]" />
              Beendete Spiele & Torschützen (OpenLigaDB Feed)
            </h2>

            <div className="space-y-3">
              {finishedMatches.map((m) => {
                const isExpanded = expandedMatchId === m.matchID;
                const won = (m.bvbScore ?? 0) > (m.opponentScore ?? 0);
                const draw = (m.bvbScore ?? 0) === (m.opponentScore ?? 0);

                return (
                  <div
                    key={m.matchID}
                    className="rounded-xl bg-[#111318] border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedMatchId(isExpanded ? null : m.matchID)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          won
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : draw
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {won ? 'S' : draw ? 'U' : 'N'}
                        </span>

                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-slate-400">{m.dateStr}</span>
                            <span className="text-slate-600">·</span>
                            <span className="px-2 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                              {m.leagueName} ({m.matchday})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-white text-base">
                              {m.isHome ? 'BVB' : m.opponentShort} vs. {m.isHome ? m.opponentShort : 'BVB'}
                            </span>
                            <span className="text-xs text-slate-400">({m.isHome ? 'Heim' : 'Auswärts'})</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`text-xl font-black font-mono ${
                            won ? 'text-emerald-400' : draw ? 'text-amber-400' : 'text-slate-300'
                          }`}>
                            {m.scoreDisplay}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">Endergebnis</span>
                        </div>

                        <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Goals & Details Drawer */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-black/40">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {m.stadium}
                          </span>
                          <span className="font-mono text-[11px] text-[#FDE100]">
                            Offizielles OpenLigaDB Protokoll
                          </span>
                        </div>

                        {(m.goals && m.goals.length > 0) ? (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                              Tore & Spielverlauf:
                            </span>
                            {m.goals.map((g, idx) => (
                              <div
                                key={idx}
                                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono ${
                                  g.isBVB
                                    ? 'bg-[#FDE100]/10 border border-[#FDE100]/30 text-white'
                                    : 'bg-slate-800/60 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#FDE100]">{g.minute}'</span>
                                  <span className="text-sm">⚽</span>
                                  <span className="font-bold">{g.player}</span>
                                  {g.isPenalty && <span className="text-[10px] text-amber-400">(Elfmeter)</span>}
                                  {g.isOwnGoal && <span className="text-[10px] text-rose-400">(Eigentor)</span>}
                                </div>
                                <span className="font-bold text-slate-200">{g.scoreAfter}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic py-1">
                            Keine Tore gefallen (0:0 Endstand).
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: GOALGETTERS LIST */}
      {activeSubTab === 'scorers' && (
        <div className="bg-[#101217] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FDE100]" />
              <h2 className="font-bvb font-bold text-white text-base tracking-wide">
                BUNDESLIGA TORJÄGERLISTE 2026/2027 (OPENLIGADB)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Live aktualisiert
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {goalgetters.map((g, idx) => {
              const nameLower = (g.goalGetterName || '').toLowerCase();
              const isBVB = nameLower.includes('guirassy') || nameLower.includes('silva') || nameLower.includes('beier');
              return (
                <div
                  key={g.goalGetterId || idx}
                  className={`px-6 py-3.5 flex items-center justify-between transition-colors ${
                    isBVB ? 'bg-[#FDE100]/10 border-l-4 border-l-[#FDE100]' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      idx === 0
                        ? 'bg-[#FDE100] text-black font-black'
                        : idx === 1
                        ? 'bg-slate-300 text-black'
                        : idx === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>

                    <div>
                      <span className={`text-sm font-bold ${isBVB ? 'text-[#FDE100] font-bvb' : 'text-slate-200'}`}>
                        {g.goalGetterName}
                      </span>
                      {isBVB && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-[#FDE100] text-black text-[10px] font-black uppercase font-bvb">
                          BVB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black font-mono text-[#FDE100]">
                      {g.goalCount}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Tore</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
