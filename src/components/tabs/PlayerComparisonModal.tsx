import React, { useState } from 'react';
import { BVB_SQUAD_DATA, PlayerStats } from '../../data/bvbSquadData';
import { ArrowRightLeft, X, Sparkles, TrendingUp, Award, Zap, ShieldCheck } from 'lucide-react';

interface PlayerComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerComparisonModal: React.FC<PlayerComparisonModalProps> = ({ isOpen, onClose }) => {
  const [player1Id, setPlayer1Id] = useState<string>('p-14'); // Guirassy
  const [player2Id, setPlayer2Id] = useState<string>('p-15'); // Gittens

  if (!isOpen) return null;

  const player1 = BVB_SQUAD_DATA.find((p) => p.id === player1Id) || BVB_SQUAD_DATA[0];
  const player2 = BVB_SQUAD_DATA.find((p) => p.id === player2Id) || BVB_SQUAD_DATA[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-[#111318] border border-[#FDE100]/30 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDE100] text-black font-extrabold flex items-center justify-center font-bvb text-xl shadow-lg">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase font-bvb tracking-wide">
                Transfermarkt.de Spieler-Vergleich
              </h3>
              <p className="text-xs text-slate-400">
                Vergleiche zwei BVB-Akteure nach Marktwerten, Leistungsdaten & Vertragslaufzeiten.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Spieler 1 wählen:</label>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bvb text-sm focus:outline-none focus:border-[#FDE100]"
            >
              {BVB_SQUAD_DATA.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} ({p.subPosition})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Spieler 2 wählen:</label>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-bvb text-sm focus:outline-none focus:border-[#FDE100]"
            >
              {BVB_SQUAD_DATA.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name} ({p.subPosition})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Comparison Matrix */}
        <div className="grid grid-cols-3 gap-4 text-center items-center p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          {/* Player 1 Card */}
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FDE100] text-black font-extrabold text-lg flex items-center justify-center font-bvb shadow-md">
              #{player1.number}
            </div>
            <h4 className="font-bold text-white font-bvb text-base">{player1.name}</h4>
            <div className="text-[#FDE100] font-bold font-bvb text-sm">{player1.marketValueFormatted}</div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center font-extrabold text-slate-500 font-bvb text-xl">
            VS
          </div>

          {/* Player 2 Card */}
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 text-white font-extrabold text-lg flex items-center justify-center font-bvb border border-slate-700">
              #{player2.number}
            </div>
            <h4 className="font-bold text-white font-bvb text-base">{player2.name}</h4>
            <div className="text-[#FDE100] font-bold font-bvb text-sm">{player2.marketValueFormatted}</div>
          </div>
        </div>

        {/* Detailed Attribute Comparison Rows */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-3 text-center">
            <span className="font-bold text-white">{player1.age} Jahre</span>
            <span className="text-slate-400 font-semibold uppercase">Alter</span>
            <span className="font-bold text-white">{player2.age} Jahre</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-3 text-center">
            <span className="font-bold text-[#FDE100] font-mono">{player1.goals}</span>
            <span className="text-slate-400 font-semibold uppercase">Tore Saison</span>
            <span className="font-bold text-[#FDE100] font-mono">{player2.goals}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-3 text-center">
            <span className="font-bold text-emerald-400 font-mono">{player1.assists}</span>
            <span className="text-slate-400 font-semibold uppercase">Vorlagen</span>
            <span className="font-bold text-emerald-400 font-mono">{player2.assists}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-3 text-center">
            <span className="font-mono text-slate-300">{player1.minutesPlayed}'</span>
            <span className="text-slate-400 font-semibold uppercase">Spielminuten</span>
            <span className="font-mono text-slate-300">{player2.minutesPlayed}'</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 grid grid-cols-3 text-center">
            <span className="text-slate-300">{player1.contractUntil}</span>
            <span className="text-slate-400 font-semibold uppercase">Vertrag bis</span>
            <span className="text-slate-300">{player2.contractUntil}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs font-bvb uppercase"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
