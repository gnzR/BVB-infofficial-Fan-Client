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
import { StartupUpdateModal, StartupRemoteVersionPayload } from './components/StartupUpdateModal';
import { CURRENT_APP_VERSION } from './components/InfoModal';
import { getUserProfile, UserBVBProfile } from './utils/userProfile';
import { getNotificationArchive } from './utils/notificationSystem';
import { sync60DayBvbArchive } from './utils/bvbArchiveStore';

function parseVerParts(v: string): number[] {
  return v
    .replace(/[^0-9.]/g, '')
    .split('.')
    .filter(Boolean)
    .map((n) => parseInt(n, 10) || 0);
}

function compareVersions(remoteVer: string, localVer: string): number {
  const r = parseVerParts(remoteVer);
  const l = parseVerParts(localVer);
  const maxLen = Math.max(r.length, l.length);
  for (let i = 0; i < maxLen; i++) {
    const rv = r[i] || 0;
    const lv = l[i] || 0;
    if (rv > lv) return 1;
    if (rv < lv) return -1;
  }
  return 0;
}

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

  // Option 1: Startup GitHub Update Checker Modal State (for Windows, Linux & Android)
  const [startupRemoteUpdate, setStartupRemoteUpdate] = useState<StartupRemoteVersionPayload | null>(null);
  const [isStartupUpdateModalOpen, setIsStartupUpdateModalOpen] = useState<boolean>(false);
  const [startupUpdateDismissed, setStartupUpdateDismissed] = useState<boolean>(false);

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

  // Option 1: Silent Background GitHub Version Check on App Startup
  useEffect(() => {
    let isCancelled = false;

    async function checkGitHubOnStartup() {
      // 1. Primary: Uncached GitHub Contents API (0s CDN lag)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const apiRes = await fetch(
          `https://api.github.com/repos/gnzR/BVB-infofficial-Fan-Client/contents/version.json?ref=main&_=${Date.now()}`,
          {
            headers: { Accept: 'application/vnd.github.v3+json' },
            cache: 'no-store',
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        if (apiRes.ok) {
          const meta = await apiRes.json();
          if (meta && typeof meta.content === 'string') {
            const decodedJson = decodeURIComponent(escape(window.atob(meta.content.replace(/\s/g, ''))));
            const data: StartupRemoteVersionPayload = JSON.parse(decodedJson);
            if (!isCancelled && data && typeof data.version === 'string') {
              if (compareVersions(data.version, CURRENT_APP_VERSION) > 0) {
                setStartupRemoteUpdate(data);
              }
              return;
            }
          }
        }
      } catch {
        // Fallback to raw URLs below
      }

      const cacheBust = `?t=${Date.now()}`;
      const candidateUrls = [
        `https://raw.githubusercontent.com/gnzR/BVB-infofficial-Fan-Client/main/version.json${cacheBust}`,
        `https://raw.githubusercontent.com/gnzR/BVB-infofficial-Fan-Client/master/version.json${cacheBust}`,
      ];

      for (const url of candidateUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4500);
          const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
          clearTimeout(timeoutId);
          if (res.ok) {
            const data: StartupRemoteVersionPayload = await res.json();
            if (!isCancelled && data && typeof data.version === 'string') {
              if (compareVersions(data.version, CURRENT_APP_VERSION) > 0) {
                setStartupRemoteUpdate(data);
              }
              return;
            }
          }
        } catch {
          // Try next or ignore if offline
        }
      }
    }

    checkGitHubOnStartup();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Automatically open the Option 1 Startup Update Modal as soon as the 3D Splash finishes
  useEffect(() => {
    if (!showSplash && startupRemoteUpdate && !startupUpdateDismissed) {
      setIsStartupUpdateModalOpen(true);
    }
  }, [showSplash, startupRemoteUpdate, startupUpdateDismissed]);

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
      {showSplash && (
        <Splash3D
          onComplete={handleSplashComplete}
          onDetectedUpdate={(remoteData) => {
            setStartupRemoteUpdate(remoteData);
          }}
        />
      )}

      {/* Option 1: Dedicated Startup Update Modal right after Splash Screen (Windows, Linux & Android) */}
      <StartupUpdateModal
        isOpen={isStartupUpdateModalOpen}
        remoteInfo={startupRemoteUpdate}
        onClose={() => {
          setIsStartupUpdateModalOpen(false);
          setStartupUpdateDismissed(true);
        }}
      />

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

