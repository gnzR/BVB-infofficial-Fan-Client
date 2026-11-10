import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Users,
  Newspaper,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  Clock,
  Mic,
  Gamepad2,
  BarChart3,
  Vote,
  User,
  Activity,
  Music,
  Info,
} from 'lucide-react';
import { getLiveSquadData } from '../utils/squadStore';
import { PlayerStats, BVB_SQUAD_DATA } from '../data/bvbSquadData';
import { BvbNewsArticle, get60DayBvbArticles, getDirectArticleUrl } from '../utils/bvbArchiveStore';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onJumpToSquadPlayer: (playerName: string) => void;
  onOpenSoundboard: () => void;
  onOpenInfoModal: () => void;
  onOpenPlayerComparison: () => void;
}

interface SearchResultItem {
  id: string;
  type: 'tab' | 'player' | 'news';
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  onSelect: () => void;
  externalUrl?: string;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onJumpToSquadPlayer,
  onOpenSoundboard,
  onOpenInfoModal,
  onOpenPlayerComparison,
}) => {
  const [query, setQuery] = useState<string>('');
  const [squad, setSquad] = useState<PlayerStats[]>(BVB_SQUAD_DATA);
  const [articles, setArticles] = useState<BvbNewsArticle[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'player' | 'news' | 'tab'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setSelectedIndex(0);
    setActiveCategory('all');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    getLiveSquadData()
      .then((res) => {
        if (res.squad && res.squad.length > 0) setSquad(res.squad);
      })
      .catch(() => {});

    get60DayBvbArticles()
      .then((list) => {
        if (Array.isArray(list)) setArticles(list);
      })
      .catch(() => {});
  }, [isOpen]);

  const tabItems: SearchResultItem[] = useMemo(
    () => [
      {
        id: 'tab-ticker',
        type: 'tab',
        title: 'Match-Ticker & Live-Kommentar',
        subtitle: 'Echtzeit-Spielereignisse, Aufstellungen & Live-Statistiken',
        badge: 'TAB',
        badgeColor: 'bg-[#FDE100]/20 text-[#FDE100] border-[#FDE100]/40',
        icon: <Activity className="w-4 h-4 text-[#FDE100]" />,
        onSelect: () => {
          onSelectTab('ticker');
          onClose();
        },
      },
      {
        id: 'tab-matchday',
        type: 'tab',
        title: 'Spielplan & Stadion-Hub (Signal Iduna Park)',
        subtitle: 'Nächste BVB-Pflichtspiele, Stadionwetter, Anreise & Tippspiel',
        badge: 'TAB',
        badgeColor: 'bg-[#FDE100]/20 text-[#FDE100] border-[#FDE100]/40',
        icon: <Calendar className="w-4 h-4 text-[#FDE100]" />,
        onSelect: () => {
          onSelectTab('matchday');
          onClose();
        },
      },
      {
        id: 'tab-bundesliga',
        type: 'tab',
        title: 'Bundesliga Live-Tabelle & Spieltag',
        subtitle: 'Aktuelle Tabellenplätze, Torverhältnis & BVB-Formkurve',
        badge: 'TAB',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: <Flame className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          onSelectTab('bundesliga');
          onClose();
        },
      },
      {
        id: 'tab-ucl',
        type: 'tab',
        title: 'Königsklasse (Champions League) & DFB-Pokal',
        subtitle: 'UEFA Ligaphase, K.o.-Runde, Pokal & Transfer-Zentrale',
        badge: 'TAB',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        icon: <Trophy className="w-4 h-4 text-sky-400" />,
        onSelect: () => {
          onSelectTab('ucl');
          onClose();
        },
      },
      {
        id: 'tab-squad',
        type: 'tab',
        title: 'BVB Profi-Kader & Leistungsdaten',
        subtitle: 'Alle Kaderspieler, Pflichtspieltore, Marktwerte & Verträge',
        badge: 'TAB',
        badgeColor: 'bg-[#FDE100]/20 text-[#FDE100] border-[#FDE100]/40',
        icon: <Users className="w-4 h-4 text-[#FDE100]" />,
        onSelect: () => {
          onSelectTab('squad');
          onClose();
        },
      },
      {
        id: 'tab-news',
        type: 'tab',
        title: '60-Tage BVB-Newsarchiv & Quellen-Filter',
        subtitle: 'BVB.de, Ruhr Nachrichten, Kicker, Transfermarkt & BVBWLD.de',
        badge: 'TAB',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: <Newspaper className="w-4 h-4 text-amber-400" />,
        onSelect: () => {
          onSelectTab('news');
          onClose();
        },
      },
      {
        id: 'tab-timemachine',
        type: 'tab',
        title: 'BVB Zeitmaschine (Historische Meilensteine)',
        subtitle: 'Legendäre Endspiele 1997, 2012, 1966 & Vereinsgeschichte',
        badge: 'TAB',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        onSelect: () => {
          onSelectTab('timemachine');
          onClose();
        },
      },
      {
        id: 'tab-chants',
        type: 'tab',
        title: 'Südtribünen Chant-Studio & Liedtexte',
        subtitle: 'Heja BVB, Leuchte auf mein Stern Borussia & Fangesänge',
        badge: 'TAB',
        badgeColor: 'bg-[#FDE100]/20 text-[#FDE100] border-[#FDE100]/40',
        icon: <Mic className="w-4 h-4 text-[#FDE100]" />,
        onSelect: () => {
          onSelectTab('chants');
          onClose();
        },
      },
      {
        id: 'tab-games',
        type: 'tab',
        title: 'BVB Fan-Spiele & Retro-Arcade',
        subtitle: 'Elfmeterschießen, BVB-Quiz & Taktik-Challenges',
        badge: 'TAB',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          onSelectTab('games');
          onClose();
        },
      },
      {
        id: 'tab-offline',
        type: 'tab',
        title: '30-Tage Offline-Statistik & Datenbank',
        subtitle: 'Lokale SQLite/IndexedDB Auswertung & Form-Metriken',
        badge: 'TAB',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
        onSelect: () => {
          onSelectTab('offline');
          onClose();
        },
      },
      {
        id: 'tab-polls',
        type: 'tab',
        title: 'Spieltags-Umfragen & Fan-Voting',
        subtitle: 'Spieler des Spiels wählen & Community-Stimmungsbild',
        badge: 'TAB',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        icon: <Vote className="w-4 h-4 text-sky-400" />,
        onSelect: () => {
          onSelectTab('polls');
          onClose();
        },
      },
      {
        id: 'tab-profile',
        type: 'tab',
        title: 'Mein BVB-Fanprofil & Einstellungen',
        subtitle: 'Lieblingsspieler, Mitgliedsausweis & Desktop-Präferenz',
        badge: 'TAB',
        badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
        icon: <User className="w-4 h-4 text-slate-300" />,
        onSelect: () => {
          onSelectTab('profile');
          onClose();
        },
      },
      {
        id: 'tool-soundboard',
        type: 'tab',
        title: 'Südtribünen-Soundboard öffnen',
        subtitle: 'Torhymne, Stadion-Atmosphäre & Fangesänge direkt abspielen',
        badge: 'TOOL',
        badgeColor: 'bg-[#FDE100] text-black border-[#FDE100]',
        icon: <Music className="w-4 h-4 text-[#FDE100]" />,
        onSelect: () => {
          onClose();
          onOpenSoundboard();
        },
      },
      {
        id: 'tool-compare',
        type: 'tab',
        title: 'BVB Spieler-Direktvergleich (Head-to-Head)',
        subtitle: 'Zwei BVB-Profis in Toren, Vorlagen & Marktwert vergleichen',
        badge: 'TOOL',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          onClose();
          onOpenPlayerComparison();
        },
      },
      {
        id: 'tool-updater',
        type: 'tab',
        title: 'GitHub Auto-Updater & Programm-Info',
        subtitle: 'Auf neue Version prüfen, Changelog & System-Details',
        badge: 'UPDATER',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        icon: <Info className="w-4 h-4 text-teal-400" />,
        onSelect: () => {
          onClose();
          onOpenInfoModal();
        },
      },
    ],
    [onSelectTab, onClose, onOpenSoundboard, onOpenPlayerComparison, onOpenInfoModal]
  );

  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();

    const playerItems: SearchResultItem[] = squad
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          String(p.number).includes(q) ||
          p.position.toLowerCase().includes(q) ||
          p.subPosition.toLowerCase().includes(q) ||
          p.nationality.toLowerCase().includes(q)
        );
      })
      .slice(0, q ? 12 : 6)
      .map((p) => ({
        id: `player-${p.id}`,
        type: 'player',
        title: `${p.number > 0 ? `#${p.number} ` : ''}${p.name} ${p.flag}`,
        subtitle:
          p.position === 'Trainer'
            ? `${p.subPosition} · Vertrag bis ${p.contractUntil}`
            : `${p.subPosition} · Marktwert ${p.marketValueFormatted} · ${p.matches} Spiele (${p.goals} Tore, ${p.assists} Assists)${
                p.injuryStatus?.isInjured ? ` · ⚠️ ${p.injuryStatus.condition}` : ''
              }`,
        badge: p.position.toUpperCase(),
        badgeColor: p.injuryStatus?.isInjured
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          : 'bg-[#FDE100]/15 text-[#FDE100] border-[#FDE100]/40',
        icon: <Users className="w-4 h-4 text-[#FDE100]" />,
        onSelect: () => {
          onJumpToSquadPlayer(p.name);
          onClose();
        },
      }));

    const matchingTabs = tabItems.filter((t) => {
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q);
    });

    const newsItems: SearchResultItem[] = articles
      .filter((a) => {
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
        );
      })
      .slice(0, q ? 12 : 5)
      .map((a) => {
        const directUrl = getDirectArticleUrl(a.url, a.title, a.source);
        return {
          id: `news-${a.id}`,
          type: 'news',
          title: a.title,
          subtitle: `${a.source} · ${new Date(a.publishedAt).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}`,
          badge: a.category,
          badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
          icon: <Newspaper className="w-4 h-4 text-sky-400" />,
          externalUrl: directUrl,
          onSelect: () => {
            onSelectTab('news');
            onClose();
          },
        };
      });

    if (activeCategory === 'player') return playerItems;
    if (activeCategory === 'news') return newsItems;
    if (activeCategory === 'tab') return matchingTabs;

    if (!q) {
      return [...playerItems.slice(0, 5), ...matchingTabs.slice(0, 6), ...newsItems.slice(0, 4)];
    }

    return [...playerItems, ...matchingTabs, ...newsItems];
  }, [query, squad, articles, tabItems, activeCategory, onJumpToSquadPlayer, onSelectTab, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          results.length > 0 ? (prev - 1 + results.length) % results.length : 0
        );
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        results[selectedIndex].onSelect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-12 sm:pt-20 font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#0e1017] border-2 border-[#FDE100]/50 shadow-[0_0_60px_rgba(253,225,0,0.2)] overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 bg-[#141722] border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FDE100] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spieler (z.B. Guirassy, #10), BVB-News oder App-Bereich suchen..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Schließen (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-4 py-2 bg-[#10121a] border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'Alle Treffer' },
              { id: 'player', label: `👥 BVB-Kader (${squad.length})` },
              { id: 'news', label: `📰 Newsarchiv (${articles.length})` },
              { id: 'tab', label: '🧭 Tabs & Tools' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#FDE100] text-black shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            ↑↓ Navigieren · ↵ Öffnen · ESC Schließen
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Compass className="w-8 h-8 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                Keine Treffer für „{query}“ gefunden
              </div>
              <div className="text-xs text-slate-500">
                Versuche es mit einem Spielernamen (z. B. Kobel, Schlotterbeck, Kovač) oder einer Quelle (Kicker, BVB.de).
              </div>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.onSelect}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FDE100]/15 border border-[#FDE100]/50 shadow-sm'
                      : 'hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">
                          {item.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.externalUrl && (
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            fetch(`/api/open-external?url=${encodeURIComponent(item.externalUrl!)}`, {
                              method: 'POST',
                            }).catch(() => {});
                          } catch {}
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-[#FDE100] text-slate-200 hover:text-black text-[11px] font-bold flex items-center gap-1 transition-colors"
                        title="Originalartikel im Browser öffnen"
                      >
                        <span>Artikel</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-[#FDE100] translate-x-0.5' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hint */}
        <div className="px-4 py-2.5 bg-[#0a0c10] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[#FDE100] font-mono font-bold">
              Strg + K
            </span>
            <span>Jederzeit drücken für BVB-Schnellsuche</span>
          </div>
          <span className="font-mono text-slate-500">{results.length} Ergebnisse</span>
        </div>
      </div>
    </div>
  );
};
