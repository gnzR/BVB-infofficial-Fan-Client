import React from 'react';
import { X, ShieldCheck, Database, Cpu, Code2, Globe, Heart, Sparkles, CloudSun, Radio, Layers } from 'lucide-react';
import { OfficialBvbLogo } from './OfficialBvbLogo';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
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
                  Beta 1.9.0.9
                </span>
              </h2>
              <p className="text-xs text-slate-400">System-Informationen, Entwickler, Datenquellen & Open-Source-Lizenzen</p>
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
                Entwickelt von <strong className="text-white">w33derlich & Dobby</strong> als eigenständiger Desktop-Client für CachyOS (Arch Linux) & Windows 10/11 – <strong className="text-sky-300">erstellt mithilfe von Google Gemini</strong>.
              </p>
            </div>
            <div className="px-3.5 py-2.5 rounded-lg bg-black/60 border border-slate-800 text-center shrink-0 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Version</span>
              <span className="text-sm font-extrabold text-[#FDE100] block">Beta 1.9.0.9</span>
              <span className="text-[10px] text-sky-400 block mt-0.5">Gemini AI Build</span>
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
                    28 Profis + Cheftrainer Niko Kovač inkl. direkter Verknüpfung in Königsklasse & DFB-Pokal.
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
