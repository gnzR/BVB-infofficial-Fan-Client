import React, { useState } from 'react';
import { InfoModal } from './InfoModal';
import { OfficialBvbLogo } from './OfficialBvbLogo';
import { NetradioPlayer } from './NetradioPlayer';
import { SoundboardModal } from './SoundboardModal';
import { PlayerComparisonModal } from './tabs/PlayerComparisonModal';
import {
  downloadWindowsExeInstaller,
  downloadWindowsPortableZip,
  downloadWindowsUninstaller,
  downloadCachyOSTarPackage,
  downloadCachyOSInstallerScript,
  downloadCachyOSDeinstallerScript,
} from '../utils/downloadHelpers';
import { Info, Minus, Square, X, Volume2, Wifi, WifiOff, Terminal, Download, Sparkles, Bell, Shield, Laptop, Radio, Music, ArrowRightLeft, Cpu, HardDrive, Trash2 } from 'lucide-react';

interface DesktopWindowProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  osPreference: 'windows' | 'cachyos';
  setOsPreference: (os: 'windows' | 'cachyos') => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  unreadNotificationsCount: number;
  onOpenInstallerModal: () => void;
  onReplaySplash: () => void;
}

export const DesktopWindow: React.FC<DesktopWindowProps> = ({
  children,
  activeTab,
  setActiveTab,
  osPreference,
  setOsPreference,
  isOffline,
  setIsOffline,
  unreadNotificationsCount,
  onOpenInstallerModal,
  onReplaySplash,
}) => {
  const [isMaximized, setIsMaximized] = useState<boolean>(true);
  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const isTrueStandaloneApp = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        (window as any).__BVB_STANDALONE_APP__ === true ||
        urlParams.get('installed') === 'true' ||
        window.location.protocol === 'file:' ||
        navigator.userAgent.includes('Electron') ||
        navigator.userAgent.includes('BVB-09')
      );
    } catch {
      return false;
    }
  })();

  const [isInstalledMode, setIsInstalledMode] = useState<boolean>(() => isTrueStandaloneApp);

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* OS WINDOW TITLE BAR (Only shown in Web-Vorschau, completely hidden in the installed program) */}
      {!isInstalledMode && (
      <div className={`flex items-center justify-between px-3 py-1.5 text-xs border-b transition-colors ${
        osPreference === 'cachyos'
          ? 'bg-[#0f1419] border-teal-500/30 text-slate-200'
          : 'bg-[#12141a] border-[#FDE100]/20 text-slate-200'
      }`}>
        {/* Left Zone: OS Badge & Title */}
        <div className="flex items-center gap-2">
          {osPreference === 'cachyos' ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-teal-950/80 border border-teal-500/40 text-teal-300 font-mono text-[11px]">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>CachyOS (Arch v6.11-BORE)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-sans text-[11px]">
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Windows 11 Enterprise x64</span>
            </div>
          )}

          <span className="text-slate-600">|</span>
          <span className="font-bvb font-bold text-slate-200 tracking-wide text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FDE100] shadow-[0_0_8px_#FDE100]" />
            BVB Inofficial Fan Client · <span className="text-[#FDE100] font-mono text-xs">Beta 1.9.0.9</span>
          </span>
        </div>

        {/* Center Zone: Direct Download Buttons & OS Switcher */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Installed Desktop App vs Download Center */}
          <button
            onClick={() => {
              const next = !isInstalledMode;
              setIsInstalledMode(next);
              localStorage.setItem('bvb_installed_mode', next ? 'true' : 'false');
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all flex items-center gap-1.5 ${
              isInstalledMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Klicken zum Umschalten zwischen installierter Desktop-Ansicht und Download-Center"
          >
            <Shield className="w-3 h-3 text-[#FDE100]" />
            <span>{isInstalledMode ? 'Ansicht: Nativ Installiert' : 'Ansicht: Download-Center'}</span>
          </button>

          {/* DIRECT DOWNLOAD BUTTONS IN TITLEBAR (Only in Download Center mode) */}
          {!isInstalledMode ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={downloadCachyOSTarPackage}
                className="px-2.5 py-0.5 bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-black border border-teal-500/40 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1"
                title="Direkt CachyOS Paket bvb-09-cachyos-package.tar.gz herunterladen"
              >
                <Cpu className="w-3 h-3" />
                <span>Download bvb-09-cachyos-package.tar.gz</span>
              </button>

              <button
                onClick={downloadWindowsPortableZip}
                className="px-2.5 py-0.5 bg-[#FDE100] hover:bg-[#ffe733] text-black border border-[#FDE100] rounded text-[11px] font-sans font-extrabold transition-all flex items-center gap-1 shadow-sm"
                title="Direkt BVB-09-Windows-Portable.zip (Lösung 4) herunterladen"
              >
                <Download className="w-3 h-3" />
                <span>Download BVB-09-Windows-Portable.zip</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FDE100]/10 border border-[#FDE100]/30 text-[#FDE100] font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FDE100]" />
              <span>Offline-Engine Aktiv</span>
            </div>
          )}

          {/* System Tray Badge Simulator */}
          <div className="relative">
            <button
              onClick={() => setIsTrayOpen(!isTrayOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-[11px] text-slate-300 font-mono transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tray</span>
              {unreadNotificationsCount > 0 && (
                <span className="px-1 bg-[#FDE100] text-black font-extrabold rounded text-[10px]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Tray Popover Menu */}
            {isTrayOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-[#111318] border border-[#FDE100]/30 rounded-xl shadow-2xl z-50 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-[#FDE100] uppercase font-bvb">BVB Tray Daemon</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Aktiv</span>
                </div>
                <button
                  onClick={downloadCachyOSTarPackage}
                  className="w-full text-left p-2 rounded bg-teal-950/60 hover:bg-teal-900 border border-teal-500/30 text-teal-300 flex items-center justify-between font-mono text-[11px]"
                >
                  <span>bvb-09-cachyos-package.tar.gz</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={downloadWindowsPortableZip}
                  className="w-full text-left p-2 rounded bg-[#FDE100]/20 hover:bg-[#FDE100]/30 border border-[#FDE100]/50 text-[#FDE100] font-bold flex items-center justify-between font-sans text-[11px]"
                >
                  <span>BVB-09-Windows-Portable.zip</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={downloadWindowsExeInstaller}
                  className="w-full text-left p-2 rounded bg-[#FDE100]/10 hover:bg-[#FDE100]/20 border border-[#FDE100]/30 text-[#FDE100] flex items-center justify-between font-sans text-[11px]"
                >
                  <span>BVB-09-Windows-Setup.exe</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* OS Switcher */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setOsPreference('cachyos')}
              className={`px-2.5 py-0.5 rounded-md font-mono transition-colors ${
                osPreference === 'cachyos'
                  ? 'bg-teal-500 text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CachyOS
            </button>
            <button
              onClick={() => setOsPreference('windows')}
              className={`px-2.5 py-0.5 rounded-md font-sans transition-colors ${
                osPreference === 'windows'
                  ? 'bg-[#FDE100] text-black font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Windows 10/11
            </button>
          </div>

          {/* Offline Mode Toggle Simulator */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span>{isOffline ? 'Offline' : 'Online'}</span>
          </button>
        </div>

        {/* Right Zone: Native Window Controls */}
        <div className="flex items-center gap-1">
          {osPreference === 'cachyos' ? (
            <div className="flex items-center gap-1.5 ml-2">
              <button className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors" />
              <button onClick={() => setIsMaximized(!isMaximized)} className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors" />
              <button className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors" />
            </div>
          ) : (
            <div className="flex items-center">
              <button className="px-2.5 py-1 hover:bg-slate-800 text-slate-300 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
              <button onClick={() => setIsMaximized(!isMaximized)} className="px-2.5 py-1 hover:bg-slate-800 text-slate-300 transition-colors"><Square className="w-3 h-3" /></button>
              <button className="px-2.5 py-1 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* TOP BAR CONTRACT - SOLUTION 1: TWO-ROW DESKTOP HEADER (ZERO CLIPPING AT ANY WINDOW SIZE) */}
      <header className="bg-[#111318] border-b border-[#FDE100]/20">
        {/* ROW 1: Brand Logo (Left) + BVB Netradio Player (Center) + System Action Buttons (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-slate-800/80">
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); setActiveTab('ticker'); }}
            className="text-2xl font-black tracking-tight text-[#FDE100] whitespace-nowrap shrink-0 font-bvb flex items-center gap-2.5"
          >
            <OfficialBvbLogo className="w-9 h-9 shrink-0 drop-shadow-[0_0_8px_rgba(253,225,0,0.35)]" />
            <span>BVB INOFFICIAL FAN CLIENT</span>
            <span className="px-2 py-0.5 rounded bg-[#FDE100]/15 border border-[#FDE100]/40 text-[#FDE100] font-mono text-[10px] font-bold tracking-normal">
              Beta 1.9.0.9
            </span>
          </a>

          <div className="flex-1 flex justify-center min-w-[280px]">
            <NetradioPlayer />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-[#FDE100] bg-slate-900 hover:bg-[#FDE100] hover:text-black border border-[#FDE100]/40 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 font-bvb uppercase tracking-wider cursor-pointer"
              title="System-Informationen, Quellen & Entwickler w33derlich & Dobby (Kostenloses Fanprojekt)"
            >
              <Info className="w-4 h-4" />
              Info
            </button>

            <button
              onClick={() => setIsSoundboardOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-black bg-[#FDE100] hover:bg-[#ffe733] rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md shadow-[#FDE100]/20 font-bvb uppercase tracking-wider cursor-pointer"
            >
              <Music className="w-4 h-4" />
              Soundboard
            </button>

            {!isInstalledMode && (
              <button
                onClick={onOpenInstallerModal}
                className="px-3.5 py-1.5 text-xs font-bold text-black bg-[#FDE100] hover:bg-[#ffe733] rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/30 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Paket-Downloads
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: Dedicated Full-Width Navigation Bar (All 8 Tabs Always Visible) */}
        <nav className="flex flex-wrap items-center gap-2 sm:gap-3 px-6 py-2 bg-[#0c0e13] text-sm font-semibold">
          <button
            onClick={() => setActiveTab('ticker')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ticker'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            Match-Ticker
          </button>

          <button
            onClick={() => setActiveTab('bundesliga')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bundesliga'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <span>Bundesliga</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'bundesliga' ? 'bg-black' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'}`} />
          </button>

          <button
            onClick={() => setActiveTab('ucl')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ucl' || activeTab === 'transfers'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-sky-500/30 text-sky-300'
            }`}
          >
            <span>🏆 Königsklasse & Pokal</span>
          </button>

          <button
            onClick={() => setActiveTab('squad')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'squad'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            Kader
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'news'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <span>News & Archiv</span>
            {unreadNotificationsCount > 0 && (
              <span className={`w-5 h-5 rounded-full font-extrabold text-[11px] flex items-center justify-center font-mono ${
                activeTab === 'news' ? 'bg-black text-[#FDE100]' : 'bg-[#FDE100] text-black'
              }`}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timemachine')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timemachine'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-amber-500/30 text-amber-300'
            }`}
          >
            <span>Zeitmaschine ⏳</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'timemachine' ? 'bg-black' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => setActiveTab('chants')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chants'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-[#FDE100]/30 text-[#FDE100]'
            }`}
          >
            <span>Chant-Studio 🎤</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'chants' ? 'bg-black' : 'bg-[#FDE100] animate-pulse'}`} />
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'games'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            <span>Fan-Spiele 🎮</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'games' ? 'bg-black' : 'bg-emerald-400 animate-pulse'}`} />
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'offline'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-[#FDE100]/20'
            }`}
          >
            <span>30 Tage Statistik</span>
            <span className={`w-2 h-2 rounded-full ${activeTab === 'offline' ? 'bg-black' : 'bg-[#FDE100]'}`} />
          </button>

          <button
            onClick={() => setActiveTab('polls')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'polls'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            Umfragen
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            Profil
          </button>
        </nav>
      </header>

      {/* PERMANENT DOWNLOAD BANNER STRIP (Only in Download Center mode) */}
      {!isInstalledMode && (
        <div className="bg-[#141720] border-b border-[#FDE100]/30 px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDE100] animate-pulse shrink-0" />
            <span className="font-bold text-[#FDE100] font-bvb uppercase tracking-wider">Installer & Uninstaller Downloads:</span>
            <span className="text-slate-300">Skripte mit automatischer Abhängigkeitsprüfung für CachyOS & Windows 10/11</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadWindowsPortableZip}
              className="px-3.5 py-1.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-lg font-sans text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#FDE100]/20 cursor-pointer"
              title="Empfohlen (Lösung 4 - 0% Defender-Warnung): BVB-09-Windows-Portable.zip herunterladen"
            >
              <Download className="w-4 h-4" />
              BVB-09-Windows-Portable.zip
            </button>

            <button
              onClick={downloadWindowsExeInstaller}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-[#FDE100] border border-[#FDE100]/40 font-extrabold rounded-lg font-sans text-[11px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Reiner .NET Setup-Assistent (.exe)"
            >
              <Download className="w-3.5 h-3.5" />
              BVB-09-Windows-Setup.exe
            </button>

            <button
              onClick={downloadCachyOSTarPackage}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-black font-extrabold rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              bvb-09-cachyos-package.tar.gz
            </button>

            <button
              onClick={downloadCachyOSDeinstallerScript}
              className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 rounded font-mono text-[11px] flex items-center gap-1 transition-all"
              title="Download deinstall.sh"
            >
              <Trash2 className="w-3 h-3" />
              <span>deinstall.sh</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {children}
      </main>

      {/* Modals */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
        onNavigateToChants={() => setActiveTab('chants')}
      />
      <PlayerComparisonModal isOpen={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} />
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      {/* FOOTER STATUS STRIP */}
      <footer className="px-6 py-3 bg-[#0d0e12] border-t border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onReplaySplash} className="text-slate-400 hover:text-[#FDE100] transition-colors flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FDE100]" />
            3D-Splash erneut abspielen
          </button>
          <span>·</span>
          <span>Südtribüne Signal Iduna Park · Dortmund</span>
        </div>
        {!isInstalledMode ? (
          <div className="flex items-center gap-2 text-[11px]">
            <button onClick={downloadCachyOSTarPackage} className="text-teal-400 hover:underline font-mono">
              bvb-09-cachyos-package.tar.gz
            </button>
            <span>·</span>
            <button onClick={downloadCachyOSInstallerScript} className="text-teal-300 hover:underline font-mono">
              installer.sh
            </button>
            <span>·</span>
            <button onClick={downloadCachyOSDeinstallerScript} className="text-rose-400 hover:underline font-mono">
              deinstall.sh
            </button>
            <span>·</span>
            <button onClick={downloadWindowsPortableZip} className="text-[#FDE100] font-bold hover:underline font-sans">
              BVB-09-Windows-Portable.zip
            </button>
            <span>·</span>
            <button onClick={downloadWindowsExeInstaller} className="text-[#FDE100] hover:underline font-sans">
              BVB-09-Windows-Setup.exe
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bvb text-slate-400 tracking-wider uppercase">
              BVB Inofficial Fan Client · Beta 1.9.0.9 · Echte Liebe 09
            </div>
            {!isTrueStandaloneApp && (
              <button
                onClick={() => {
                  setIsInstalledMode(false);
                  localStorage.setItem('bvb_installed_mode', 'false');
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-700 cursor-pointer"
              >
                Web-Vorschau-Leiste einblenden
              </button>
            )}
          </div>
        )}
      </footer>
    </div>
  );
};
