import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  RefreshCw,
  Database,
  Calendar,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Newspaper,
  HardDrive,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  BvbNewsArticle,
  get60DayBvbArticles,
  sync60DayBvbArchive,
  getDirectArticleUrl,
} from '../../utils/bvbArchiveStore';
import { InfoModal } from '../InfoModal';

export const NewsArchiveTab: React.FC = () => {
  const [articles, setArticles] = useState<BvbNewsArticle[]>([]);
  const [sourceMode, setSourceMode] = useState<'all' | 'official'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedDays, setSelectedDays] = useState<number>(60);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(100);
  const [syncStepText, setSyncStepText] = useState<string>('Tagesarchiv aktuell (Letzte 60 Tage / 2 Monate)');
  const [lastSyncTime, setLastSyncTime] = useState<string>('gerade eben');
  const [newlyAddedCount, setNewlyAddedCount] = useState<number | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);

  const loadLocalArchive = async () => {
    const list = await get60DayBvbArticles();
    setArticles(list);
  };

  const handleOpenLink = (e: React.MouseEvent<HTMLAnchorElement>, targetUrl: string) => {
    // In standalone local desktop mode on Linux / CachyOS, trigger direct xdg-open in backend
    try {
      fetch(`/api/open-external?url=${encodeURIComponent(targetUrl)}`, { method: 'POST' }).catch(() => {});
    } catch {}
  };

  const executeSync = async (silent = false) => {
    if (!silent) {
      setIsSyncing(true);
      setSyncProgress(0);
    }
    try {
      const result = await sync60DayBvbArchive((pct, step) => {
        if (!silent) {
          setSyncProgress(pct);
          setSyncStepText(step);
        }
      });
      setArticles(result.articles);
      setNewlyAddedCount(result.newArticlesCount);
      setLastSyncTime(
        new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      if (!silent) {
        setIsSyncing(false);
      }
    }
  };

  useEffect(() => {
    // 1. Instant load from local DB / storage
    loadLocalArchive().then(() => {
      // 2. Automated background live update to ensure latest news are always fresh
      executeSync(true);
    });
  }, []);

  const handleManualSync = () => {
    executeSync(false);
  };

  const now = Date.now();
  const maxAgeMs = selectedDays * 24 * 60 * 60 * 1000;

  const filteredArticles = articles.filter((item) => {
    // Official vs All filter
    const isOfficial =
      item.source.toLowerCase().includes('bvb') ||
      item.category === 'BVB.de' ||
      item.url.includes('bvb.de');

    if (sourceMode === 'official' && !isOfficial) return false;

    // Search query match
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());

    // Category / Source filter
    const catNorm = selectedCat.toLowerCase();
    const sourceNorm = (item.source || '').toLowerCase();
    const matchesCat =
      selectedCat === 'all' ||
      item.category.toLowerCase() === catNorm ||
      sourceNorm.includes(catNorm) ||
      (catNorm === 'bvb.de' && (sourceNorm.includes('bvb') || item.category === 'BVB.de' || item.url.includes('bvb.de'))) ||
      (catNorm === 'transfermarkt' && sourceNorm.includes('transfermarkt')) ||
      (catNorm === 'ruhr nachrichten' && (sourceNorm.includes('ruhr') || sourceNorm.includes('nachrichten'))) ||
      (catNorm === 'kicker' && sourceNorm.includes('kicker')) ||
      (catNorm === 'bvbwld.de' && (sourceNorm.includes('bvbwld') || item.category === 'BVBWLD.de' || item.url.includes('bvbwld.de'))) ||
      (catNorm === 'spieltag' && item.category === 'Spieltag') ||
      (catNorm === 'verletzungen' && item.category === 'Verletzungen');

    // Timeframe filter
    const articleAgeMs = now - new Date(item.publishedAt).getTime();
    const matchesTimeframe = selectedDays === 60 || articleAgeMs <= maxAgeMs;

    // Strict Borussia Dortmund Filter (Guarantee zero unrelated club news)
    const isStrictBvb = /dortmund|bvb|borussia/i.test(item.title + ' ' + item.summary + ' ' + item.source);

    return matchesSearch && matchesCat && matchesTimeframe && isStrictBvb;
  });

  const officialCount = articles.filter(
    (item) =>
      item.source.toLowerCase().includes('bvb') ||
      item.category === 'BVB.de' ||
      item.url.includes('bvb.de')
  ).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-[#14161f] to-black border border-[#FDE100]/30 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 font-bvb text-9xl font-black text-[#FDE100] pointer-events-none select-none">
          BVB 09
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            {/* Source Toggle Switch & Info Button */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSourceMode('all')}
                className={`px-3 py-1 rounded-lg font-bold text-xs uppercase font-bvb tracking-wider transition-all cursor-pointer border ${
                  sourceMode === 'all'
                    ? 'bg-[#FDE100] text-black border-[#FDE100] shadow-md shadow-[#FDE100]/30 font-extrabold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                📰 Alle Quellen ({articles.length} BVB-News)
              </button>

              <button
                onClick={() => setSourceMode('official')}
                className={`px-3 py-1 rounded-lg font-extrabold text-xs uppercase font-bvb tracking-wider transition-all cursor-pointer border ${
                  sourceMode === 'official'
                    ? 'bg-[#FDE100] text-black border-[#FDE100] shadow-md shadow-[#FDE100]/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                💛 Offiziell BVB.de ({officialCount})
              </button>

              <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold text-xs border border-emerald-500/40 font-mono">
                ECHTZEIT-FEED
              </span>

              {newlyAddedCount !== null && (
                <span className="px-2.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold text-xs border border-amber-500/40 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  {newlyAddedCount > 0
                    ? `+${newlyAddedCount} NEUE ARTIKEL`
                    : 'DATENBANK AKTUELL (0 DUPLIKATE)'}
                </span>
              )}

              {/* Info Button */}
              <button
                onClick={() => setIsInfoModalOpen(true)}
                className="px-3 py-1 bg-slate-900 hover:bg-[#FDE100] hover:text-black text-[#FDE100] font-extrabold text-xs rounded-lg transition-all border border-[#FDE100]/40 flex items-center gap-1.5 font-bvb uppercase tracking-wider cursor-pointer ml-auto"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Info & Quellen (v2.5.0 Gold)</span>
              </button>
            </div>

            <h2 className="text-2xl font-black text-white uppercase font-bvb tracking-wide flex items-center gap-2.5">
              <Database className="w-6 h-6 text-[#FDE100]" />
              BVB 09 Nachrichten-Archiv (Letzte 60 Tage / 2 Monate)
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Erfasst & cacht automatisch alle aktuellen Borussia Dortmund Meldungen von BVB.de, Transfermarkt, Kicker, Ruhr Nachrichten und Sky Sport. Bereits vorhandene Meldungen werden nicht neu indiziert. Altbestände &gt; 60 Tage werden automatisch entfernt.
            </p>
          </div>

          {/* Sync Action & Status */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2 bg-[#FDE100] hover:bg-[#ffe733] text-black text-xs font-extrabold rounded-lg transition-all flex items-center gap-2 font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisiere...' : 'Jetzt Aktualisieren'}</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Letztes Update: {lastSyncTime}
            </span>
          </div>
        </div>

        {/* Live Sync Progress Bar */}
        {isSyncing && (
          <div className="relative z-10 mt-4 p-3 bg-black/60 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FDE100] truncate">{syncStepText}</span>
              <span className="text-white font-bold">{syncProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-400 to-[#FDE100] h-full transition-all duration-150"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="relative z-10 mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 font-mono border-t border-slate-800/80 pt-4">
          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#FDE100]" />
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Gecachte Artikel</span>
              <span className="font-bold text-white text-sm">{filteredArticles.length} BVB-News</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Zeitraum</span>
              <span className="font-bold text-white text-sm">60 Tage (2 Monate)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400" />
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Deduplizierung</span>
              <span className="font-bold text-emerald-400 text-sm">Aktiv (Keine Duplikate)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Entwickler</span>
              <span className="font-bold text-[#FDE100] text-sm">w33derlich & Dobby</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Multi-Filter Control Panel */}
      <div className="p-4 rounded-xl bg-[#111318] border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="60-Tage BVB-Archiv durchsuchen (z. B. Guirassy, Karetsas, Schlotterbeck)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#FDE100]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {[
              { days: 1, label: 'Heute' },
              { days: 7, label: '7 Tage' },
              { days: 14, label: '14 Tage' },
              { days: 30, label: '30 Tage' },
              { days: 60, label: '60 Tage' },
            ].map((t) => (
              <button
                key={t.days}
                onClick={() => setSelectedDays(t.days)}
                className={`px-2.5 py-1 rounded font-mono transition-all cursor-pointer ${
                  selectedDays === t.days
                    ? 'bg-[#FDE100] text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'all', label: 'Alle' },
              { id: 'BVB.de', label: 'BVB.de' },
              { id: 'Transfermarkt', label: 'Transfermarkt' },
              { id: 'Kicker', label: 'Kicker' },
              { id: 'Ruhr Nachrichten', label: 'Ruhr Nachrichten' },
              { id: 'BVBWLD.de', label: 'BVBWLD.de' },
              { id: 'Spieltag', label: 'Spieltag' },
              { id: 'Verletzungen', label: 'Verletzungen' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors font-bvb uppercase shrink-0 cursor-pointer ${
                  selectedCat === cat.id
                    ? 'bg-[#FDE100] text-black font-bold shadow-md shadow-[#FDE100]/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article List Feed */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-slate-400 rounded-2xl bg-[#111318] border border-slate-800 space-y-2">
            <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-white">Keine BVB-Meldungen für diesen Filter gefunden.</p>
            <p className="text-xs text-slate-500">
              Versuche den Suchbegriff zurückzusetzen oder klicke auf "Jetzt Aktualisieren".
            </p>
          </div>
        ) : (
          filteredArticles.map((item) => {
            const articleUrl = getDirectArticleUrl(item.title, item.url, item.source);
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#111318] border border-slate-800/90 hover:border-[#FDE100]/50 transition-all space-y-2.5 shadow-lg group"
              >
                {/* Card Meta Bar */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-[#FDE100]" />
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[#FDE100] font-bold text-xs uppercase font-bvb tracking-wider">
                      {item.source}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-xs">
                      {item.category}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(item.publishedAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date(item.publishedAt).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    Uhr
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-[#FDE100] transition-colors font-bvb tracking-wide leading-snug">
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.summary}
                </p>

                {/* Footer Source Button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In lokaler Datenbank gespeichert (2-Monats-Archiv)
                  </span>

                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleOpenLink(e, articleUrl)}
                    className="px-3 py-1 bg-slate-900 hover:bg-[#FDE100] hover:text-black text-slate-300 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 font-bvb uppercase tracking-wider border border-slate-700 hover:border-[#FDE100] cursor-pointer"
                  >
                    <span>Artikel im Standard-Browser öffnen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info Modal */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />
    </div>
  );
};
