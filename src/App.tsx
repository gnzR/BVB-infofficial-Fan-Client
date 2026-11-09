import React, { useState, useEffect } from 'react';
import { Splash3D } from './components/Splash3D';
import { DesktopWindow } from './components/DesktopWindow';
import { LiveTickerTab } from './components/tabs/LiveTickerTab';
import { UefaPokalLiveCenterTab } from './components/tabs/UefaPokalLiveCenterTab';
import { SquadDetailTab } from './components/tabs/SquadDetailTab';
import { NewsArchiveTab } from './components/tabs/NewsArchiveTab';
import { OfflineStatsTab } from './components/tabs/OfflineStatsTab';
import { BundesligaTab } from './components/tabs/BundesligaTab';
import { MatchdayPollsTab } from './components/tabs/MatchdayPollsTab';
import { UserProfileTab } from './components/tabs/UserProfileTab';
import { BvbGamesTab } from './components/tabs/BvbGamesTab';
import { BvbTimeMachineTab } from './components/tabs/BvbTimeMachineTab';
import { BvbChantStudioTab } from './components/tabs/BvbChantStudioTab';
import { MatchdayHubTab } from './components/tabs/MatchdayHubTab';
import { InstallerGeneratorModal } from './components/InstallerGeneratorModal';
import { SchalkerEasterEggModal } from './components/SchalkerEasterEggModal';
import { getUserProfile, UserBVBProfile } from './utils/userProfile';
import { getNotificationArchive } from './utils/notificationSystem';
import { sync60DayBvbArchive } from './utils/bvbArchiveStore';

export default function App() {
  const isInstalledClient = (() => {
    if (typeof window === 'undefined') return false;
    try {
      const search = window.location.search || '';
      return (
        search.includes('installed=true') ||
        window.location.protocol === 'file:' ||
        navigator.userAgent.includes('Electron') ||
        navigator.userAgent.includes('BVB-09') ||
        localStorage.getItem('bvb_installed_mode') === 'true'
      );
    } catch {
      return false;
    }
  })();

  // Visual database synchronization progress on startup
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ucl');
  const [selectedSquadPlayerName, setSelectedSquadPlayerName] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserBVBProfile>(getUserProfile());
  const [osPreference, setOsPreference] = useState<'windows' | 'cachyos'>(userProfile.osPreference);
  const [isInstallerModalOpen, setIsInstallerModalOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [justUpdatedNotice, setJustUpdatedNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const notice = localStorage.getItem('bvb_just_updated_notice');
      if (notice) {
        setJustUpdatedNotice(notice);
        localStorage.removeItem('bvb_just_updated_notice');
        setTimeout(() => setJustUpdatedNotice(null), 8000);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const archive = getNotificationArchive();
    setUnreadCount(archive.filter((n) => !n.read).length);
  }, [activeTab]);

  // Safe Heartbeat-Watchdog Signal for Windows 10/11 & Linux Desktop Runner
  useEffect(() => {
    // Only send HTTP ping if served over http/https (prevents file:// CORS / network stalls)
    if (typeof window === 'undefined' || (window.location.protocol !== 'http:' && window.location.protocol !== 'https:')) {
      return;
    }

    const sendHeartbeat = () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        fetch('/api/ping', { method: 'GET', cache: 'no-store', signal: controller.signal })
          .catch(() => {})
          .finally(() => clearTimeout(timeoutId));
      } catch {
        // Safe silence
      }
    };

    // Initial heartbeat
    sendHeartbeat();

    // Standard interval ping every 5.0s (lowered frequency to reduce CPU/Network load)
    const intervalId = window.setInterval(sendHeartbeat, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  // Option 3: Global continuous 15-minute background news sync (with rate limit cooldown)
  useEffect(() => {
    const runBgSync = () => {
      sync60DayBvbArchive(undefined, false).catch(() => {});
    };
    // Initial run after splash screen finishes (~8s)
    const initialTimer = window.setTimeout(runBgSync, 8000);
    // Continuous 15-minute interval (900,000 ms)
    const intervalId = window.setInterval(runBgSync, 15 * 60 * 1000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  const handleJumpToSquadPlayer = (playerName: string) => {
    setSelectedSquadPlayerName(playerName);
    setActiveTab('squad');
  };

  return (
    <>
      {/* 3D Spinning BVB Emblem Splash Screen */}
      {showSplash && <Splash3D onComplete={handleSplashComplete} />}

      {/* Desktop Wrapper Window */}
      <DesktopWindow
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        osPreference={osPreference}
        setOsPreference={setOsPreference}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        unreadNotificationsCount={unreadCount}
        onOpenInstallerModal={() => setIsInstallerModalOpen(true)}
        onReplaySplash={handleReplaySplash}
      >
        {justUpdatedNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-[#111318] to-black border-2 border-emerald-500/70 text-emerald-300 font-sans text-xs flex items-center justify-between gap-3 shadow-xl shadow-emerald-500/20 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div>
                <strong className="text-white block font-bvb uppercase tracking-wider text-sm">
                  ⚡ Auto-Update erfolgreich abgeschlossen!
                </strong>
                <span>{justUpdatedNotice} Alle neuen Features & Live-Daten stehen sofort bereit.</span>
              </div>
            </div>
            <button
              onClick={() => setJustUpdatedNotice(null)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/40 text-[11px] font-mono cursor-pointer shrink-0"
            >
              Ausblenden ✕
            </button>
          </div>
        )}

        {activeTab === 'ticker' && <LiveTickerTab />}
        {activeTab === 'matchday' && <MatchdayHubTab />}
        {activeTab === 'bundesliga' && <BundesligaTab />}
        {(activeTab === 'ucl' || activeTab === 'transfers') && (
          <UefaPokalLiveCenterTab onJumpToSquadPlayer={handleJumpToSquadPlayer} />
        )}
        {activeTab === 'squad' && (
          <SquadDetailTab
            initialSelectedPlayerName={selectedSquadPlayerName}
            onClearInitialPlayer={() => setSelectedSquadPlayerName(null)}
          />
        )}
        {activeTab === 'news' && <NewsArchiveTab />}
        {activeTab === 'timemachine' && <BvbTimeMachineTab />}
        {activeTab === 'chants' && <BvbChantStudioTab />}
        {activeTab === 'games' && <BvbGamesTab />}
        {activeTab === 'offline' && <OfflineStatsTab />}
        {activeTab === 'polls' && <MatchdayPollsTab />}
        {activeTab === 'profile' && (
          <UserProfileTab
            profile={userProfile}
            setProfile={setUserProfile}
            osPreference={osPreference}
            setOsPreference={setOsPreference}
          />
        )}
      </DesktopWindow>

      {/* Interactive Desktop Installer Generator Modal */}
      <InstallerGeneratorModal
        isOpen={isInstallerModalOpen}
        onClose={() => setIsInstallerModalOpen(false)}
        defaultOS={osPreference}
      />

      {/* Hidden Easter Egg: 4x Rapid Right-Click "Du bist aber kein Schalker, oder?" */}
      <SchalkerEasterEggModal />
    </>
  );
}
