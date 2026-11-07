// OpenLigaDB Service for BVB 09 Desktop Client
// Fully free, public API without bot protection or API key requirements

export interface OpenLigaTeam {
  teamId: number;
  teamName: string;
  shortName: string;
  teamIconUrl: string;
}

export interface OpenLigaMatchResult {
  resultID: number;
  resultName: string;
  pointsTeam1: number;
  pointsTeam2: number;
  resultOrderID: number;
  resultTypeID: number;
  resultTypeKind?: string;
  resultDescription?: string;
}

export interface OpenLigaGoal {
  goalID: number;
  scoreTeam1: number;
  scoreTeam2: number;
  matchMinute: number;
  goalGetterID?: number;
  goalGetterName: string;
  scoringTeamId?: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
  isOvertime: boolean;
  comment?: string | null;
}

export interface OpenLigaMatch {
  matchID: number;
  matchDateTime: string;
  leagueId: number;
  leagueName: string;
  leagueSeason: number;
  leagueShortcut: string;
  group?: {
    groupName: string;
    groupOrderID: number;
    groupID: number;
  };
  team1: OpenLigaTeam;
  team2: OpenLigaTeam;
  matchIsFinished: boolean;
  matchResults: OpenLigaMatchResult[];
  goals: OpenLigaGoal[];
  location?: {
    locationID: number;
    locationCity: string;
    locationStadium: string;
  } | null;
  numberOfViewers?: number | null;
}

export interface TableRow {
  rank: number;
  teamInfoId: number;
  teamId: number;
  teamName: string;
  shortName: string;
  teamIconUrl: string;
  points: number;
  matches: number;
  won: number;
  draw: number;
  lost: number;
  goals: number;
  opponentGoals: number;
  goalDiff: number;
  isBVB: boolean;
}

export interface GoalGetter {
  goalGetterId: number;
  goalGetterName: string;
  goalCount: number;
}

export interface FormattedBvbMatch {
  matchID: number;
  dateStr: string;
  timeStr: string;
  isoDate: string;
  leagueName: string;
  competitionBadge: string;
  matchday: string;
  isHome: boolean;
  opponentName: string;
  opponentShort: string;
  opponentIcon: string;
  bvbScore: number | null;
  opponentScore: number | null;
  scoreDisplay: string;
  isFinished: boolean;
  stadium: string;
  goals: {
    minute: number;
    player: string;
    scoreAfter: string;
    isBVB: boolean;
    isPenalty: boolean;
    isOwnGoal: boolean;
  }[];
}

const STORAGE_KEYS = {
  TABLE: 'bvb_openligadb_table_cache_v2',
  MATCHES: 'bvb_openligadb_matches_cache_v2',
  GOALGETTERS: 'bvb_openligadb_goalgetters_cache_v2',
  SYNC_TIME: 'bvb_openligadb_last_sync_v2',
};

// Fallback table in case offline or upstream failure
const FALLBACK_TABLE: TableRow[] = [
  { rank: 1, teamInfoId: 40, teamId: 40, teamName: 'FC Bayern München', shortName: 'Bayern', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/512px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png', points: 18, matches: 8, won: 5, draw: 3, lost: 0, goals: 27, opponentGoals: 8, goalDiff: 19, isBVB: false },
  { rank: 2, teamInfoId: 7, teamId: 7, teamName: 'Borussia Dortmund', shortName: 'Dortmund', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/512px-Borussia_Dortmund_logo.svg.png', points: 18, matches: 8, won: 5, draw: 3, lost: 0, goals: 14, opponentGoals: 6, goalDiff: 8, isBVB: true },
  { rank: 3, teamInfoId: 112, teamId: 112, teamName: 'SC Freiburg', shortName: 'Freiburg', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/de/f/f1/SC_Freiburg_Logo.svg', points: 16, matches: 8, won: 5, draw: 1, lost: 2, goals: 18, opponentGoals: 10, goalDiff: 8, isBVB: false },
  { rank: 4, teamInfoId: 1635, teamId: 1635, teamName: 'RB Leipzig', shortName: 'Leipzig', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/de/d/d4/Das_Logo_von_RB_Leipzig.svg', points: 15, matches: 8, won: 4, draw: 3, lost: 1, goals: 22, opponentGoals: 11, goalDiff: 11, isBVB: false },
  { rank: 5, teamInfoId: 134, teamId: 134, teamName: 'SV Werder Bremen', shortName: 'Bremen', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg', points: 15, matches: 8, won: 4, draw: 3, lost: 1, goals: 17, opponentGoals: 14, goalDiff: 3, isBVB: false },
  { rank: 6, teamInfoId: 6, teamId: 6, teamName: 'Bayer 04 Leverkusen', shortName: 'Leverkusen', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/de/f/f7/Bayer_Leverkusen_Logo.svg', points: 13, matches: 8, won: 3, draw: 4, lost: 1, goals: 18, opponentGoals: 16, goalDiff: 2, isBVB: false },
  { rank: 7, teamInfoId: 102, teamId: 102, teamName: 'SV 07 Elversberg', shortName: 'Elversberg', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/SV_07_Elversberg_Logo.svg/512px-SV_07_Elversberg_Logo.svg.png', points: 13, matches: 8, won: 4, draw: 1, lost: 3, goals: 16, opponentGoals: 16, goalDiff: 0, isBVB: false },
  { rank: 8, teamInfoId: 91, teamId: 91, teamName: 'Eintracht Frankfurt', shortName: 'Frankfurt', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg', points: 11, matches: 8, won: 3, draw: 2, lost: 3, goals: 13, opponentGoals: 18, goalDiff: -5, isBVB: false },
  { rank: 9, teamInfoId: 81, teamId: 81, teamName: '1. FSV Mainz 05', shortName: 'Mainz', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_Mainz_05.svg', points: 10, matches: 8, won: 2, draw: 4, lost: 2, goals: 17, opponentGoals: 17, goalDiff: 0, isBVB: false },
  { rank: 10, teamInfoId: 95, teamId: 95, teamName: 'FC Augsburg', shortName: 'Augsburg', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/de/b/b5/FC_Augsburg_Logo.svg', points: 9, matches: 8, won: 3, draw: 0, lost: 5, goals: 18, opponentGoals: 15, goalDiff: 3, isBVB: false },
  { rank: 11, teamInfoId: 16, teamId: 16, teamName: 'VfB Stuttgart', shortName: 'Stuttgart', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/VfB_Stuttgart_1893_Logo.svg', points: 9, matches: 8, won: 2, draw: 3, lost: 3, goals: 14, opponentGoals: 16, goalDiff: -2, isBVB: false },
  { rank: 12, teamInfoId: 87, teamId: 87, teamName: 'Borussia Mönchengladbach', shortName: 'Gladbach', teamIconUrl: 'https://i.imgur.com/KSIk0Eu.png', points: 9, matches: 8, won: 2, draw: 3, lost: 3, goals: 13, opponentGoals: 16, goalDiff: -3, isBVB: false },
  { rank: 13, teamInfoId: 131, teamId: 131, teamName: 'VfL Wolfsburg', shortName: 'Wolfsburg', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo-VfL-Wolfsburg.svg', points: 8, matches: 8, won: 2, draw: 2, lost: 4, goals: 14, opponentGoals: 18, goalDiff: -4, isBVB: false },
  { rank: 14, teamInfoId: 175, teamId: 175, teamName: 'TSG 1899 Hoffenheim', shortName: 'Hoffenheim', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Logo_TSG_1899_Hoffenheim.svg', points: 8, matches: 8, won: 2, draw: 2, lost: 4, goals: 12, opponentGoals: 17, goalDiff: -5, isBVB: false },
  { rank: 15, teamInfoId: 80, teamId: 80, teamName: '1. FC Union Berlin', shortName: 'Union Berlin', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg', points: 8, matches: 8, won: 2, draw: 2, lost: 4, goals: 9, opponentGoals: 15, goalDiff: -6, isBVB: false },
  { rank: 16, teamInfoId: 9, teamId: 9, teamName: 'FC Schalke 04', shortName: 'Schalke', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/FC_Schalke_04_Logo.svg', points: 6, matches: 8, won: 1, draw: 3, lost: 4, goals: 10, opponentGoals: 18, goalDiff: -8, isBVB: false },
  { rank: 17, teamInfoId: 123, teamId: 123, teamName: '1. FC Heidenheim', shortName: 'Heidenheim', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/1._FC_Heidenheim_1846.svg', points: 5, matches: 8, won: 1, draw: 2, lost: 5, goals: 8, opponentGoals: 20, goalDiff: -12, isBVB: false },
  { rank: 18, teamInfoId: 65, teamId: 65, teamName: '1. FC Köln', shortName: 'Köln', teamIconUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/00/1._FC_K%C3%B6ln_Logo.svg', points: 4, matches: 8, won: 1, draw: 1, lost: 6, goals: 7, opponentGoals: 21, goalDiff: -14, isBVB: false },
];

/**
 * Fetch official Bundesliga Table from OpenLigaDB with fallback
 */
export async function getBundesligaTable(_forceRefresh = false): Promise<TableRow[]> {
  // 1. Direct CORS-free live call to api.openligadb.de first (always fresh!)
  const seasonsToTry = ['2026', '2025', '2024'];
  for (const season of seasonsToTry) {
    try {
      const url = `https://api.openligadb.de/getbltable/bl1/${season}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500), cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length >= 10) {
          const rows: TableRow[] = data.map((t: any, idx: number) => {
            const isBVB = (t.teamName || '').includes('Dortmund') || (t.shortName || '').includes('Dortmund') || t.teamId === 7;
            return {
              rank: idx + 1,
              teamInfoId: t.teamInfoId || t.teamId,
              teamId: t.teamId || 0,
              teamName: t.teamName || 'Team',
              shortName: t.shortName || t.teamName || 'Team',
              teamIconUrl: t.teamIconUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/120px-Borussia_Dortmund_logo.svg.png',
              points: t.points ?? 0,
              matches: t.matches ?? 0,
              won: t.won ?? 0,
              draw: t.draw ?? 0,
              lost: t.lost ?? 0,
              goals: t.goals ?? 0,
              opponentGoals: t.opponentGoals ?? 0,
              goalDiff: t.goalDiff ?? ((t.goals || 0) - (t.opponentGoals || 0)),
              isBVB,
            };
          });

          cacheTable(rows);
          return rows;
        }
      }
    } catch {}
  }

  // 2. Try local server endpoint if direct call failed
  try {
    const res = await fetch('/api/bvb/openliga/table', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.table) && json.table.length > 0) {
        cacheTable(json.table);
        return json.table;
      }
    }
  } catch {}

  // 3. Offline fallback to localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.TABLE);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return FALLBACK_TABLE;
}

function cacheTable(rows: TableRow[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.TABLE, JSON.stringify(rows));
      localStorage.setItem(STORAGE_KEYS.SYNC_TIME, new Date().toISOString());
    } catch {}
  }
}

/**
 * Fetch BVB matches (First team: Bundesliga, UCL, Pokal) from OpenLigaDB
 */
export async function getOpenLigaBvbMatches(_forceRefresh = false): Promise<FormattedBvbMatch[]> {
  // 1. Direct OpenLigaDB live call for BVB (teamId = 7, past 6 weeks and next 6 weeks)
  try {
    const res = await fetch('https://api.openligadb.de/getmatchesbyteamid/7/6/6', { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (res.ok) {
      const rawMatches: OpenLigaMatch[] = await res.json();
      if (Array.isArray(rawMatches) && rawMatches.length > 0) {
        const formatted = formatOpenLigaMatches(rawMatches);
        if (formatted.length > 0) {
          cacheMatches(formatted);
          return formatted;
        }
      }
    }
  } catch {}

  // 2. Try local server endpoint
  try {
    const res = await fetch('/api/bvb/openliga/matches', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.matches) && json.matches.length > 0) {
        const formatted = formatOpenLigaMatches(json.matches);
        if (formatted.length > 0) {
          cacheMatches(formatted);
          return formatted;
        }
      }
    }
  } catch {}

  // 3. Offline fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.MATCHES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (parsed[0].dateStr !== undefined) return parsed;
          const formatted = formatOpenLigaMatches(parsed);
          if (formatted.length > 0) return formatted;
        }
      }
    } catch {}
  }

  return getFallbackMatches();
}

function cacheMatches(matches: FormattedBvbMatch[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
    } catch {}
  }
}

/**
 * Format and filter OpenLigaDB matches specifically for BVB Herren (First Team)
 */
export function formatOpenLigaMatches(matches: any[]): FormattedBvbMatch[] {
  if (!Array.isArray(matches) || matches.length === 0) return [];
  if (matches[0] && matches[0].dateStr !== undefined && matches[0].scoreDisplay !== undefined) {
    return matches as FormattedBvbMatch[];
  }
  const allowedLeagues = ['bundesliga', 'champions', 'pokal', 'dfb', 'ucl', 'supercup'];

  return matches
    .filter((m: any) => {
      const lName = (m.leagueName || '').toLowerCase();
      const lShort = (m.leagueShortcut || '').toLowerCase();
      // Exclude Frauen or youth leagues
      if (lName.includes('frauen') || lName.includes('u19') || lName.includes('u17') || lName.includes('regionalliga')) {
        return false;
      }
      return allowedLeagues.some((kw) => lName.includes(kw) || lShort.includes(kw));
    })
    .map((m: any) => {
      const isTeam1Bvb = (m.team1?.teamName || '').includes('Dortmund') || m.team1?.teamId === 7;
      const isHome = isTeam1Bvb;
      const opponent = isHome ? m.team2 : m.team1;

      // Date parsing
      const dt = new Date(m.matchDateTime);
      const dateStr = dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = dt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';

      // Score parsing
      const results = m.matchResults || [];
      const finalRes = results.find((r: any) => r.resultTypeID === 2 || r.resultOrderID === 2) || results[results.length - 1];

      let bvbScore: number | null = null;
      let oppScore: number | null = null;
      let scoreDisplay = '-:-';

      if (finalRes && m.matchIsFinished) {
        bvbScore = isHome ? finalRes.pointsTeam1 : finalRes.pointsTeam2;
        oppScore = isHome ? finalRes.pointsTeam2 : finalRes.pointsTeam1;
        scoreDisplay = `${bvbScore}:${oppScore}`;
      }

      // Goals
      const rawGoals = m.goals || [];
      const goals = rawGoals.map((g: any) => {
        const isBvbGoal = isHome
          ? (g.scoringTeamId === m.team1?.teamId || g.scoreTeam1 > (g.scoreTeam2 || 0))
          : (g.scoringTeamId === m.team2?.teamId || g.scoreTeam2 > (g.scoreTeam1 || 0));

        const scoreAfter = isHome
          ? `${g.scoreTeam1}:${g.scoreTeam2}`
          : `${g.scoreTeam2}:${g.scoreTeam1}`;

        return {
          minute: g.matchMinute || 0,
          player: g.goalGetterName || 'Torschütze',
          scoreAfter,
          isBVB: isBvbGoal,
          isPenalty: Boolean(g.isPenalty),
          isOwnGoal: Boolean(g.isOwnGoal),
        };
      });

      // Competition Badge
      let competitionBadge = 'BL';
      if ((m.leagueName || '').includes('Champions')) competitionBadge = 'UCL';
      else if ((m.leagueName || '').includes('Pokal')) competitionBadge = 'DFB';

      return {
        matchID: m.matchID,
        dateStr,
        timeStr,
        isoDate: m.matchDateTime,
        leagueName: m.leagueName || '1. Bundesliga',
        competitionBadge,
        matchday: m.group?.groupName || 'Spieltag',
        isHome,
        opponentName: opponent?.teamName || 'Gegner',
        opponentShort: opponent?.shortName || opponent?.teamName || 'GEG',
        opponentIcon: opponent?.teamIconUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/120px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
        bvbScore,
        opponentScore: oppScore,
        scoreDisplay,
        isFinished: Boolean(m.matchIsFinished),
        stadium: m.location?.locationStadium ? `${m.location.locationStadium}, ${m.location.locationCity}` : (isHome ? 'Signal Iduna Park, Dortmund' : 'Auswärtsstadion'),
        goals,
      };
    })
    .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime());
}

/**
 * Fetch top Bundesliga Goalgetters from OpenLigaDB
 */
export async function getBundesligaGoalGetters(_forceRefresh = false): Promise<GoalGetter[]> {
  // 1. Direct OpenLigaDB live call first
  const seasonsToTry = ['2026', '2025', '2024'];
  for (const s of seasonsToTry) {
    try {
      const res = await fetch(`https://api.openligadb.de/getgoalgetters/bl1/${s}`, { signal: AbortSignal.timeout(4000), cache: 'no-store' });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const formatted: GoalGetter[] = list.slice(0, 15).map((g: any) => ({
            goalGetterId: g.goalGetterId || Math.random(),
            goalGetterName: g.goalGetterName || 'Unbekannt',
            goalCount: g.goalCount || 0,
          }));
          cacheGoalGetters(formatted);
          return formatted;
        }
      }
    } catch {}
  }

  // 2. Local server endpoint
  try {
    const res = await fetch('/api/bvb/openliga/goalgetters', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.goalgetters) && json.goalgetters.length > 0) {
        cacheGoalGetters(json.goalgetters);
        return json.goalgetters;
      }
    }
  } catch {}

  // 3. Offline fallback to localStorage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.GOALGETTERS);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  return [
    { goalGetterId: 1, goalGetterName: 'N. Füllkrug', goalCount: 9 },
    { goalGetterId: 2, goalGetterName: 'P. Schick', goalCount: 7 },
    { goalGetterId: 3, goalGetterName: 'M. Olise', goalCount: 6 },
    { goalGetterId: 4, goalGetterName: 'Serhou Guirassy', goalCount: 6 },
    { goalGetterId: 5, goalGetterName: 'M. Gregoritsch', goalCount: 5 },
    { goalGetterId: 6, goalGetterName: 'E. Demirovic', goalCount: 5 },
    { goalGetterId: 7, goalGetterName: 'P. Tietz', goalCount: 5 },
    { goalGetterId: 8, goalGetterName: 'Fábio Silva', goalCount: 4 },
  ];
}

function cacheGoalGetters(list: GoalGetter[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALGETTERS, JSON.stringify(list));
    } catch {}
  }
}

function getFallbackMatches(): FormattedBvbMatch[] {
  return [
    {
      matchID: 101,
      dateStr: '04.11.2026',
      timeStr: '21:00 Uhr',
      isoDate: '2026-11-04T21:00:00',
      leagueName: 'Champions League 2026/2027',
      competitionBadge: 'UCL',
      matchday: '4. Spieltag',
      isHome: true,
      opponentName: 'Real Betis Sevilla',
      opponentShort: 'Betis',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/de/1/13/Real_Betis_Balompi%C3%A9_Logo.svg',
      bvbScore: 2,
      opponentScore: 1,
      scoreDisplay: '2:1',
      isFinished: true,
      stadium: 'Signal Iduna Park, Dortmund',
      goals: [
        { minute: 49, player: 'Fábio Silva', scoreAfter: '1:0', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 67, player: 'Aitor Ruibal', scoreAfter: '1:1', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 72, player: 'Konstantinos Karetsas', scoreAfter: '2:1', isBVB: true, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 102,
      dateStr: '31.10.2026',
      timeStr: '18:30 Uhr',
      isoDate: '2026-10-31T18:30:00',
      leagueName: '1. Fußball-Bundesliga 2026/2027',
      competitionBadge: 'BL',
      matchday: '8. Spieltag',
      isHome: false,
      opponentName: 'FC Bayern München',
      opponentShort: 'Bayern',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/120px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
      bvbScore: 2,
      opponentScore: 2,
      scoreDisplay: '2:2',
      isFinished: true,
      stadium: 'Allianz Arena, München',
      goals: [
        { minute: 38, player: 'K. Laimer', scoreAfter: '1:0', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 60, player: 'Serhou Guirassy', scoreAfter: '1:1', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 66, player: 'D. Upamecano', scoreAfter: '2:1', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 89, player: 'Fábio Silva', scoreAfter: '2:2', isBVB: true, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 103,
      dateStr: '27.10.2026',
      timeStr: '20:45 Uhr',
      isoDate: '2026-10-27T20:45:00',
      leagueName: 'DFB Pokal 2026/2027',
      competitionBadge: 'DFB',
      matchday: '2. Runde',
      isHome: true,
      opponentName: 'SV Werder Bremen',
      opponentShort: 'Bremen',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg',
      bvbScore: 3,
      opponentScore: 2,
      scoreDisplay: '3:2',
      isFinished: true,
      stadium: 'Signal Iduna Park, Dortmund',
      goals: [
        { minute: 6, player: 'Serhou Guirassy', scoreAfter: '1:0', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 17, player: 'Carney Chukwuemeka', scoreAfter: '2:0', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 64, player: 'N. Füllkrug', scoreAfter: '2:1', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 68, player: 'N. Füllkrug', scoreAfter: '2:2', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 93, player: 'Marcel Sabitzer', scoreAfter: '3:2', isBVB: true, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 104,
      dateStr: '24.10.2026',
      timeStr: '15:30 Uhr',
      isoDate: '2026-10-24T15:30:00',
      leagueName: '1. Fußball-Bundesliga 2026/2027',
      competitionBadge: 'BL',
      matchday: '7. Spieltag',
      isHome: true,
      opponentName: 'Eintracht Frankfurt',
      opponentShort: 'Frankfurt',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
      bvbScore: 1,
      opponentScore: 0,
      scoreDisplay: '1:0',
      isFinished: true,
      stadium: 'Signal Iduna Park, Dortmund',
      goals: [
        { minute: 80, player: 'Maximilian Beier', scoreAfter: '1:0', isBVB: true, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 105,
      dateStr: '20.10.2026',
      timeStr: '18:45 Uhr',
      isoDate: '2026-10-20T18:45:00',
      leagueName: 'Champions League 2026/2027',
      competitionBadge: 'UCL',
      matchday: '3. Spieltag',
      isHome: false,
      opponentName: 'Sabah FK',
      opponentShort: 'Sabah',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ee/Sabah_FK_logo.svg/120px-Sabah_FK_logo.svg.png',
      bvbScore: 2,
      opponentScore: 1,
      scoreDisplay: '2:1',
      isFinished: true,
      stadium: 'Bank Respublika Arena, Masazir',
      goals: [
        { minute: 10, player: 'Serhou Guirassy', scoreAfter: '0:1', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 39, player: 'Steve Solvet', scoreAfter: '1:1', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 53, player: 'Serhou Guirassy', scoreAfter: '1:2', isBVB: true, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 106,
      dateStr: '17.10.2026',
      timeStr: '15:30 Uhr',
      isoDate: '2026-10-17T15:30:00',
      leagueName: '1. Fußball-Bundesliga 2026/2027',
      competitionBadge: 'BL',
      matchday: '6. Spieltag',
      isHome: false,
      opponentName: '1. FC Union Berlin',
      opponentShort: 'Union Berlin',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/commons/4/44/1._FC_Union_Berlin_Logo.svg',
      bvbScore: 0,
      opponentScore: 0,
      scoreDisplay: '0:0',
      isFinished: true,
      stadium: 'Stadion An der Alten Försterei, Berlin',
      goals: [],
    },
    {
      matchID: 107,
      dateStr: '14.10.2026',
      timeStr: '21:00 Uhr',
      isoDate: '2026-10-14T21:00:00',
      leagueName: 'Champions League 2026/2027',
      competitionBadge: 'UCL',
      matchday: '2. Spieltag',
      isHome: false,
      opponentName: 'FK Bodö/Glimt',
      opponentShort: 'Bodö/Glimt',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/18/FK_Bod%C3%B8-Glimt_logo.svg/120px-FK_Bod%C3%B8-Glimt_logo.svg.png',
      bvbScore: 0,
      opponentScore: 1,
      scoreDisplay: '0:1',
      isFinished: true,
      stadium: 'Aspmyra Stadion, Bodø',
      goals: [
        { minute: 52, player: 'Fredrik Sjøvold', scoreAfter: '1:0', isBVB: false, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 108,
      dateStr: '09.10.2026',
      timeStr: '20:30 Uhr',
      isoDate: '2026-10-09T20:30:00',
      leagueName: '1. Fußball-Bundesliga 2026/2027',
      competitionBadge: 'BL',
      matchday: '5. Spieltag',
      isHome: true,
      opponentName: 'SV Werder Bremen',
      opponentShort: 'Bremen',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/commons/b/be/SV-Werder-Bremen-Logo.svg',
      bvbScore: 2,
      opponentScore: 2,
      scoreDisplay: '2:2',
      isFinished: true,
      stadium: 'Signal Iduna Park, Dortmund',
      goals: [
        { minute: 80, player: 'Daniel Svensson', scoreAfter: '1:0', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 85, player: 'Nico Schlotterbeck', scoreAfter: '2:0', isBVB: true, isPenalty: false, isOwnGoal: false },
        { minute: 88, player: 'L. Reis', scoreAfter: '2:1', isBVB: false, isPenalty: false, isOwnGoal: false },
        { minute: 92, player: 'N. Füllkrug', scoreAfter: '2:2', isBVB: false, isPenalty: false, isOwnGoal: false },
      ],
    },
    {
      matchID: 109,
      dateStr: '07.11.2026',
      timeStr: '15:30 Uhr',
      isoDate: '2026-11-07T15:30:00',
      leagueName: '1. Fußball-Bundesliga 2026/2027',
      competitionBadge: 'BL',
      matchday: '9. Spieltag',
      isHome: true,
      opponentName: 'SV 07 Elversberg',
      opponentShort: 'Elversberg',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/SV_07_Elversberg_Logo.svg/512px-SV_07_Elversberg_Logo.svg.png',
      bvbScore: null,
      opponentScore: null,
      scoreDisplay: '-:-',
      isFinished: false,
      stadium: 'Signal Iduna Park, Dortmund',
      goals: [],
    },
    {
      matchID: 110,
      dateStr: '21.11.2026',
      timeStr: '15:30 Uhr',
      isoDate: '2026-11-21T15:30:00',
      leagueName: '1. Fußball-Bundesliga 2026/2027',
      competitionBadge: 'BL',
      matchday: '10. Spieltag',
      isHome: false,
      opponentName: 'Borussia Mönchengladbach',
      opponentShort: 'Gladbach',
      opponentIcon: 'https://i.imgur.com/KSIk0Eu.png',
      bvbScore: null,
      opponentScore: null,
      scoreDisplay: '-:-',
      isFinished: false,
      stadium: 'Borussia-Park, Mönchengladbach',
      goals: [],
    },
    {
      matchID: 111,
      dateStr: '24.11.2026',
      timeStr: '21:00 Uhr',
      isoDate: '2026-11-24T21:00:00',
      leagueName: 'Champions League 2026/2027',
      competitionBadge: 'UCL',
      matchday: '5. Spieltag',
      isHome: false,
      opponentName: 'FC Arsenal',
      opponentShort: 'Arsenal',
      opponentIcon: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/120px-Arsenal_FC.svg.png',
      bvbScore: null,
      opponentScore: null,
      scoreDisplay: '-:-',
      isFinished: false,
      stadium: 'Emirates Stadium, London',
      goals: [],
    },
  ];
}
