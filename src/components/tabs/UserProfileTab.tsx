import React, { useState } from 'react';
import { UserBVBProfile, getUserProfile, saveUserProfile } from '../../utils/userProfile';
import {
  User,
  Bell,
  Volume2,
  Shield,
  Laptop,
  Cpu,
  Check,
  Save,
  Trophy,
  Award,
  RotateCw,
  QrCode,
  Crown,
  Sparkles,
  Unlock,
  Lock,
  X,
  MapPin
} from 'lucide-react';
import { BVB_SQUAD_DATA } from '../../data/bvbSquadData';
import { playStadiumCheerSound } from '../../utils/cheerSound';

interface UserProfileTabProps {
  profile: UserBVBProfile;
  setProfile: (p: UserBVBProfile) => void;
  osPreference: 'windows' | 'cachyos';
  setOsPreference: (os: 'windows' | 'cachyos') => void;
}

export interface BVBBadge {
  id: string;
  title: string;
  description: string;
  category: 'Stadion' | 'Community' | 'Geschichte' | 'Client';
  icon: string;
  unlockedAt?: string;
  progressCurrent?: number;
  progressTotal?: number;
}

export const BVB_ACHIEVEMENTS: BVBBadge[] = [
  {
    id: 'echte-liebe-1909',
    title: 'Echte Liebe 1909',
    description: 'Offizielles Gründungsmitglied des BVB Desktop Fan-Clients. Schwarzgelb im Herzen!',
    category: 'Community',
    icon: '💛',
    unlockedAt: '19.12.1909',
  },
  {
    id: 'suedtribuene-legende',
    title: 'Südtribünen-Legende',
    description: 'Über 50 Live-Spiele im Tempel mitgesungen. Der gelbe Herzschlag Westfalens.',
    category: 'Stadion',
    icon: '🚩',
    unlockedAt: '04.05.2024',
  },
  {
    id: 'gesangssicher',
    title: 'Gesangssicher',
    description: 'Alle BVB-Fangesänge & Stadion-Jubel im Audio-Player abgespielt.',
    category: 'Stadion',
    icon: '🎵',
    unlockedAt: '12.08.2024',
  },
  {
    id: 'derby-held',
    title: 'Derby-Sieger 2024',
    description: 'Live-Ticker beim Reviersieg verfolgt und den Siegestreffer im Fan-Client gefeiert.',
    category: 'Stadion',
    icon: '🏆',
    unlockedAt: '25.10.2024',
  },
  {
    id: 'archivar-09',
    title: 'BVB Archivar',
    description: 'Den "Heute vor X Jahren" News-Rückblick im Newsarchiv erkundet.',
    category: 'Geschichte',
    icon: '📜',
    unlockedAt: '01.11.2024',
  },
  {
    id: 'app-pwa-pioneer',
    title: 'Pioneer 09',
    description: 'BVB Fan-Client v1.909 auf CachyOS Linux, Windows oder Android installiert.',
    category: 'Client',
    icon: '⚡',
    unlockedAt: '10.11.2024',
  },
  {
    id: 'champions-dream',
    title: 'Europapokal-Reisender',
    description: '3 Auswärtssiege in der Königsklasse im Live-Ticker mitverfolgt.',
    category: 'Geschichte',
    icon: '⭐',
    progressCurrent: 2,
    progressTotal: 3,
  },
  {
    id: 'dauerkarte-gold',
    title: 'Virtuelle Dauerkarte',
    description: '100 regelmäßige Logins im BVB Desktop Client in einer Saison.',
    category: 'Client',
    icon: '🎫',
    progressCurrent: 74,
    progressTotal: 100,
  },
];

const FAN_RANKS = [
  'Südtribünen-Legende',
  'Schwarzgelber Stammgast',
  'Tempel-Stammgast',
  'Dortmunder Junge',
  'BVB-Mitglied seit 1909',
  'Borsigplatz-Pionier',
];

const STADIUM_BLOCKS = [
  'Block 13 (Südtribüne)',
  'Block 12 (Südtribüne)',
  'Block 82 (Haupttribüne)',
  'Block 34 (Nordtribüne)',
  'Stehplatz Gelbe Wand',
  'VIP-Lounge Signal Iduna Park',
];

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  profile,
  setProfile,
  osPreference,
  setOsPreference,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BVBBadge | null>(null);

  const favPlayer = BVB_SQUAD_DATA.find((p) => p.id === profile.favoritePlayerId) || BVB_SQUAD_DATA[0];

  const unlockedIds = profile.unlockedBadgeIds || ['echte-liebe-1909', 'suedtribuene-legende', 'gesangssicher', 'derby-held', 'archivar-09', 'app-pwa-pioneer'];
  const unlockedCount = BVB_ACHIEVEMENTS.filter((b) => unlockedIds.includes(b.id)).length;
  const totalCount = BVB_ACHIEVEMENTS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const handleSave = () => {
    saveUserProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleToggleCat = (cat: keyof UserBVBProfile['notifyCategories']) => {
    const updated = {
      ...profile,
      notifyCategories: {
        ...profile.notifyCategories,
        [cat]: !profile.notifyCategories[cat],
      },
    };
    setProfile(updated);
  };

  const filteredBadges = BVB_ACHIEVEMENTS.filter((badge) => {
    const isUnlocked = unlockedIds.includes(badge.id);
    if (filterCategory === 'unlocked') return isUnlocked;
    if (filterCategory === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner & Save button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.avatarUrl}
              alt="User Avatar"
              className="w-16 h-16 rounded-full border-2 border-[#FDE100] object-cover shadow-xl"
            />
            <span className="absolute -bottom-1 -right-1 p-1 bg-[#FDE100] text-black rounded-full shadow-md" title="Offizielles BVB Fan Profil">
              <Crown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white uppercase font-bvb tracking-wide">
                {profile.username}
              </h2>
              <span className="px-2 py-0.5 text-[10px] bg-[#FDE100]/15 text-[#FDE100] border border-[#FDE100]/40 font-mono font-bold rounded">
                {profile.fanRank || 'Südtribünen-Legende'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
              <span>Mitglieds-Nr: <strong className="text-white">{profile.memberNumber}</strong></span>
              <span>•</span>
              <span>{profile.favoriteBlock || 'Block 13 (Südtribüne)'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#FDE100] text-black font-extrabold text-xs rounded-xl hover:bg-[#ffe733] active:scale-95 transition-all flex items-center gap-2 font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/20 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-black" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Gespeichert!' : 'Einstellungen Speichern'}
        </button>
      </div>

      {/* SECTION 1: DIGITAL BVB MEMBER ID CARD (3D FLIP CARD) */}
      <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#FDE100]" />
              Digitaler BVB 09 Mitgliedsausweis
            </h3>
            <p className="text-xs text-slate-400">
              Interaktiver 3D-Ausweis für BVB-Mitglieder. Klicke auf die Karte oder den Button, um die Rückseite zu betrachten!
            </p>
          </div>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#FDE100] border border-[#FDE100]/40 text-xs font-bvb uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            {isFlipped ? 'Vorderseite anzeigen' : 'Karte wenden (3D Flip)'}
          </button>
        </div>

        {/* 3D Card Container */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
          {/* Flip Perspective Wrapper */}
          <div className="w-full max-w-[440px] h-[260px] [perspective:1000px] cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div
              className={`relative w-full h-full rounded-2xl shadow-2xl transition-all duration-700 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT SIDE */}
              <div className="absolute inset-0 w-full h-full rounded-2xl p-6 bg-gradient-to-br from-[#1c1d22] via-[#121316] to-[#0a0a0c] border-2 border-[#FDE100]/60 text-white flex flex-col justify-between overflow-hidden shadow-2xl [backface-visibility:hidden]">
                {/* Hologram metallic shine overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FDE100]/20 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Top Header: Crest & Chip */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#FDE100] flex items-center justify-center font-black text-black font-bvb border-2 border-black shadow-md text-sm">
                      BVB
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#FDE100] tracking-widest font-bvb uppercase">
                        BALLSPIELVEREIN BORUSSIA
                      </div>
                      <div className="text-[10px] text-slate-300 uppercase tracking-wider font-mono">
                        DORTMUND 1909 e.V.
                      </div>
                    </div>
                  </div>

                  {/* Golden Smart Card Chip */}
                  <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/80 shadow-md flex items-center justify-center relative overflow-hidden">
                    <div className="w-full h-full grid grid-cols-2 gap-0.5 p-1 opacity-70">
                      <div className="border-r border-b border-amber-800" />
                      <div className="border-b border-amber-800" />
                      <div className="border-r border-amber-800" />
                      <div className="border-amber-800" />
                    </div>
                  </div>
                </div>

                {/* Middle: User Info & Avatar */}
                <div className="flex items-center gap-4 z-10 my-1">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-14 h-14 rounded-full border-2 border-[#FDE100] object-cover shadow-lg"
                  />
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-[#FDE100] uppercase font-mono tracking-widest">
                      MITGLIEDSNAMEN & FAN-RANG
                    </div>
                    <div className="text-lg font-black text-white font-bvb tracking-wide uppercase leading-tight drop-shadow-md">
                      {profile.username}
                    </div>
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FDE100]" />
                      {profile.fanRank}
                    </div>
                  </div>
                </div>

                {/* Bottom Details & Barcode */}
                <div className="z-10 space-y-2 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">Mitglieds-Nr.</span>
                      <span className="text-[#FDE100] font-bold">{profile.memberNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">Seit</span>
                      <span className="text-slate-200 font-bold">{profile.memberSince}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] uppercase font-sans">Lieblingsspieler</span>
                      <span className="text-[#FDE100] font-bold">#{favPlayer.number} {favPlayer.name.split(' ').pop()}</span>
                    </div>
                  </div>

                  {/* Barcode Graphic */}
                  <div className="w-full h-5 bg-white/95 rounded px-2 py-0.5 flex items-center justify-between overflow-hidden shadow-inner">
                    <div className="w-full h-full flex items-center gap-[2px]">
                      {[4,2,5,1,3,6,2,4,1,5,3,2,6,1,4,2,5,3,2,4,1,5,3,6,2,4,1,5,2,4,3,1,5,2,4,3,1].map((w, idx) => (
                        <span key={idx} className="h-full bg-black" style={{ width: `${w * 1.5}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 w-full h-full rounded-2xl p-6 bg-gradient-to-br from-[#14161b] via-[#0d0e12] to-[#050608] border-2 border-amber-500/50 text-white flex flex-col justify-between overflow-hidden shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                {/* Background Watermark Crest */}
                <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl font-black font-bvb text-[#FDE100] pointer-events-none select-none">
                  BVB
                </div>

                {/* Back Top */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 z-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#FDE100]" />
                    <span className="text-xs font-bold text-white font-bvb uppercase tracking-wider">
                      SIGNAL IDUNA PARK • SEKTOR & STAMMPLATZ
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-[#FDE100]/20 text-[#FDE100] font-mono font-bold rounded">
                    ECHTE LIEBE
                  </span>
                </div>

                {/* Back Middle: Sector & QR */}
                <div className="flex items-center justify-between gap-4 my-2 z-10">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Stadionblock</span>
                      <span className="text-sm font-bold text-[#FDE100] font-bvb">{profile.favoriteBlock}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Status & Gültigkeit</span>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Aktiviert • Saison 2024/25
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 max-w-[200px]">
                      Dieser Ausweis ist im BVB Fan-Client verifiziert. Berechtigt zur Teilnahme an Fan-Aktionen.
                    </p>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="p-2 bg-white rounded-xl shadow-lg border-2 border-[#FDE100] flex flex-col items-center gap-1">
                    <QrCode className="w-16 h-16 text-black" />
                    <span className="text-[8px] text-black font-mono font-bold">VERIFIED-09</span>
                  </div>
                </div>

                {/* Back Bottom Disclaimer */}
                <div className="text-[9px] text-slate-500 font-mono border-t border-slate-800/80 pt-2 flex items-center justify-between z-10">
                  <span>BORUSSIA DORTMUND FAN CLIENT V1.909</span>
                  <span>TEMPEL DORTMUND</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Member Card Fields Customizer */}
          <div className="w-full max-w-sm p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#FDE100]" />
              Ausweis-Daten Anpassen
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Fan-Rang / Titel auf Ausweis:</label>
                <select
                  value={profile.fanRank || 'Südtribünen-Legende'}
                  onChange={(e) => setProfile({ ...profile, fanRank: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bvb text-xs focus:border-[#FDE100] focus:outline-none"
                >
                  {FAN_RANKS.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mitglieds-Nummer:</label>
                <input
                  type="text"
                  value={profile.memberNumber || 'BVB-09-81365'}
                  onChange={(e) => setProfile({ ...profile, memberNumber: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-[#FDE100] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Stadion-Sektor / Block:</label>
                <select
                  value={profile.favoriteBlock || 'Block 13 (Südtribüne)'}
                  onChange={(e) => setProfile({ ...profile, favoriteBlock: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bvb text-xs focus:border-[#FDE100] focus:outline-none"
                >
                  {STADIUM_BLOCKS.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: BVB FAN ACHIEVEMENTS & TROPHY CABINET (TROPHÄEN-SCHRANK) */}
      <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#FDE100]" />
              BVB Fan Trophäen- & Badge-Schrank
            </h3>
            <p className="text-xs text-slate-400">
              Sammele einzigartige BVB-Erfolge, schalte Fan-Badges frei und verfolge deinen Fortschritt.
            </p>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-bvb uppercase tracking-wider transition-all cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alle ({totalCount})
            </button>
            <button
              onClick={() => setFilterCategory('unlocked')}
              className={`px-3 py-1.5 rounded-lg font-bvb uppercase tracking-wider transition-all cursor-pointer ${
                filterCategory === 'unlocked'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Freigeschaltet ({unlockedCount})
            </button>
            <button
              onClick={() => setFilterCategory('locked')}
              className={`px-3 py-1.5 rounded-lg font-bvb uppercase tracking-wider transition-all cursor-pointer ${
                filterCategory === 'locked'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gesperrt ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        {/* Progress Bar Summary */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FDE100]" />
              Gesamter Fan-Fortschritt:
            </span>
            <span className="font-mono font-bold text-[#FDE100]">
              {unlockedCount} von {totalCount} Abzeichen ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-[#FDE100] to-amber-300 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(253,225,0,0.5)]"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Trophies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-[#191b22] to-[#111317] border-[#FDE100]/40 hover:border-[#FDE100] hover:shadow-[0_0_20px_rgba(253,225,0,0.2)]'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-90 hover:border-slate-700'
                }`}
              >
                {/* Category Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[9px] bg-slate-800 text-slate-300 rounded font-mono uppercase">
                    {badge.category}
                  </span>
                  {isUnlocked ? (
                    <span title="Freigeschaltet">
                      <Unlock className="w-3.5 h-3.5 text-[#FDE100]" />
                    </span>
                  ) : (
                    <span title="Noch gesperrt">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    </span>
                  )}
                </div>

                {/* Badge Icon & Graphic */}
                <div className="my-3 flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border transition-transform duration-300 group-hover:scale-110 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-[#FDE100] to-amber-500 text-black border-yellow-300 shadow-[#FDE100]/20'
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <div>
                    <h4
                      className={`font-extrabold text-sm font-bvb uppercase tracking-wider ${
                        isUnlocked ? 'text-white group-hover:text-[#FDE100]' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress or Unlock Date */}
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-center">
                  {isUnlocked ? (
                    <span className="text-[#FDE100] font-semibold flex items-center justify-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Freigeschaltet ({badge.unlockedAt})
                    </span>
                  ) : badge.progressCurrent && badge.progressTotal ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Fortschritt:</span>
                        <span>{badge.progressCurrent} / {badge.progressTotal}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(badge.progressCurrent / badge.progressTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Noch nicht freigeschaltet</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: PRESERVED SETTINGS (Lieblingsspieler, Audio, Notification, OS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Favorite Player & Feed Customization */}
        <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-lg font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
            <User className="w-5 h-5 text-[#FDE100]" />
            Lieblingsspieler & News-Feed
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Lieblingsspieler auswählen:</label>
              <select
                value={profile.favoritePlayerId}
                onChange={(e) => setProfile({ ...profile, favoritePlayerId: e.target.value })}
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
              <label className="block text-slate-400 mb-1 font-sans">Fan-Name / Username:</label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-[#FDE100]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Notification & Audio Cheer Settings */}
        <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-4 shadow-lg">
          <h3 className="text-lg font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FDE100]" />
            Benachrichtigungen & Stadion-Jubel Sound
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span>Push-Benachrichtigungen aktivieren</span>
              <input
                type="checkbox"
                checked={profile.notificationsEnabled}
                onChange={(e) => setProfile({ ...profile, notificationsEnabled: e.target.checked })}
                className="w-4 h-4 accent-[#FDE100] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 font-sans">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#FDE100]" />
                Stadion-Jubel Sound bei Eilmeldung
              </span>
              <button
                onClick={playStadiumCheerSound}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-[#FDE100] hover:text-black font-bvb uppercase rounded transition-colors"
              >
                Testen
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-semibold">Kategorien-Filter:</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(profile.notifyCategories).map(([cat, enabled]) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800 cursor-pointer text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleToggleCat(cat as keyof UserBVBProfile['notifyCategories'])}
                      className="accent-[#FDE100]"
                    />
                    <span className="capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: OS Frame Customization (Only visible in Web-Vorschau, hidden in installed program) */}
        {typeof window !== 'undefined' &&
          window.location.protocol !== 'file:' &&
          !(window as any).__BVB_STANDALONE_APP__ &&
          !window.location.search.includes('installed=true') && (
            <div className="p-6 rounded-2xl bg-[#111318] border border-slate-800 space-y-4 shadow-lg md:col-span-2">
              <h3 className="text-lg font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
                <Laptop className="w-5 h-5 text-[#FDE100]" />
                Web-Vorschau Fenstertyp (CachyOS vs Windows 10/11)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setOsPreference('cachyos');
                    setProfile({ ...profile, osPreference: 'cachyos' });
                  }}
                  className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                    osPreference === 'cachyos'
                      ? 'bg-teal-950/40 border-teal-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-teal-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      CachyOS (Arch Linux)
                    </span>
                    {osPreference === 'cachyos' && <Check className="w-4 h-4 text-teal-400" />}
                  </div>
                  <p className="text-xs text-slate-300">
                    Linux KDE/Hyprland Runden-Schaltflächen, BBORE-Kernel Unterstützung & Terminal-Shortcut-Leiste.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setOsPreference('windows');
                    setProfile({ ...profile, osPreference: 'windows' });
                  }}
                  className={`p-4 rounded-xl border text-left transition-all space-y-2 ${
                    osPreference === 'windows'
                      ? 'bg-[#FDE100]/15 border-[#FDE100] text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-[#FDE100] flex items-center gap-1.5">
                      <Laptop className="w-4 h-4 text-[#FDE100]" />
                      Windows 10 / 11 Enterprise
                    </span>
                    {osPreference === 'windows' && <Check className="w-4 h-4 text-[#FDE100]" />}
                  </div>
                  <p className="text-xs text-slate-300">
                    Segoe-Symbole, Acrylic Dark Glass Titlebar & Windows Toast Notification Audio-Einbindung.
                  </p>
                </button>
              </div>
            </div>
          )}
      </div>

      {/* DETAIL MODAL FOR SELECTED TROPHY / BADGE */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14161c] border-2 border-[#FDE100] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl border ${
                  unlockedIds.includes(selectedBadge.id)
                    ? 'bg-gradient-to-br from-[#FDE100] to-amber-500 text-black border-yellow-300 shadow-[#FDE100]/30'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {selectedBadge.icon}
              </div>

              <div>
                <span className="px-2.5 py-0.5 text-[10px] bg-[#FDE100]/20 text-[#FDE100] border border-[#FDE100]/40 font-mono font-bold rounded uppercase">
                  {selectedBadge.category}
                </span>
                <h3 className="text-xl font-black text-white font-bvb uppercase tracking-wide mt-1">
                  {selectedBadge.title}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                {selectedBadge.description}
              </p>
            </div>

            <div className="space-y-3">
              {unlockedIds.includes(selectedBadge.id) ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                  <span className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Freigeschaltet am {selectedBadge.unlockedAt || '19.12.1909'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Dieses Abzeichen schmückt dein digitales BVB-Mitgliedsprofil.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-center space-y-1">
                  <span className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Noch nicht freigeschaltet
                  </span>
                  {selectedBadge.progressCurrent && selectedBadge.progressTotal && (
                    <div className="space-y-1 text-left pt-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>Aktueller Fortschritt:</span>
                        <span className="font-mono font-bold text-[#FDE100]">{selectedBadge.progressCurrent} / {selectedBadge.progressTotal}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(selectedBadge.progressCurrent / selectedBadge.progressTotal) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs font-bvb uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
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
