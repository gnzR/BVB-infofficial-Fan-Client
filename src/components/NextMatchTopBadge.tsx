import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Flame } from 'lucide-react';

interface NextMatchInfo {
  opponent: string;
  isHome: boolean;
  competition: string;
  kickoffIso: string;
  venue: string;
  isLive?: boolean;
  scoreText?: string;
}

const FALLBACK_UPCOMING_MATCHES: NextMatchInfo[] = [
  {
    opponent: 'FC Schalke 04',
    isHome: true,
    competition: 'Bundesliga',
    kickoffIso: '2026-11-14T14:30:00Z',
    venue: 'Signal Iduna Park',
  },
  {
    opponent: 'SC Freiburg',
    isHome: false,
    competition: 'Bundesliga',
    kickoffIso: '2026-11-21T14:30:00Z',
    venue: 'Europa-Park Stadion',
  },
  {
    opponent: 'FC Barcelona',
    isHome: true,
    competition: 'Champions League',
    kickoffIso: '2026-11-25T20:00:00Z',
    venue: 'Signal Iduna Park',
  },
  {
    opponent: 'FC Bayern München',
    isHome: true,
    competition: 'Bundesliga',
    kickoffIso: '2026-11-28T17:30:00Z',
    venue: 'Signal Iduna Park',
  },
  {
    opponent: 'Borussia Mönchengladbach',
    isHome: false,
    competition: 'Bundesliga',
    kickoffIso: '2026-12-05T17:30:00Z',
    venue: 'Borussia-Park',
  },
];

function getFallbackNextMatch(): NextMatchInfo {
  const now = Date.now();
  const upcoming = FALLBACK_UPCOMING_MATCHES.find(
    (m) => new Date(m.kickoffIso).getTime() > now - 2 * 60 * 60 * 1000
  );
  if (upcoming) return upcoming;

  // Dynamic rolling next Saturday 15:30 CET if all static dates have passed
  const d = new Date();
  const daysUntilSat = (6 - d.getDay() + 7) % 7 || 7;
  const nextSat = new Date(d.getTime() + daysUntilSat * 24 * 60 * 60 * 1000);
  nextSat.setHours(15, 30, 0, 0);
  return {
    opponent: 'RB Leipzig',
    isHome: true,
    competition: 'Bundesliga',
    kickoffIso: nextSat.toISOString(),
    venue: 'Signal Iduna Park',
  };
}

export const NextMatchTopBadge: React.FC<{
  onSelectMatchday: () => void;
  compact?: boolean;
}> = ({ onSelectMatchday, compact = false }) => {
  const [match, setMatch] = useState<NextMatchInfo>(() => getFallbackNextMatch());
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;

    async function fetchNextLiveBvbFixture() {
      try {
        const endpoints = [
          {
            url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams/124/schedule',
            comp: 'Bundesliga',
          },
          {
            url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/teams/124/schedule',
            comp: 'Königsklasse',
          },
        ];

        const results = await Promise.allSettled(
          endpoints.map((ep) =>
            fetch(ep.url, { signal: AbortSignal.timeout(2500) }).then((r) =>
              r.ok ? r.json().then((data) => ({ data, comp: ep.comp })) : null
            )
          )
        );

        const now = Date.now();
        let bestCandidate: { time: number; info: NextMatchInfo } | null = null;

        for (const res of results) {
          if (res.status !== 'fulfilled' || !res.value?.data?.events) continue;
          const { data, comp } = res.value;
          for (const ev of data.events) {
            const evTime = new Date(ev.date).getTime();
            const compObj = ev.competitions?.[0];
            const statusState = compObj?.status?.type?.state;
            const isCompleted = compObj?.status?.type?.completed === true || statusState === 'post';
            if (isCompleted) continue;

            if (evTime >= now - 2.5 * 60 * 60 * 1000) {
              const competitors = compObj?.competitors || [];
              const bvbTeam = competitors.find(
                (c: any) =>
                  String(c.team?.id) === '124' ||
                  (c.team?.displayName || '').toLowerCase().includes('dortmund')
              );
              const oppTeam = competitors.find((c: any) => c !== bvbTeam);
              if (!oppTeam) continue;

              const isHome = bvbTeam?.homeAway === 'home';
              const opponentName =
                oppTeam.team?.shortDisplayName || oppTeam.team?.displayName || 'Gegner';
              const isLive = statusState === 'in';
              const scoreText = isLive
                ? `${competitors[0]?.score?.displayValue || '0'}:${competitors[1]?.score?.displayValue || '0'}`
                : undefined;

              const candidateInfo: NextMatchInfo = {
                opponent: opponentName,
                isHome,
                competition: comp,
                kickoffIso: ev.date,
                venue: compObj?.venue?.fullName || (isHome ? 'Signal Iduna Park' : 'Auswärts'),
                isLive,
                scoreText,
              };

              if (!bestCandidate || evTime < bestCandidate.time) {
                bestCandidate = { time: evTime, info: candidateInfo };
              }
            }
          }
        }

        if (!isCancelled && bestCandidate) {
          setMatch(bestCandidate.info);
        }
      } catch {
        // Keep fallback fixture seamlessly
      }
    }

    fetchNextLiveBvbFixture();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      if (match.isLive) {
        setCountdownText(`LIVE ${match.scoreText || ''}`);
        return;
      }
      const diffMs = new Date(match.kickoffIso).getTime() - Date.now();
      if (diffMs <= 0) {
        setCountdownText('HEUTE LIVE');
        return;
      }
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const mins = totalMinutes % 60;

      if (days > 0) {
        setCountdownText(`in ${days}T ${hours}Std`);
      } else if (hours > 0) {
        setCountdownText(`in ${hours}Std ${mins}Min`);
      } else {
        setCountdownText(`in ${mins}Min`);
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 30000);
    return () => window.clearInterval(timer);
  }, [match]);

  const formattedKickoff = (() => {
    try {
      const d = new Date(match.kickoffIso);
      return d.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  if (compact) {
    return (
      <button
        onClick={onSelectMatchday}
        className="w-full mt-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#171a24] via-[#12151e] to-[#171a24] hover:from-[#FDE100]/20 hover:to-[#FDE100]/10 border border-[#FDE100]/35 flex items-center justify-between gap-2 text-left transition-all cursor-pointer group"
        title="Tippen für Spieltags-Hub & Stadion-Infos"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-1.5 py-0.5 rounded bg-[#FDE100] text-black font-mono text-[9px] font-black uppercase shrink-0">
            {match.isLive ? '🔴 LIVE' : 'NÄCHSTES SPIEL'}
          </span>
          <span className="text-xs font-extrabold text-white truncate font-bvb uppercase tracking-wide">
            {match.isHome ? `BVB vs. ${match.opponent}` : `${match.opponent} vs. BVB`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-2 py-0.5 rounded bg-black/70 border border-[#FDE100]/40 text-[#FDE100] font-mono text-[10px] font-bold">
            {countdownText}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FDE100] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onSelectMatchday}
      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#151821] via-[#101218] to-[#151821] hover:from-[#FDE100]/20 hover:to-[#FDE100]/10 border border-[#FDE100]/40 hover:border-[#FDE100] transition-all flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer group shadow-sm"
      title={`Nächstes Pflichtspiel (${match.competition}): ${formattedKickoff} (${match.venue}) – Klicken für Spieltags-Hub`}
    >
      <div className="flex items-center gap-1.5">
        {match.isLive ? (
          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-black uppercase animate-pulse flex items-center gap-1">
            <Flame className="w-3 h-3" />
            LIVE
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded bg-[#FDE100]/20 border border-[#FDE100]/50 text-[#FDE100] font-mono text-[10px] font-extrabold uppercase flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {match.competition === 'Champions League' ? 'UCL' : match.competition === 'Bundesliga' ? 'BL' : 'NEXT'}
          </span>
        )}
        <span className="text-xs font-extrabold text-slate-100 group-hover:text-[#FDE100] transition-colors font-bvb uppercase tracking-wider">
          {match.isHome ? `BVB vs. ${match.opponent}` : `${match.opponent} vs. BVB`}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 border border-[#FDE100]/30 text-[#FDE100] font-mono text-[11px] font-bold">
        <Clock className="w-3 h-3 text-[#FDE100]" />
        <span>{countdownText}</span>
      </div>
    </button>
  );
};
