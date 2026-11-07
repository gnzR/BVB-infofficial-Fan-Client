import React, { useState } from 'react';
import { UserBVBProfile, getUserProfile, saveUserProfile } from '../../utils/userProfile';
import { User, Bell, Volume2, Shield, Laptop, Cpu, Check, Save } from 'lucide-react';
import { BVB_SQUAD_DATA } from '../../data/bvbSquadData';
import { playStadiumCheerSound } from '../../utils/cheerSound';

interface UserProfileTabProps {
  profile: UserBVBProfile;
  setProfile: (p: UserBVBProfile) => void;
  osPreference: 'windows' | 'cachyos';
  setOsPreference: (os: 'windows' | 'cachyos') => void;
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  profile,
  setProfile,
  osPreference,
  setOsPreference,
}) => {
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt="User Avatar"
            className="w-14 h-14 rounded-full border-2 border-[#FDE100] object-cover shadow-lg"
          />
          <div>
            <h2 className="text-2xl font-bold text-white uppercase font-bvb tracking-wide">
              {profile.username}
            </h2>
            <p className="text-xs text-[#FDE100] font-mono">
              Mitglied der Gelben Wand · Südtribüne Dortmund
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#FDE100] text-black font-extrabold text-xs rounded-lg hover:bg-[#ffe733] transition-all flex items-center gap-2 font-bvb uppercase tracking-wider shadow-md"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-black" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Gespeichert!' : 'Einstellungen Speichern'}
        </button>
      </div>

      {/* Settings Grid */}
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
              <label className="block text-slate-400 mb-1">Fan-Name / Username:</label>
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

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
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
    </div>
  );
};
