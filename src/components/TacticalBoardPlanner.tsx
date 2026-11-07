import React, { useState, useEffect, useMemo } from 'react';
import { PlayerStats } from '../data/bvbSquadData';
import { Shield, Users, Sparkles, RotateCcw, Copy, CheckCircle2, HeartPulse, Award, Flame, X } from 'lucide-react';

interface PitchSlot {
  slotId: string;
  roleLabel: string;
  preferredCategory: 'Torwart' | 'Abwehr' | 'Mittelfeld' | 'Angriff';
  xPercent: number; // 0 to 100 (left to right)
  yPercent: number; // 0 to 100 (top/attack to bottom/GK)
  defaultPlayerNumber: number;
}

interface FormationConfig {
  id: string;
  name: string;
  coachNote: string;
  slots: PitchSlot[];
}

const FORMATIONS: Record<string, FormationConfig> = {
  '4-4-2': {
    id: '4-4-2',
    name: '4-4-2 Doppelspitze (Niko Kovač System)',
    coachNote: 'Kovačs Erfolgsformation aus dem 2:1 gegen Real Betis: Guirassy & Fábio Silva als Doppelspitze, flankiert von Brandt und Karetsas.',
    slots: [
      { slotId: 'gk', roleLabel: 'TW', preferredCategory: 'Torwart', xPercent: 50, yPercent: 88, defaultPlayerNumber: 1 }, // Kobel
      { slotId: 'lb', roleLabel: 'LV', preferredCategory: 'Abwehr', xPercent: 16, yPercent: 68, defaultPlayerNumber: 24 }, // Svensson
      { slotId: 'lcb', roleLabel: 'IV', preferredCategory: 'Abwehr', xPercent: 38, yPercent: 72, defaultPlayerNumber: 4 }, // Schlotterbeck
      { slotId: 'rcb', roleLabel: 'IV', preferredCategory: 'Abwehr', xPercent: 62, yPercent: 72, defaultPlayerNumber: 3 }, // Anton
      { slotId: 'rb', roleLabel: 'RV', preferredCategory: 'Abwehr', xPercent: 84, yPercent: 68, defaultPlayerNumber: 26 }, // Ryerson
      { slotId: 'lm', roleLabel: 'LM', preferredCategory: 'Mittelfeld', xPercent: 18, yPercent: 44, defaultPlayerNumber: 10 }, // Brandt
      { slotId: 'lcm', roleLabel: 'ZM', preferredCategory: 'Mittelfeld', xPercent: 39, yPercent: 49, defaultPlayerNumber: 7 }, // Jobe Bellingham
      { slotId: 'rcm', roleLabel: 'ZM', preferredCategory: 'Mittelfeld', xPercent: 61, yPercent: 49, defaultPlayerNumber: 25 }, // Joey Veerman
      { slotId: 'rm', roleLabel: 'RM', preferredCategory: 'Mittelfeld', xPercent: 82, yPercent: 44, defaultPlayerNumber: 19 }, // Karetsas
      { slotId: 'lst', roleLabel: 'ST', preferredCategory: 'Angriff', xPercent: 37, yPercent: 20, defaultPlayerNumber: 21 }, // Fábio Silva
      { slotId: 'rst', roleLabel: 'ST', preferredCategory: 'Angriff', xPercent: 63, yPercent: 20, defaultPlayerNumber: 9 }, // Guirassy
    ],
  },
  '4-2-3-1': {
    id: '4-2-3-1',
    name: '4-2-3-1 (Dortmunder Klassiker)',
    coachNote: 'Kompakte Doppelsechs mit Bellingham & Veerman/Sabitzer, davor Dreierreihe mit Beier, Brandt und Karetsas hinter Zielspieler Guirassy.',
    slots: [
      { slotId: 'gk', roleLabel: 'TW', preferredCategory: 'Torwart', xPercent: 50, yPercent: 88, defaultPlayerNumber: 1 },
      { slotId: 'lb', roleLabel: 'LV', preferredCategory: 'Abwehr', xPercent: 16, yPercent: 69, defaultPlayerNumber: 5 }, // Bensebaini
      { slotId: 'lcb', roleLabel: 'IV', preferredCategory: 'Abwehr', xPercent: 38, yPercent: 73, defaultPlayerNumber: 4 },
      { slotId: 'rcb', roleLabel: 'IV', preferredCategory: 'Abwehr', xPercent: 62, yPercent: 73, defaultPlayerNumber: 3 },
      { slotId: 'rb', roleLabel: 'RV', preferredCategory: 'Abwehr', xPercent: 84, yPercent: 69, defaultPlayerNumber: 26 },
      { slotId: 'ldm', roleLabel: 'ZDM', preferredCategory: 'Mittelfeld', xPercent: 37, yPercent: 54, defaultPlayerNumber: 7 },
      { slotId: 'rdm', roleLabel: 'ZDM', preferredCategory: 'Mittelfeld', xPercent: 63, yPercent: 54, defaultPlayerNumber: 20 }, // Sabitzer
      { slotId: 'lam', roleLabel: 'LA', preferredCategory: 'Angriff', xPercent: 20, yPercent: 34, defaultPlayerNumber: 14 }, // Beier
      { slotId: 'cam', roleLabel: 'ZOM', preferredCategory: 'Mittelfeld', xPercent: 50, yPercent: 36, defaultPlayerNumber: 10 }, // Brandt
      { slotId: 'ram', roleLabel: 'RA', preferredCategory: 'Mittelfeld', xPercent: 80, yPercent: 34, defaultPlayerNumber: 19 }, // Karetsas
      { slotId: 'st', roleLabel: 'MS', preferredCategory: 'Angriff', xPercent: 50, yPercent: 16, defaultPlayerNumber: 9 }, // Guirassy
    ],
  },
  '3-4-2-1': {
    id: '3-4-2-1',
    name: '3-4-2-1 (Dreierkette & Schienenspieler)',
    coachNote: 'Dreierkette mit Schlotterbeck, Anton und Can, hohe Schienen über Svensson und Ryerson sowie zwei Halbraum-Zehner.',
    slots: [
      { slotId: 'gk', roleLabel: 'TW', preferredCategory: 'Torwart', xPercent: 50, yPercent: 88, defaultPlayerNumber: 1 },
      { slotId: 'lcb', roleLabel: 'LIV', preferredCategory: 'Abwehr', xPercent: 26, yPercent: 72, defaultPlayerNumber: 4 },
      { slotId: 'ccb', roleLabel: 'ZIV', preferredCategory: 'Abwehr', xPercent: 50, yPercent: 74, defaultPlayerNumber: 3 },
      { slotId: 'rcb', roleLabel: 'RIV', preferredCategory: 'Abwehr', xPercent: 74, yPercent: 72, defaultPlayerNumber: 23 }, // Can
      { slotId: 'lwb', roleLabel: 'LM', preferredCategory: 'Abwehr', xPercent: 14, yPercent: 49, defaultPlayerNumber: 24 },
      { slotId: 'lcm', roleLabel: 'ZM', preferredCategory: 'Mittelfeld', xPercent: 39, yPercent: 52, defaultPlayerNumber: 7 },
      { slotId: 'rcm', roleLabel: 'ZM', preferredCategory: 'Mittelfeld', xPercent: 61, yPercent: 52, defaultPlayerNumber: 25 },
      { slotId: 'rwb', roleLabel: 'RM', preferredCategory: 'Abwehr', xPercent: 86, yPercent: 49, defaultPlayerNumber: 26 },
      { slotId: 'lam', roleLabel: 'HS', preferredCategory: 'Mittelfeld', xPercent: 34, yPercent: 30, defaultPlayerNumber: 10 },
      { slotId: 'ram', roleLabel: 'HS', preferredCategory: 'Angriff', xPercent: 66, yPercent: 30, defaultPlayerNumber: 21 },
      { slotId: 'st', roleLabel: 'MS', preferredCategory: 'Angriff', xPercent: 50, yPercent: 15, defaultPlayerNumber: 9 },
    ],
  },
  '4-3-3': {
    id: '4-3-3',
    name: '4-3-3 (Vollgas-Pressing)',
    coachNote: 'Hohes Gegenpressing mit drei zentralen Mittelfeldspielern und drei Angreifern.',
    slots: [
      { slotId: 'gk', roleLabel: 'TW', preferredCategory: 'Torwart', xPercent: 50, yPercent: 88, defaultPlayerNumber: 1 },
      { slotId: 'lb', roleLabel: 'LV', preferredCategory: 'Abwehr', xPercent: 16, yPercent: 69, defaultPlayerNumber: 24 },
      { slotId: 'lcb', roleLabel: 'IV', preferredCategory: 'Abwehr', xPercent: 38, yPercent: 73, defaultPlayerNumber: 4 },
      { slotId: 'rcb', roleLabel: 'IV', preferredCategory: 'Abwehr', xPercent: 62, yPercent: 73, defaultPlayerNumber: 3 },
      { slotId: 'rb', roleLabel: 'RV', preferredCategory: 'Abwehr', xPercent: 84, yPercent: 69, defaultPlayerNumber: 26 },
      { slotId: 'dm', roleLabel: 'ZDM', preferredCategory: 'Mittelfeld', xPercent: 50, yPercent: 55, defaultPlayerNumber: 25 },
      { slotId: 'lcm', roleLabel: 'ZM', preferredCategory: 'Mittelfeld', xPercent: 32, yPercent: 43, defaultPlayerNumber: 7 },
      { slotId: 'rcm', roleLabel: 'ZM', preferredCategory: 'Mittelfeld', xPercent: 68, yPercent: 43, defaultPlayerNumber: 10 },
      { slotId: 'lw', roleLabel: 'LF', preferredCategory: 'Angriff', xPercent: 22, yPercent: 22, defaultPlayerNumber: 21 },
      { slotId: 'st', roleLabel: 'MS', preferredCategory: 'Angriff', xPercent: 50, yPercent: 16, defaultPlayerNumber: 9 },
      { slotId: 'rw', roleLabel: 'RF', preferredCategory: 'Mittelfeld', xPercent: 78, yPercent: 22, defaultPlayerNumber: 19 },
    ],
  },
};

interface TacticalBoardPlannerProps {
  squad: PlayerStats[];
}

export const TacticalBoardPlanner: React.FC<TacticalBoardPlannerProps> = ({ squad }) => {
  const playersOnly = useMemo(
    () => squad.filter((p) => p.position !== 'Trainer'),
    [squad]
  );

  const [formationId, setFormationId] = useState<string>(() => {
    try {
      return localStorage.getItem('bvb_tactical_formation_v1') || '4-4-2';
    } catch {
      return '4-4-2';
    }
  });

  // Map slotId -> player.id
  const [lineupMap, setLineupMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('bvb_tactical_lineup_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [activeSlotPicker, setActiveSlotPicker] = useState<PitchSlot | null>(null);
  const [copiedLineup, setCopiedLineup] = useState<boolean>(false);

  const currentFormation = FORMATIONS[formationId] || FORMATIONS['4-4-2'];

  // Initialize default lineup for active formation whenever formation changes or squad loads
  useEffect(() => {
    if (playersOnly.length === 0) return;

    const currentSlots = currentFormation.slots;
    const allSlotsPopulated = currentSlots.every((s) => lineupMap[s.slotId] && playersOnly.some((p) => p.id === lineupMap[s.slotId]));
    if (allSlotsPopulated) return;

    const nextMap: Record<string, string> = {};
    const usedIds = new Set<string>();

    for (const slot of currentSlots) {
      const byNum = playersOnly.find((p) => p.number === slot.defaultPlayerNumber && !usedIds.has(p.id));
      if (byNum) {
        nextMap[slot.slotId] = byNum.id;
        usedIds.add(byNum.id);
      } else {
        const fallback = playersOnly.find((p) => p.position === slot.preferredCategory && !usedIds.has(p.id)) || playersOnly.find((p) => !usedIds.has(p.id));
        if (fallback) {
          nextMap[slot.slotId] = fallback.id;
          usedIds.add(fallback.id);
        }
      }
    }
    setLineupMap(nextMap);
  }, [formationId, playersOnly]);

  const handleFormationChange = (newFormId: string) => {
    setFormationId(newFormId);
    try {
      localStorage.setItem('bvb_tactical_formation_v1', newFormId);
    } catch {}

    const form = FORMATIONS[newFormId];
    if (!form) return;
    const nextMap: Record<string, string> = {};
    const usedIds = new Set<string>();

    for (const slot of form.slots) {
      const byNum = playersOnly.find((p) => p.number === slot.defaultPlayerNumber && !usedIds.has(p.id));
      if (byNum) {
        nextMap[slot.slotId] = byNum.id;
        usedIds.add(byNum.id);
      }
    }
    setLineupMap(nextMap);
    try {
      localStorage.setItem('bvb_tactical_lineup_v1', JSON.stringify(nextMap));
    } catch {}
  };

  const handleAssignPlayerToSlot = (slotId: string, playerId: string) => {
    setLineupMap((prev) => {
      const next = { ...prev };
      // If this player is already in another slot, swap them!
      const existingSlotForPlayer = Object.keys(next).find((k) => next[k] === playerId);
      if (existingSlotForPlayer && existingSlotForPlayer !== slotId) {
        next[existingSlotForPlayer] = prev[slotId];
      }
      next[slotId] = playerId;
      try {
        localStorage.setItem('bvb_tactical_lineup_v1', JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveSlotPicker(null);
  };

  const applyU23Preset = () => {
    // Sort players by youngest + highest potential
    const nextMap: Record<string, string> = {};
    const usedIds = new Set<string>();
    const sortedYoung = [...playersOnly].sort((a, b) => a.age - b.age);

    for (const slot of currentFormation.slots) {
      const match =
        sortedYoung.find((p) => p.position === slot.preferredCategory && !usedIds.has(p.id)) ||
        sortedYoung.find((p) => !usedIds.has(p.id));
      if (match) {
        nextMap[slot.slotId] = match.id;
        usedIds.add(match.id);
      }
    }
    setLineupMap(nextMap);
    try {
      localStorage.setItem('bvb_tactical_lineup_v1', JSON.stringify(nextMap));
    } catch {}
  };

  // Compute Starting XI stats
  const startingElevenPlayers = useMemo(() => {
    return currentFormation.slots
      .map((slot) => ({
        slot,
        player: playersOnly.find((p) => p.id === lineupMap[slot.slotId]) || playersOnly[0],
      }))
      .filter((item) => Boolean(item.player));
  }, [currentFormation, lineupMap, playersOnly]);

  const totalMarketValue = startingElevenPlayers.reduce((acc, item) => acc + (item.player?.marketValue || 0), 0);
  const avgAge =
    startingElevenPlayers.length > 0
      ? startingElevenPlayers.reduce((acc, item) => acc + (item.player?.age || 0), 0) / startingElevenPlayers.length
      : 0;
  const totalGoals = startingElevenPlayers.reduce((acc, item) => acc + (item.player?.goals || 0), 0);
  const totalAssists = startingElevenPlayers.reduce((acc, item) => acc + (item.player?.assists || 0), 0);
  const injuredInStartingXI = startingElevenPlayers.filter((item) => item.player?.injuryStatus?.isInjured);

  const handleCopyLineup = () => {
    const lines = [
      `💛🖤 BORUSSIA DORTMUND 09 - WUNSCH-STARTELF (${currentFormation.name})`,
      `Cheftrainer: Niko Kovač | Startelf-Marktwert: €${totalMarketValue.toFixed(1)}M | Ø-Alter: ${avgAge.toFixed(1)} J.`,
      '------------------------------------------------------------',
      ...startingElevenPlayers.map(
        (item) =>
          `[${item.slot.roleLabel}] #${item.player.number} ${item.player.name} (${item.player.marketValueFormatted})`
      ),
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
    setCopiedLineup(true);
    setTimeout(() => setCopiedLineup(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Control & KPI Header */}
      <div className="p-5 rounded-2xl bg-[#111318] border border-[#FDE100]/40 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100] text-black font-mono font-extrabold text-[11px]">
                TAKTIKTAFEL & STARTELF-PLANER
              </span>
              <span className="text-xs font-mono text-slate-400">
                Cheftrainer: Niko Kovač (🇭🇷 Vertrag bis 2029)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-bvb tracking-wide">
              SIGNAL IDUNA PARK · INTERAKTIVE WUNSCH-STARTELF
            </h3>
            <p className="text-xs text-slate-400">{currentFormation.coachNote}</p>
          </div>

          {/* Formation Switcher & Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {Object.values(FORMATIONS).map((f) => (
              <button
                key={f.id}
                onClick={() => handleFormationChange(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bvb font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  formationId === f.id
                    ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {f.id}
              </button>
            ))}

            <button
              onClick={applyU23Preset}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#FDE100] border border-[#FDE100]/30 font-bvb font-bold text-xs uppercase tracking-wider cursor-pointer"
              title="Jüngste BVB-Top-Talente (Karetsas, Inácio, Campbell, Bellingham) aufstellen"
            >
              Youngster-Elf
            </button>

            <button
              onClick={handleCopyLineup}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bvb font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLineup ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLineup ? 'Kopiert!' : 'Aufstellung kopieren'}</span>
            </button>
          </div>
        </div>

        {/* Starting XI KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Startelf-Marktwert</span>
            <span className="text-xl font-black text-[#FDE100] font-bvb">€{totalMarketValue.toFixed(2)}M</span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Ø-Alter Startelf</span>
            <span className="text-xl font-black text-white font-bvb">{avgAge.toFixed(1)} Jahre</span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Startelf Scorer (Saison)</span>
            <span className="text-xl font-black text-emerald-400 font-bvb">
              {totalGoals} Tore · {totalAssists} Assists
            </span>
          </div>
          <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Fitness-Check</span>
            {injuredInStartingXI.length === 0 ? (
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Alle 11 Profis fit!
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1 mt-1">
                <HeartPulse className="w-4 h-4 animate-pulse shrink-0" />
                {injuredInStartingXI.length} Ausfall in Startelf ({injuredInStartingXI[0].player.name})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Tactical Pitch + Bench Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT (8 cols): Signal Iduna Park Graphical Pitch */}
        <div className="lg:col-span-8">
          <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border-2 border-[#FDE100]/50 shadow-2xl bg-gradient-to-b from-[#0b3b1e] via-[#0e4825] to-[#0b3b1e] select-none">
            {/* Pitch Lawn Stripes */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(255,255,255,0.12) 48px, rgba(255,255,255,0.12) 96px)',
              }}
            />

            {/* Pitch Markings (Outer Lines, Halfway Line, Center Circle, Penalty Boxes) */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none">
              {/* Halfway Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2" />
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full border-2 border-white/30 -translate-x-1/2 -translate-y-1/2" />
              {/* Top Penalty Box (Attack) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 border-b-2 border-x-2 border-white/30" />
              {/* Bottom Penalty Box (BVB Goal / Südtribüne) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 border-t-2 border-x-2 border-white/30" />
            </div>

            {/* Top Direction Banner */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-black/60 border border-white/20 text-[10px] font-mono text-slate-300 uppercase tracking-widest">
              ▲ ANGRIFFSRICHTUNG BORUSSIA DORTMUND ▲
            </div>

            {/* 11 Interactive Player Nodes on the Pitch */}
            {startingElevenPlayers.map(({ slot, player }) => {
              const isInjured = player.injuryStatus?.isInjured;
              return (
                <button
                  key={slot.slotId}
                  onClick={() => setActiveSlotPicker(slot)}
                  style={{
                    left: `${slot.xPercent}%`,
                    top: `${slot.yPercent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center cursor-pointer focus:outline-none z-10"
                  title={`Klicken, um Position ${slot.roleLabel} (${player.name}) zu wechseln`}
                >
                  {/* Jersey Circle */}
                  <div
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bvb font-black text-base shadow-xl transition-transform group-hover:scale-110 border-2 ${
                      isInjured
                        ? 'bg-rose-600 text-white border-white'
                        : slot.preferredCategory === 'Torwart'
                        ? 'bg-emerald-400 text-black border-black'
                        : 'bg-[#FDE100] text-black border-black'
                    }`}
                  >
                    <span>#{player.number}</span>
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded bg-black text-[#FDE100] font-mono text-[9px] font-extrabold border border-[#FDE100]/50">
                      {slot.roleLabel}
                    </span>
                  </div>

                  {/* Player Name & Market Value Tag */}
                  <div className="mt-1 px-2.5 py-0.5 rounded-md bg-black/90 border border-[#FDE100]/40 group-hover:border-[#FDE100] text-center shadow-lg min-w-[92px]">
                    <div className="text-xs font-bold text-white font-bvb tracking-wide truncate max-w-[115px]">
                      {player.name.split(' ').pop()}
                    </div>
                    <div className="text-[9px] font-mono text-[#FDE100]">
                      {player.marketValueFormatted} · {player.goals}⚽
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Bottom Gelbe Wand / Südtribüne Banner */}
            <div className="absolute bottom-0 left-0 right-0 py-1.5 bg-gradient-to-r from-black via-[#FDE100] to-black text-center">
              <span className="text-[11px] font-black text-black font-bvb uppercase tracking-widest">
                💛🖤 SÜDTRIBÜNE DORTMUND · GELBE WAND (25.000 STEHPLÄTZE) · KLICKE AUF EINEN SPIELER ZUM WECHSELN 💛🖤
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT (4 cols): Ersatzbank & Kader-Rotation */}
        <div className="lg:col-span-4 bg-[#111318] border border-slate-800 rounded-2xl p-4 flex flex-col h-[600px]">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bvb font-bold text-white text-base uppercase tracking-wide">
                BVB ERSATZBANK & ROTATION
              </h4>
              <p className="text-[11px] text-slate-400">
                Klicke links auf eine Position im Spielfeld, um einen Bankspieler einzuwechseln.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#FDE100]/15 text-[#FDE100] font-mono text-xs font-bold">
              {playersOnly.length - startingElevenPlayers.length} Profis
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {playersOnly
              .filter((p) => !Object.values(lineupMap).includes(p.id))
              .map((benchP) => (
                <div
                  key={benchP.id}
                  onClick={() => {
                    // Find matching slot category or open selector
                    const matchingSlot =
                      currentFormation.slots.find((s) => s.preferredCategory === benchP.position) ||
                      currentFormation.slots[currentFormation.slots.length - 1];
                    setActiveSlotPicker(matchingSlot);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-[#FDE100]/50 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-slate-800 border border-[#FDE100]/40 text-[#FDE100] font-bvb font-extrabold text-xs flex items-center justify-center">
                      #{benchP.number}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{benchP.flag} {benchP.name}</span>
                        {benchP.injuryStatus?.isInjured && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-mono">
                            Verletzt
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {benchP.subPosition} · {benchP.goals} Tore / {benchP.assists} Assists
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FDE100] font-bvb">
                    {benchP.marketValueFormatted}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal to swap a player into the clicked pitch slot */}
      {activeSlotPicker && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActiveSlotPicker(null)}
        >
          <div
            className="bg-[#12151d] border border-[#FDE100]/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#FDE100] uppercase">
                  Position besetzen ({currentFormation.name})
                </span>
                <h3 className="text-lg font-black text-white font-bvb">
                  SPIELER FÜR POSITION „{activeSlotPicker.roleLabel}“ ({activeSlotPicker.preferredCategory}) WÄHLEN
                </h3>
              </div>
              <button
                onClick={() => setActiveSlotPicker(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
              {[...playersOnly]
                .sort((a, b) => {
                  const aFit = a.position === activeSlotPicker.preferredCategory ? 1 : 0;
                  const bFit = b.position === activeSlotPicker.preferredCategory ? 1 : 0;
                  if (aFit !== bFit) return bFit - aFit;
                  return b.marketValue - a.marketValue;
                })
                .map((p) => {
                  const isCurrentlyInThisSlot = lineupMap[activeSlotPicker.slotId] === p.id;
                  const isAlreadyOnPitch = Object.values(lineupMap).includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleAssignPlayerToSlot(activeSlotPicker.slotId, p.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isCurrentlyInThisSlot
                          ? 'bg-[#FDE100] text-black border-[#FDE100] font-bold'
                          : 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-8 h-8 rounded-full font-bvb font-black text-xs flex items-center justify-center ${
                            isCurrentlyInThisSlot ? 'bg-black text-[#FDE100]' : 'bg-[#FDE100] text-black'
                          }`}
                        >
                          #{p.number}
                        </span>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                            <span>{p.flag} {p.name}</span>
                            {isAlreadyOnPitch && !isCurrentlyInThisSlot && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 text-[10px] font-mono">
                                Auf dem Platz (Tausch)
                              </span>
                            )}
                            {p.injuryStatus?.isInjured && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono">
                                Verletzt
                              </span>
                            )}
                          </div>
                          <div className={`text-xs font-mono ${isCurrentlyInThisSlot ? 'text-black/80' : 'text-slate-400'}`}>
                            {p.subPosition} · {p.matches} Spiele · {p.goals} Tore · {p.assists} Vorlagen
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-bvb font-extrabold text-sm">
                        {p.marketValueFormatted}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
