import React, { useState } from 'react';
import { PenaltyKingGame } from '../games/PenaltyKingGame';
import { BvbManagerGame } from '../games/BvbManagerGame';
import { Trophy, Gamepad2, Target, Briefcase } from 'lucide-react';

export function BvbGamesTab() {
  const [activeSubTab, setActiveSubTab] = useState<'penalty' | 'manager'>('penalty');

  return (
    <div className="space-y-6">
      {/* SUB-TAB NAVIGATOR */}
      <div className="bg-[#111318] p-2 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('penalty')}
            className={`px-4 py-2 rounded-lg font-bvb uppercase tracking-wider text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'penalty'
                ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Elfmeter-Koenig vor der Suedtribuene</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manager')}
            className={`px-4 py-2 rounded-lg font-bvb uppercase tracking-wider text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'manager'
                ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>BVB-Manager (100-Mio.-Transferfenster)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
          <Gamepad2 className="w-4 h-4 text-[#FDE100]" />
          <span>BVB Fan-Spiele Hub v2.5</span>
        </div>
      </div>

      {/* GAME RENDERER */}
      {activeSubTab === 'penalty' && <PenaltyKingGame />}
      {activeSubTab === 'manager' && <BvbManagerGame />}
    </div>
  );
}
