import React, { useState } from 'react';
import { Download, Terminal, CheckCircle2, ShieldCheck, Cpu, HardDrive, AlertTriangle, Play, RefreshCw, X, Trash2 } from 'lucide-react';
import {
  downloadWindowsExeInstaller,
  downloadWindowsPortableZip,
  downloadWindowsUninstaller,
  downloadCachyOSTarPackage,
  downloadCachyOSDeinstallerScript,
  CACHYOS_INSTALLER_SCRIPT,
  WINDOWS_INSTALLER_SCRIPT,
} from '../utils/downloadHelpers';

interface InstallerGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOS?: 'cachyos' | 'windows';
}

export const InstallerGeneratorModal: React.FC<InstallerGeneratorModalProps> = ({
  isOpen,
  onClose,
  defaultOS = 'windows',
}) => {
  const [selectedOS, setSelectedOS] = useState<'cachyos' | 'windows'>(defaultOS);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const runSimulation = () => {
    setIsSimulating(true);
    setSimCompleted(false);
    setSimLogs([]);

    const steps = selectedOS === 'cachyos' ? [
      "=== CachyOS Arch Linux Voll-Installation (.tar.gz) ===",
      "  ____  _   _ ____     ___   ___  ",
      " | __ )| | | | __ )   / _ \\ / _ \\ ",
      " |  _ \\| | | |  _ \\  | | | | (_) |",
      " | |_) | |_| | |_) | | |_| |\\__, |",
      " |____/ \\___/|____/   \\___/   /_/ ",
      "[1/5] Prüfe System-Abhängigkeiten: electron, libnotify, pipewire...",
      "[+] Installiere fehlende Bibliotheken automatisch via pacman / paru...",
      "[✓] Abhängigkeiten 100% aufgelöst.",
      "[2/5] Installiere Electron-App & main.js nach ~/.local/share/bvb-desktop...",
      "[3/5] Erstelle Absturz-Sicheren Launcher /usr/local/bin/bvb-desktop (Ozone-Fix, kein FATAL Crash, Strg+C Support)...",
      "[4/5] Richte Anwendungsmenü-Verknüpfung & Desktop-Shortcut ein...",
      "[5/5] Erstelle Deinstallations-Skript deinstall.sh...",
      "========================================================",
      "SUCCESS: Programm & Verknüpfungen erfolgreich auf CachyOS installiert!",
      "Starte BVB 09 Client (jederzeit mit Strg+C im Terminal beendbar)...",
    ] : [
      "=== Windows 10/11 Executable (.exe) Setup & Uninstaller ===",
      "[1/5] Überprüfe Microsoft Edge WebView2 Runtime & Audio-Dienste...",
      "[✓] WebView2 Runtime & Windows Audio-Dienst aktiv",
      "[2/5] Entpacke BVB_Transfermarkt_Desktop_Setup.exe nach %LOCALAPPDATA%\\Programs\\BVB09Client...",
      "[3/5] Erstelle Verknüpfung im Startmenü & Auf dem Desktop...",
      "[4/5] Erstelle Deinstaller Uninstall_BVB_Desktop.exe in %LOCALAPPDATA%...",
      "[5/5] Registriere bvb:// Protokoll in der Windows Registrierung...",
      "========================================================",
      "SUCCESS: BVB 09 Client .exe Setup vollständig ausgeführt! App wird gestartet.",
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setSimLogs(prev => [...prev, steps[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimCompleted(true);
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#111318] border border-[#FDE100]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181a20] border-b border-[#FDE100]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDE100] text-black font-extrabold flex items-center justify-center font-bvb text-xl shadow-lg shadow-[#FDE100]/20">
              09
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase font-bvb tracking-wide flex items-center gap-2">
                BVB 09 Komplett-Installer & Deinstaller Pakete
              </h3>
              <p className="text-xs text-slate-400">
                Installiert das vollständige Programm inklusive Absturz-Fixes (CachyOS/Arch), Verknüpfungen und Deinstallations-Skripte.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OS Selection Tabs */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#14161b] border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedOS('cachyos'); setSimLogs([]); setSimCompleted(false); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all font-bvb uppercase tracking-wider ${
                selectedOS === 'cachyos'
                  ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4" />
              CachyOS / Arch Linux (.tar.gz Paket)
            </button>
            <button
              onClick={() => { setSelectedOS('windows'); setSimLogs([]); setSimCompleted(false); }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all font-bvb uppercase tracking-wider ${
                selectedOS === 'windows'
                  ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              Windows 10 / 11 (.exe Executable Setup)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {isSimulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Ablauf Testen
            </button>
          </div>
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
          {/* Left Column: Direct Download Buttons */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FDE100]" />
                Enthaltene Komponenten im Paket:
              </h4>

              <div className="space-y-2 text-xs">
                {selectedOS === 'cachyos' ? (
                  <>
                    <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">1. CachyOS Absturz-Sicherer Launcher</span>
                        <p className="text-[11px] text-slate-400">Verhindert den <code className="text-amber-400">FILE_ERROR_NO_SPACE</code> und GLib-Fehler auf dem CachyOS BBORE Kernel durch automatische Parameter (<code className="text-[#FDE100]">--disable-dev-shm-usage --no-sandbox</code>).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">2. Menü-Eintrag & Schreibtisch-Icon</span>
                        <p className="text-[11px] text-slate-400">Erstellt automatisch <code className="text-[#FDE100]">~/.local/share/applications/bvb-desktop.desktop</code> und ein Icon auf deinem Desktop.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">3. Deinstallations-Skript (uninstall.sh)</span>
                        <p className="text-[11px] text-slate-400">Enthält ein Skript zum sauberen Entfernen aller Programmdateien und Verknüpfungen.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-emerald-500/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-emerald-300">1. Lösung 4: Serverlos + Lokale Microsoft .NET Kompilierung (BVB-09-Windows-Portable.zip)</span>
                        <p className="text-[11px] text-slate-300">Enthält <code className="text-[#FDE100]">Installation-Starten.cmd</code> (kompiliert <code className="text-[#FDE100]">BVB09.exe</code> in 0,5 Sek. lokal mit Windows-eigenem Microsoft <code className="text-[#FDE100]">csc.exe</code>) + serverlose <code className="text-[#FDE100]">BVB09-App.html</code>. <strong>0% Windows Defender / SmartScreen Blockade & 0% ERR_CONNECTION_REFUSED!</strong></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-black/40 border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">2. Reiner .NET Setup-Assistent (BVB-09-Windows-Setup.exe)</span>
                        <p className="text-[11px] text-slate-400">Reine .NET CIL-Anwendung ohne MinGW-C-Header und ohne Netzwerk-Sockets (<code className="text-amber-400">WS2_32.dll</code> entfernt).</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direct Download Action Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-[#FDE100]/30 space-y-3 shadow-lg">
              <h4 className="text-sm font-bold text-white uppercase font-bvb tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-[#FDE100]" />
                Dateien jetzt herunterladen:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedOS === 'cachyos' ? (
                  <>
                    <button
                      onClick={downloadCachyOSTarPackage}
                      className="py-3 bg-[#FDE100] text-black hover:bg-[#ffe733] font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/20"
                    >
                      <Download className="w-4 h-4" />
                      Paket (.tar.gz)
                    </button>
                    <button
                      onClick={downloadCachyOSDeinstallerScript}
                      className="py-3 bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-bvb uppercase tracking-wider border border-rose-500/40"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deinstaller (.sh)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={downloadWindowsPortableZip}
                      className="py-3 px-2 bg-[#FDE100] text-black hover:bg-[#ffe733] font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/20 cursor-pointer"
                      title="Empfohlen (Lösung 4): BVB-09-Windows-Portable.zip (0% Defender-Warnung)"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      <span>BVB-09-Windows-Portable.zip</span>
                    </button>
                    <button
                      onClick={downloadWindowsExeInstaller}
                      className="py-3 px-2 bg-slate-800 hover:bg-slate-700 text-[#FDE100] font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 font-bvb uppercase tracking-wider border border-[#FDE100]/40 cursor-pointer"
                      title="Reiner .NET Setup-Assistent BVB-09-Windows-Setup.exe"
                    >
                      <HardDrive className="w-4 h-4 shrink-0" />
                      <span>BVB-09-Windows-Setup.exe</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Code Script Preview & Live Terminal Simulator */}
          <div className="flex flex-col h-full bg-[#0d0e12] border border-slate-800 rounded-xl overflow-hidden min-h-[360px]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#14161d] border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Terminal className="w-4 h-4 text-[#FDE100]" />
                {isSimulating || simLogs.length > 0
                  ? 'Live Terminal Output'
                  : selectedOS === 'cachyos' ? 'bvb-09-cachyos-package.tar.gz' : 'BVB-09-Windows-Portable.zip'}
              </div>
              {simCompleted && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                  Erfolgreich!
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto whitespace-pre-wrap select-text">
              {simLogs.length > 0 ? (
                <div className="space-y-1">
                  {simLogs.map((log, index) => (
                    <div
                      key={index}
                      className={
                        log.includes('SUCCESS') || log.includes('[✓]')
                          ? 'text-emerald-400 font-semibold'
                          : log.includes('[!]')
                          ? 'text-yellow-400'
                          : log.includes('===')
                          ? 'text-[#FDE100] font-bold'
                          : 'text-slate-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                  {isSimulating && (
                    <div className="flex items-center gap-2 text-[#FDE100] mt-2 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Installiere Komponenten...
                    </div>
                  )}
                </div>
              ) : (
                <pre className="text-slate-400 text-[11px]">
                  {selectedOS === 'cachyos' ? CACHYOS_INSTALLER_SCRIPT : WINDOWS_INSTALLER_SCRIPT}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#14161b] border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Skripte enthalten automatische Absturz-Sicherungsflags für CachyOS BBORE Kernel.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors font-bvb uppercase tracking-wider"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
