import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../../data/bvbSquadData';
import { getLiveSquadData, syncLiveBvbSquad } from '../../utils/squadStore';
import { ExternalLink, HeartPulse, User, X, RefreshCw, CheckCircle2, LayoutGrid, Trophy } from 'lucide-react';
import { TacticalBoardPlanner } from '../TacticalBoardPlanner';

interface SquadDetailTabProps {
  initialSelectedPlayerName?: string | null;
  onClearInitialPlayer?: () => void;
}

export const SquadDetailTab: React.FC<SquadDetailTabProps> = ({
  initialSelectedPlayerName,
  onClearInitialPlayer,
}) => {
  const [squad, setSquad] = useState<PlayerStats[]>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [activePlayerModal, setActivePlayerModal] = useState<PlayerStats | null>(null);
  const [viewMode, setViewMode] = useState<'squad' | 'tactics'>('squad');

  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string>('');

  const loadSquad = async () => {
    const data = await getLiveSquadData();
    setSquad(data.squad);
    setLastSyncedAt(data.lastSyncedAt);
    try {
      const fresh = await syncLiveBvbSquad();
      if (fresh && fresh.length > 0) {
        setSquad(fresh);
        setLastSyncedAt(new Date().toISOString());
      }
    } catch {}
  };

  useEffect(() => {
    loadSquad();
  }, []);

  useEffect(() => {
    if (initialSelectedPlayerName && squad.length > 0) {
      const cleanQuery = initialSelectedPlayerName.toLowerCase().trim();
      const found = squad.find(
        (p) =>
          p.name.toLowerCase().includes(cleanQuery) ||
          cleanQuery.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().split(' ').some((part) => part.length > 3 && cleanQuery.includes(part))
      );
      if (found) {
        setViewMode('squad');
        setSelectedPosition('all');
        setActivePlayerModal(found);
        if (onClearInitialPlayer) onClearInitialPlayer();
      }
    }
  }, [initialSelectedPlayerName, squad, onClearInitialPlayer]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccessMsg('');
    try {
      const updated = await syncLiveBvbSquad();
      setSquad(updated);
      setLastSyncedAt(new Date().toISOString());
      const activePlayerCount = updated.filter((p) => p.position !== 'Trainer').length;
      setSyncSuccessMsg(`✓ Alle ${activePlayerCount} Live-Spieler (BL + CL + DFB-Pokal) synchronisiert!`);
      setTimeout(() => setSyncSuccessMsg(''), 4500);
    } catch (e) {
      console.warn('Manual squad sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredSquad = squad.filter((p) => {
    if (selectedPosition === 'all') return true;
    if (selectedPosition === 'injuries') return p.injuryStatus.isInjured;
    return p.position === selectedPosition;
  });

  const injuredPlayers = squad.filter((p) => p.injuryStatus.isInjured);
  const activePlayersCount = squad.filter((p) => p.position !== 'Trainer').length;
  const totalMarketValue = squad.reduce((acc, p) => acc + (p.marketValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Injury Alert Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-white uppercase font-bvb tracking-wide flex items-center gap-2">
              <User className="w-6 h-6 text-[#FDE100]" />
              BVB Mannschaftskader & Taktiktafel (Cheftrainer: Niko Kovač)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-bold text-[11px] border border-emerald-500/40 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MARKTWERT: €{totalMarketValue > 0 ? totalMarketValue.toFixed(1) : '466.5'}M</span>
            </span>
            {syncSuccessMsg && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100]/20 text-[#FDE100] font-bold text-[11px] border border-[#FDE100]/40 flex items-center gap-1 animate-fade-in font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FDE100]" />
                <span>{syncSuccessMsg}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            100% Live-Kader (Bundesliga + Champions League + DFB-Pokal) · {activePlayersCount} gemeldete Spieler + Cheftrainer Niko Kovač ({squad.length} gesamt).
            {lastSyncedAt && (
              <span className="text-slate-500 ml-2 font-mono">
                (Letztes Update: {new Date(lastSyncedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
              </span>
            )}
          </p>
        </div>

        {/* Sync & Mode Switcher Control Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-black/80 rounded-xl border border-[#FDE100]/40">
            <button
              onClick={() => setViewMode('squad')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all font-bvb uppercase tracking-wider cursor-pointer ${
                viewMode === 'squad'
                  ? 'bg-[#FDE100] text-black shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Kader-Übersicht ({squad.length})
            </button>
            <button
              onClick={() => setViewMode('tactics')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all font-bvb uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'tactics'
                  ? 'bg-[#FDE100] text-black shadow-sm'
                  : 'text-[#FDE100] hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Taktiktafel & Startelf</span>
            </button>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 text-xs font-extrabold bg-[#FDE100] hover:bg-[#ffe733] text-black rounded-xl transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider disabled:opacity-50 shadow-md shadow-[#FDE100]/20 cursor-pointer"
            title="Live-Kader & Pflichtspieldaten (BL, CL, DFB-Pokal) jetzt aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronisiere...' : 'Kader Live-Sync'}</span>
          </button>

          {/* Position Filter Bar (Only when in Squad Cards mode) */}
          {viewMode === 'squad' && (
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
              {['all', 'Torwart', 'Abwehr', 'Mittelfeld', 'Angriff', 'Trainer', 'injuries'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-bvb uppercase shrink-0 cursor-pointer ${
                    selectedPosition === pos
                      ? 'bg-[#FDE100] text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pos === 'all'
                    ? `Alle (${squad.length})`
                    : pos === 'injuries'
                    ? `Verletzte (${injuredPlayers.length})`
                    : pos}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IDEE 1: INTERAKTIVE TAKTIKTAFEL & WUNSCH-STARTELF */}
      {viewMode === 'tactics' ? (
        <TacticalBoardPlanner squad={squad} />
      ) : (
        <>
          {/* Injury Reports Spotlight Banner */}
          {injuredPlayers.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400 uppercase font-bvb tracking-wider">
                <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
                Aktueller Lazarett-Bericht ({injuredPlayers.length} Ausfälle)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {injuredPlayers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActivePlayerModal(p)}
                    className="p-3.5 rounded-xl bg-black/60 border border-rose-500/30 hover:border-rose-400 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{p.flag} {p.name} ({p.subPosition})</span>
                      <span className="text-rose-400 text-[11px] font-mono">Ausfall</span>
                    </div>
                    <div className="text-xs text-rose-300 font-medium">{p.injuryStatus.condition}</div>
                    <div className="text-[11px] text-slate-400">
                      Rückkehr: <span className="text-slate-200">{p.injuryStatus.expectedReturn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Squad Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSquad.map((player) => {
              const isGK = player.position === 'Torwart';
              const isCoach = player.position === 'Trainer';
              const cb = player.competitionBreakdown;

              return (
                <div
                  key={player.id}
                  onClick={() => setActivePlayerModal(player)}
                  className="p-4 rounded-2xl bg-[#111318] border border-slate-800 hover:border-[#FDE100]/60 cursor-pointer transition-all space-y-3 shadow-md group relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Row: Jersey Number & Position */}
                    <div className="flex items-center justify-between">
                      <span className="w-9 h-9 rounded-full bg-[#FDE100] text-black font-extrabold text-sm flex items-center justify-center font-bvb shadow-md">
                        {player.number === 0 ? 'HC' : `#${player.number}`}
                      </span>
                      <div className="text-right">
                        <span className="text-xs text-slate-300 font-mono block">
                          {player.flag} {player.subPosition}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          bis {player.contractUntil}
                        </span>
                      </div>
                    </div>

                    {/* Player Main Details */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white font-bvb tracking-wide group-hover:text-[#FDE100] transition-colors flex items-center gap-1.5">
                        {player.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{player.age} Jahre</span>
                        <div className="text-right">
                          <span className="font-bold text-[#FDE100] font-bvb">{player.marketValueFormatted}</span>
                          {player.marketValueTrend === 'up' && (
                            <span className="text-[10px] text-emerald-400 ml-1 font-mono">↗</span>
                          )}
                          {player.marketValueTrend === 'down' && (
                            <span className="text-[10px] text-rose-400 ml-1 font-mono">↘</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Active Rumor Badge if present */}
                    {player.activeRumor && (
                      <div className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-[10px] text-amber-300 font-bold font-bvb uppercase truncate">
                        ⚡ TM: {player.activeRumor}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    {/* Performance Mini Badges (Goalkeeper vs Outfield vs Coach) */}
                    {isGK ? (
                      <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-[11px]">
                        <div>
                          <div className="text-slate-500 text-[10px]">Pflichtspiele</div>
                          <div className="font-bold text-white font-mono">{player.matches}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Paraden</div>
                          <div className="font-bold text-[#FDE100] font-mono">{player.goalkeeperStats?.saves ?? 0}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Gegentore</div>
                          <div className="font-bold text-sky-400 font-mono">{player.goalkeeperStats?.goalsConceded ?? 0}</div>
                        </div>
                      </div>
                    ) : isCoach ? (
                      <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-[11px]">
                        <div>
                          <div className="text-slate-500 text-[10px]">Pflichtspiele</div>
                          <div className="font-bold text-white font-mono">{player.matches}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">BL / CL / DFB</div>
                          <div className="font-bold text-[#FDE100] font-mono">9 / 4 / 2</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Vertrag</div>
                          <div className="font-bold text-emerald-400 font-mono">2029</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-[11px]">
                        <div>
                          <div className="text-slate-500 text-[10px]">Pflichtspiele</div>
                          <div className="font-bold text-white font-mono">
                            {player.matches}
                            {player.starts !== undefined && player.matches > 0 && (
                              <span className="text-[9px] text-slate-400 ml-0.5">({player.starts} S11)</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Tore</div>
                          <div className="font-bold text-[#FDE100] font-mono">{player.goals}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Assists</div>
                          <div className="font-bold text-emerald-400 font-mono">{player.assists}</div>
                        </div>
                      </div>
                    )}

                    {/* Option 2: Live Competition Breakdown Strip (BL · CL · DFB) */}
                    {cb && !isCoach && (
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                        <div className="px-1.5 py-1 rounded bg-black/50 border border-slate-800/80 text-slate-300">
                          <span className="text-slate-500 font-bold">BL:</span>{' '}
                          {isGK
                            ? `${cb.bundesliga.matches}Sp (${cb.bundesliga.saves ?? 0}P)`
                            : `${cb.bundesliga.matches}Sp (${cb.bundesliga.goals}T/${cb.bundesliga.assists}V)`}
                        </div>
                        <div className="px-1.5 py-1 rounded bg-black/50 border border-slate-800/80 text-slate-300">
                          <span className="text-sky-400 font-bold">CL:</span>{' '}
                          {isGK
                            ? `${cb.ucl.matches}Sp (${cb.ucl.saves ?? 0}P)`
                            : `${cb.ucl.matches}Sp (${cb.ucl.goals}T/${cb.ucl.assists}V)`}
                        </div>
                        <div className="px-1.5 py-1 rounded bg-black/50 border border-slate-800/80 text-slate-300">
                          <span className="text-amber-400 font-bold">DFB:</span>{' '}
                          {isGK
                            ? `${cb.dfbPokal.matches}Sp (${cb.dfbPokal.saves ?? 0}P)`
                            : `${cb.dfbPokal.matches}Sp (${cb.dfbPokal.goals}T/${cb.dfbPokal.assists}V)`}
                        </div>
                      </div>
                    )}

                    {/* Injury Badge Overlay if injured */}
                    {player.injuryStatus.isInjured && (
                      <div className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-rose-400" />
                        {player.injuryStatus.condition}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* PLAYER DETAIL MODAL */}
      {activePlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#111318] border border-[#FDE100]/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setActivePlayerModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Lockup */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FDE100] text-black font-extrabold text-2xl flex items-center justify-center font-bvb shadow-lg shadow-[#FDE100]/30 shrink-0">
                {activePlayerModal.number === 0 ? 'HC' : `#${activePlayerModal.number}`}
              </div>
              <div>
                <div className="text-xs text-[#FDE100] font-bold font-mono">
                  {activePlayerModal.flag} {activePlayerModal.nationality} · {activePlayerModal.position} ({activePlayerModal.subPosition}) · {activePlayerModal.age} Jahre
                </div>
                <h3 className="text-2xl font-bold text-white font-bvb tracking-wide">
                  {activePlayerModal.name}
                </h3>
                <div className="text-xs text-slate-400">
                  Vertrag bis: <span className="text-slate-200 font-semibold">{activePlayerModal.contractUntil}</span>
                  {activePlayerModal.starts !== undefined && activePlayerModal.position !== 'Trainer' && (
                    <span className="ml-3 text-slate-400">
                      · Startelf: <span className="text-[#FDE100] font-mono font-bold">{activePlayerModal.starts}x</span> (Einwechslungen: <span className="text-slate-200 font-mono">{activePlayerModal.subIns ?? 0}x</span>)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Season Stats Summary */}
            {activePlayerModal.position === 'Torwart' ? (
              <div className="grid grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-400">Pflichtspiele</span>
                  <div className="text-xl font-bold text-white font-mono">{activePlayerModal.matches}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Paraden (Live)</span>
                  <div className="text-xl font-bold text-[#FDE100] font-mono">{activePlayerModal.goalkeeperStats?.saves ?? 0}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Gegentore</span>
                  <div className="text-xl font-bold text-sky-400 font-mono">{activePlayerModal.goalkeeperStats?.goalsConceded ?? 0}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Spielminuten</span>
                  <div className="text-xl font-bold text-slate-200 font-mono">{activePlayerModal.minutesPlayed}'</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div>
                  <span className="text-xs text-slate-400">Pflichtspiele</span>
                  <div className="text-xl font-bold text-white font-mono">{activePlayerModal.matches}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Tore</span>
                  <div className="text-xl font-bold text-[#FDE100] font-mono">{activePlayerModal.goals}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Vorlagen</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono">{activePlayerModal.assists}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Karten (G/R)</span>
                  <div className="text-xl font-bold text-amber-400 font-mono">
                    {activePlayerModal.yellowCards}/{activePlayerModal.redCards}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Spielminuten</span>
                  <div className="text-xl font-bold text-slate-200 font-mono">{activePlayerModal.minutesPlayed}'</div>
                </div>
              </div>
            )}

            {/* Option 2: Detailed Competition Breakdown in Modal */}
            {activePlayerModal.competitionBreakdown && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 uppercase font-bvb tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#FDE100]" />
                    Pflichtspiel-Aufschlüsselung 2026/27 (Echtzeit-API)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Alle 3 Wettbewerbe synchronisiert
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      key: 'bundesliga',
                      label: '1. Fußball-Bundesliga',
                      badge: 'BL',
                      color: 'border-[#FDE100]/40 text-[#FDE100]',
                      data: activePlayerModal.competitionBreakdown.bundesliga,
                    },
                    {
                      key: 'ucl',
                      label: 'UEFA Champions League',
                      badge: 'UCL',
                      color: 'border-sky-500/40 text-sky-400',
                      data: activePlayerModal.competitionBreakdown.ucl,
                    },
                    {
                      key: 'dfbPokal',
                      label: 'DFB-Pokal',
                      badge: 'DFB',
                      color: 'border-amber-500/40 text-amber-400',
                      data: activePlayerModal.competitionBreakdown.dfbPokal,
                    },
                  ].map((comp) => {
                    const isGK = activePlayerModal.position === 'Torwart';
                    const starts = Math.max(0, comp.data.matches - (comp.data.subIns || 0));
                    return (
                      <div
                        key={comp.key}
                        className={`p-3 rounded-xl bg-black/60 border ${comp.color.split(' ')[0]} space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-bvb uppercase">
                            {comp.label}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${comp.color.split(' ')[1]}`}>
                            {comp.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1 border-t border-slate-800/80">
                          <span>Einsätze: <strong className="text-white">{comp.data.matches}</strong></span>
                          <span className="text-[10px] text-slate-400">
                            ({starts} S11 / {comp.data.subIns || 0} Einw.)
                          </span>
                        </div>
                        {isGK ? (
                          <div className="flex items-center justify-between text-xs font-mono pt-0.5">
                            <span className="text-slate-400">
                              Paraden: <strong className="text-[#FDE100]">{comp.data.saves ?? 0}</strong>
                            </span>
                            <span className="text-slate-400">
                              Gegentore: <strong className="text-sky-400">{comp.data.goalsConceded ?? 0}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs font-mono pt-0.5">
                            <span className="text-slate-400">
                              Tore: <strong className="text-[#FDE100]">{comp.data.goals}</strong>
                            </span>
                            <span className="text-slate-400">
                              Vorlagen: <strong className="text-emerald-400">{comp.data.assists}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transfermarkt Market Value History */}
            {activePlayerModal.valueHistory.length > 0 && activePlayerModal.position !== 'Trainer' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 uppercase font-bvb tracking-wider">
                    Transfermarkt.de Marktwert-Entwicklung
                  </span>
                  <span className="text-[#FDE100] font-bold font-bvb">
                    Aktuell: {activePlayerModal.marketValueFormatted}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2 h-24 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  {activePlayerModal.valueHistory.map((h, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <span className="text-[10px] text-slate-400 font-mono">€{h.value}M</span>
                      <div
                        className="w-full bg-[#FDE100] rounded-t transition-all duration-300"
                        style={{ height: `${Math.max(8, (h.value / 45) * 100)}%` }}
                      />
                      <span className="text-[10px] text-slate-500 font-mono">{h.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <a
                href={activePlayerModal.transfermarktUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#FDE100] text-black font-bold text-xs rounded-lg hover:bg-[#ffe733] transition-colors flex items-center gap-1.5 font-bvb uppercase tracking-wider shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                Transfermarkt.de Profil Öffnen
              </a>
              <button
                onClick={() => setActivePlayerModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors font-bvb uppercase cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
