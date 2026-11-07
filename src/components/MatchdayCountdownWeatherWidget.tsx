import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, Calendar, Clock, Download, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';
import { getOpenLigaBvbMatches, FormattedBvbMatch } from '../utils/openLigaService';

interface StadiumWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  updatedAt: string;
}

interface UpcomingFixture {
  id: string;
  competition: string;
  matchday: string;
  homeTeam: string;
  awayTeam: string;
  isHome: boolean;
  isoDate: string;
  venue: string;
}

const DEFAULT_UPCOMING_FIXTURES: UpcomingFixture[] = [
  {
    id: 'bvb-bl-elv-20261107',
    competition: '1. Bundesliga',
    matchday: '9. Spieltag',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'SV 07 Elversberg',
    isHome: true,
    isoDate: '2026-11-07T14:30:00Z',
    venue: 'Signal Iduna Park, Dortmund (81.365 Plätze)',
  },
  {
    id: 'bvb-bl-m05-20261121',
    competition: '1. Bundesliga',
    matchday: '10. Spieltag',
    homeTeam: '1. FSV Mainz 05',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    isoDate: '2026-11-21T14:30:00Z',
    venue: 'MEWA Arena, Mainz',
  },
  {
    id: 'bvb-ucl-ars-20261124',
    competition: 'UEFA Champions League',
    matchday: 'Ligaphase · 5. Spieltag',
    homeTeam: 'FC Arsenal',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    isoDate: '2026-11-24T20:00:00Z',
    venue: 'Emirates Stadium, London',
  },
  {
    id: 'bvb-bl-tsg-20261128',
    competition: '1. Bundesliga',
    matchday: '11. Spieltag',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'TSG 1899 Hoffenheim',
    isHome: true,
    isoDate: '2026-11-28T14:30:00Z',
    venue: 'Signal Iduna Park, Dortmund',
  },
  {
    id: 'bvb-ucl-int-20261209',
    competition: 'UEFA Champions League',
    matchday: 'Ligaphase · 6. Spieltag',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'Inter Mailand',
    isHome: true,
    isoDate: '2026-12-09T20:00:00Z',
    venue: 'Signal Iduna Park, Dortmund',
  },
  {
    id: 'bvb-ucl-avl-20270119',
    competition: 'UEFA Champions League',
    matchday: 'Ligaphase · 7. Spieltag',
    homeTeam: 'Aston Villa',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    isoDate: '2027-01-19T20:00:00Z',
    venue: 'Villa Park, Birmingham',
  },
  {
    id: 'bvb-ucl-aek-20270127',
    competition: 'UEFA Champions League',
    matchday: 'Ligaphase · 8. Spieltag',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'AEK Athen',
    isHome: true,
    isoDate: '2027-01-27T20:00:00Z',
    venue: 'Signal Iduna Park, Dortmund',
  },
];

function decodeWmoWeatherCode(code: number): string {
  if (code === 0) return 'Klarer Himmel · Perfektes Stadionwetter';
  if (code === 1 || code === 2) return 'Leicht bewölkt · Ideales Fußballwetter';
  if (code === 3) return 'Bedeckt über dem Ruhrgebiet';
  if (code >= 45 && code <= 48) return 'Nebel über der Strobelallee';
  if (code >= 51 && code <= 57) return 'Leichter Nieselregen (Schneller Rasen)';
  if (code >= 61 && code <= 67) return 'Fritz-Walter-Regenwetter in Dortmund';
  if (code >= 71 && code <= 77) return 'Schneefall im Signal Iduna Park';
  if (code >= 80 && code <= 82) return 'Regenschauer · Rutschiger Rasen';
  if (code >= 95) return 'Gewitterwarnung über Dortmund';
  return 'Trockenes Stadionwetter';
}

export const MatchdayCountdownWeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<StadiumWeather>({
    temperature: 6.2,
    apparentTemperature: 3.5,
    humidity: 76,
    precipitation: 0.0,
    windSpeed: 8.2,
    weatherCode: 1,
    conditionText: 'Leicht bewölkt · Ideales Fußballwetter',
    updatedAt: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
  });
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [fixtures, setFixtures] = useState<UpcomingFixture[]>(DEFAULT_UPCOMING_FIXTURES);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 1,
    hours: 18,
    minutes: 10,
    seconds: 0,
  });
  const [icsExported, setIcsExported] = useState<boolean>(false);

  // 1. Fetch Live Signal Iduna Park Weather from Open-Meteo (Dortmund Strobelallee 50: 51.4926, 7.4519)
  const fetchStadiumWeather = async () => {
    setIsLoadingWeather(true);
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.4926&longitude=7.4519&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Europe%2FBerlin',
        { signal: AbortSignal.timeout(4500) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.current) {
          const cur = data.current;
          setWeather({
            temperature: Number(cur.temperature_2m ?? 6.2),
            apparentTemperature: Number(cur.apparent_temperature ?? 3.5),
            humidity: Number(cur.relative_humidity_2m ?? 76),
            precipitation: Number(cur.precipitation ?? 0),
            windSpeed: Number(cur.wind_speed_10m ?? 8.0),
            weatherCode: Number(cur.weather_code ?? 1),
            conditionText: decodeWmoWeatherCode(Number(cur.weather_code ?? 1)),
            updatedAt: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          });
        }
      }
    } catch {
      // Keep clean fallback
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // 2. Load upcoming BVB matches from OpenLigaDB + UCL
  useEffect(() => {
    fetchStadiumWeather();
    (async () => {
      try {
        const blMatches: FormattedBvbMatch[] = await getOpenLigaBvbMatches(false);
        const now = Date.now();
        const futureBl: UpcomingFixture[] = blMatches
          .filter((m) => !m.isFinished && new Date(m.isoDate).getTime() > now)
          .map((m) => ({
            id: `bl-${m.matchID}`,
            competition: '1. Bundesliga',
            matchday: m.matchday,
            homeTeam: m.isHome ? 'Borussia Dortmund' : m.opponentName,
            awayTeam: m.isHome ? m.opponentName : 'Borussia Dortmund',
            isHome: m.isHome,
            isoDate: m.isoDate,
            venue: m.isHome ? 'Signal Iduna Park, Dortmund (81.365 Plätze)' : m.stadium || `Stadion (${m.opponentName})`,
          }));

        // Combine with UCL fixtures and deduplicate by date day
        const combined = [...futureBl];
        for (const defFix of DEFAULT_UPCOMING_FIXTURES) {
          if (new Date(defFix.isoDate).getTime() > now) {
            const sameDay = combined.some(
              (c) => c.isoDate.slice(0, 10) === defFix.isoDate.slice(0, 10)
            );
            if (!sameDay) {
              combined.push(defFix);
            }
          }
        }
        combined.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
        if (combined.length > 0) {
          setFixtures(combined);
        }
      } catch {}
    })();
  }, []);

  const nextMatch = fixtures.find((f) => new Date(f.isoDate).getTime() > Date.now()) || fixtures[0];

  // 3. Second-by-second countdown timer
  useEffect(() => {
    const updateTimer = () => {
      if (!nextMatch) return;
      const targetMs = new Date(nextMatch.isoDate).getTime();
      const diffMs = Math.max(0, targetMs - Date.now());
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setCountdown({ days, hours, minutes, seconds });
    };
    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(timer);
  }, [nextMatch]);

  // 4. Generate & download .ics Calendar file for all upcoming BVB matches
  const handleDownloadIcs = () => {
    const formatIcsDate = (iso: string, addHours = 0) => {
      const d = new Date(new Date(iso).getTime() + addHours * 3600 * 1000);
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BVB 09 Transfermarkt & News Client//DE',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Borussia Dortmund 09 Spielplan 2026/27',
      'X-WR-TIMEZONE:Europe/Berlin',
    ];

    for (const fix of fixtures) {
      const dtStart = formatIcsDate(fix.isoDate, 0);
      const dtEnd = formatIcsDate(fix.isoDate, 2);
      const dtStamp = formatIcsDate(new Date().toISOString(), 0);
      const summary = `⚽ ${fix.homeTeam} vs. ${fix.awayTeam} (${fix.competition})`;
      const desc = `${fix.competition} - ${fix.matchday} | Cheftrainer: Niko Kovač | Exportiert aus dem BVB 09 Desktop Client`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${fix.id}@bvb09-desktop-client.de`,
        `DTSTAMP:${dtStamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${fix.venue}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        `DESCRIPTION:In 30 Minuten Anpfiff: ${summary}`,
        'END:VALARM',
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    const icsContent = lines.join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BVB-09-Spielplan-2026-27.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    setIcsExported(true);
    setTimeout(() => setIcsExported(false), 3500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-gradient-to-r from-[#111318] via-[#131720] to-[#111318] border border-[#FDE100]/30 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* LEFT / CENTER (7 cols): Next Match Kick-off Countdown + .ics Export */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-4 border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100]/20 text-[#FDE100] border border-[#FDE100]/40 text-[11px] font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-3 h-3 animate-spin" />
              ANPFIFF-COUNTDOWN
            </span>
            <span className="text-xs font-mono text-slate-400">
              {nextMatch.competition} · {nextMatch.matchday}
            </span>
          </div>

          <button
            onClick={handleDownloadIcs}
            className="px-3 py-1.5 rounded-xl bg-[#FDE100] hover:bg-[#ffe733] text-black font-bvb font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#FDE100]/20 transition-all cursor-pointer"
            title="Alle kommenden BVB-Pflichtspiele als .ics Kalenderdatei für Windows/Outlook/Smartphone speichern"
          >
            {icsExported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kalender (.ics) gespeichert!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Spielplan Export (.ics)</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-lg sm:text-xl font-black text-white font-bvb tracking-wide">
              {nextMatch.homeTeam} <span className="text-[#FDE100]">vs.</span> {nextMatch.awayTeam}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#FDE100]" />
                {new Date(nextMatch.isoDate).toLocaleDateString('de-DE', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}{' '}
                ·{' '}
                {new Date(nextMatch.isoDate).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                Uhr
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {nextMatch.venue}
              </span>
            </div>
          </div>

          {/* Digital Countdown Boxes */}
          <div className="flex items-center gap-2 shrink-0">
            {[
              { label: 'TAGE', val: countdown.days },
              { label: 'STD', val: countdown.hours },
              { label: 'MIN', val: countdown.minutes },
              { label: 'SEK', val: countdown.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="w-14 py-1.5 rounded-xl bg-black/80 border border-[#FDE100]/40 text-center shadow-inner"
              >
                <div className="text-lg font-black text-[#FDE100] font-mono leading-tight">
                  {String(item.val).padStart(2, '0')}
                </div>
                <div className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT (5 cols): Live Stadium Weather at Signal Iduna Park Dortmund */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-mono font-bold flex items-center gap-1.5">
              {weather.precipitation > 0 ? (
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              ) : weather.weatherCode === 0 ? (
                <Sun className="w-3.5 h-3.5 text-[#FDE100]" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-sky-300" />
              )}
              LIVE STADIONWETTER DORTMUND
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Open-Meteo ({weather.updatedAt})
            </span>
          </div>

          <button
            onClick={fetchStadiumWeather}
            disabled={isLoadingWeather}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-[#FDE100] border border-slate-800 transition-colors cursor-pointer"
            title="Stadionwetter Signal Iduna Park aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-[#FDE100]' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 bg-black/50 border border-slate-800/90 rounded-xl p-3">
          <div>
            <div className="text-xs text-slate-400 font-mono">Signal Iduna Park (Strobelallee 50)</div>
            <div className="text-sm font-bold text-white mt-0.5">{weather.conditionText}</div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-400" />
                Luftfeuchte: {weather.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-teal-400" />
                Wind: {weather.windSpeed.toFixed(1)} km/h
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-black text-[#FDE100] font-mono flex items-center justify-end gap-1">
              <Thermometer className="w-5 h-5 text-[#FDE100]" />
              {weather.temperature.toFixed(1)}°C
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Gefühlt: {weather.apparentTemperature.toFixed(1)}°C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
