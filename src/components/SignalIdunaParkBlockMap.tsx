import React, { useState, useMemo } from 'react';
import { Search, MapPin, Users, Compass, Info, ShieldCheck, Sparkles } from 'lucide-react';

export type StandGroupId =
  | 'sued'
  | 'west'
  | 'ost'
  | 'nord'
  | 'ecke_sw'
  | 'ecke_nw'
  | 'ecke_so'
  | 'ecke_no'
  | 'gaeste';

export interface BlockMetadata {
  block: string;
  standId: StandGroupId;
  standName: string;
  tier: 'Spielfeldrand / Barrierefrei' | 'Unterrang' | 'Mittelrang' | 'Oberrang';
  category:
    | 'Stehplatz Heim (Gelbe Wand)'
    | 'Stehplatz / Fanblock'
    | 'Sitzplatz Kat. 1–2 (Zentral)'
    | 'Sitzplatz Kat. 3–4'
    | 'Sitzplatz Ecke / Kurve'
    | 'REWE Familienblock'
    | 'Gästebereich (Steh-/Sitzplatz)'
    | 'VIP / Presse / Logen'
    | 'Barrierefrei (Rollstuhl / Seh- & Gehbehindert)';
  gate: string;
  viewQuality: string;
  catering: string;
  insiderTip: string;
}

const STAND_OVERVIEW: Record<
  StandGroupId,
  {
    name: string;
    shortLabel: string;
    blocksSummary: string;
    capacityInfo: string;
    gate: string;
    catering: string;
    insiderTip: string;
  }
> = {
  sued: {
    name: 'Südtribüne („Die Gelbe Wand“)',
    shortLabel: 'Süd (Links)',
    blocksSummary: 'Unterrang: 10–15 · Oberrang: 80–84 (alles Stehplätze)',
    capacityInfo: '24.454 Stehplätze (größte Stehplatztribüne Europas)',
    gate: 'Eingang Süd (Strobelallee)',
    catering: 'Brinkhoff’s Bierstände, Stadion-Bratwurst im Umlauf unter Block 11–14 (Stadiondeckel / Bezahlkarte)',
    insiderTip:
      'In der Bundesliga sind sowohl Unterrang (10–15) als auch Oberrang (80–84) reine Stehplätze. Spätestens 45 Min. vor Anpfiff im Block sein!',
  },
  west: {
    name: 'Westtribüne (Haupttribüne)',
    shortLabel: 'West (Oben)',
    blocksSummary: 'Rand: 1–4 (♿) · Unterrang: 20–27 · Oberrang: 30–34',
    capacityInfo: 'Haupttribüne, Trainerbänke, VIP-Logen & Presse',
    gate: 'Eingang West / Nord-West (Strobelallee)',
    catering: 'Stammtisch-Kioske West, Brezel- & Grillstationen auf Ebene 2 & 3',
    insiderTip:
      'Perfekte Taktik-Perspektive auf Höhe der Mittellinie (Blöcke 26/27 & 32). Block 34 verfügt über Induktionsschleifen für Hörgeschädigte (👂).',
  },
  ost: {
    name: 'Osttribüne (Gegengerade)',
    shortLabel: 'Ost (Unten)',
    blocksSummary: 'Rand: 5–7 (♿/👁️) · Unterrang: 40–49 · Oberrang: 50–54',
    capacityInfo: 'Gegengerade mit direktem Blick auf Spielerbänke & Gelbe Wand',
    gate: 'Eingang Ost (Maurice-Banach-Platz)',
    catering: 'Große Grill- & Getränkemeile Ost, BVB-FanWelt direkt vor dem Vorplatz',
    insiderTip:
      'Aus den Blöcken 40, 44, 47 und 50 hast du den wohl spektakulärsten Seitenblick direkt in die „Gelbe Wand“. Block 5 bietet Blindenreportage (👁️).',
  },
  nord: {
    name: 'Nordtribüne (Heim & Familienblock)',
    shortLabel: 'Nord (Rechts)',
    blocksSummary: 'Rand: 8–9 · Unterrang: 60–63 · Mittelrang: 70–74 · Oberrang: 75–78',
    capacityInfo: 'REWE Familienblock (62), Nord-Stehplätze (63) & Gästebereich (60/61/8)',
    gate: 'Eingang Nord (Richtung B1 / Westfalenhallen)',
    catering: 'Familien-Kioske Nord, Popcorn-, Waffel- & Grillstände hinter Block 62/72',
    insiderTip:
      'Frontaler Blick auf die gesamte Südtribüne! Block 62 ist der offizielle REWE-Familienblock, Block 63 ist Stehplatzbereich für BVB-Fans.',
  },
  ecke_sw: {
    name: 'Ecke Süd-West',
    shortLabel: 'Süd-West (Oben Links)',
    blocksSummary: 'Unterrang: 35, 36 · Oberrang: 37, 38, 39',
    capacityInfo: 'Direkter Übergang zwischen Gelber Wand und Westtribüne',
    gate: 'Eingang Süd-West (Strobelallee / Schwimmweg)',
    catering: 'Eck-Kioske Süd-West mit schnellem Durchlauf in der Halbzeit',
    insiderTip:
      'Block 36 und 39 grenzen unmittelbar an die Südtribüne (Block 10/80) – hier bekommst du einen Sitzplatz mit 100 % Südtribünen-Akustik!',
  },
  ecke_nw: {
    name: 'Ecke Nord-West',
    shortLabel: 'Nord-West (Oben Rechts)',
    blocksSummary: 'Unterrang: 64, 65 (Fanblock) · Oberrang: 66, 67, 68',
    capacityInfo: 'Stimmungsvolle Kurve zwischen West- und Nordtribüne',
    gate: 'Eingang Nord-West (Richtung Westfalenhallen)',
    catering: 'Kioske Nord-West im Unter- und Oberrang',
    insiderTip:
      'Die Blöcke 64 und 65 (im Plan blau schraffiert) sind besonders stimmungsvolle BVB-Fanblöcke im Nord-West-Unterrang.',
  },
  ecke_so: {
    name: 'Ecke Süd-Ost',
    shortLabel: 'Süd-Ost (Unten Links)',
    blocksSummary: 'Unterrang: 85, 86 · Oberrang: 87, 88, 89',
    capacityInfo: 'Direkter Übergang zwischen Südtribüne und Osttribüne',
    gate: 'Eingang Süd-Ost (Maurice-Banach-Platz)',
    catering: 'Eck-Stationen Süd-Ost nahe BVB-FanWelt',
    insiderTip:
      'Block 85 und 87 liegen direkt neben Block 15/84 der Gelben Wand – top Sicht auf das Südtor und enorme Lautstärke.',
  },
  ecke_no: {
    name: 'Ecke Nord-Ost (Übergang / Gäste)',
    shortLabel: 'Nord-Ost (Unten Rechts)',
    blocksSummary: 'Unterrang: 55, 56 · Oberrang: 57, 58, 59',
    capacityInfo: 'Verbindungskurve zwischen Osttribüne und Nordtribüne',
    gate: 'Eingang Nord-Ost / Nord',
    catering: 'Kioske Nord-Ost (je nach Gästekontingent getrennt)',
    insiderTip:
      'Je nach Gästekontingent dienen Block 55/56 und Teile von 57–59 als erweiterter Gästesitzplatz- oder Heim-/Pufferbereich.',
  },
  gaeste: {
    name: 'Gästeblock (Nord / Nord-Ost)',
    shortLabel: 'Gäste (Blöcke 8, 60, 61, 55/56)',
    blocksSummary: 'Stehplätze: 8, 60, 61 · Sitzplätze (je nach Kontingent): 55–59, 70/75',
    capacityInfo: 'Ca. 8.000 Plätze für Auswärtsfans im Nordost-Sektor',
    gate: 'Separater Eingang Nord / Gäste (ab S-Bahnhof Signal Iduna Park ausgeschildert)',
    catering: 'Eigene Gästekioske im Nordost-Umlauf (bargeldlos per Karte)',
    insiderTip:
      'Gästefans nutzen bitte ausschließlich den ausgeschilderten Zugang Nord über die Strobelallee / B1 (kein Zutritt in Gästekleidung auf die Südtribüne).',
  },
};

function getBlockDetails(blockId: string): BlockMetadata {
  const b = blockId.trim();

  // Südtribüne (10-15, 80-84)
  if (['10', '11', '12', '13', '14', '15'].includes(b)) {
    return {
      block: b,
      standId: 'sued',
      standName: 'Südtribüne („Gelbe Wand“)',
      tier: 'Unterrang',
      category: 'Stehplatz Heim (Gelbe Wand)',
      gate: 'Eingang Süd (Strobelallee)',
      viewQuality: 'Unmittelbar hinter dem Südtor – mitten im Epizentrum der Gelben Wand!',
      catering: 'Bier- & Bratwurst-Stände im breiten Südtribünen-Umlauf',
      insiderTip: `Block ${b} gehört zum unteren Stehplatzrang der Südtribüne (${b === '12' || b === '13' ? 'zentraler Stimmungs-Kern der Ultras' : 'extrem stimmungsvoller Stehplatzbereich'}).`,
    };
  }
  if (['80', '81', '82', '83', '84'].includes(b)) {
    return {
      block: b,
      standId: 'sued',
      standName: 'Südtribüne („Gelbe Wand“)',
      tier: 'Oberrang',
      category: 'Stehplatz Heim (Gelbe Wand)',
      gate: 'Eingang Süd (Strobelallee · Treppenhäuser Oberrang)',
      viewQuality: 'Steile Draufsicht über das gesamte Stadion direkt unter dem schallverstärkenden Dach.',
      catering: 'Obere Umlauf-Kioske Süd (kürzere Wartezeiten als unten)',
      insiderTip: `Block ${b} ist im Bundesliga-Betrieb ein reiner Stehplatz im Oberrang der Gelben Wand (international bei UEFA-Spielen bestuhlt).`,
    };
  }

  // Westtribüne Spielfeldrand (1-4)
  if (['1', '2', '3', '4'].includes(b)) {
    return {
      block: b,
      standId: 'west',
      standName: 'Westtribüne (Spielfeldrand)',
      tier: 'Spielfeldrand / Barrierefrei',
      category: 'Barrierefrei (Rollstuhl / Seh- & Gehbehindert)',
      gate: 'Barrierefreier Eingang West / Nord-West',
      viewQuality: 'Direkt auf Rasenhöhe an der West-Seitenlinie neben den Trainerbänken.',
      catering: 'Barrierefreier Service & Kioske im West-Erdgeschoss',
      insiderTip:
        b === '3'
          ? 'Block 3 ist der offizielle Rollstuhlfahrer-Bereich (♿) auf der Westseite inkl. Begleitperson.'
          : `Block ${b} ist für gehbehinderte Fans (🚶) ebenerdig ohne Treppen erreichbar.`,
    };
  }

  // Westtribüne Unterrang (20-27)
  if (['20', '21', '22', '23', '24', '25', '26', '27'].includes(b)) {
    const isCenter = b === '26' || b === '27';
    return {
      block: b,
      standId: 'west',
      standName: 'Westtribüne (Haupttribüne)',
      tier: 'Unterrang',
      category: isCenter ? 'VIP / Presse / Logen' : 'Sitzplatz Kat. 1–2 (Zentral)',
      gate: 'Eingang West (Strobelallee)',
      viewQuality: isCenter
        ? 'Exakt auf Höhe der Mittellinie hinter den Trainerbänken (Hauptkamera-Perspektive).'
        : 'Hervorragende Sicht auf das Spielfeld aus dem West-Unterrang.',
      catering: 'West-Umlauf Kioske & Stammtisch-Ebene',
      insiderTip:
        b === '27'
          ? 'Block 27 umfasst den zentralen Ehren-, Presse- und VIP-Bereich der Westtribüne.'
          : `Block ${b} liegt im ${['23', '24', '25'].includes(b) ? 'südlichen (nahe Gelbe Wand)' : 'nördlichen'} Teil des West-Unterrangs.`,
    };
  }

  // Westtribüne Oberrang (30-34)
  if (['30', '31', '32', '33', '34'].includes(b)) {
    return {
      block: b,
      standId: 'west',
      standName: 'Westtribüne (Haupttribüne)',
      tier: 'Oberrang',
      category: b === '32' ? 'Sitzplatz Kat. 1–2 (Zentral)' : 'Sitzplatz Kat. 3–4',
      gate: 'Eingang West (Strobelallee)',
      viewQuality: 'Perfekter Taktik-Überblick von oben über das gesamte Spielfeld.',
      catering: 'Oberrang-Kioske West',
      insiderTip:
        b === '34'
          ? 'Block 34 bietet spezielle Plätze mit Induktionsschleife für hörgeschädigte BVB-Fans (👂).'
          : `Block ${b} im West-Oberrang bietet trockene, überdachte Plätze mit erstklassiger Übersicht.`,
    };
  }

  // Osttribüne Spielfeldrand (5-7)
  if (['5', '6', '7'].includes(b)) {
    return {
      block: b,
      standId: 'ost',
      standName: 'Osttribüne (Spielfeldrand)',
      tier: 'Spielfeldrand / Barrierefrei',
      category: 'Barrierefrei (Rollstuhl / Seh- & Gehbehindert)',
      gate: 'Barrierefreier Eingang Ost (Maurice-Banach-Platz)',
      viewQuality: 'Direkt am Spielfeldrand der Gegengerade.',
      catering: 'Ebenerdige Kioske Osttribüne',
      insiderTip:
        b === '5'
          ? 'Block 5 ist der Bereich für sehbehinderte Fans (👁️) inklusive Live-Blindenreportage über Kopfhörer.'
          : b === '6'
          ? 'Block 6 ist der Rollstuhlfahrer-Bereich (♿) auf der Ostseite.'
          : 'Block 7 ist für gehbehinderte Fans (🚶) ebenerdig erreichbar.',
    };
  }

  // Osttribüne Unterrang (40-49)
  if (['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'].includes(b)) {
    const isCenter = ['41', '42', '45', '48'].includes(b);
    return {
      block: b,
      standId: 'ost',
      standName: 'Osttribüne (Gegengerade)',
      tier: 'Unterrang',
      category: isCenter ? 'Sitzplatz Kat. 1–2 (Zentral)' : 'Sitzplatz Kat. 3–4',
      gate: 'Eingang Ost (Maurice-Banach-Platz)',
      viewQuality: 'Klassische Gegengeraden-Sicht mit Blick auf die Trainerbänke gegenüber.',
      catering: 'Große Grill- & Getränkemeile unter der Osttribüne',
      insiderTip: ['40', '44', '47'].includes(b)
        ? `Block ${b} liegt unmittelbar neben der Südtribüne – Gänsehaut-Blick in die Gelbe Wand garantiert!`
        : `Block ${b} im Ost-Unterrang bietet erstklassige Sicht auf das Spielgeschehen.`,
    };
  }

  // Osttribüne Oberrang (50-54)
  if (['50', '51', '52', '53', '54'].includes(b)) {
    return {
      block: b,
      standId: 'ost',
      standName: 'Osttribüne (Gegengerade)',
      tier: 'Oberrang',
      category: b === '52' ? 'Sitzplatz Kat. 1–2 (Zentral)' : 'Sitzplatz Kat. 3–4',
      gate: 'Eingang Ost (Maurice-Banach-Platz)',
      viewQuality: 'Weite Panorama-Sicht von der Ost-Gegengerade über das gesamte Stadion.',
      catering: 'Oberrang-Kioske Ost',
      insiderTip: `Block ${b} im Ost-Oberrang ist ideal für Fans, die sowohl Taktik als auch die Choreografien auf der Süd perfekt sehen wollen.`,
    };
  }

  // Nordtribüne (8, 9, 60-63, 70-78)
  if (['8', '60', '61'].includes(b)) {
    return {
      block: b,
      standId: 'gaeste',
      standName: 'Nordtribüne (Gästeblock)',
      tier: b === '8' ? 'Spielfeldrand / Barrierefrei' : 'Unterrang',
      category: 'Gästebereich (Steh-/Sitzplatz)',
      gate: 'Eingang Nord / Gäste (Separater Zugang)',
      viewQuality: 'Hinter dem Nordtor mit frontalem Blick auf die gegenüberliegende Gelbe Wand.',
      catering: 'Separater Gästekiosk-Bereich im Nordost-Umlauf',
      insiderTip: `Block ${b} ist der offizielle Stehplatzbereich für die Gästefans im Signal Iduna Park.`,
    };
  }
  if (b === '9') {
    return {
      block: '9',
      standId: 'nord',
      standName: 'Nordtribüne (Spielfeldrand)',
      tier: 'Spielfeldrand / Barrierefrei',
      category: 'Barrierefrei (Rollstuhl / Seh- & Gehbehindert)',
      gate: 'Eingang Nord-West / Nord',
      viewQuality: 'Direkt hinter dem Nordtor am Spielfeldrand.',
      catering: 'Nord-Erdgeschoss Kioske',
      insiderTip: 'Block 9 ist der barrierefreie Bereich (🚶) direkt am Nordtor.',
    };
  }
  if (b === '62') {
    return {
      block: '62',
      standId: 'nord',
      standName: 'Nordtribüne (REWE Familienblock)',
      tier: 'Unterrang',
      category: 'REWE Familienblock',
      gate: 'Eingang Nord / Familienblock',
      viewQuality: 'Direkt hinter dem Nordtor mit perfektem Blick auf die Südtribüne.',
      catering: 'Familienfreundliche Kioske im Nord-Umlauf',
      insiderTip: 'Block 62 ist der offizielle REWE-Familienblock für Kinder, Jugendliche und Familien (rauchfrei).',
    };
  }
  if (b === '63') {
    return {
      block: '63',
      standId: 'nord',
      standName: 'Nordtribüne (Heim-Stehplatz)',
      tier: 'Unterrang',
      category: 'Stehplatz / Fanblock',
      gate: 'Eingang Nord-West',
      viewQuality: 'Hinter dem Nordtor im nordwestlichen Unterrang.',
      catering: 'Nord-West Kioske',
      insiderTip: 'Block 63 ist (zusammen mit 64/65) ein beliebter Steh-/Fanblock für BVB-Fans auf der Nordseite.',
    };
  }
  if (['70', '71', '72', '73', '74', '75', '76', '77', '78'].includes(b)) {
    const isUpper = ['75', '76', '77', '78'].includes(b);
    return {
      block: b,
      standId: 'nord',
      standName: 'Nordtribüne',
      tier: isUpper ? 'Oberrang' : 'Mittelrang',
      category: 'Sitzplatz Kat. 3–4',
      gate: 'Eingang Nord',
      viewQuality: 'Frontaler Panoramablick auf die legendäre „Gelbe Wand“ gegenüber!',
      catering: 'Nord-Umlauf Grill- & Getränkestände',
      insiderTip: `Aus Block ${b} hast du bei Choreografien auf der Südtribüne den besten frontalen Fotoblick im ganzen Stadion.`,
    };
  }

  // Ecke Süd-West (35-39)
  if (['35', '36', '37', '38', '39'].includes(b)) {
    const isLower = b === '35' || b === '36';
    return {
      block: b,
      standId: 'ecke_sw',
      standName: 'Ecke Süd-West',
      tier: isLower ? 'Unterrang' : 'Oberrang',
      category: 'Sitzplatz Ecke / Kurve',
      gate: 'Eingang Süd-West (Strobelallee)',
      viewQuality: 'Diagonale Kurvensicht direkt an der Nahtstelle zur Gelben Wand.',
      catering: 'Eck-Kioske Süd-West',
      insiderTip: `Block ${b} liegt in der Süd-West-Ecke direkt neben der Südtribüne – perfekte Mischung aus Sitzplatzkomfort und Südtribünen-Stimmung!`,
    };
  }

  // Ecke Nord-West (64-68)
  if (['64', '65', '66', '67', '68'].includes(b)) {
    const isLower = b === '64' || b === '65';
    return {
      block: b,
      standId: 'ecke_nw',
      standName: 'Ecke Nord-West',
      tier: isLower ? 'Unterrang' : 'Oberrang',
      category: isLower ? 'Stehplatz / Fanblock' : 'Sitzplatz Ecke / Kurve',
      gate: 'Eingang Nord-West',
      viewQuality: 'Diagonale Sicht über das Nordtor bis zur Südtribüne.',
      catering: 'Kioske Nord-West',
      insiderTip: isLower
        ? `Block ${b} (im offiziellen Plan schraffiert) ist ein stimmungsvoller Fanblock im Nord-West-Unterrang.`
        : `Block ${b} liegt im Oberrang der Nord-West-Kurve mit weitem Blick auf die Gelbe Wand.`,
    };
  }

  // Ecke Süd-Ost (85-89)
  if (['85', '86', '87', '88', '89'].includes(b)) {
    const isLower = b === '85' || b === '86';
    return {
      block: b,
      standId: 'ecke_so',
      standName: 'Ecke Süd-Ost',
      tier: isLower ? 'Unterrang' : 'Oberrang',
      category: 'Sitzplatz Ecke / Kurve',
      gate: 'Eingang Süd-Ost (Maurice-Banach-Platz)',
      viewQuality: 'Diagonale Kurvensicht direkt neben Block 15/84 der Südtribüne.',
      catering: 'Eck-Kioske Süd-Ost',
      insiderTip: `Block ${b} grenzt im Süd-Osten unmittelbar an die Gelbe Wand an – hier bebt das Stadion bei jedem Tor!`,
    };
  }

  // Ecke Nord-Ost (55-59)
  return {
    block: b,
    standId: 'ecke_no',
    standName: 'Ecke Nord-Ost',
    tier: b === '55' || b === '56' ? 'Unterrang' : 'Oberrang',
    category: 'Gästebereich (Steh-/Sitzplatz)',
    gate: 'Eingang Nord-Ost / Nord',
    viewQuality: 'Diagonale Sicht aus der Nord-Ost-Kurve Richtung Spielfeld und Südtribüne.',
    catering: 'Nord-Ost Kioske',
    insiderTip: `Block ${b} liegt in der Nord-Ost-Ecke am Übergang zwischen Osttribüne und Gästebereich.`,
  };
}

export const SignalIdunaParkBlockMap: React.FC = () => {
  const [selectedStand, setSelectedStand] = useState<StandGroupId>('sued');
  const [selectedBlock, setSelectedBlock] = useState<string | null>('12');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectBlock = (blockId: string) => {
    const info = getBlockDetails(blockId);
    setSelectedBlock(blockId);
    setSelectedStand(info.standId);
  };

  const handleSelectStand = (standId: StandGroupId) => {
    setSelectedStand(standId);
    setSelectedBlock(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned) {
      const validBlocks = [
        '1','2','3','4','5','6','7','8','9',
        '10','11','12','13','14','15',
        '20','21','22','23','24','25','26','27',
        '30','31','32','33','34','35','36','37','38','39',
        '40','41','42','43','44','45','46','47','48','49',
        '50','51','52','53','54','55','56','57','58','59',
        '60','61','62','63','64','65','66','67','68',
        '70','71','72','73','74','75','76','77','78',
        '80','81','82','83','84','85','86','87','88','89'
      ];
      if (validBlocks.includes(cleaned)) {
        handleSelectBlock(cleaned);
      }
    }
  };

  const currentBlockInfo = useMemo(
    () => (selectedBlock ? getBlockDetails(selectedBlock) : null),
    [selectedBlock]
  );

  const currentStandInfo = STAND_OVERVIEW[selectedStand];

  // Helper to render clickable SVG block rectangle with exact reference color and active highlight
  const renderBlockRect = (
    blockId: string,
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    textColor: string = '#000000',
    fontSize: number = 13,
    rx: number = 2
  ) => {
    const isSelected = selectedBlock === blockId;
    const info = getBlockDetails(blockId);
    const isStandHighlighted = !selectedBlock && selectedStand === info.standId;

    return (
      <g
        key={`block-${blockId}`}
        onClick={() => handleSelectBlock(blockId)}
        className="cursor-pointer transition-opacity hover:opacity-90"
      >
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={rx}
          fill={fill}
          stroke={isSelected ? '#FDE100' : isStandHighlighted ? '#ffffff' : '#18181b'}
          strokeWidth={isSelected ? 3.5 : isStandHighlighted ? 2 : 1.2}
        />
        {isSelected && (
          <rect
            x={x - 2}
            y={y - 2}
            width={w + 4}
            height={h + 4}
            rx={rx + 1}
            fill="none"
            stroke="#000000"
            strokeWidth={1.5}
          />
        )}
        <text
          x={x + w / 2}
          y={y + h / 2 + fontSize * 0.36}
          textAnchor="middle"
          fill={textColor}
          fontSize={fontSize}
          fontWeight="900"
          fontFamily="sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {blockId}
        </text>
      </g>
    );
  };

  // Helper for custom polygon/path blocks in the 4 curved stadium corners
  const renderCornerPath = (
    blockId: string,
    d: string,
    labelX: number,
    labelY: number,
    fill: string,
    textColor: string = '#000000',
    hatched: boolean = false
  ) => {
    const isSelected = selectedBlock === blockId;
    const info = getBlockDetails(blockId);
    const isStandHighlighted = !selectedBlock && selectedStand === info.standId;

    return (
      <g
        key={`corner-${blockId}`}
        onClick={() => handleSelectBlock(blockId)}
        className="cursor-pointer transition-opacity hover:opacity-90"
      >
        <path
          d={d}
          fill={hatched ? 'url(#nwHatch)' : fill}
          stroke={isSelected ? '#FDE100' : isStandHighlighted ? '#ffffff' : '#e4e4e7'}
          strokeWidth={isSelected ? 3.5 : isStandHighlighted ? 2.2 : 1.5}
        />
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fill={textColor}
          fontSize={13}
          fontWeight="900"
          fontFamily="sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {blockId}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Stand Quick-Buttons + "Wo ist mein Block?" Search Input */}
      <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'sued', label: '🔥 Süd (10–15, 80–84)' },
              { id: 'west', label: '🛡️ West (1–4, 20–34)' },
              { id: 'ost', label: '⚡ Ost (5–7, 40–54)' },
              { id: 'nord', label: '🧭 Nord (9, 62–63, 70–78)' },
              { id: 'ecke_sw', label: '↖️ Süd-West (35–39)' },
              { id: 'ecke_nw', label: '↗️ Nord-West (64–68)' },
              { id: 'ecke_so', label: '↙️ Süd-Ost (85–89)' },
              { id: 'ecke_no', label: '↘️ Nord-Ost (55–59)' },
              { id: 'gaeste', label: '🚌 Gäste (8, 60–61)' },
            ] as { id: StandGroupId; label: string }[]
          ).map((tab) => {
            const active = selectedStand === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectStand(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#FDE100] text-black border-[#FDE100] font-extrabold shadow-sm'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Block Number Finder */}
        <div className="relative min-w-[230px]">
          <Search className="w-4 h-4 text-[#FDE100] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Block suchen (z.B. 12, 82, 38, 61)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-[#FDE100]/40 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FDE100] font-mono"
          />
        </div>
      </div>

      {/* Main Grid: Official-Style 1:1 Block Map SVG (Left 7 cols) + Detailed Block/Stand Inspector (Right 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: 1:1 Official Signal Iduna Park Block Map SVG */}
        <div className="xl:col-span-7 bg-[#1b1b1d] border-2 border-slate-800 rounded-2xl p-3 sm:p-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FDE100] font-bvb flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              <span>Offizielle Signal Iduna Park Block-Anordnung (West oben · Süd links · Ost unten · Nord rechts)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Klicke auf einen beliebigen Block (1–89)
            </span>
          </div>

          <svg
            viewBox="0 0 920 680"
            className="w-full h-auto select-none rounded-xl bg-[#222021]"
          >
            <defs>
              {/* Diagonal Hatch Pattern for Blocks 64 & 65 (Nord-West Fanblock) */}
              <pattern id="nwHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="#008fd5" />
                <line x1="0" y1="0" x2="0" y2="6" stroke="#18181b" strokeWidth="2.2" />
              </pattern>
            </defs>

            {/* OUTER LABELS: West (Top), Ost (Bottom), Süd (Left), Nord (Right) */}
            <text
              x="460"
              y="22"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="19"
              fontWeight="900"
              fontFamily="sans-serif"
              className="cursor-pointer"
              onClick={() => handleSelectStand('west')}
            >
              West
            </text>
            <text
              x="460"
              y="668"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="19"
              fontWeight="900"
              fontFamily="sans-serif"
              className="cursor-pointer"
              onClick={() => handleSelectStand('ost')}
            >
              Ost
            </text>
            <text
              x="24"
              y="346"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="19"
              fontWeight="900"
              fontFamily="sans-serif"
              className="cursor-pointer"
              onClick={() => handleSelectStand('sued')}
            >
              Süd
            </text>
            <text
              x="892"
              y="346"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="19"
              fontWeight="900"
              fontFamily="sans-serif"
              className="cursor-pointer"
              onClick={() => handleSelectStand('nord')}
            >
              Nord
            </text>

            {/* =====================================================================
                ECKE SÜD-WEST (TOP-LEFT CURVED CORNER: 35, 36, 37, 38, 39)
               ===================================================================== */}
            {/* Outer Ring SW: 39 (bottom-left), 38 (mid-diag), 37 (top-right) */}
            {renderCornerPath(
              '39',
              'M 55 205 C 55 170, 65 142, 82 118 L 138 152 C 126 168, 120 185, 120 205 Z',
              92,
              173,
              '#ffdd00'
            )}
            {renderCornerPath(
              '38',
              'M 82 118 C 102 90, 128 68, 160 54 L 184 114 C 164 124, 149 136, 138 152 Z',
              130,
              109,
              '#59bd99'
            )}
            {renderCornerPath(
              '37',
              'M 160 54 C 180 45, 202 42, 224 42 L 224 110 C 208 110, 195 111, 184 114 Z',
              196,
              78,
              '#ffdd00'
            )}
            {/* Inner Ring SW: 36 (lower-left), 35 (upper-right) */}
            {renderCornerPath(
              '36',
              'M 132 205 C 132 182, 142 162, 160 146 L 192 178 C 182 186, 176 195, 176 205 Z',
              160,
              184,
              '#008fd5'
            )}
            {renderCornerPath(
              '35',
              'M 160 146 C 178 130, 200 122, 224 122 L 224 168 C 210 168, 200 172, 192 178 Z',
              198,
              148,
              '#008fd5'
            )}

            {/* =====================================================================
                ECKE NORD-WEST (TOP-RIGHT CURVED CORNER: 64, 65, 66, 67, 68)
               ===================================================================== */}
            {/* Outer Ring NW: 68 (top-left), 67 (mid-diag), 66 (bottom-right) */}
            {renderCornerPath(
              '68',
              'M 686 42 C 708 42, 730 45, 750 54 L 726 114 C 715 111, 702 110, 686 110 Z',
              714,
              78,
              '#59bd99'
            )}
            {renderCornerPath(
              '67',
              'M 750 54 C 782 68, 808 90, 828 118 L 772 152 C 761 136, 746 124, 726 114 Z',
              778,
              109,
              '#ffdd00'
            )}
            {renderCornerPath(
              '66',
              'M 828 118 C 845 142, 855 170, 855 205 L 790 205 C 790 185, 784 168, 772 152 Z',
              818,
              173,
              '#59bd99'
            )}
            {/* Inner Ring NW (Hatched Fanblock): 65 (upper-left), 64 (lower-right) */}
            {renderCornerPath(
              '65',
              'M 686 122 C 710 122, 732 130, 750 146 L 718 178 C 710 172, 700 168, 686 168 Z',
              712,
              148,
              '#008fd5',
              '#000000',
              true
            )}
            {renderCornerPath(
              '64',
              'M 750 146 C 768 162, 778 182, 778 205 L 734 205 C 734 195, 728 186, 718 178 Z',
              750,
              184,
              '#008fd5',
              '#000000',
              true
            )}

            {/* =====================================================================
                ECKE SÜD-OST (BOTTOM-LEFT CURVED CORNER: 85, 86, 87, 88, 89)
               ===================================================================== */}
            {/* Outer Ring SO: 87 (top-left), 88 (mid-diag), 89 (bottom-right) */}
            {renderCornerPath(
              '87',
              'M 55 475 C 55 510, 65 538, 82 562 L 138 528 C 126 512, 120 495, 120 475 Z',
              92,
              514,
              '#59bd99'
            )}
            {renderCornerPath(
              '88',
              'M 82 562 C 102 590, 128 612, 160 626 L 184 566 C 164 556, 149 544, 138 528 Z',
              130,
              576,
              '#ffdd00'
            )}
            {renderCornerPath(
              '89',
              'M 160 626 C 180 635, 202 638, 224 638 L 224 570 C 208 570, 195 569, 184 566 Z',
              196,
              605,
              '#59bd99'
            )}
            {/* Inner Ring SO: 85 (upper-left), 86 (lower-right) */}
            {renderCornerPath(
              '85',
              'M 132 475 C 132 498, 142 518, 160 534 L 192 502 C 182 494, 176 485, 176 475 Z',
              160,
              501,
              '#008fd5'
            )}
            {renderCornerPath(
              '86',
              'M 160 534 C 178 550, 200 558, 224 558 L 224 512 C 210 512, 200 508, 192 502 Z',
              198,
              536,
              '#008fd5'
            )}

            {/* =====================================================================
                ECKE NORD-OST (BOTTOM-RIGHT CURVED CORNER: 55, 56, 57, 58, 59)
               ===================================================================== */}
            {/* Outer Ring NO: 57 (bottom-left), 58 (mid-diag), 59 (top-right) */}
            {renderCornerPath(
              '57',
              'M 686 638 C 708 638, 730 635, 750 626 L 726 566 C 715 569, 702 570, 686 570 Z',
              714,
              605,
              '#ffdd00'
            )}
            {renderCornerPath(
              '58',
              'M 750 626 C 782 612, 808 590, 828 562 L 772 528 C 761 544, 746 556, 726 566 Z',
              778,
              576,
              '#ffdd00'
            )}
            {renderCornerPath(
              '59',
              'M 828 562 C 845 538, 855 510, 855 475 L 790 475 C 790 495, 784 512, 772 528 Z',
              818,
              514,
              '#59bd99'
            )}
            {/* Inner Ring NO: 55 (lower-left), 56 (upper-right) */}
            {renderCornerPath(
              '55',
              'M 686 558 C 710 558, 732 550, 750 534 L 718 502 C 710 508, 700 512, 686 512 Z',
              712,
              536,
              '#008fd5'
            )}
            {renderCornerPath(
              '56',
              'M 750 534 C 768 518, 778 498, 778 475 L 734 475 C 734 485, 728 494, 718 502 Z',
              750,
              501,
              '#008fd5'
            )}

            {/* =====================================================================
                WESTTRIBÜNE (TOP STAND: Oberrang 34-30, Unterrang 20-27, Rand 4-1)
               ===================================================================== */}
            <rect x="228" y="38" width="454" height="72" fill="#e4e4e7" rx="2" />
            {/* West Oberrang: 34, 33, 32, 31, 30 */}
            {renderBlockRect('34', 232, 42, 62, 64, '#ffdd00')}
            {renderBlockRect('33', 298, 42, 102, 64, '#008fd5')}
            {renderBlockRect('32', 404, 42, 102, 64, '#8b2f89', '#ffffff')}
            {renderBlockRect('31', 510, 42, 102, 64, '#008fd5')}
            {renderBlockRect('30', 616, 42, 62, 64, '#ffdd00')}

            {/* West Unterrang Container */}
            <rect x="228" y="114" width="454" height="68" fill="#e4e4e7" rx="2" />
            {/* Left stack: 25, 24, 23 */}
            {renderBlockRect('25', 232, 117, 96, 19, '#8b2f89', '#ffffff', 11)}
            {renderBlockRect('24', 232, 138, 96, 19, '#8b2f89', '#ffffff', 11)}
            {renderBlockRect('23', 232, 159, 96, 19, '#8b2f89', '#ffffff', 11)}
            {/* Center stack: 27 (VIP/Presse) & 26 */}
            {renderBlockRect('27', 332, 117, 246, 28, '#9e8c7a', '#000000', 12)}
            {renderBlockRect('26', 386, 148, 138, 30, '#009a5a', '#000000', 12)}
            {/* Right stack: 22, 21, 20 */}
            {renderBlockRect('22', 582, 117, 96, 19, '#8b2f89', '#ffffff', 11)}
            {renderBlockRect('21', 582, 138, 96, 19, '#8b2f89', '#ffffff', 11)}
            {renderBlockRect('20', 582, 159, 96, 19, '#8b2f89', '#ffffff', 11)}

            {/* West Spielfeldrand Barrierefrei: 4, 3 (♿), 2, 1 */}
            {renderBlockRect('4', 232, 186, 36, 18, '#ffdd00', '#000000', 11)}
            {renderBlockRect('3', 274, 186, 140, 18, '#ed1c24', '#000000', 11)}
            {renderBlockRect('2', 422, 186, 108, 18, '#ffdd00', '#000000', 11)}
            {renderBlockRect('1', 536, 186, 142, 18, '#ffdd00', '#000000', 11)}
            {/* Accessibility badges on West */}
            <rect x="248" y="92" width="22" height="18" fill="#ffffff" stroke="#000" strokeWidth="1" rx="2" />
            <text x="259" y="105" textAnchor="middle" fontSize="11">👂</text>
            <rect x="358" y="185" width="20" height="20" fill="#ffffff" stroke="#000" strokeWidth="1" rx="2" />
            <text x="368" y="199" textAnchor="middle" fontSize="12">♿</text>

            {/* =====================================================================
                SÜDTRIBÜNE (LEFT STAND: Oberrang 80-84, Unterrang 10-15)
               ===================================================================== */}
            <rect x="52" y="210" width="172" height="260" fill="#e4e4e7" rx="2" />
            {/* Süd Oberrang (Left column: 80, 81, 82, 83, 84) */}
            {renderBlockRect('80', 56, 214, 78, 36, '#f58220', '#000000', 13)}
            {renderBlockRect('81', 56, 253, 78, 44, '#f58220', '#000000', 13)}
            {renderBlockRect('82', 56, 300, 78, 80, '#f58220', '#000000', 14)}
            {renderBlockRect('83', 56, 383, 78, 44, '#f58220', '#000000', 13)}
            {renderBlockRect('84', 56, 430, 78, 36, '#f58220', '#000000', 13)}

            {/* Süd Unterrang (Right column next to pitch: 10, 11, 12, 13, 14, 15) */}
            {renderBlockRect('10', 140, 214, 80, 36, '#f58220', '#000000', 13)}
            {renderBlockRect('11', 140, 253, 80, 44, '#f58220', '#000000', 13)}
            {renderBlockRect('12', 140, 300, 80, 38, '#f58220', '#000000', 13)}
            {renderBlockRect('13', 140, 342, 80, 38, '#f58220', '#000000', 13)}
            {renderBlockRect('14', 140, 383, 80, 44, '#f58220', '#000000', 13)}
            {renderBlockRect('15', 140, 430, 80, 36, '#f58220', '#000000', 13)}

            {/* =====================================================================
                OSTTRIBÜNE (BOTTOM STAND: Rand 5-7, Unterrang 40-49, Oberrang 50-54)
               ===================================================================== */}
            {/* Ost Spielfeldrand Barrierefrei: 5 (👁️), 6 (♿), 7 (🚶) */}
            {renderBlockRect('5', 232, 476, 36, 18, '#ffdd00', '#000000', 11)}
            {renderBlockRect('6', 274, 476, 140, 18, '#ed1c24', '#000000', 11)}
            {renderBlockRect('7', 496, 476, 182, 18, '#ffdd00', '#000000', 11)}
            <rect x="210" y="474" width="20" height="20" fill="#ffffff" stroke="#000" strokeWidth="1" rx="2" />
            <text x="220" y="488" textAnchor="middle" fontSize="11">👁️</text>
            <rect x="358" y="475" width="20" height="20" fill="#ffffff" stroke="#000" strokeWidth="1" rx="2" />
            <text x="368" y="489" textAnchor="middle" fontSize="12">♿</text>

            {/* Ost Unterrang Container (40-49) */}
            <rect x="228" y="498" width="454" height="68" fill="#e4e4e7" rx="2" />
            {/* Row 1 (closest to pitch): 40, 41, 42, 43 */}
            {renderBlockRect('40', 232, 501, 90, 19, '#ea9ec4', '#000000', 11)}
            {renderBlockRect('41', 325, 501, 128, 19, '#ea9ec4', '#000000', 11)}
            {renderBlockRect('42', 456, 501, 128, 19, '#ea9ec4', '#000000', 11)}
            {renderBlockRect('43', 587, 501, 91, 19, '#ea9ec4', '#000000', 11)}
            {/* Row 2 (middle): 44, 45, 46 */}
            {renderBlockRect('44', 232, 522, 148, 19, '#8b2f89', '#ffffff', 11)}
            {renderBlockRect('45', 383, 522, 144, 19, '#ec008c', '#000000', 11)}
            {renderBlockRect('46', 530, 522, 148, 19, '#8b2f89', '#ffffff', 11)}
            {/* Row 3 (bottom of Unterrang): 47, 48, 49 */}
            {renderBlockRect('47', 232, 543, 148, 19, '#8b2f89', '#ffffff', 11)}
            {renderBlockRect('48', 383, 543, 144, 19, '#009a5a', '#000000', 11)}
            {renderBlockRect('49', 530, 543, 148, 19, '#8b2f89', '#ffffff', 11)}

            {/* Ost Oberrang Container (50-54) */}
            <rect x="228" y="570" width="454" height="72" fill="#e4e4e7" rx="2" />
            {renderBlockRect('50', 232, 574, 62, 64, '#ffdd00')}
            {renderBlockRect('51', 298, 574, 102, 64, '#008fd5')}
            {renderBlockRect('52', 404, 574, 102, 64, '#8b2f89', '#ffffff')}
            {renderBlockRect('53', 510, 574, 102, 64, '#008fd5')}
            {renderBlockRect('54', 616, 574, 62, 64, '#ffdd00')}

            {/* =====================================================================
                NORDTRIBÜNE (RIGHT STAND: Rand 9 & 8, Unterrang 63-60, Mittel 74-70, Ober 78-75)
               ===================================================================== */}
            {/* Spielfeldrand Nord: 9 (top) & 8 (bottom, Gäste Stehplatz) */}
            {renderBlockRect('9', 686, 214, 18, 124, '#ffdd00', '#000000', 11)}
            {renderBlockRect('8', 686, 344, 18, 122, '#f58220', '#000000', 11)}

            {/* Nord Main Container */}
            <rect x="708" y="210" width="150" height="260" fill="#e4e4e7" rx="2" />
            {/* Column 1 (Unterrang Nord): 63, 62 (REWE Familienblock), 61, 60 */}
            {renderBlockRect('63', 712, 214, 44, 52, '#f58220', '#000000', 13)}
            {renderBlockRect('62', 712, 269, 44, 88, '#008fd5', '#000000', 13)}
            {renderBlockRect('61', 712, 360, 44, 66, '#f58220', '#000000', 13)}
            {renderBlockRect('60', 712, 429, 44, 37, '#f58220', '#000000', 13)}

            {/* Column 2 (Mittelrang Nord): 74, 73, 72, 71, 70 */}
            {renderBlockRect('74', 760, 214, 44, 52, '#ea9ec4', '#000000', 13)}
            {renderBlockRect('73', 760, 269, 44, 42, '#ec008c', '#000000', 13)}
            {renderBlockRect('72', 760, 314, 44, 43, '#ec008c', '#000000', 13)}
            {renderBlockRect('71', 760, 360, 44, 52, '#ea9ec4', '#000000', 13)}
            {renderBlockRect('70', 760, 415, 44, 51, '#ea9ec4', '#000000', 13)}

            {/* Column 3 (Oberrang Nord): 78, 77, 76, 75 */}
            {renderBlockRect('78', 808, 214, 46, 52, '#59bd99', '#000000', 13)}
            {renderBlockRect('77', 808, 269, 46, 70, '#ffdd00', '#000000', 13)}
            {renderBlockRect('76', 808, 342, 46, 70, '#ffdd00', '#000000', 13)}
            {renderBlockRect('75', 808, 415, 46, 51, '#59bd99', '#000000', 13)}

            {/* =====================================================================
                CENTER PITCH (SPIELFELD MIT OFFIZIELLEM BVB 09 MITTELKREIS-LOGO)
               ===================================================================== */}
            <g>
              {/* Outer White Pitch Border */}
              <rect x="248" y="214" width="414" height="252" fill="#5fb446" stroke="#ffffff" strokeWidth="4" rx="2" />
              {/* Turf Stripes */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((stripe) => (
                <rect
                  key={stripe}
                  x={250 + stripe * 51.5}
                  y={216}
                  width={25.7}
                  height={248}
                  fill="#67be4e"
                  opacity="0.45"
                />
              ))}
              {/* Pitch Lines */}
              <line x1="455" y1="214" x2="455" y2="466" stroke="#ffffff" strokeWidth="3" />
              <circle cx="455" cy="340" r="44" fill="none" stroke="#ffffff" strokeWidth="3" />

              {/* Left Penalty Area (vor der Südtribüne) */}
              <rect x="248" y="264" width="66" height="152" fill="none" stroke="#ffffff" strokeWidth="3" />
              <rect x="248" y="302" width="24" height="76" fill="none" stroke="#ffffff" strokeWidth="3" />
              <circle cx="294" cy="340" r="3" fill="#ffffff" />
              <path d="M 314 312 A 34 34 0 0 1 314 368" fill="none" stroke="#ffffff" strokeWidth="3" />

              {/* Right Penalty Area (vor der Nordtribüne) */}
              <rect x="596" y="264" width="66" height="152" fill="none" stroke="#ffffff" strokeWidth="3" />
              <rect x="638" y="302" width="24" height="76" fill="none" stroke="#ffffff" strokeWidth="3" />
              <circle cx="616" cy="340" r="3" fill="#ffffff" />
              <path d="M 596 312 A 34 34 0 0 0 596 368" fill="none" stroke="#ffffff" strokeWidth="3" />

              {/* Corner Arcs */}
              <path d="M 248 226 A 12 12 0 0 0 260 214" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              <path d="M 260 466 A 12 12 0 0 0 248 454" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              <path d="M 650 214 A 12 12 0 0 0 662 226" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              <path d="M 662 454 A 12 12 0 0 0 650 466" fill="none" stroke="#ffffff" strokeWidth="2.5" />

              {/* Official BVB 09 Crest on Center Circle */}
              <circle cx="455" cy="340" r="46" fill="#FDE100" stroke="#000000" strokeWidth="3" />
              <circle cx="455" cy="340" r="41" fill="none" stroke="#000000" strokeWidth="2" />
              <text
                x="455"
                y="343"
                textAnchor="middle"
                fill="#000000"
                fontSize="30"
                fontWeight="900"
                fontFamily="sans-serif"
                letterSpacing="-1"
              >
                BVB
              </text>
              <text
                x="455"
                y="366"
                textAnchor="middle"
                fill="#000000"
                fontSize="18"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                09
              </text>
            </g>
          </svg>

          {/* Official Color Key / Legend matching the reference plan */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#f58220] inline-block border border-black" />
                <span>Stehplatz (Süd 10–15, 80–84 / Nord 63 / Gäste 8, 60, 61)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#009a5a] inline-block border border-black" />
                <span>Kat. 1 (Mitte)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#8b2f89] inline-block border border-black" />
                <span>Kat. 2</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#008fd5] inline-block border border-black" />
                <span>Kat. 3 / Familienblock (62)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#ffdd00] inline-block border border-black" />
                <span>Kat. 4 / Kurve</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#59bd99] inline-block border border-black" />
                <span>Kat. 5 (Eck-Oberrang)</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-[#ed1c24] inline-block border border-black" />
                <span>Rollstuhlplätze ♿ (Block 3 & 6)</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Interactive Block & Stand Inspector Panel */}
        <div className="xl:col-span-5 space-y-4">
          {currentBlockInfo ? (
            <div className="bg-[#0e1117] border-2 border-[#FDE100]/60 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-[#FDE100] text-black font-mono text-[10px] font-black uppercase">
                    GEWÄHLTER BLOCK IM STADIONPLAN
                  </span>
                  <h4 className="text-2xl font-black text-white font-bvb uppercase tracking-wide mt-1">
                    Block {currentBlockInfo.block} · {currentBlockInfo.standName}
                  </h4>
                  <p className="text-xs text-[#FDE100] font-semibold mt-0.5">
                    {currentBlockInfo.tier} · {currentBlockInfo.category}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#FDE100] text-black font-bvb font-black text-2xl flex items-center justify-center shadow-lg shrink-0 border-2 border-black">
                  {currentBlockInfo.block}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 uppercase font-mono text-[10px]">Empfohlener Eingang</div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{currentBlockInfo.gate}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-slate-400 uppercase font-mono text-[10px]">Rang & Platzart</div>
                  <div className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#FDE100] shrink-0" />
                    <span>{currentBlockInfo.tier}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold uppercase text-sky-400 font-bvb">
                  👀 Sicht aufs Spielfeld & Perspektive
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{currentBlockInfo.viewQuality}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold uppercase text-amber-400 font-bvb">
                  🍺 Catering, Bier & Stadionwurst
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{currentBlockInfo.catering}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FDE100]/10 border border-[#FDE100]/30 space-y-1">
                <div className="text-[11px] font-bold uppercase text-[#FDE100] font-bvb flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BVB Insider-Tipp für Block {currentBlockInfo.block}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{currentBlockInfo.insiderTip}</p>
              </div>
            </div>
          ) : null}

          {/* Stand Overview Card */}
          <div className="bg-[#0e1117] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Tribünen-Übersicht</span>
                <h5 className="text-lg font-black text-[#FDE100] font-bvb uppercase tracking-wide">
                  {currentStandInfo.name}
                </h5>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#FDE100]" />
            </div>

            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0">Zugehörige Blöcke:</span>
                <span className="font-mono font-bold text-white text-right">{currentStandInfo.blocksSummary}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0">Kapazität / Sektor:</span>
                <span className="font-semibold text-emerald-400 text-right">{currentStandInfo.capacityInfo}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0">Zugang / Drehkreuz:</span>
                <span className="font-semibold text-white text-right">{currentStandInfo.gate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-[#FDE100] shrink-0 mt-0.5" />
              <span>{currentStandInfo.insiderTip}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
