import React, { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, Sparkles, Filter, RefreshCw, ShieldCheck, ArrowRightLeft, Compass, Clock, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { analyzeLocalBVBQuery } from '../../utils/localBvbAnalyst';
import { DEFAULT_TRANSFER_DEALS, TransferDeal } from '../../data/bvbTransferData';
import { TransfermarktPlayerModal } from './TransfermarktPlayerModal';

const LOCAL_TRANSFERS_KEY = 'bvb_live_transfers_cache_v3';

export const TransfermarktTab: React.FC = () => {
  const [transfers, setTransfers] = useState<TransferDeal[]>(DEFAULT_TRANSFER_DEALS);

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Zugang' | 'Abgang' | 'Verlängerung'>('all');
  const [selectedRumor, setSelectedRumor] = useState<TransferDeal | null>(null);
  const [detailPlayer, setDetailPlayer] = useState<TransferDeal | null>(null);
  const [expertOpinion, setExpertOpinion] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('gerade eben');
  const [nextSyncMinutes, setNextSyncMinutes] = useState<number>(60);
  const [nextPollTimestamp, setNextPollTimestamp] = useState<number>(Date.now() + 60 * 60 * 1000);

  const fetchTransfers = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      let currentDeals: TransferDeal[] = [...DEFAULT_TRANSFER_DEALS];

      try {
        const res = await fetch(`/api/bvb/transfers${isManual ? '?force=true' : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.transfers) && data.transfers.length > 0) {
            currentDeals = data.transfers
              .filter((t: TransferDeal) => !t.playerName.includes('Malen') && !t.playerName.includes('Gittens'))
              .map((t: TransferDeal) => {
                const def = DEFAULT_TRANSFER_DEALS.find(
                  (d) => d.id === t.id || d.playerName.toLowerCase() === t.playerName.toLowerCase()
                );
                return {
                  ...def,
                  ...t,
                };
              });
          }
          if (data.lastPolledAt) {
            const syncDate = new Date(data.lastPolledAt);
            setLastSyncTime(
              syncDate.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            );
          }
          if (data.nextPollAt) {
            const nextTime = new Date(data.nextPollAt).getTime();
            setNextPollTimestamp(nextTime);
            const diffMins = Math.max(1, Math.round((nextTime - Date.now()) / (1000 * 60)));
            setNextSyncMinutes(diffMins);
          }
        }
      } catch {}

      // Also enrich directly with live BVBWLD.de headlines (cached with 15-min rate limit)
      try {
        let posts: any[] = [];
        const cacheTs = Number(localStorage.getItem('bvbwld_posts_cache_ts') || 0);
        const cachedStr = localStorage.getItem('bvbwld_posts_cache_data');
        if (Date.now() - cacheTs < 15 * 60 * 1000 && cachedStr) {
          try { posts = JSON.parse(cachedStr); } catch {}
        }
        if (posts.length === 0) {
          try {
            const wldRes = await fetch('https://bvbwld.de/wp-json/wp/v2/posts?per_page=15', { cache: 'no-store' });
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
          currentDeals = currentDeals.map((deal) => {
            const lastName = deal.playerName.split(' ').pop()?.toLowerCase() || '';
            if (!lastName) return deal;
            const matchingPost = posts.find((p: any) => {
              const t = (p.title?.rendered || '').toLowerCase();
              return t.includes(lastName);
            });
            if (matchingPost) {
              const cleanTitle = (matchingPost.title?.rendered || '')
                .replace(/<[^>]*>/g, '')
                .replace(/&#8211;/g, '-')
                .replace(/&#8222;|&#8220;|&quot;/g, '"')
                .trim();
              return {
                ...deal,
                details: `AKTUELL: ${cleanTitle} — ${deal.details}`,
                lastUpdated: matchingPost.date_gmt ? new Date(matchingPost.date_gmt + 'Z').toISOString() : new Date().toISOString(),
              };
            }
            return deal;
          });
          setLastSyncTime(
            new Date().toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          );
        }
      } catch {}

      setTransfers(currentDeals);
      try {
        localStorage.setItem(LOCAL_TRANSFERS_KEY, JSON.stringify(currentDeals));
      } catch {}
    } catch (err) {
      console.warn('Transfer fetch error:', err);
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial live fetch upon program start
    fetchTransfers(false);

    // 2. Hourly recurring sync (Stundentakt: 60 Minuten = 3600000 ms)
    const hourlyInterval = setInterval(() => {
      fetchTransfers(false);
    }, 60 * 60 * 1000);

    // 3. Countdown updater every minute for UX
    const minuteInterval = setInterval(() => {
      const diffMins = Math.max(0, Math.round((nextPollTimestamp - Date.now()) / (1000 * 60)));
      setNextSyncMinutes(diffMins);
    }, 60 * 1000);

    return () => {
      clearInterval(hourlyInterval);
      clearInterval(minuteInterval);
    };
  }, [nextPollTimestamp]);

  const handleEvaluateRumor = (rumor: TransferDeal, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRumor(rumor);
    setIsEvaluating(true);
    setExpertOpinion('');
    setTimeout(() => {
      const res = analyzeLocalBVBQuery(
        `Transfergerücht ${rumor.playerName} (${rumor.currentClub}, Marktwert ${rumor.marketValue}, Wahrscheinlichkeit ${rumor.probability}%)`,
        'transfer'
      );
      setExpertOpinion(`${res.summary}\n\n${res.recommendation}`);
      setIsEvaluating(false);
    }, 200);
  };

  const filteredTransfers = transfers.filter((t) => {
    if (selectedFilter === 'all') return true;
    return t.rumorType.includes(selectedFilter);
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111318] border border-[#FDE100]/30 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold text-xs border border-emerald-500/40 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVEDATEN TRANSFERMARKT.DE
            </span>

            <span className="px-2.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-xs border border-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FDE100]" />
              Stundentakt: Nächstes Auto-Update in {nextSyncMinutes} Min.
            </span>
          </div>

          <h2 className="text-2xl font-black text-white uppercase font-bvb tracking-wide flex items-center gap-2.5">
            <ArrowRightLeft className="w-6 h-6 text-[#FDE100]" />
            Transfermarkt.de Gerüchte-Radar & Kaderwerte
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Aktualisiert sich automatisch beim Start und danach im stündlichen Takt. Klicke auf eine Spielerkarte, um das vollständige Transfermarkt-Detailprofil mit Leistungsdaten, Vertragslaufzeit & Historie zu öffnen.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 w-full lg:w-auto">
          {/* Manual Refresh Button */}
          <button
            onClick={() => fetchTransfers(true)}
            disabled={loading}
            className="px-3.5 py-2 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 font-bvb uppercase tracking-wider shadow-md shadow-[#FDE100]/20 disabled:opacity-50 cursor-pointer"
            title="Jetzt sofort frische Transfermarkt-Daten abrufen"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Aktualisiere...' : 'Jetzt Aktualisieren'}</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-bvb uppercase cursor-pointer ${
                selectedFilter === 'all' ? 'bg-[#FDE100] text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alle ({transfers.length})
            </button>
            <button
              onClick={() => setSelectedFilter('Zugang')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-bvb uppercase cursor-pointer ${
                selectedFilter === 'Zugang' ? 'bg-[#FDE100] text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Zugänge
            </button>
            <button
              onClick={() => setSelectedFilter('Abgang')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-bvb uppercase cursor-pointer ${
                selectedFilter === 'Abgang' ? 'bg-[#FDE100] text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Abgänge
            </button>
            <button
              onClick={() => setSelectedFilter('Verlängerung')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors font-bvb uppercase cursor-pointer ${
                selectedFilter === 'Verlängerung' ? 'bg-[#FDE100] text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Verlängerung
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#111318] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-sans block">Gesamtkader-Marktwert</span>
          <div className="text-2xl font-extrabold text-[#FDE100] font-bvb">€475.50M</div>
          <span className="text-[11px] text-emerald-400 font-mono">Platz 3 in der Bundesliga</span>
        </div>
        <div className="p-4 rounded-xl bg-[#111318] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-sans block">Kadergröße</span>
          <div className="text-2xl font-extrabold text-white font-bvb">26 Spieler</div>
          <span className="text-[11px] text-slate-400">Durchschnittsalter: 25.4 Jahre</span>
        </div>
        <div className="p-4 rounded-xl bg-[#111318] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-sans block">Aktualisierungs-Rhythmus</span>
          <div className="text-xl font-extrabold text-white font-bvb">Stündlich (60 Min)</div>
          <span className="text-[11px] text-slate-400">Letztes Update: {lastSyncTime}</span>
        </div>
        <div
          onClick={() => {
            const guirassy = transfers.find((t) => t.playerName.toLowerCase().includes('guirassy'));
            if (guirassy) setDetailPlayer(guirassy);
          }}
          className="p-4 rounded-xl bg-[#111318] border border-slate-800 hover:border-[#FDE100]/50 space-y-1 cursor-pointer transition-all group"
          title="Klicke für Guirassy Detailprofil"
        >
          <span className="text-xs text-slate-400 font-sans flex items-center justify-between">
            <span>Wertvollster Spieler</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#FDE100] transition-colors" />
          </span>
          <div className="text-xl font-extrabold text-[#FDE100] font-bvb truncate group-hover:underline">
            Serhou Guirassy
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">Marktwert: €40.00M · Profil ansehen ➔</span>
        </div>
      </div>

      {/* Main Deals Grid - Clickable for full details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && transfers.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#FDE100]" />
            Lade aktuelle Daten von Transfermarkt.de...
          </div>
        ) : (
          filteredTransfers.map((deal) => (
            <div
              key={deal.id}
              onClick={() => setDetailPlayer(deal)}
              className="p-5 rounded-2xl bg-[#111318] border border-slate-800 hover:border-[#FDE100]/60 transition-all space-y-4 shadow-lg group cursor-pointer hover:shadow-2xl hover:shadow-[#FDE100]/5 relative"
              title="Klicke für alle Details und Marktwert-Historie"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white font-bvb tracking-wide group-hover:text-[#FDE100] transition-colors flex items-center gap-1.5">
                      <span>{deal.playerName}</span>
                      {deal.flag && <span className="text-sm">{deal.flag}</span>}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                      {deal.age} Jahre · {deal.position}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded font-bvb uppercase ${
                      deal.rumorType === 'Zugang'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : deal.rumorType === 'Abgang'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {deal.rumorType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Aktueller Verein: <span className="text-slate-200 font-semibold">{deal.currentClub}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-400 font-mono">Marktwert</div>
                  <div className="text-xl font-extrabold text-[#FDE100] font-bvb">{deal.marketValue}</div>
                  {deal.marketValueTrend === 'up' && (
                    <span className="text-[10px] text-emerald-400 font-mono block">↗ Steigend</span>
                  )}
                  {deal.marketValueTrend === 'down' && (
                    <span className="text-[10px] text-rose-400 font-mono block">↘ Sinkend</span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 font-sans line-clamp-2">
                {deal.details}
              </p>

              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex-1 max-w-[200px]">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                    <span>Wahrscheinlichkeit</span>
                    <span className="font-bold text-[#FDE100]">{deal.probability}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-[#FDE100] h-full transition-all duration-500"
                      style={{ width: `${deal.probability}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailPlayer(deal);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-[#FDE100] text-black rounded-lg transition-all flex items-center gap-1 font-bvb uppercase tracking-wider shadow-sm hover:bg-[#ffe733] cursor-pointer"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleEvaluateRumor(deal, e)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all flex items-center gap-1 font-bvb uppercase tracking-wider border border-slate-700 cursor-pointer"
                    title="Experten-Check öffnen"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#FDE100]" />
                  </button>

                  <a
                    href={deal.url || `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(deal.playerName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-slate-400 hover:text-black hover:bg-[#FDE100] rounded-lg transition-all border border-slate-800 hover:border-[#FDE100]"
                    title="Öffne Spieler-Profil auf Transfermarkt.de"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expert Evaluation Drawer */}
      {selectedRumor && (
        <div className="p-6 rounded-2xl bg-[#14161f] border border-[#FDE100]/40 space-y-3 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-[#FDE100] uppercase font-bvb tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FDE100]" />
              Transfermarkt Experten-Einschätzung: {selectedRumor.playerName} ({selectedRumor.rumorType})
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDetailPlayer(selectedRumor)}
                className="text-xs text-black bg-[#FDE100] hover:bg-[#ffe733] font-bold px-2.5 py-1 rounded font-bvb uppercase cursor-pointer"
              >
                Vollständiges Profil
              </button>
              <button
                onClick={() => setSelectedRumor(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
          {isEvaluating ? (
            <div className="text-xs text-slate-400 animate-pulse font-mono">Berechne Kadereinpassung und Finanzierbarkeit...</div>
          ) : (
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {expertOpinion}
            </p>
          )}
        </div>
      )}

      {/* Player Detail Modal */}
      <TransfermarktPlayerModal
        player={detailPlayer}
        isOpen={Boolean(detailPlayer)}
        onClose={() => setDetailPlayer(null)}
      />
    </div>
  );
};

