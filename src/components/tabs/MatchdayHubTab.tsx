import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  Swords,
  MapPin,
  CloudSun,
  Train,
  Car,
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  Clock,
  Trophy,
  Shield,
  Flame,
  CheckCircle2,
  Users,
  Compass,
  Sparkles,
} from 'lucide-react';
import { OfficialBvbLogo } from '../OfficialBvbLogo';
import {
  UpcomingBvbMatch,
  downloadSingleMatchIcs,
  downloadFullScheduleIcs,
  isGoalAlertEnabled,
  setGoalAlertEnabled,
  isGoalSoundEnabled,
  setGoalSoundEnabled,
  triggerGoalAlert,
} from '../../utils/goalAlertSystem';
import { SignalIdunaParkBlockMap } from '../SignalIdunaParkBlockMap';

const FALLBACK_UPCOMING_MATCHES: UpcomingBvbMatch[] = [
  {
    id: 'oldb-up-1',
    dateIso: '2026-11-21T15:30:00',
    dateFormatted: 'Sa., 21.11.2026',
    timeFormatted: '15:30 Uhr',
    competition: '1. Fußball-Bundesliga',
    matchday: '10. Spieltag',
    homeTeam: 'Borussia Mönchengladbach',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    opponent: 'Borussia Mönchengladbach',
    venue: 'Borussia-Park, Mönchengladbach (54.042 Plätze)',
    city: 'Mönchengladbach',
  },
  {
    id: 'oldb-up-2',
    dateIso: '2026-11-24T21:00:00',
    dateFormatted: 'Di., 24.11.2026',
    timeFormatted: '21:00 Uhr',
    competition: 'UEFA Champions League',
    matchday: '5. Spieltag (Ligaphase)',
    homeTeam: 'FC Arsenal',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    opponent: 'FC Arsenal',
    venue: 'Emirates Stadium, London (60.704 Plätze)',
    city: 'London',
  },
  {
    id: 'oldb-up-3',
    dateIso: '2026-11-29T19:30:00',
    dateFormatted: 'So., 29.11.2026',
    timeFormatted: '19:30 Uhr',
    competition: '1. Fußball-Bundesliga',
    matchday: '11. Spieltag (Topspiel)',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'Bayer 04 Leverkusen',
    isHome: true,
    opponent: 'Bayer 04 Leverkusen',
    venue: 'Signal Iduna Park, Strobelallee 50, 44139 Dortmund (81.365 Plätze)',
    city: 'Dortmund',
  },
  {
    id: 'oldb-up-4',
    dateIso: '2026-12-02T20:45:00',
    dateFormatted: 'Mi., 02.12.2026',
    timeFormatted: '20:45 Uhr',
    competition: 'DFB-Pokal',
    matchday: 'Achtelfinale (K.o.-Runde)',
    homeTeam: 'Eintracht Frankfurt',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    opponent: 'Eintracht Frankfurt',
    venue: 'Deutsche Bank Park, Frankfurt (58.000 Plätze)',
    city: 'Frankfurt',
  },
  {
    id: 'oldb-up-5',
    dateIso: '2026-12-06T15:30:00',
    dateFormatted: 'So., 06.12.2026',
    timeFormatted: '15:30 Uhr',
    competition: '1. Fußball-Bundesliga',
    matchday: '12. Spieltag (Revierderby)',
    homeTeam: 'FC Schalke 04',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    opponent: 'FC Schalke 04',
    venue: 'Veltins-Arena, Gelsenkirchen (62.271 Plätze)',
    city: 'Gelsenkirchen',
  },
  {
    id: 'oldb-up-6',
    dateIso: '2026-12-09T21:00:00',
    dateFormatted: 'Mi., 09.12.2026',
    timeFormatted: '21:00 Uhr',
    competition: 'UEFA Champions League',
    matchday: '6. Spieltag (Ligaphase)',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'Inter Mailand',
    isHome: true,
    opponent: 'Inter Mailand',
    venue: 'Signal Iduna Park, Strobelallee 50, 44139 Dortmund (81.365 Plätze)',
    city: 'Dortmund',
  },
  {
    id: 'oldb-up-7',
    dateIso: '2026-12-12T15:30:00',
    dateFormatted: 'Sa., 12.12.2026',
    timeFormatted: '15:30 Uhr',
    competition: '1. Fußball-Bundesliga',
    matchday: '13. Spieltag',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'FC Augsburg',
    isHome: true,
    opponent: 'FC Augsburg',
    venue: 'Signal Iduna Park, Strobelallee 50, 44139 Dortmund (81.365 Plätze)',
    city: 'Dortmund',
  },
  {
    id: 'oldb-up-8',
    dateIso: '2026-12-19T18:30:00',
    dateFormatted: 'Sa., 19.12.2026',
    timeFormatted: '18:30 Uhr',
    competition: '1. Fußball-Bundesliga',
    matchday: '14. Spieltag (Topspiel)',
    homeTeam: 'RB Leipzig',
    awayTeam: 'Borussia Dortmund',
    isHome: false,
    opponent: 'RB Leipzig',
    venue: 'Red Bull Arena, Leipzig (47.069 Plätze)',
    city: 'Leipzig',
  },
];

interface OpponentScoutingProfile {
  name: string;
  competition: string;
  matchDate: string;
  isHome: boolean;
  rank: number;
  points: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  form: Array<'S' | 'U' | 'N'>;
  keyPlayer: string;
  tacticalStyle: string;
  h2hSummary: string;
  bvbWinProbPct: number;
}

const DEFAULT_SCOUTING_PROFILES: Record<string, OpponentScoutingProfile> = {
  'Borussia Mönchengladbach': {
    name: 'Borussia Mönchengladbach',
    competition: '1. Fußball-Bundesliga (10. Spieltag)',
    matchDate: 'Sa., 21.11.2026 · 15:30 Uhr (Auswärts)',
    isHome: false,
    rank: 18,
    points: 4,
    matches: 9,
    wins: 1,
    draws: 1,
    losses: 7,
    goalsFor: 12,
    goalsAgainst: 25,
    form: ['N', 'N', 'U', 'N', 'N'],
    keyPlayer: 'Tim Kleindienst (5 Saisontore)',
    tacticalStyle: '4-2-3-1 · Tiefes Umschaltspiel & Flankenläufe über die Außenbahnen, aber anfällig bei hohem Gegenpressing (25 Gegentore in 9 Spielen).',
    h2hSummary: '106 Bundesliga-Duelle: 45 BVB-Siege · 28 Remis · 33 Gladbach-Siege (Letzte 5 Duelle: 4 BVB-Siege, 1 Remis).',
    bvbWinProbPct: 74,
  },
  'FC Arsenal': {
    name: 'FC Arsenal',
    competition: 'UEFA Champions League (5. Spieltag)',
    matchDate: 'Di., 24.11.2026 · 21:00 Uhr (Auswärts)',
    isHome: false,
    rank: 4,
    points: 10,
    matches: 4,
    wins: 3,
    draws: 1,
    losses: 0,
    goalsFor: 9,
    goalsAgainst: 2,
    form: ['S', 'S', 'U', 'S', 'S'],
    keyPlayer: 'Bukayo Saka (4 Tore / 3 Vorlagen)',
    tacticalStyle: '4-3-3 · Extrem dominantes Positionsspiel, brandgefährliche Eckball-Varianten und kompakte Restverteidigung.',
    h2hSummary: '8 Königsklassen-Duelle: 2 BVB-Siege · 2 Remis · 4 Arsenal-Siege.',
    bvbWinProbPct: 42,
  },
  'Bayer 04 Leverkusen': {
    name: 'Bayer 04 Leverkusen',
    competition: '1. Fußball-Bundesliga (11. Spieltag)',
    matchDate: 'So., 29.11.2026 · 19:30 Uhr (Heimspiel)',
    isHome: true,
    rank: 5,
    points: 16,
    matches: 9,
    wins: 5,
    draws: 1,
    losses: 3,
    goalsFor: 20,
    goalsAgainst: 17,
    form: ['S', 'N', 'S', 'U', 'S'],
    keyPlayer: 'Victor Boniface / Patrik Schick',
    tacticalStyle: '3-4-2-1 · Kurzpass-Kombinationen durch die Halbräume und hoch aufrückende Schienenspieler.',
    h2hSummary: '92 Bundesliga-Duelle: 37 BVB-Siege · 24 Remis · 31 Leverkusen-Siege.',
    bvbWinProbPct: 58,
  },
  'Eintracht Frankfurt': {
    name: 'Eintracht Frankfurt',
    competition: 'DFB-Pokal (Achtelfinale)',
    matchDate: 'Mi., 02.12.2026 · 20:45 Uhr (Auswärts)',
    isHome: false,
    rank: 9,
    points: 12,
    matches: 9,
    wins: 3,
    draws: 3,
    losses: 3,
    goalsFor: 15,
    goalsAgainst: 20,
    form: ['U', 'N', 'S', 'U', 'N'],
    keyPlayer: 'Hugo Ekitiké / Omar Marmoush',
    tacticalStyle: '3-4-2-1 · Vertikales Umschaltspiel mit hohem Tempo nach Ballgewinn.',
    h2hSummary: 'Am 24.10.2026 besiegte der BVB die Eintracht in der Bundesliga mit 1:0 (Tor: Maximilian Beier 80.).',
    bvbWinProbPct: 61,
  },
  'FC Schalke 04': {
    name: 'FC Schalke 04',
    competition: '1. Fußball-Bundesliga (12. Spieltag · Revierderby)',
    matchDate: 'So., 06.12.2026 · 15:30 Uhr (Auswärts)',
    isHome: false,
    rank: 17,
    points: 6,
    matches: 8,
    wins: 1,
    draws: 3,
    losses: 4,
    goalsFor: 4,
    goalsAgainst: 9,
    form: ['N', 'U', 'N', 'S', 'N'],
    keyPlayer: 'Kenan Karaman',
    tacticalStyle: '4-4-2 · Kampfstarkes Defensivbollwerk im Derby, aber schwächste Offensive der Liga (erst 4 Tore).',
    h2hSummary: '101 Bundesliga-Revierderbys: 38 BVB-Siege · 31 Remis · 32 Schalke-Siege.',
    bvbWinProbPct: 72,
  },
};

interface StandSectionInfo {
  id: 'sued' | 'nord' | 'west' | 'ost' | 'gaeste';
  name: string;
  subtitle: string;
  capacity: string;
  blocks: string;
  gate: string;
  catering: string;
  atmosphere: string;
  tip: string;
}

const STADIUM_STANDS: Record<string, StandSectionInfo> = {
  sued: {
    id: 'sued',
    name: 'Südtribüne („Die Gelbe Wand“)',
    subtitle: 'Größte Stehplatztribüne Europas · Herzstück von Borussia Dortmund',
    capacity: '24.454 Stehplätze (International: 16.500 Sitzplätze)',
    blocks: 'Blöcke 10 bis 15 (Unterrang) & Blöcke 80 bis 84 (Oberrang)',
    gate: 'Eingang Süd / Südost (Strobelallee)',
    catering: 'Brinkhoff’s No.1 (0,5l im Mehrwegbecher), Stadionbratwurst im Brötchen, Brezeln an allen Kiosken hinter Block 12/13.',
    atmosphere: '100% Stehplatz-Extase, Fahnenmeer, Choreos und durchgehender 90-Minuten-Support. Strengstes Schalke-Blau-Verbot!',
    tip: 'Mindestens 60–75 Minuten vor Anpfiff im Block sein, da die Wellenbrecher in Block 12 & 13 früh voll sind.',
  },
  west: {
    id: 'west',
    name: 'Westtribüne (Traditions- & Stimmungstribüne)',
    subtitle: 'Beste Längsseiten-Sicht direkt neben der Gelben Wand',
    capacity: 'ca. 21.800 Sitzplätze',
    blocks: 'Blöcke 20 bis 35 (Unterrang) & Blöcke 41 bis 54 (Oberrang)',
    gate: 'Eingang West / Strobelallee (U-Bahn Stadion)',
    catering: 'Große Food-Plaza im West-Umlauf (Currywurst, Pommes, Kaltgetränke, Fan-Shop West).',
    atmosphere: 'Traditionell sehr sangesfreudig (besonders in den Blöcken 30–34 nahe der Südtribüne) mit perfekter Sicht auf die Taktik.',
    tip: 'Ideal für Anreise mit U45/U46 bis Haltestelle „Stadion“ – nur 3 Gehminuten bis zum Drehkreuz West.',
  },
  ost: {
    id: 'ost',
    name: 'Osttribüne (Haupttribüne, VIP & Trainerbänke)',
    subtitle: 'Direkter Blick auf die Trainerbänke (Niko Kovač) & den Spielertunnel',
    capacity: 'ca. 19.200 Sitzplätze + Logen & Pressebereich',
    blocks: 'Blöcke 1 bis 9 & 36 bis 40 (Unterrang) · Blöcke 66 bis 78 (Oberrang)',
    gate: 'Eingang Ost / Ardeyplatz (nahe BVB-FanWelt)',
    catering: 'Stammtisch-Kioske im Umlauf Ost sowie direkter Zugang zur BVB-FanWelt am Stadionvorplatz.',
    atmosphere: 'Exzellente Übersicht über das gesamte Spielfeld und das Einlaufen der Mannschaften.',
    tip: 'Vor dem Spiel lohnt sich ein Abstecher in die zweistöckige BVB-FanWelt direkt vor der Osttribüne.',
  },
  nord: {
    id: 'nord',
    name: 'Nordtribüne & Familienblock (REWE Familienblock)',
    subtitle: 'Gegenüber der Gelben Wand – perfekter Panoramablick auf die Südtribüne!',
    capacity: 'ca. 15.900 Plätze (inkl. Familienblock & Gästebereich)',
    blocks: 'Blöcke 63 bis 65 (Familienblock) & Blöcke 70 bis 78 (Nord-Oberrang)',
    gate: 'Eingang Nord (Bolmker Weg / Theodor-Fliedner-Heim)',
    catering: 'Familienfreundliche Kioske, Maskottchen EMMA-Treffpunkt vor dem Anpfiff.',
    atmosphere: 'Von nirgendwo im Stadion sieht man die Choreografien der Südtribüne so imposant wie von der Nordtribüne!',
    tip: 'U-Bahn-Geheimtipp: Bis „Theodor-Fliedner-Heim“ (U42) fahren – dort ist deutlich weniger Gedränge als an der Haltestelle „Stadion“.',
  },
  gaeste: {
    id: 'gaeste',
    name: 'Gästeblock (Nordost-Ecke)',
    subtitle: 'Separater Bereich für Auswärtsfans',
    capacity: 'ca. 8.000 Plätze (Steh- & Sitzplätze)',
    blocks: 'Blöcke 08, 60, 61 (Unterrang) & Blöcke 55 bis 59 (Oberrang)',
    gate: 'Separater Eingang Nordost (Zugang ab Bahnhof Signal Iduna Park)',
    catering: 'Eigene Kioske im abgetrennten Gäste-Umlauf.',
    atmosphere: 'Direkt im Hexenkessel unter dem dröhnenden Stadiondach des Signal Iduna Parks.',
    tip: 'Zugang erfolgt ausschließlich über den nördlichen Stadionvorplatz.',
  },
};

export const MatchdayHubTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'schedule' | 'scouting' | 'stadium'>('schedule');
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingBvbMatch[]>(FALLBACK_UPCOMING_MATCHES);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState<boolean>(false);
  const [countdownText, setCountdownText] = useState<string>('');
  const [icsExportMsg, setIcsExportMsg] = useState<string>('');

  // Idee 2: Goal Alert & Sound Toggles
  const [alertEnabled, setAlertEnabledState] = useState<boolean>(() => isGoalAlertEnabled());
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => isGoalSoundEnabled());

  // Idee 3: Opponent Scouting State
  const [selectedOpponentName, setSelectedOpponentName] = useState<string>('Borussia Mönchengladbach');
  const [bvbLiveRow, setBvbLiveRow] = useState<{
    rank: number;
    points: number;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
  }>({
    rank: 2,
    points: 21,
    matches: 9,
    wins: 6,
    draws: 3,
    losses: 0,
    goalsFor: 16,
    goalsAgainst: 7,
  });
  const [scoutingProfiles, setScoutingProfiles] = useState<Record<string, OpponentScoutingProfile>>(DEFAULT_SCOUTING_PROFILES);

  // Idee 5: Stadium Guide & Live Weather State
  const [selectedStand, setSelectedStand] = useState<'sued' | 'west' | 'ost' | 'nord' | 'gaeste'>('sued');
  const [stadiumWeather, setStadiumWeather] = useState<{
    tempC: number;
    feelsLikeC: number;
    windKmH: number;
    precipMm: number;
    conditionText: string;
    clothingTip: string;
  }>({
    tempC: 11.4,
    feelsLikeC: 9.8,
    windKmH: 14.2,
    precipMm: 0.0,
    conditionText: 'Leicht bewölkt über Dortmund-Strobelallee',
    clothingTip: 'BVB-Hoodie oder Übergangsjacke + Fanschal für die Abendstunden empfohlen.',
  });

  // 1. Live Fetch Upcoming Matches from OpenLigaDB + Live Bundesliga Table for Scouting
  const syncMatchdayData = async () => {
    setIsLoadingSchedule(true);
    try {
      const [oldbUpcomingRes, oldbTableRes, weatherRes] = await Promise.allSettled([
        fetch('https://api.openligadb.de/getmatchesbyteamid/7/0/10', { cache: 'no-store', signal: AbortSignal.timeout(5000) }).then((r) => (r.ok ? r.json() : null)),
        fetch('https://api.openligadb.de/getbltable/bl1/2026', { cache: 'no-store', signal: AbortSignal.timeout(5000) }).then((r) => (r.ok ? r.json() : null)),
        fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=51.4926&longitude=7.4519&current=temperature_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&timezone=Europe%2FBerlin',
          { cache: 'no-store', signal: AbortSignal.timeout(4500) }
        ).then((r) => (r.ok ? r.json() : null)),
      ]);

      // Parse live upcoming matches
      if (oldbUpcomingRes.status === 'fulfilled' && Array.isArray(oldbUpcomingRes.value)) {
        const rawList = oldbUpcomingRes.value.filter(
          (m: any) =>
            !m.matchIsFinished &&
            !String(m.leagueName || '').includes('2. ') &&
            !String(m.leagueName || '').includes('3. ') &&
            !String(m.leagueName || '').includes('Frauen')
        );
        if (rawList.length > 0) {
          const mapped: UpcomingBvbMatch[] = rawList.slice(0, 10).map((m: any, i: number) => {
            const isHome = m.team1?.teamId === 7 || String(m.team1?.teamName || '').toLowerCase().includes('dortmund');
            const homeName = m.team1?.teamName || 'Heim';
            const awayName = m.team2?.teamName || 'Gast';
            const oppName = isHome ? awayName : homeName;
            const d = new Date(m.matchDateTimeUTC || m.matchDateTime);
            const dateFormatted = d.toLocaleDateString('de-DE', {
              weekday: 'short',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const timeFormatted = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
            const lName = String(m.leagueName || '');
            const comp = lName.includes('Champions')
              ? 'UEFA Champions League'
              : lName.includes('Pokal')
              ? 'DFB-Pokal'
              : '1. Fußball-Bundesliga';

            return {
              id: `oldb-up-${m.matchID || i}`,
              dateIso: m.matchDateTime || d.toISOString(),
              dateFormatted,
              timeFormatted,
              competition: comp,
              matchday: m.group?.groupName || 'Pflichtspiel',
              homeTeam: homeName,
              awayTeam: awayName,
              isHome,
              opponent: oppName,
              venue: isHome
                ? 'Signal Iduna Park, Strobelallee 50, 44139 Dortmund (81.365 Plätze)'
                : `Auswärtsstadion (${oppName})`,
              city: isHome ? 'Dortmund' : oppName,
            };
          });
          setUpcomingMatches(mapped);
        }
      }

      // Parse live Bundesliga table for Opponent Scouting
      if (oldbTableRes.status === 'fulfilled' && Array.isArray(oldbTableRes.value)) {
        const table = oldbTableRes.value;
        const bvbIndex = table.findIndex((r: any) => String(r.teamName || '').toLowerCase().includes('dortmund'));
        if (bvbIndex !== -1) {
          const bRow = table[bvbIndex];
          setBvbLiveRow({
            rank: bvbIndex + 1,
            points: bRow.points ?? 21,
            matches: bRow.matches ?? 9,
            wins: bRow.won ?? 6,
            draws: bRow.draw ?? 3,
            losses: bRow.lost ?? 0,
            goalsFor: bRow.goals ?? 16,
            goalsAgainst: bRow.opponentGoals ?? 7,
          });
        }

        // Update opponent profiles with live table standings
        setScoutingProfiles((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            const idx = table.findIndex((r: any) =>
              String(r.teamName || '').toLowerCase().includes(key.toLowerCase().split(' ').pop() || '')
            );
            if (idx !== -1) {
              const row = table[idx];
              next[key] = {
                ...next[key],
                rank: idx + 1,
                points: row.points ?? next[key].points,
                matches: row.matches ?? next[key].matches,
                wins: row.won ?? next[key].wins,
                draws: row.draw ?? next[key].draws,
                losses: row.lost ?? next[key].losses,
                goalsFor: row.goals ?? next[key].goalsFor,
                goalsAgainst: row.opponentGoals ?? next[key].goalsAgainst,
              };
            }
          }
          return next;
        });
      }

      // Parse live Signal Iduna Park Weather
      if (weatherRes.status === 'fulfilled' && weatherRes.value?.current) {
        const cur = weatherRes.value.current;
        const temp = typeof cur.temperature_2m === 'number' ? cur.temperature_2m : 11.4;
        const feels = typeof cur.apparent_temperature === 'number' ? cur.apparent_temperature : temp - 1.5;
        const wind = typeof cur.wind_speed_10m === 'number' ? cur.wind_speed_10m : 14.0;
        const precip = typeof cur.precipitation === 'number' ? cur.precipitation : 0;

        let cond = 'Freundliches Fußballwetter über dem Signal Iduna Park';
        if (precip > 0.2) cond = 'Leichter Regen am Stadion – Regenjacke einpacken!';
        else if (temp < 7) cond = 'Kühle Stadionluft in Dortmund-Süd';

        let tip = 'BVB-Trikot über Hoodie + Fanschal optimal für die Tribüne.';
        if (temp < 6) tip = 'Winterjacke, Mütze und schwarzgelber Schal dringend empfohlen!';
        else if (temp > 18) tip = 'Perfektes Kurzarm-Trikot-Wetter auf der Südtribüne!';

        setStadiumWeather({
          tempC: Math.round(temp * 10) / 10,
          feelsLikeC: Math.round(feels * 10) / 10,
          windKmH: Math.round(wind * 10) / 10,
          precipMm: precip,
          conditionText: cond,
          clothingTip: tip,
        });
      }
    } catch (e) {
      console.warn('MatchdayHub sync warning:', e);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  useEffect(() => {
    syncMatchdayData();
  }, []);

  // Live Countdown to next BVB match
  useEffect(() => {
    const updateCountdown = () => {
      const nextMatch = upcomingMatches[0];
      if (!nextMatch) return;
      const target = new Date(nextMatch.dateIso).getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setCountdownText('SPIEL LÄUFT / ANPFIFF ERFOLGT!');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdownText(`${days}d ${hours}h ${mins}m ${secs}s`);
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [upcomingMatches]);

  const handleSingleIcs = (m: UpcomingBvbMatch) => {
    downloadSingleMatchIcs(m);
    setIcsExportMsg(`✓ Termin „${m.homeTeam} vs. ${m.awayTeam}“ als .ics Kalenderdatei gespeichert!`);
    setTimeout(() => setIcsExportMsg(''), 4500);
  };

  const handleFullScheduleIcs = () => {
    downloadFullScheduleIcs(upcomingMatches);
    setIcsExportMsg(`✓ Kompletter BVB-Spielplan (${upcomingMatches.length} Pflichtspiele) als .ics Kalenderdatei exportiert!`);
    setTimeout(() => setIcsExportMsg(''), 4500);
  };

  const handleToggleAlert = () => {
    const next = !alertEnabled;
    setAlertEnabledState(next);
    setGoalAlertEnabled(next);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    setGoalSoundEnabled(next);
  };

  const handleTestGoalAlert = () => {
    triggerGoalAlert({
      id: `test-goal-${Date.now()}`,
      scorer: 'Felix Nmecha (#8)',
      minute: "71'",
      homeTeam: 'Borussia Dortmund',
      awayTeam: 'SV 07 Elversberg',
      homeScore: 2,
      awayScore: 1,
      competition: '1. Fußball-Bundesliga · Signal Iduna Park',
      assist: 'Joey Veerman (#25)',
      isTest: true,
    });
  };

  const activeScout = scoutingProfiles[selectedOpponentName] || DEFAULT_SCOUTING_PROFILES['Borussia Mönchengladbach'];
  const activeStandInfo = STADIUM_STANDS[selectedStand] || STADIUM_STANDS.sued;

  return (
    <div className="space-y-6 font-sans">
      {/* TOP HEADER & SUB-NAVIGATION (Idee 1, 2, 3, 5) */}
      <div className="p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100]/20 text-[#FDE100] font-bold text-xs border border-[#FDE100]/40 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>SPIELTAGS-ZENTRALE (LIVE-SYNC)</span>
              </span>
              {countdownText && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 font-bold text-xs border border-emerald-500/40 font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Nächster Anpfiff in: {countdownText}</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white uppercase font-bvb tracking-wide">
              BVB Spielplan (.ics), Gegner-Scouting, Tor-Alarm & Stadion-Guide
            </h2>
            <p className="text-xs text-slate-400">
              Alle kommenden BVB-Pflichtspiele mit 1-Klick Kalender-Export (.ics), Live-Gegner-Analyse (OpenLigaDB) und interaktivem Signal Iduna Park Guide.
            </p>
          </div>

          {/* IDEE 2: TOR-ALARM & TORHYMNE QUICK CONTROL BAR */}
          <div className="flex flex-wrap items-center gap-2 bg-black/70 p-2.5 rounded-xl border border-slate-800">
            <button
              onClick={handleToggleAlert}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-bvb uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                alertEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Automatische Tor- & Anpfiff-Benachrichtigungen ein-/ausschalten"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Tor-Alarm: {alertEnabled ? 'EIN' : 'AUS'}</span>
            </button>

            <button
              onClick={handleToggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-bvb uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-[#FDE100]/20 text-[#FDE100] border border-[#FDE100]/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Stadion-Torhymne bei BVB-Toren ein-/ausschalten"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Torhymne: {soundEnabled ? 'AKTIV' : 'STUMM'}</span>
            </button>

            <button
              onClick={handleTestGoalAlert}
              className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold font-bvb uppercase bg-[#FDE100] hover:bg-[#ffe733] text-black flex items-center gap-1.5 shadow-md shadow-[#FDE100]/20 transition-all cursor-pointer"
              title="Testet sofort das schwarzgelbe Tor-Banner + Stadion-Torhymne + Desktop-Benachrichtigung"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tor-Alarm testen 🔊</span>
            </button>
          </div>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSection('schedule')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold font-bvb uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'schedule'
                  ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>1. Live-Spielplan & .ics Kalender-Export ({upcomingMatches.length})</span>
            </button>

            <button
              onClick={() => setActiveSection('scouting')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold font-bvb uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'scouting'
                  ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>2. „Nächster Gegner“-Scouting & Direktvergleich</span>
            </button>

            <button
              onClick={() => setActiveSection('stadium')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold font-bvb uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === 'stadium'
                  ? 'bg-[#FDE100] text-black shadow-md shadow-[#FDE100]/20'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>3. Signal Iduna Park Guide & Stadionwetter</span>
            </button>
          </div>

          <button
            onClick={syncMatchdayData}
            disabled={isLoadingSchedule}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FDE100] ${isLoadingSchedule ? 'animate-spin' : ''}`} />
            <span>Live-Daten aktualisieren</span>
          </button>
        </div>

        {icsExportMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{icsExportMsg}</span>
          </div>
        )}
      </div>

      {/* ========================================================================== */}
      {/* SECTION 1: LIVE-SPIELPLAN & 1-KLICK .ICS KALENDER-EXPORT (IDEE 1)          */}
      {/* ========================================================================== */}
      {activeSection === 'schedule' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-2xl bg-gradient-to-r from-[#161922] via-[#111318] to-[#161922] border border-[#FDE100]/40 shadow-lg">
            <div>
              <h3 className="text-lg font-extrabold text-white font-bvb uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FDE100]" />
                Kommende BVB-Pflichtspiele 2026/27 (BL · Champions League · DFB-Pokal)
              </h3>
              <p className="text-xs text-slate-400">
                Importiere alle Spiele mit 1 Klick in Outlook, Google Kalender, Apple Kalender oder deinen Smartphone-Kalender (inkl. 30-Min.-Anpfiff-Erinnerung).
              </p>
            </div>

            <button
              onClick={handleFullScheduleIcs}
              className="px-4 py-2.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-xl font-bvb uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#FDE100]/20 cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Kompletten Spielplan (.ics) exportieren</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMatches.map((m, idx) => {
              const isUCL = m.competition.includes('Champions');
              const isPokal = m.competition.includes('Pokal');
              return (
                <div
                  key={m.id}
                  className={`p-5 rounded-2xl bg-[#111318] border transition-all flex flex-col justify-between gap-4 shadow-md ${
                    idx === 0
                      ? 'border-[#FDE100] ring-1 ring-[#FDE100]/30'
                      : 'border-slate-800 hover:border-[#FDE100]/50'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-bvb uppercase tracking-wider border ${
                          isUCL
                            ? 'bg-sky-950/80 text-sky-300 border-sky-500/40'
                            : isPokal
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : 'bg-[#FDE100]/15 text-[#FDE100] border-[#FDE100]/40'
                        }`}
                      >
                        {m.competition} · {m.matchday}
                      </span>
                      <span className="text-xs font-mono text-slate-300 font-bold">
                        {m.dateFormatted} · <span className="text-[#FDE100]">{m.timeFormatted}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="text-base sm:text-lg font-black font-bvb tracking-wide text-white">
                        <span className={m.isHome ? 'text-[#FDE100]' : 'text-white'}>{m.homeTeam}</span>
                        <span className="text-slate-500 mx-2 text-sm">vs.</span>
                        <span className={!m.isHome ? 'text-[#FDE100]' : 'text-white'}>{m.awayTeam}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          m.isHome
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {m.isHome ? 'HEIMSPIEL' : 'AUSWÄRTS'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FDE100] shrink-0" />
                      <span className="truncate">{m.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                    {scoutingProfiles[m.opponent] ? (
                      <button
                        onClick={() => {
                          setSelectedOpponentName(m.opponent);
                          setActiveSection('scouting');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#FDE100] border border-[#FDE100]/30 text-xs font-bvb uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Gegner-Scouting</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Erinnerung: 30 Min. vor Anpfiff</span>
                    )}

                    <button
                      onClick={() => handleSingleIcs(m)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-[#FDE100] hover:text-black text-slate-200 text-xs font-bold font-bvb uppercase flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                      title="Dieses Spiel als .ics Termin herunterladen"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Termin (.ics)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* SECTION 2: „NÄCHSTER GEGNER“-SCOUTING & DIREKTVERGLEICH (IDEE 3)           */}
      {/* ========================================================================== */}
      {activeSection === 'scouting' && (
        <div className="space-y-5">
          {/* Opponent Selector Bar */}
          <div className="p-4 rounded-2xl bg-[#111318] border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bvb uppercase text-slate-300 font-bold">
              <Swords className="w-4 h-4 text-[#FDE100]" />
              <span>Kommenden Pflichtspiel-Gegner auswählen:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(scoutingProfiles).map((oppKey) => (
                <button
                  key={oppKey}
                  onClick={() => setSelectedOpponentName(oppKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-bvb uppercase transition-all cursor-pointer ${
                    selectedOpponentName === oppKey
                      ? 'bg-[#FDE100] text-black shadow-md'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {oppKey}
                </button>
              ))}
            </div>
          </div>

          {/* Head-to-Head Main Comparison Card */}
          <div className="p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/40 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-[#FDE100] font-bold uppercase">
                  {activeScout.competition} · {activeScout.matchDate}
                </span>
                <h3 className="text-2xl font-black text-white font-bvb uppercase tracking-wide mt-0.5">
                  Borussia Dortmund vs. {activeScout.name}
                </h3>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs font-mono text-emerald-300">
                BVB Sieg-Wahrscheinlichkeit (Form-Modell): <strong className="text-white text-sm">{activeScout.bvbWinProbPct}%</strong>
              </div>
            </div>

            {/* Side-by-Side Live Table & Stats Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Left: BVB */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FDE100]/15 to-black border border-[#FDE100]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OfficialBvbLogo className="w-7 h-7 shrink-0 drop-shadow-[0_0_6px_rgba(253,225,0,0.4)]" />
                    <span className="text-lg font-black text-[#FDE100] font-bvb uppercase">Borussia Dortmund</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-[#FDE100] text-black font-extrabold font-mono text-xs">
                    Platz #{bvbLiveRow.rank}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs pt-1">
                  <div className="p-2 rounded bg-black/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Punkte</div>
                    <div className="text-base font-bold text-white">{bvbLiveRow.points}</div>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Bilanz</div>
                    <div className="text-base font-bold text-emerald-400">
                      {bvbLiveRow.wins}S-{bvbLiveRow.draws}U-{bvbLiveRow.losses}N
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Tore</div>
                    <div className="text-base font-bold text-[#FDE100]">
                      {bvbLiveRow.goalsFor}:{bvbLiveRow.goalsAgainst}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Form (letzte 5):</span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    {['S', 'S', 'U', 'S', 'S'].map((res, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                          res === 'S'
                            ? 'bg-emerald-500 text-black'
                            : res === 'U'
                            ? 'bg-amber-400 text-black'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Direct Metric Bars */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs font-mono">
                <div className="text-center font-bvb uppercase text-slate-300 font-bold text-sm border-b border-slate-800 pb-2">
                  Direktvergleich (Schnitt pro Spiel)
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#FDE100] font-bold">
                    {(bvbLiveRow.goalsFor / Math.max(1, bvbLiveRow.matches)).toFixed(2)}
                  </span>
                  <span className="text-slate-400">Tore / Spiel</span>
                  <span className="text-slate-200 font-bold">
                    {(activeScout.goalsFor / Math.max(1, activeScout.matches)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">
                    {(bvbLiveRow.goalsAgainst / Math.max(1, bvbLiveRow.matches)).toFixed(2)}
                  </span>
                  <span className="text-slate-400">Gegentore / Spiel</span>
                  <span className="text-rose-400 font-bold">
                    {(activeScout.goalsAgainst / Math.max(1, activeScout.matches)).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#FDE100] font-bold">
                    {(bvbLiveRow.points / Math.max(1, bvbLiveRow.matches)).toFixed(2)}
                  </span>
                  <span className="text-slate-400">Punkte / Spiel</span>
                  <span className="text-slate-200 font-bold">
                    {(activeScout.points / Math.max(1, activeScout.matches)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Right: Opponent */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white font-bvb uppercase">{activeScout.name}</span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 font-extrabold font-mono text-xs border border-slate-700">
                    Platz #{activeScout.rank}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs pt-1">
                  <div className="p-2 rounded bg-black/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Punkte</div>
                    <div className="text-base font-bold text-white">{activeScout.points}</div>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Bilanz</div>
                    <div className="text-base font-bold text-slate-200">
                      {activeScout.wins}S-{activeScout.draws}U-{activeScout.losses}N
                    </div>
                  </div>
                  <div className="p-2 rounded bg-black/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Tore</div>
                    <div className="text-base font-bold text-slate-200">
                      {activeScout.goalsFor}:{activeScout.goalsAgainst}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Form (letzte 5):</span>
                  <div className="flex items-center gap-1 font-mono font-bold">
                    {activeScout.form.map((res, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${
                          res === 'S'
                            ? 'bg-emerald-500 text-black'
                            : res === 'U'
                            ? 'bg-amber-400 text-black'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Scouting Notes & Historical H2H */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-black/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bvb uppercase text-[#FDE100] font-bold">
                  Gefährlichster Schlüsselspieler
                </span>
                <div className="text-sm font-bold text-white">{activeScout.keyPlayer}</div>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bvb uppercase text-[#FDE100] font-bold">
                  Taktik-Analyse (Niko Kovač Scouting)
                </span>
                <div className="text-xs text-slate-300 leading-relaxed">{activeScout.tacticalStyle}</div>
              </div>
              <div className="p-4 rounded-xl bg-black/50 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bvb uppercase text-[#FDE100] font-bold">
                  Historische Direktbilanz (Head-to-Head)
                </span>
                <div className="text-xs text-slate-300 leading-relaxed">{activeScout.h2hSummary}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* SECTION 3: INTERAKTIVER SIGNAL IDUNA PARK GUIDE & WETTER (IDEE 5)          */}
      {/* ========================================================================== */}
      {activeSection === 'stadium' && (
        <div className="space-y-6">
          {/* Live Stadium Weather Card (Open-Meteo Dortmund Strobelallee 50) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#141822] via-[#111318] to-[#141822] border border-[#FDE100]/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FDE100]/15 border border-[#FDE100]/40 flex items-center justify-center text-[#FDE100] shrink-0">
                <CloudSun className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                  LIVE-STADIONWETTER · SIGNAL IDUNA PARK (STROBELALLEE 50, DORTMUND)
                </div>
                <div className="text-xl font-black text-white font-bvb tracking-wide">
                  {stadiumWeather.tempC}°C (Gefühlt {stadiumWeather.feelsLikeC}°C) · {stadiumWeather.conditionText}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  👕 <strong className="text-[#FDE100]">Stadion-Kleidungstipp:</strong> {stadiumWeather.clothingTip}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs shrink-0">
              <div className="px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Wind</span>
                <span className="font-bold text-white">{stadiumWeather.windKmH} km/h</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Niederschlag</span>
                <span className="font-bold text-sky-400">{stadiumWeather.precipMm} mm</span>
              </div>
              <div className="px-3 py-2 rounded-xl bg-black/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Kapazität</span>
                <span className="font-bold text-[#FDE100]">81.365</span>
              </div>
            </div>
          </div>

          {/* Option 2: 1:1 Official Interactive Block Map + Block Search ("Wo ist mein Block?") */}
          <SignalIdunaParkBlockMap />

          {/* Arrival & Parking Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#111318] border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bvb uppercase text-sm font-bold text-[#FDE100]">
                <Train className="w-4 h-4" />
                <span>ÖPNV-Anreise ab Dortmund Hbf (KombiTicket inklusive)</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>
                  • <strong>U45 / U46:</strong> Direkt ab Dortmund Hbf bis Haltestelle <em>„Stadion“</em> oder{' '}
                  <em>„Westfalenhallen“</em> (Fahrtzeit: 11 Min.).
                </li>
                <li>
                  • <strong>U42:</strong> Bis <em>„Theodor-Fliedner-Heim“</em> (Geheimtipp für Süd- & Nordtribüne, nur 6
                  Min. Fußweg).
                </li>
                <li>
                  • <strong>Regionalbahn / S-Bahn:</strong> Ab Hbf bis Bahnhof{' '}
                  <em>„Dortmund Signal Iduna Park“</em> (5 Min. Fahrtzeit, ideal für Ost-, Süd- & Gästeblock).
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-[#111318] border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bvb uppercase text-sm font-bold text-[#FDE100]">
                <Car className="w-4 h-4" />
                <span>Parkplätze & P+R Shuttle-Service</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li>
                  • <strong>Parkplätze A1–A8 & D–F:</strong> Rund um Westfalenhallen / B54 (über 10.000 gebührenpflichtige
                  Stellplätze, ca. 8–10 €).
                </li>
                <li>
                  • <strong>P+R Universität Dortmund (Otto-Hahn-Straße):</strong> Große Parkflächen an der A45/B1 +
                  kostenloser Shuttle-Bus im 5-Minuten-Takt direkt bis vors Stadion!
                </li>
                <li>
                  • <strong>Fußweg-Tipp:</strong> Über das <em>Kreuzviertel</em> (Möllerbrücke / Lindemannstraße) in 12
                  Min. zu Fuß zum Stadion.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
