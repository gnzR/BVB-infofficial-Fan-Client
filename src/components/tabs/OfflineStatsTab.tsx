import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  WifiOff,
  Trophy,
  Zap,
  Target,
  Shield,
  Flame,
  Activity,
  Search,
  User,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  getOfflineStats,
  getPlayer30DayStats,
  getAllBvbPlayerNames,
  syncLivePastMatches,
  BVBMonthlyStat,
  Player30DayStats,
  BVBRecentMatchDetail,
} from '../../utils/offlineStore';
import { Player30DayStatsModal } from './Player30DayStatsModal';
import { MatchDetailModal } from './MatchDetailModal';

export const OfflineStatsTab: React.FC = () => {
  const [stats, setStats] = useState<BVBMonthlyStat | null>(() => getOfflineStats());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlayerStats, setSelectedPlayerStats] = useState<Player30DayStats | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<BVBRecentMatchDetail | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDailySyncing, setIsDailySyncing] = useState<boolean>(false);
  const [dailySyncTimestamp, setDailySyncTimestamp] = useState<string>('Heute, 04:00 Uhr');

  const allPlayers = getAllBvbPlayerNames();

  useEffect(() => {
    // 1. Initial load
    setStats(getOfflineStats());
    const today = new Date();
    setDailySyncTimestamp(
      `Heute, ${today.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} um 04:00 Uhr`
    );

    // 2. Fetch live updated matches on program start
    syncLivePastMatches(false).then((fresh) => {
      if (fresh) setStats(fresh);
    });
  }, []);

  const handleSearch = (nameToSearch?: string) => {
    const query = nameToSearch || searchQuery;
    if (!query.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      const result = getPlayer30DayStats(query, stats?.recentMatches);
      if (result) {
        setSelectedPlayerStats(result);
        setSearchQuery(result.name);
      }
      setIsSearching(false);
    }, 120);
  };

  const handleQuickSelect = (playerName: string) => {
    setSearchQuery(playerName);
    handleSearch(playerName);
  };

  const handleManualDailySync = async () => {
    setIsDailySyncing(true);
    try {
      const updated = await syncLivePastMatches(true);
      if (updated) setStats(updated);
      const now = new Date();
      setDailySyncTimestamp(
        `Heute, ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
      );
      if (selectedPlayerStats) {
        const refreshed = getPlayer30DayStats(selectedPlayerStats.name, updated?.recentMatches);
        if (refreshed) setSelectedPlayerStats(refreshed);
      }
    } catch (e) {
      console.warn('Manual match sync error:', e);
    } finally {
      setIsDailySyncing(false);
    }
  };

  if (!stats) return null;

  const filteredSuggestions = searchQuery.trim()
    ? allPlayers.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  const quickStarPlayers = [
    'Serhou Guirassy',
    'Felix Nmecha',
    'Fábio Silva',
    'Konstantinos Karetsas',
    'Nico Schlotterbeck',
    'Jobe Bellingham',
    'Joey Veerman',
    'Maximilian Beier',
    'Carney Chukwuemeka',
    'Daniel Svensson',
    'Gregor Kobel',
    'Waldemar Anton',
    'Julian Ryerson',
    'Marcel Sabitzer',
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold text-xs border border-emerald-500/40 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              TÄGLICHE LIVE-AKTUALISIERUNG AKTIV
            </span>

            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-xs border border-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FDE100]" />
              Letzter Abgleich: {dailySyncTimestamp}
            </span>

            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono text-xs border border-slate-700 flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" />
              100% Offline-Verfügbar
            </span>
          </div>

          <h2 className="text-2xl font-black text-white uppercase font-bvb tracking-wide mt-1">
            BVB 30-Tage Statistiken & Spieler-Radar
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Vollständige Live-Leistungsdaten der letzten 30 Tage. Gib einen BVB-Spielernamen ein, um seine detaillierten 30-Tage-Stats (Tore, Assists, Minuten, Passquote, Zweikämpfe, Top-Speed und Spielernoten) in einem eigenen Fenster anzuzeigen.
          </p>
        </div>

        {/* Action Button: Manual Refresh */}
        <button
          onClick={handleManualDailySync}
          disabled={isDailySyncing}
          className="px-3.5 py-2.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 font-bvb uppercase tracking-wider shadow-md shadow-[#FDE100]/20 disabled:opacity-50 cursor-pointer shrink-0"
          title="Tagesaktuelle 30-Tage-Statistiken neu abgleichen"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isDailySyncing ? 'animate-spin' : ''}`} />
          <span>{isDailySyncing ? 'Aktualisiere...' : 'Tägliche Aktualisierung'}</span>
        </button>
      </div>

      {/* NEW: 30-Day Player Search Bar & Autocomplete */}
      <div className="p-6 rounded-2xl bg-[#141720] border-2 border-[#FDE100]/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white uppercase font-bvb tracking-wide flex items-center gap-2">
            <Search className="w-4 h-4 text-[#FDE100]" />
            BVB-Spieler 30-Tage-Einzelstatistik suchen
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Klicke auf einen Spieler oder tippe den Namen ein
          </span>
        </div>

        {/* Input & Search Trigger */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                placeholder="z.B. Serhou Guirassy, Fábio Silva, Konstantinos Karetsas, Jobe Bellingham..."
                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FDE100] text-white placeholder-slate-500 text-sm font-sans focus:outline-none transition-colors shadow-inner"
              />
              <Search className="w-4 h-4 text-[#FDE100] absolute left-3.5 top-3.5" />
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={isSearching || !searchQuery.trim()}
              className="px-5 py-3 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 font-bvb uppercase tracking-wider shadow-md shadow-[#FDE100]/20 disabled:opacity-40 cursor-pointer shrink-0"
            >
              <span>{isSearching ? 'Lade Stats...' : 'Stats Anzeigen'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-slate-800">
              {filteredSuggestions.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleQuickSelect(p.name)}
                  className="px-4 py-2.5 hover:bg-[#FDE100] hover:text-black cursor-pointer flex items-center justify-between text-xs transition-colors group"
                >
                  <span className="font-bold font-bvb text-sm text-white group-hover:text-black">
                    #{p.number} {p.name}
                  </span>
                  <span className="text-slate-400 group-hover:text-black font-mono">
                    {p.position}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access Player Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-mono block">Schnellauswahl BVB-Stars:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickStarPlayers.map((player) => (
              <button
                key={player}
                onClick={() => handleQuickSelect(player)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-[#FDE100] hover:text-black text-slate-300 border border-slate-800 hover:border-[#FDE100] transition-all font-bvb tracking-wide cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>{player}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Clickable to open player stats) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Record */}
        <div className="p-5 rounded-2xl bg-[#111318] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bilanz (30 Tage)</span>
            <Trophy className="w-4 h-4 text-[#FDE100]" />
          </div>
          <div className="text-3xl font-black text-[#FDE100] font-bvb">
            {stats.wins}S · {stats.draws}U · {stats.losses}N
          </div>
          <div className="text-xs text-slate-300 font-mono">
            Tordifferenz: {stats.goalsScored - stats.goalsConceded >= 0 ? `+${stats.goalsScored - stats.goalsConceded}` : stats.goalsScored - stats.goalsConceded} ({stats.goalsScored} : {stats.goalsConceded} in {stats.matchesPlayed} Sp.)
          </div>
        </div>

        {/* Card 2: Top Scorer (Clickable) */}
        <div
          onClick={() => handleQuickSelect(stats.topScorer.name)}
          className="p-5 rounded-2xl bg-[#111318] border border-slate-800 hover:border-[#FDE100]/60 transition-all space-y-2 cursor-pointer group shadow-lg"
          title="Klicke für 30-Tage Einzelstatistik"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Top-Torschütze (30 Tage)</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-bvb truncate group-hover:text-[#FDE100] transition-colors flex items-center justify-between">
            <span>{stats.topScorer.name}</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#FDE100]" />
          </div>
          <div className="text-xs text-[#FDE100] font-bold font-mono">
            {stats.topScorer.goals} Tore in {stats.matchesPlayed} Spielen (Details ➔)
          </div>
        </div>

        {/* Card 3: Top Assist (Clickable) */}
        <div
          onClick={() => handleQuickSelect(stats.topAssister.name)}
          className="p-5 rounded-2xl bg-[#111318] border border-slate-800 hover:border-[#FDE100]/60 transition-all space-y-2 cursor-pointer group shadow-lg"
          title="Klicke für 30-Tage Einzelstatistik"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Top-Vorlagengeber</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-bvb truncate group-hover:text-[#FDE100] transition-colors flex items-center justify-between">
            <span>{stats.topAssister.name}</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#FDE100]" />
          </div>
          <div className="text-xs text-emerald-400 font-bold font-mono">
            {stats.topAssister.assists} Assists (86.2% Passquote) (Details ➔)
          </div>
        </div>

        {/* Card 4: Top Speed (Clickable) */}
        <div
          onClick={() => handleQuickSelect(stats.fastestPlayer.name)}
          className="p-5 rounded-2xl bg-[#111318] border border-slate-800 hover:border-[#FDE100]/60 transition-all space-y-2 cursor-pointer group shadow-lg"
          title="Klicke für 30-Tage Einzelstatistik"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Höchstgeschwindigkeit</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-bvb truncate group-hover:text-[#FDE100] transition-colors flex items-center justify-between">
            <span>{stats.fastestPlayer.name}</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-[#FDE100]" />
          </div>
          <div className="text-xs text-sky-400 font-bold font-mono">
            {stats.fastestPlayer.speedKmH} km/h Top-Sprint (Details ➔)
          </div>
        </div>
      </div>

      {/* Match Results Table */}
      <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FDE100]" />
              Ergebnisse der vergangenen Spiele (Letzte 30 Tage)
            </h3>
            <p className="text-xs text-slate-400">
              Klicke auf ein beliebiges Spiel, um die vollständigen Match-Statistiken (Ballbesitz, xG, Torschüsse, Aufstellung, Timeline) zu öffnen.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Täglicher Live-Abgleich aktiv
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bvb uppercase text-sm">
                <th className="py-2.5 px-3">Datum</th>
                <th className="py-2.5 px-3">Wettbewerb</th>
                <th className="py-2.5 px-3">Begegnung</th>
                <th className="py-2.5 px-3 text-center">Ergebnis</th>
                <th className="py-2.5 px-3">BVB Torschützen</th>
                <th className="py-2.5 px-3">Man of the Match</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {stats.recentMatches.map((m) => {
                const isWin = m.scoreBVB > m.scoreOpponent;
                const isDraw = m.scoreBVB === m.scoreOpponent;
                const homeTeam = m.home ? 'BVB Borussia Dortmund' : m.opponent;
                const awayTeam = m.home ? m.opponent : 'BVB Borussia Dortmund';
                const homeScore = m.home ? m.scoreBVB : m.scoreOpponent;
                const awayScore = m.home ? m.scoreOpponent : m.scoreBVB;

                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMatch(m)}
                    className="hover:bg-slate-900 hover:border-[#FDE100]/40 transition-all cursor-pointer group"
                    title="Klicke für alle Details & Statistiken dieses Spiels"
                  >
                    <td className="py-3.5 px-3 font-mono text-slate-400 group-hover:text-white transition-colors">
                      {m.date}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-semibold">{m.competition}</td>
                    <td className="py-3.5 px-3 font-bold transition-colors">
                      <span className={m.home ? 'text-[#FDE100]' : 'text-slate-200'}>{homeTeam}</span>
                      <span className="text-slate-500 mx-1.5 font-normal">vs</span>
                      <span className={!m.home ? 'text-[#FDE100]' : 'text-slate-200'}>{awayTeam}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono">
                      <span
                        className={`px-2.5 py-0.5 rounded font-extrabold text-xs inline-flex items-center gap-1 ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isDraw
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        <span>{homeScore} : {awayScore}</span>
                        <span className="text-[10px] font-bold opacity-80">
                          ({isWin ? 'S' : isDraw ? 'U' : 'N'})
                        </span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {m.scorers && m.scorers.length > 0 ? m.scorers.join(', ') : '—'}
                    </td>
                    <td
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickSelect(m.motm);
                      }}
                      className="py-3.5 px-3 font-bold text-[#FDE100] font-bvb hover:underline"
                      title="Klicke für 30-Tage Spielerprofil"
                    >
                      {m.motm} ➔
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-[#FDE100] group-hover:text-black text-slate-300 text-[11px] font-bold font-bvb uppercase tracking-wider transition-all inline-flex items-center gap-1 shadow-sm">
                        <span>Stats</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED 30-DAY STATS MODAL WINDOW */}
      <Player30DayStatsModal
        playerStats={selectedPlayerStats}
        isOpen={Boolean(selectedPlayerStats)}
        onClose={() => setSelectedPlayerStats(null)}
        onRefreshDaily={handleManualDailySync}
      />

      {/* DEDICATED MATCH DETAILS & STATS MODAL WINDOW */}
      <MatchDetailModal
        match={selectedMatch}
        isOpen={Boolean(selectedMatch)}
        onClose={() => setSelectedMatch(null)}
        onSelectPlayer={(playerName) => {
          setSelectedMatch(null);
          handleQuickSelect(playerName);
        }}
      />
    </div>
  );
};


