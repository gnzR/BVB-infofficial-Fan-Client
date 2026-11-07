import React, { useState } from 'react';
import {
  DollarSign,
  Award,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Star,
  Heart,
  ArrowRight,
  ShieldCheck,
  Trophy,
  Sparkles,
  Building2,
  Flame,
  GraduationCap,
  Megaphone,
  Stethoscope,
  Shuffle
} from 'lucide-react';
import { playStadiumCheerSound } from '../../utils/cheerSound';
import { playBVBSoundTrack } from '../../utils/soundboardSynth';

export type ManagerCategory = 'transfers' | 'tactics' | 'fans' | 'youth' | 'finance' | 'crisis';

export interface ManagerChoice {
  id: string;
  label: string;
  badge?: string;
  cost: number; // positive = spent, negative = received from sale/sponsor
  squadChange: number;
  fanChange: number;
  description: string;
}

export interface ManagerScenarioTemplate {
  id: string;
  category: ManagerCategory;
  categoryLabel: string;
  title: string;
  subtitle: string;
  scenario: string;
  choices: ManagerChoice[];
}

export interface ManagerRound extends ManagerScenarioTemplate {
  roundNumber: number;
  totalRounds: number;
}

// 28 AUTHENTIC, DIVERSE BVB SCENARIOS ACROSS 6 CATEGORIES
export const BVB_SCENARIO_POOL: ManagerScenarioTemplate[] = [
  // 1. TRANSFERS & SCOUTING
  {
    id: 'can_saudi',
    category: 'transfers',
    categoryLabel: 'Transfermarkt & Scouting',
    title: 'Rekord-Angebot aus Saudi-Arabien',
    subtitle: 'Al-Hilal bietet 42.000.000 € für Kapitän Emre Can (32)',
    scenario: 'Ein saudischer Klub klopft mit einem lukrativen 42 Mio. € Angebot für Emre Can an. Sein Marktwert liegt bei 14 Mio. €. Sebastian Kehl fragt dich nach deiner Entscheidung:',
    choices: [
      {
        id: 'can_sell',
        label: 'Annehmen & Verkaufen (+42 Mio. €)',
        badge: 'Gewinnmitnahme',
        cost: -42000000,
        squadChange: -1.2,
        fanChange: -5,
        description: 'Du nimmst das riesige Geldpaket mit. Der Kader verliert Führungskraft, aber das Budget steigt massiv.',
      },
      {
        id: 'can_keep',
        label: 'Ablehnen & Can behalten (0 €)',
        badge: 'Treue & Stabilität',
        cost: 0,
        squadChange: +0.8,
        fanChange: +8,
        description: 'Du setzt ein klares Zeichen der Kontinuität. Die Südtribüne feiert die Vereinstreue des Kapitäns.',
      },
      {
        id: 'can_negotiate',
        label: 'Nachverhandeln auf 50 Mio. € (+50 Mio. €)',
        badge: 'Poker-Coup',
        cost: -50000000,
        squadChange: -1.4,
        fanChange: -3,
        description: 'Al-Hilal akzeptiert zähneknirschend 50 Mio. €! Maximaler finanzieller Erlös für den BVB.',
      },
      {
        id: 'can_extend',
        label: 'Vertrag bis 2028 verlängern (-6 Mio. €)',
        badge: 'Kapitäns-Pakt',
        cost: 6000000,
        squadChange: +1.2,
        fanChange: +10,
        description: 'Can unterschreibt einen reduzierten Rentenvertrag mit Handgeld. Fels in der Brandung!',
      },
    ],
  },
  {
    id: 'cherki_hunt',
    category: 'transfers',
    categoryLabel: 'Transfermarkt & Scouting',
    title: 'Top-Transferziel Rayan Cherki',
    subtitle: 'Olympique Lyon verlangt 35 Mio. € Ablöse',
    scenario: 'Der 22-jährige französische Edeltechniker Rayan Cherki will unbedingt zu Borussia Dortmund. Lyon beharrt auf 35 Mio. €. Niko Kovac wünscht sich den Spielmacher dringend:',
    choices: [
      {
        id: 'cherki_pay',
        label: 'Forderung erfüllen (-35 Mio. €)',
        badge: 'Sofort-Kauf',
        cost: 35000000,
        squadChange: +2.8,
        fanChange: +12,
        description: 'Cherki unterschreibt sofort bis 2030! Die Offensive gewinnt enorme Kreativität und Esprit.',
      },
      {
        id: 'cherki_lowball',
        label: 'Hart pokern: 26 Mio. € bieten (-26 Mio. €)',
        badge: 'Verhandlungsgeschick',
        cost: 26000000,
        squadChange: +2.2,
        fanChange: +6,
        description: 'Nach zähem Ringen lenkt Lyon ein. Du sparst 9 Mio. € Ablöse bei Top-Qualität!',
      },
      {
        id: 'cherki_loan',
        label: 'Leihe mit Kaufpflicht vorschlagen (-8 Mio. €)',
        badge: 'Finanz-Schachzug',
        cost: 8000000,
        squadChange: +1.9,
        fanChange: +8,
        description: 'Lyon stimmt 8 Mio. Leihgebühr zu; die 28 Mio. Kaufpflicht wird erst im Folgejahr fällig.',
      },
      {
        id: 'cherki_pass',
        label: 'Abstand nehmen & Budget sparen (0 €)',
        badge: 'Sparsamkeit',
        cost: 0,
        squadChange: 0,
        fanChange: -6,
        description: 'Du verzichtest auf den Transfer. Die Fans sind enttäuscht über die verpasste Chance.',
      },
    ],
  },
  {
    id: 'schlotterbeck_real',
    category: 'transfers',
    categoryLabel: 'Transfermarkt & Scouting',
    title: 'Real Madrid lockt Nico Schlotterbeck',
    subtitle: 'Ausstiegsklausel von 60 Mio. € steht im Raum',
    scenario: 'Real Madrid will Abwehr-Boss Nico Schlotterbeck als Alaba-Nachfolger verpflichten. Schlotterbeck bittet dich um ein Vier-Augen-Gespräch:',
    choices: [
      {
        id: 'schlotti_renew',
        label: 'Vorzeitig verlängern mit Gehaltssprung (-12 Mio. €)',
        badge: 'Abwehr-Herzstück',
        cost: 12000000,
        squadChange: +2.0,
        fanChange: +16,
        description: 'Schlotterbeck lehnt Real ab und verlängert langfristig ohne Klausel! Die Fans feiern dich.',
      },
      {
        id: 'schlotti_sell',
        label: 'Klausel ziehen lassen (+60 Mio. €)',
        badge: 'Geldregen',
        cost: -60000000,
        squadChange: -3.2,
        fanChange: -18,
        description: 'Schlotterbeck geht nach Madrid. 60 Mio. € spülen Geld in die Kasse, aber die Abwehr wackelt gewaltig.',
      },
      {
        id: 'schlotti_swap',
        label: 'Tauschdeal vorschlagen (+25 Mio. € & Arda Güler Leihe)',
        badge: 'Genie-Streich',
        cost: -25000000,
        squadChange: +1.0,
        fanChange: +10,
        description: 'Real willigt ein: Du kassierst 25 Mio. € und leihst Reals Supertalent Arda Güler für 2 Jahre aus!',
      },
      {
        id: 'schlotti_gentleman',
        label: 'Gentlemen-Agreement: 1 weiteres BVB-Jahr (0 €)',
        badge: 'Diplomatie',
        cost: 0,
        squadChange: +0.6,
        fanChange: +5,
        description: 'Kovac und Kehl überzeugen ihn, erst nach der Saison 2026/27 über einen Wechsel zu sprechen.',
      },
    ],
  },
  {
    id: 'scouting_duel',
    category: 'transfers',
    categoryLabel: 'Transfermarkt & Scouting',
    title: 'Scouting-Duell im Mittelfeld',
    subtitle: 'Sverre Nypan (19) oder Quinten Timber (25)?',
    scenario: 'Chefscout Sven Mislintat präsentiert dir zwei herausragende Mittelfeld-Profile für die BVB-Zukunft:',
    choices: [
      {
        id: 'duel_nypan',
        label: 'Sverre Nypan kaufen (-18 Mio. €)',
        badge: 'Jahrhundert-Talent',
        cost: 18000000,
        squadChange: +2.4,
        fanChange: +12,
        description: 'Das norwegische Supertalent kommt für 18 Mio. €! Enormes Potenzial und Spielwitz.',
      },
      {
        id: 'duel_timber',
        label: 'Quinten Timber kaufen (-28 Mio. €)',
        badge: 'Champions-League-Reife',
        cost: 28000000,
        squadChange: +2.9,
        fanChange: +8,
        description: 'Sofortige Verstärkung für die Königsklasse! Physisch extrem robuster Mittelfeld-Motor.',
      },
      {
        id: 'duel_both',
        label: 'Beide im Doppelpack holen (-44 Mio. €)',
        badge: 'Doppel-Coup',
        cost: 44000000,
        squadChange: +4.6,
        fanChange: +20,
        description: 'Spektakulärer Doppel-Transfer! Der BVB sichert sich maximale Dominanz in der Zentrale.',
      },
      {
        id: 'duel_internal',
        label: 'Auf Kjell Wätjen aus dem NLZ setzen (0 €)',
        badge: 'Dortmunder Weg',
        cost: 0,
        squadChange: +1.2,
        fanChange: +14,
        description: 'Du sparst Millionen und vertraust dem Dortmunder Eigengewächs. Die Fans lieben diesen Schritt.',
      },
    ],
  },
  {
    id: 'adeyemi_premier',
    category: 'transfers',
    categoryLabel: 'Transfermarkt & Scouting',
    title: 'Premier-League-Milliardäre jagen Karim Adeyemi',
    subtitle: 'Chelsea & Arsenal bieten 75.000.000 € Ablöse',
    scenario: 'Karim Adeyemis Topspeed (36,7 km/h) begeistert die englische Liga. Ein offizielles 75-Mio.-Angebot landet auf dem Tisch:',
    choices: [
      {
        id: 'adeyemi_sell',
        label: 'Verkaufen (+75 Mio. €)',
        badge: 'Rekord-Erlös',
        cost: -75000000,
        squadChange: -2.0,
        fanChange: -8,
        description: 'Rekordtransfer! Du hast gigantische Mittel, verlierst aber den schnellsten Spieler der Bundesliga.',
      },
      {
        id: 'adeyemi_keep',
        label: 'Unverkäuflich erklären (0 €)',
        badge: 'Statement',
        cost: 0,
        squadChange: +1.5,
        fanChange: +15,
        description: 'Adeyemi bleibt Borusse! Er bedankt sich mit Doppelpacks und Fan-Liebe.',
      },
      {
        id: 'adeyemi_push',
        label: 'Auf 90 Mio. € hochpokern (+90 Mio. €)',
        badge: 'Pokerspiel',
        cost: -90000000,
        squadChange: -2.3,
        fanChange: -5,
        description: 'Chelsea zieht die Schmerzgrenze und zahlt 90 Mio. €! Unfassbarer Geldsegen.',
      },
      {
        id: 'adeyemi_extend',
        label: 'Adeyemi zum Topverdiener machen (-14 Mio. €)',
        badge: 'Zukunfts-Säule',
        cost: 14000000,
        squadChange: +2.5,
        fanChange: +18,
        description: 'Karim bindet sich bis 2031 an Schwarz-Gelb und kündigt die Jagd auf die Meisterschale an.',
      },
    ],
  },
  {
    id: 'brazil_scout',
    category: 'transfers',
    categoryLabel: 'Transfermarkt & Scouting',
    title: 'Südamerika-Scouting: Juwel aus São Paulo',
    subtitle: '18-jähriger Dribbelkünstler für 15 Mio. € verfügbar',
    scenario: 'Das BVB-Scouting-Team in Brasilien hat einen pfeilschnellen Flügelstürmer entdeckt, an dem auch ManCity dran ist:',
    choices: [
      {
        id: 'brazil_buy',
        label: 'Sofort per Vorvertrag verpflichten (-15 Mio. €)',
        badge: 'Samba-Talent',
        cost: 15000000,
        squadChange: +2.3,
        fanChange: +10,
        description: 'Der BVB schlägt ManCity im Rennen! Der Spieler stößt im Winter mit Euphorie zum Team.',
      },
      {
        id: 'brazil_option',
        label: 'Erstkauf-Option für 3 Mio. € sichern (-3 Mio. €)',
        badge: 'Risiko-Minimierung',
        cost: 3000000,
        squadChange: +0.6,
        fanChange: +3,
        description: 'Du sicherst dir exklusive Vorkaufsrechte und kannst seine Entwicklung 1 Jahr in Ruhe verfolgen.',
      },
      {
        id: 'brazil_academy',
        label: 'Kooperation mit FC São Paulo aufbauen (-5 Mio. €)',
        badge: 'Strategie-Netzwerk',
        cost: 5000000,
        squadChange: +1.5,
        fanChange: +6,
        description: 'Strategische Partnerschaft! Der BVB erhält Erstzugriffsrecht auf alle Top-Talente des Klubs.',
      },
      {
        id: 'brazil_skip',
        label: 'Zu großes Risiko – Ablehnen (0 €)',
        badge: 'Abwarten',
        cost: 0,
        squadChange: 0,
        fanChange: -2,
        description: 'Du lässt das Talent ziehen. ManCity greift zu, aber dein Budget bleibt unangetastet.',
      },
    ],
  },

  // 2. TAKTIK & KABINE
  {
    id: 'kovac_system',
    category: 'tactics',
    categoryLabel: 'Taktik & Kabine',
    title: 'Niko Kovac Taktik-Debatte: Dreierkette oder 4-3-3?',
    subtitle: 'Kovac fordert Defensiv-Kompaktheit – Fans wollen Spektakel',
    scenario: 'Nach zwei knappen 1:0-Siegen diskutiert die sportliche Führung die taktische Ausrichtung. Welchen Weg schlägst du ein?',
    choices: [
      {
        id: 'kovac_support',
        label: 'Volle Rückendeckung für Kovacs System (0 €)',
        badge: 'Disziplin',
        cost: 0,
        squadChange: +1.6,
        fanChange: -2,
        description: 'Die Defensive steht bombensicher wie seit Jahren nicht mehr. Ergebnis-Fußball pur.',
      },
      {
        id: 'kovac_push_offense',
        label: 'Offensiv-Trainer zur Seite stellen (-1.5 Mio. €)',
        badge: 'Vollgas-Fußball',
        cost: 1500000,
        squadChange: +2.1,
        fanChange: +14,
        description: 'Du verpflichtest einen niederländischen Offensiv-Spezialisten als Co-Trainer. Spektakel pur!',
      },
      {
        id: 'kovac_sammer_workshop',
        label: 'Kompakt-Workshop mit Matthias Sammer (-0.3 Mio. €)',
        badge: 'BVB-DNA',
        cost: 300000,
        squadChange: +1.8,
        fanChange: +8,
        description: 'Sammer impft der Mannschaft Siegermentalität ein. Hohe Harmonie in der Führung.',
      },
      {
        id: 'kovac_wingers',
        label: 'Kovac passende Schienenspieler kaufen (-22 Mio. €)',
        badge: 'System-Investition',
        cost: 22000000,
        squadChange: +3.0,
        fanChange: +6,
        description: 'Perfekte Außenbahn-Spezialisten für Kovacs 3-5-2. Das System greift nun fehlerfrei.',
      },
    ],
  },
  {
    id: 'locker_discipline',
    category: 'tactics',
    categoryLabel: 'Taktik & Kabine',
    title: 'Disziplin-Fall: Star-Angreifer verschläft Abschlusstraining',
    subtitle: 'Direkt vor dem richtungsweisenden Bundesliga-Topspiel',
    scenario: 'Ein wichtiger Offensiv-Star kommt zum zweiten Mal 45 Minuten zu spät zur Video-Analyse. Kovac fragt nach der Klub-Linie:',
    choices: [
      {
        id: 'disc_suspend',
        label: 'Knallharte Suspendierung für das Spiel (+0.2 Mio. €)',
        badge: 'Harte Hand',
        cost: -200000,
        squadChange: -0.8,
        fanChange: +10,
        description: 'Kader-Disziplin steht über allem. Die 200.000 € Geldstrafe fließt in die BVB-Klubkasse.',
      },
      {
        id: 'disc_internal',
        label: 'Vieraugengespräch & Mannschafts-Essen zahlen (-0.1 Mio. €)',
        badge: 'Teambuilding',
        cost: 100000,
        squadChange: +1.2,
        fanChange: +6,
        description: 'Der Spieler entschuldigt sich demütig vor der Mannschaft und trifft am Samstag doppelt!',
      },
      {
        id: 'disc_coach',
        label: 'Persönlichen Mentaltrainer zur Seite stellen (-0.4 Mio. €)',
        badge: 'Fördern & Fordern',
        cost: 400000,
        squadChange: +1.5,
        fanChange: +4,
        description: 'Die Ursachen werden professionell behoben. Der Spieler blüht in Top-Form auf.',
      },
      {
        id: 'disc_warn',
        label: 'Letzte Verwarnung ohne Strafe (0 €)',
        badge: 'Gnade vor Recht',
        cost: 0,
        squadChange: +0.2,
        fanChange: -5,
        description: 'Der Star spielt, doch die Medien spekulieren über fehlende Autorität der Trainerbank.',
      },
    ],
  },
  {
    id: 'derby_prep',
    category: 'tactics',
    categoryLabel: 'Taktik & Kabine',
    title: 'Die Woche der Wahrheit: Das große Derby',
    subtitle: 'Ausnahmezustand in Dortmund vor dem Prestige-Duell',
    scenario: 'Das wichtigste Spiel der Saison steht vor der Tür. Ganz Dortmund fordert Leidenschaft und einen Derbysieg:',
    choices: [
      {
        id: 'derby_bonus',
        label: 'Sonder-Derbyprämie für das Team ausloben (-1.5 Mio. €)',
        badge: 'Erfolgsprämie',
        cost: 1500000,
        squadChange: +2.0,
        fanChange: +12,
        description: 'Die Mannschaft brennt wie eine Fackel und dominiert das Spiel mit bedingungslosem Einsatz.',
      },
      {
        id: 'derby_legends',
        label: 'BVB-Legenden (Dede, Großkreutz) in die Kabine holen (-0.1 Mio. €)',
        badge: 'Emotion & Herz',
        cost: 100000,
        squadChange: +2.4,
        fanChange: +18,
        description: 'Gänsehaut pur! Die Legenden schwören die Profis auf die schwarz-gelbe Ehre ein.',
      },
      {
        id: 'derby_routine',
        label: 'Vollkommen normale Routine ohne Hype (0 €)',
        badge: 'Kühler Kopf',
        cost: 0,
        squadChange: +0.5,
        fanChange: -3,
        description: 'Kein künstlicher Druck. Das Team wirkt stabil, den Fans fehlt jedoch das letzte Feuer.',
      },
      {
        id: 'derby_public',
        label: 'Öffentliches Training mit 20.000 Fans im Stadion (-0.2 Mio. €)',
        badge: 'Gänsehaut-Moment',
        cost: 200000,
        squadChange: +1.8,
        fanChange: +20,
        description: '20.000 Fans singen die Mannschaft ein! Unglaubliche Verbundenheit vor dem Anpfiff.',
      },
    ],
  },
  {
    id: 'cl_rotation',
    category: 'tactics',
    categoryLabel: 'Taktik & Kabine',
    title: 'Kräfte-Verschleiß in der Champions League',
    subtitle: '3 Spiele in 7 Tagen: Bundesliga, Real Madrid, DFB-Pokal',
    scenario: 'Der Spielplan zollt Tribut. Die medizinische Abteilung meldet kritische Laktatwerte bei 5 Stammspielern:',
    choices: [
      {
        id: 'rot_hard',
        label: 'Keine Kompromisse: Immer mit der besten Elf (0 €)',
        badge: 'Vollgas',
        cost: 0,
        squadChange: +1.2,
        fanChange: +8,
        description: 'Große Siege in der CL, aber die Spieler laufen physisch auf der allerletzten Rille.',
      },
      {
        id: 'rot_smart',
        label: 'Konsequente Rotation mit Talenten & B-Elf (0 €)',
        badge: 'Belastungssteuerung',
        cost: 0,
        squadChange: +0.6,
        fanChange: +4,
        description: 'Frische Beine in den entscheidenden Schlussphasen; Talente sammeln wertvolle Praxis.',
      },
      {
        id: 'rot_recovery',
        label: 'High-Tech Kältekammern & Extra-Physios einfliegen (-0.8 Mio. €)',
        badge: 'Regenerations-HighTech',
        cost: 800000,
        squadChange: +2.5,
        fanChange: +10,
        description: 'Die modernste Regenerationsmedizin Europas hält den BVB ohne Muskelrisse fit!',
      },
      {
        id: 'rot_depth',
        label: 'Zwei polyvalente Ergänzungsspieler leihen (-5 Mio. €)',
        badge: 'Kaderbreite',
        cost: 5000000,
        squadChange: +2.0,
        fanChange: +5,
        description: 'Du erweiterst den Kader kurzfristig und federst jede Verletzung mühelos ab.',
      },
    ],
  },

  // 3. SÜDTRIBÜNE & FANS
  {
    id: 'choreo_dfb',
    category: 'fans',
    categoryLabel: 'Südtribüne & Fans',
    title: 'Südtribünen-Konflikt: Choreo vs. DFB-Strafe',
    subtitle: 'Ultras planen gigantische Choreo – DFB droht mit Block-Sperre',
    scenario: 'Die BVB-Fangruppierungen planen die größte Choreo in der Vereinsgeschichte. Der DFB verlangt strikte Auflagen:',
    choices: [
      {
        id: 'choreo_support',
        label: 'Klub übernimmt Strafen & stiftet 100.000 € für Choreo (-0.5 Mio. €)',
        badge: 'Pakt mit den Fans',
        cost: 500000,
        squadChange: +1.2,
        fanChange: +22,
        description: 'Die Gelbe Wand erstrahlt in einer Jahrhundert-Choreo! Die Weltpresse staunt.',
      },
      {
        id: 'choreo_dialog',
        label: 'Fandialog einberufen: 50/50 Kostenaufteilung (-0.2 Mio. €)',
        badge: 'Goldene Mitte',
        cost: 200000,
        squadChange: +0.5,
        fanChange: +12,
        description: 'Gegenseitiger Respekt. Die Choreo findet sicher und atemberaubend statt.',
      },
      {
        id: 'choreo_ban',
        label: 'Pyrotechnik streng verbieten & Stehplätze kontrollieren (0 €)',
        badge: 'DFB-Konform',
        cost: 0,
        squadChange: 0,
        fanChange: -20,
        description: 'Keine Strafen, aber die Südtribüne schweigt 12 Minuten aus lautstarkem Protest.',
      },
      {
        id: 'choreo_train',
        label: 'Sonderzüge für BVB-Auswärtsfahrer sponsern (-0.4 Mio. €)',
        badge: 'Auswärts-Support',
        cost: 400000,
        squadChange: +0.8,
        fanChange: +16,
        description: 'Tausende Borussen reisen günstig mit der Bahn. Auswärtsspiele werden zu Heimspielen!',
      },
    ],
  },
  {
    id: 'ticket_prices',
    category: 'fans',
    categoryLabel: 'Südtribüne & Fans',
    title: 'Ticket-Preise: Stehplätze einfrieren oder anheben?',
    subtitle: 'Finanzvorstand schlägt 15% Preiserhöhung zur Budget-Aufbesserung vor',
    scenario: 'Die Inflation trifft auch den Fußball. Auf der Mitgliederversammlung steht die Preisgestaltung der 25.000 Stehplätze an:',
    choices: [
      {
        id: 'ticket_freeze',
        label: 'Preise symbolisch bei 19,09 € einfrieren (0 €)',
        badge: 'Fußball bezahlbar halten',
        cost: 0,
        squadChange: 0,
        fanChange: +20,
        description: 'Großer Applaus auf der Mitgliederversammlung! Borussia Dortmund bleibt der Verein der Menschen.',
      },
      {
        id: 'ticket_raise',
        label: 'Preise um 15% anheben (+7 Mio. € Budget)',
        badge: 'Finanz-Fokus',
        cost: -7000000,
        squadChange: +1.0,
        fanChange: -18,
        description: 'Das Transferbudget wächst, aber Fan-Transparente mit Protestparolen schmücken die Kurve.',
      },
      {
        id: 'ticket_vip',
        label: 'VIP-Logen um 30% verteuern, Stehplätze verbilligen (+4 Mio. €)',
        badge: 'Sozialer Ausgleich',
        cost: -4000000,
        squadChange: +0.8,
        fanChange: +18,
        description: 'Genialer Schachzug: Sponsoren zahlen mehr, während die echten Fans entlastet werden.',
      },
      {
        id: 'ticket_loyalty',
        label: 'Treue-Rabatt für Dauerkarten über 10 Jahre einführen (-1.5 Mio. €)',
        badge: 'Ehren-Kultur',
        cost: 1500000,
        squadChange: 0,
        fanChange: +15,
        description: 'Lebenslange Treue wird belohnt. Die Verbundenheit der Urgesteine ist unbezahlbar.',
      },
    ],
  },
  {
    id: 'legend_farewell',
    category: 'fans',
    categoryLabel: 'Südtribüne & Fans',
    title: 'Karriereende einer schwarz-gelben Vereinsikone',
    subtitle: 'Marco Reus / Mats Hummels Abschiedsspiel im Signal Iduna Park',
    scenario: 'Ein langjähriger Publikumsliebling beendet seine aktive Karriere. Wie würdigt der BVB seine Verdienste?',
    choices: [
      {
        id: 'farewell_match',
        label: 'Riesiges Benefizspiel mit All-Star-Team organisieren (+2.5 Mio. €)',
        badge: 'Gala-Abend',
        cost: -2500000,
        squadChange: +0.5,
        fanChange: +18,
        description: 'Ausverkauftes Stadion, Tränen auf den Rängen und Millionen-Einnahmen für wohltätige Zwecke!',
      },
      {
        id: 'farewell_job',
        label: 'Als Nachwuchstrainer & Klub-Botschafter einbinden (-0.8 Mio. €)',
        badge: 'Vereinsikone',
        cost: 800000,
        squadChange: +1.6,
        fanChange: +16,
        description: 'Seine Erfahrung bleibt im Klub und inspiriert die U19-Talente im Nachwuchsleistungszentrum.',
      },
      {
        id: 'farewell_tribune',
        label: 'Eingangstor am Stadion nach ihm benennen (-0.2 Mio. €)',
        badge: 'Denkmal setzen',
        cost: 200000,
        squadChange: 0,
        fanChange: +14,
        description: 'Für immer verewigt an den Toren des Signal Iduna Parks. Die Fans sind begeistert.',
      },
      {
        id: 'farewell_modest',
        label: 'Schlichte Verabschiedung vor dem Anpfiff (0 €)',
        badge: 'Standard',
        cost: 0,
        squadChange: 0,
        fanChange: -8,
        description: 'Ein Blumenstrauß und eine Trikot-Rahmung – vielen Fans war das deutlich zu unpersönlich.',
      },
    ],
  },

  // 4. NLZ BRACKEL & JUGEND
  {
    id: 'nlz_superstar',
    category: 'youth',
    categoryLabel: 'NLZ Brackel & Jugend',
    title: 'NLZ Brackel: 17-jähriges Supertalent drängt zu den Profis',
    subtitle: 'Englische Topklubs locken mit Millionen – Kehl bittet um Entscheidung',
    scenario: 'Ein 17-jähriges Offensiv-Juwel aus der BVB-U19 schießt in der Youth League alles kurz und klein. Wie planst du mit ihm?',
    choices: [
      {
        id: 'nlz_promote',
        label: 'Sofort Profivertrag mit garantierter Bundesliga-Spielzeit (-4 Mio. €)',
        badge: 'Jugend forscht',
        cost: 4000000,
        squadChange: +2.6,
        fanChange: +16,
        description: 'Er unterschreibt bis 2030! Beim Debüt im Westfalenstadion erzielt er prompt ein Traumtor.',
      },
      {
        id: 'nlz_loan',
        label: 'Für 1 Jahr an Partnerklub in die Eredivisie verleihen (+1.5 Mio. €)',
        badge: 'Ausbildungspfad',
        cost: -1500000,
        squadChange: +1.0,
        fanChange: +6,
        description: 'Er sammelt 30 Spiele als Stammspieler in Holland und kehrt mit doppeltem Marktwert zurück.',
      },
      {
        id: 'nlz_slow',
        label: 'Behutsam über die U23 (3. Liga Rote Erde) aufbauen (0 €)',
        badge: 'Geduld',
        cost: 0,
        squadChange: +1.2,
        fanChange: +8,
        description: 'Physisch reift er im harten Männerfußball der 3. Liga und trainiert regelmäßig bei Kovac.',
      },
      {
        id: 'nlz_sell_buyback',
        label: 'Für 18 Mio. € nach England verkaufen mit 25 Mio. Rückkaufoption (+18 Mio. €)',
        badge: 'Rückhol-Garantie',
        cost: -18000000,
        squadChange: -0.5,
        fanChange: -4,
        description: 'Massiver Geldgewinn und der BVB behält die Hand auf dem Talent, falls er explodiert.',
      },
    ],
  },
  {
    id: 'nlz_facility',
    category: 'youth',
    categoryLabel: 'NLZ Brackel & Jugend',
    title: 'Ausbau Nachwuchs-Campus Dortmund-Brackel',
    subtitle: 'Neuer Footbonaut 2.0 & Athletik-Zentrum geplant',
    scenario: 'Um Talente wie Bellingham, Haaland oder Gittens früher zu formen, empfiehlt Lars Ricken eine Investition in die Akademie:',
    choices: [
      {
        id: 'nlz_build_max',
        label: 'Europas modernsten KI-Campus bauen (-12 Mio. €)',
        badge: 'Elite-Zentrum',
        cost: 12000000,
        squadChange: +3.2,
        fanChange: +14,
        description: 'Der BVB wird zur weltweit führenden Entwicklungsstation für Ausnahmetalente!',
      },
      {
        id: 'nlz_build_mid',
        label: 'Solide Erweiterung der Plätze & Internat (-5 Mio. €)',
        badge: 'Nachhaltig',
        cost: 5000000,
        squadChange: +1.8,
        fanChange: +8,
        description: 'Moderne Trainingsbedingungen ohne das aktuelle Transferbudget übermäßig zu belasten.',
      },
      {
        id: 'nlz_sponsor_backed',
        label: 'Bau mit Namenssponsor finanzieren (+3 Mio. € Überschuss)',
        badge: 'Sponsoren-Deal',
        cost: -3000000,
        squadChange: +1.5,
        fanChange: +2,
        description: 'Die Akademie wird komplett fremdfinanziert, trägt aber für 10 Jahre einen Sponsorennamen.',
      },
      {
        id: 'nlz_postpone',
        label: 'Verschieben – Alles Geld in den aktuellen Profikader (0 €)',
        badge: 'Kurzfristig',
        cost: 0,
        squadChange: 0,
        fanChange: -6,
        description: 'Das Geld bleibt für Stars reserviert, aber die Konkurrenz zieht in der Jugendförderung vorbei.',
      },
    ],
  },
  {
    id: 'waetjen_future',
    category: 'youth',
    categoryLabel: 'NLZ Brackel & Jugend',
    title: 'Kjell Wätjen: Bayern & Leipzig locken',
    subtitle: 'Ausbildungsentschädigung oder langfristiger BVB-Vertrag?',
    scenario: 'U17-Welt- und Europameister Kjell Wätjen steht vor der Unterschrift seines ersten langfristigen Profivertrags:',
    choices: [
      {
        id: 'waetjen_sign',
        label: 'Langfristigen 5-Jahres-Vertrag als BVB-Zukunft vorlegen (-5 Mio. €)',
        badge: 'Eigengewächs',
        cost: 5000000,
        squadChange: +2.1,
        fanChange: +18,
        description: 'Wätjen unterschreibt mit Stolz! „Dortmund ist mein Verein.“ Großer Jubel bei den Fans.',
      },
      {
        id: 'waetjen_bonus',
        label: 'Staffelvertrag mit Einsatzprämien & Boni (-2.5 Mio. €)',
        badge: 'Leistungsbezogen',
        cost: 2500000,
        squadChange: +1.6,
        fanChange: +10,
        description: 'Fairer Vertrag: Spielt er sich in die Startelf, steigen seine Bezüge automatisch.',
      },
      {
        id: 'waetjen_sell',
        label: 'Für 12 Mio. € an Premier League verkaufen (+12 Mio. €)',
        badge: 'Ablöse-Deal',
        cost: -12000000,
        squadChange: -1.0,
        fanChange: -16,
        description: 'Das Geld hilft kurzfristig, aber die Fans werfen der Führung Verrat an den eigenen Werten vor.',
      },
      {
        id: 'waetjen_wait',
        label: 'Verhandlungen auf die Winterpause vertagen (0 €)',
        badge: 'Pokern',
        cost: 0,
        squadChange: +0.2,
        fanChange: -4,
        description: 'Wätjen wartet ab, ob Kovac ihm in den ersten Saisonspielen tatsächlich Spielzeit schenkt.',
      },
    ],
  },

  // 5. FINANZEN & STADION
  {
    id: 'stadium_sound_roof',
    category: 'finance',
    categoryLabel: 'Finanzen & Stadion',
    title: 'Signal Iduna Park: Dachsanierung & Sound-Upgrade',
    subtitle: 'Modernisierung der Akustik & Flutlichtanlage für die Gelbe Wand',
    scenario: 'Das Westfalenstadion feiert Jubiläum. Die Statik des legendären Pylonen-Dachs verlangt Modernisierungen:',
    choices: [
      {
        id: 'stad_high_end',
        label: 'High-End-Sanierung mit 360°-LED & Mega-Soundsystem (-15 Mio. €)',
        badge: 'Weltklasse-Arena',
        cost: 15000000,
        squadChange: +1.2,
        fanChange: +20,
        description: 'Gänsehaut bei Flutlichtspielen! Der Signal Iduna Park zementiert seinen Ruf als beste Arena der Welt.',
      },
      {
        id: 'stad_standard',
        label: 'Sicherheits-Grundsanierung ohne Schnickschnack (-6 Mio. €)',
        badge: 'Vernunft',
        cost: 6000000,
        squadChange: 0,
        fanChange: +6,
        description: 'Alles technisch einwandfrei und sicher. Das Geld reicht weiterhin für Neuzugänge.',
      },
      {
        id: 'stad_solar',
        label: 'Grüner BVB: Komplettes Solardach installieren (-8 Mio. € / +1.5 Mio. p.a.)',
        badge: 'Nachhaltigkeit',
        cost: 8000000,
        squadChange: +0.4,
        fanChange: +15,
        description: 'Das Stadion wird autark mit Sonnenenergie versorgt. Riesiges Lob von Stadt & Medien.',
      },
      {
        id: 'stad_delay',
        label: 'Arbeiten um 2 Jahre nach hinten schieben (0 €)',
        badge: 'Aufschub',
        cost: 0,
        squadChange: 0,
        fanChange: -4,
        description: 'Keine Kosten im aktuellen Transferfenster, aber Reparaturen werden später wohl teurer.',
      },
    ],
  },
  {
    id: 'sponsor_jersey',
    category: 'finance',
    categoryLabel: 'Finanzen & Stadion',
    title: 'Neuer Haupt- und Trikotsponsor',
    subtitle: 'Streit um die traditionsreichen BVB-Farben Schwarz-Gelb',
    scenario: 'Der aktuelle Trikotvertrag läuft aus. Zwei globale Konzerne bieten gigantische Summen, verlangen aber Zugeständnisse:',
    choices: [
      {
        id: 'spons_traditional',
        label: 'Partner wählt nur reines Schwarz-Gelb (+24 Mio. €)',
        badge: 'Farb-Treue',
        cost: -24000000,
        squadChange: +1.2,
        fanChange: +22,
        description: 'Das Trikot bleibt absolut farbrein! Die Südtribüne feiert deinen Respekt vor den Klubfarben.',
      },
      {
        id: 'spons_max_money',
        label: 'Maximales 40-Mio.-Paket nehmen – Logo bleibt knallbunt (+40 Mio. €)',
        badge: 'Rekord-Erlös',
        cost: -40000000,
        squadChange: +2.5,
        fanChange: -12,
        description: 'Riesiges Budget für Champions-League-Stars, doch die Fans protestieren gegen das bunte Logo.',
      },
      {
        id: 'spons_local',
        label: 'Ruhrgebiets-Mittelständler mit Herzblut wählen (+18 Mio. €)',
        badge: 'Echte Liebe',
        cost: -18000000,
        squadChange: +0.8,
        fanChange: +18,
        description: 'Ein bodenständiges Dortmunder Unternehmen ziert die Brust. Pure regionale Identifikation.',
      },
      {
        id: 'spons_fan_vote',
        label: 'Fans per App über die 3 besten Designs abstimmen lassen (+22 Mio. €)',
        badge: 'Mitbestimmung',
        cost: -22000000,
        squadChange: +1.0,
        fanChange: +25,
        description: 'Rekordbeteiligung! Das Trikot wird zum weltweiten Verkaufsschlager in den Fanshops.',
      },
    ],
  },
  {
    id: 'retro_merch',
    category: 'finance',
    categoryLabel: 'Finanzen & Stadion',
    title: 'Merchandising-Coup: 1997 Retro-Kollektion',
    subtitle: 'Champions-League-Sieger Trikot als weltweite Neuauflage',
    scenario: 'Zum Jahrestag des Champions-League-Triumphes von 1997 schlägt das Marketing eine exklusive Kollektion vor:',
    choices: [
      {
        id: 'retro_global',
        label: 'Weltweite Großkampagne mit Puma (+12 Mio. € Gewinn)',
        badge: 'Global Hit',
        cost: -12000000,
        squadChange: +0.8,
        fanChange: +14,
        description: 'Von Tokio bis Los Angeles reißen Sammler dem BVB das neongelbe 97er Trikot aus den Händen!',
      },
      {
        id: 'retro_charity',
        label: 'Gewinn zu 50% an die BVB-Stiftung „leuchte auf“ spenden (+6 Mio. €)',
        badge: 'Herz für Dortmund',
        cost: -6000000,
        squadChange: +0.4,
        fanChange: +22,
        description: 'Soziale Projekte im Ruhrgebiet erhalten Millionen. Gewaltiges positives Medienecho.',
      },
      {
        id: 'retro_members',
        label: 'Exklusiv & rabattiert nur für Vereinsmitglieder (+3 Mio. €)',
        badge: 'Mitglieder-Privileg',
        cost: -3000000,
        squadChange: 0,
        fanChange: +18,
        description: 'Tausende neue Mitgliedsanträge fluten die Geschäftsstelle am Rheinlanddamm.',
      },
      {
        id: 'retro_cancel',
        label: 'Projekt absagen – Fokus rein auf das Sportliche (0 €)',
        badge: 'Sport-Fokus',
        cost: 0,
        squadChange: 0,
        fanChange: -2,
        description: 'Keine Ablenkung durch Marketing, aber 12 Mio. € Einnahmepotenzial bleiben ungenutzt.',
      },
    ],
  },
  {
    id: 'yellow_wall_naming',
    category: 'finance',
    categoryLabel: 'Finanzen & Stadion',
    title: 'Sponsoren-Angebot für die „Gelbe Wand“',
    subtitle: 'Amerikanischer Tech-Konzern bietet 80 Mio. € für Sponsoren-Zusatz',
    scenario: 'Ein US-Gigant will die Südtribüne offiziell branden („Tech Giant Yellow Wall“). Die Chefetage diskutiert hitzig:',
    choices: [
      {
        id: 'yw_reject',
        label: 'Kategorisch & empört ablehnen: Die Südtribüne bleibt heilig! (0 €)',
        badge: 'Unverkäuflich',
        cost: 0,
        squadChange: 0,
        fanChange: +30,
        description: 'Monumentaler Beifall der gesamten Fanszene! „Dortmunder Werte sind für kein Geld der Welt käuflich.“',
      },
      {
        id: 'yw_accept',
        label: 'Annehmen & 80 Mio. € in Weltstars investieren (+80 Mio. €)',
        badge: 'Tabubruch',
        cost: -80000000,
        squadChange: +4.0,
        fanChange: -35,
        description: 'Du kaufst Superstars, doch die Südtribüne tritt in den Stimmungs-Streik. Eisige Atmosphäre.',
      },
      {
        id: 'yw_counter',
        label: 'Gegenvorschlag: Sponsor finanziert Fan-Projekt gegen Rassismus (+15 Mio. €)',
        badge: 'Kluge Wendung',
        cost: -15000000,
        squadChange: +1.0,
        fanChange: +20,
        description: 'Der Sponsor akzeptiert die soziale Initiative. Geld in der Kasse und intakte Werte!',
      },
      {
        id: 'yw_subtle',
        label: 'Nur kleinen Schriftzug auf Bechern und Tickets erlauben (+10 Mio. €)',
        badge: 'Kompromiss',
        cost: -10000000,
        squadChange: +0.6,
        fanChange: +5,
        description: 'Die Tribüne behält ihren Namen unberührt, während der BVB 10 Mio. zusätzliche Einnahmen verbucht.',
      },
    ],
  },

  // 6. KRISEN-MANAGEMENT
  {
    id: 'kobel_injury',
    category: 'crisis',
    categoryLabel: 'Krisen-Management',
    title: 'Verletzungsschock: Gregor Kobel fällt 3 Monate aus',
    subtitle: 'Muskelbündelriss im Abschlusstraining vor der Champions League',
    scenario: 'Der Schweizer Rückhalt im Tor muss unters Messer. Das Transferfenster ist noch 48 Stunden geöffnet:',
    choices: [
      {
        id: 'kobel_buy_vet',
        label: 'Erfahrenen Bundesliga-Torhüter fest verpflichten (-9 Mio. €)',
        badge: 'Notfall-Kauf',
        cost: 9000000,
        squadChange: +1.8,
        fanChange: +8,
        description: 'Ein erfahrener Schlussmann kommt sofort und strahlt Ruhe im Strafraum aus.',
      },
      {
        id: 'kobel_trust_meyer',
        label: 'Alexander Meyer das volle Vertrauen als Nr. 1 schenken (0 €)',
        badge: 'Loyalität',
        cost: 0,
        squadChange: +1.0,
        fanChange: +14,
        description: 'Meyer bedankt sich mit Glanztaten und hält im ersten Champions-League-Spiel den Sieg fest!',
      },
      {
        id: 'kobel_loan_talent',
        label: 'Top-Talent aus der Premier League für 6 Monate leihen (-3 Mio. €)',
        badge: 'Leih-Lösung',
        cost: 3000000,
        squadChange: +1.4,
        fanChange: +6,
        description: 'Konkurrenzkampf entfacht. Beide Keeper pushen sich im Training zu Höchstleistungen.',
      },
      {
        id: 'kobel_u23',
        label: 'U23-Keeper hochziehen & Torwart-Trainer-Legende einbinden (-0.8 Mio. €)',
        badge: 'Ausbildungs-Chance',
        cost: 800000,
        squadChange: +0.6,
        fanChange: +10,
        description: 'Mutige Entscheidung, die das Vertrauen in die eigene BVB-Torwartschule stärkt.',
      },
    ],
  },
  {
    id: 'media_rumors',
    category: 'crisis',
    categoryLabel: 'Krisen-Management',
    title: 'Presse-Attacke: Medien spekulieren über Trainer-Entlassung',
    subtitle: 'Reißerische Schlagzeilen nach einem schwachen Auswärts-Unentschieden',
    scenario: 'Boulevardblätter schreiben von Unruhe in der Mannschaft und fordern Kovacs Kopf. Wie reagiert die Geschäftsführung?',
    choices: [
      {
        id: 'med_speech',
        label: 'Flammende Presseerklärung für Kovac mit Vertragsverlängerung (-2 Mio. €)',
        badge: 'Volles Bekenntnis',
        cost: 2000000,
        squadChange: +1.8,
        fanChange: +12,
        description: 'Die Unruhe ist mit einem Schlag beendet. Die Mannschaft antwortet mit einer Siegesserie!',
      },
      {
        id: 'med_currywurst',
        label: 'Hintergrundgespräch mit Journalisten bei Currywurst & Pils (-0.05 Mio. €)',
        badge: 'Dortmunder Charme',
        cost: 50000,
        squadChange: +0.8,
        fanChange: +10,
        description: 'Offene, ehrliche Worte entwaffnen die Kritiker. Die Berichterstattung wird sachlich und fair.',
      },
      {
        id: 'med_ultimatum',
        label: 'Internes Ultimatum: 7 Punkte aus 3 Spielen gefordert (0 €)',
        badge: 'Erfolgsdruck',
        cost: 0,
        squadChange: +0.5,
        fanChange: -2,
        description: 'Der Druck steigt spürbar. Die Mannschaft liefert Ergebnisse, wirkt jedoch verkrampft.',
      },
      {
        id: 'med_silence',
        label: 'Totales Medien-Embargo verhängen (0 €)',
        badge: 'Wagenburg',
        cost: 0,
        squadChange: 0,
        fanChange: -8,
        description: 'Der Verein igelt sich ein. Die Journalisten spekulieren noch wilder weiter.',
      },
    ],
  },
  {
    id: 'medical_overhaul',
    category: 'crisis',
    categoryLabel: 'Krisen-Management',
    title: 'Muskelverletzungs-Serie stoppen',
    subtitle: 'Drei Leistungsträger fallen zeitgleich mit Muskelzerrungen aus',
    scenario: 'Die Ausfalltage beim BVB sind über dem Ligaschnitt. Niko Kovac fordert ein radikales Umdenken im Ärzteteam:',
    choices: [
      {
        id: 'med_doc_star',
        label: 'Weltberühmten Sportmediziner aus Zürich abwerben (-3 Mio. €)',
        badge: 'Top-Mediziner',
        cost: 3000000,
        squadChange: +2.8,
        fanChange: +12,
        description: 'Der neue Chefarzt revolutioniert Diagnose und Reha. Die Verletzungsrate sinkt um 60%!',
      },
      {
        id: 'med_ai_system',
        label: 'KI-gestütztes GPS- & Muskel-Frühwarnsystem anschaffen (-1 Mio. €)',
        badge: 'Hightech-Prävention',
        cost: 1000000,
        squadChange: +2.2,
        fanChange: +8,
        description: 'Drohende Überlastungen werden erkannt, bevor Fasern reißen. Höchste Verfügbarkeit der Stars.',
      },
      {
        id: 'med_physio_double',
        label: 'Physio- und Osteopathie-Team verdoppeln (-1.4 Mio. €)',
        badge: 'Mehr Hände',
        cost: 1400000,
        squadChange: +2.0,
        fanChange: +10,
        description: 'Intensive Einzelbehandlung nach jedem Training. Die Spieler fühlen sich optimal betreut.',
      },
      {
        id: 'med_reduce_intensity',
        label: 'Trainingsintensität vorübergehend drosseln (0 €)',
        badge: 'Schonung',
        cost: 0,
        squadChange: -0.6,
        fanChange: -4,
        description: 'Weniger Verletzungen, aber im Spieltempo gegen Bayern und Leipzig fehlt die Spritzigkeit.',
      },
    ],
  },
  {
    id: 'winter_camp',
    category: 'tactics',
    categoryLabel: 'Taktik & Kabine',
    title: 'Winter-Trainingslager: Marbella oder Dortmund?',
    subtitle: 'Entscheidung über die Vorbereitung auf die Rückrunde',
    scenario: 'Im Januar pausiert die Liga. Vier verschiedene Vorbereitungs-Konzepte liegen auf deinem Schreibtisch:',
    choices: [
      {
        id: 'camp_marbella',
        label: 'Luxus-Camp in Marbella mit Top-Rasen & Sonne (-1.4 Mio. €)',
        badge: 'Beste Bedingungen',
        cost: 1400000,
        squadChange: +2.4,
        fanChange: +6,
        description: 'Perfekte Plätze, 20 Grad und taktischer Feinschliff bringen die Mannschaft in Topform.',
      },
      {
        id: 'camp_dortmund',
        label: 'In Dortmund bleiben mit Fan-Nähe & Glühwein-Abend (0 €)',
        badge: 'Echte Bodenständigkeit',
        cost: 0,
        squadChange: +0.8,
        fanChange: +20,
        description: 'Tausende Fans frieren mit den Profis. Unglaublicher Zusammenhalt für die Rückrunde!',
      },
      {
        id: 'camp_asia_tour',
        label: 'Asien-Minitour mit lukrativen Testspielen (+4.5 Mio. € Erlös)',
        badge: 'Geld & Globalisierung',
        cost: -4500000,
        squadChange: -0.5,
        fanChange: -2,
        description: 'Volle Kassen und neue Fans in Japan, aber Jetlag schwächt die ersten beiden Ligaspiele.',
      },
      {
        id: 'camp_alps',
        label: 'Alpen-Hütte mit Survival-Teambuilding (-0.8 Mio. €)',
        badge: 'Kameradschaft',
        cost: 800000,
        squadChange: +1.9,
        fanChange: +12,
        description: 'Schneeschuh-Wandern und Kaminfeuer: Die Truppe wächst zu einer unzerstörbaren Einheit zusammen.',
      },
    ],
  },
];

// Helper to randomly pick N unique scenarios
function sampleRandomScenarios(pool: ManagerScenarioTemplate[], count: number = 7): ManagerRound[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((item, index) => ({
    ...item,
    roundNumber: index + 1,
    totalRounds: count,
  }));
}

export function BvbManagerGame() {
  const [budget, setBudget] = useState<number>(100000000); // 100 Mio €
  const [squadRating, setSquadRating] = useState<number>(84.5);
  const [fanSatisfaction, setFanSatisfaction] = useState<number>(82);
  const [rounds, setRounds] = useState<ManagerRound[]>(() => sampleRandomScenarios(BVB_SCENARIO_POOL, 7));
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [history, setHistory] = useState<{
    roundTitle: string;
    choiceLabel: string;
    cost: number;
    squadChange: number;
    fanChange: number;
  }[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentRound = rounds[currentRoundIdx];

  const handleMakeChoice = (choice: ManagerChoice) => {
    const newBudget = budget - choice.cost;
    const newSquad = Math.min(99, Math.max(70, squadRating + choice.squadChange));
    const newFans = Math.min(100, Math.max(10, fanSatisfaction + choice.fanChange));

    setBudget(newBudget);
    setSquadRating(parseFloat(newSquad.toFixed(1)));
    setFanSatisfaction(Math.round(newFans));

    setHistory((prev) => [
      ...prev,
      {
        roundTitle: currentRound.title,
        choiceLabel: choice.label,
        cost: choice.cost,
        squadChange: choice.squadChange,
        fanChange: choice.fanChange,
      },
    ]);

    if (currentRoundIdx + 1 < rounds.length) {
      setCurrentRoundIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
      playStadiumCheerSound();
      playBVBSoundTrack('anthem');
    }
  };

  const handleRestart = () => {
    setBudget(100000000);
    setSquadRating(84.5);
    setFanSatisfaction(82);
    setRounds(sampleRandomScenarios(BVB_SCENARIO_POOL, 7));
    setCurrentRoundIdx(0);
    setHistory([]);
    setIsFinished(false);
  };

  const handleReshuffleNow = () => {
    setBudget(100000000);
    setSquadRating(84.5);
    setFanSatisfaction(82);
    setRounds(sampleRandomScenarios(BVB_SCENARIO_POOL, 7));
    setCurrentRoundIdx(0);
    setHistory([]);
    setIsFinished(false);
  };

  // Grade calculation
  const getGrade = () => {
    let score = 0;
    if (budget >= 35000000) score += 30;
    else if (budget >= 0) score += 20;
    else score += 5;

    if (squadRating >= 92) score += 35;
    else if (squadRating >= 87) score += 25;
    else score += 10;

    if (fanSatisfaction >= 90) score += 35;
    else if (fanSatisfaction >= 75) score += 25;
    else score += 10;

    if (score >= 90) return { letter: 'A+', title: 'Meister-Manager (Legendär)', color: 'text-[#FDE100]' };
    if (score >= 78) return { letter: 'A', title: 'Champions League Niveau', color: 'text-emerald-400' };
    if (score >= 65) return { letter: 'B', title: 'Solide BVB-Performance', color: 'text-blue-400' };
    if (score >= 50) return { letter: 'C', title: 'Durchschnittliches Transferfenster', color: 'text-amber-400' };
    return { letter: 'F', title: 'Transfer-Debakel', color: 'text-rose-500' };
  };

  const getCategoryTheme = (cat: ManagerCategory) => {
    switch (cat) {
      case 'transfers':
        return {
          icon: DollarSign,
          badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          accent: 'border-emerald-500/30',
        };
      case 'tactics':
        return {
          icon: Award,
          badgeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-400',
          accent: 'border-blue-500/30',
        };
      case 'fans':
        return {
          icon: Heart,
          badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          accent: 'border-amber-500/30',
        };
      case 'youth':
        return {
          icon: GraduationCap,
          badgeBg: 'bg-purple-500/15 border-purple-500/40 text-purple-400',
          accent: 'border-purple-500/30',
        };
      case 'finance':
        return {
          icon: Building2,
          badgeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
          accent: 'border-cyan-500/30',
        };
      case 'crisis':
        return {
          icon: AlertTriangle,
          badgeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
          accent: 'border-rose-500/30',
        };
      default:
        return {
          icon: Sparkles,
          badgeBg: 'bg-slate-700 border-slate-600 text-slate-200',
          accent: 'border-slate-700',
        };
    }
  };

  const currentTheme = currentRound ? getCategoryTheme(currentRound.category) : getCategoryTheme('transfers');
  const CategoryIcon = currentTheme.icon;

  return (
    <div className="space-y-6">
      {/* MANAGER DASHBOARD HEADER */}
      <div className="bg-gradient-to-r from-[#111318] via-[#1c1f2b] to-[#111318] p-5 rounded-2xl border border-[#FDE100]/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#FDE100] text-black font-extrabold text-xs uppercase tracking-wider font-bvb">
              BVB Fan-Game #2
            </span>
            <span className="text-xs text-slate-400 font-mono">
              28 Szenarien-Pool • Zufalls-Saison • Niko Kovac & Kehl
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-bvb uppercase tracking-wide mt-1 flex items-center gap-2">
            💼 BVB-Manager: Saison-Entscheidungen
          </h2>
        </div>

        {/* CONTROLS & METRICS DISPLAY */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleReshuffleNow}
            title="Neue zufällige 7 Szenarien ziehen"
            className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-[#FDE100] rounded-xl text-xs font-mono text-slate-300 hover:text-[#FDE100] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Neu mischen</span>
          </button>

          <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Restbudget</div>
            <div className={`text-lg font-black font-mono ${budget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(budget / 1000000).toFixed(1)} Mio. €
            </div>
          </div>

          <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Kaderstärke</div>
            <div className="text-lg font-black text-[#FDE100] font-mono flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-[#FDE100]" />
              <span>{squadRating}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Südtribüne</div>
            <div className="text-lg font-black text-amber-400 font-mono flex items-center gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{fanSatisfaction}%</span>
            </div>
          </div>
        </div>
      </div>

      {!isFinished && currentRound ? (
        /* ACTIVE ROUND SCENARIO CARD */
        <div className="bg-[#111318] p-6 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
          {/* ROUND & CATEGORY HEADER */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FDE100]/20 text-[#FDE100] border border-[#FDE100]/40 font-mono text-xs font-bold">
                Runde {currentRound.roundNumber} von {currentRound.totalRounds}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono inline-flex items-center gap-1.5 ${currentTheme.badgeBg}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
                <span>{currentRound.categoryLabel}</span>
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Zufalls-Szenario aus 28er Pool
            </span>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-black text-white font-bvb uppercase tracking-wide">
              {currentRound.title}
            </h3>
            <p className="text-sm font-bold text-[#FDE100] font-sans mt-0.5">{currentRound.subtitle}</p>
            <p className="text-sm text-slate-300 font-sans mt-3 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {currentRound.scenario}
            </p>
          </div>

          {/* OPTIONS GRID (RESPONSIVE: 1 COL MOBILE, 2 COLS TABLET/DESKTOP) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider font-bvb block">
                Wähle deine Manager-Entscheidung ({currentRound.choices.length} Optionen):
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Konsequenzen für Finanzen, Team & Fans</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentRound.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleMakeChoice(choice)}
                  className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-[#FDE100] p-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-md hover:shadow-lg hover:shadow-[#FDE100]/10"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-extrabold text-sm text-white group-hover:text-[#FDE100] transition-colors font-bvb">
                        {choice.label}
                      </div>
                      {choice.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {choice.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                      {choice.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className={choice.cost > 0 ? 'text-rose-400 font-bold' : choice.cost < 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {choice.cost > 0
                        ? `- ${(choice.cost / 1000000).toFixed(1)} Mio. €`
                        : choice.cost < 0
                        ? `+ ${(Math.abs(choice.cost) / 1000000).toFixed(1)} Mio. €`
                        : '0 €'}
                    </span>
                    <span className="text-[#FDE100]">
                      Kader {choice.squadChange >= 0 ? `+${choice.squadChange}` : choice.squadChange}
                    </span>
                    <span className={choice.fanChange >= 0 ? 'text-amber-400' : 'text-slate-400'}>
                      Fans {choice.fanChange >= 0 ? `+${choice.fanChange}%` : `${choice.fanChange}%`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* FINISHED MANAGER EVALUATION CERTIFICATE */
        <div className="bg-slate-900/95 p-8 rounded-2xl border-2 border-[#FDE100] space-y-6 shadow-2xl text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#FDE100]/20 border-2 border-[#FDE100] mx-auto flex items-center justify-center text-[#FDE100]">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-[#FDE100] text-black font-extrabold text-xs uppercase tracking-wider font-bvb">
              Offizielles BVB-Managerzeugnis
            </span>
            <h3 className={`text-4xl font-black font-bvb uppercase tracking-wide mt-3 ${getGrade().color}`}>
              Note {getGrade().letter} – {getGrade().title}
            </h3>
            <p className="text-sm text-slate-300 font-sans mt-2">
              Die 7 Runden deiner Saison unter Cheftrainer Niko Kovac und Sebastian Kehl sind offiziell abgeschlossen!
            </p>
          </div>

          {/* FINAL METRICS SUMMARY GRID */}
          <div className="grid grid-cols-3 gap-3 bg-black/60 p-4 rounded-xl border border-slate-800 font-mono text-sm">
            <div>
              <div className="text-[10px] text-slate-400 uppercase">Restbudget</div>
              <div className={`font-extrabold ${budget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(budget / 1000000).toFixed(1)} Mio. €
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Finaler Kader-Index</div>
              <div className="font-extrabold text-[#FDE100]">{squadRating}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Südtribünen-Rückhalt</div>
              <div className="font-extrabold text-amber-400">{fanSatisfaction}%</div>
            </div>
          </div>

          {/* DECISION AUDIT HISTORY */}
          {history.length > 0 && (
            <div className="text-left bg-black/40 p-4 rounded-xl border border-slate-800/80 space-y-2 max-h-60 overflow-y-auto">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-bvb">
                Deine getroffenen Entscheidungen ({history.length}):
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-none">
                    <span className="text-slate-300 truncate max-w-[280px]">
                      {i + 1}. {h.roundTitle}
                    </span>
                    <span className="text-[#FDE100] font-semibold truncate max-w-[220px]">
                      {h.choiceLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-xl text-sm font-bvb uppercase tracking-wider shadow-lg shadow-[#FDE100]/30 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Neue Saison starten (Frische 7 Fragen)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
