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
import { InstallerGeneratorModal } from './components/InstallerGeneratorModal';
import { SchalkerEasterEggModal } from './components/SchalkerEasterEggModal';
import { getUserProfile, UserBVBProfile } from './utils/userProfile';
import { getNotificationArchive } from './utils/notificationSystem';

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
        {activeTab === 'ticker' && <LiveTickerTab />}
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
