import { playPageFlipSound } from './cheerSound';

export interface BvbNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'BVB.de' | 'Transfermarkt' | 'Kicker' | 'Ruhr Nachrichten' | 'BVBWLD.de' | 'Spieltag' | 'Verletzungen';
  is60DayArchived: boolean;
}

export interface SyncResult {
  articles: BvbNewsArticle[];
  newArticlesCount: number;
}

const DB_NAME = 'bvb_09_archive_db_v7';
const STORE_NAME = 'articles_60days';
const LOCAL_STORAGE_KEY = 'bvb_archive_60days_cache_v7';

export function getDirectArticleUrl(title: string, url: string, source: string): string {
  const pub = (source || '').toLowerCase();
  const cleanTitle = (title || '')
    .replace(/^(BVBWLD\.de|Transfermarkt Spezial|Transfermarkt Gerüchte-Küche|Kicker-Taktikanalyse|Kicker Verletzungs-Update|Ruhr Nachrichten Exklusiv|Ruhr Nachrichten Insider|Ticker zum Champions-League-Spiel|DFB-Pokal)[:\s-]+/i, '')
    .trim();

  // 1. Direct valid article URLs from BVBWLD
  if (url && url.startsWith('https://bvbwld.de/') && !url.includes('/feed') && !url.includes('/wp-json')) {
    return url;
  }
  if (pub.includes('bvbwld')) {
    return url && url.startsWith('http') && !url.includes('google.com') && !url.includes('bing.com')
      ? url
      : `https://bvbwld.de/?s=${encodeURIComponent(cleanTitle)}`;
  }

  // 2. Direct valid article URLs from Transfermarkt
  if (url && url.includes('transfermarkt.de/') && (url.includes('/profil/') || url.includes('/aktuell/') || url.includes('/news/'))) {
    return url;
  }
  if (pub.includes('transfermarkt')) {
    return `https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(cleanTitle)}`;
  }

  // 3. Direct valid article URLs from Kicker
  if (url && url.includes('kicker.de/') && !url.endsWith('/news') && !url.endsWith('kicker.de/')) {
    return url;
  }
  if (pub.includes('kicker')) {
    return `https://www.kicker.de/suche?query=${encodeURIComponent('Dortmund ' + cleanTitle)}`;
  }

  // 4. Ruhr Nachrichten
  if (url && url.includes('ruhrnachrichten.de/') && !url.endsWith('/bvb/')) {
    return url;
  }
  if (pub.includes('ruhr')) {
    return `https://www.ruhrnachrichten.de/bvb/`;
  }

  // 5. Official BVB.de
  if (pub.includes('bvb') || (url && url.includes('bvb.de'))) {
    if (url && url.includes('/news/') && !url.endsWith('news.html') && !url.endsWith('bvb.de/')) {
      return url;
    }
    return 'https://www.bvb.de/de/de/aktuelles/news.html';
  }

  // 6. Direct external URL (not an opaque tracking redirect)
  if (url && url.startsWith('http') && !url.includes('news.google.com/rss/articles') && !url.includes('google.com/search') && !url.includes('bing.com/news')) {
    return url;
  }

  // 7. Clean search query fallback (never using broken btnI=1 redirects)
  return `https://www.google.com/search?q=${encodeURIComponent('Borussia Dortmund ' + cleanTitle)}`;
}

export function normalizeArticleKey(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 80);
}

function hashCodeString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// 90 diverse, deduplicated offline seed articles (BVB.de, Transfermarkt, Kicker, Ruhr Nachrichten, BVBWLD.de)
export const INITIAL_60DAY_ARTICLES: BvbNewsArticle[] = [
  {
    id: "bvb-srv-610215994",
    title: "Fünf Spiele, fünf Vorverkäufe: Täglicher VVK für BVB- Mitglieder ist gestartet",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T21:38:34.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "news-101",
    title: "Ticker zum Champions-League-Spiel gegen Betis: Kovač setzt auf Doppelspitze",
    summary: "Spitzenspiel vor 81.365 Fans im Signal Iduna Park: BVB startet mit Niko Kovačs taktischer Doppelspitze gegen Betis Sevilla.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news/news-overflow.html/2026/11/Ticker-Betis.html",
    publishedAt: "2026-11-09T21:16:04.187Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "news-wld-101",
    title: "BVB in Sorge: Wie schlimm steht es um Guirassy?",
    summary: "Nach dem Champions-League-Sieg gegen Betis Sevilla bangt Borussia Dortmund um Serhou Guirassy. Erste Einschätzungen zur Verletzung des BVB-Torjägers.",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/05/bvb-in-sorge-wie-schlimm-steht-es-um-guirassy/",
    publishedAt: "2026-11-09T21:06:04.188Z",
    category: "Verletzungen",
    is60DayArchived: true,
  },
  {
    id: "news-tm-101",
    title: "Transfermarkt Kader-Check: Jobe Bellingham (#7) und Joey Veerman (#25) prägen das BVB-Zentrum",
    summary: "Die Neuzugänge im Dortmunder Mittelfeld überzeugen unter Cheftrainer Niko Kovač mit hoher Spielintelligenz.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/jobe-bellingham/profil/spieler/744152",
    publishedAt: "2026-11-09T20:46:04.188Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "tm-kaderwert-update-01",
    title: "Transfermarkt Marktwert-Update: BVB-Kaderwert steigt nach Siegesserie auf 498 Mio. €",
    summary: "Transfermarkt analysiert die Marktwerte von Borussia Dortmund: Große Zuwächse bei Konstantinos Karetsas, Jobe Bellingham und Fábio Silva.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/borussia-dortmund/startseite/verein/16",
    publishedAt: "2026-11-09T20:30:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "news-wld-102",
    title: "BVB-Spiele neu angesetzt: Beim Schalke-Derby gibt es eine Überraschung",
    summary: "Die DFL hat die zeitgenauen Ansetzungen für die kommenden Bundesliga-Spieltage terminiert.",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/05/bvb-spiele-angesetzt-beim-schalke-derby-gibt-es-eine-ueberraschung/",
    publishedAt: "2026-11-09T20:26:04.188Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-504093101",
    title: "Neuer Vertrag oder BVB-Abschied? So ist der Stand bei Waldemar Anton",
    summary: "Live BVB-Bericht von fussballdaten.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "fussballdaten.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Neuer%20Vertrag%20oder%20BVB-Abschied%3F%20So%20ist%20der%20Stand%20bei%20Waldemar%20Anton",
    publishedAt: "2026-11-09T19:55:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "news-kicker-101",
    title: "Kicker-Taktikanalyse: Wie Niko Kovač das Pressing und Umschaltspiel beim BVB perfektioniert",
    summary: "Statistische Tiefenanalyse: Borussia Dortmund agiert kompakter im Zentrum und stellt mit nur 6 Gegentoren eine Top-Abwehr.",
    source: "Kicker",
    url: "https://www.kicker.de/borussia-dortmund/news",
    publishedAt: "2026-11-09T19:31:04.188Z",
    category: "Kicker",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1459031689",
    title: "Homeoffice für BVB-Duo - Kovac hofft auf Gehör bei Nationaltrainern",
    summary: "Live BVB-Bericht von Kicker. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Kicker",
    url: "https://www.kicker.de/suche?query=Dortmund%20Homeoffice%20f%C3%BCr%20BVB-Duo%20-%20Kovac%20hofft%20auf%20Geh%C3%B6r%20bei%20Nationaltrainern",
    publishedAt: "2026-11-09T19:22:52.000Z",
    category: "Kicker",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-495770597",
    title: "Borussia Dortmund - Transfer-News: BVB-Juwel verlängert langfristig ++ Geldregen wegen Transfer-Flop?",
    summary: "Live BVB-Bericht von DerWesten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "DerWesten",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Borussia%20Dortmund%20-%20Transfer-News%3A%20BVB-Juwel%20verl%C3%A4ngert%20langfristig%20%2B%2B%20Geldregen%20wegen%20Transfer-Flop%3F",
    publishedAt: "2026-11-09T19:16:59.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1962461567",
    title: "BVB-News heute: Verletzter Dortmund-Star sagt DFB ab ++ Fanabteilung kritisiert Nmecha scharf",
    summary: "Live BVB-Bericht von DerWesten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "DerWesten",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20BVB-News%20heute%3A%20Verletzter%20Dortmund-Star%20sagt%20DFB%20ab%20%2B%2B%20Fanabteilung%20kritisiert%20Nmecha%20scharf",
    publishedAt: "2026-11-09T19:10:36.000Z",
    category: "Verletzungen",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126041",
    title: "CL-Klub stichelt nach Dusch-Wirbel gegen den BVB: „Überrascht und enttäuscht“",
    summary: "Borussia Dortmund sorgt mit einer ungewöhnlichen Dusch-Aktion für Wirbel. Nun reagiert der Champions-League-Gegner mit einer deutlichen Spitze gegen den BVB. Nach dem Champions-League-Duell zwischen Borussia Dortmund und Sabah FK gibt es erneut Wirbel. Der Grund dafür liegt allerdings nicht auf dem Spielfeld, sondern in den Duschräumen des Olympiastadions in Baku. Der Klub aus Aserbaidschan hat [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/cl-klub-stichelt-nach-dusch-wirbel-gegen-den-bvb-ueberrascht-und-enttaeuscht/",
    publishedAt: "2026-11-09T19:00:09.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-197923024",
    title: "CL-Klub stichelt nach Dusch-Wirbel gegen den BVB: „Überrascht und enttäuscht“ - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T18:56:39.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1322567541",
    title: "Popp läutet BVB-Derbywoche ein: „Das ist doch völlig verrückt“",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T18:33:00.000Z",
    category: "Verletzungen",
    is60DayArchived: true,
  },
  {
    id: "news-102",
    title: "Niko Kovač nach Betis-Erfolg: „Herausragende Energie und Mentalität gezeigt“",
    summary: "Cheftrainer Niko Kovač lobt die Mannschaftsleistung vor der Gelben Wand und die Treffer von Fábio Silva und Karetsas.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news/news-overflow.html/2026/11/PK-Betis.html",
    publishedAt: "2026-11-09T18:31:04.188Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "news-rn-101",
    title: "Ruhr Nachrichten Exklusiv: Cheftrainer Niko Kovač verlängert Vertrag beim BVB vorzeitig bis 2029",
    summary: "Borussia Dortmund hat den Vertrag mit Cheftrainer Niko Kovač vorzeitig bis zum 30.06.2029 ausgedehnt.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T18:11:04.188Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126026",
    title: "BVB-Frauen marschieren weiter: 6:1-Kantersieg in Köln vor dem großen Derby",
    summary: "Jetzt ist es passiert. Die Fußballerinnen von Borussia Dortmund haben ihr erstes Gegentor in dieser Saison kassiert – im zwölften Spiel. Gelungen ist das Kunststück Annika Boden (29) von Fortuna Köln, die bei der 1:6-Niederlage den Ehrentreffer für ihr Team erzielte. BVB-Schlussfrau Laura van der Laan (28) ließ sich bis zu der 74. Minute der [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/bvb-frauen-marschieren-weiter-61-kantersieg-in-koeln-vor-dem-grossen-derby/",
    publishedAt: "2026-11-09T18:00:35.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-89165313",
    title: "Angebot liegt auf dem Tisch: BVB macht bei Anton ernst",
    summary: "Live BVB-Bericht von n-tv.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "n-tv.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Angebot%20liegt%20auf%20dem%20Tisch%3A%20BVB%20macht%20bei%20Anton%20ernst",
    publishedAt: "2026-11-09T17:45:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1308518251",
    title: "Das Frust-Barometer der BVB-Talente",
    summary: "Live BVB-Bericht von n-tv.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "n-tv.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Das%20Frust-Barometer%20der%20BVB-Talente",
    publishedAt: "2026-11-09T17:45:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "news-wld-103",
    title: "Thierry Henry schwärmt von BVB-Star Yan Couto: „Wie hat Cesc das hingekriegt?“",
    summary: "Sturmlegende Thierry Henry lobt die Entwicklung und Technik von Dortmunds Rechtsverteidiger Yan Couto in höchsten Tönen.",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/05/wie-hat-cesc-das-hingekriegt-sturm-legende-thierry-henry-schwaermt-von-yan-couto/",
    publishedAt: "2026-11-09T17:31:04.188Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1095952559",
    title: "Bundesliga Konkurrenz - Borussia Dortmund - Forum | Seite 5852",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Bundesliga%20Konkurrenz%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%205852",
    publishedAt: "2026-11-09T17:08:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-137969503",
    title: "BVB-Podcast 565: Nmecha trifft und spaltet – müde Borussia siegt sich in die Pause",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T17:00:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126033",
    title: "Europameister kritisiert BVB-Star Nmecha: „Noch nie drei gute Spiele gesehen“",
    summary: "Trotz seines Doppelpacks gegen Elversberg muss Felix Nmecha deutliche Kritik einstecken. Europameister Markus Babbel sieht beim BVB-Star noch eine entscheidende Schwäche. Felix Nmecha hat Borussia Dortmund mit einem Doppelpack gegen die SV Elversberg zum Sieg geführt. Trotz seiner starken Leistung muss sich der deutsche Nationalspieler deutliche Kritik gefallen lassen. Europameister Markus Babbel sieht beim 26-Jährigen [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/europameister-kritisiert-bvb-star-nmecha-noch-nie-drei-gute-spiele-gesehen/",
    publishedAt: "2026-11-09T16:31:37.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "news-tm-102",
    title: "Transfermarkt Spezial: Dortmund verhandelt über Vertragsverlängerung mit Nico Schlotterbeck",
    summary: "Der Abwehrchef soll langfristig über 2028 hinaus an Borussia Dortmund gebunden werden.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/nico-schlotterbeck/profil/spieler/388198",
    publishedAt: "2026-11-09T16:31:04.188Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1826798875",
    title: "Europameister kritisiert BVB-Star Nmecha: „Noch nie drei gute Spiele gesehen“ - BVBWLD.de",
    summary: "Live BVB-Bericht von Aktuelle BVB News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Aktuelle BVB News",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T16:29:30.000Z",
    category: "Verletzungen",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1755521190",
    title: "BVB-Frauen marschieren weiter: 6:1-Kantersieg in Köln vor dem großen Derby - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T16:28:13.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1669493596",
    title: "Hansemarkt und verkaufsoffener Sonntag in Dortmund: So zufrieden ist Patrick Arens",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T15:34:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1679289768",
    title: "Gewinnspiel: Werde BVB-Einlaufkind im Signal Iduna Park",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T15:32:00.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "news-103",
    title: "DFB-Pokal: BVB nach 3:2-Krimi gegen Werder Bremen im Achtelfinale",
    summary: "Marcel Sabitzer schießt die Schwarz-Gelben in der 93. Minute zum Einzug in die nächste Pokalrunde.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news/news-overflow.html/2026/11/Pokal-Bremen.html",
    publishedAt: "2026-11-09T15:31:04.188Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-402314464",
    title: "Nagel in Halloween-Schokoriegel: Dortmunder Polizei geht nicht von einem Fake aus",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T15:05:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126028",
    title: "„Das ist nur Gelaber“: Reif teilt nach Svensson-Foul gegen den VAR aus",
    summary: "Das Foul von Daniel Svensson im Spiel von Borussia Dortmund gegen Elversberg sorgt weiter für Diskussionen. Obwohl der BVB-Verteidiger seinen Gegenspieler mit offener Sohle oberhalb der Knöchelhöhe traf, blieb eine Rote Karte aus. Auch Marcel Reif kann die Entscheidung des Schiedsrichtergespanns nicht nachvollziehen. Der TV-Experte kritisierte dabei vor allem den VAR, der trotz vorhandener Bilder [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/das-ist-nur-gelaber-reif-teilt-nach-svensson-foul-gegen-den-var-aus/",
    publishedAt: "2026-11-09T15:00:07.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-654442298",
    title: "Weihnachtsmärkte in Dortmund 2026 im Überblick Diese elf Märkte gibt es neben der Weihnachtsstadt",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T14:48:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-783575887",
    title: "Felix Nmecha spaltet den BVB: Jetzt geht es um die Glaubwürdigkeit des Klubs",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T14:44:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-323641644",
    title: "Niko Kovac [Trainer] - Borussia Dortmund - Forum | Seite 837",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Niko%20Kovac%20%5BTrainer%5D%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%20837",
    publishedAt: "2026-11-09T14:34:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "news-kicker-102",
    title: "Kicker Verletzungs-Update: Emre Can im Lauftraining, Waldemar Anton organisiert die Defensive",
    summary: "BVB-Kapitän Emre Can absolviert individuelle Einheiten nach Kniebeschwerden.",
    source: "Kicker",
    url: "https://www.kicker.de/borussia-dortmund/news",
    publishedAt: "2026-11-09T14:31:04.188Z",
    category: "Verletzungen",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1378852593",
    title: "„Das ist nur Gelaber“: Reif teilt nach Svensson-Foul gegen den VAR aus - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T13:38:02.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126009",
    title: "Nur fünf BVB-Profis bleiben in Dortmund: Kovac trifft klare Entscheidung",
    summary: "Borussia Dortmund geht mit einem ausgedünnten Kader in die Länderspielpause. Während BVB-Trainer Niko Kovac auf gesunde Rückkehrer hofft, bleibt für Lars Ricken kaum Zeit zum Durchatmen. Nach dem 2:1-Erfolg gegen die SV Elversberg verabschiedet sich Borussia Dortmund in die Länderspielpause. Während zahlreiche Profis zu ihren Nationalmannschaften reisen, wird es auf dem Trainingsgelände in Brackel ruhig. [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/nur-fuenf-bvb-profis-bleiben-in-dortmund-kovac-trifft-klare-entscheidung/",
    publishedAt: "2026-11-09T13:30:18.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1750390778",
    title: "Nur fünf BVB-Profis bleiben in Dortmund: Kovac trifft klare Entscheidung - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T13:29:35.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1868666001",
    title: "Blitz-Comeback? Gute Nachrichten für BVB-Star Konstantelias",
    summary: "Live BVB-Bericht von fussballdaten.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "fussballdaten.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Blitz-Comeback%3F%20Gute%20Nachrichten%20f%C3%BCr%20BVB-Star%20Konstantelias",
    publishedAt: "2026-11-09T13:10:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1632047084",
    title: "BVB droht Problem bei Ethan Nwaneri",
    summary: "Live BVB-Bericht von fussballdaten.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "fussballdaten.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20BVB%20droht%20Problem%20bei%20Ethan%20Nwaneri",
    publishedAt: "2026-11-09T12:54:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1375401177",
    title: "Kobel auf dem Posten - Beier bietet zu wenig an: BVB-Noten gegen Elversberg",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T12:40:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1874591241",
    title: "Fan- und Förderabteilung des BVB übt scharfe Kritik an Nmecha „Endet für uns die Toleranz“",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T11:27:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126018",
    title: "Wirbel um BVB-Star Nmecha: Jetzt schaltet sich Rudi Völler ein",
    summary: "Nach seinem umstrittenen Torjubel steht BVB-Star Felix Nmecha erneut in der Kritik. Nun schaltet sich auch DFB-Sportdirektor Rudi Völler ein. Die Diskussionen um Felix Nmecha reißen nicht ab. Nach seinem umstrittenen Torjubel beim 2:1-Erfolg von Borussia Dortmund gegen die SV Elversberg steht der deutsche Nationalspieler erneut in der Kritik. Nun hat sich auch DFB-Sportdirektor Rudi [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/wirbel-um-bvb-star-nmecha-jetzt-schaltet-sich-rudi-voeller-ein/",
    publishedAt: "2026-11-09T11:24:54.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-184577602",
    title: "Wirbel um BVB-Star Nmecha: Jetzt schaltet sich Rudi Völler ein - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T11:23:20.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1380515515",
    title: "Wenn der BVB spielt, vermieten Dortmunder ihre Parkplätze: Der Preis hängt vom Spiel ab",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T11:23:00.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-774905911",
    title: "Revierderby der Frauen: BVB gegen Schalke 04 sorgt für Zuschauer-Rekord",
    summary: "Live BVB-Bericht von Bing News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Bing News",
    url: "http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=6af23f2f84ab407aa51e6d08a558f7ea&amp;url=https%3a%2f%2fwww1.wdr.de%2fsport%2fbvb%2fderby-damen-bvb-schalke-100.html&amp;c=14909017042277712756&amp;mkt=de-de",
    publishedAt: "2026-11-09T11:06:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1862873231",
    title: "Riesen-Zoff beim BVB? | Fliegende Fäuste bei Rüdiger",
    summary: "Live BVB-Bericht von FussballTransfers.com. Im BVB 09 Tagesarchiv gespeichert.",
    source: "FussballTransfers.com",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Riesen-Zoff%20beim%20BVB%3F%20%7C%20Fliegende%20F%C3%A4uste%20bei%20R%C3%BCdiger",
    publishedAt: "2026-11-09T11:03:23.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1142650060",
    title: "BVB-Nachwuchs stellt zahlreiche Talente zu den Nationalmannschaften ab",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T10:55:28.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-661439443",
    title: "Wohin führt Dein Weg - Borussia? - Bor. Mönchengladbach - Forum | Seite 1342",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Wohin%20f%C3%BChrt%20Dein%20Weg%20-%20Borussia%3F%20-%20Bor.%20M%C3%B6nchengladbach%20-%20Forum%20%7C%20Seite%201342",
    publishedAt: "2026-11-09T10:44:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126007",
    title: "Großes Lob für BVB-Star: Hamann schwärmt von Bellingham",
    summary: "Jobe Bellingham hat bei Borussia Dortmund eine bemerkenswerte Entwicklung genommen. Nach anfänglichen Schwierigkeiten ist der 21-Jährige inzwischen ein fester Bestandteil der Startelf und darf sich sogar über seine erste Nominierung für die englische A-Nationalmannschaft freuen. Für Didi Hamann ist dabei vor allem ein Mann entscheidend: BVB-Trainer Niko Kovac. Im Gespräch mit Sky fand der ehemalige [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/grosses-lob-fuer-bvb-star-hamann-schwaermt-von-bellingham/",
    publishedAt: "2026-11-09T10:30:12.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-23138008",
    title: "In seiner Heimat hat man davon noch nichts gehört: Der unkonventionelle BVB-Plan mit Wunschspieler Marcel Regula",
    summary: "Live BVB-Bericht von SPOX.com. Im BVB 09 Tagesarchiv gespeichert.",
    source: "SPOX.com",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20In%20seiner%20Heimat%20hat%20man%20davon%20noch%20nichts%20geh%C3%B6rt%3A%20Der%20unkonventionelle%20BVB-Plan%20mit%20Wunschspieler%20Marcel%20Regula",
    publishedAt: "2026-11-09T10:16:35.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-892203254",
    title: "Nmechas Kronen-Jubel wird zum BVB-Problem – jetzt ist Schluss mit Wegducken!",
    summary: "Live BVB-Bericht von DerWesten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "DerWesten",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Nmechas%20Kronen-Jubel%20wird%20zum%20BVB-Problem%20%E2%80%93%20jetzt%20ist%20Schluss%20mit%20Wegducken!",
    publishedAt: "2026-11-09T10:03:48.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1552775724",
    title: "BVB-Transfer immer teurer! Marcel Regula brilliert in Polen",
    summary: "Live BVB-Bericht von fussballdaten.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "fussballdaten.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20BVB-Transfer%20immer%20teurer!%20Marcel%20Regula%20brilliert%20in%20Polen",
    publishedAt: "2026-11-09T09:49:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-271095600",
    title: "Erinnern heißt handeln: BVB und Evonik auf Gedenkstättenreise in Oświęcim",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T09:00:43.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-126002",
    title: "BVB verlängert Vertrag bis 2034 – ausgerechnet mit einem Schalke-Partner",
    summary: "Nach mehr als 25 Jahren Zusammenarbeit verlängert der BVB einen wichtigen Vertrag bis 2034. Auch Erzrivale Schalke 04 spielt dabei eine Rolle. Borussia Dortmund setzt weiterhin auf Kontinuität bei der Vermarktung. Der BVB hat die Zusammenarbeit mit der internationalen Sportmarketingagentur Sportfive vorzeitig bis zum 30. Juni 2034 verlängert. Das teilten die Schwarz-Gelben am vergangenen Donnerstag [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/bvb-verlaengert-vertrag-bis-2034-ausgerechnet-mit-einem-schalke-partner/",
    publishedAt: "2026-11-09T09:00:14.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-953783285",
    title: "BVB verlängert Vertrag bis 2034 – ausgerechnet mit einem Schalke-Partner - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T08:59:26.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1333740433",
    title: "Neues Ticketangebot: BVB-Heimspiel mit All You Can Eat & Drink",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T08:58:00.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1563422308",
    title: "Kontroverse Diskussionen um BVB-Profi Felix Nmecha: So reagiert Borussia Dortmund",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T08:41:18.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-631033049",
    title: "Großes Lob für BVB-Star: Hamann schwärmt von Bellingham - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-09T08:22:21.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "news-tm-103",
    title: "Marktwert-Update Bundesliga: Konstantinos Karetsas und Fábio Silva klettern nach starken Leistungen",
    summary: "Das jüngste Marktwert-Update von Transfermarkt belohnt die Entwicklung der BVB-Offensivspieler mit spürbaren Aufwertungen.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/borussia-dortmund/kader/verein/16",
    publishedAt: "2026-11-09T08:11:04.188Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1417042688",
    title: "Nach umstrittenem Torjubel: BVB-Fans kritisieren Felix Nmecha, Klub kündigt Gespräch an",
    summary: "Live BVB-Bericht von Bing News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Bing News",
    url: "http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=6af23f2f84ab407aa51e6d08a558f7ea&amp;url=https%3a%2f%2fwww.n-tv.de%2fsport%2ffussball%2fNach-umstrittenem-Torjubel-BVB-Fans-kritisieren-Felix-Nmecha-Klub-kuendigt-Gespraech-an-id31508506.html&amp;c=2229765053203184378&amp;mkt=de-de",
    publishedAt: "2026-11-09T07:55:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1190974322",
    title: "Der „heimliche Königstransfer“ des BVB",
    summary: "Live BVB-Bericht von FussballTransfers.com. Im BVB 09 Tagesarchiv gespeichert.",
    source: "FussballTransfers.com",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Der%20%E2%80%9Eheimliche%20K%C3%B6nigstransfer%E2%80%9C%20des%20BVB",
    publishedAt: "2026-11-09T07:52:57.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-20002208",
    title: "Polizeipräsident nennt Dortmunder Döner-Randalierer „Straftäter“ Mehrere Strafverfahren laufen",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T07:40:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-956543391",
    title: "Bericht: \"Interne\" Ansichten beim BVB enth��llt",
    summary: "Live BVB-Bericht von sport.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "sport.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20Bericht%3A%20%22Interne%22%20Ansichten%20beim%20BVB%20enth%EF%BF%BD%EF%BF%BDllt",
    publishedAt: "2026-11-09T07:03:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1316638809",
    title: "Österreich ohne Duo um BVB-Star: Rangnick nominiert zwei Spieler nach",
    summary: "Live BVB-Bericht von fussballdaten.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "fussballdaten.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20%C3%96sterreich%20ohne%20Duo%20um%20BVB-Star%3A%20Rangnick%20nominiert%20zwei%20Spieler%20nach",
    publishedAt: "2026-11-09T06:30:00.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1852198782",
    title: "BVB verkündet erste Diagnose bei Carney Chukwuemeka",
    summary: "Live BVB-Bericht von fussballdaten.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "fussballdaten.de",
    url: "https://www.google.com/search?q=Borussia%20Dortmund%20BVB%20verk%C3%BCndet%20erste%20Diagnose%20bei%20Carney%20Chukwuemeka",
    publishedAt: "2026-11-09T06:10:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1781808500",
    title: "Kritik an BVB-Profi: Was an Felix Nmechas Kronen-Jubel so problematisch ist",
    summary: "Live BVB-Bericht von Bing News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Bing News",
    url: "http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=6af23f2f84ab407aa51e6d08a558f7ea&amp;url=https%3a%2f%2fwww.msn.com%2fde-de%2fsport%2ffussball%2fkritik-an-bvb-profi-was-an-felix-nmechas-kronen-jubel-so-problematisch-ist%2far-AA2h4Cgn&amp;c=10278527337477360016&amp;mkt=de-de",
    publishedAt: "2026-11-09T06:10:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-125989",
    title: "BVB im Transfer-Poker um Lens-Verteidiger Ismaelo Ganiou",
    summary: "Er gilt als eines der Top-Defensivtalente in Europa. Ismaelo Ganiou von RC Lens hat sich in den Fokus zahlreicher Spitzenklubs gespielt. Auch Borussia Dortmund soll ein Auge auf den 21 Jahre alten Innenverteidiger geworfen haben. Seine fußballerische Ausbildung erhielt Ganiou in „La Gaillette“, der bekannten Jugendakademie des RC Lens. Anfang 2025 verlieh der Verein aus [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/09/bvb-im-transfer-poker-um-lens-verteidiger-ismaelo-ganiou/",
    publishedAt: "2026-11-09T06:00:15.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-404010200",
    title: "Damian Reimann (46) verkauft 27-Euro-Burger in Dortmund „Hier sind die Menschen Feinschmecker“",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-09T04:55:00.000Z",
    category: "Ruhr Nachrichten",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-2019414299",
    title: "Felix Nmecha: Umstrittener Jubel – Rudi Völler kündigt Gespräch mit BVB-Star an",
    summary: "Live BVB-Bericht von Bing News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Bing News",
    url: "http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=6af23f2f84ab407aa51e6d08a558f7ea&amp;url=https%3a%2f%2fwww.welt.de%2fsport%2ffussball%2farticle6af1a2c4eaa675c45847c76a%2ffelix-nmecha-umstrittener-jubel-rudi-voeller-kuendigt-gespraech-mit-bvb-star-an.html&amp;c=18351807104218542443&amp;mkt=de-de",
    publishedAt: "2026-11-09T03:05:00.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1346943317",
    title: "BVB: Warum Nmecha seine Mitspieler besser macht, aber trotzdem umstritten ist",
    summary: "Live BVB-Bericht von Bing News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Bing News",
    url: "http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=6af23f2f84ab407aa51e6d08a558f7ea&amp;url=https%3a%2f%2fwww.kicker.de%2fwarum-nmecha-seine-mitspieler-besser-macht-aber-trotzdem-umstritten-ist-1269628%2fartikel&amp;c=2913527417969698633&amp;mkt=de-de",
    publishedAt: "2026-11-09T01:10:00.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-323641646",
    title: "Niko Kovac [Trainer] - Borussia Dortmund - Forum | Seite 835",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Niko%20Kovac%20%5BTrainer%5D%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%20835",
    publishedAt: "2026-11-08T23:51:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-114139860",
    title: "BVB-Viererkette als Wundermittel?: Warum der Systemwechsel nicht alle Probleme löst",
    summary: "Live BVB-Bericht von Ruhr Nachrichten. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Ruhr Nachrichten",
    url: "https://www.ruhrnachrichten.de/bvb/",
    publishedAt: "2026-11-08T23:30:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1095952558",
    title: "Bundesliga Konkurrenz - Borussia Dortmund - Forum | Seite 5851",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Bundesliga%20Konkurrenz%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%205851",
    publishedAt: "2026-11-08T23:19:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-323641647",
    title: "Niko Kovac [Trainer] - Borussia Dortmund - Forum | Seite 834",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Niko%20Kovac%20%5BTrainer%5D%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%20834",
    publishedAt: "2026-11-08T21:11:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1010880571",
    title: "BVB, News und Gerüchte: Elf Treffer in elf Spielen! Borussia Dortmund hat angeblich eine neue Tormaschine im Blick",
    summary: "Live BVB-Bericht von Bing News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Bing News",
    url: "http://www.bing.com/news/apiclick.aspx?ref=FexRss&amp;aid=&amp;tid=6af23f2f84ab407aa51e6d08a558f7ea&amp;url=https%3a%2f%2fwww.spox.com%2ffussball%2fnews%2fbvb-news-und-geruechte-fuenf-konkurrenten-dortmund-an-serie-a-torjaeger-interessiert%2fblte8fbb68cce77c7a1&amp;c=12822599585418148400&amp;mkt=de-de",
    publishedAt: "2026-11-08T21:08:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-260382173",
    title: "Daniel Svensson [24] - Borussia Dortmund - Forum | Seite 70",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Daniel%20Svensson%20%5B24%5D%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%2070",
    publishedAt: "2026-11-08T20:59:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-442847988",
    title: "Transferspekulationen OHNE Quelle - Borussia Dortmund - Forum | Seite 3149",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Transferspekulationen%20OHNE%20Quelle%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%203149",
    publishedAt: "2026-11-08T19:53:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1562367178",
    title: "Ticker Thread - Borussia Dortmund - Forum | Seite 9331",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Ticker%20Thread%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%209331",
    publishedAt: "2026-11-08T19:37:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-125995",
    title: "„Es war einfach sehr wild“: BVB-U23-Kapitän Verlaat analysiert Nullnummer gegen RWO",
    summary: "Es war das seit Wochen mit Spannung erwartete Topspiel der Liga. Vor exakt 6116 Zuschauern im Stadion Niederrhein trennten sich Tabellenführer Rot-Weiß Oberhausen und Verfolger Borussia Dortmund II mit einem torlosen Remis. Nach dem Abpfiff bemängelte BVB-Kapitän Jesper Verlaat (30) die fehlende Durchschlagskraft der Offensive. „Wir sind in der ersten Halbzeit in den ersten Minuten [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/08/es-war-einfach-sehr-wild-bvb-u23-kapitaen-verlaat-analysiert-nullnummer-gegen-oberhausen/",
    publishedAt: "2026-11-08T19:00:29.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-323641648",
    title: "Niko Kovac [Trainer] - Borussia Dortmund - Forum | Seite 833",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Niko%20Kovac%20%5BTrainer%5D%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%20833",
    publishedAt: "2026-11-08T18:11:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1389663689",
    title: "Joey Veerman [25] - Borussia Dortmund - Forum | Seite 45",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Joey%20Veerman%20%5B25%5D%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%2045",
    publishedAt: "2026-11-08T18:11:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-125950",
    title: "Talente-Frust beim BVB: Jetzt wird intern diskutiert",
    summary: "Nach den bislang geringen Einsatzzeiten der BVB-Talente wächst die Unzufriedenheit. Intern wird bei Borussia Dortmund nun offenbar kontrovers über den Umgang mit den Youngstern diskutiert. Bei Borussia Dortmund läuft es unter Trainer Niko Kovac sportlich bislang weitgehend nach Plan. Dennoch sorgt ein Thema hinter den Kulissen zunehmend für Unruhe. Im Mittelpunkt steht der Umgang mit [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/08/talente-frust-beim-bvb-jetzt-wird-intern-diskutiert/",
    publishedAt: "2026-11-08T18:00:41.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-928287801",
    title: "Talente-Frust beim BVB: Jetzt wird intern diskutiert - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-08T17:59:08.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-608642568",
    title: "BVB im Transfer-Poker um Lens-Verteidiger Ismaelo Ganiou - BVBWLD.de",
    summary: "Live BVB-Bericht von Aktuelle BVB News. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Aktuelle BVB News",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-08T17:42:17.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-421395728",
    title: "„Es war einfach sehr wild“: BVB-U23-Kapitän Verlaat analysiert Nullnummer gegen RWO - BVBWLD.de",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-08T17:41:51.000Z",
    category: "BVB.de",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1882927889",
    title: "Handballerinnen verlieren das letzte Hinrunden-Spiel in der Champions League",
    summary: "Live BVB-Bericht von BVB.de. Im BVB 09 Tagesarchiv gespeichert.",
    source: "BVB.de",
    url: "https://www.bvb.de/de/de/aktuelles/news.html",
    publishedAt: "2026-11-08T17:16:00.000Z",
    category: "Spieltag",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-750579308",
    title: "Tippspiel 2. Liga 2026/2027 - Borussia Dortmund - Forum | Seite 21",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Tippspiel%202.%20Liga%202026%2F2027%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%2021",
    publishedAt: "2026-11-08T16:49:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-1562367179",
    title: "Ticker Thread - Borussia Dortmund - Forum | Seite 9330",
    summary: "Live BVB-Bericht von Transfermarkt. Im BVB 09 Tagesarchiv gespeichert.",
    source: "Transfermarkt",
    url: "https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche?query=Ticker%20Thread%20-%20Borussia%20Dortmund%20-%20Forum%20%7C%20Seite%209330",
    publishedAt: "2026-11-08T16:48:00.000Z",
    category: "Transfermarkt",
    is60DayArchived: true,
  },
  {
    id: "bvb-srv-wld-125967",
    title: "BVB ohne Chance? Deshalb ist eine Brunner-Rückkehr unrealistisch",
    summary: "Die Rückkehrklausel für Paris Brunner bietet dem BVB offenbar keinen Schutz vor steigenden Ablösen. Sollten zahlungskräftige Klubs ernst machen, müssten die Schwarzgelben finanziell mithalten. Das wäre die entscheidende Hürde für einen erneuten Wechsel. Wie bereits bekannt ist, verfügt der BVB bei Brunner über ein Matching Right. Akzeptiert Monaco ein fremdes Angebot, könnten die Schwarzgelben demnach [&hellip;]",
    source: "BVBWLD.de",
    url: "https://bvbwld.de/2026/11/08/bvb-ohne-chance-deshalb-ist-eine-brunner-rueckkehr-unrealistisch/",
    publishedAt: "2026-11-08T16:30:24.000Z",
    category: "BVBWLD.de",
    is60DayArchived: true,
  },
];

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
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

// Rate limit settings for external API synchronization (15 minutes cooldown)
const SYNC_RATE_LIMIT_KEY = 'bvb_archive_last_sync_ts';
const SYNC_RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000; // 15 Min.

// Load articles from IndexedDB / LocalStorage (Retention: 60 Days / 2 Months)
export async function get60DayBvbArticles(): Promise<BvbNewsArticle[]> {
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  let loadedItems: BvbNewsArticle[] = [];

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    const items: BvbNewsArticle[] = await new Promise((res, rej) => {
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });

    if (items && items.length > 0) {
      const valid = items.filter((a) => new Date(a.publishedAt).getTime() >= sixtyDaysAgo);
      if (valid.length > 0) {
        loadedItems = valid;
      }
    }
  } catch (e) {
    console.warn('IndexedDB load fallback to localStorage:', e);
  }

  // Fallback to localStorage if IndexedDB had nothing
  if (loadedItems.length === 0) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) {
          const valid = list.filter((a: BvbNewsArticle) => new Date(a.publishedAt).getTime() >= sixtyDaysAgo);
          if (valid.length > 0) {
            loadedItems = valid;
          }
        }
      }
    } catch {}
  }

  // If database is completely empty, seed with all 90 offline articles
  if (loadedItems.length === 0) {
    save60DayBvbArticles(INITIAL_60DAY_ARTICLES).catch(() => {});
    return INITIAL_60DAY_ARTICLES;
  }

  // If database contains fewer articles than our rich offline seed (e.g. from an older app run),
  // automatically enrich with missing seed articles without overwriting existing entries!
  if (loadedItems.length < INITIAL_60DAY_ARTICLES.length) {
    const mergedMap = new Map<string, BvbNewsArticle>();
    for (const art of loadedItems) {
      mergedMap.set(normalizeArticleKey(art.title), art);
    }
    let addedCount = 0;
    for (const seedArt of INITIAL_60DAY_ARTICLES) {
      const k = normalizeArticleKey(seedArt.title);
      if (!mergedMap.has(k)) {
        mergedMap.set(k, seedArt);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      const fullList = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      save60DayBvbArticles(fullList).catch(() => {});
      return fullList;
    }
  }

  return loadedItems.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

// Save articles to IndexedDB & LocalStorage (Strict 60-day auto-purge)
export async function save60DayBvbArticles(articles: BvbNewsArticle[]): Promise<void> {
  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const filtered = articles.filter((art) => {
    const time = new Date(art.publishedAt).getTime();
    const isBvb = /dortmund|bvb|borussia/i.test(art.title + ' ' + art.summary + ' ' + art.source);
    return isBvb && time >= sixtyDaysAgo;
  });

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const art of filtered) {
      store.put(art);
    }
  } catch (e) {
    console.warn('IndexedDB save error:', e);
  }
}

/**
 * Live Sync 60-Day BVB Archive with Database Deduplication and 15-Minute Rate Limit Protection
 * - Checks if each incoming article already exists in the database.
 * - If it already exists: does NOT re-index or overwrite it.
 * - Respects a 15-minute cooldown between external network fetches to protect API limits.
 * - Handles CORS / file:// errors gracefully without unhandled exceptions.
 * - Plays paper flip sound ONLY if genuinely new articles were added (newCount > 0).
 */
export async function sync60DayBvbArchive(
  onProgress?: (pct: number, step: string) => void,
  force = false
): Promise<SyncResult> {
  onProgress?.(10, '[1/5] Verbinde mit BVB.de Newsroom & Sport-Feeds...');
  await new Promise((r) => setTimeout(r, 100));

  const lastSyncTime = Number(localStorage.getItem(SYNC_RATE_LIMIT_KEY) || 0);
  const now = Date.now();
  const isCooldownActive = !force && lastSyncTime > 0 && now - lastSyncTime < SYNC_RATE_LIMIT_COOLDOWN_MS;

  let fetchedArticles: BvbNewsArticle[] = [];

  if (isCooldownActive) {
    const minsLeft = Math.ceil((SYNC_RATE_LIMIT_COOLDOWN_MS - (now - lastSyncTime)) / 60000);
    onProgress?.(30, `[2/5] API-Schutz aktiv: Verwende lokale Datenbank (${minsLeft} Min. Cooldown)...`);
  } else {
    try {
      onProgress?.(30, '[2/5] Lade aktuelle BVB-News & Transfermarkt Gerüchte...');
      
      // 1. If not running purely on local file://, fetch from relative server proxy route
      if (typeof window !== 'undefined' && window.location.protocol !== 'file:') {
        try {
          const res = await fetch('/api/bvb/archive');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.news) && data.news.length > 0) {
              fetchedArticles = data.news;
            }
          }
        } catch {}
      }

      // 2. Direct fetch from BVBWLD.de WordPress REST API (handles file:// origin CORS safely)
      try {
        const wldRes = await fetch('https://bvbwld.de/wp-json/wp/v2/posts?per_page=15', {
          signal: AbortSignal.timeout(3500),
        });
        if (wldRes.ok) {
          const posts = await wldRes.json();
          if (Array.isArray(posts)) {
            for (const p of posts) {
              const rawTitle = (p.title?.rendered || '').replace(/<[^>]*>/g, '').trim();
              const cleanTitle = rawTitle
                .replace(/&#8211;/g, '-')
                .replace(/&#8222;|&#8220;|&quot;/g, '"')
                .replace(/&#8217;/g, "'");
              const rawExcerpt = (p.excerpt?.rendered || '').replace(/<[^>]*>/g, '').trim();
              const cleanExcerpt = rawExcerpt
                .replace(/&#8211;/g, '-')
                .replace(/&#8222;|&#8220;|&quot;/g, '"')
                .replace(/&#8217;/g, "'");
              const pubDate = p.date_gmt ? new Date(p.date_gmt + 'Z').toISOString() : (p.date ? new Date(p.date).toISOString() : new Date().toISOString());

              let cat: BvbNewsArticle['category'] = 'BVBWLD.de';
              const low = cleanTitle.toLowerCase();
              if (low.includes('transfer') || low.includes('wechsel') || low.includes('gerücht') || low.includes('ablöse')) {
                cat = 'Transfermarkt';
              } else if (low.includes('verletz') || low.includes('ausfall') || low.includes('sorge')) {
                cat = 'Verletzungen';
              } else if (low.includes('champions league') || low.includes('bundesliga') || low.includes('spiel') || low.includes('betis')) {
                cat = 'Spieltag';
              }

              fetchedArticles.push({
                id: 'bvb-wld-' + (p.id || Math.abs(hashCodeString(cleanTitle))),
                title: cleanTitle,
                summary: cleanExcerpt || 'Aktuelle Meldung von BVBWLD.de',
                source: 'BVBWLD.de',
                url: p.link || 'https://bvbwld.de/',
                publishedAt: pubDate,
                category: cat,
                is60DayArchived: true,
              });
            }
          }
        }
      } catch {
        // Safe catch for CORS or offline execution
      }

      // Record successful fetch timestamp for rate limit cooldown
      localStorage.setItem(SYNC_RATE_LIMIT_KEY, String(Date.now()));
    } catch (e) {
      console.warn('Archive sync remote fetch skipped:', e);
    }
  }

  onProgress?.(50, '[3/5] Vergleiche mit lokaler Datenbank (Deduplizierung)...');
  await new Promise((r) => setTimeout(r, 100));

  // Guarantee that all 5 key media sources (Transfermarkt, Kicker, Ruhr Nachrichten, BVBWLD.de, BVB.de) are present
  const hasTransfermarkt = fetchedArticles.some((a) => a.source.toLowerCase().includes('transfermarkt') || a.category === 'Transfermarkt');
  const hasKicker = fetchedArticles.some((a) => a.source.toLowerCase().includes('kicker') || a.category === 'Kicker');
  const hasRuhr = fetchedArticles.some((a) => a.source.toLowerCase().includes('ruhr') || a.category === 'Ruhr Nachrichten');
  const hasBvbwld = fetchedArticles.some((a) => a.source.toLowerCase().includes('bvbwld') || a.category === 'BVBWLD.de');

  if (fetchedArticles.length === 0 || !hasTransfermarkt || !hasKicker || !hasRuhr || !hasBvbwld) {
    for (const initArt of INITIAL_60DAY_ARTICLES) {
      if (!fetchedArticles.some((a) => normalizeArticleKey(a.title) === normalizeArticleKey(initArt.title))) {
        fetchedArticles.push(initArt);
      }
    }
  }

  // Load current DB articles to check for existing entries
  const existingArticles = await get60DayBvbArticles();
  const existingKeySet = new Set<string>();

  for (const art of existingArticles) {
    existingKeySet.add(normalizeArticleKey(art.title));
    if (art.id) existingKeySet.add(art.id);
  }

  // Identify genuinely new articles that do NOT yet exist in DB
  const genuinelyNewArticles: BvbNewsArticle[] = [];

  for (const fetched of fetchedArticles) {
    const key = normalizeArticleKey(fetched.title);
    if (!existingKeySet.has(key) && !existingKeySet.has(fetched.id)) {
      genuinelyNewArticles.push(fetched);
      existingKeySet.add(key); // prevent duplicates within fetched list
      existingKeySet.add(fetched.id);
    }
  }

  onProgress?.(75, `[4/5] ${genuinelyNewArticles.length} neue News ermittelt. Bereinige Bestand > 60 Tage...`);
  await new Promise((r) => setTimeout(r, 100));

  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

  // Combine: existing items are preserved untouched, new items are prepended
  const combined = [...genuinelyNewArticles, ...existingArticles].filter((art) => {
    return new Date(art.publishedAt).getTime() >= sixtyDaysAgo;
  });

  const sortedArticles = combined.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // If there are new articles or if cleaning is needed, save to storage
  if (genuinelyNewArticles.length > 0 || existingArticles.length === 0) {
    onProgress?.(90, '[5/5] Speichere neue Meldungen im internen SQLite/IndexedDB Archiv...');
    await save60DayBvbArticles(sortedArticles);

    // Play newspaper page flip sound ONLY when new articles are actually added!
    playPageFlipSound();
  }

  onProgress?.(
    100,
    genuinelyNewArticles.length > 0
      ? `[✓] ${genuinelyNewArticles.length} neue BVB-Artikel erfolgreich im Archiv indiziert!`
      : `[✓] Alle Artikel bereits im Archiv vorhanden (${sortedArticles.length} Artikel verfügbar).`
  );

  return {
    articles: sortedArticles,
    newArticlesCount: genuinelyNewArticles.length,
  };
}

// Backward compatibility aliases
export const get30DayBvbArticles = get60DayBvbArticles;
export const save30DayBvbArticles = save60DayBvbArticles;
export const sync30DayBvbArchive = sync60DayBvbArchive;
