import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Sparkles, RefreshCw, CheckCircle2, ShieldCheck, Calculator, RotateCcw, Flame } from 'lucide-react';
import { OfficialBvbLogo } from './OfficialBvbLogo';

export interface UclStandingRow {
  rank: number;
  teamId: string;
  teamName: string;
  shortName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  isBVB: boolean;
}

interface RemainingUclFixture {
  id: string;
  matchday: number;
  dateStr: string;
  opponent: string;
  opponentTeamNameInTable: string;
  isHome: boolean;
  venue: string;
  bvbScore: number | null;
  oppScore: number | null;
}

const BASELINE_UCL_36_TABLE: UclStandingRow[] = [
  { rank: 1, teamId: 'psg', teamName: 'Paris Saint-Germain', shortName: 'PSG', played: 4, won: 4, draw: 0, lost: 0, goalsFor: 20, goalsAgainst: 5, goalDiff: 15, points: 12, isBVB: false },
  { rank: 2, teamId: 'rma', teamName: 'Real Madrid', shortName: 'RMA', played: 4, won: 4, draw: 0, lost: 0, goalsFor: 13, goalsAgainst: 7, goalDiff: 6, points: 12, isBVB: false },
  { rank: 3, teamId: 'ars', teamName: 'Arsenal', shortName: 'ARS', played: 4, won: 3, draw: 1, lost: 0, goalsFor: 8, goalsAgainst: 3, goalDiff: 5, points: 10, isBVB: false },
  { rank: 4, teamId: 'com', teamName: 'Como 1907', shortName: 'COM', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 19, goalsAgainst: 6, goalDiff: 13, points: 9, isBVB: false },
  { rank: 5, teamId: 'bar', teamName: 'FC Barcelona', shortName: 'BAR', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 14, goalsAgainst: 6, goalDiff: 8, points: 9, isBVB: false },
  { rank: 6, teamId: 'avl', teamName: 'Aston Villa', shortName: 'AVL', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 12, goalsAgainst: 6, goalDiff: 6, points: 9, isBVB: false },
  { rank: 7, teamId: 'mci', teamName: 'Manchester City', shortName: 'MCI', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 12, goalsAgainst: 7, goalDiff: 5, points: 9, isBVB: false },
  { rank: 8, teamId: 'liv', teamName: 'FC Liverpool', shortName: 'LIV', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 14, goalsAgainst: 10, goalDiff: 4, points: 9, isBVB: false },
  { rank: 9, teamId: 'bru', teamName: 'Club Brugge', shortName: 'BRU', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 11, goalsAgainst: 7, goalDiff: 4, points: 9, isBVB: false },
  { rank: 10, teamId: 'scp', teamName: 'Sporting CP', shortName: 'SCP', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 8, goalsAgainst: 4, goalDiff: 4, points: 9, isBVB: false },
  { rank: 11, teamId: 'fcb', teamName: 'FC Bayern München', shortName: 'FCB', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 9, goalsAgainst: 6, goalDiff: 3, points: 9, isBVB: false },
  { rank: 12, teamId: 'bvb', teamName: 'Borussia Dortmund', shortName: 'BVB', played: 4, won: 3, draw: 0, lost: 1, goalsFor: 7, goalsAgainst: 5, goalDiff: 2, points: 9, isBVB: true },
  { rank: 13, teamId: 'int', teamName: 'Inter Mailand', shortName: 'INT', played: 4, won: 2, draw: 2, lost: 0, goalsFor: 7, goalsAgainst: 3, goalDiff: 4, points: 8, isBVB: false },
  { rank: 14, teamId: 'atm', teamName: 'Atlético Madrid', shortName: 'ATM', played: 4, won: 2, draw: 1, lost: 1, goalsFor: 8, goalsAgainst: 6, goalDiff: 2, points: 7, isBVB: false },
  { rank: 15, teamId: 'lev', teamName: 'Bayer 04 Leverkusen', shortName: 'B04', played: 4, won: 2, draw: 1, lost: 1, goalsFor: 7, goalsAgainst: 5, goalDiff: 2, points: 7, isBVB: false },
  { rank: 16, teamId: 'juv', teamName: 'Juventus Turin', shortName: 'JUV', played: 4, won: 2, draw: 1, lost: 1, goalsFor: 6, goalsAgainst: 5, goalDiff: 1, points: 7, isBVB: false },
  { rank: 17, teamId: 'ben', teamName: 'SL Benfica', shortName: 'BEN', played: 4, won: 2, draw: 0, lost: 2, goalsFor: 7, goalsAgainst: 6, goalDiff: 1, points: 6, isBVB: false },
  { rank: 18, teamId: 'acm', teamName: 'AC Mailand', shortName: 'ACM', played: 4, won: 2, draw: 0, lost: 2, goalsFor: 6, goalsAgainst: 6, goalDiff: 0, points: 6, isBVB: false },
  { rank: 19, teamId: 'bod', teamName: 'FK Bodø/Glimt', shortName: 'BOD', played: 4, won: 2, draw: 0, lost: 2, goalsFor: 5, goalsAgainst: 6, goalDiff: -1, points: 6, isBVB: false },
  { rank: 20, teamId: 'psv', teamName: 'PSV Eindhoven', shortName: 'PSV', played: 4, won: 1, draw: 2, lost: 1, goalsFor: 6, goalsAgainst: 6, goalDiff: 0, points: 5, isBVB: false },
  { rank: 21, teamId: 'fey', teamName: 'Feyenoord Rotterdam', shortName: 'FEY', played: 4, won: 1, draw: 2, lost: 1, goalsFor: 5, goalsAgainst: 6, goalDiff: -1, points: 5, isBVB: false },
  { rank: 22, teamId: 'mon', teamName: 'AS Monaco', shortName: 'MON', played: 4, won: 1, draw: 2, lost: 1, goalsFor: 5, goalsAgainst: 7, goalDiff: -2, points: 5, isBVB: false },
  { rank: 23, teamId: 'bet', teamName: 'Real Betis Sevilla', shortName: 'BET', played: 4, won: 1, draw: 1, lost: 2, goalsFor: 5, goalsAgainst: 6, goalDiff: -1, points: 4, isBVB: false },
  { rank: 24, teamId: 'cel', teamName: 'Celtic Glasgow', shortName: 'CEL', played: 4, won: 1, draw: 1, lost: 2, goalsFor: 5, goalsAgainst: 8, goalDiff: -3, points: 4, isBVB: false },
  { rank: 25, teamId: 'vil', teamName: 'FC Villarreal', shortName: 'VIL', played: 4, won: 1, draw: 1, lost: 2, goalsFor: 4, goalsAgainst: 7, goalDiff: -3, points: 4, isBVB: false },
  { rank: 26, teamId: 'ajx', teamName: 'Ajax Amsterdam', shortName: 'AJX', played: 4, won: 1, draw: 1, lost: 2, goalsFor: 4, goalsAgainst: 8, goalDiff: -4, points: 4, isBVB: false },
  { rank: 27, teamId: 'rbl', teamName: 'RB Leipzig', shortName: 'RBL', played: 4, won: 1, draw: 0, lost: 3, goalsFor: 4, goalsAgainst: 8, goalDiff: -4, points: 3, isBVB: false },
  { rank: 28, teamId: 'aek', teamName: 'AEK Athen', shortName: 'AEK', played: 4, won: 1, draw: 0, lost: 3, goalsFor: 3, goalsAgainst: 8, goalDiff: -5, points: 3, isBVB: false },
  { rank: 29, teamId: 'sha', teamName: 'Schachtar Donezk', shortName: 'SHA', played: 4, won: 1, draw: 0, lost: 3, goalsFor: 3, goalsAgainst: 9, goalDiff: -6, points: 3, isBVB: false },
  { rank: 30, teamId: 'sal', teamName: 'RB Salzburg', shortName: 'SAL', played: 4, won: 1, draw: 0, lost: 3, goalsFor: 2, goalsAgainst: 9, goalDiff: -7, points: 3, isBVB: false },
  { rank: 31, teamId: 'gal', teamName: 'Galatasaray Istanbul', shortName: 'GAL', played: 4, won: 0, draw: 2, lost: 2, goalsFor: 4, goalsAgainst: 8, goalDiff: -4, points: 2, isBVB: false },
  { rank: 32, teamId: 'sge', teamName: 'Eintracht Frankfurt', shortName: 'SGE', played: 4, won: 0, draw: 2, lost: 2, goalsFor: 3, goalsAgainst: 8, goalDiff: -5, points: 2, isBVB: false },
  { rank: 33, teamId: 'sab', teamName: 'Sabah FK', shortName: 'SAB', played: 4, won: 0, draw: 1, lost: 3, goalsFor: 3, goalsAgainst: 9, goalDiff: -6, points: 1, isBVB: false },
  { rank: 34, teamId: 'yb', teamName: 'BSC Young Boys', shortName: 'YBB', played: 4, won: 0, draw: 1, lost: 3, goalsFor: 2, goalsAgainst: 10, goalDiff: -8, points: 1, isBVB: false },
  { rank: 35, teamId: 'slv', teamName: 'Slavia Prag', shortName: 'SLA', played: 4, won: 0, draw: 0, lost: 4, goalsFor: 2, goalsAgainst: 11, goalDiff: -9, points: 0, isBVB: false },
  { rank: 36, teamId: 'str', teamName: 'SK Sturm Graz', shortName: 'STU', played: 4, won: 0, draw: 0, lost: 4, goalsFor: 1, goalsAgainst: 12, goalDiff: -11, points: 0, isBVB: false },
];

const INITIAL_REMAINING_FIXTURES: RemainingUclFixture[] = [
  {
    id: 'ucl-md5',
    matchday: 5,
    dateStr: 'Di., 24.11.2026 · 21:00 Uhr',
    opponent: 'FC Arsenal',
    opponentTeamNameInTable: 'Arsenal',
    isHome: false,
    venue: 'Emirates Stadium, London',
    bvbScore: null,
    oppScore: null,
  },
  {
    id: 'ucl-md6',
    matchday: 6,
    dateStr: 'Mi., 09.12.2026 · 21:00 Uhr',
    opponent: 'Inter Mailand',
    opponentTeamNameInTable: 'Inter',
    isHome: true,
    venue: 'Signal Iduna Park, Dortmund',
    bvbScore: null,
    oppScore: null,
  },
  {
    id: 'ucl-md7',
    matchday: 7,
    dateStr: 'Di., 19.01.2027 · 21:00 Uhr',
    opponent: 'Aston Villa',
    opponentTeamNameInTable: 'Aston Villa',
    isHome: false,
    venue: 'Villa Park, Birmingham',
    bvbScore: null,
    oppScore: null,
  },
  {
    id: 'ucl-md8',
    matchday: 8,
    dateStr: 'Mi., 27.01.2027 · 21:00 Uhr',
    opponent: 'AEK Athen',
    opponentTeamNameInTable: 'AEK',
    isHome: true,
    venue: 'Signal Iduna Park, Dortmund',
    bvbScore: null,
    oppScore: null,
  },
];

interface ChampionsLeagueSectionProps {
  onSelectPlayer?: (playerName: string) => void;
}

export const ChampionsLeagueSection: React.FC<ChampionsLeagueSectionProps> = ({ onSelectPlayer }) => {
  const [liveTable, setLiveTable] = useState<UclStandingRow[]>(BASELINE_UCL_36_TABLE);
  const [fixtures, setFixtures] = useState<RemainingUclFixture[]>(() => {
    try {
      const saved = localStorage.getItem('bvb_ucl_simulator_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REMAINING_FIXTURES;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('Live (4. Spieltag)');

  const fetchLiveUclStandings = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/uefa.champions/standings', {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const entries = data?.children?.[0]?.standings?.entries || [];
        if (Array.isArray(entries) && entries.length >= 24) {
          const parsed: UclStandingRow[] = entries.map((e: any, i: number) => {
            const t = e.team || {};
            const statsMap: Record<string, number> = {};
            for (const s of e.stats || []) {
              statsMap[s.name] = Number(s.value ?? 0);
            }
            const name = t.displayName || t.name || `Team ${i + 1}`;
            const isBVB = name.toLowerCase().includes('dortmund') || String(t.id) === '124';
            return {
              rank: statsMap.rank || i + 1,
              teamId: String(t.id || i),
              teamName: isBVB ? 'Borussia Dortmund' : name,
              shortName: isBVB ? 'BVB' : (t.abbreviation || name.slice(0, 3).toUpperCase()),
              played: statsMap.gamesPlayed || 4,
              won: statsMap.wins || 0,
              draw: statsMap.ties || 0,
              lost: statsMap.losses || 0,
              goalsFor: statsMap.pointsFor || 0,
              goalsAgainst: statsMap.pointsAgainst || 0,
              goalDiff: statsMap.pointDifferential ?? ((statsMap.pointsFor || 0) - (statsMap.pointsAgainst || 0)),
              points: statsMap.points || 0,
              isBVB,
            };
          });
          setLiveTable(parsed);
          setLastSynced(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } catch {
      // Keep baseline 36-team table
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchLiveUclStandings();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('bvb_ucl_simulator_v1', JSON.stringify(fixtures));
    } catch {}
  }, [fixtures]);

  // Recalculate 36-team table whenever user predicts BVB's remaining 4 UCL matches
  const simulatedTable = useMemo(() => {
    const copy: UclStandingRow[] = liveTable.map((row) => ({ ...row }));
    const bvb = copy.find((r) => r.isBVB);
    if (!bvb) return copy;

    for (const fix of fixtures) {
      if (fix.bvbScore === null || fix.oppScore === null) continue;
      const bGoals = fix.bvbScore;
      const oGoals = fix.oppScore;

      // Update BVB stats
      bvb.played += 1;
      bvb.goalsFor += bGoals;
      bvb.goalsAgainst += oGoals;
      bvb.goalDiff = bvb.goalsFor - bvb.goalsAgainst;
      if (bGoals > oGoals) {
        bvb.won += 1;
        bvb.points += 3;
      } else if (bGoals === oGoals) {
        bvb.draw += 1;
        bvb.points += 1;
      } else {
        bvb.lost += 1;
      }

      // Also update opponent in table if found
      const oppRow = copy.find(
        (r) => !r.isBVB && r.teamName.toLowerCase().includes(fix.opponentTeamNameInTable.toLowerCase())
      );
      if (oppRow) {
        oppRow.played += 1;
        oppRow.goalsFor += oGoals;
        oppRow.goalsAgainst += bGoals;
        oppRow.goalDiff = oppRow.goalsFor - oppRow.goalsAgainst;
        if (oGoals > bGoals) {
          oppRow.won += 1;
          oppRow.points += 3;
        } else if (oGoals === bGoals) {
          oppRow.draw += 1;
          oppRow.points += 1;
        } else {
          oppRow.lost += 1;
        }
      }
    }

    // Sort according to official UEFA League Phase tiebreakers: Points -> GoalDiff -> GoalsFor -> Wins
    copy.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return b.won - a.won;
    });

    return copy.map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [liveTable, fixtures]);

  const bvbSimRow = simulatedTable.find((r) => r.isBVB) || BASELINE_UCL_36_TABLE[11];

  const handleScoreChange = (id: string, side: 'bvb' | 'opp', valStr: string) => {
    const num = valStr === '' ? null : Math.max(0, Math.min(15, parseInt(valStr, 10) || 0));
    setFixtures((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (side === 'bvb') {
          return { ...f, bvbScore: num, oppScore: f.oppScore === null && num !== null ? 0 : f.oppScore };
        } else {
          return { ...f, oppScore: num, bvbScore: f.bvbScore === null && num !== null ? 0 : f.bvbScore };
        }
      })
    );
  };

  const applyPreset = (preset: 'reset' | 'kovac-top8' | 'realistic') => {
    if (preset === 'reset') {
      setFixtures(INITIAL_REMAINING_FIXTURES.map((f) => ({ ...f, bvbScore: null, oppScore: null })));
    } else if (preset === 'kovac-top8') {
      setFixtures([
        { ...INITIAL_REMAINING_FIXTURES[0], bvbScore: 2, oppScore: 1 }, // 2:1 @ Arsenal
        { ...INITIAL_REMAINING_FIXTURES[1], bvbScore: 2, oppScore: 0 }, // 2:0 vs Inter
        { ...INITIAL_REMAINING_FIXTURES[2], bvbScore: 2, oppScore: 2 }, // 2:2 @ Aston Villa
        { ...INITIAL_REMAINING_FIXTURES[3], bvbScore: 3, oppScore: 0 }, // 3:0 vs AEK Athen
      ]);
    } else if (preset === 'realistic') {
      setFixtures([
        { ...INITIAL_REMAINING_FIXTURES[0], bvbScore: 1, oppScore: 1 }, // 1:1 @ Arsenal
        { ...INITIAL_REMAINING_FIXTURES[1], bvbScore: 2, oppScore: 1 }, // 2:1 vs Inter
        { ...INITIAL_REMAINING_FIXTURES[2], bvbScore: 1, oppScore: 1 }, // 1:1 @ Aston Villa
        { ...INITIAL_REMAINING_FIXTURES[3], bvbScore: 3, oppScore: 1 }, // 3:1 vs AEK Athen
      ]);
    }
  };

  const getQualificationBadge = (rank: number) => {
    if (rank <= 8) {
      return {
        label: 'DIREKTES ACHTELFINALE (TOP 8)',
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      };
    }
    if (rank <= 24) {
      return {
        label: 'K.O.-PLAYOFF-RUNDE (PLATZ 9–24)',
        color: 'bg-sky-500/20 text-sky-300 border-sky-500/50',
      };
    }
    return {
      label: 'AUSGESCHIEDEN (AB PLATZ 25)',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
    };
  };

  const bvbQual = getQualificationBadge(bvbSimRow.rank);

  return (
    <div className="space-y-6">
      {/* Top UCL Status & K.o.-Runden-Rechner Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#10131c] via-[#131824] to-[#0b0d13] border border-[#FDE100]/40 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100] text-black font-mono font-extrabold text-[11px]">
                UEFA CHAMPIONS LEAGUE 2026/27
              </span>
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold ${bvbQual.color}`}>
                BVB PROGNOSE: {bvbSimRow.rank}. PLATZ ({bvbSimRow.points} PKT) · {bvbQual.label}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-bvb tracking-wide flex items-center gap-2">
              <Calculator className="w-6 h-6 text-[#FDE100]" />
              BVB K.O.-RUNDEN-RECHNER & 36ER-LIGAPHASE LIVE
            </h2>
            <p className="text-xs text-slate-400">
              Nach dem 2:1-Heimsieg gegen Real Betis (Tore: Fábio Silva & Karetsas) steht der BVB bei 9 Punkten aus 4 Spielen. Tippe die verbleibenden 4 Partien (Spieltag 5–8) für die Achtelfinal-Rechnung!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => applyPreset('kovac-top8')}
              className="px-3 py-1.5 rounded-xl bg-[#FDE100] hover:bg-[#ffe733] text-black font-bvb font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Kovač Top-8 Szenario</span>
            </button>
            <button
              onClick={() => applyPreset('realistic')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#FDE100] border border-[#FDE100]/40 font-bvb font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Realistischer Tipp
            </button>
            <button
              onClick={() => applyPreset('reset')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bvb font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Live-Ist-Stand</span>
            </button>
          </div>
        </div>

        {/* Completed 4 UCL Matches Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              md: '1. Spieltag',
              match: 'BVB vs. FC Villarreal',
              score: '3 : 1',
              res: 'SIEG',
              color: 'border-emerald-500/40 text-emerald-300',
              scorers: ['Serhou Guirassy', 'Maximilian Beier', 'Julian Brandt'],
            },
            {
              md: '2. Spieltag',
              match: 'Bodø/Glimt vs. BVB',
              score: '1 : 0',
              res: 'NIEDERLAGE',
              color: 'border-rose-500/40 text-rose-300',
              scorers: ['Gregor Kobel'],
            },
            {
              md: '3. Spieltag',
              match: 'Sabah FK vs. BVB',
              score: '1 : 2',
              res: 'SIEG',
              color: 'border-emerald-500/40 text-emerald-300',
              scorers: ['Serhou Guirassy', 'Marcel Sabitzer'],
            },
            {
              md: '4. Spieltag (04.11.)',
              match: 'BVB vs. Real Betis',
              score: '2 : 1',
              res: 'SIEG',
              color: 'border-[#FDE100] text-[#FDE100]',
              scorers: ['Fábio Silva', 'Konstantinos Karetsas'],
            },
          ].map((m) => (
            <div key={m.md} className={`p-3 rounded-xl bg-black/50 border ${m.color} flex flex-col justify-between gap-1.5`}>
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
                  <span>{m.md}</span>
                  <span className="font-bold">{m.res}</span>
                </div>
                <div className="text-xs font-bold text-white mt-1">{m.match}</div>
                <div className="text-base font-black font-mono text-[#FDE100] mt-0.5">{m.score}</div>
              </div>
              {onSelectPlayer && (
                <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/80">
                  {m.scorers.map((player) => (
                    <button
                      key={player}
                      onClick={() => onSelectPlayer(player)}
                      className="px-1.5 py-0.5 rounded bg-[#FDE100]/15 hover:bg-[#FDE100] text-[#FDE100] hover:text-black border border-[#FDE100]/30 text-[10px] font-bold transition-all cursor-pointer"
                      title={`Kader-Profil von ${player} anzeigen`}
                    >
                      ⚽ {player.split(' ').slice(-1)[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Simulator for Matchdays 5 to 8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {fixtures.map((fix) => (
            <div
              key={fix.id}
              className="p-3.5 rounded-xl bg-[#0d1017] border border-slate-800 hover:border-[#FDE100]/50 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-[#FDE100]/10 text-[#FDE100] font-bold">
                  {fix.matchday}. Spieltag ({fix.isHome ? 'HEIM' : 'AUSWÄRTS'})
                </span>
                <span>{fix.dateStr.split('·')[0]}</span>
              </div>

              <div className="text-xs font-bold text-white font-bvb tracking-wide">
                {fix.isHome ? `Borussia Dortmund vs. ${fix.opponent}` : `${fix.opponent} vs. Borussia Dortmund`}
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#FDE100] font-bvb">BVB</span>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    placeholder="-"
                    value={fix.bvbScore === null ? '' : fix.bvbScore}
                    onChange={(e) => handleScoreChange(fix.id, 'bvb', e.target.value)}
                    className="w-12 h-8 rounded-lg bg-black border border-[#FDE100]/50 text-center font-mono font-black text-[#FDE100] text-sm focus:outline-none focus:ring-2 focus:ring-[#FDE100]"
                  />
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={15}
                    placeholder="-"
                    value={fix.oppScore === null ? '' : fix.oppScore}
                    onChange={(e) => handleScoreChange(fix.id, 'opp', e.target.value)}
                    className="w-12 h-8 rounded-lg bg-black border border-slate-700 text-center font-mono font-black text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FDE100]"
                  />
                  <span className="text-xs font-bold text-slate-300 font-bvb truncate max-w-[70px]">
                    {fix.opponent.replace('FC ', '')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 36-Team UEFA Champions League Table */}
      <div className="bg-[#101217] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-[#FDE100]" />
            <h3 className="font-bvb font-bold text-white text-base tracking-wide uppercase">
              UEFA CHAMPIONS LEAGUE 2026/27 · 36ER-GESAMTTABELLE (LIGAPHASE)
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Platz 1–8: Direktes Achtelfinale
            </span>
            <span className="flex items-center gap-1.5 text-sky-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
              Platz 9–24: K.o.-Playoffs
            </span>
            <span className="flex items-center gap-1.5 text-rose-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              Platz 25–36: Ausgeschieden
            </span>
            <button
              onClick={fetchLiveUclStandings}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#FDE100] font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync ({lastSynced})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4">Verein</th>
                <th className="py-3 px-3 text-center">Sp.</th>
                <th className="py-3 px-3 text-center">S</th>
                <th className="py-3 px-3 text-center">U</th>
                <th className="py-3 px-3 text-center">N</th>
                <th className="py-3 px-3 text-center">Tore</th>
                <th className="py-3 px-3 text-center">Diff.</th>
                <th className="py-3 px-4 text-right">Punkte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {simulatedTable.map((row) => {
                const isTop8 = row.rank <= 8;
                const isPlayoff = row.rank >= 9 && row.rank <= 24;
                const rowBorder =
                  row.rank === 8
                    ? 'border-b-2 border-emerald-500/70'
                    : row.rank === 24
                    ? 'border-b-2 border-sky-500/70'
                    : '';

                return (
                  <tr
                    key={row.teamId}
                    className={`transition-colors ${rowBorder} ${
                      row.isBVB
                        ? 'bg-[#FDE100]/15 hover:bg-[#FDE100]/25 font-bold'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono text-xs">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold ${
                          row.isBVB
                            ? 'bg-[#FDE100] text-black shadow-sm'
                            : isTop8
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isPlayoff
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {row.isBVB && (
                          <OfficialBvbLogo className="w-6 h-6 shrink-0 drop-shadow-[0_0_6px_rgba(253,225,0,0.35)]" />
                        )}
                        <span className={row.isBVB ? 'text-[#FDE100] font-extrabold font-bvb text-base' : 'text-slate-200'}>
                          {row.teamName}
                        </span>
                        {row.isBVB && (
                          <span className="px-2 py-0.5 rounded bg-[#FDE100] text-black font-mono text-[10px] font-extrabold">
                            {row.rank <= 8 ? 'DIREKT ACHTELFINALE' : row.rank <= 24 ? 'PLAYOFFS' : 'KRITISCH'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">{row.played}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400">{row.won}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-400">{row.draw}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-400">{row.lost}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                      {row.goalsFor}:{row.goalsAgainst}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={row.goalDiff > 0 ? 'text-emerald-400' : row.goalDiff < 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-base">
                      <span className={row.isBVB ? 'text-[#FDE100]' : 'text-white'}>{row.points}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
