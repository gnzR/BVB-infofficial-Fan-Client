import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  RefreshCw,
  X,
  ArrowRight,
  Smartphone,
  Laptop,
  Terminal,
  CheckCircle2,
  GitCommit,
  ShieldCheck,
} from 'lucide-react';
import { OfficialBvbLogo } from './OfficialBvbLogo';
import { CURRENT_APP_VERSION } from './InfoModal';

function openExternalUrl(url: string) {
  try {
    fetch(`/api/open-external?url=${encodeURIComponent(url)}`).catch(() => {});
  } catch {
    // ignore
  }
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const GITHUB_REPO_OWNER = 'gnzR';
const GITHUB_REPO_NAME = 'BVB-infofficial-Fan-Client';

export interface StartupRemoteVersionPayload {
  version: string;
  versionCode?: number;
  releasedAt?: string;
  repositoryUrl?: string;
  changelog?: string[];
  downloads?: {
    windowsPortableZip?: string;
    windowsSetupExe?: string;
    cachyosTarGz?: string;
    androidApk?: string;
  };
}

type DetectedPlatform = 'android' | 'linux' | 'windows';

function detectUserPlatform(): DetectedPlatform {
  if (typeof window === 'undefined') return 'windows';
  const ua = navigator.userAgent || '';
  if ((window as any).__BVB_ANDROID_APP__ === true || /Android/i.test(ua)) {
    return 'android';
  }
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
    return 'linux';
  }
  return 'windows';
}

interface StartupUpdateModalProps {
  isOpen: boolean;
  remoteInfo: StartupRemoteVersionPayload | null;
  onClose: () => void;
}

export const StartupUpdateModal: React.FC<StartupUpdateModalProps> = ({
  isOpen,
  remoteInfo,
  onClose,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<DetectedPlatform>(() => detectUserPlatform());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [restartCountdown, setRestartCountdown] = useState<number | null>(null);
  const [androidIntentUrl, setAndroidIntentUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform(detectUserPlatform());
    }
  }, [isOpen]);

  if (!isOpen || !remoteInfo) return null;

  const newVer = remoteInfo.version || CURRENT_APP_VERSION;

  const handleInstallUpdateNow = async (preferWindowsExe = true) => {
    if (isUpdating) return;
    setIsUpdating(true);
    setProgressPct(10);

    let fileName = 'BVB-09-Windows-Setup.exe';
    let mimeType = 'application/octet-stream';
    let githubRawUrl =
      remoteInfo.downloads?.windowsSetupExe ||
      `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Windows-Setup.exe`;
    let localApiFallback = '/api/download/BVB-09-Windows-Setup.exe';

    if (selectedPlatform === 'android') {
      fileName = 'BVB-09-Android-Client.apk';
      mimeType = 'application/vnd.android.package-archive';
      githubRawUrl =
        remoteInfo.downloads?.androidApk ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Android-Client.apk`;
      localApiFallback = '/api/download/BVB-09-Android-Client.apk';
    } else if (selectedPlatform === 'linux') {
      fileName = 'bvb-09-cachyos-package.tar.gz';
      mimeType = 'application/gzip';
      githubRawUrl =
        remoteInfo.downloads?.cachyosTarGz ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/bvb-09-cachyos-package.tar.gz`;
      localApiFallback = '/api/download/bvb-09-cachyos-package.tar.gz';
    } else if (!preferWindowsExe) {
      fileName = 'BVB-09-Windows-Portable.zip';
      mimeType = 'application/zip';
      githubRawUrl =
        remoteInfo.downloads?.windowsPortableZip ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Windows-Portable.zip`;
      localApiFallback = '/api/download/BVB-09-Windows-Portable.zip';
    }

    setStatusText(`1/3: Verbinde mit GitHub (${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}) & lade ${fileName}...`);

    try {
      // Save updated version marker & clear outdated caches
      try {
        localStorage.setItem('bvb_app_version', newVer);
        localStorage.setItem('bvb_last_updated_version', newVer);
        localStorage.setItem('bvb_last_updated_at', new Date().toISOString());
        localStorage.setItem('bvb_just_updated_notice', `Erfolgreich auf Version ${newVer} aktualisiert!`);
        if ('caches' in window) {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((k) => caches.delete(k)));
        }
      } catch {
        // Ignore storage errors
      }

      // Android: Directly invoke Android System Package Installer via intent:// + APK download
      if (selectedPlatform === 'android') {
        setProgressPct(55);
        setStatusText(`2/3: Übergebe ${fileName} an den Android Paket-Installer...`);

        const cleanPath = githubRawUrl.replace(/^https?:\/\//, '');
        const intentUri = `intent://${cleanPath}#Intent;action=android.intent.action.VIEW;type=application/vnd.android.package-archive;end`;
        setAndroidIntentUrl(intentUri);

        setProgressPct(100);
        setStatusText(
          `📲 Android Paket-Manager gestartet! Bitte tippe im Systemdialog auf „Installieren“ / „Aktualisieren“.`
        );

        try {
          window.location.href = intentUri;
        } catch {
          window.location.href = githubRawUrl;
        }
        setIsUpdating(false);
        return;
      }

      // Windows 10/11 & CachyOS/Linux: Stream package with live progress bar + auto-update reload
      let response: Response | null = null;
      try {
        const ghRes = await fetch(`${githubRawUrl}?t=${Date.now()}`, { cache: 'no-store' });
        if (ghRes.ok) response = ghRes;
      } catch {
        // Fallback to local server
      }

      if (!response) {
        try {
          const localRes = await fetch(localApiFallback);
          if (localRes.ok) response = localRes;
        } catch {
          // ignore
        }
      }

      if (response && response.ok) {
        const contentLength = Number(response.headers.get('content-length') || 0);
        const reader = response.body?.getReader();

        if (!reader) {
          const blob = await response.blob();
          const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          const chunks: Uint8Array[] = [];
          let received = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              received += value.length;
              if (contentLength > 0) {
                setProgressPct(Math.min(95, Math.max(15, Math.round((received / contentLength) * 100))));
              } else {
                setProgressPct((prev) => Math.min(92, prev + 12));
              }
              const mb = (received / (1024 * 1024)).toFixed(2);
              setStatusText(`2/3: Lade Update-Paket (${fileName}): ${mb} MB empfangen...`);
            }
          }

          const fullBlob = new Blob(chunks as BlobPart[], { type: mimeType });
          const url = URL.createObjectURL(fullBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        openExternalUrl(githubRawUrl);
      }

      setProgressPct(100);
      setStatusText(`3/3: ✅ Update ${newVer} (${fileName}) bereit! Starte Anwendung neu...`);
      setRestartCountdown(2);
      setTimeout(() => setRestartCountdown(1), 1000);
      setTimeout(() => {
        try {
          window.location.reload();
        } catch {
          onClose();
        }
      }, 2000);
    } catch {
      openExternalUrl(githubRawUrl);
      setProgressPct(100);
      setStatusText(`✅ Direkt-Download im Browser geöffnet (${fileName}).`);
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-[#0e1117] border-2 border-[#FDE100]/80 rounded-2xl shadow-[0_0_50px_rgba(253,225,0,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FDE100] via-emerald-400 to-[#FDE100]" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-950 via-[#141722] to-black border-b border-slate-800">
          <div className="flex items-center gap-3">
            <OfficialBvbLogo className="w-10 h-10 shrink-0 drop-shadow-[0_0_10px_rgba(253,225,0,0.5)]" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bvb font-black uppercase tracking-wider text-white">
                  Neues Programm-Update verfügbar!
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-extrabold text-[11px] border border-emerald-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FDE100]" />
                  GitHub Auto-Updater
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Beim Programmstart wurde eine neuere Version auf GitHub erkannt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Ablehnen & mit installierter Version starten"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
          {/* Version Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Installierte Version
              </div>
              <div className="text-base sm:text-lg font-bvb font-black text-slate-200 mt-0.5">
                Beta {CURRENT_APP_VERSION}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/60 to-black border border-emerald-500/50">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <GitCommit className="w-3 h-3" /> Neue GitHub-Version
              </div>
              <div className="text-base sm:text-lg font-bvb font-black text-[#FDE100] mt-0.5">
                Beta {newVer}
              </div>
            </div>
          </div>

          {/* Changelog List */}
          {Array.isArray(remoteInfo.changelog) && remoteInfo.changelog.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
              <div className="text-xs font-bvb font-bold uppercase tracking-wider text-[#FDE100] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Das ist neu in Version {newVer}:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {remoteInfo.changelog.map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#FDE100] font-bold mt-0.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Platform Switcher (Windows 10/11, CachyOS / Linux, Android) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bvb uppercase tracking-wider text-slate-400 font-bold">
                Erkanntes System für die Installation (wechselbar):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedPlatform('windows')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    selectedPlatform === 'windows'
                      ? 'bg-[#FDE100] text-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3 h-3" /> Windows
                </button>
                <button
                  onClick={() => setSelectedPlatform('linux')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    selectedPlatform === 'linux'
                      ? 'bg-[#FDE100] text-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Terminal className="w-3 h-3" /> Linux / CachyOS
                </button>
                <button
                  onClick={() => setSelectedPlatform('android')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                    selectedPlatform === 'android'
                      ? 'bg-[#FDE100] text-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-3 h-3" /> Android (.apk)
                </button>
              </div>
            </div>
          </div>

          {/* Live Progress Bar during Update */}
          {(isUpdating || statusText) && (
            <div className="p-3.5 rounded-xl bg-black/90 border border-emerald-500/50 space-y-2 animate-fade-in">
              {isUpdating && (
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/40">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#FDE100] transition-all duration-200 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FDE100] font-bold flex items-center gap-2">
                  {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />}
                  <span>{statusText}</span>
                </span>
                {isUpdating && <span className="text-emerald-400 font-extrabold">{progressPct}%</span>}
              </div>
              {restartCountdown !== null && (
                <div className="text-center font-bvb font-black text-sm text-[#FDE100] bg-emerald-950/80 py-1.5 px-3 rounded-lg border border-emerald-500/60 animate-bounce">
                  App-Neustart in {restartCountdown} Sekunden...
                </div>
              )}
            </div>
          )}

          {/* Android Package Installer Callout if triggered */}
          {androidIntentUrl && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-black border-2 border-emerald-400 text-white space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-bvb font-bold text-xs uppercase text-[#FDE100] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Android System-Installationsdialog geöffnet
                </span>
              </div>
              <p className="text-xs text-slate-200">
                Bitte tippe im aufpoppenden Android-Fenster auf <strong>„Installieren“</strong> bzw. <strong>„Aktualisieren“</strong>!
              </p>
              <a
                href={androidIntentUrl}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FDE100] text-black font-bvb font-black text-xs uppercase shadow-md hover:bg-[#ffe733]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Installations-Fenster erneut aufrufen</span>
              </a>
            </div>
          )}

          {/* Primary Action Buttons: Accept (Install Update) or Decline (Launch Installed Version) */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={() => handleInstallUpdateNow(true)}
              disabled={isUpdating}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-[#FDE100] to-emerald-400 hover:from-emerald-400 hover:to-[#ffe733] text-black font-bvb font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/20 cursor-pointer transition-all transform active:scale-[0.99]"
            >
              <Download className={`w-5 h-5 text-black shrink-0 ${isUpdating ? 'animate-bounce' : ''}`} />
              <span>
                {isUpdating
                  ? `Update ${newVer} wird geladen & installiert...`
                  : selectedPlatform === 'android'
                  ? `🚀 Jetzt Android-Update (v${newVer} .apk) installieren`
                  : selectedPlatform === 'linux'
                  ? `🚀 Jetzt CachyOS / Linux Update (v${newVer}) installieren`
                  : `🚀 Jetzt Windows-Update (v${newVer} .exe) installieren`}
              </span>
            </button>

            {selectedPlatform === 'windows' && !isUpdating && (
              <button
                onClick={() => handleInstallUpdateNow(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[#FDE100] border border-[#FDE100]/30 font-bvb font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Alternativ: Windows Portable-Paket (.zip) herunterladen & aktualisieren</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-bvb font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Ablehnen / Später – Mit installierter Version (Beta {CURRENT_APP_VERSION}) starten</span>
              <ArrowRight className="w-4 h-4 text-[#FDE100]" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Offizielles GitHub-Release ({GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME})
          </span>
          <span className="font-mono text-slate-500">v{CURRENT_APP_VERSION} ➔ v{newVer}</span>
        </div>
      </div>
    </div>
  );
};
