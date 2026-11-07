import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Volume2,
  Eye
} from 'lucide-react';
import { playStadiumCheerSound } from '../../utils/cheerSound';
import { playBVBSoundTrack } from '../../utils/soundboardSynth';

export interface Milestone {
  year: string;
  era: string;
  title: string;
  subtitle: string;
  hero: string;
  description: string;
  highlights: string[];
  score?: string;
  opponent?: string;
  trophy?: string;
}

export interface PlayerKeyframe {
  id: string;
  name: string;
  number: string;
  x: number;
  y: number;
  isOpponent?: boolean;
  isKeeper?: boolean;
  hasBall?: boolean;
  labelPos?: 'top' | 'bottom'; // Prevents nameplates from overlapping nearby players
}

export interface GoalReenactmentStep {
  stepNumber: number;
  timeSec: string;
  clockSec: number; // for live interpolated stadium clock
  playerAction: string;
  ballPos: { x: number; y: number; height?: number }; // % on pitch (0-100), height for lob/arc
  players: PlayerKeyframe[];
  commentary: string;
}

export interface GoalReenactment {
  id: string;
  shortLabel: string;
  title: string;
  match: string;
  scorer: string;
  minute: string;
  famousQuote: string;
  commentator: string;
  steps: GoalReenactmentStep[];
}

export const BVB_MILESTONES: Milestone[] = [
  {
    year: '1909',
    era: 'Die Geburtsstunde',
    title: 'Gründung am Borsigplatz',
    subtitle: '19. Dezember 1909 in der Gaststätte „Zum Wildschütz“',
    hero: 'Franz Jacobi',
    description: '18 fußballbegeisterte junge Männer um Franz Jacobi gründen den Ballspielverein Borussia 09 e.V. Dortmund. Der Name „Borussia“ stammt von der nahegelegenen Borussia-Brauerei in der Steigerstraße. Ursprünglich spielte man in blau-weißen Trikots mit roter Schärpe, bevor 1913 Schwarz-Gelb zu den ewigen Klubfarben wurde.',
    highlights: ['18 Gründungsmitglieder', 'Wiege am Borsigplatz', 'Schwarz-Gelb seit 1913'],
    trophy: 'Gründungsurkunde',
  },
  {
    year: '1956/57',
    era: 'Erste Meisterschaften',
    title: 'Die legendären Drei Alfredos',
    subtitle: 'Back-to-Back Deutsche Meisterschaft',
    hero: 'Alfred Preißler, Kelbassa & Niepieklo',
    description: 'Der BVB sichert sich 1956 im Berliner Olympiastadion vor 75.000 Zuschauern mit einem 4:2 gegen den Karlsruher SC die erste Deutsche Meisterschaft der Vereinsgeschichte. 1957 gelingt das historische Kunststück: dieselbe Elf verteidigt den Titel mit 4:1 gegen den Hamburger SV! Unsterbliches Zitat von Kapitän Alfred Preißler: „Grau is alle Theorie – entscheidend is auf’m Platz!“',
    highlights: ['Erster Meistertitel 1956', 'Titelverteidigung 1957', 'Exakt dieselbe Meisterelf'],
    trophy: '2x Meisterschale',
    opponent: 'Karlsruher SC & Hamburger SV',
  },
  {
    year: '1966',
    era: 'Europäischer Ruhm',
    title: 'Triumph im Hampden Park von Glasgow',
    subtitle: 'Erster deutscher Europapokalsieger der Geschichte',
    hero: 'Reinhard „Stan“ Libuda & Siggi Held',
    description: 'Am 5. Mai 1966 schreibt Borussia Dortmund im strömenden schottischen Regen Fußballgeschichte. Gegen die favorisierten Reds von Liverpool siegt Schwarz-Gelb mit 2:1 nach Verlängerung. Stan Libudas genialer 35-Meter-Bogenball prallt an die Latte und wird ins Tor abgefälscht.',
    highlights: ['2:1 n.V. vs. Liverpool', '1. deutscher Europapokalsieger', 'Held & Libuda Zaubertore'],
    score: '2 : 1 n.V.',
    opponent: 'FC Liverpool',
    trophy: 'Europapokal der Pokalsieger',
  },
  {
    year: '1974',
    era: 'Tempel der Leidenschaft',
    title: 'Eröffnung des Westfalenstadions',
    subtitle: 'Geburtsstunde der Gelben Wand',
    hero: 'Erich Rüttemöller & Fans',
    description: 'Pünktlich zur Weltmeisterschaft 1974 wird das Westfalenstadion feierlich eröffnet. Was als reines Fußballstadion mit steilen Rängen begann, wuchs mit der Zeit zum größten Stadion Deutschlands heran (81.365 Plätze) und beheimatet mit 25.000 Stehplätzen auf der Südtribüne die größte Stehplatztribüne Europas.',
    highlights: ['WM-Stadion 1974', '25.000er Stehplatz-Südtribüne', '81.365 Fassungsvermögen'],
    trophy: 'Signal Iduna Park',
  },
  {
    year: '1989',
    era: 'Die Rückkehr zum Glanz',
    title: 'Der Held von Berlin',
    subtitle: '4:1 DFB-Pokalsieg gegen Werder Bremen',
    hero: 'Norbert Dickel',
    description: 'Nach 23 titellosen Jahren reist ganz Dortmund nach Berlin. Trotz schwerer Knieverletzung und Spritzen läuft Norbert Dickel auf, erzielt zwei Tore und wird für immer zum „Helden von Berlin“. 250.000 begeisterte Borussen feiern am Borsigplatz und auf dem Friedensplatz tagelang.',
    highlights: ['Dickel Doppelpack', 'Erster Titel nach 23 Jahren', 'Mill & Lusch Traumtore'],
    score: '4 : 1',
    opponent: 'SV Werder Bremen',
    trophy: 'DFB-Pokal',
  },
  {
    year: '1997',
    era: 'König von Europa',
    title: 'Champions League Sieg in München & Weltpokal',
    subtitle: '3:1 gegen Juventus Turin & Sieg in Tokio',
    hero: 'Lars Ricken & Karl-Heinz Riedle',
    description: '28. Mai 1997 im Münchener Olympiastadion: Karl-Heinz Riedle trifft doppelt, ehe der 20-jährige Dortmunder Junge Lars Ricken nach nur 16 Sekunden auf dem Platz Angelo Peruzzi mit einem 30-Meter-Jahrhundertlupfer bezwingt. Im Dezember 1997 folgt in Tokio der Weltpokalsieg gegen Cruzeiro Belo Horizonte (2:0)!',
    highlights: ['3:1 vs. Juventus Turin', 'Ricken Jahrhundert-Lupfer', 'Weltpokalsieger 1997'],
    score: '3 : 1',
    opponent: 'Juventus Turin',
    trophy: 'Champions League & Weltpokal',
  },
  {
    year: '2011/12',
    era: 'Klopps Vollgas-Fußball',
    title: 'Das historische Double & 81-Punkte-Rekord',
    subtitle: 'Meisterschaft & 5:2 Pokalfinale gegen Bayern München',
    hero: 'Jürgen Klopp & Robert Lewandowski',
    description: 'Jürgen Klopp formt eine junge, hungrige Truppe um Hummels, Götze, Sahin, Kagawa und Lewandowski, die Deutschland verzaubert. 2011 die jüngste Meisterelf der Geschichte, 2012 folgt das historische erste Double der Vereinsgeschichte mit einem berauschenden 5:2 im Berliner Pokalfinale gegen Bayern München.',
    highlights: ['81 Punkte Bundesliga-Rekord', '5:2 Pokal-Demontage der Bayern', 'Erstes Double der Vereinsgeschichte'],
    score: '5 : 2',
    opponent: 'FC Bayern München',
    trophy: 'Meisterschale & DFB-Pokal',
  },
  {
    year: '2013',
    era: 'Das Malaga-Wunder',
    title: '9. April 2013: 120 Sekunden für die Ewigkeit',
    subtitle: 'Reus (91.) und Santana (93.) drehen das Champions-League-Viertelfinale',
    hero: 'Felipe Santana & Marco Reus',
    description: 'In der 90. Minute liegt der BVB gegen den FC Malaga mit 1:2 hinten – das Ausscheiden scheint besiegelt. Doch in der Nachspielzeit geschieht das Unfassbare: Marco Reus gleicht in der 91. Minute aus. In der 93. Minute stochert Felipe Santana den Ball auf der Torlinie ins Netz. Der Signal Iduna Park explodiert vor kollektiver Ekstase!',
    highlights: ['Tore in Minute 91 & 93', 'Einzug ins Finale von Wembley', 'Größtes Comeback der CL-Geschichte'],
    score: '3 : 2',
    opponent: 'FC Málaga',
    trophy: 'Wembley Finalist 2013',
  },
  {
    year: '2021',
    era: 'Pokalsieg der Superstars',
    title: '4:1 DFB-Pokalsieg gegen RB Leipzig',
    subtitle: 'Sancho & Haaland Doppelpack in Berlin',
    hero: 'Jadon Sancho & Erling Haaland',
    description: 'Im Berliner Olympiastadion liefert Borussia Dortmund eine Gala-Vorstellung ab. Jadon Sancho und Erling Haaland schnüren jeweils einen Doppelpack und schießen Leipzig mit 4:1 ab. Kapitän Marco Reus und Lukasz Piszczek stemmen den Pott in den Berliner Nachthimmel.',
    highlights: ['Sancho & Haaland je 2 Tore', 'Piszczeks emotionaler Abschied', '5. DFB-Pokalsieg'],
    score: '4 : 1',
    opponent: 'RB Leipzig',
    trophy: 'DFB-Pokal 2021',
  },
];

// ============================================================================
// PITCH COORDINATE GEOMETRY (Attacking Left -> Right towards Goal at X=96):
// - TOP OF PITCH (y: 10% to 42%)    = LINKE AUSSENBAHN (Left Wing / Halbraum)
// - CENTER OF PITCH (y: 43% to 57%) = ZENTRUM (Central Axis)
// - BOTTOM OF PITCH (y: 58% to 90%) = RECHTE AUSSENBAHN (Right Wing / Halbraum)
// ============================================================================
export const GOAL_REENACTMENTS: GoalReenactment[] = [
  // 1. LARS RICKEN 1997
  {
    id: 'ricken_1997',
    shortLabel: '🏆 Ricken 1997 (Juve)',
    title: 'Lars Ricken 1997 (CL-Finale gegen Juventus Turin)',
    match: 'Champions League Finale 1997 • Olympiastadion München (3:1)',
    scorer: 'Lars Ricken (#18)',
    minute: '71. Spielminute (16 Sekunden nach Einwechslung)',
    famousQuote: '„Ricken... lupfen jetzt!... JAAAAA! Dreieins! 16 Sekunden auf dem Platz, Lars Ricken!“',
    commentator: 'Marcel Reif (Original-Kommentar 1997)',
    steps: [
      {
        stepNumber: 1,
        timeSec: '70:44',
        clockSec: 4244,
        playerAction: 'Lars Ricken ist erst seit wenigen Sekunden auf dem Platz und startet im rechten Halbraum durch, während Andy Möller im Mittelfeld den Ball erobert.',
        ballPos: { x: 42, y: 52, height: 0 },
        players: [
          { id: 'moeller', name: 'A. Möller', number: '10', x: 41, y: 52, hasBall: true, labelPos: 'bottom' },
          { id: 'ricken', name: 'L. Ricken', number: '18', x: 49, y: 66, labelPos: 'bottom' },
          { id: 'riedle', name: 'K.-H. Riedle', number: '13', x: 64, y: 32, labelPos: 'top' },
          { id: 'montero', name: 'Montero', number: '4', x: 61, y: 60, isOpponent: true, labelPos: 'top' },
          { id: 'iuliano', name: 'Iuliano', number: '13', x: 65, y: 38, isOpponent: true, labelPos: 'bottom' },
          { id: 'peruzzi', name: 'Peruzzi (TW)', number: '1', x: 83, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Ballgewinn im Mittelfeld durch Andy Möller... Ricken startet auf halbrechts tief!',
      },
      {
        stepNumber: 2,
        timeSec: '70:50',
        clockSec: 4250,
        playerAction: 'Andy Möller hebt den Kopf und spielt einen präzisen Steilpass durch die Schnittstelle genau in den rechten Halbraum in den Lauf von Ricken.',
        ballPos: { x: 61, y: 60, height: 0.2 },
        players: [
          { id: 'moeller', name: 'A. Möller', number: '10', x: 49, y: 53, labelPos: 'bottom' },
          { id: 'ricken', name: 'L. Ricken', number: '18', x: 62, y: 61, hasBall: true, labelPos: 'bottom' },
          { id: 'riedle', name: 'K.-H. Riedle', number: '13', x: 72, y: 34, labelPos: 'top' },
          { id: 'montero', name: 'Montero', number: '4', x: 58, y: 50, isOpponent: true, labelPos: 'top' },
          { id: 'iuliano', name: 'Iuliano', number: '13', x: 70, y: 42, isOpponent: true, labelPos: 'bottom' },
          { id: 'peruzzi', name: 'Peruzzi (TW)', number: '1', x: 85, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Traumpass von Möller in die Gasse! Ricken enteilt Montero auf der rechten Seite...',
      },
      {
        stepNumber: 3,
        timeSec: '70:56',
        clockSec: 4256,
        playerAction: 'Ricken sieht im Vollsprint, dass Juve-Torwart Angelo Peruzzi viel zu weit vor seinem Kasten steht, und setzt aus 28 Metern direkt zum Lupfer an!',
        ballPos: { x: 69, y: 58, height: 0.35 },
        players: [
          { id: 'moeller', name: 'A. Möller', number: '10', x: 55, y: 53, labelPos: 'bottom' },
          { id: 'ricken', name: 'L. Ricken', number: '18', x: 68, y: 59, hasBall: true, labelPos: 'bottom' },
          { id: 'riedle', name: 'K.-H. Riedle', number: '13', x: 77, y: 36, labelPos: 'top' },
          { id: 'montero', name: 'Montero', number: '4', x: 63, y: 51, isOpponent: true, labelPos: 'top' },
          { id: 'iuliano', name: 'Iuliano', number: '13', x: 75, y: 44, isOpponent: true, labelPos: 'bottom' },
          { id: 'peruzzi', name: 'Peruzzi (TW)', number: '1', x: 87, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Peruzzi steht viel zu weit draußen! Ricken... lupfen jetzt!',
      },
      {
        stepNumber: 4,
        timeSec: '71:00',
        clockSec: 4260,
        playerAction: 'Der 30-Meter-Bogenball segelt im hohen Bogen über den verzweifelt zurückeilenden Peruzzi hinweg unhaltbar unter die Latte ins Tor!',
        ballPos: { x: 96, y: 46, height: 0.95 },
        players: [
          { id: 'moeller', name: 'A. Möller', number: '10', x: 60, y: 53, labelPos: 'bottom' },
          { id: 'ricken', name: 'L. Ricken', number: '18', x: 73, y: 62, labelPos: 'bottom' },
          { id: 'riedle', name: 'K.-H. Riedle', number: '13', x: 82, y: 36, labelPos: 'top' },
          { id: 'montero', name: 'Montero', number: '4', x: 68, y: 52, isOpponent: true, labelPos: 'top' },
          { id: 'iuliano', name: 'Iuliano', number: '13', x: 79, y: 45, isOpponent: true, labelPos: 'bottom' },
          { id: 'peruzzi', name: 'Peruzzi (TW)', number: '1', x: 93, y: 52, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'JAAAAA! Dreieins! 16 Sekunden auf dem Platz, Lars Ricken! Borussia Dortmund ist Champions-League-Sieger!',
      },
    ],
  },

  // 2. FELIPE SANTANA 2013 (MALAGA)
  {
    id: 'santana_2013',
    shortLabel: '⚡ Santana 2013 (Málaga)',
    title: 'Felipe Santana 2013 (Das Wunder von Málaga, 93. Min)',
    match: 'Champions League Viertelfinale 2013 • Signal Iduna Park (3:2)',
    scorer: 'Felipe Santana (#27)',
    minute: '92:42 Spielminute (Nachspielzeit)',
    famousQuote: '„Santana!... TOR! TOR! Ich flippe aus! 3:2 für den BVB! Wir sind im Halbfinale!“',
    commentator: 'Norbert Dickel (BVB Netradio)',
    steps: [
      {
        stepNumber: 1,
        timeSec: '92:25',
        clockSec: 5545,
        playerAction: 'Alle Dortmunder inklusive der Innenverteidiger Subotic und Santana stürmen nach vorne. Robert Lewandowski schlägt aus dem rechten Halbfeld eine hohe Flanke in den Strafraum.',
        ballPos: { x: 64, y: 74, height: 0.4 },
        players: [
          { id: 'subotic', name: 'N. Subotic', number: '4', x: 54, y: 66, labelPos: 'bottom' },
          { id: 'lewandowski', name: 'Lewandowski', number: '9', x: 64, y: 75, hasBall: true, labelPos: 'bottom' },
          { id: 'schieber', name: 'J. Schieber', number: '23', x: 83, y: 34, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 81, y: 48, labelPos: 'top' },
          { id: 'santana', name: 'F. Santana', number: '27', x: 77, y: 60, labelPos: 'bottom' },
          { id: 'demichelis', name: 'Demichelis', number: '5', x: 85, y: 54, isOpponent: true, labelPos: 'bottom' },
          { id: 'caballero', name: 'Caballero (TW)', number: '13', x: 94, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Die allerletzte Sekunde läuft! Lewandowski flankt vom rechten Halbfeld hoch in den Sechzehner...',
      },
      {
        stepNumber: 2,
        timeSec: '92:32',
        clockSec: 5552,
        playerAction: 'Julian Schieber steigt links im Strafraum hoch und verlängert den Ball per Kopf quer ins Zentrum, wo Santana und Reus lauern.',
        ballPos: { x: 86, y: 36, height: 0.65 },
        players: [
          { id: 'subotic', name: 'N. Subotic', number: '4', x: 66, y: 62, labelPos: 'bottom' },
          { id: 'lewandowski', name: 'Lewandowski', number: '9', x: 74, y: 70, labelPos: 'bottom' },
          { id: 'schieber', name: 'J. Schieber', number: '23', x: 86, y: 35, hasBall: true, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 87, y: 47, labelPos: 'top' },
          { id: 'santana', name: 'F. Santana', number: '27', x: 88, y: 58, labelPos: 'bottom' },
          { id: 'demichelis', name: 'Demichelis', number: '5', x: 89, y: 42, isOpponent: true, labelPos: 'top' },
          { id: 'caballero', name: 'Caballero (TW)', number: '13', x: 94, y: 48, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Schieber gewinnt das Kopfballduell am linken Pfosten und legt quer vors Tor!',
      },
      {
        stepNumber: 3,
        timeSec: '92:37',
        clockSec: 5557,
        playerAction: 'Caballero wehrt den ersten Versuch im Fünfmeterraum ab, doch Marco Reus reagiert blitzschnell und bringt den Abpraller scharf vor die Torlinie!',
        ballPos: { x: 90, y: 45, height: 0.1 },
        players: [
          { id: 'subotic', name: 'N. Subotic', number: '4', x: 73, y: 58, labelPos: 'bottom' },
          { id: 'lewandowski', name: 'Lewandowski', number: '9', x: 79, y: 66, labelPos: 'bottom' },
          { id: 'schieber', name: 'J. Schieber', number: '23', x: 88, y: 32, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 90, y: 44, hasBall: true, labelPos: 'top' },
          { id: 'santana', name: 'F. Santana', number: '27', x: 93, y: 54, labelPos: 'bottom' },
          { id: 'demichelis', name: 'Demichelis', number: '5', x: 91, y: 38, isOpponent: true, labelPos: 'top' },
          { id: 'caballero', name: 'Caballero (TW)', number: '13', x: 94, y: 46, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Caballero wehrt kurz ab... Reus setzt nach und spitzelt die Kugel zur Torlinie!',
      },
      {
        stepNumber: 4,
        timeSec: '92:42',
        clockSec: 5562,
        playerAction: 'Felipe Santana drückt den Ball aus 20 Zentimetern über die Linie ins Netz! 3:2! Das gesamte Westfalenstadion explodiert!',
        ballPos: { x: 96, y: 51, height: 0.1 },
        players: [
          { id: 'subotic', name: 'N. Subotic', number: '4', x: 77, y: 56, labelPos: 'bottom' },
          { id: 'lewandowski', name: 'Lewandowski', number: '9', x: 82, y: 64, labelPos: 'bottom' },
          { id: 'schieber', name: 'J. Schieber', number: '23', x: 89, y: 33, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 91, y: 44, labelPos: 'top' },
          { id: 'santana', name: 'F. Santana', number: '27', x: 95, y: 52, hasBall: true, labelPos: 'bottom' },
          { id: 'demichelis', name: 'Demichelis', number: '5', x: 92, y: 38, isOpponent: true, labelPos: 'top' },
          { id: 'caballero', name: 'Caballero (TW)', number: '13', x: 94, y: 45, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'SANTANA! TOR! TOR! TOR! 3:2 FÜR DEN BVB! ICH FLIPPE AUS! WIR SIND IM HALBFINALE!',
      },
    ],
  },

  // 3. NORBERT DICKEL 1989 (BERLIN VS BREMEN - RECHTE AUSSENBAHN UNTEN!)
  {
    id: 'dickel_1989',
    shortLabel: '💛 Dickel 1989 (Berlin)',
    title: 'Norbert Dickel 1989 (Pokalfinale vs. Werder Bremen)',
    match: 'DFB-Pokalfinale 1989 • Olympiastadion Berlin (4:1)',
    scorer: 'Norbert Dickel (#9)',
    minute: '73. Spielminute (Vorentscheidung zum 3:1)',
    famousQuote: '„Dicki, Dicki, Dicki! Norbert Dickel hämmert den Ball unter die Latte!“',
    commentator: 'WDR Hörfunk Berlin 1989',
    steps: [
      {
        stepNumber: 1,
        timeSec: '72:40',
        clockSec: 4360,
        playerAction: 'Michael Rummenigge treibt den Ball durch das Mittelfeld und schickt Frank Mill rechts außen (untere Seitenlinie) steil auf die Reise.',
        ballPos: { x: 54, y: 62, height: 0 },
        players: [
          { id: 'rummenigge', name: 'M. Rummenigge', number: '8', x: 53, y: 62, hasBall: true, labelPos: 'top' },
          { id: 'mill', name: 'F. Mill', number: '11', x: 66, y: 80, labelPos: 'bottom' },
          { id: 'dickel', name: 'N. Dickel', number: '9', x: 67, y: 44, labelPos: 'top' },
          { id: 'bratseth', name: 'R. Bratseth', number: '4', x: 74, y: 54, isOpponent: true, labelPos: 'bottom' },
          { id: 'reck', name: 'O. Reck (TW)', number: '1', x: 93, y: 50, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Rummenigge mit perfekter Übersicht auf die rechte Außenbahn zu Frank Mill...',
      },
      {
        stepNumber: 2,
        timeSec: '72:47',
        clockSec: 4367,
        playerAction: 'Frank Mill sprintet die rechte Außenbahn (unten) entlang Richtung Grundlinie, während sich Norbert Dickel im Zentrum von Rune Bratseth absetzt.',
        ballPos: { x: 78, y: 82, height: 0.1 },
        players: [
          { id: 'rummenigge', name: 'M. Rummenigge', number: '8', x: 64, y: 60, labelPos: 'top' },
          { id: 'mill', name: 'F. Mill', number: '11', x: 78, y: 82, hasBall: true, labelPos: 'bottom' },
          { id: 'dickel', name: 'N. Dickel', number: '9', x: 78, y: 42, labelPos: 'top' },
          { id: 'bratseth', name: 'R. Bratseth', number: '4', x: 82, y: 55, isOpponent: true, labelPos: 'bottom' },
          { id: 'reck', name: 'O. Reck (TW)', number: '1', x: 93, y: 52, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Mill zieht auf der rechten Außenbahn davon... im Zentrum lauert Norbert Dickel!',
      },
      {
        stepNumber: 3,
        timeSec: '72:53',
        clockSec: 4373,
        playerAction: 'Mill schlägt von rechts außen eine butterweiche Flanke nach innen an den Elfmeterpunkt. Dickel nimmt trotz Knieverletzung voll Maß!',
        ballPos: { x: 85, y: 45, height: 0.65 },
        players: [
          { id: 'rummenigge', name: 'M. Rummenigge', number: '8', x: 71, y: 58, labelPos: 'bottom' },
          { id: 'mill', name: 'F. Mill', number: '11', x: 85, y: 78, labelPos: 'bottom' },
          { id: 'dickel', name: 'N. Dickel', number: '9', x: 84, y: 44, hasBall: true, labelPos: 'top' },
          { id: 'bratseth', name: 'R. Bratseth', number: '4', x: 87, y: 56, isOpponent: true, labelPos: 'bottom' },
          { id: 'reck', name: 'O. Reck (TW)', number: '1', x: 93, y: 50, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Die Flanke von rechts kommt punktgenau auf Dickel... er nimmt ihn direkt volley!',
      },
      {
        stepNumber: 4,
        timeSec: '72:58',
        clockSec: 4378,
        playerAction: 'BUMM! Dickel schweißt den Ball volley unhaltbar für Oliver Reck zum 3:1 unter die Latte! Der Held von Berlin macht den Pokalsieg perfekt!',
        ballPos: { x: 96, y: 47, height: 0.55 },
        players: [
          { id: 'rummenigge', name: 'M. Rummenigge', number: '8', x: 75, y: 57, labelPos: 'bottom' },
          { id: 'mill', name: 'F. Mill', number: '11', x: 87, y: 75, labelPos: 'bottom' },
          { id: 'dickel', name: 'N. Dickel', number: '9', x: 88, y: 44, labelPos: 'top' },
          { id: 'bratseth', name: 'R. Bratseth', number: '4', x: 89, y: 56, isOpponent: true, labelPos: 'bottom' },
          { id: 'reck', name: 'O. Reck (TW)', number: '1', x: 94, y: 52, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'TOOOOOR! 3:1! Norbert Dickel hämmert ihn rein! Nach 23 Jahren holt der BVB wieder den Pott!',
      },
    ],
  },

  // 4. STAN LIBUDA 1966 (GLASGOW VS LIVERPOOL)
  {
    id: 'libuda_1966',
    shortLabel: '🌧️ Libuda 1966 (Glasgow)',
    title: 'Reinhard „Stan“ Libuda 1966 (Europapokal-Finale vs. Liverpool)',
    match: 'Europapokal der Pokalsieger 1966 • Hampden Park Glasgow (2:1 n.V.)',
    scorer: 'Reinhard „Stan“ Libuda (#7)',
    minute: '107. Spielminute (Verlängerung)',
    famousQuote: '„Libuda schießt aus 30 Metern... an die Latte... und DRIN! Tor für Dortmund!“',
    commentator: 'Ernst Huberty (ARD-Sportschau 1966)',
    steps: [
      {
        stepNumber: 1,
        timeSec: '106:38',
        clockSec: 6398,
        playerAction: 'In der Verlängerung im regennassen Glasgow stürmt Siggi Held über halblinks auf das Tor von Liverpool zu, während Stan Libuda rechts mitläuft.',
        ballPos: { x: 68, y: 34, height: 0 },
        players: [
          { id: 'held', name: 'S. Held', number: '10', x: 67, y: 34, hasBall: true, labelPos: 'top' },
          { id: 'libuda', name: 'Stan Libuda', number: '7', x: 62, y: 68, labelPos: 'bottom' },
          { id: 'emmerich', name: 'L. Emmerich', number: '11', x: 75, y: 24, labelPos: 'top' },
          { id: 'yeats', name: 'R. Yeats', number: '5', x: 76, y: 42, isOpponent: true, labelPos: 'bottom' },
          { id: 'lawrence', name: 'Lawrence (TW)', number: '1', x: 91, y: 46, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Verlängerung im Hampden Park... Siggi Held bricht auf halblinks durch!',
      },
      {
        stepNumber: 2,
        timeSec: '106:44',
        clockSec: 6404,
        playerAction: 'Liverpools Keeper Tommy Lawrence stürzt aus dem Tor und wehrt den Schuss von Siggi Held ab – der Abpraller springt weit nach halbrechts heraus.',
        ballPos: { x: 73, y: 64, height: 0.3 },
        players: [
          { id: 'held', name: 'S. Held', number: '10', x: 78, y: 36, labelPos: 'top' },
          { id: 'libuda', name: 'Stan Libuda', number: '7', x: 71, y: 66, hasBall: true, labelPos: 'bottom' },
          { id: 'emmerich', name: 'L. Emmerich', number: '11', x: 80, y: 26, labelPos: 'top' },
          { id: 'yeats', name: 'R. Yeats', number: '5', x: 82, y: 48, isOpponent: true, labelPos: 'top' },
          { id: 'lawrence', name: 'Lawrence (TW)', number: '1', x: 86, y: 42, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Lawrence pariert gegen Held! Aber der Ball springt halbrechts vor die Füße von Stan Libuda...',
      },
      {
        stepNumber: 3,
        timeSec: '106:49',
        clockSec: 6409,
        playerAction: 'Reinhard „Stan“ Libuda fackelt nicht lange und zieht aus fast 30 Metern auf der rechten Seite direkt im hohen Bogen auf das verwaiste Tor ab!',
        ballPos: { x: 84, y: 58, height: 0.9 },
        players: [
          { id: 'held', name: 'S. Held', number: '10', x: 81, y: 36, labelPos: 'top' },
          { id: 'libuda', name: 'Stan Libuda', number: '7', x: 73, y: 66, labelPos: 'bottom' },
          { id: 'emmerich', name: 'L. Emmerich', number: '11', x: 83, y: 28, labelPos: 'top' },
          { id: 'yeats', name: 'R. Yeats', number: '5', x: 88, y: 52, isOpponent: true, labelPos: 'bottom' },
          { id: 'lawrence', name: 'Lawrence (TW)', number: '1', x: 90, y: 45, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Libuda zieht aus der Distanz direkt ab... eine riesige Bogenlampe Richtung Tor!',
      },
      {
        stepNumber: 4,
        timeSec: '106:54',
        clockSec: 6414,
        playerAction: 'Der Ball klatscht an den linken Innenpfosten/Latte, prallt von Verteidiger Yeats ins Netz! Der BVB ist der erste deutsche Europapokalsieger!',
        ballPos: { x: 96, y: 48, height: 0.6 },
        players: [
          { id: 'held', name: 'S. Held', number: '10', x: 85, y: 38, labelPos: 'top' },
          { id: 'libuda', name: 'Stan Libuda', number: '7', x: 76, y: 64, labelPos: 'bottom' },
          { id: 'emmerich', name: 'L. Emmerich', number: '11', x: 86, y: 30, labelPos: 'top' },
          { id: 'yeats', name: 'R. Yeats', number: '5', x: 94, y: 52, isOpponent: true, labelPos: 'bottom' },
          { id: 'lawrence', name: 'Lawrence (TW)', number: '1', x: 93, y: 44, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'DRIN! TOR FÜR DORTMUND! 2:1! Borussia Dortmund gewinnt den Europapokal in Glasgow!',
      },
    ],
  },

  // 5. ROBERT LEWANDOWSKI 2012 (POKALFINALE 5:2 VS BAYERN)
  {
    id: 'lewandowski_2012',
    shortLabel: '🔥 Lewy 2012 (5:2 Bayern)',
    title: 'Robert Lewandowski 2012 (Pokalfinale 5:2 vs. FC Bayern)',
    match: 'DFB-Pokalfinale 2012 • Olympiastadion Berlin (Double-Krönung)',
    scorer: 'Robert Lewandowski (#9)',
    minute: '45.+1 Spielminute (Das 3:1 vor der Pause)',
    famousQuote: '„Kagawa... Großkreutz... Lewandowski! 3:1! Die Bayern werden hier vorgeführt!“',
    commentator: 'Béla Réthy (ZDF-Livekommentar 2012)',
    steps: [
      {
        stepNumber: 1,
        timeSec: '45:05',
        clockSec: 2705,
        playerAction: 'Gegenpressing in Perfektion: İlkay Gündoğan und Shinji Kagawa erobern den Ball im Zentrum und schalten blitzschnell den Turbo ein.',
        ballPos: { x: 52, y: 48, height: 0 },
        players: [
          { id: 'guendogan', name: 'İ. Gündoğan', number: '21', x: 51, y: 48, hasBall: true, labelPos: 'bottom' },
          { id: 'kagawa', name: 'S. Kagawa', number: '23', x: 62, y: 44, labelPos: 'top' },
          { id: 'grosskreutz', name: 'Großkreutz', number: '19', x: 66, y: 26, labelPos: 'top' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 71, y: 58, labelPos: 'bottom' },
          { id: 'boateng', name: 'J. Boateng', number: '17', x: 74, y: 49, isOpponent: true, labelPos: 'top' },
          { id: 'neuer', name: 'M. Neuer (TW)', number: '1', x: 93, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Wieder Ballgewinn BVB! Gündoğan spielt sofort steil auf Shinji Kagawa...',
      },
      {
        stepNumber: 2,
        timeSec: '45:10',
        clockSec: 2710,
        playerAction: 'Shinji Kagawa dreht sich geschmeidig um die eigene Achse und nimmt Kevin Großkreutz auf der halblinken Seite mit.',
        ballPos: { x: 70, y: 36, height: 0.1 },
        players: [
          { id: 'guendogan', name: 'İ. Gündoğan', number: '21', x: 58, y: 49, labelPos: 'bottom' },
          { id: 'kagawa', name: 'S. Kagawa', number: '23', x: 68, y: 45, labelPos: 'bottom' },
          { id: 'grosskreutz', name: 'Großkreutz', number: '19', x: 72, y: 34, hasBall: true, labelPos: 'top' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 79, y: 56, labelPos: 'bottom' },
          { id: 'boateng', name: 'J. Boateng', number: '17', x: 78, y: 46, isOpponent: true, labelPos: 'top' },
          { id: 'neuer', name: 'M. Neuer (TW)', number: '1', x: 92, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Kagawa auf Großkreutz... und rechts im Strafraum startet Lewandowski!',
      },
      {
        stepNumber: 3,
        timeSec: '45:14',
        clockSec: 2714,
        playerAction: 'Großkreutz spitzelt den Ball per Direktpass quer durch den Sechzehner genau in den Lauf von Robert Lewandowski auf halbrechts.',
        ballPos: { x: 84, y: 55, height: 0.1 },
        players: [
          { id: 'guendogan', name: 'İ. Gündoğan', number: '21', x: 64, y: 50, labelPos: 'bottom' },
          { id: 'kagawa', name: 'S. Kagawa', number: '23', x: 74, y: 44, labelPos: 'top' },
          { id: 'grosskreutz', name: 'Großkreutz', number: '19', x: 77, y: 34, labelPos: 'top' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 85, y: 55, hasBall: true, labelPos: 'bottom' },
          { id: 'boateng', name: 'J. Boateng', number: '17', x: 83, y: 46, isOpponent: true, labelPos: 'top' },
          { id: 'neuer', name: 'M. Neuer (TW)', number: '1', x: 91, y: 52, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'Perfekt durchgesteckt! Lewandowski steht frei vor Manuel Neuer!',
      },
      {
        stepNumber: 4,
        timeSec: '45:18',
        clockSec: 2718,
        playerAction: 'Lewandowski bleibt eiskalt und schiebt den Ball durch die Hosenträger von Manuel Neuer ins Netz! 3:1 auf dem Weg zum historischen 5:2-Double!',
        ballPos: { x: 96, y: 50, height: 0.1 },
        players: [
          { id: 'guendogan', name: 'İ. Gündoğan', number: '21', x: 68, y: 50, labelPos: 'bottom' },
          { id: 'kagawa', name: 'S. Kagawa', number: '23', x: 77, y: 44, labelPos: 'top' },
          { id: 'grosskreutz', name: 'Großkreutz', number: '19', x: 80, y: 34, labelPos: 'top' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 89, y: 56, labelPos: 'bottom' },
          { id: 'boateng', name: 'J. Boateng', number: '17', x: 86, y: 46, isOpponent: true, labelPos: 'top' },
          { id: 'neuer', name: 'M. Neuer (TW)', number: '1', x: 92, y: 51, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'TOOOOOR! 3:1 FÜR DORTMUND! Lewandowski schickt den BVB ins Double-Paradies!',
      },
    ],
  },

  // 6. ROBERT LEWANDOWSKI 2013 (4:1 VS REAL MADRID)
  {
    id: 'lewandowski_real_2013',
    shortLabel: '👑 Lewy 2013 (4:1 Real)',
    title: 'Robert Lewandowski 2013 (4-Tore-Gala vs. Real Madrid)',
    match: 'Champions League Halbfinale 2013 • Signal Iduna Park (4:1)',
    scorer: 'Robert Lewandowski (#9)',
    minute: '55. Spielminute (Die legendäre Sohlen-Drehung zum 3:1)',
    famousQuote: '„Was für eine Bewegung von Lewandowski! Unter die Latte! 3:1 gegen Real Madrid!“',
    commentator: 'Wolff-Christoph Fuss (Sky-Livekommentar 2013)',
    steps: [
      {
        stepNumber: 1,
        timeSec: '54:42',
        clockSec: 3282,
        playerAction: 'Marcel Schmelzer rückt über die linke Außenbahn (oben) weit mit auf und bekommt das Zuspiel von Marco Reus.',
        ballPos: { x: 66, y: 24, height: 0 },
        players: [
          { id: 'schmelzer', name: 'M. Schmelzer', number: '29', x: 66, y: 23, hasBall: true, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 62, y: 42, labelPos: 'bottom' },
          { id: 'goetze', name: 'M. Götze', number: '10', x: 72, y: 66, labelPos: 'bottom' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 82, y: 48, labelPos: 'top' },
          { id: 'pepe', name: 'Pepe', number: '3', x: 84, y: 55, isOpponent: true, labelPos: 'bottom' },
          { id: 'lopez', name: 'D. López (TW)', number: '41', x: 94, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Schmelzer mit viel Platz auf der linken Seite vor der Strafraumkante...',
      },
      {
        stepNumber: 2,
        timeSec: '54:47',
        clockSec: 3287,
        playerAction: 'Schmelzer zieht von halblinks flach ab – der Schuss gerät zum scharfen Zuspiel direkt an den Elfmeterpunkt zu Robert Lewandowski.',
        ballPos: { x: 83, y: 47, height: 0.1 },
        players: [
          { id: 'schmelzer', name: 'M. Schmelzer', number: '29', x: 74, y: 26, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 72, y: 42, labelPos: 'top' },
          { id: 'goetze', name: 'M. Götze', number: '10', x: 79, y: 64, labelPos: 'bottom' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 83, y: 47, hasBall: true, labelPos: 'top' },
          { id: 'pepe', name: 'Pepe', number: '3', x: 85, y: 54, isOpponent: true, labelPos: 'bottom' },
          { id: 'lopez', name: 'D. López (TW)', number: '41', x: 94, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Schmelzer bringt den Ball flach rein... Lewandowski nimmt ihn mit dem Rücken zum Tor an!',
      },
      {
        stepNumber: 3,
        timeSec: '54:51',
        clockSec: 3291,
        playerAction: 'Weltklasse-Technik: Lewandowski zieht den Ball mit der Fußsohle in einer flüssigen 180-Grad-Pirouette an Real-Verteidiger Pepe vorbei!',
        ballPos: { x: 87, y: 44, height: 0.15 },
        players: [
          { id: 'schmelzer', name: 'M. Schmelzer', number: '29', x: 76, y: 28, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 76, y: 43, labelPos: 'top' },
          { id: 'goetze', name: 'M. Götze', number: '10', x: 82, y: 62, labelPos: 'bottom' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 87, y: 44, hasBall: true, labelPos: 'top' },
          { id: 'pepe', name: 'Pepe', number: '3', x: 84, y: 56, isOpponent: true, labelPos: 'bottom' },
          { id: 'lopez', name: 'D. López (TW)', number: '41', x: 94, y: 49, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Was für eine Drehung mit der Sohle! Pepe weiß gar nicht, wo der Ball ist!',
      },
      {
        stepNumber: 4,
        timeSec: '54:55',
        clockSec: 3295,
        playerAction: 'Aus 9 Metern hämmert Lewandowski das Leder mit voller Wucht unhaltbar unter das Lattenkreuz! Sein drittes von vier Toren an diesem magischen Abend!',
        ballPos: { x: 96, y: 47, height: 0.85 },
        players: [
          { id: 'schmelzer', name: 'M. Schmelzer', number: '29', x: 78, y: 30, labelPos: 'top' },
          { id: 'reus', name: 'M. Reus', number: '11', x: 79, y: 44, labelPos: 'top' },
          { id: 'goetze', name: 'M. Götze', number: '10', x: 84, y: 60, labelPos: 'bottom' },
          { id: 'lewy', name: 'Lewandowski', number: '9', x: 89, y: 44, labelPos: 'top' },
          { id: 'pepe', name: 'Pepe', number: '3', x: 86, y: 56, isOpponent: true, labelPos: 'bottom' },
          { id: 'lopez', name: 'D. López (TW)', number: '41', x: 94, y: 51, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'UNTER DIE LATTE! 3:1! Robert Lewandowski zerlegt das Königliche Ballett im Alleingang!',
      },
    ],
  },

  // 7. ERLING HAALAND 2021 (POKALFINALE VS LEIPZIG)
  {
    id: 'haaland_2021',
    shortLabel: '🚀 Haaland 2021 (Pokal)',
    title: 'Erling Haaland 2021 (Urgewalt-Solo im Pokalfinale vs. Leipzig)',
    match: 'DFB-Pokalfinale 2021 • Olympiastadion Berlin (4:1)',
    scorer: 'Erling Haaland (#9)',
    minute: '28. Spielminute (Das 2:0 nach Power-Solo)',
    famousQuote: '„Haaland gegen Upamecano... Upamecano prallt ab wie an einer Felswand! Und dann links unten rein!“',
    commentator: 'ARD-Livekommentar Pokalfinale 2021',
    steps: [
      {
        stepNumber: 1,
        timeSec: '27:42',
        clockSec: 1662,
        playerAction: 'Marco Reus erobert im Mittelfeld den Ball und bedient Erling Haaland, der sofort mit riesigen Schritten durchs Zentrum bis auf halbrechts anzieht.',
        ballPos: { x: 48, y: 54, height: 0 },
        players: [
          { id: 'reus', name: 'M. Reus', number: '11', x: 46, y: 52, hasBall: true, labelPos: 'top' },
          { id: 'haaland', name: 'E. Haaland', number: '9', x: 56, y: 60, labelPos: 'bottom' },
          { id: 'sancho', name: 'J. Sancho', number: '7', x: 60, y: 28, labelPos: 'top' },
          { id: 'upamecano', name: 'Upamecano', number: '5', x: 64, y: 54, isOpponent: true, labelPos: 'top' },
          { id: 'gulacsi', name: 'Gulácsi (TW)', number: '1', x: 93, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Umschaltmoment für den BVB! Marco Reus schickt Erling Haaland ins Laufduell...',
      },
      {
        stepNumber: 2,
        timeSec: '27:48',
        clockSec: 1668,
        playerAction: 'Dayot Upamecano versucht Haaland im Vollsprint mit der Schulter abelaufen – und prallt an der norwegischen Naturgewalt einfach ab!',
        ballPos: { x: 72, y: 60, height: 0 },
        players: [
          { id: 'reus', name: 'M. Reus', number: '11', x: 60, y: 50, labelPos: 'top' },
          { id: 'haaland', name: 'E. Haaland', number: '9', x: 72, y: 60, hasBall: true, labelPos: 'bottom' },
          { id: 'sancho', name: 'J. Sancho', number: '7', x: 74, y: 30, labelPos: 'top' },
          { id: 'upamecano', name: 'Upamecano', number: '5', x: 68, y: 48, isOpponent: true, labelPos: 'top' },
          { id: 'gulacsi', name: 'Gulácsi (TW)', number: '1', x: 92, y: 51, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Zweikampf der Giganten: Haaland schüttelt Upamecano ab wie ein lästiges Insekt!',
      },
      {
        stepNumber: 3,
        timeSec: '27:52',
        clockSec: 1672,
        playerAction: 'Haaland zieht an der Strafraumkante von halbrechts nach innen und legt sich den Ball auf seinen starken linken Fuß.',
        ballPos: { x: 82, y: 53, height: 0.1 },
        players: [
          { id: 'reus', name: 'M. Reus', number: '11', x: 69, y: 49, labelPos: 'top' },
          { id: 'haaland', name: 'E. Haaland', number: '9', x: 82, y: 53, hasBall: true, labelPos: 'bottom' },
          { id: 'sancho', name: 'J. Sancho', number: '7', x: 81, y: 32, labelPos: 'top' },
          { id: 'upamecano', name: 'Upamecano', number: '5', x: 74, y: 46, isOpponent: true, labelPos: 'top' },
          { id: 'gulacsi', name: 'Gulácsi (TW)', number: '1', x: 92, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Haaland zieht nach innen auf den linken Fuß... freie Schussbahn!',
      },
      {
        stepNumber: 4,
        timeSec: '27:56',
        clockSec: 1676,
        playerAction: 'Mit links zirkelt Haaland den Ball flach und unhaltbar gegen die Laufrichtung von Péter Gulácsi ins linke untere Eck! 2:0!',
        ballPos: { x: 96, y: 43, height: 0.15 },
        players: [
          { id: 'reus', name: 'M. Reus', number: '11', x: 74, y: 48, labelPos: 'top' },
          { id: 'haaland', name: 'E. Haaland', number: '9', x: 85, y: 52, labelPos: 'bottom' },
          { id: 'sancho', name: 'J. Sancho', number: '7', x: 84, y: 33, labelPos: 'top' },
          { id: 'upamecano', name: 'Upamecano', number: '5', x: 78, y: 46, isOpponent: true, labelPos: 'top' },
          { id: 'gulacsi', name: 'Gulácsi (TW)', number: '1', x: 93, y: 54, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'TOOOOOR! Erling Haaland mit purer Urgewalt zum 2:0 im Pokalfinale!',
      },
    ],
  },

  // 8. KONSTANTINOS KARETSAS 2026 (CL-SIEGTOR VS REAL BETIS)
  {
    id: 'karetsas_2026',
    shortLabel: '⭐ Karetsas 2026 (Betis)',
    title: 'Konstantinos Karetsas 2026 (CL-Siegtor vs. Real Betis)',
    match: 'Champions League 2026/27 • Signal Iduna Park (2:1)',
    scorer: 'Konstantinos Karetsas (#19)',
    minute: '72. Spielminute (Traumschlenzer vor der Südtribüne)',
    famousQuote: '„Bellingham auf Karetsas... er zieht nach innen... WAS FÜR EIN STRAHL IN DEN WINKEL! 2:1!“',
    commentator: 'BVB Netradio Live (November 2026)',
    steps: [
      {
        stepNumber: 1,
        timeSec: '71:36',
        clockSec: 4296,
        playerAction: 'Jobe Bellingham erobert im zentralen Mittelfeld dynamisch den Ball und treibt das Spiel vor der Gelben Wand kraftvoll nach vorne.',
        ballPos: { x: 48, y: 50, height: 0 },
        players: [
          { id: 'bellingham', name: 'J. Bellingham', number: '7', x: 47, y: 50, hasBall: true, labelPos: 'top' },
          { id: 'karetsas', name: 'K. Karetsas', number: '19', x: 64, y: 74, labelPos: 'bottom' },
          { id: 'guirassy', name: 'S. Guirassy', number: '9', x: 76, y: 48, labelPos: 'top' },
          { id: 'silva', name: 'Fábio Silva', number: '21', x: 72, y: 26, labelPos: 'top' },
          { id: 'bartra', name: 'M. Bartra', number: '5', x: 77, y: 58, isOpponent: true, labelPos: 'bottom' },
          { id: 'silva_tw', name: 'Rui Silva (TW)', number: '13', x: 93, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Starker Ballgewinn von Jobe Bellingham im Zentrum! Rechts winkt Karetsas...',
      },
      {
        stepNumber: 2,
        timeSec: '71:42',
        clockSec: 4302,
        playerAction: 'Bellingham spielt das Leder scharf nach rechts außen (unten) auf den 18-jährigen Neuzugang Konstantinos Karetsas, während Guirassy zwei Verteidiger bindet.',
        ballPos: { x: 73, y: 72, height: 0.1 },
        players: [
          { id: 'bellingham', name: 'J. Bellingham', number: '7', x: 59, y: 52, labelPos: 'top' },
          { id: 'karetsas', name: 'K. Karetsas', number: '19', x: 73, y: 72, hasBall: true, labelPos: 'bottom' },
          { id: 'guirassy', name: 'S. Guirassy', number: '9', x: 83, y: 49, labelPos: 'top' },
          { id: 'silva', name: 'Fábio Silva', number: '21', x: 80, y: 28, labelPos: 'top' },
          { id: 'bartra', name: 'M. Bartra', number: '5', x: 80, y: 62, isOpponent: true, labelPos: 'bottom' },
          { id: 'silva_tw', name: 'Rui Silva (TW)', number: '13', x: 93, y: 51, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Karetsas hat den Ball auf der rechten Seite... er geht ins Eins-gegen-Eins!',
      },
      {
        stepNumber: 3,
        timeSec: '71:47',
        clockSec: 4307,
        playerAction: 'Karetsas lässt Ex-Borusse Marc Bartra mit einem schnellen Haken stehen, zieht von rechts an die Strafraumkante nach innen auf seinen starken linken Fuß.',
        ballPos: { x: 79, y: 58, height: 0.15 },
        players: [
          { id: 'bellingham', name: 'J. Bellingham', number: '7', x: 66, y: 52, labelPos: 'top' },
          { id: 'karetsas', name: 'K. Karetsas', number: '19', x: 79, y: 58, hasBall: true, labelPos: 'bottom' },
          { id: 'guirassy', name: 'S. Guirassy', number: '9', x: 86, y: 46, labelPos: 'top' },
          { id: 'silva', name: 'Fábio Silva', number: '21', x: 84, y: 29, labelPos: 'top' },
          { id: 'bartra', name: 'M. Bartra', number: '5', x: 82, y: 68, isOpponent: true, labelPos: 'bottom' },
          { id: 'silva_tw', name: 'Rui Silva (TW)', number: '13', x: 93, y: 50, isOpponent: true, isKeeper: true, labelPos: 'bottom' },
        ],
        commentary: 'Traumhafter Haken nach innen von Karetsas... er legt sich den Ball auf links!',
      },
      {
        stepNumber: 4,
        timeSec: '71:52',
        clockSec: 4312,
        playerAction: 'Aus 19 Metern schlenzt Karetsas den Ball mit dem linken Innenrist unhaltbar ins lange obere linke Kreuzeck! 2:1-Siegtor für den BVB!',
        ballPos: { x: 96, y: 42, height: 0.85 },
        players: [
          { id: 'bellingham', name: 'J. Bellingham', number: '7', x: 70, y: 51, labelPos: 'top' },
          { id: 'karetsas', name: 'K. Karetsas', number: '19', x: 82, y: 56, labelPos: 'bottom' },
          { id: 'guirassy', name: 'S. Guirassy', number: '9', x: 88, y: 47, labelPos: 'top' },
          { id: 'silva', name: 'Fábio Silva', number: '21', x: 86, y: 31, labelPos: 'top' },
          { id: 'bartra', name: 'M. Bartra', number: '5', x: 84, y: 66, isOpponent: true, labelPos: 'bottom' },
          { id: 'silva_tw', name: 'Rui Silva (TW)', number: '13', x: 94, y: 45, isOpponent: true, isKeeper: true, labelPos: 'top' },
        ],
        commentary: 'IN DEN WINKEL! 2:1! Konstantinos Karetsas lässt die Südtribüne explodieren!',
      },
    ],
  },
];

// Smooth easing helper
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function BvbTimeMachineTab() {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone>(BVB_MILESTONES[0]);
  const [activeReenactmentId, setActiveReenactmentId] = useState<string>('ricken_1997');

  // Continuous playback timeline progress: 0.0 to (steps.length - 1)
  const [timelinePos, setTimelinePos] = useState<number>(0);
  const [targetStep, setTargetStep] = useState<number | null>(null);
  const [isPlayingFull, setIsPlayingFull] = useState<boolean>(false);
  const [showGoalCelebration, setShowGoalCelebration] = useState<boolean>(false);
  const [showTacticalTrails, setShowTacticalTrails] = useState<boolean>(true);

  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const goalSoundPlayedRef = useRef<boolean>(false);

  const activeReenactment = GOAL_REENACTMENTS.find((r) => r.id === activeReenactmentId) || GOAL_REENACTMENTS[0];
  const maxStepIndex = activeReenactment.steps.length - 1;

  // 60-FPS Animation Loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlayingFull && targetStep === null) {
      lastTimestampRef.current = null;
      return;
    }

    const stepSpeedPerSecond = 0.42; // ~2.4 seconds per tactical phase -> smooth, realistic running speed

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setTimelinePos((prev) => {
        const destination = isPlayingFull ? maxStepIndex : (targetStep ?? prev);
        if (prev >= destination) {
          if (destination >= maxStepIndex && !goalSoundPlayedRef.current) {
            goalSoundPlayedRef.current = true;
            playStadiumCheerSound();
            playBVBSoundTrack('goal');
            setShowGoalCelebration(true);
          }
          setIsPlayingFull(false);
          setTargetStep(null);
          return destination;
        }

        const next = Math.min(destination, prev + deltaSec * stepSpeedPerSecond);
        if (next >= maxStepIndex && !goalSoundPlayedRef.current) {
          goalSoundPlayedRef.current = true;
          playStadiumCheerSound();
          playBVBSoundTrack('goal');
          setShowGoalCelebration(true);
          setIsPlayingFull(false);
          setTargetStep(null);
          return maxStepIndex;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlayingFull, targetStep, maxStepIndex]);

  // Calculate current interpolated positions between Step A and Step B
  const lowerIdx = Math.min(maxStepIndex, Math.floor(timelinePos));
  const upperIdx = Math.min(maxStepIndex, Math.ceil(timelinePos));
  const rawFraction = timelinePos - lowerIdx;
  const smoothFraction = easeInOutQuad(rawFraction);

  const stepA = activeReenactment.steps[lowerIdx];
  const stepB = activeReenactment.steps[upperIdx];

  // Active step for commentary display
  const activeStepDisplay = rawFraction > 0.55 ? stepB : stepA;
  const isMoving = isPlayingFull || targetStep !== null;

  // Interpolated Clock
  const interpolatedClockSec =
    stepA.clockSec + (stepB.clockSec - stepA.clockSec) * rawFraction;

  // Interpolated Ball Position + Parabolic Arc on Shots/Crosses
  const ballX = stepA.ballPos.x + (stepB.ballPos.x - stepA.ballPos.x) * smoothFraction;
  const ballY = stepA.ballPos.y + (stepB.ballPos.y - stepA.ballPos.y) * smoothFraction;
  const maxArcHeight = Math.max(stepA.ballPos.height || 0, stepB.ballPos.height || 0);
  // Parabolic lift peaks in the middle of the pass/shot
  const ballArcLift = Math.sin(rawFraction * Math.PI) * maxArcHeight * 18;
  const ballScale = 1 + Math.sin(rawFraction * Math.PI) * maxArcHeight * 0.45;
  const ballRotation = timelinePos * 540;

  // Interpolated Players with Running Stride & Orientation
  const interpolatedPlayers = stepA.players.map((playerA) => {
    const playerB = stepB.players.find((p) => p.id === playerA.id) || playerA;
    const x = playerA.x + (playerB.x - playerA.x) * smoothFraction;
    const y = playerA.y + (playerB.y - playerA.y) * smoothFraction;
    const dx = playerB.x - playerA.x;
    const dy = playerB.y - playerA.y;
    const dist = Math.hypot(dx, dy);
    const isPlayerRunning = isMoving && dist > 0.5;

    return {
      ...playerA,
      x,
      y,
      startX: playerA.x,
      startY: playerA.y,
      targetX: playerB.x,
      targetY: playerB.y,
      isPlayerRunning,
      hasBallNow: rawFraction < 0.5 ? playerA.hasBall : playerB.hasBall,
      labelPos: playerB.labelPos || playerA.labelPos || 'bottom',
    };
  });

  // Handlers
  const handlePlayFullLive = () => {
    if (timelinePos >= maxStepIndex - 0.05) {
      goalSoundPlayedRef.current = false;
      setShowGoalCelebration(false);
      setTimelinePos(0);
    }
    setTargetStep(null);
    setIsPlayingFull(true);
    playBVBSoundTrack('drum');
  };

  const handlePause = () => {
    setIsPlayingFull(false);
    setTargetStep(null);
  };

  const handleStepForward = () => {
    setIsPlayingFull(false);
    setShowGoalCelebration(false);
    if (timelinePos >= maxStepIndex - 0.05) {
      goalSoundPlayedRef.current = false;
      setTimelinePos(0);
      setTargetStep(1);
    } else {
      const nextInt = Math.min(maxStepIndex, Math.floor(timelinePos + 1.05));
      setTargetStep(nextInt);
    }
    playBVBSoundTrack('drum');
  };

  const handleResetReenactment = () => {
    setIsPlayingFull(false);
    setTargetStep(null);
    goalSoundPlayedRef.current = false;
    setShowGoalCelebration(false);
    setTimelinePos(0);
  };

  const handleSelectReenactment = (id: string) => {
    setIsPlayingFull(false);
    setTargetStep(null);
    goalSoundPlayedRef.current = false;
    setShowGoalCelebration(false);
    setActiveReenactmentId(id);
    setTimelinePos(0);
  };

  const progressPercent = (timelinePos / maxStepIndex) * 100;

  return (
    <div className="space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#111318] via-[#1a1d26] to-[#111318] p-6 rounded-2xl border border-[#FDE100]/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#FDE100] text-black font-extrabold text-xs uppercase tracking-wider font-bvb">
              Museum & Archiv
            </span>
            <span className="text-xs text-slate-400 font-mono">1909 – Heute • 117 Jahre Ruhm & Stolz</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white font-bvb uppercase tracking-wide mt-1 flex items-center gap-2.5">
            ⏳ BVB-Zeitmaschine: 8 Jahrhundert-Tore & Chronik
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl leading-relaxed">
            Erlebe 8 unsterbliche Tore von Borussia Dortmund (1966 bis 2026) mit flüssigen 60-FPS-Spielerläufen, originalgetreuen Außenbahnen und legendären Kommentatoren-Zitaten!
          </p>
        </div>

        {/* TROPHY CABINET QUICK STATS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Meisterschaften</div>
            <div className="text-lg font-black text-[#FDE100] font-mono">8x 🏆</div>
          </div>
          <div className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">DFB-Pokale</div>
            <div className="text-lg font-black text-emerald-400 font-mono">5x 🏆</div>
          </div>
          <div className="px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Champions League</div>
            <div className="text-lg font-black text-blue-400 font-mono">1x ⭐️</div>
          </div>
        </div>
      </div>

      {/* FEATURE SECTION 1: INTERACTIVE 2D GOAL REENACTMENT (8 MOMENTS, 60-FPS ENGINE) */}
      <div className="bg-[#111318] p-6 rounded-2xl border-2 border-[#FDE100]/40 shadow-2xl space-y-5">
        <div className="space-y-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isMoving ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`} />
                  60-FPS Live-Stadion-Engine ({GOAL_REENACTMENTS.length} Jahrhundert-Tore)
                </span>
                <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-[#FDE100] font-mono font-bold">
                  ⏱️ Spieluhr: {formatClock(interpolatedClockSec)} Min.
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Phase {activeStepDisplay.stepNumber} von {activeReenactment.steps.length}
                </span>
              </div>
              <h3 className="text-xl font-black text-white font-bvb uppercase tracking-wide mt-1.5">
                ⚽ {activeReenactment.title}
              </h3>
              <p className="text-xs text-[#FDE100] font-mono mt-0.5">
                {activeReenactment.match} • {activeReenactment.minute}
              </p>
            </div>
          </div>

          {/* 8 GOAL SELECTOR BUTTONS GRID */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 mb-2">
              Wähle einen der 8 historischen BVB-Tormomente zur Live-Simulation:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GOAL_REENACTMENTS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleSelectReenactment(goal.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left truncate flex items-center justify-between ${
                    activeReenactmentId === goal.id
                      ? 'bg-[#FDE100] text-black font-bvb shadow-md shadow-[#FDE100]/25 ring-2 ring-white/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                  }`}
                >
                  <span className="truncate">{goal.shortLabel}</span>
                  {activeReenactmentId === goal.id && (
                    <span className="text-[10px] font-mono font-black ml-1 shrink-0">AKTIV</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2D TACTICAL STADIUM PITCH VISUALIZER */}
        <div className="relative w-full aspect-[21/9] min-h-[300px] max-h-[420px] bg-emerald-950 rounded-2xl border-2 border-emerald-500/50 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.85)] select-none">
          {/* MOWED GRASS STRIPES */}
          <div className="absolute inset-0 opacity-25 pointer-events-none flex">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 ${i % 2 === 0 ? 'bg-emerald-900/60' : 'bg-emerald-800/20'}`}
              />
            ))}
          </div>

          {/* STADIUM FLOODLIGHT GLOW */}
          <div className="absolute -top-10 left-1/4 w-48 h-24 bg-[#FDE100]/10 blur-2xl pointer-events-none" />
          <div className="absolute -top-10 right-1/4 w-48 h-24 bg-white/10 blur-2xl pointer-events-none" />

          {/* ORIENTATION LABELS ON TURF (LEFT WING = TOP, RIGHT WING = BOTTOM) */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-white/35">
            <span>⬅️ Linke Außenbahn (Angriffsrichtung ➔)</span>
          </div>
          <div className="absolute bottom-11 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-white/35">
            <span>➔ Rechte Außenbahn (Angriffsrichtung ➔)</span>
          </div>

          {/* PITCH CHALK MARKINGS */}
          <div className="absolute inset-4 border-2 border-white/50 pointer-events-none">
            {/* Halfway line */}
            <div className="absolute top-0 bottom-0 left-[35%] w-0.5 bg-white/40" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>

            {/* 16m Penalty Box Right */}
            <div className="absolute top-[18%] bottom-[18%] right-0 w-[24%] border-2 border-r-0 border-white/50 bg-emerald-900/20">
              {/* Penalty Spot */}
              <div className="absolute top-1/2 right-[38%] -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/80" />
              {/* 5m Goal Area */}
              <div className="absolute top-[28%] bottom-[28%] right-0 w-[32%] border-2 border-r-0 border-white/50" />
            </div>

            {/* Penalty Arc */}
            <div className="absolute top-1/2 right-[24%] -translate-y-1/2 w-10 h-20 border-l-2 border-white/40 rounded-l-full" />

            {/* Goal Frame & Net Right */}
            <div
              className={`absolute top-[37%] bottom-[37%] -right-3 w-3.5 border-2 border-l-0 border-white bg-white/15 transition-transform duration-150 ${
                timelinePos >= maxStepIndex - 0.05 ? 'scale-x-125 bg-[#FDE100]/40 shadow-[0_0_25px_#FDE100]' : ''
              }`}
            />
          </div>

          {/* SVG OVERLAY FOR TACTICAL PASS LINES & PLAYER RUNNING TRAILS */}
          {showTacticalTrails && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            >
              {/* Player Running Vectors (Dashed lines from stepA to current pos) */}
              {interpolatedPlayers.map((p) => {
                const dist = Math.hypot(p.targetX - p.startX, p.targetY - p.startY);
                if (dist < 1) return null;
                return (
                  <line
                    key={`trail-${p.id}`}
                    x1={p.startX}
                    y1={p.startY}
                    x2={p.x}
                    y2={p.y}
                    stroke={p.isOpponent ? 'rgba(96,165,250,0.35)' : 'rgba(253,225,0,0.45)'}
                    strokeWidth="0.45"
                    strokeDasharray="1.2,0.8"
                  />
                );
              })}

              {/* Ball Flight Trajectory Line */}
              <line
                x1={stepA.ballPos.x}
                y1={stepA.ballPos.y}
                x2={ballX}
                y2={ballY}
                stroke="#ffffff"
                strokeWidth="0.55"
                strokeDasharray="0.8,0.8"
                strokeOpacity="0.75"
              />
            </svg>
          )}

          {/* CONTINUOUS 60-FPS PLAYERS ON PITCH */}
          {interpolatedPlayers.map((p) => (
            <div
              key={p.id}
              className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
            >
              {/* Nameplate on TOP if labelPos === 'top' */}
              {p.labelPos === 'top' && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded mb-0.5 shadow-md whitespace-nowrap font-mono ${
                    p.isOpponent
                      ? 'bg-slate-950/90 text-blue-200 border border-blue-500/30'
                      : 'bg-black/95 text-[#FDE100] border border-[#FDE100]/50'
                  }`}
                >
                  {p.name}
                </span>
              )}

              {/* Token Wrapper */}
              <div className="relative flex items-center justify-center">
                {/* Active Ball Carrier Halo Ring */}
                {p.hasBallNow && (
                  <div className="absolute -inset-1.5 rounded-full border-2 border-[#FDE100] animate-ping opacity-60" />
                )}

                {/* Animated Legs / Stride effect while running */}
                {p.isPlayerRunning && (
                  <div className="absolute -bottom-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/70 animate-ping" />
                  </div>
                )}

                {/* Player Jersey Token */}
                <div
                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 shadow-lg transition-transform ${
                    p.isPlayerRunning ? 'scale-110' : 'scale-100'
                  } ${
                    p.isOpponent
                      ? p.isKeeper
                        ? 'bg-emerald-600 text-white border-white'
                        : 'bg-blue-600 text-white border-white'
                      : 'bg-[#FDE100] text-black border-black font-bvb shadow-[0_0_12px_rgba(253,225,0,0.5)]'
                  }`}
                >
                  <span>{p.number}</span>
                </div>
              </div>

              {/* Nameplate on BOTTOM if labelPos !== 'top' */}
              {p.labelPos !== 'top' && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 shadow-md whitespace-nowrap font-mono ${
                    p.isOpponent
                      ? 'bg-slate-950/90 text-blue-200 border border-blue-500/30'
                      : 'bg-black/95 text-[#FDE100] border border-[#FDE100]/50'
                  }`}
                >
                  {p.name}
                </span>
              )}
            </div>
          ))}

          {/* CONTINUOUS 60-FPS BALL WITH 3D LOB SHADOW & SPIN */}
          <div
            className="absolute z-30 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${ballX}%`,
              top: `${ballY}%`,
            }}
          >
            {/* Ground Shadow */}
            <div
              className="absolute w-4 h-2 rounded-full bg-black/65 blur-[1px] transition-all"
              style={{
                transform: `translateY(${ballArcLift * 0.6}px) scale(${Math.max(0.5, 1.2 - maxArcHeight * 0.4)})`,
              }}
            />

            {/* Soccer Ball Sprite */}
            <div
              className="w-5 h-5 rounded-full bg-white border-2 border-black shadow-[0_0_14px_#FDE100] flex items-center justify-center text-[10px] leading-none"
              style={{
                transform: `translateY(${-ballArcLift}px) scale(${ballScale}) rotate(${ballRotation}deg)`,
              }}
            >
              ⚽
            </div>
          </div>

          {/* LIVE TV BROADCAST TICKER OVERLAY (BOTTOM OF PITCH) */}
          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="px-3 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-[#FDE100]/40 flex items-center gap-2 text-xs text-white font-mono shadow-lg">
              <Volume2 className="w-3.5 h-3.5 text-[#FDE100] shrink-0" />
              <span className="truncate max-w-md md:max-w-xl text-[#FDE100] font-semibold">
                „{activeStepDisplay.commentary}“
              </span>
            </div>

            <button
              onClick={() => setShowTacticalTrails(!showTacticalTrails)}
              className="pointer-events-auto px-2.5 py-1 rounded-lg bg-black/85 hover:bg-black text-[10px] font-mono text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
              title="Laufwege & Passlinien ein-/ausblenden"
            >
              <Eye className="w-3 h-3 text-[#FDE100]" />
              <span>{showTacticalTrails ? 'Laufwege AN' : 'Laufwege AUS'}</span>
            </button>
          </div>

          {/* GOAL CELEBRATION BANNER WHEN BALL HITS THE NET */}
          {showGoalCelebration && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center z-40 animate-in fade-in duration-300 p-4 text-center">
              <span className="text-4xl md:text-6xl font-black text-[#FDE100] font-bvb tracking-wider drop-shadow-[0_0_25px_#FDE100] animate-bounce">
                ⚽ TOOOOOOOR FÜR DEN BVB!
              </span>
              <p className="text-base md:text-lg text-white font-bold font-sans mt-2">
                {activeReenactment.scorer} • {activeReenactment.minute}
              </p>
              <p className="text-xs text-amber-300 italic font-serif mt-1 max-w-xl">
                {activeReenactment.famousQuote} — {activeReenactment.commentator}
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handlePlayFullLive}
                  className="px-5 py-2.5 bg-[#FDE100] text-black font-extrabold text-xs rounded-xl font-bvb uppercase tracking-wider cursor-pointer shadow-lg hover:bg-white transition-all flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Noch einmal flüssig abspielen</span>
                </button>
                <button
                  onClick={() => setShowGoalCelebration(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Schließen & Endposition ansehen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INTERACTIVE TIMELINE SCRUBBER (STADION-ZEITLEISTE) */}
        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Spielfluss-Regler (Ziehen für Zeitlupe / Vor- & Zurückspulen):</span>
            <span className="text-[#FDE100] font-bold">
              {Math.round(progressPercent)}% • Spielminute {formatClock(interpolatedClockSec)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxStepIndex}
            step={0.01}
            value={timelinePos}
            onChange={(e) => {
              setIsPlayingFull(false);
              setTargetStep(null);
              setShowGoalCelebration(false);
              setTimelinePos(parseFloat(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#FDE100]"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            {activeReenactment.steps.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => {
                  setIsPlayingFull(false);
                  setShowGoalCelebration(false);
                  setTargetStep(idx);
                }}
                className={`cursor-pointer hover:text-[#FDE100] transition-colors ${
                  activeStepDisplay.stepNumber === s.stepNumber ? 'text-[#FDE100] font-bold' : ''
                }`}
              >
                {s.stepNumber}. {s.timeSec} Min.
              </button>
            ))}
          </div>
        </div>

        {/* STEP CONTROLS & FAMOUS COMMENTATOR QUOTE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* STEP DESCRIPTION */}
          <div className="md:col-span-2 bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#FDE100] font-bold">
                Spielminute {formatClock(interpolatedClockSec)} • Phase {activeStepDisplay.stepNumber} von {activeReenactment.steps.length}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{activeReenactment.commentator}</span>
            </div>
            <p className="text-sm text-slate-200 font-sans leading-relaxed">
              {activeStepDisplay.playerAction}
            </p>
            <div className="text-xs text-amber-300/90 italic pt-1.5 border-t border-slate-800 font-serif">
              🎙️ „{activeStepDisplay.commentary}“
            </div>
          </div>

          {/* TRANSPORT CONTROLS */}
          <div className="flex flex-col gap-2">
            {isPlayingFull ? (
              <button
                onClick={handlePause}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase font-bvb tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-black" />
                <span>Animation Pausieren</span>
              </button>
            ) : (
              <button
                onClick={handlePlayFullLive}
                className="w-full py-3 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold text-xs uppercase font-bvb tracking-wider rounded-xl shadow-lg shadow-[#FDE100]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>
                  {timelinePos >= maxStepIndex - 0.05
                    ? 'Torszene komplett neu abspielen'
                    : 'Torszene flüssig abspielen (Live)'}
                </span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleStepForward}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Nächste Phase gleiten</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FDE100]" />
              </button>

              <button
                onClick={handleResetReenactment}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Auf Anfang zurücksetzen"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE SECTION 2: CHRONOLOGICAL BVB TIMELINE (1909 BIS HEUTE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white font-bvb uppercase tracking-wide flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FDE100]" />
            <span>Chronologische BVB-Zeitleiste (1909 – Heute)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Wähle ein Meilenstein-Jahr:</span>
        </div>

        {/* HORIZONTAL YEAR SCROLLER */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {BVB_MILESTONES.map((m) => {
            const isSelected = selectedMilestone.year === m.year;
            return (
              <button
                key={m.year}
                onClick={() => setSelectedMilestone(m)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex flex-col items-center shrink-0 min-w-[100px] ${
                  isSelected
                    ? 'bg-[#FDE100] text-black shadow-lg shadow-[#FDE100]/30 font-bvb scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-sans'
                }`}
              >
                <span className="text-sm font-black font-mono">{m.year}</span>
                <span className={`text-[10px] truncate max-w-[90px] ${isSelected ? 'text-black font-extrabold' : 'text-slate-400'}`}>
                  {m.era}
                </span>
              </button>
            );
          })}
        </div>

        {/* SELECTED MILESTONE DETAIL CARD */}
        <div className="bg-[#111318] p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FDE100]/20 text-[#FDE100] border border-[#FDE100]/30 text-xs font-mono font-bold">
                {selectedMilestone.era} • {selectedMilestone.year}
              </span>
              <h4 className="text-2xl font-black text-white font-bvb uppercase tracking-wide mt-1.5">
                {selectedMilestone.title}
              </h4>
              <p className="text-xs text-[#FDE100] font-sans font-semibold mt-0.5">
                {selectedMilestone.subtitle}
              </p>
            </div>

            {selectedMilestone.trophy && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#FDE100]" />
                <span>{selectedMilestone.trophy}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-300 font-sans leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {selectedMilestone.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {selectedMilestone.highlights.map((h, i) => (
              <div key={i} className="px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-slate-300 font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#FDE100] shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Hauptfigur: <strong className="text-white">{selectedMilestone.hero}</strong></span>
            {selectedMilestone.score && (
              <span className="text-[#FDE100] font-bold">
                Endstand: {selectedMilestone.score} {selectedMilestone.opponent ? `(vs. ${selectedMilestone.opponent})` : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
