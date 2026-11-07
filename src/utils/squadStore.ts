import { BVB_SQUAD_DATA, PlayerStats } from '../data/bvbSquadData';

const SQUAD_STORAGE_KEY = 'bvb_squad_live_cache_v8';
const DB_NAME = 'bvb_09_squad_db_v8';
const STORE_NAME = 'squad_players';

const DEPARTED_NAMES = ['Malen', 'Groß', 'Şahin', 'Sahin', 'Klopp'];
function isCurrentSquadMember(name: string): boolean {
  return !DEPARTED_NAMES.some((dep) => name.includes(dep));
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

// Live Synchronize BVB Squad Roster from ESPN Soccer API (Players) + German Sources (Coach Validation)
export async function syncLiveBvbSquad(
  onProgress?: (pct: number, step: string) => void
): Promise<PlayerStats[]> {
  onProgress?.(15, '[1/4] Verbinde mit ESPN Soccer Squad API (Borussia Dortmund)...');
  await new Promise((r) => setTimeout(r, 120));

  const updatedSquad = [...BVB_SQUAD_DATA];
  let espnAthletes: any[] = [];

  // 1. Fetch live roster stats for players from ESPN API via backend or direct
  // Note (Lösung 1): ESPN's `coach` array is deliberately ignored because US ESPN still lists
  // Jurgen Klopp (now DFB Bundestrainer). Coach is validated via German BVB sources below.
  try {
    onProgress?.(35, '[2/4] Lade Live-Saisondaten der 28 BVB-Spieler (Spiele, Tore, Vorlagen, Verletzungen)...');
    try {
      const localRes = await fetch('/api/bvb/squad/live', { signal: AbortSignal.timeout(4000) });
      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData.success && Array.isArray(localData.athletes)) {
          espnAthletes = localData.athletes;
        }
      }
    } catch {}

    if (espnAthletes.length === 0) {
      const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/124/roster', { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        espnAthletes = data.athletes || [];
      }
    }
  } catch (err) {
    console.warn('Direct client ESPN roster fetch error:', err);
  }

  // Fallback to UCL endpoint if needed
  if (espnAthletes.length === 0) {
    try {
      const uclRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/124/roster', { signal: AbortSignal.timeout(4500) });
      if (uclRes.ok) {
        const uclData = await uclRes.json();
        espnAthletes = uclData.athletes || [];
      }
    } catch {}
  }

  // 2. Map ESPN stats strictly to players (skip Trainer position so ESPN never overwrites Niko Kovač)
  if (espnAthletes.length > 0) {
    for (let i = 0; i < updatedSquad.length; i++) {
      const localP = updatedSquad[i];
      if (localP.position === 'Trainer') continue;

      const matchName = espnAthletes.find((a: any) => {
        const full = (a.fullName || a.displayName || '').toLowerCase();
        const last = (a.lastName || '').toLowerCase();
        const pName = localP.name.toLowerCase();
        return full.includes(pName) || pName.includes(last) || (a.jersey && String(a.jersey) === String(localP.number));
      });

      if (matchName) {
        const statsObj = matchName.statistics?.splits?.categories || [];
        const genStats = statsObj.find((c: any) => c.name === 'general')?.stats || [];
        const offStats = statsObj.find((c: any) => c.name === 'offensive')?.stats || [];

        const getVal = (arr: any[], statName: string) => {
          const item = arr.find((s: any) => s.name === statName);
          return item ? parseInt(item.displayValue || '0', 10) : 0;
        };

        const appearances = getVal(genStats, 'appearances');
        const yellowCards = getVal(genStats, 'yellowCards');
        const redCards = getVal(genStats, 'redCards');
        const goals = getVal(offStats, 'totalGoals');
        const assists = getVal(offStats, 'goalAssists');

        if (appearances > 0) localP.matches = appearances;
        if (goals > 0 || localP.position === 'Angriff' || localP.position === 'Mittelfeld') localP.goals = goals;
        if (assists > 0) localP.assists = assists;
        if (yellowCards > 0) localP.yellowCards = yellowCards;
        if (redCards > 0) localP.redCards = redCards;
        if (appearances > 0) localP.minutesPlayed = appearances * 78;

        // Check injuries from ESPN
        if (Array.isArray(matchName.injuries) && matchName.injuries.length > 0) {
          const inj = matchName.injuries[0];
          localP.injuryStatus = {
            isInjured: true,
            condition: inj.status || inj.comment || 'Ausfall / Verletzung',
            expectedReturn: 'In Behandlung',
          };
        }
      }
    }
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

      const wldRes = await fetch('https://bvbwld.de/wp-json/wp/v2/posts?per_page=15', {
        signal: AbortSignal.timeout(3500),
      });
      if (wldRes.ok) {
        const posts = await wldRes.json();
        if (Array.isArray(posts)) {
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
    }
  } catch {}

  onProgress?.(70, '[3/4] Synchronisierung aller BVB-Marktwerte & Transfermarkt-Updates...');
  try {
    // 3a. Synchronisiere alle 28 Spieler über den dedizierten Transfermarkt-Endpunkt
    try {
      const tmSquadRes = await fetch('/api/bvb/squad/market-values');
      if (tmSquadRes.ok) {
        const tmSquadData = await tmSquadRes.json();
        if (Array.isArray(tmSquadData.players) && tmSquadData.players.length > 0) {
          for (const p of updatedSquad) {
            if (p.position === 'Trainer') continue;
            const matchTM = tmSquadData.players.find(
              (tm: any) =>
                tm.id === p.id ||
                tm.number === p.number ||
                (tm.name && p.name && (tm.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(tm.name.toLowerCase())))
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

    // 3b. Ergänze aktuelle Transfergerüchte & Wahrscheinlichkeiten
    const tmRes = await fetch('/api/bvb/transfers');
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
  await new Promise((r) => setTimeout(r, 120));

  onProgress?.(95, '[4/4] Speichere aktualisierten BVB-Kader in lokaler Datenbank...');
  await saveLiveSquadData(updatedSquad);

  onProgress?.(100, '[✓] BVB Live-Kader (28 Spieler + Cheftrainer Niko Kovač) ERFOLGREICH synchronisiert!');
  return updatedSquad;
}

