import React, { useState, useEffect } from 'react';
import { Vote, CheckCircle2, Users, MapPin, Trophy, Sparkles, Send } from 'lucide-react';
import { getOpenLigaBvbMatches } from '../../utils/openLigaService';

export const MatchdayPollsTab: React.FC = () => {
  const [selectedFormation, setSelectedFormation] = useState<string>('4-3-3');
  const [votedResult, setVotedResult] = useState<string | null>('win');
  const [votedMotm, setVotedMotm] = useState<string | null>('Serhou Guirassy');
  const [votesCount, setVotesCount] = useState<number>(3482);
  const [nextOpponent, setNextOpponent] = useState<string>('SV 07 Elversberg (Sa, 07.11.2026 · 15:30 Uhr)');

  useEffect(() => {
    getOpenLigaBvbMatches().then((matches) => {
      const upcoming = matches
        .filter((m) => !m.isFinished)
        .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime())[0];
      if (upcoming) {
        setNextOpponent(`${upcoming.opponentName} (${upcoming.isHome ? 'Heim' : 'Auswärts'} · ${upcoming.dateStr}, ${upcoming.timeStr})`);
      }
    });
  }, []);

  const handleVoteResult = (res: string) => {
    setVotedResult(res);
    setVotesCount(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white uppercase font-bvb tracking-wide flex items-center gap-2">
            <Vote className="w-6 h-6 text-[#FDE100]" />
            Interaktive Fan-Umfragen & Wunschelf-Planer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Nächstes Pflichtspiel: <strong className="text-[#FDE100]">{nextOpponent}</strong> — Stimme ab über Taktik, Aufstellung & Man of the Match.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          {votesCount.toLocaleString('de-DE')} abgegebene Stimmen
        </div>
      </div>

      {/* Grid: Tactical Pitch & Poll Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive Tactical Pitch Preview (Wunschelf) */}
        <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#FDE100] uppercase font-bvb tracking-wider">
              Fan-Wunschelf vs. {nextOpponent.split(' (')[0]}
            </h3>
            <span className="text-xs text-slate-400 font-mono">Formation: {selectedFormation}</span>
          </div>

          {/* Tactical Pitch Visualizer */}
          <div className="relative w-full aspect-[4/3] rounded-xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 border-2 border-emerald-500/40 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Pitch Lines */}
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/30" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-emerald-400/30" />
            <div className="absolute inset-x-1/4 top-0 h-12 border-b border-x border-emerald-400/30 rounded-b" />
            <div className="absolute inset-x-1/4 bottom-0 h-12 border-t border-x border-emerald-400/30 rounded-t" />

            {/* Attack Row */}
            <div className="relative z-10 flex justify-around items-center pt-2">
              <div className="px-2.5 py-1 rounded bg-black/80 border border-[#FDE100] text-[11px] font-bold text-[#FDE100] font-bvb text-center shadow">
                Beier #14 (LF)
              </div>
              <div className="px-2.5 py-1 rounded bg-[#FDE100] text-black font-extrabold text-[11px] font-bvb text-center shadow-lg">
                Guirassy #9 (ST)
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-[#FDE100] text-[11px] font-bold text-[#FDE100] font-bvb text-center shadow">
                Fábio Silva #21 (RF)
              </div>
            </div>

            {/* Midfield Row */}
            <div className="relative z-10 flex justify-around items-center">
              <div className="px-2.5 py-1 rounded bg-black/80 border border-slate-700 text-[11px] font-bold text-white font-bvb text-center">
                Karetsas #19 (OM)
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-slate-700 text-[11px] font-bold text-white font-bvb text-center">
                Bellingham #7 (ZM)
              </div>
              <div className="px-2.5 py-1 rounded bg-black/80 border border-slate-700 text-[11px] font-bold text-white font-bvb text-center">
                Veerman #25 (DM)
              </div>
            </div>

            {/* Defense Row */}
            <div className="relative z-10 flex justify-around items-center">
              <div className="px-2 py-1 rounded bg-black/80 border border-slate-700 text-[10px] font-bold text-white font-bvb">
                Svensson #24 (LV)
              </div>
              <div className="px-2 py-1 rounded bg-black/80 border border-slate-700 text-[10px] font-bold text-white font-bvb">
                Schlotterbeck #4 (IV)
              </div>
              <div className="px-2 py-1 rounded bg-black/80 border border-slate-700 text-[10px] font-bold text-white font-bvb">
                Anton #3 (IV)
              </div>
              <div className="px-2 py-1 rounded bg-black/80 border border-slate-700 text-[10px] font-bold text-white font-bvb">
                Ryerson #26 (RV)
              </div>
            </div>

            {/* Goalkeeper */}
            <div className="relative z-10 flex justify-center pb-1">
              <div className="px-3 py-1 rounded bg-[#FDE100] text-black font-extrabold text-xs font-bvb shadow-lg">
                Kobel #1 (TW)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fan Polls */}
        <div className="space-y-4">
          {/* Poll 1: Match Outcome */}
          <div className="p-5 rounded-2xl bg-[#111318] border border-slate-800 space-y-3 shadow-lg">
            <h4 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FDE100]" />
              Umfrage: Wie geht das Spiel gegen {nextOpponent.split(' (')[0]} aus?
            </h4>

            <div className="space-y-2">
              <button
                onClick={() => handleVoteResult('win')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  votedResult === 'win'
                    ? 'bg-[#FDE100]/15 border-[#FDE100] text-[#FDE100] font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>Sieg BVB Borussia Dortmund</span>
                <span className="font-mono font-bold">84%</span>
              </button>

              <button
                onClick={() => handleVoteResult('draw')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  votedResult === 'draw'
                    ? 'bg-[#FDE100]/15 border-[#FDE100] text-[#FDE100] font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>Unentschieden</span>
                <span className="font-mono font-bold">11%</span>
              </button>

              <button
                onClick={() => handleVoteResult('loss')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  votedResult === 'loss'
                    ? 'bg-[#FDE100]/15 border-[#FDE100] text-[#FDE100] font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>Niederlage</span>
                <span className="font-mono font-bold">5%</span>
              </button>
            </div>
          </div>

          {/* Poll 2: Man of the Match Candidate */}
          <div className="p-5 rounded-2xl bg-[#111318] border border-slate-800 space-y-3 shadow-lg">
            <h4 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FDE100]" />
              Man of the Match Prognose
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Serhou Guirassy', 'Konstantinos Karetsas', 'Fábio Silva', 'Nico Schlotterbeck'].map((p) => (
                <button
                  key={p}
                  onClick={() => setVotedMotm(p)}
                  className={`p-2.5 rounded-xl border font-bvb uppercase tracking-wider transition-all ${
                    votedMotm === p
                      ? 'bg-[#FDE100] text-black font-extrabold border-[#FDE100]'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
