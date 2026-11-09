import React, { useState, useEffect } from 'react';
import { InfoModal } from './InfoModal';
import { OfficialBvbLogo } from './OfficialBvbLogo';
import { NetradioPlayer } from './NetradioPlayer';
import { SoundboardModal } from './SoundboardModal';
import { PlayerComparisonModal } from './tabs/PlayerComparisonModal';
import {
  subscribeToGoalAlerts,
  dismissGoalAlert,
  playBvbGoalAnthem,
  GoalAlertPayload,
} from '../utils/goalAlertSystem';
import {
  downloadWindowsExeInstaller,
  downloadWindowsPortableZip,
  downloadCachyOSTarPackage,
  downloadCachyOSInstallerScript,
  downloadCachyOSDeinstallerScript,
  downloadAndroidApk,
} from '../utils/downloadHelpers';
import {
  Info,
  Minus,
  Square,
  X,
  Wifi,
  WifiOff,
  Terminal,
  Download,
  Sparkles,
  Shield,
  Laptop,
  Radio,
  Music,
  Cpu,
  Trash2,
  Smartphone,
  Menu,
  Trophy,
  Users,
  Newspaper,
  Clock,
  Mic,
  Gamepad2,
  BarChart3,
  Vote,
  User,
  Activity,
  Flame,
  Calendar,
  Volume2,
} from 'lucide-react';

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
  const [isMobileMoreSheetOpen, setIsMobileMoreSheetOpen] = useState<boolean>(false);
  const [isMobileRadioOpen, setIsMobileRadioOpen] = useState<boolean>(false);
  const [activeGoalAlert, setActiveGoalAlert] = useState<GoalAlertPayload | null>(null);

  useEffect(() => {
    return subscribeToGoalAlerts((alert) => {
      setActiveGoalAlert(alert);
    });
  }, []);

  const isNativeAndroidApp = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        (window as any).__BVB_ANDROID_APP__ === true ||
        urlParams.get('android') === 'true' ||
        /Android/i.test(navigator.userAgent)
      );
    } catch {
      return false;
    }
  })();

  const isTrueStandaloneApp = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        (window as any).__BVB_STANDALONE_APP__ === true ||
        isNativeAndroidApp ||
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
  const [isAndroidPreviewMode, setIsAndroidPreviewMode] = useState<boolean>(() => isNativeAndroidApp);

  const isAndroidUiActive = isNativeAndroidApp || isAndroidPreviewMode;

  const isSecondaryMobileTab = ['matchday', 'news', 'timemachine', 'chants', 'games', 'offline', 'polls', 'profile'].includes(activeTab);

  // Global Schwarzgelbes Stadion-Tor-Banner (Idee 2)
  const renderGlobalGoalAlertToast = () => {
    if (!activeGoalAlert) return null;
    return (
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#FDE100] via-amber-400 to-[#FDE100] text-black border-b-4 border-black px-4 py-3 shadow-[0_10px_35px_rgba(253,225,0,0.45)] animate-pulse">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-black text-[#FDE100] flex items-center justify-center font-bvb font-black text-xl shadow-md shrink-0">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-black text-[#FDE100] font-mono text-[10px] font-black uppercase tracking-wider">
                  TOR-ALARM · {activeGoalAlert.competition}
                </span>
                <span className="font-mono text-xs font-extrabold text-black/80">
                  Spielminute {activeGoalAlert.minute}
                </span>
              </div>
              <div className="text-base sm:text-lg font-black font-bvb uppercase tracking-wide leading-tight mt-0.5">
                TOOOR FÜR BORUSSIA DORTMUND! · {activeGoalAlert.scorer} ({activeGoalAlert.homeTeam}{' '}
                {activeGoalAlert.homeScore}:{activeGoalAlert.awayScore} {activeGoalAlert.awayTeam})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playBvbGoalAnthem()}
              className="px-3 py-1.5 rounded-lg bg-black text-[#FDE100] hover:bg-slate-900 font-bvb font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Torhymne 🔊</span>
            </button>
            <button
              onClick={() => dismissGoalAlert()}
              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-black font-bold cursor-pointer"
              title="Tor-Banner schließen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // ANDROID SMARTPHONE CLIENT UI (Native Android APK or Interactive Mobile Preview)
  // ============================================================================
  if (isAndroidUiActive) {
    return (
      <div className="min-h-screen bg-[#050608] text-slate-100 flex flex-col font-sans select-none">
        {/* Web-Vorschau Top Helper Bar (Only shown when previewing Android mode inside Desktop AI Studio) */}
        {!isTrueStandaloneApp && !isNativeAndroidApp && (
          <div className="bg-[#11141c] border-b border-[#FDE100]/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android-Smartphone Vorschau (Touch-Menüführung)</span>
              </span>
              <span className="text-slate-400 hidden sm:inline">
                In der fertigen APK startet diese Oberfläche automatisch im Vollbild.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadAndroidApk}
                className="px-3 py-1 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>BVB-09-Android-Client.apk herunterladen</span>
              </button>
              <button
                onClick={() => setIsAndroidPreviewMode(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold cursor-pointer"
              >
                Zurück zur Desktop-Ansicht
              </button>
            </div>
          </div>
        )}

        {/* Smartphone Viewport Container (Full width on real Android phone, sleek 430px phone frame on desktop preview) */}
        <div
          className={
            !isTrueStandaloneApp && !isNativeAndroidApp
              ? 'w-full max-w-[440px] mx-auto my-3 flex-1 flex flex-col bg-[#08090c] border-[3px] border-slate-800 rounded-[32px] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden relative max-h-[88vh]'
              : 'w-full flex-1 flex flex-col bg-[#08090c] min-h-screen relative'
          }
        >
          {/* Simulated Android Status Bar (Only in desktop preview frame) */}
          {!isTrueStandaloneApp && !isNativeAndroidApp && (
            <div className="px-5 py-1.5 bg-[#050608] text-[11px] font-mono text-slate-400 flex items-center justify-between border-b border-slate-900 shrink-0">
              <span className="font-bold text-slate-300">19:09</span>
              <div className="w-16 h-3 rounded-full bg-black border border-slate-800/80" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-emerald-400 font-bold">5G</span>
                <span>100%</span>
              </div>
            </div>
          )}

          {/* COMPACT ANDROID TOP APP BAR */}
          <header className="sticky top-0 z-30 bg-[#101218]/95 backdrop-blur-md border-b border-[#FDE100]/25 px-3.5 py-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setActiveTab('ucl')}
                className="flex items-center gap-2 text-left"
              >
                <OfficialBvbLogo className="w-8 h-8 shrink-0 drop-shadow-[0_0_6px_rgba(253,225,0,0.4)]" />
                <div>
                  <div className="font-bvb font-black text-base leading-none text-[#FDE100] tracking-tight">
                    BVB FAN CLIENT
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Android · Beta 1.909.2</span>
                  </div>
                </div>
              </button>

              {/* Mobile Quick Actions: Radio, Soundboard, Info */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMobileRadioOpen(!isMobileRadioOpen)}
                  className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-bold ${
                    isMobileRadioOpen
                      ? 'bg-[#FDE100] text-black border-[#FDE100] shadow-sm shadow-[#FDE100]/30'
                      : 'bg-slate-900 text-[#FDE100] border-[#FDE100]/30'
                  }`}
                  title="BVB Netradio ein-/ausklappen"
                >
                  <Radio className="w-4 h-4" />
                  <span className="text-[10px] font-bvb uppercase">Radio</span>
                </button>

                <button
                  onClick={() => setIsSoundboardOpen(true)}
                  className="p-2 rounded-xl bg-[#FDE100] text-black font-bold border border-[#FDE100] shadow-sm flex items-center gap-1"
                  title="Südtribünen-Soundboard"
                >
                  <Music className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsInfoModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-700"
                  title="Programm-Info & Rechtliches"
                >
                  <Info className="w-4 h-4 text-[#FDE100]" />
                </button>
              </div>
            </div>

            {/* Collapsible Mobile Netradio Drawer */}
            {isMobileRadioOpen && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-800/90 flex justify-center overflow-x-auto">
                <NetradioPlayer />
              </div>
            )}
          </header>

          {/* Global Goal Alert Toast in Android View */}
          {renderGlobalGoalAlertToast()}

          {/* HORIZONTAL TOUCH QUICK-PILL BAR FOR ALL FEATURES */}
          <div className="bg-[#0b0d12] border-b border-slate-800/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
            {[
              { id: 'ucl', label: '🏆 Pokal & CL' },
              { id: 'ticker', label: '🔴 Live-Ticker' },
              { id: 'matchday', label: '📅 Spielplan & Stadion' },
              { id: 'bundesliga', label: '⚽ Bundesliga' },
              { id: 'squad', label: '👥 BVB-Kader' },
              { id: 'news', label: '📰 News (60T)' },
              { id: 'timemachine', label: '⏳ Zeitmaschine' },
              { id: 'games', label: '🎮 Fan-Spiele' },
              { id: 'chants', label: '🎤 Chants' },
              { id: 'offline', label: '📊 30T-Statistik' },
              { id: 'polls', label: '🗳️ Umfragen' },
              { id: 'profile', label: '👤 Profil' },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => {
                  setActiveTab(pill.id);
                  setIsMobileMoreSheetOpen(false);
                }}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-semibold transition-all text-[11px] ${
                  activeTab === pill.id
                    ? 'bg-[#FDE100] text-black font-extrabold shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 border border-slate-800'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* SCROLLABLE MOBILE VIEWPORT CONTENT */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 pb-24 space-y-4">
            {children}
          </main>

          {/* ANDROID BOTTOM-SHEET DRAWER ("MEHR" MENU) */}
          {isMobileMoreSheetOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs flex flex-col justify-end"
              onClick={() => setIsMobileMoreSheetOpen(false)}
            >
              <div
                className="w-full max-w-[440px] mx-auto bg-[#11141c] border-t-2 border-[#FDE100] rounded-t-3xl p-4 pb-20 space-y-3 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-1" />
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bvb font-black text-base text-[#FDE100] uppercase tracking-wider">
                    📱 BVB Stadion-Menü (Alle Bereiche)
                  </span>
                  <button
                    onClick={() => setIsMobileMoreSheetOpen(false)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => { setActiveTab('matchday'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold col-span-2 ${
                      activeTab === 'matchday'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-[#FDE100]/40'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-[#FDE100] shrink-0" />
                    <div>
                      <div>📅 Spielplan, Gegner-Check & Stadion-Guide</div>
                      <div className="text-[10px] opacity-75 font-normal">1-Klick .ics Export · Tor-Alarm · Signal Iduna Park</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('news'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'news'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Newspaper className="w-4 h-4 text-[#FDE100] shrink-0" />
                    <div>
                      <div>News & Archiv</div>
                      <div className="text-[10px] opacity-75 font-normal">60-Tage Speicher</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('timemachine'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'timemachine'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div>Zeitmaschine</div>
                      <div className="text-[10px] opacity-75 font-normal">8 Jahrhundert-Tore</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('games'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'games'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div>Fan-Spiele</div>
                      <div className="text-[10px] opacity-75 font-normal">Penalty King & Quiz</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('chants'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'chants'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-[#FDE100] shrink-0" />
                    <div>
                      <div>Chant-Studio</div>
                      <div className="text-[10px] opacity-75 font-normal">Fangesänge & Audio</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('offline'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'offline'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div>30T-Statistik</div>
                      <div className="text-[10px] opacity-75 font-normal">Formkurve & xG</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('polls'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'polls'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <Vote className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div>Umfragen</div>
                      <div className="text-[10px] opacity-75 font-normal">Spieltags-Voting</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('profile'); setIsMobileMoreSheetOpen(false); }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 font-bold ${
                      activeTab === 'profile'
                        ? 'bg-[#FDE100] text-black border-[#FDE100]'
                        : 'bg-slate-900/90 text-slate-200 border-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#FDE100] shrink-0" />
                    <div>
                      <div>Fan-Profil</div>
                      <div className="text-[10px] opacity-75 font-normal">Mitgliedsausweis</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsMobileMoreSheetOpen(false); onReplaySplash(); }}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-200 text-left flex items-center gap-2.5 font-bold"
                  >
                    <Sparkles className="w-4 h-4 text-[#FDE100] shrink-0" />
                    <div>
                      <div>3D-Splash</div>
                      <div className="text-[10px] opacity-75 font-normal">Start-Intro zeigen</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FIXED ANDROID THUMB BOTTOM NAVIGATION BAR */}
          <nav className="sticky bottom-0 z-50 bg-[#0d0f15]/95 backdrop-blur-md border-t border-[#FDE100]/30 px-2 py-1.5 grid grid-cols-5 gap-1 shrink-0">
            <button
              onClick={() => { setActiveTab('ticker'); setIsMobileMoreSheetOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                activeTab === 'ticker'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-bold">Ticker</span>
            </button>

            <button
              onClick={() => { setActiveTab('ucl'); setIsMobileMoreSheetOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                activeTab === 'ucl' || activeTab === 'transfers'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-bold">Pokal/CL</span>
            </button>

            <button
              onClick={() => { setActiveTab('bundesliga'); setIsMobileMoreSheetOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                activeTab === 'bundesliga'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-bold">Liga</span>
            </button>

            <button
              onClick={() => { setActiveTab('squad'); setIsMobileMoreSheetOpen(false); }}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                activeTab === 'squad'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-bold">Kader</span>
            </button>

            <button
              onClick={() => setIsMobileMoreSheetOpen(!isMobileMoreSheetOpen)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isMobileMoreSheetOpen || isSecondaryMobileTab
                  ? 'bg-[#FDE100] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Menu className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 font-bold">Mehr</span>
            </button>
          </nav>
        </div>

        {/* Modals */}
        <SoundboardModal
          isOpen={isSoundboardOpen}
          onClose={() => setIsSoundboardOpen(false)}
          onNavigateToChants={() => setActiveTab('chants')}
        />
        <PlayerComparisonModal isOpen={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} />
        <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
      </div>
    );
  }

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
            BVB Inofficial Fan Client · <span className="text-[#FDE100] font-mono text-xs">Beta 1.909.2</span>
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

          {/* Android Mobile Mode Toggle + Direct APK Download (Web-Vorschau only) */}
          <button
            onClick={() => setIsAndroidPreviewMode(true)}
            className="px-2.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 rounded text-[11px] font-sans font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Smartphone-Oberfläche (Android-Menüführung) live in der Vorschau testen"
          >
            <Smartphone className="w-3 h-3" />
            <span>📱 Android-Ansicht</span>
          </button>

          {/* DIRECT DOWNLOAD BUTTONS IN TITLEBAR (Only in Download Center mode) */}
          {!isInstalledMode ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={downloadAndroidApk}
                className="px-2.5 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400 rounded text-[11px] font-sans font-extrabold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                title="Direkt fertige Android-App BVB-09-Android-Client.apk herunterladen"
              >
                <Smartphone className="w-3 h-3" />
                <span>APK Download</span>
              </button>

              <button
                onClick={downloadCachyOSTarPackage}
                className="px-2.5 py-0.5 bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-black border border-teal-500/40 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1"
                title="Direkt CachyOS Paket bvb-09-cachyos-package.tar.gz herunterladen"
              >
                <Cpu className="w-3 h-3" />
                <span>CachyOS .tar.gz</span>
              </button>

              <button
                onClick={downloadWindowsPortableZip}
                className="px-2.5 py-0.5 bg-[#FDE100] hover:bg-[#ffe733] text-black border border-[#FDE100] rounded text-[11px] font-sans font-extrabold transition-all flex items-center gap-1 shadow-sm"
                title="Direkt BVB-09-Windows-Portable.zip (Lösung 4) herunterladen"
              >
                <Download className="w-3 h-3" />
                <span>Windows .zip</span>
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
                  onClick={downloadAndroidApk}
                  className="w-full text-left p-2 rounded bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-between font-sans text-[11px]"
                >
                  <span>📱 BVB-09-Android-Client.apk</span>
                  <Download className="w-3.5 h-3.5" />
                </button>
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
              Beta 1.909.2
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

        {/* ROW 2: Dedicated Full-Width Navigation Bar (All Tabs Always Visible) */}
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
            onClick={() => setActiveTab('matchday')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matchday'
                ? 'bg-[#FDE100] text-black font-extrabold shadow-sm shadow-[#FDE100]/30'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/70 border border-[#FDE100]/40 bg-[#FDE100]/10'
            }`}
          >
            <span>📅 Spielplan & Stadion</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${
              activeTab === 'matchday' ? 'bg-black text-[#FDE100]' : 'bg-[#FDE100] text-black'
            }`}>
              NEU
            </span>
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
            <span className="text-slate-300">Direkt-Pakete für Windows 10/11, CachyOS & Android (.apk)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadAndroidApk}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg font-sans text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              title="Fertige Android-App BVB-09-Android-Client.apk (mit Smartphone-Menüführung) herunterladen"
            >
              <Smartphone className="w-4 h-4" />
              BVB-09-Android-Client.apk
            </button>

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

      {/* Global Schwarzgelbes Stadion-Tor-Banner (Idee 2) */}
      {renderGlobalGoalAlertToast()}

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
            <button onClick={downloadAndroidApk} className="text-emerald-400 font-bold hover:underline font-sans">
              BVB-09-Android-Client.apk
            </button>
            <span>·</span>
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
              BVB Inofficial Fan Client · Beta 1.909.2 · Echte Liebe 09
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
