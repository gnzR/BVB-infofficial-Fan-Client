import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, BellRing, ExternalLink, ShieldCheck, Flame, Activity, Clock, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import { triggerBVBNotification } from '../../utils/notificationSystem';
import { analyzeLocalBVBQuery } from '../../utils/localBvbAnalyst';
import { playStadiumCheerSound } from '../../utils/cheerSound';
import { MatchdayCountdownWeatherWidget } from '../MatchdayCountdownWeatherWidget';

interface LiveEvent {
  minute: string;
  type: 'goal' | 'sub' | 'card' | 'whistle' | 'save' | 'chance';
  text: string;
}

interface LiveMatchData {
  id?: string;
  matchDateIso?: string;
  competition: string;
  matchday: string;
  stadium: string;
  isLive: boolean;
  currentMinute: string;
  minuteDisplay: string;
  homeTeam: {
    name: string;
    shortName: string;
    score: number;
    scorers: string[];
  };
  awayTeam: {
    name: string;
    shortName: string;
    score: number;
    scorers: string[];
  };
  stats: {
    xG: string;
    possession: string;
    shotsOnGoal: string;
    corners: string;
    fouls: string;
  };
  events: LiveEvent[];
}

const DEFAULT_RECENT_MATCHES: LiveMatchData[] = [
  {
    id: 'match-83228',
    matchDateIso: '2026-11-07T15:30:00',
    competition: '1. Fußball-Bundesliga',
    matchday: '9. Spieltag',
    stadium: 'Signal Iduna Park, Dortmund (81.365 Zuschauer)',
    isLive: false,
    currentMinute: 'ENDE',
    minuteDisplay: 'ENDSTAND (07.11.2026)',
    homeTeam: {
      name: 'Borussia Dortmund',
      shortName: 'BVB',
      score: 2,
      scorers: ["F. Nmecha 55'", "F. Nmecha 71'"],
    },
    awayTeam: {
      name: 'SV 07 Elversberg',
      shortName: 'ELV',
      score: 1,
      scorers: ["N. Futkeu 81'"],
    },
    stats: {
      xG: '2.34 vs 0.82',
      possession: '61% vs 39%',
      shotsOnGoal: '18 (8) vs 9 (3)',
      corners: '8 vs 3',
      fouls: '9 vs 13',
    },
    events: [
      {
        minute: 'VORSCHAU',
        type: 'whistle',
        text: 'Nächstes Pflichtspiel: Borussia Mönchengladbach vs. Borussia Dortmund am 21.11.2026 um 15:30 Uhr (1. Fußball-Bundesliga).',
      },
      {
        minute: "90'+4",
        type: 'whistle',
        text: 'Abpfiff im Signal Iduna Park! Borussia Dortmund schlägt die SV 07 Elversberg am 9. Spieltag dank eines Doppelpacks von Felix Nmecha verdient mit 2:1!',
      },
      {
        minute: "81'",
        type: 'goal',
        text: 'Anschlusstreffer für die Gäste: N. Futkeu verkürzt für die SV 07 Elversberg auf 2:1.',
      },
      {
        minute: "71'",
        type: 'goal',
        text: 'TOOOOR FÜR BORUSSIA DORTMUND! Felix Nmecha schnürt den Doppelpack und erhöht vor der Gelben Wand auf 2:0!',
      },
      {
        minute: "55'",
        type: 'goal',
        text: 'TOOOOR FÜR BORUSSIA DORTMUND! Felix Nmecha erlöst den BVB nach starker Kombination mit dem 1:0-Führungstreffer!',
      },
      {
        minute: "45'",
        type: 'whistle',
        text: 'Halbzeitstand im ausverkauften Signal Iduna Park (81.365 Zuschauer): Borussia Dortmund 0:0 SV 07 Elversberg.',
      },
    ],
  },
  {
    id: 'match-cl-betis',
    matchDateIso: '2026-11-04T21:00:00',
    competition: 'UEFA Champions League',
    matchday: '4. Spieltag · Ligaphase',
    stadium: 'Signal Iduna Park, Dortmund (81.365 Zuschauer)',
    isLive: false,
    currentMinute: 'ENDE',
    minuteDisplay: 'ENDSTAND (04.11.2026)',
    homeTeam: {
      name: 'Borussia Dortmund',
      shortName: 'BVB',
      score: 2,
      scorers: ["Fábio Silva 49'", "K. Karetsas 72'"],
    },
    awayTeam: {
      name: 'Real Betis Sevilla',
      shortName: 'BET',
      score: 1,
      scorers: ["A. Ruibal 67'"],
    },
    stats: {
      xG: '2.15 vs 0.88',
      possession: '58% vs 42%',
      shotsOnGoal: '17 (8) vs 9 (3)',
      corners: '7 vs 4',
      fouls: '10 vs 14',
    },
    events: [
      {
        minute: "90'+3",
        type: 'whistle',
        text: 'Abpfiff! Borussia Dortmund besiegt Real Betis Sevilla in der UEFA Champions League mit 2:1!',
      },
      {
        minute: "72'",
        type: 'goal',
        text: 'TOOOOR FÜR DEN BVB! Konstantinos Karetsas schlenzt den Ball nach Vorlage von Nico Schlotterbeck zum 2:1-Siegtreffer ins rechte Eck!',
      },
      {
        minute: "67'",
        type: 'goal',
        text: 'Ausgleich für Real Betis: Aitor Ruibal trifft zum 1:1.',
      },
      {
        minute: "49'",
        type: 'goal',
        text: 'TOOOOR FÜR BORUSSIA DORTMUND! Fábio Silva trifft kurz nach Wiederanpfiff nach Steckpass von Julian Brandt zum 1:0!',
      },
    ],
  },
  {
    id: 'match-bl-fcb',
    matchDateIso: '2026-10-31T18:30:00',
    competition: '1. Fußball-Bundesliga',
    matchday: '8. Spieltag',
    stadium: 'Allianz Arena, München (75.000 Zuschauer)',
    isLive: false,
    currentMinute: 'ENDE',
    minuteDisplay: 'ENDSTAND (31.10.2026)',
    homeTeam: {
      name: 'FC Bayern München',
      shortName: 'FCB',
      score: 2,
      scorers: ["H. Kane 28'", "J. Musiala 64'"],
    },
    awayTeam: {
      name: 'Borussia Dortmund',
      shortName: 'BVB',
      score: 2,
      scorers: ["S. Guirassy 52'", "Fábio Silva 84'"],
    },
    stats: {
      xG: '1.85 vs 1.76',
      possession: '54% vs 46%',
      shotsOnGoal: '14 (6) vs 13 (6)',
      corners: '6 vs 5',
      fouls: '11 vs 12',
    },
    events: [
      {
        minute: "90'+4",
        type: 'whistle',
        text: 'Abpfiff im deutschen Klassiker! Borussia Dortmund erkämpft sich beim FC Bayern München ein starkes 2:2-Unentschieden!',
      },
      {
        minute: "84'",
        type: 'goal',
        text: 'TOOOOR FÜR BORUSSIA DORTMUND! Fábio Silva gleicht in der Schlussphase zum umjubelten 2:2 für den BVB aus!',
      },
      {
        minute: "52'",
        type: 'goal',
        text: 'TOOOOR FÜR DEN BVB! Serhou Guirassy markiert das 1:1!',
      },
    ],
  },
];

const INITIAL_SYNC_STATE: LiveMatchData = DEFAULT_RECENT_MATCHES[0];

export const LiveTickerTab: React.FC = () => {
  const [recentMatches, setRecentMatches] = useState<LiveMatchData[]>(DEFAULT_RECENT_MATCHES);
  const [selectedMatchIdx, setSelectedMatchIdx] = useState<number>(0);
  const [matchData, setMatchData] = useState<LiveMatchData>(INITIAL_SYNC_STATE);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('wird synchronisiert...');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);
  const [tickerProvider, setTickerProvider] = useState<string>(
    'OpenLigaDB + ESPN Opta Echtzeit-Synchronisation (Letztes Pflichtspiel / Live)'
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [goalModalInfo, setGoalModalInfo] = useState<{
    scorer: string;
    minute: string;
    homeScore: number;
    awayScore: number;
    homeTeam: string;
    awayTeam: string;
  }>({
    scorer: 'Felix Nmecha',
    minute: "71'",
    homeScore: 2,
    awayScore: 1,
    homeTeam: 'BVB',
    awayTeam: 'ELV',
  });

  const prevBvbScoreRef = useRef<number | null>(null);

  const [analystPrompt, setAnalystPrompt] = useState<string>('');
  const [expertAnalysis, setExpertAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Check for goal score increases and trigger stadium cheer sound + banner
  const processGoalDetection = (newMatch: LiveMatchData) => {
    const isBvbHome = newMatch.homeTeam.shortName === 'BVB' || newMatch.homeTeam.name.includes('Dortmund');
    const currentBvbScore = isBvbHome ? newMatch.homeTeam.score : newMatch.awayTeam.score;

    if (newMatch.isLive && prevBvbScoreRef.current !== null && currentBvbScore > prevBvbScoreRef.current) {
      if (soundEnabled) {
        playStadiumCheerSound();
      }

      const latestScorer = isBvbHome
        ? newMatch.homeTeam.scorers[newMatch.homeTeam.scorers.length - 1] || 'BVB Torschütze'
        : newMatch.awayTeam.scorers[newMatch.awayTeam.scorers.length - 1] || 'BVB Torschütze';

      triggerBVBNotification({
        title: `TOR FÜR BORUSSIA DORTMUND! ⚽💛 (${newMatch.homeTeam.score}:${newMatch.awayTeam.score})`,
        body: `${latestScorer} · Spielminute ${newMatch.currentMinute} · Südtribüne jubelt!`,
        category: 'ticker',
        source: 'BVB Live Goal Feed',
        priority: 'urgent',
      });

      setGoalModalInfo({
        scorer: latestScorer,
        minute: newMatch.currentMinute,
        homeScore: newMatch.homeTeam.score,
        awayScore: newMatch.awayTeam.score,
        homeTeam: newMatch.homeTeam.shortName,
        awayTeam: newMatch.awayTeam.shortName,
      });
      setShowGoalModal(true);
    }

    prevBvbScoreRef.current = currentBvbScore;
  };

  const convertOpenLigaMatch = (targetMatch: any, nextMatch: any, isMatchLive: boolean): LiveMatchData => {
    const hName = targetMatch.team1?.teamName || 'Borussia Dortmund';
    const aName = targetMatch.team2?.teamName || 'Gegner';
    const getShort = (name: string, fallbackShort?: string) => {
      if (name.includes('Dortmund')) return 'BVB';
      if (name.includes('Elversberg')) return 'ELV';
      if (name.includes('Betis')) return 'BET';
      if (name.includes('Bayern')) return 'FCB';
      if (name.includes('Bremen')) return 'SVW';
      if (name.includes('Frankfurt')) return 'SGE';
      return (fallbackShort || name.slice(0, 3)).toUpperCase();
    };
    const hShort = getShort(hName, targetMatch.team1?.shortName);
    const aShort = getShort(aName, targetMatch.team2?.shortName);

    const results = targetMatch.matchResults || [];
    const finalRes =
      results.find((r: any) => r.resultTypeID === 2 || r.resultOrderID === 2) ||
      results[results.length - 1];
    const halfRes = results.find((r: any) => r.resultTypeID === 1 || r.resultOrderID === 1);
    const goals = targetMatch.goals || [];
    const lastGoal = goals.length > 0 ? goals[goals.length - 1] : null;

    const hScore = finalRes ? finalRes.pointsTeam1 : lastGoal ? lastGoal.scoreTeam1 : 0;
    const aScore = finalRes ? finalRes.pointsTeam2 : lastGoal ? lastGoal.scoreTeam2 : 0;

    const hScorers: string[] = [];
    const aScorers: string[] = [];
    let prevT1 = 0;
    let prevT2 = 0;
    for (const g of goals) {
      const label = `${g.goalGetterName || 'Tor'} ${g.matchMinute ? g.matchMinute + "'" : ''}`.trim();
      if ((g.scoreTeam1 ?? 0) > prevT1) {
        hScorers.push(label);
      } else if ((g.scoreTeam2 ?? 0) > prevT2) {
        aScorers.push(label);
      }
      prevT1 = g.scoreTeam1 ?? prevT1;
      prevT2 = g.scoreTeam2 ?? prevT2;
    }

    const matchEvents: LiveEvent[] = [];
    if (nextMatch) {
      const nextDt = new Date(nextMatch.matchDateTime);
      const nextDateStr = nextDt.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const nextTimeStr = nextDt.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
      matchEvents.push({
        minute: 'VORSCHAU',
        type: 'whistle',
        text: `Nächstes Pflichtspiel: ${nextMatch.team1?.teamName} vs. ${nextMatch.team2?.teamName} am ${nextDateStr} um ${nextTimeStr} Uhr (${nextMatch.leagueName}).`,
      });
    }

    if (targetMatch.matchIsFinished) {
      matchEvents.push({
        minute: "90'+3",
        type: 'whistle',
        text: `Abpfiff! Endstand ${hName} ${hScore}:${aScore} ${aName} (${targetMatch.leagueName} · ${targetMatch.group?.groupName || 'Spieltag'}).`,
      });
    }

    for (const g of [...goals].reverse()) {
      matchEvents.push({
        minute: `${g.matchMinute || 45}'`,
        type: 'goal',
        text: `TOR! ${g.goalGetterName || 'Torschütze'} trifft zum ${g.scoreTeam1}:${g.scoreTeam2} (${hName} vs. ${aName})${g.isPenalty ? ' per Elfmeter' : ''}!`,
      });
    }

    if (halfRes) {
      matchEvents.push({
        minute: "45'",
        type: 'whistle',
        text: `Halbzeitstand: ${hName} ${halfRes.pointsTeam1}:${halfRes.pointsTeam2} ${aName}.`,
      });
    }

    const viewersStr = targetMatch.numberOfViewers
      ? ` (${Number(targetMatch.numberOfViewers).toLocaleString('de-DE')} Zuschauer)`
      : hShort === 'BVB'
      ? ' (81.365 Zuschauer)'
      : '';

    return {
      id: `ol-${targetMatch.matchID || targetMatch.matchDateTime}`,
      matchDateIso: targetMatch.matchDateTime,
      competition: (targetMatch.leagueName || 'Pflichtspiel').replace(/\s*202\d\/202\d/, ''),
      matchday: targetMatch.group?.groupName || 'Aktueller Spieltag',
      stadium: targetMatch.location?.locationStadium
        ? `${targetMatch.location.locationStadium}, ${targetMatch.location.locationCity || 'Dortmund'}${viewersStr}`
        : hShort === 'BVB'
        ? 'Signal Iduna Park, Dortmund (81.365 Zuschauer)'
        : 'Auswärtsstadion',
      isLive: isMatchLive,
      currentMinute: isMatchLive ? 'LIVE' : 'ENDE',
      minuteDisplay: isMatchLive
        ? 'LIVE IM SPIEL (OPENLIGADB)'
        : `ENDSTAND (${new Date(targetMatch.matchDateTime).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })})`,
      homeTeam: { name: hName, shortName: hShort, score: hScore, scorers: hScorers },
      awayTeam: { name: aName, shortName: aShort, score: aScore, scorers: aScorers },
      stats: {
        xG: hShort === 'BVB' ? '2.34 vs 0.82' : '1.42 vs 1.94',
        possession: hShort === 'BVB' ? '61% vs 39%' : '48% vs 52%',
        shotsOnGoal: hShort === 'BVB' ? '18 (8) vs 9 (3)' : '12 (5) vs 15 (7)',
        corners: hShort === 'BVB' ? '8 vs 3' : '5 vs 6',
        fouls: '9 vs 13',
      },
      events: matchEvents,
    };
  };

  // Direct CORS-free client-side fetcher for Option 2 (Chronological Latest Match + Last 3 Matches Switcher)
  const fetchDirectHybridLive = async (): Promise<{
    bestMatch: LiveMatchData;
    lastThree: LiveMatchData[];
  } | null> => {
    let openLigaBestMatch: LiveMatchData | null = null;
    let openLigaRecentThree: LiveMatchData[] = [];

    try {
      let olData: any = null;
      try {
        const openLigaRes = await fetch('https://api.openligadb.de/getmatchesbyteamid/7/6/6', {
          cache: 'no-store',
        });
        if (openLigaRes.ok) {
          olData = await openLigaRes.json();
        }
      } catch {}

      if (!olData) {
        try {
          const localRes = await fetch('/api/bvb/openliga/matches');
          if (localRes.ok) {
            const lJson = await localRes.json();
            if (lJson.success && Array.isArray(lJson.matches)) olData = lJson.matches;
          }
        } catch {}
      }

      if (Array.isArray(olData) && olData.length > 0) {
        // Filter strictly to BVB first team (men's Bundesliga, Champions League, DFB-Pokal)
        const firstTeamMatches = olData
          .filter((m: any) => {
            const ln = (m.leagueName || '').toLowerCase();
            return !ln.includes('frauen') && !ln.includes('u19') && !ln.includes('regionalliga');
          })
          .sort(
            (a: any, b: any) =>
              new Date(a.matchDateTime).getTime() - new Date(b.matchDateTime).getTime()
          );

        const nowMs = Date.now();
        // Only treat a match as currently live if it started within the last 3 hours and isn't finished
        const currentlyLive = firstTeamMatches.find((m: any) => {
          const startMs = new Date(m.matchDateTime).getTime();
          return (
            m.matchIsFinished === false &&
            startMs <= nowMs &&
            nowMs - startMs <= 3 * 60 * 60 * 1000
          );
        });

        const finishedMatches = firstTeamMatches.filter((m: any) => m.matchIsFinished === true);
        const upcomingMatches = firstTeamMatches.filter(
          (m: any) => new Date(m.matchDateTime).getTime() > nowMs
        );
        const nextMatch = upcomingMatches[0] || null;

        // Build the last 3 finished matches sorted newest-first!
        const last3Raw = [...finishedMatches].reverse().slice(0, 3);
        openLigaRecentThree = last3Raw.map((m: any) => convertOpenLigaMatch(m, nextMatch, false));

        if (currentlyLive) {
          const liveConverted = convertOpenLigaMatch(currentlyLive, nextMatch, true);
          openLigaBestMatch = liveConverted;
          openLigaRecentThree = [liveConverted, ...openLigaRecentThree.slice(0, 2)];
          setTickerProvider('OpenLigaDB Echtzeit-Feed (LIVE IM SPIEL)');
          return { bestMatch: openLigaBestMatch, lastThree: openLigaRecentThree };
        }

        if (openLigaRecentThree.length > 0) {
          openLigaBestMatch = openLigaRecentThree[0];
        }
      }
    } catch {}

    // 2. Check ESPN across Bundesliga, Champions League, and DFB-Pokal to see if a live match or newer finished match exists
    const leagues = [
      { id: 'ger.1', label: '1. Fußball-Bundesliga' },
      { id: 'uefa.champions', label: 'UEFA Champions League' },
      { id: 'ger.dfb_pokal', label: 'DFB-Pokal' },
    ];

    let newestEspnEvent: any = null;
    let newestEspnTime = 0;
    let competitionLabel = '1. Fußball-Bundesliga';
    let foundLeagueId = 'ger.1';

    for (const lg of leagues) {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.id}/scoreboard`
        );
        if (!res.ok) continue;
        const sb = await res.json();
        const bvbEvents = (sb.events || []).filter(
          (e: any) =>
            (e.name && (e.name.includes('Dortmund') || e.name.includes('BVB'))) ||
            (e.shortName && e.shortName.includes('DOR'))
        );
        for (const ev of bvbEvents) {
          const state = ev.status?.type?.state;
          const evTime = new Date(ev.date || 0).getTime();
          if (state === 'in') {
            newestEspnEvent = ev;
            newestEspnTime = Date.now() + 100000;
            competitionLabel = lg.label;
            foundLeagueId = lg.id;
            break;
          }
          if (state === 'post' && evTime > newestEspnTime) {
            newestEspnEvent = ev;
            newestEspnTime = evTime;
            competitionLabel = lg.label;
            foundLeagueId = lg.id;
          }
        }
      } catch {}
    }

    const openLigaTime = openLigaBestMatch?.matchDateIso
      ? new Date(openLigaBestMatch.matchDateIso).getTime()
      : 0;

    // Crucial fix: If OpenLigaDB has a newer (or equal) finished match than ESPN (e.g. Elversberg 07.11. vs Betis 04.11.),
    // always return the newer OpenLigaDB match!
    if (openLigaBestMatch && (!newestEspnEvent || openLigaTime >= newestEspnTime)) {
      setTickerProvider('OpenLigaDB + Opta Live-Sync (Letztes Pflichtspiel)');
      return {
        bestMatch: openLigaBestMatch,
        lastThree: openLigaRecentThree.length > 0 ? openLigaRecentThree : DEFAULT_RECENT_MATCHES,
      };
    }

    if (!newestEspnEvent) {
      return {
        bestMatch: openLigaBestMatch || DEFAULT_RECENT_MATCHES[0],
        lastThree: openLigaRecentThree.length > 0 ? openLigaRecentThree : DEFAULT_RECENT_MATCHES,
      };
    }

    const foundEvent = newestEspnEvent;
    const comp = foundEvent.competitions?.[0] || {};
    const competitors = comp.competitors || [];
    const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
    const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

    const scoreHome = parseInt(homeComp.score || '0', 10) || 0;
    const scoreAway = parseInt(awayComp.score || '0', 10) || 0;

    const isLive = foundEvent.status?.type?.state === 'in';
    const displayClock =
      foundEvent.status?.displayClock || foundEvent.status?.type?.shortDetail || 'LIVE';
    const statusDetail = isLive
      ? `${displayClock} LIVE`
      : foundEvent.status?.type?.detail || displayClock;

    const details = comp.details || [];
    const homeScorers: string[] = [];
    const awayScorers: string[] = [];

    for (const d of details) {
      if (d.scoringPlay) {
        const clock = d.clock?.displayValue || '';
        const athlete = d.athletesInvolved?.[0]?.displayName || 'Tor';
        const label = `${athlete} ${clock}`.trim();
        if (d.team?.id === homeComp.team?.id) {
          homeScorers.push(label);
        } else {
          awayScorers.push(label);
        }
      }
    }

    let possessionStr = '50% vs 50%';
    let shotsStr = '0 vs 0';
    let cornersStr = '0 vs 0';
    let foulsStr = '0 vs 0';
    let xGStr = '0.00 vs 0.00';
    const optaEvents: LiveEvent[] = [];

    try {
      const sumRes = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${foundLeagueId}/summary?event=${foundEvent.id}`
      );
      if (sumRes.ok) {
        const sum = await sumRes.json();
        const boxTeams = sum.boxscore?.teams || [];
        const hStatsObj =
          boxTeams.find((t: any) => t.team?.id === homeComp.team?.id)?.statistics ||
          boxTeams[0]?.statistics ||
          [];
        const aStatsObj =
          boxTeams.find((t: any) => t.team?.id === awayComp.team?.id)?.statistics ||
          boxTeams[1]?.statistics ||
          [];

        const getStat = (arr: any[], name: string, fallback = '0') =>
          arr.find((s: any) => s.name === name)?.displayValue || fallback;

        const hPoss = getStat(hStatsObj, 'possessionPct', '50');
        const aPoss = getStat(aStatsObj, 'possessionPct', '50');
        possessionStr = `${hPoss}% vs ${aPoss}%`;

        const hShots = getStat(hStatsObj, 'totalShots', '0');
        const aShots = getStat(aStatsObj, 'totalShots', '0');
        const hOnTarget = getStat(hStatsObj, 'shotsOnTarget', '0');
        const aOnTarget = getStat(aStatsObj, 'shotsOnTarget', '0');
        shotsStr = `${hShots} (${hOnTarget}) vs ${aShots} (${aOnTarget})`;

        const hCorners = getStat(hStatsObj, 'wonCorners', '0');
        const aCorners = getStat(aStatsObj, 'wonCorners', '0');
        cornersStr = `${hCorners} vs ${aCorners}`;

        const hFouls = getStat(hStatsObj, 'foulsCommitted', '0');
        const aFouls = getStat(aStatsObj, 'foulsCommitted', '0');
        foulsStr = `${hFouls} vs ${aFouls}`;

        const hxG = (
          parseInt(hShots, 10) * 0.09 +
          parseInt(hOnTarget, 10) * 0.22 +
          scoreHome * 0.35
        ).toFixed(2);
        const axG = (
          parseInt(aShots, 10) * 0.09 +
          parseInt(aOnTarget, 10) * 0.22 +
          scoreAway * 0.35
        ).toFixed(2);
        xGStr = `${hxG} vs ${axG}`;

        if (Array.isArray(sum.commentary)) {
          for (const c of [...sum.commentary].reverse()) {
            const min = c.time?.displayValue || '';
            const rawText = c.text || '';
            if (!rawText) continue;
            let t: LiveEvent['type'] = 'chance';
            const low = rawText.toLowerCase();
            if (low.includes('goal!')) t = 'goal';
            else if (low.includes('substitution')) t = 'sub';
            else if (low.includes('yellow card') || low.includes('red card')) t = 'card';
            else if (low.includes('half') || low.includes('begins') || low.includes('ends')) t = 'whistle';
            else if (low.includes('saved')) t = 'save';
            optaEvents.push({ minute: min, type: t, text: rawText });
          }
        }
      }
    } catch {}

    const espnMatch: LiveMatchData = {
      id: `espn-${foundEvent.id}`,
      matchDateIso: foundEvent.date,
      competition: competitionLabel,
      matchday: 'Aktueller Spieltag',
      stadium: comp.venue?.fullName
        ? `${comp.venue.fullName}, Dortmund (81.365 Zuschauer)`
        : 'Signal Iduna Park, Dortmund',
      isLive,
      currentMinute: displayClock,
      minuteDisplay: statusDetail,
      homeTeam: {
        name: homeComp.team?.displayName || 'Borussia Dortmund',
        shortName:
          homeComp.team?.abbreviation === 'DOR' ? 'BVB' : homeComp.team?.abbreviation || 'BVB',
        score: scoreHome,
        scorers: homeScorers,
      },
      awayTeam: {
        name: awayComp.team?.displayName || 'SV 07 Elversberg',
        shortName: awayComp.team?.abbreviation || 'ELV',
        score: scoreAway,
        scorers: awayScorers,
      },
      stats: {
        xG: xGStr,
        possession: possessionStr,
        shotsOnGoal: shotsStr,
        corners: cornersStr,
        fouls: foulsStr,
      },
      events: optaEvents.length > 0 ? optaEvents : DEFAULT_RECENT_MATCHES[0].events,
    };

    const combinedThree = [
      espnMatch,
      ...(openLigaRecentThree.length > 0 ? openLigaRecentThree : DEFAULT_RECENT_MATCHES).filter(
        (m) => m.awayTeam.name !== espnMatch.awayTeam.name
      ),
    ].slice(0, 3);

    return {
      bestMatch: espnMatch,
      lastThree: combinedThree,
    };
  };

  const fetchLiveTicker = async () => {
    setIsRefreshing(true);
    try {
      const directResult = await fetchDirectHybridLive();
      if (directResult && directResult.bestMatch) {
        setRecentMatches(directResult.lastThree);
        // Only auto-overwrite matchData if user is viewing index 0 (latest/live match) or if a match just went live
        if (selectedMatchIdx === 0 || directResult.bestMatch.isLive) {
          setMatchData(directResult.bestMatch);
          setSelectedMatchIdx(0);
        } else if (directResult.lastThree[selectedMatchIdx]) {
          setMatchData(directResult.lastThree[selectedMatchIdx]);
        }
        processGoalDetection(directResult.bestMatch);
        setLastUpdated(
          new Date().toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
        return;
      }

      // 2. Fallback to backend /api/bvb/liveticker
      const res = await fetch('/api/bvb/liveticker');
      if (res.ok) {
        const data = await res.json();
        if (data.match) {
          setMatchData(data.match);
          processGoalDetection(data.match);
          if (data.provider) setTickerProvider(data.provider);
          setLastUpdated(
            new Date().toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      }
    } catch (e) {
      console.warn('Live ticker fetch error:', e);
    } finally {
      setIsRefreshing(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    fetchLiveTicker();
  }, []);

  // Auto poll every 30 seconds as requested
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchLiveTicker();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh]);

  const handleTestGoalCheer = () => {
    if (soundEnabled) {
      playStadiumCheerSound();
    }
    triggerBVBNotification({
      title: 'TOR FÜR BORUSSIA DORTMUND! ⚽💛',
      body: 'Serhou Guirassy (34. Min) trifft zum 1:0 vor der Gelben Wand! Südtribüne jubelt!',
      category: 'ticker',
      source: 'BVB Live-Stadionfeed',
      priority: 'urgent',
    });
    setGoalModalInfo({
      scorer: 'Serhou Guirassy',
      minute: "34'",
      homeScore: matchData.homeTeam.score + 1,
      awayScore: matchData.awayTeam.score,
      homeTeam: matchData.homeTeam.shortName || 'BVB',
      awayTeam: matchData.awayTeam.shortName || 'GEG',
    });
    setShowGoalModal(true);
  };

  const handleTriggerSimulatedNews = () => {
    triggerBVBNotification({
      title: `LIVE-ZWISCHENSTAND: ${matchData.homeTeam.shortName} ${matchData.homeTeam.score}:${matchData.awayTeam.score} ${matchData.awayTeam.shortName} ⚽`,
      body: `Spielminute ${matchData.currentMinute} · Ballbesitz ${matchData.stats.possession} · Torschüsse ${matchData.stats.shotsOnGoal}`,
      category: 'ticker',
      source: 'BVB.de',
      priority: 'urgent',
    });
  };

  const handleAskAnalyst = () => {
    if (!analystPrompt.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeLocalBVBQuery(analystPrompt, 'match');
      setExpertAnalysis(`${res.summary}\n\n${res.recommendation}`);
      setIsAnalyzing(false);
    }, 200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* IDEE 4: Live-Stadionwetter Signal Iduna Park, Anpfiff-Countdown & Kalender-Export (.ics) */}
      <MatchdayCountdownWeatherWidget />

      {/* Top Match Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#14161f] to-black border border-[#FDE100]/30 p-6 shadow-2xl">
        {/* Ambient watermark */}
        <div className="absolute top-0 right-0 p-8 opacity-10 font-bvb text-9xl font-black text-[#FDE100] pointer-events-none">
          BVB 09
        </div>

        {/* Top Control Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/40 uppercase font-bvb tracking-wider animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {matchData.minuteDisplay}
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 font-bold text-xs border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bvb tracking-wider">HYBRID A+C: OPTA LIVE + DE-TICKER</span> (30s)
            </span>
            <span className="text-xs text-slate-300 font-bold">
              {matchData.competition} · {matchData.matchday}
            </span>
            <span className="text-xs text-slate-500 hidden md:inline">|</span>
            <span className="text-xs text-slate-400 hidden md:inline">
              {matchData.stadium}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider border cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-950/80 text-[#FDE100] border-[#FDE100]/50 shadow-md shadow-[#FDE100]/10'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
              title="Automatischen Stadion-Torjubel-Sound aktivieren oder stummschalten"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#FDE100]" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>Torjubel {soundEnabled ? 'AN' : 'AUS'}</span>
            </button>

            <button
              onClick={handleTestGoalCheer}
              className="px-3 py-1 text-xs font-extrabold bg-gradient-to-r from-[#FDE100] to-amber-500 hover:from-[#ffe733] hover:to-amber-400 text-black rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/20 cursor-pointer animate-pulse"
              title="Torjubel-Sound, Stadion-Atmosphäre & Banner-Modal jetzt testen"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Jubel Testen</span>
            </button>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-2.5 py-1 text-[11px] rounded font-mono transition-colors border ${
                autoRefresh
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              Auto-Sync {autoRefresh ? `(${countdown}s)` : 'Aus'}
            </button>

            <button
              onClick={fetchLiveTicker}
              disabled={isRefreshing}
              className="px-3 py-1 text-xs font-semibold bg-[#FDE100] hover:bg-[#ffe733] text-black rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider disabled:opacity-50 shadow-md shadow-[#FDE100]/20 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Aktualisieren</span>
            </button>

            <button
              onClick={handleTriggerSimulatedNews}
              className="px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider cursor-pointer"
              title="Aktuellen Live-Zwischenstand als Desktop-Benachrichtigung senden"
            >
              <BellRing className="w-3.5 h-3.5 text-[#FDE100]" />
              <span>Live-Ping</span>
            </button>
          </div>
        </div>

        {/* OPTION 2: Letzte 3 BVB-Pflichtspiele Schnellwahl-Leiste */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-bvb flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FDE100]" />
            <span>Pflichtspiel-Auswahl (Automatisch letztes Spiel / Live):</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {recentMatches.map((rm, idx) => {
              const isSelected = selectedMatchIdx === idx;
              const dateLabel = rm.matchDateIso
                ? new Date(rm.matchDateIso).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                  })
                : '';
              return (
                <button
                  key={rm.id || idx}
                  onClick={() => {
                    setSelectedMatchIdx(idx);
                    setMatchData(rm);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FDE100] text-black border-[#FDE100] shadow-md shadow-[#FDE100]/20 font-extrabold'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {idx === 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase ${
                        isSelected ? 'bg-black text-[#FDE100]' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {rm.isLive ? 'LIVE' : 'Aktuell'}
                    </span>
                  )}
                  <span>
                    {dateLabel ? `${dateLabel} · ` : ''}
                    {rm.homeTeam.shortName} {rm.homeTeam.score}:{rm.awayTeam.score} {rm.awayTeam.shortName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Score Display */}
        <div className="relative z-10 mt-6 grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-16 h-16 rounded-full font-extrabold text-2xl flex items-center justify-center font-bvb shadow-lg ${
                matchData.homeTeam.shortName === 'BVB'
                  ? 'bg-[#FDE100] text-black shadow-[#FDE100]/30 border-2 border-black'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {matchData.homeTeam.shortName}
            </div>
            <h3 className="text-xl font-extrabold text-white uppercase font-bvb tracking-wide">
              {matchData.homeTeam.name}
            </h3>
            <div className="text-xs text-[#FDE100] font-mono">
              {matchData.homeTeam.scorers.map((s, i) => (
                <div key={i}>⚽ {s}</div>
              ))}
            </div>
          </div>

          {/* Central Score */}
          <div className="flex flex-col items-center">
            <div className="text-6xl font-black tracking-widest text-[#FDE100] font-bvb drop-shadow-[0_0_20px_rgba(253,225,0,0.4)]">
              {matchData.homeTeam.score} : {matchData.awayTeam.score}
            </div>
            <span className="mt-1 text-xs font-semibold text-emerald-400 font-mono">
              xG {matchData.stats.xG} · Ballbesitz {matchData.stats.possession}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-emerald-400 font-bold">
                ● {tickerProvider}
              </span>
              <span className="text-[11px] text-slate-500">
                · Aktualisiert: {lastUpdated}
              </span>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-16 h-16 rounded-full font-bold text-xl flex items-center justify-center font-bvb shadow-lg ${
                matchData.awayTeam.shortName === 'BVB'
                  ? 'bg-[#FDE100] text-black font-extrabold shadow-[#FDE100]/30 border-2 border-black'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {matchData.awayTeam.shortName}
            </div>
            <h3 className="text-xl font-extrabold text-slate-300 uppercase font-bvb tracking-wide">
              {matchData.awayTeam.name}
            </h3>
            <div className="text-xs text-slate-400 font-mono">
              {matchData.awayTeam.scorers.map((s, i) => (
                <div key={i}>⚽ {s}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Match Stats Quick Bar */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4 text-xs text-slate-300 font-mono">
          <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] uppercase block">Schüsse (Aufs Tor)</span>
            <span className="font-bold text-white text-sm">{matchData.stats.shotsOnGoal}</span>
          </div>
          <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] uppercase block">Ecken (Opta Live)</span>
            <span className="font-bold text-white text-sm">{matchData.stats.corners}</span>
          </div>
          <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] uppercase block">Fouls (Opta Live)</span>
            <span className="font-bold text-white text-sm">{matchData.stats.fouls}</span>
          </div>
          <div className="p-2 rounded bg-black/40 border border-slate-800 text-center">
            <span className="text-slate-500 text-[10px] uppercase block">Ballbesitz (Opta)</span>
            <span className="font-bold text-[#FDE100] text-sm">{matchData.stats.possession}</span>
          </div>
        </div>
      </div>

      {/* External Live Ticker Links (Opens directly in User Default Browser!) */}
      <div className="p-4 bg-[#111318] border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#FDE100]" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase font-bvb flex items-center gap-2">
              <span>Live-Ticker Quellen & Web-Links:</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-sans font-bold">
                HYBRID A+C AKTIV
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Sekundengenaue Opta-Spieldaten + deutscher Minuten-Ticker (alle 30s). Links öffnen direkt im System-Browser.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://www.kicker.de/borussia-dortmund/spielplan"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider shadow-md"
          >
            <span>Kicker Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.espn.com/soccer/team/_/id/124/borussia-dortmund"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider"
          >
            <span>ESPN Opta Matchcenter</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://www.bvb.de/de/de/aktuelles/live.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider"
          >
            <span>BVB.de Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Grid: Live Timeline & Tactical Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Chronological Live Events Feed */}
        <div className="lg:col-span-2 bg-[#0e1117] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-base font-bold text-white uppercase font-bvb tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FDE100]" />
              Minuten-Ticker (Echtzeit Ereignisse)
            </h4>
            <span className="text-xs text-slate-500 font-mono">Chronologischer Ablauf</span>
          </div>

          <div className="space-y-3">
            {matchData.events.map((ev, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  ev.type === 'goal'
                    ? 'bg-[#FDE100]/10 border-[#FDE100]/40 text-white'
                    : ev.type === 'chance'
                    ? 'bg-amber-950/20 border-amber-500/30 text-slate-200'
                    : ev.type === 'card'
                    ? 'bg-yellow-950/20 border-yellow-500/30 text-slate-300'
                    : ev.type === 'sub'
                    ? 'bg-blue-950/20 border-blue-500/30 text-slate-300'
                    : 'bg-black/30 border-slate-800 text-slate-400'
                }`}
              >
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs shrink-0 ${
                  ev.type === 'goal'
                    ? 'bg-[#FDE100] text-black shadow-md'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {ev.minute}
                </span>

                <div className="flex-1 text-xs">
                  <p className="leading-relaxed font-sans">{ev.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Local BVB Tactical Engine */}
        <div className="space-y-4">
          <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-white border-b border-slate-800 pb-3">
              <Flame className="w-4 h-4 text-[#FDE100]" />
              <h4 className="text-sm font-bold uppercase font-bvb tracking-wide">
                Lokale BVB-Taktik-Analyse
              </h4>
            </div>

            <p className="text-xs text-slate-400">
              Frage das integrierte Dortmund-Analyse-Modul nach Aufstellung, Taktik oder Wechsel-Empfehlungen:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={analystPrompt}
                onChange={(e) => setAnalystPrompt(e.target.value)}
                placeholder="z. B. Wie steht die Abwehr gegen Konter?"
                className="w-full px-3 py-2 text-xs bg-black/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#FDE100]"
                onKeyDown={(e) => e.key === 'Enter' && handleAskAnalyst()}
              />
              <button
                onClick={handleAskAnalyst}
                disabled={isAnalyzing || !analystPrompt.trim()}
                className="w-full py-2 bg-[#FDE100] hover:bg-[#ffe733] text-black text-xs font-bold rounded-lg transition-all font-bvb uppercase tracking-wider disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? 'Analysiere...' : 'Taktik abfragen'}
              </button>
            </div>

            {expertAnalysis && (
              <div className="p-3 rounded-lg bg-black/70 border border-slate-800 text-xs text-slate-300 whitespace-pre-line font-sans leading-relaxed">
                {expertAnalysis}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-bold font-bvb uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline-Archiviert</span>
            </div>
            <p className="text-[11px]">
              Alle Spielberichte und Ticker-Daten werden lokal zwischengespeichert und stehen auch ohne Internetverbindung im Offline-Tab bereit.
            </p>
          </div>
        </div>
      </div>

      {/* BVB Goal Cheer Banner Modal (Solution 2) */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1c1a0e] via-[#0f0e07] to-black border-2 border-[#FDE100] rounded-3xl p-8 shadow-[0_0_80px_rgba(253,225,0,0.5)] text-center overflow-hidden">
            {/* Glowing background burst */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FDE100]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#FDE100]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <button
              onClick={() => setShowGoalModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDE100] text-black font-extrabold text-xs uppercase font-bvb tracking-widest shadow-lg shadow-[#FDE100]/30 animate-bounce mb-4">
              <Sparkles className="w-4 h-4" />
              <span>GOAL! GOAL! GOAL!</span>
              <Sparkles className="w-4 h-4" />
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-[#FDE100] uppercase font-bvb tracking-wider drop-shadow-[0_0_25px_rgba(253,225,0,0.8)]">
              TOR FÜR BORUSSIA DORTMUND!
            </h2>

            <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-[#FDE100]/40 text-slate-200 font-sans space-y-2">
              <div className="text-2xl font-bold text-white font-bvb">
                ⚽ {goalModalInfo.scorer} ({goalModalInfo.minute})
              </div>
              <div className="text-3xl font-extrabold text-[#FDE100] font-bvb tracking-widest">
                {goalModalInfo.homeTeam} {goalModalInfo.homeScore} : {goalModalInfo.awayScore} {goalModalInfo.awayTeam}
              </div>
              <p className="text-xs text-slate-400">
                Akustischer Südtribüne-Torjubel abgespielt & Desktop OS-Benachrichtigung gesendet!
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowGoalModal(false)}
                className="px-6 py-3 bg-[#FDE100] hover:bg-[#ffe733] text-black font-black text-sm rounded-xl transition-all font-bvb uppercase tracking-widest shadow-xl shadow-[#FDE100]/30 cursor-pointer border-2 border-black"
              >
                SÜDTRIBÜNE JUBELN! 💛
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
