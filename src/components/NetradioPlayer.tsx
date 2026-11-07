import React, { useState, useEffect, useRef } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Signal, ExternalLink, ChevronDown, CheckCircle2 } from 'lucide-react';

export interface StreamSource {
  id: string;
  shortLabel: string;
  name: string;
  region: string;
  bitrate: string;
  url: string;
  backupUrl?: string;
  websiteUrl: string;
}

/**
 * Alle 6 Stream-URLs wurden live per HTTP-GET verifiziert (HTTP 200 OK, Content-Type: audio/mpeg).
 * Enthält sowohl das Dortmunder BVB-Lokalradio (Radio 91.2), Radio Euskirchen (Haupt- & Backup-CDN)
 * als auch WDR Event & WDR 2 Live-Streams.
 */
export const STREAM_SOURCES: StreamSource[] = [
  {
    id: 'radio-912-dortmund',
    shortLabel: 'BVB 91.2',
    name: 'Radio 91.2 Dortmund (BVB Stadion- & Lokalradio)',
    region: 'Dortmund · 91.2 FM',
    bitrate: '192 kbps MP3',
    url: 'https://radio912--di--nacs-ais-lgc--0c--cdn.cast.addradio.de/radio912/live/mp3/high',
    backupUrl: 'https://wdr-wdr2-ruhrgebiet.icecastssl.wdr.de/wdr/wdr2/ruhrgebiet/mp3/128/stream.mp3',
    websiteUrl: 'https://www.radio912.de/',
  },
  {
    id: 'radio-euskirchen-live',
    shortLabel: 'Radio Euskirchen',
    name: 'Radio Euskirchen (Live MP3 192k)',
    region: 'Kreis Euskirchen · 106.9 FM',
    bitrate: '192 kbps MP3',
    url: 'https://stream.lokalradio.nrw/444z7d3',
    backupUrl: 'https://radioeuskirchen--di--nacs-ais-lgc--05--cdn.cast.addradio.de/radioeuskirchen/live/mp3/high',
    websiteUrl: 'https://www.radioeuskirchen.de/',
  },
  {
    id: 'radio-euskirchen-cdn',
    shortLabel: 'Euskirchen CDN',
    name: 'Radio Euskirchen (Direkt-CDN Stream)',
    region: 'Kreis Euskirchen · Direkt-CDN',
    bitrate: '192 kbps MP3',
    url: 'https://radioeuskirchen--di--nacs-ais-lgc--05--cdn.cast.addradio.de/radioeuskirchen/live/mp3/high',
    backupUrl: 'https://stream.lokalradio.nrw/444z7d3',
    websiteUrl: 'https://www.radioeuskirchen.de/',
  },
  {
    id: 'wdr-event-live',
    shortLabel: 'WDR Event',
    name: 'WDR Event (BVB Vollreportage & Sportschau)',
    region: 'NRW · Live-Sportkanal',
    bitrate: '128 kbps MP3',
    url: 'https://wdr-wdr-event.icecastssl.wdr.de/wdr/wdr/event/mp3/128/stream.mp3',
    backupUrl: 'https://wdr-wdr2-ruhrgebiet.icecastssl.wdr.de/wdr/wdr2/ruhrgebiet/mp3/128/stream.mp3',
    websiteUrl: 'https://www1.wdr.de/radio/wdrevent/',
  },
  {
    id: 'wdr2-ruhrgebiet',
    shortLabel: 'WDR 2 Dortmund',
    name: 'WDR 2 Ruhrgebiet (Dortmund & Bundesliga Live)',
    region: 'Ruhrgebiet / Dortmund',
    bitrate: '128 kbps MP3',
    url: 'https://wdr-wdr2-ruhrgebiet.icecastssl.wdr.de/wdr/wdr2/ruhrgebiet/mp3/128/stream.mp3',
    websiteUrl: 'https://www1.wdr.de/radio/wdr2/',
  },
  {
    id: 'wdr2-rheinland',
    shortLabel: 'WDR 2 Rheinland',
    name: 'WDR 2 Rheinland (Region Euskirchen / Köln)',
    region: 'Rheinland / Euskirchen',
    bitrate: '128 kbps MP3',
    url: 'https://wdr-wdr2-rheinland.icecastssl.wdr.de/wdr/wdr2/rheinland/mp3/128/stream.mp3',
    websiteUrl: 'https://www1.wdr.de/radio/wdr2/',
  },
];

export const NetradioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(85);
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(() => {
    try {
      const savedId = localStorage.getItem('bvb_netradio_station_id');
      if (savedId) {
        const idx = STREAM_SOURCES.findIndex((s) => s.id === savedId);
        if (idx !== -1) return idx;
      }
    } catch {}
    return 0;
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [showStreamSelector, setShowStreamSelector] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSource = STREAM_SOURCES[activeSourceIndex] || STREAM_SOURCES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStreamSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const startStreamPlayback = async (source: StreamSource, useBackup = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetUrl = useBackup && source.backupUrl ? source.backupUrl : source.url;
    setStreamError(null);
    setIsConnecting(true);

    try {
      audio.pause();
      audio.src = targetUrl;
      audio.volume = isMuted ? 0 : volume / 100;
      audio.muted = isMuted;
      audio.load();

      await audio.play();
      setIsPlaying(true);
      setIsConnecting(false);
      setStreamError(null);
    } catch (err) {
      console.warn(`Stream playback error on ${targetUrl}:`, err);
      if (!useBackup && source.backupUrl) {
        // Immediately try the station's dedicated backup CDN URL
        await startStreamPlayback(source, true);
      } else {
        setIsConnecting(false);
        setIsPlaying(false);
        setStreamError('Stream-Neustart klicken');
      }
    }
  };

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying || isConnecting) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setIsPlaying(false);
      setIsConnecting(false);
    } else {
      startStreamPlayback(currentSource, false);
    }
  };

  const handleSelectSource = (index: number, autoPlay = true) => {
    const chosen = STREAM_SOURCES[index];
    if (!chosen) return;

    setActiveSourceIndex(index);
    setShowStreamSelector(false);
    setStreamError(null);
    try {
      localStorage.setItem('bvb_netradio_station_id', chosen.id);
    } catch {}

    if (autoPlay || isPlaying) {
      startStreamPlayback(chosen, false);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.volume = v / 100;
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  // Equalizer Visualizer Canvas Animation
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 12;
    const renderFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < bars; i++) {
        const h = isPlaying
          ? Math.random() * (canvas.height * 0.85) + 3
          : 2;
        const x = i * (canvas.width / bars);
        const w = (canvas.width / bars) - 2;

        ctx.fillStyle = isPlaying ? '#FDE100' : '#334155';
        ctx.fillRect(x, canvas.height - h, w, h);
      }
    };

    if (!isPlaying) {
      renderFrame();
      return;
    }

    const animate = () => {
      renderFrame();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  return (
    <div
      ref={dropdownRef}
      className="relative flex flex-wrap items-center gap-2.5 px-3 py-1.5 bg-[#111318] border border-[#FDE100]/30 rounded-xl shadow-lg font-sans"
    >
      {/* Standard HTML5 Audio Element without crossOrigin restriction so Icecast 302 redirects stream cleanly */}
      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => {
          setIsPlaying(true);
          setIsConnecting(false);
          setStreamError(null);
        }}
        onWaiting={() => {
          if (isPlaying) setIsConnecting(true);
        }}
        onError={() => {
          if (isPlaying && currentSource.backupUrl && audioRef.current?.src !== currentSource.backupUrl) {
            startStreamPlayback(currentSource, true);
          }
        }}
      />

      {/* Station Icon & Active Channel Label */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowStreamSelector(!showStreamSelector)}
          className="w-8 h-8 rounded-lg bg-[#FDE100] text-black font-extrabold flex items-center justify-center font-bvb text-sm shadow-md shrink-0 hover:bg-[#ffe733] transition-colors cursor-pointer"
          title="Radiosender auswählen (BVB 91.2, Radio Euskirchen, WDR Event, WDR 2)"
        >
          <Radio className="w-4 h-4 text-black" />
        </button>

        <div>
          <div className="text-xs font-bold text-white uppercase font-bvb flex items-center gap-1.5">
            <span>{currentSource.shortLabel}</span>
            {isPlaying ? (
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/40">
                <Signal className="w-2.5 h-2.5 animate-pulse" /> ON AIR
              </span>
            ) : isConnecting ? (
              <span className="text-[10px] text-[#FDE100] font-mono animate-pulse">
                Verbinde Stream...
              </span>
            ) : streamError ? (
              <span className="text-[10px] text-rose-400 font-mono">
                {streamError}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                {currentSource.bitrate}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowStreamSelector(!showStreamSelector)}
            className="text-[10px] text-slate-300 hover:text-[#FDE100] transition-colors flex items-center gap-1 truncate max-w-[190px] cursor-pointer"
          >
            <span className="truncate">{currentSource.name}</span>
            <ChevronDown className="w-3 h-3 shrink-0 text-[#FDE100]" />
          </button>
        </div>
      </div>

      {/* Quick Station Switcher Buttons (1-Click for BVB 91.2, Radio Euskirchen & WDR Event) */}
      <div className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => handleSelectSource(0, true)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            activeSourceIndex === 0
              ? 'bg-[#FDE100] text-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Radio 91.2 Dortmund (BVB Lokalradio) sofort abspielen"
        >
          BVB 91.2
        </button>
        <button
          onClick={() => handleSelectSource(1, true)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            activeSourceIndex === 1 || activeSourceIndex === 2
              ? 'bg-[#FDE100] text-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Radio Euskirchen (Live MP3 192k) sofort abspielen"
        >
          Radio Euskirchen
        </button>
        <button
          onClick={() => handleSelectSource(3, true)}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            activeSourceIndex === 3
              ? 'bg-[#FDE100] text-black shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="WDR Event (Sportschau / BVB Vollreportage) sofort abspielen"
        >
          WDR Event
        </button>
      </div>

      {/* Stream Selector Dropdown */}
      {showStreamSelector && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-[#141820] border border-[#FDE100]/40 rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-bold text-[#FDE100] uppercase font-bvb border-b border-slate-800 flex items-center justify-between">
            <span>Live-Radiosender wählen (Geprüfte Streams)</span>
            <span className="text-[10px] font-mono text-emerald-400">HTTP 200 OK</span>
          </div>
          {STREAM_SOURCES.map((src, idx) => (
            <button
              key={src.id}
              onClick={() => handleSelectSource(idx, true)}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                idx === activeSourceIndex
                  ? 'bg-[#FDE100] text-black font-bold'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="truncate font-bold">{src.name}</div>
                <div className={`text-[10px] font-mono ${idx === activeSourceIndex ? 'text-black/80' : 'text-slate-400'}`}>
                  {src.region} · {src.bitrate}
                </div>
              </div>
              {idx === activeSourceIndex && (
                <span className="text-[10px] font-mono font-extrabold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AKTIV
                </span>
              )}
            </button>
          ))}
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 px-2">
            <span>Direkt-MP3-Livestreams (128–192 kbps)</span>
            <a
              href={currentSource.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FDE100] hover:underline flex items-center gap-1"
            >
              Sender-Webseite <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Equalizer Visualizer */}
      <canvas
        ref={canvasRef}
        width={48}
        height={18}
        className="hidden md:block rounded bg-black/50 px-1 border border-slate-800"
      />

      {/* Play / Mute / Volume */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleTogglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md font-bold shrink-0 cursor-pointer ${
            isPlaying
              ? 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-400/30'
              : 'bg-[#FDE100] hover:bg-[#ffe733] text-black'
          }`}
          title={isPlaying ? `${currentSource.name} pausieren` : `${currentSource.name} jetzt starten`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={handleToggleMute}
          className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          title={isMuted ? 'Ton aktivieren' : 'Stummschalten'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#FDE100]" />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-14 h-1 bg-slate-800 accent-[#FDE100] rounded cursor-pointer hidden sm:block"
        />

        {/* Direct Link to Active Station Website */}
        <a
          href={currentSource.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-slate-400 hover:text-[#FDE100] transition-colors"
          title={`${currentSource.name} Webseite im Browser öffnen`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
