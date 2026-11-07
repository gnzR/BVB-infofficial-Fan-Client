import React, { useState } from 'react';
import { Volume2, Play, Sparkles, Music, Drum, BellRing, X, Radio } from 'lucide-react';
import { playBVBSoundTrack } from '../utils/soundboardSynth';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChants?: () => void;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({ isOpen, onClose, onNavigateToChants }) => {
  const [activeTrack, setActiveTrack] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePlay = (track: 'goal' | 'anthem' | 'drum' | 'whistle' | 'crowd') => {
    setActiveTrack(track);
    playBVBSoundTrack(track);
    setTimeout(() => setActiveTrack(null), 3000);
  };

  const tracks = [
    {
      id: 'goal' as const,
      name: 'Tor-Jubel & Stadion-Horn',
      desc: 'Extremer Tor-Jubel der Gelben Wand mit Messing-Horn',
      icon: Volume2,
      color: 'bg-[#FDE100] text-black',
    },
    {
      id: 'anthem' as const,
      name: 'BVB Torhymne ("Ole, BVB")',
      desc: 'Synthetisierte Torhymne des BVB nach Treffern',
      icon: Music,
      color: 'bg-amber-400 text-black',
    },
    {
      id: 'drum' as const,
      name: 'Südtribüne Trommel-Rhythmus',
      desc: 'Markante Stadion-Trommel zur Anfeuerung',
      icon: Drum,
      color: 'bg-[#FDE100] text-black',
    },
    {
      id: 'whistle' as const,
      name: 'Schiedsrichter Pfiff',
      desc: 'Doppelter Trillerpfiff des Schiedsrichters',
      icon: BellRing,
      color: 'bg-sky-400 text-black',
    },
    {
      id: 'crowd' as const,
      name: 'Südtribüne Stadion-Atmosphäre',
      desc: 'Brausende Kulisse des Signal Iduna Parks',
      icon: Radio,
      color: 'bg-emerald-400 text-black',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#111318] border border-[#FDE100]/30 rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDE100] text-black font-extrabold flex items-center justify-center font-bvb text-xl shadow-lg">
              09
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase font-bvb tracking-wide flex items-center gap-2">
                Südtribüne Soundboard (Stadion-Klänge)
              </h3>
              <p className="text-xs text-slate-400">
                Spiele Stadion-Jubel, Fan-Gesänge & Schiedsrichter-Pfiffe in Echtzeit ab.
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

        {/* Tracks Grid */}
        <div className="space-y-3">
          {tracks.map((t) => {
            const Icon = t.icon;
            const isPlayingThis = activeTrack === t.id;
            return (
              <div
                key={t.id}
                onClick={() => handlePlay(t.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                  isPlayingThis
                    ? 'bg-[#FDE100]/20 border-[#FDE100] shadow-lg shadow-[#FDE100]/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${t.color} flex items-center justify-center font-bold shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-bvb tracking-wide">{t.name}</h4>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </div>
                </div>

                <button
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg font-bvb uppercase tracking-wider flex items-center gap-1.5 ${
                    isPlayingThis ? 'bg-[#FDE100] text-black animate-pulse' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isPlayingThis ? 'Spielt...' : 'Abspielen'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {onNavigateToChants && (
            <button
              onClick={() => {
                onClose();
                onNavigateToChants();
              }}
              className="px-3.5 py-1.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-lg text-xs font-bvb uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Chant-Studio (Karaoke) öffnen 🎤</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs font-bvb uppercase cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
