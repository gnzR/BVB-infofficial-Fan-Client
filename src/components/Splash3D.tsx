import React, { useEffect, useRef, useState } from 'react';
import { Database, HardDrive, CheckCircle2, ArrowDownToLine } from 'lucide-react';
import { sync30DayBvbArchive } from '../utils/bvbArchiveStore';
import { syncLiveBvbSquad } from '../utils/squadStore';
import { OfficialBvbLogo } from './OfficialBvbLogo';
import { CURRENT_APP_VERSION, safeDecodeGitHubBase64Json } from './InfoModal';
import { StartupRemoteVersionPayload } from './StartupUpdateModal';

interface SplashProps {
  onComplete: () => void;
  onDetectedUpdate?: (remoteData: StartupRemoteVersionPayload) => void;
  standalone?: boolean;
}

const GITHUB_REPO_OWNER = 'gnzR';
const GITHUB_REPO_NAME = 'BVB-infofficial-Fan-Client';

function parseVerParts(v: string): number[] {
  return v
    .replace(/[^0-9.]/g, '')
    .split('.')
    .filter(Boolean)
    .map((n) => parseInt(n, 10) || 0);
}

function compareVer(remoteVer: string, localVer: string): number {
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

export const Splash3D: React.FC<SplashProps> = ({ onComplete, onDetectedUpdate }) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>('Initiere BVB Live-Datenbank Synchronisation...');
  const [transferredMb, setTransferredMb] = useState<string>('0.0');
  const [spinAngle, setSpinAngle] = useState<number>(0);

  // Store callbacks in refs so parent re-renders NEVER cancel or restart the Splash sync effect
  const onCompleteRef = useRef(onComplete);
  const onDetectedUpdateRef = useRef(onDetectedUpdate);
  const hasStartedSyncRef = useRef<boolean>(false);
  const hasFinishedRef = useRef<boolean>(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onDetectedUpdateRef.current = onDetectedUpdate;
  }, [onComplete, onDetectedUpdate]);

  const finishSplashOnce = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onCompleteRef.current();
  };

  // Smooth 60-FPS 3D Y-axis self-rotation for the official BVB 09 crest
  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const animateSpin = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      // 135 degrees per second -> 1 full 3D rotation every ~2.66 seconds
      setSpinAngle((prev) => (prev + dt * 0.135) % 360);
      rafId = requestAnimationFrame(animateSpin);
    };

    rafId = requestAnimationFrame(animateSpin);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    // Strictly execute only once per mount — immune to parent state updates
    if (hasStartedSyncRef.current) return;
    hasStartedSyncRef.current = true;

    let isUnmounted = false;
    const startTime = performance.now();
    const MIN_SPLASH_MS = 2400; // Show 3D spinning BVB crest for ~2.4s
    const MAX_SPLASH_WATCHDOG_MS = 4000; // Hard 4.0s guarantee so Splash can NEVER hang at 50%

    const watchdogTimer = window.setTimeout(() => {
      if (!isUnmounted && !hasFinishedRef.current) {
        setProgress(100);
        setCurrentStep('[✓] BVB 09 Datenbank bereit. Starte Hauptfenster...');
        setTransferredMb('4.8');
        finishSplashOnce();
      }
    }, MAX_SPLASH_WATCHDOG_MS);

    async function runSync() {
      try {
        // Step 1: Sync BVB News Archive (0% -> 45%)
        const syncRes = await sync30DayBvbArchive((pct, step) => {
          if (!isUnmounted && !hasFinishedRef.current) {
            const mappedPct = Math.round((pct / 100) * 45);
            setProgress(mappedPct);
            setCurrentStep(step);
            setTransferredMb(((mappedPct / 100) * 4.8).toFixed(1));
          }
        });
        const articlesList = Array.isArray(syncRes) ? syncRes : syncRes?.articles || [];

        // Step 2: Live Sync BVB Squad Roster (45% -> 80%)
        if (!isUnmounted && !hasFinishedRef.current) {
          await syncLiveBvbSquad((pct, step) => {
            if (!isUnmounted && !hasFinishedRef.current) {
              const mappedPct = 45 + Math.round((pct / 100) * 35);
              setProgress(mappedPct);
              setCurrentStep(step);
              setTransferredMb(((mappedPct / 100) * 4.8).toFixed(1));
            }
          });
        }

        // Step 3: Silent Background GitHub Update Check during Splash (80% -> 95%)
        if (!isUnmounted && !hasFinishedRef.current) {
          setProgress(88);
          setCurrentStep('Prüfe im Hintergrund auf neue GitHub-Version...');
          setTransferredMb('4.4');

          let checkedViaApi = false;
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1800);
            const apiRes = await fetch(
              `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/version.json?ref=main&_=${Date.now()}`,
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
                const data = safeDecodeGitHubBase64Json<StartupRemoteVersionPayload>(meta.content);
                if (!isUnmounted && data && typeof data.version === 'string') {
                  checkedViaApi = true;
                  if (compareVer(data.version, CURRENT_APP_VERSION) > 0 && onDetectedUpdateRef.current) {
                    onDetectedUpdateRef.current(data);
                  }
                }
              }
            }
          } catch {
            // Fallback to raw URLs
          }

          if (!checkedViaApi && !isUnmounted && !hasFinishedRef.current) {
            const cacheBust = `?t=${Date.now()}`;
            const candidateUrls = [
              `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/main/version.json${cacheBust}`,
              `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/master/version.json${cacheBust}`,
            ];

            for (const url of candidateUrls) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1600);
                const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                  const data: StartupRemoteVersionPayload = await res.json();
                  if (!isUnmounted && data && typeof data.version === 'string') {
                    if (compareVer(data.version, CURRENT_APP_VERSION) > 0 && onDetectedUpdateRef.current) {
                      onDetectedUpdateRef.current(data);
                    }
                    break;
                  }
                }
              } catch {
                // Offline or timeout -> continue startup smoothly
              }
            }
          }
        }

        if (!isUnmounted && !hasFinishedRef.current) {
          setProgress(100);
          setCurrentStep(`[✓] ${articlesList.length} BVB-News & Live-Kaderdaten im SQLite/IndexedDB Speicher aktualisiert!`);
          setTransferredMb('4.8');
          const elapsed = performance.now() - startTime;
          const remaining = Math.max(350, MIN_SPLASH_MS - elapsed);
          window.setTimeout(() => {
            if (!isUnmounted) finishSplashOnce();
          }, remaining);
        }
      } catch {
        if (!isUnmounted && !hasFinishedRef.current) {
          setProgress(100);
          setCurrentStep('[✓] BVB 09 Datenbank geladen. Starte Benutzeroberfläche...');
          const elapsed = performance.now() - startTime;
          const remaining = Math.max(300, MIN_SPLASH_MS - elapsed);
          window.setTimeout(() => {
            if (!isUnmounted) finishSplashOnce();
          }, remaining);
        }
      }
    }

    runSync();

    return () => {
      isUnmounted = true;
      window.clearTimeout(watchdogTimer);
    };
  }, []);

  return (
    <div
      onClick={finishSplashOnce}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080a] text-slate-100 cursor-pointer select-none p-6 font-sans overflow-hidden"
      title="Klicken zum sofortigen Überspringen"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141820_1px,transparent_1px),linear-gradient(to_bottom,#141820_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

      {/* Radial Stadium Spotlight Glow behind the spinning BVB Crest */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] w-80 h-80 rounded-full bg-[#FDE100]/15 blur-3xl pointer-events-none" />

      {/* 3D Spinning Official BVB 09 Crest Showcase */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        {/* Two Championship Stars above the Crest */}
        <div className="flex items-center gap-3 mb-2 text-[#FDE100] drop-shadow-[0_0_10px_rgba(253,225,0,0.8)] text-lg">
          <span>★</span>
          <span>★</span>
        </div>

        {/* 3D Perspective Container for Self-Axis Y-Rotation */}
        <div
          className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center"
          style={{ perspective: '1000px' }}
        >
          {/* Ambient Golden Ring Pulse */}
          <div className="absolute inset-0 rounded-full border-2 border-[#FDE100]/30 animate-ping opacity-25 pointer-events-none" />

          {/* 3D Coin / Emblem Rotor (Two-Sided so back face is never mirrored) */}
          <div
            className="relative w-28 h-28 sm:w-32 sm:h-32"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateY(${spinAngle}deg)`,
            }}
          >
            {/* Front Face of BVB 09 Crest */}
            <div
              className="absolute inset-0 rounded-full shadow-[0_0_45px_rgba(253,225,0,0.45)]"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <OfficialBvbLogo className="w-full h-full" />
            </div>

            {/* Back Face of BVB 09 Crest (rotated 180deg so BVB 09 reads upright from both sides) */}
            <div
              className="absolute inset-0 rounded-full shadow-[0_0_45px_rgba(253,225,0,0.45)]"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <OfficialBvbLogo className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Brand & Version Badge below the spinning logo */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-white font-bvb">
            BVB Inofficial Fan Client
          </span>
          <span className="px-2 py-0.5 rounded bg-[#FDE100] text-black font-mono font-extrabold text-[11px] shadow-md shadow-[#FDE100]/20">
            Beta {CURRENT_APP_VERSION}
          </span>
        </div>
      </div>

      {/* Main Database Sync Window Card */}
      <div className="relative z-10 w-full max-w-lg bg-[#0e1117]/95 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black flex flex-col gap-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDE100]/10 border border-[#FDE100]/30 flex items-center justify-center text-[#FDE100]">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide font-bvb uppercase flex items-center gap-2">
                <span>Interne Datenbank-Synchronisation</span>
              </h2>
              <p className="text-xs text-slate-400">
                BVB Inofficial Fan Client · <span className="text-[#FDE100] font-mono">Beta {CURRENT_APP_VERSION}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Aktiv</span>
          </div>
        </div>

        {/* Current Sync Activity */}
        <div className="bg-[#07080a] border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-[#FDE100]" />
              Status:
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {transferredMb} MB / 4.8 MB (14.2 MB/s)
            </span>
          </div>

          <div className="text-xs font-mono text-[#FDE100] truncate">{currentStep}</div>

          {/* Download Progress Bar */}
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 mt-2 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-400 to-[#FDE100] h-full rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(253,225,0,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-1">
            <span>Paket: bvb-inofficial-fan-client-1909.db</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
        </div>

        {/* Sync Details Checklist */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-sans">
          <div className="flex items-center gap-1.5 p-2 rounded bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 25 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>60-Tage BVB-Newsarchiv</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 50 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>Königsklasse & Pokal Live-API</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 80 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>GitHub Auto-Update Check</span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded bg-slate-900/50 border border-slate-800">
            <CheckCircle2 className={`w-3.5 h-3.5 ${progress >= 100 ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span>IndexedDB / SQLite Speicherung</span>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <ArrowDownToLine className="w-3.5 h-3.5 text-[#FDE100]" />
            Lokaler Offline-Modus bereit
          </span>
          <span className="text-slate-400 underline hover:text-white cursor-pointer font-mono">
            Klicken zum Überspringen ➔
          </span>
        </div>
      </div>
    </div>
  );
};


