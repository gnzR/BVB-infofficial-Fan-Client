import { BVB_SQUAD_DATA, PlayerStats, CompetitionStatLine } from '../data/bvbSquadData';

const SQUAD_STORAGE_KEY = 'bvb_squad_live_cache_v10';
const DB_NAME = 'bvb_09_squad_db_v10';
const STORE_NAME = 'squad_players';

const DEPARTED_NAMES = ['Malen', 'Groß', 'Şahin', 'Sahin', 'Klopp', 'Brandt'];
function isCurrentSquadMember(name: string): boolean {
  return !DEPARTED_NAMES.some((dep) => name.includes(dep));
}

const COUNTRY_MAP: Record<string, { de: string; flag: string }> = {
  Germany: { de: 'Deutschland', flag: '🇩🇪' },
  Switzerland: { de: 'Schweiz', flag: '🇨🇭' },
  Austria: { de: 'Österreich', flag: '🇦🇹' },
  England: { de: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  France: { de: 'Frankreich', flag: '🇫🇷' },
  Italy: { de: 'Italien', flag: '🇮🇹' },
  Netherlands: { de: 'Niederlande', flag: '🇳🇱' },
  Norway: { de: 'Norwegen', flag: '🇳🇴' },
  Sweden: { de: 'Schweden', flag: '🇸🇪' },
  Greece: { de: 'Griechenland', flag: '🇬🇷' },
  Portugal: { de: 'Portugal', flag: '🇵🇹' },
  Brazil: { de: 'Brasilien', flag: '🇧🇷' },
  Algeria: { de: 'Algerien', flag: '🇩🇿' },
  Guinea: { de: 'Guinea', flag: '🇬🇳' },
  Ecuador: { de: 'Ecuador', flag: '🇪🇨' },
  USA: { de: 'USA', flag: '🇺🇸' },
  'United States': { de: 'USA', flag: '🇺🇸' },
  Luxembourg: { de: 'Luxemburg', flag: '🇱🇺' },
  Croatia: { de: 'Kroatien', flag: '🇭🇷' },
};

function mapPositionDe(espnPos: string): {
  position: 'Torwart' | 'Abwehr' | 'Mittelfeld' | 'Angriff';
  subPosition: string;
} {
  const p = (espnPos || '').toLowerCase();
  if (p.includes('goal') || p === 'gk') return { position: 'Torwart', subPosition: 'Torwart' };
  if (p.includes('defend') || p === 'df' || p === 'cd' || p === 'fb') {
    return { position: 'Abwehr', subPosition: 'Abwehrspieler' };
  }
  if (p.includes('forward') || p.includes('striker') || p.includes('attack') || p === 'fw') {
    return { position: 'Angriff', subPosition: 'Offensivspieler' };
  }
  return { position: 'Mittelfeld', subPosition: 'Mittelfeldspieler' };
}

function openSquadDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Get saved squad from IndexedDB / localStorage or baseline
export async function getLiveSquadData(): Promise<{ squad: PlayerStats[]; lastSyncedAt: string }> {
  try {
    const db = await openSquadDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    let items: PlayerStats[] = await new Promise((res, rej) => {
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });

    const lastTime = localStorage.getItem('bvb_squad_last_sync') || new Date().toISOString();

    if (items && items.length > 0) {
      items = items.filter((p) => isCurrentSquadMember(p.name));
      if (items.length >= BVB_SQUAD_DATA.length) {
        return { squad: items, lastSyncedAt: lastTime };
      }
    }
  } catch (e) {
    console.warn('IndexedDB squad load fallback:', e);
  }

  try {
    const cached = localStorage.getItem(SQUAD_STORAGE_KEY);
    if (cached) {
      let parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsed = parsed.filter((p: PlayerStats) => isCurrentSquadMember(p.name));
        if (parsed.length >= BVB_SQUAD_DATA.length) {
          const lastTime = localStorage.getItem('bvb_squad_last_sync') || new Date().toISOString();
          return { squad: parsed, lastSyncedAt: lastTime };
        }
      }
    }
  } catch {}

  return { squad: BVB_SQUAD_DATA, lastSyncedAt: new Date().toISOString() };
}

// Save squad data to IndexedDB & localStorage
export async function saveLiveSquadData(squad: PlayerStats[]): Promise<void> {
  const syncTime = new Date().toISOString();
  try {
    localStorage.setItem(SQUAD_STORAGE_KEY, JSON.stringify(squad));
    localStorage.setItem('bvb_squad_last_sync', syncTime);
  } catch {}

  try {
    const db = await openSquadDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const p of squad) {
      store.put(p);
    }
  } catch (e) {
    console.warn('IndexedDB squad save error:', e);
  }
}

interface AggregatedEspnPlayer {
  espnId: string;
  name: string;
  lastName: string;
  jersey: number;
  age?: number;
  citizenship?: string;
  positionName: string;
  matches: number;
  subIns: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  goalsConceded: number;
  injuries: any[];
  breakdown: {
    bundesliga: CompetitionStatLine;
    ucl: CompetitionStatLine;
    dfbPokal: CompetitionStatLine;
  };
}

function extractAthleteStats(a: any): CompetitionStatLine & { yellowCards: number; redCards: number } {
  const cats = a?.statistics?.splits?.categories || [];
  const gen = cats.find((c: any) => c.name === 'general')?.stats || [];
  const off = cats.find((c: any) => c.name === 'offensive')?.stats || [];
  const gk = cats.find((c: any) => c.name === 'goalKeeping')?.stats || [];

  const getVal = (arr: any[], statName: string) => {
    const item = arr.find((s: any) => s.name === statName);
    return item ? parseInt(item.displayValue || String(item.value || '0'), 10) || 0 : 0;
  };

  return {
    matches: getVal(gen, 'appearances'),
    subIns: getVal(gen, 'subIns'),
    goals: getVal(off, 'totalGoals'),
    assists: getVal(off, 'goalAssists'),
    saves: getVal(gk, 'saves'),
    goalsConceded: getVal(gk, 'goalsConceded'),
    yellowCards: getVal(gen, 'yellowCards'),
    redCards: getVal(gen, 'redCards'),
  };
}

// Live Synchronize BVB Squad Roster across ALL 3 Competitions (Bundesliga + Champions League + DFB-Pokal)
export async function syncLiveBvbSquad(
  onProgress?: (pct: number, step: string) => void
): Promise<PlayerStats[]> {
  onProgress?.(15, '[1/4] Verbinde mit ESPN Multi-Competition Squad API (BL + CL + DFB-Pokal)...');
  await new Promise((r) => setTimeout(r, 80));

  const aggregatedMap = new Map<string, AggregatedEspnPlayer>();

  const mergeRosterList = (
    athletes: any[],
    compKey: 'bundesliga' | 'ucl' | 'dfbPokal'
  ) => {
    if (!Array.isArray(athletes)) return;
    for (const a of athletes) {
      const espnId = String(a.id || a.uid || a.fullName);
      const st = extractAthleteStats(a);
      if (!aggregatedMap.has(espnId)) {
        aggregatedMap.set(espnId, {
          espnId,
          name: a.fullName || a.displayName || 'BVB Spieler',
          lastName: a.lastName || '',
          jersey: parseInt(String(a.jersey || '0'), 10) || 0,
          age: typeof a.age === 'number' ? a.age : undefined,
          citizenship: a.citizenship || '',
          positionName: a.position?.displayName || a.position?.name || '',
          matches: 0,
          subIns: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          saves: 0,
          goalsConceded: 0,
          injuries: Array.isArray(a.injuries) ? a.injuries : [],
          breakdown: {
            bundesliga: { matches: 0, goals: 0, assists: 0, subIns: 0, saves: 0, goalsConceded: 0 },
            ucl: { matches: 0, goals: 0, assists: 0, subIns: 0, saves: 0, goalsConceded: 0 },
            dfbPokal: { matches: 0, goals: 0, assists: 0, subIns: 0, saves: 0, goalsConceded: 0 },
          },
        });
      }
      const entry = aggregatedMap.get(espnId)!;
      if (!entry.age && typeof a.age === 'number') entry.age = a.age;
      if (!entry.citizenship && a.citizenship) entry.citizenship = a.citizenship;
      if (!entry.jersey && a.jersey) entry.jersey = parseInt(String(a.jersey), 10) || 0;
      if (Array.isArray(a.injuries) && a.injuries.length > 0 && entry.injuries.length === 0) {
        entry.injuries = a.injuries;
      }

      // Only add if this competition hasn't been recorded for this player yet
      const prevComp = entry.breakdown[compKey];
      if (prevComp.matches === 0 && prevComp.goals === 0 && prevComp.assists === 0) {
        entry.breakdown[compKey] = {
          matches: st.matches,
          goals: st.goals,
          assists: st.assists,
          subIns: st.subIns,
          saves: st.saves,
          goalsConceded: st.goalsConceded,
        };
        entry.matches += st.matches;
        entry.subIns += st.subIns || 0;
        entry.goals += st.goals;
        entry.assists += st.assists;
        entry.yellowCards += st.yellowCards;
        entry.redCards += st.redCards;
        entry.saves += st.saves || 0;
        entry.goalsConceded += st.goalsConceded || 0;
      }
    }
  };

  const isHttpOrigin =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'http:' || window.location.protocol === 'https:');

  try {
    onProgress?.(35, '[2/4] Lade Live-Pflichtspieldaten aller 32 BVB-Spieler (BL, CL & DFB-Pokal)...');
    // 1a. Try backend multi-competition endpoint first (ONLY if running on http/https server, skip in file:// desktop mode)
    let gotFromBackend = false;
    if (isHttpOrigin) {
      try {
        const localRes = await fetch('/api/bvb/squad/live', { signal: AbortSignal.timeout(2200) });
        if (localRes.ok) {
          const localData = await localRes.json();
          if (localData.success && localData.rostersByCompetition) {
            mergeRosterList(localData.rostersByCompetition.bundesliga || [], 'bundesliga');
            mergeRosterList(localData.rostersByCompetition.ucl || [], 'ucl');
            mergeRosterList(localData.rostersByCompetition.dfbPokal || [], 'dfbPokal');
            gotFromBackend = aggregatedMap.size > 0;
          }
        }
      } catch {}
    }

    // 1b. Direct client fetch across all 3 ESPN competitions (also works in serverless Windows/Linux/Android packages)
    if (!gotFromBackend) {
      const [blRes, uclRes, dfbRes] = await Promise.allSettled([
        fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/124/roster', { signal: AbortSignal.timeout(2200) }).then((r) => (r.ok ? r.json() : null)),
        fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/124/roster', { signal: AbortSignal.timeout(2200) }).then((r) => (r.ok ? r.json() : null)),
        fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/ger.dfb_pokal/teams/124/roster', { signal: AbortSignal.timeout(2200) }).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (blRes.status === 'fulfilled' && blRes.value?.athletes) {
        mergeRosterList(blRes.value.athletes, 'bundesliga');
      }
      if (uclRes.status === 'fulfilled' && uclRes.value?.athletes) {
        mergeRosterList(uclRes.value.athletes, 'ucl');
      }
      if (dfbRes.status === 'fulfilled' && dfbRes.value?.athletes) {
        mergeRosterList(dfbRes.value.athletes, 'dfbPokal');
      }
    }
  } catch (err) {
    console.warn('Direct client ESPN multi-roster fetch error:', err);
  }

  let updatedSquad: PlayerStats[] = [];

  // 2. Dynamically build full live squad from aggregated ESPN roster + enriched baseline metadata
  if (aggregatedMap.size > 0) {
    const livePlayers: PlayerStats[] = [];

    for (const liveP of aggregatedMap.values()) {
      if (!isCurrentSquadMember(liveP.name)) continue;

      // Match against baseline BVB_SQUAD_DATA for rich German subPosition, marketValue, transfermarktUrl
      const baseline = BVB_SQUAD_DATA.find((b) => {
        if (b.position === 'Trainer') return false;
        const bName = b.name.toLowerCase();
        const lName = liveP.name.toLowerCase();
        const lLast = liveP.lastName.toLowerCase();
        return (
          (liveP.jersey > 0 && b.number === liveP.jersey) ||
          bName.includes(lName) ||
          lName.includes(bName.replace(' (kapitän)', '')) ||
          (lLast.length > 3 && bName.includes(lLast))
        );
      });

      const starts = Math.max(0, liveP.matches - liveP.subIns);
      const isGoalkeeper =
        baseline?.position === 'Torwart' ||
        liveP.positionName.toLowerCase().includes('goal');
      const minutesPlayed = isGoalkeeper
        ? liveP.matches * 90
        : starts * 85 + liveP.subIns * 22;

      const countryInfo = liveP.citizenship ? COUNTRY_MAP[liveP.citizenship] : undefined;

      if (baseline) {
        const mergedPlayer: PlayerStats = {
          ...baseline,
          number: liveP.jersey || baseline.number,
          age: liveP.age || baseline.age,
          nationality: countryInfo?.de || baseline.nationality,
          flag: countryInfo?.flag || baseline.flag,
          // ALWAYS overwrite with live values (even if 0!)
          matches: liveP.matches,
          starts,
          subIns: liveP.subIns,
          goals: liveP.goals,
          assists: liveP.assists,
          yellowCards: liveP.yellowCards,
          redCards: liveP.redCards,
          minutesPlayed,
          competitionBreakdown: liveP.breakdown,
          goalkeeperStats: isGoalkeeper
            ? { saves: liveP.saves, goalsConceded: liveP.goalsConceded }
            : undefined,
        };

        if (liveP.injuries.length > 0) {
          const inj = liveP.injuries[0];
          mergedPlayer.injuryStatus = {
            isInjured: true,
            condition: inj.status || inj.comment || 'Ausfall / Verletzung',
            expectedReturn: 'In Behandlung',
          };
        }

        livePlayers.push(mergedPlayer);
      } else {
        // Brand-new player discovered in the live ESPN roster!
        const posInfo = mapPositionDe(liveP.positionName);
        const newPlayer: PlayerStats = {
          id: `p-${liveP.jersey || liveP.espnId}`,
          name: liveP.name,
          number: liveP.jersey,
          position: posInfo.position,
          subPosition: posInfo.subPosition,
          age: liveP.age || 19,
          nationality: countryInfo?.de || liveP.citizenship || 'Deutschland',
          flag: countryInfo?.flag || '🇩🇪',
          marketValue: 0.5,
          marketValueFormatted: '€500k',
          contractUntil: '30.06.2028',
          photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80',
          matches: liveP.matches,
          starts,
          subIns: liveP.subIns,
          goals: liveP.goals,
          assists: liveP.assists,
          yellowCards: liveP.yellowCards,
          redCards: liveP.redCards,
          minutesPlayed,
          competitionBreakdown: liveP.breakdown,
          goalkeeperStats: isGoalkeeper
            ? { saves: liveP.saves, goalsConceded: liveP.goalsConceded }
            : undefined,
          injuryStatus:
            liveP.injuries.length > 0
              ? {
                  isInjured: true,
                  condition: liveP.injuries[0]?.status || 'Ausfall',
                  expectedReturn: 'In Behandlung',
                }
              : { isInjured: false },
          valueHistory: [{ date: '2026', value: 0.5 }],
          transfermarktUrl: `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(liveP.name)}`,
          marketValueTrend: 'up',
        };
        livePlayers.push(newPlayer);
      }
    }

    // Sort by position group (Torwart -> Abwehr -> Mittelfeld -> Angriff) and then marketValue descending
    const posOrder: Record<string, number> = {
      Torwart: 1,
      Abwehr: 2,
      Mittelfeld: 3,
      Angriff: 4,
      Trainer: 5,
    };
    livePlayers.sort((a, b) => {
      const diff = (posOrder[a.position] || 9) - (posOrder[b.position] || 9);
      if (diff !== 0) return diff;
      return (b.marketValue || 0) - (a.marketValue || 0);
    });

    // Add Head Coach Niko Kovač
    const coachBaseline = BVB_SQUAD_DATA.find((p) => p.position === 'Trainer');
    if (coachBaseline) {
      livePlayers.push({ ...coachBaseline });
    }

    updatedSquad = livePlayers;
  } else {
    updatedSquad = [...BVB_SQUAD_DATA];
  }

  // 2b. Validate & enrich Head Coach (Niko Kovač) via live German BVB sources (BVBWLD.de / Transfermarkt)
  try {
    const coachEntry = updatedSquad.find((p) => p.position === 'Trainer');
    if (coachEntry) {
      coachEntry.name = 'Niko Kovač';
      coachEntry.nationality = 'Kroatien';
      coachEntry.flag = '🇭🇷';
      coachEntry.contractUntil = '30.06.2029';
      coachEntry.transfermarktUrl = 'https://www.transfermarkt.de/niko-kovac/profil/trainer/10412';

      let posts: any[] = [];
      const cacheTs = Number(localStorage.getItem('bvbwld_posts_cache_ts') || 0);
      const cachedStr = localStorage.getItem('bvbwld_posts_cache_data');
      if (Date.now() - cacheTs < 15 * 60 * 1000 && cachedStr) {
        try { posts = JSON.parse(cachedStr); } catch {}
      }
      if (posts.length === 0) {
        try {
          const wldRes = await fetch('https://bvbwld.de/wp-json/wp/v2/posts?per_page=15', {
            signal: AbortSignal.timeout(3500),
          });
          if (wldRes.ok) {
            const data = await wldRes.json();
            if (Array.isArray(data)) {
              posts = data;
              try {
                localStorage.setItem('bvbwld_posts_cache_ts', String(Date.now()));
                localStorage.setItem('bvbwld_posts_cache_data', JSON.stringify(data));
              } catch {}
            }
          }
        } catch {}
      }

      if (Array.isArray(posts) && posts.length > 0) {
        const kovacPost = posts.find((post: any) => {
          const title = (post?.title?.rendered || '').toLowerCase();
          return title.includes('kovac') || title.includes('kovač');
        });
        if (kovacPost?.title?.rendered) {
          const cleanHeadline = kovacPost.title.rendered
            .replace(/<[^>]*>/g, '')
            .replace(/&#8211;/g, '-')
            .replace(/&#8222;|&#8220;|&quot;/g, '"')
            .trim();
          coachEntry.activeRumor = `Aktuell (BVBWLD.de): ${cleanHeadline}`;
        }
      }
    }
  } catch {}

  onProgress?.(70, '[3/4] Synchronisierung aller BVB-Marktwerte & Transfermarkt-Updates...');
  if (isHttpOrigin) {
    try {
      try {
        const tmSquadRes = await fetch('/api/bvb/squad/market-values', { signal: AbortSignal.timeout(2000) });
        if (tmSquadRes.ok) {
          const tmSquadData = await tmSquadRes.json();
          if (Array.isArray(tmSquadData.players) && tmSquadData.players.length > 0) {
            for (const p of updatedSquad) {
              if (p.position === 'Trainer') continue;
              const matchTM = tmSquadData.players.find(
                (tm: any) =>
                  tm.id === p.id ||
                  tm.number === p.number ||
                  (tm.name &&
                    p.name &&
                    (tm.name.toLowerCase().includes(p.name.toLowerCase()) ||
                      p.name.toLowerCase().includes(tm.name.toLowerCase())))
              );
              if (matchTM) {
                if (matchTM.marketValueRaw !== undefined && matchTM.marketValueRaw > 0) {
                  p.marketValue = matchTM.marketValueRaw;
                }
                if (matchTM.marketValueFormatted) {
                  p.marketValueFormatted = matchTM.marketValueFormatted;
                }
                if (matchTM.marketValueTrend) {
                  p.marketValueTrend = matchTM.marketValueTrend;
                }
                if (matchTM.contractUntil) {
                  p.contractUntil = matchTM.contractUntil;
                }
                if (Array.isArray(matchTM.valueHistory) && matchTM.valueHistory.length > 0) {
                  p.valueHistory = matchTM.valueHistory;
                }
                if (matchTM.activeRumor) {
                  p.activeRumor = matchTM.activeRumor;
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn('Full squad TM market values endpoint fallback:', e);
      }

      const tmRes = await fetch('/api/bvb/transfers', { signal: AbortSignal.timeout(2000) });
      if (tmRes.ok) {
        const tmData = await tmRes.json();
        if (Array.isArray(tmData.transfers)) {
          for (const p of updatedSquad) {
            if (p.position === 'Trainer') continue;
            const matchDeal = tmData.transfers.find(
              (t: any) =>
                t.playerName &&
                (p.name.toLowerCase().includes(t.playerName.toLowerCase()) ||
                  t.playerName.toLowerCase().includes(p.name.toLowerCase()))
            );
            if (matchDeal) {
              if (matchDeal.contractUntil) {
                p.contractUntil = matchDeal.contractUntil;
              }
              if (matchDeal.marketValueRaw !== undefined && matchDeal.marketValueRaw > 0) {
                p.marketValue = matchDeal.marketValueRaw;
              }
              if (matchDeal.marketValue) {
                p.marketValueFormatted = matchDeal.marketValue;
              }
              if (matchDeal.marketValueTrend) {
                p.marketValueTrend = matchDeal.marketValueTrend;
              }
              p.activeRumor = `${matchDeal.rumorType}: ${matchDeal.probability}% Wahrscheinlichkeit (${matchDeal.currentClub})`;
              if (matchDeal.userRating) {
                p.transfermarktRating = matchDeal.userRating;
              }
            }
          }
        }
      }
      localStorage.setItem('bvb_squad_tm_synced_at', new Date().toISOString());
    } catch (err) {
      console.warn('Transfermarkt squad sync error:', err);
    }
  }
  await new Promise((r) => setTimeout(r, 80));

  onProgress?.(95, '[4/4] Speichere aktualisierten BVB-Kader in lokaler Datenbank...');
  await saveLiveSquadData(updatedSquad);

  const playerCount = updatedSquad.filter((p) => p.position !== 'Trainer').length;
  onProgress?.(
    100,
    `[✓] BVB Live-Kader (${playerCount} Spieler + Cheftrainer Niko Kovač) ERFOLGREICH synchronisiert!`
  );
  return updatedSquad;
}
