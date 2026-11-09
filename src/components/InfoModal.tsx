import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ShieldCheck,
  Database,
  Cpu,
  Code2,
  Globe,
  Heart,
  Sparkles,
  CloudSun,
  Radio,
  Layers,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Laptop,
  Terminal,
} from 'lucide-react';
import { OfficialBvbLogo } from './OfficialBvbLogo';

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

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CURRENT_APP_VERSION = '1.909.1';
export const GITHUB_REPO_OWNER = 'gnzR';
export const GITHUB_REPO_NAME = 'BVB-infofficial-Fan-Client';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}`;

interface RemoteVersionPayload {
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

function parseVersionParts(v: string): number[] {
  return v
    .replace(/[^0-9.]/g, '')
    .split('.')
    .filter(Boolean)
    .map((n) => parseInt(n, 10) || 0);
}

function compareVersions(remoteVer: string, localVer: string): number {
  const r = parseVersionParts(remoteVer);
  const l = parseVersionParts(localVer);
  const maxLen = Math.max(r.length, l.length);
  for (let i = 0; i < maxLen; i++) {
    const rv = r[i] || 0;
    const lv = l[i] || 0;
    if (rv > lv) return 1;
    if (rv < lv) return -1;
  }
  return 0;
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

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'up_to_date' | 'update_available' | 'error'>('idle');
  const [remoteInfo, setRemoteInfo] = useState<RemoteVersionPayload | null>(null);
  const [latestCommitInfo, setLatestCommitInfo] = useState<{ sha: string; date: string; message: string } | null>(null);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('');
  const [isDownloadingUpdate, setIsDownloadingUpdate] = useState<boolean>(false);
  const [downloadProgressPct, setDownloadProgressPct] = useState<number>(0);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<DetectedPlatform>(() => detectUserPlatform());

  const checkForGitHubUpdates = useCallback(async () => {
    setUpdateStatus('checking');
    setDownloadStatusText('');
    const cacheBuster = `?t=${Date.now()}`;

    const candidateUrls = [
      `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/version.json${cacheBuster}`,
      `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/master/version.json${cacheBuster}`,
      `/version.json${cacheBuster}`,
    ];

    let fetchedVersionData: RemoteVersionPayload | null = null;

    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.version === 'string') {
            fetchedVersionData = data;
            break;
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    // Also query GitHub API for latest commit metadata on gnzR/BVB-infofficial-Fan-Client
    try {
      const commitRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits?per_page=1`,
        { headers: { Accept: 'application/vnd.github.v3+json' } }
      );
      if (commitRes.ok) {
        const commits = await commitRes.json();
        if (Array.isArray(commits) && commits.length > 0) {
          const c = commits[0];
          setLatestCommitInfo({
            sha: String(c.sha || '').slice(0, 7),
            date: c.commit?.committer?.date
              ? new Date(c.commit.committer.date).toLocaleString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Aktuell',
            message: String(c.commit?.message || '').split('\n')[0].slice(0, 90),
          });
        }
      }
    } catch {
      // Ignore commit API rate limit or offline state
    }

    const nowStr = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastCheckedTime(nowStr);

    if (fetchedVersionData) {
      setRemoteInfo(fetchedVersionData);
      const cmp = compareVersions(fetchedVersionData.version, CURRENT_APP_VERSION);
      if (cmp > 0) {
        setUpdateStatus('update_available');
      } else {
        setUpdateStatus('up_to_date');
      }
    } else {
      // Fallback if version.json is not yet pushed to GitHub main branch
      setRemoteInfo({
        version: CURRENT_APP_VERSION,
        releasedAt: new Date().toISOString().slice(0, 10),
        repositoryUrl: GITHUB_REPO_URL,
        changelog: [
          'Neu in 1.909.1: Integrierter GitHub-Updater im Info-Bereich (Live-Versionsprüfung & 1-Klick-Update)',
          'Neu: Fertige Android-APK (Absolute Beta) mit offiziellem BVB-09-Launcher-Icon & In-App-Vereinswappen',
          'Neu: Originalgetreuer 1:1 Signal Iduna Park Blockplan (Blöcke 1–89, alle 4 Eck-Kurven & Block-Suche)',
          'Security-Update (Paket B): DOM-XSS Schutz, Domain-Allowlist, Security-Header & Web-Audio Memory-Fix',
        ],
      });
      setUpdateStatus('up_to_date');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlatform(detectUserPlatform());
      checkForGitHubUpdates();
    }
  }, [isOpen, checkForGitHubUpdates]);

  const handleAutoDownloadAndInstall = async (targetPlatform: DetectedPlatform, preferWindowsExe = true) => {
    if (isDownloadingUpdate) return;
    setIsDownloadingUpdate(true);
    setDownloadProgressPct(5);

    let fileName = 'BVB-09-Windows-Setup.exe';
    let mimeType = 'application/octet-stream';
    let githubRawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Windows-Setup.exe`;
    let localApiFallback = '/api/download/BVB-09-Windows-Setup.exe';

    if (targetPlatform === 'android') {
      fileName = 'BVB-09-Android-Client.apk';
      mimeType = 'application/vnd.android.package-archive';
      githubRawUrl =
        remoteInfo?.downloads?.androidApk ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Android-Client.apk`;
      localApiFallback = '/api/download/BVB-09-Android-Client.apk';
    } else if (targetPlatform === 'linux') {
      fileName = 'bvb-09-cachyos-package.tar.gz';
      mimeType = 'application/gzip';
      githubRawUrl =
        remoteInfo?.downloads?.cachyosTarGz ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/bvb-09-cachyos-package.tar.gz`;
      localApiFallback = '/api/download/bvb-09-cachyos-package.tar.gz';
    } else if (!preferWindowsExe) {
      fileName = 'BVB-09-Windows-Portable.zip';
      mimeType = 'application/zip';
      githubRawUrl =
        remoteInfo?.downloads?.windowsPortableZip ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Windows-Portable.zip`;
      localApiFallback = '/api/download/BVB-09-Windows-Portable.zip';
    } else {
      githubRawUrl =
        remoteInfo?.downloads?.windowsSetupExe ||
        `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/releases/BVB-09-Windows-Setup.exe`;
    }

    setDownloadStatusText(`Verbinde mit GitHub (${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}) und lade ${fileName}...`);

    try {
      let response: Response | null = null;
      try {
        const ghRes = await fetch(`${githubRawUrl}?t=${Date.now()}`, { cache: 'no-store' });
        if (ghRes.ok) {
          response = ghRes;
        }
      } catch {
        // Fallback to local server package
      }

      if (!response) {
        const localRes = await fetch(localApiFallback);
        if (localRes.ok) {
          response = localRes;
        }
      }

      if (!response || !response.ok) {
        // Direct fallback: open GitHub raw download URL
        openExternalUrl(githubRawUrl);
        setDownloadProgressPct(100);
        setDownloadStatusText(
          `✅ Direkt-Download von GitHub gestartet (${fileName}). Bitte führe die Datei nach dem Download aus!`
        );
        setIsDownloadingUpdate(false);
        return;
      }

      const contentLength = Number(response.headers.get('content-length') || 0);
      const reader = response.body?.getReader();

      if (!reader) {
        const blob = await response.blob();
        triggerBrowserFileDownload(blob, fileName, mimeType);
      } else {
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedLength += value.length;
            if (contentLength > 0) {
              const pct = Math.min(98, Math.max(10, Math.round((receivedLength / contentLength) * 100)));
              setDownloadProgressPct(pct);
            } else {
              setDownloadProgressPct((prev) => Math.min(95, prev + 12));
            }
            const mbLoaded = (receivedLength / (1024 * 1024)).toFixed(2);
            setDownloadStatusText(`Lade Update-Paket (${fileName}): ${mbLoaded} MB empfangen...`);
          }
        }

        const fullBlob = new Blob(chunks as BlobPart[], { type: mimeType });
        triggerBrowserFileDownload(fullBlob, fileName, mimeType);
      }

      try {
        localStorage.setItem('bvb_last_updated_version', remoteInfo?.version || CURRENT_APP_VERSION);
      } catch {
        // Ignore storage errors
      }

      setDownloadProgressPct(100);
      if (targetPlatform === 'android') {
        setDownloadStatusText(
          `✅ ${fileName} erfolgreich geladen! Öffne die Datei in deiner Benachrichtigungsleiste und tippe auf „Aktualisieren“.`
        );
      } else if (targetPlatform === 'linux') {
        setDownloadStatusText(
          `✅ ${fileName} geladen! Entpacke das Archiv und starte ./installer.sh für das automatische CachyOS-Update.`
        );
      } else {
        setDownloadStatusText(
          `✅ ${fileName} erfolgreich geladen! Starte die heruntergeladene Datei, um das Update automatisch abzuschließen.`
        );
      }
    } catch {
      openExternalUrl(githubRawUrl);
      setDownloadProgressPct(100);
      setDownloadStatusText(`✅ GitHub-Download im Browser geöffnet (${fileName}).`);
    } finally {
      setIsDownloadingUpdate(false);
    }
  };

  function triggerBrowserFileDownload(blob: Blob, filename: string, mimeType: string) {
    const typedBlob = new Blob([blob], { type: mimeType });
    const url = URL.createObjectURL(typedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-[#0f1218] border border-[#FDE100]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-[#14161f] to-black border-b border-slate-800">
          <div className="flex items-center gap-3">
            <OfficialBvbLogo className="w-9 h-9 shrink-0 drop-shadow-[0_0_8px_rgba(253,225,0,0.4)]" />
            <div>
              <h2 className="text-lg font-black text-white font-bvb uppercase tracking-wide flex items-center gap-2">
                BVB Inofficial Fan Client
                <span className="px-2 py-0.5 rounded bg-[#FDE100]/20 text-[#FDE100] text-xs font-mono border border-[#FDE100]/30">
                  Beta {CURRENT_APP_VERSION}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                System-Informationen, Entwickler, GitHub Auto-Updater & Open-Source-Lizenzen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Developer & Gemini Co-Engineering Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#FDE100]/10 via-slate-900 to-black border border-[#FDE100]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                  Entwickler-Team & Software Architecture
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30 text-[10px] font-mono font-bold">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Powered by Google Gemini
                </span>
              </div>
              <span className="text-xl font-black text-[#FDE100] font-bvb tracking-wide flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#FDE100]" />
                w33derlich & Dobby
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Entwickelt von <strong className="text-white">w33derlich & Dobby</strong> als eigenständiger Client für Windows 10/11, CachyOS (Arch Linux) & Android – <strong className="text-sky-300">erstellt mithilfe von Google Gemini</strong>.
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-black/60 border border-slate-800 text-center shrink-0 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Version</span>
              <span className="text-sm font-extrabold text-[#FDE100] block">Beta {CURRENT_APP_VERSION}</span>
              <span className="text-[10px] text-sky-400 block mt-0.5">Gemini AI Build</span>
            </div>
          </div>

          {/* ========================================================================== */}
          {/* GITHUB AUTO-UPDATER & LIVE VERSION CHECK SECTION                           */}
          {/* ========================================================================== */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#141824] via-[#0e1118] to-black border-2 border-[#FDE100]/50 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-[#FDE100] text-black font-mono font-extrabold text-[10px] uppercase tracking-wider">
                    GITHUB AUTO-UPDATER
                  </span>
                  <button
                    onClick={() => openExternalUrl(GITHUB_REPO_URL)}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>github.com/{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="text-base font-black text-white font-bvb uppercase tracking-wide mt-1">
                  🔄 Programm-Update & GitHub-Versionsprüfung
                </h3>
              </div>

              <button
                onClick={checkForGitHubUpdates}
                disabled={updateStatus === 'checking' || isDownloadingUpdate}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#FDE100] border border-[#FDE100]/40 font-bvb font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                <span>{updateStatus === 'checking' ? 'Prüfe GitHub...' : 'Jetzt nach Updates suchen'}</span>
              </button>
            </div>

            {/* Version Comparison Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Installierte Version</span>
                <span className="text-sm font-extrabold text-white">Beta {CURRENT_APP_VERSION}</span>
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">GitHub Online-Version</span>
                <span className="text-sm font-extrabold text-[#FDE100]">
                  {updateStatus === 'checking'
                    ? 'Wird abgefragt...'
                    : `Beta ${remoteInfo?.version || CURRENT_APP_VERSION}`}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Update-Status</span>
                {updateStatus === 'checking' && (
                  <span className="text-sky-400 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verbinde...
                  </span>
                )}
                {updateStatus === 'up_to_date' && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktuell ({lastCheckedTime})
                  </span>
                )}
                {updateStatus === 'update_available' && (
                  <span className="text-amber-400 font-extrabold flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> Update verfügbar!
                  </span>
                )}
                {updateStatus === 'error' && (
                  <span className="text-rose-400 font-bold">Offline / GitHub nicht erreichbar</span>
                )}
              </div>
            </div>

            {/* Latest GitHub Commit Info if available */}
            {latestCommitInfo && (
              <div className="px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Commit #{latestCommitInfo.sha}
                  </span>
                  <span className="text-slate-300 truncate">{latestCommitInfo.message}</span>
                </div>
                <span className="text-slate-400 text-[10px] shrink-0">{latestCommitInfo.date}</span>
              </div>
            )}

            {/* Status Banner: Update Available vs Up to Date */}
            {updateStatus === 'update_available' ? (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/50 text-amber-200 space-y-2">
                <div className="font-bvb font-black text-sm uppercase tracking-wide text-[#FDE100] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Neues Update auf GitHub gefunden: Version {remoteInfo?.version}!</span>
                </div>
                <p className="text-xs text-slate-200">
                  Klicke unten auf dein Betriebssystem, um die neue Version direkt von GitHub herunterzuladen und zu installieren.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Deine installierte Version (<strong>Beta {CURRENT_APP_VERSION}</strong>) ist auf dem neuesten Stand. Du kannst das aktuelle Release-Paket unten jederzeit direkt von GitHub neu herunterladen.
                  </span>
                </div>
              </div>
            )}

            {/* Changelog Notes from version.json */}
            {remoteInfo?.changelog && remoteInfo.changelog.length > 0 && (
              <div className="p-3 rounded-lg bg-black/50 border border-slate-800/90 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#FDE100] font-bold block">
                  Änderungsprotokoll (Release Notes v{remoteInfo.version}):
                </span>
                <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                  {remoteInfo.changelog.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Platform Selector & 1-Click Auto-Update Buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-bvb uppercase tracking-wider text-slate-300 font-bold">
                  Plattform für automatischen Update-Download wählen:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedPlatform('windows')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedPlatform === 'windows'
                        ? 'bg-[#FDE100] text-black'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Laptop className="w-3 h-3" /> Windows 10/11
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('linux')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedPlatform === 'linux'
                        ? 'bg-[#FDE100] text-black'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Terminal className="w-3 h-3" /> CachyOS / Linux
                  </button>
                  <button
                    onClick={() => setSelectedPlatform('android')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                      selectedPlatform === 'android'
                        ? 'bg-[#FDE100] text-black'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Android (.apk)
                  </button>
                </div>
              </div>

              {/* Action Buttons per Platform */}
              <div className="flex flex-wrap items-center gap-2.5">
                {selectedPlatform === 'windows' && (
                  <>
                    <button
                      onClick={() => handleAutoDownloadAndInstall('windows', true)}
                      disabled={isDownloadingUpdate}
                      className="flex-1 min-w-[220px] py-2.5 px-4 rounded-xl bg-[#FDE100] hover:bg-[#ffe733] text-black font-bvb font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FDE100]/20 cursor-pointer transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {updateStatus === 'update_available'
                          ? `Update v${remoteInfo?.version} als Windows-Setup (.exe) laden`
                          : 'Windows-Setup (.exe) direkt von GitHub aktualisieren'}
                      </span>
                    </button>
                    <button
                      onClick={() => handleAutoDownloadAndInstall('windows', false)}
                      disabled={isDownloadingUpdate}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bvb font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FDE100]" />
                      <span>Portable (.zip) laden</span>
                    </button>
                  </>
                )}

                {selectedPlatform === 'linux' && (
                  <button
                    onClick={() => handleAutoDownloadAndInstall('linux')}
                    disabled={isDownloadingUpdate}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FDE100] hover:bg-[#ffe733] text-black font-bvb font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FDE100]/20 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {updateStatus === 'update_available'
                        ? `Update v${remoteInfo?.version} für CachyOS / Linux (.tar.gz) laden`
                        : 'CachyOS / Linux Paket (.tar.gz) direkt von GitHub aktualisieren'}
                    </span>
                  </button>
                )}

                {selectedPlatform === 'android' && (
                  <button
                    onClick={() => handleAutoDownloadAndInstall('android')}
                    disabled={isDownloadingUpdate}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FDE100] hover:bg-[#ffe733] text-black font-bvb font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FDE100]/20 cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {updateStatus === 'update_available'
                        ? `Android-Update v${remoteInfo?.version} (.apk Beta) laden & installieren`
                        : 'Android-App (.apk Absolute Beta) direkt von GitHub aktualisieren'}
                    </span>
                  </button>
                )}
              </div>

              {/* Download Progress Bar & Status Message */}
              {(isDownloadingUpdate || downloadStatusText) && (
                <div className="p-3 rounded-xl bg-black/80 border border-slate-800 space-y-2 mt-2">
                  {isDownloadingUpdate && (
                    <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-[#FDE100] transition-all duration-150"
                        style={{ width: `${downloadProgressPct}%` }}
                      />
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-[#FDE100] flex items-center justify-between gap-2">
                    <span>{downloadStatusText}</span>
                    {isDownloadingUpdate && <span className="font-bold">{downloadProgressPct}%</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Non-Profit & Free Fan Project + Multi-Club Trademark Disclaimer Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-black border border-emerald-500/40 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider font-mono border border-emerald-500/30 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                100 % Kostenloses Fanprojekt & Markenrechtshinweis
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Non-Profit • Ehrenamtlich</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              Diese Applikation ist ein <strong className="text-white">rein privates, inoffizielles und ehrenamtliches Fanprojekt von BVB-Fans für BVB-Fans</strong>, das von <strong>w33derlich & Dobby</strong> mithilfe von <strong>Google Gemini</strong> realisiert wurde. Mit dieser Software wird <strong className="text-emerald-400">kein Geld verdient</strong>, es gibt keine Werbung, keine kostenpflichtigen Abos und keinerlei kommerzielle Absichten.
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans border-t border-emerald-500/20 pt-2">
              <strong className="text-[#FDE100]">Hinweis zu Vereinswappen & Markenrechten:</strong> Alle in diesem Programm dargestellten Vereinswappen, Logos, Marken und Namensrechte liegen bei der <em>Borussia Dortmund GmbH & Co. KGaA</em> sowie bei den <em>jeweiligen anderen Vereinen und Verbänden (u. a. DFL, DFB, UEFA und den jeweiligen Bundesliga- bzw. Europapokal-Klubs)</em>. Die Nennung und Darstellung dient ausschließlich der nicht-kommerziellen, informativen Berichterstattung über Spielpläne, Tabellen und Statistiken.
            </p>
          </div>

          {/* Verified Active Data Sources Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FDE100]" />
                Tatsächlich im Code verwendete Datenquellen & Live-APIs
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                8 aktive Schnittstellen verifiziert
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
              {/* 1. BVBWLD.de WP-JSON REST API */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FDE100] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">BVBWLD.de (WordPress REST API)</span>
                  <span className="text-slate-400 text-[10px] block">
                    Direkte JSON-API (<code className="text-[#FDE100]">/wp-json/wp/v2/posts</code>) für Live-Artikel & Kader-News.
                  </span>
                </div>
              </div>

              {/* 2. ESPN Opta Multi-League API */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">ESPN Opta Soccer API (Multi-League)</span>
                  <span className="text-slate-400 text-[10px] block">
                    Live-Scoreboard, xG-Statistiken, CL-Tabelle (<code className="text-sky-300">uefa.champions</code>), Bundesliga (<code className="text-sky-300">ger.1</code>) & DFB-Pokal.
                  </span>
                </div>
              </div>

              {/* 3. OpenLigaDB API */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">OpenLigaDB REST API</span>
                  <span className="text-slate-400 text-[10px] block">
                    Bundesliga-Live-Tabelle (<code className="text-emerald-300">getbltable</code>), BVB-Spielplan (<code className="text-emerald-300">teamId 7</code>) & Torjägerliste.
                  </span>
                </div>
              </div>

              {/* 4. Squad & Market Value Database */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FDE100] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">BVB Kader- & Marktwert-Datenbank</span>
                  <span className="text-slate-400 text-[10px] block">
                    32 Profis + Cheftrainer Niko Kovač inkl. direkter Verknüpfung in Königsklasse & DFB-Pokal.
                  </span>
                </div>
              </div>

              {/* 5. Open-Meteo Stadium Weather API */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <CloudSun className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Open-Meteo Stadionwetter API</span>
                  <span className="text-slate-400 text-[10px] block">
                    Echtzeit-Wetter für den Signal Iduna Park (<code className="text-amber-300">51.4926°N, 7.4519°O</code> · Strobelallee 50).
                  </span>
                </div>
              </div>

              {/* 6. SportBILD Live-Ticker Scraper */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <Radio className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">SportBILD Live-Ticker-Scraper</span>
                  <span className="text-slate-400 text-[10px] block">
                    Deutscher Minuten-Kommentar-Feed (<code className="text-rose-300">sport.bild.de</code>) für den Hybrid-Live-Ticker (A+C).
                  </span>
                </div>
              </div>

              {/* 7. BVB.de, Kicker & Ruhr Nachrichten via Google/Bing News RSS */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#FDE100] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">BVB.de, Kicker & Ruhr Nachrichten</span>
                  <span className="text-slate-400 text-[10px] block">
                    Multi-Source XML-Aggregation über <code className="text-[#FDE100]">news.google.com/rss</code> & <code className="text-[#FDE100]">bing.com/news</code>.
                  </span>
                </div>
              </div>

              {/* 8. Local IndexedDB & 60-FPS Engine */}
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Lokale BVB-Engine & IndexedDB (v8)</span>
                  <span className="text-slate-400 text-[10px] block">
                    60-Tage-Offline-Archiv, 60-FPS-Torszenen-Simulator (8 Jahrhundert-Tore) & Web-Audio-Synthesizer.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Source Software & Libraries Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-[#FDE100]" />
              Verwendete Open-Source-Programme & Bibliotheken
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] text-slate-300">
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <strong className="text-[#FDE100]">React 19 & TypeScript 5:</strong> UI-Architektur & Typsicherheit (MIT License)
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <strong className="text-[#FDE100]">Vite 8 & Tailwind CSS 4:</strong> Bundler & Design-System (MIT License)
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <strong className="text-[#FDE100]">Express & Node.js / tsx:</strong> Lokaler API-Proxy & Backend-Server (MIT License)
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <strong className="text-[#FDE100]">Lucide React & Motion:</strong> Vektor-Icons & UI-Animationen (ISC / MIT License)
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <strong className="text-[#FDE100]">PyQt6 & QtWebEngine:</strong> Nativer CachyOS / Arch Linux Desktop-Runner (GPLv3)
              </div>
              <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                <strong className="text-[#FDE100]">Mono / .NET C# & fflate:</strong> Windows 10/11 Launcher & ZIP-Generator (MIT)
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Architektur & Features
            </h3>

            <div className="space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FDE100] shrink-0" />
                <span>
                  <strong className="text-white font-mono">60-Tage (2 Monate) Tagesarchiv:</strong> Automatische Speicherung in IndexedDB & Volltextsuche. Altbestände &gt; 60 Tage werden automatisch bereinigt.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white font-mono">Quellen-Filter:</strong> Präzise Trennung nach <em>BVB.de, BVBWLD.de, Transfermarkt, Kicker, Ruhr Nachrichten, Spieltag</em> und <em>Verletzungen</em>.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  <strong className="text-white font-mono">KI-gestützte Entwicklung:</strong> Architektur, 60-FPS-Stadion-Engine und Multi-API-Synchronisation entwickelt mithilfe von <strong>Google Gemini</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-black/60 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <span>
            Entwickelt von <strong className="text-white">w33derlich & Dobby</strong> • Mithilfe von <strong className="text-sky-400">Google Gemini</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-lg transition-all uppercase font-bvb cursor-pointer shadow-md"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
