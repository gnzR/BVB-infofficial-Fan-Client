// BVB 09 Goal Alert & Stadium Anthem Synthesizer (Idee 2) + .ics Calendar Exporter (Idee 1)

export interface GoalAlertPayload {
  id?: string;
  scorer: string;
  minute: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  assist?: string;
  isTest?: boolean;
  isBvbGoal?: boolean;
}

export interface UpcomingBvbMatch {
  id: string;
  dateIso: string; // e.g. "2026-11-21T15:30:00"
  dateFormatted: string; // e.g. "Sa., 21.11.2026"
  timeFormatted: string; // e.g. "15:30 Uhr"
  competition: string;
  matchday: string;
  homeTeam: string;
  awayTeam: string;
  isHome: boolean;
  opponent: string;
  venue: string;
  city: string;
}

const ALERT_ENABLED_KEY = 'bvb_goal_alert_enabled_v1';
const SOUND_ENABLED_KEY = 'bvb_goal_sound_enabled_v1';

type GoalAlertListener = (alert: GoalAlertPayload | null) => void;
const listeners = new Set<GoalAlertListener>();

export function isGoalAlertEnabled(): boolean {
  try {
    const val = localStorage.getItem(ALERT_ENABLED_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setGoalAlertEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(ALERT_ENABLED_KEY, String(enabled));
  } catch {}
}

export function isGoalSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(SOUND_ENABLED_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setGoalSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {}
}

export function subscribeToGoalAlerts(fn: GoalAlertListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// Authentic synthesized Signal Iduna Park Stadium Goal Horn + Fanfare + Crowd Roar via Web Audio API
export function playBvbGoalAnthem(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // 1. Deep Stadium Goal Horn (Two-tone brass chord at 0.0s - 1.1s)
    const hornFreqs = [146.83, 220.0, 293.66]; // D3, A3, D4 power chord
    hornFreqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.08);
      gain.gain.setValueAtTime(0.14, now + 0.85);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.18);
    });

    // 2. Joyful BVB Goal Fanfare Melody ("Olé, jetzt kommt der BVB!" motif) starting at 1.15s
    const notes = [
      { f: 587.33, t: 1.18, d: 0.22 }, // D5
      { f: 587.33, t: 1.44, d: 0.22 }, // D5
      { f: 659.25, t: 1.70, d: 0.22 }, // E5
      { f: 739.99, t: 1.96, d: 0.35 }, // F#5
      { f: 659.25, t: 2.35, d: 0.22 }, // E5
      { f: 739.99, t: 2.60, d: 0.25 }, // F#5
      { f: 880.00, t: 2.90, d: 0.65 }, // A5
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);
      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.22, now + n.t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.02);
    });

    // 3. Simulated Südtribüne Crowd Roar (Filtered White Noise Swell)
    const bufferSize = ctx.sampleRate * 3.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(0.7, now);

    const crowdGain = ctx.createGain();
    crowdGain.gain.setValueAtTime(0.001, now);
    crowdGain.gain.exponentialRampToValueAtTime(0.09, now + 0.4);
    crowdGain.gain.setValueAtTime(0.09, now + 2.6);
    crowdGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    whiteNoise.connect(filter);
    filter.connect(crowdGain);
    crowdGain.connect(ctx.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 3.5);

    // Prevent Web Audio AudioContext resource leak
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 3800);
  } catch (e) {
    console.warn('Audio synthesizer warning:', e);
  }
}

let activeDismissTimer: number | null = null;

export function triggerGoalAlert(payload: GoalAlertPayload): void {
  if (!isGoalAlertEnabled() && !payload.isTest) return;

  if (isGoalSoundEnabled()) {
    playBvbGoalAnthem();
  }

  if (activeDismissTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(activeDismissTimer);
    activeDismissTimer = null;
  }

  for (const fn of listeners) {
    fn(payload);
  }

  if (typeof window !== 'undefined') {
    activeDismissTimer = window.setTimeout(() => {
      activeDismissTimer = null;
      for (const fn of listeners) {
        fn(null);
      }
    }, 12000);
  }

  // Native Desktop / Mobile Notification if supported
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification(`⚽ TOR FÜR BORUSSIA DORTMUND! (${payload.homeScore}:${payload.awayScore})`, {
          body: `${payload.scorer} (${payload.minute}) · ${payload.homeTeam} ${payload.homeScore}:${payload.awayScore} ${payload.awayTeam} (${payload.competition})`,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(`⚽ TOR FÜR BORUSSIA DORTMUND! (${payload.homeScore}:${payload.awayScore})`, {
              body: `${payload.scorer} (${payload.minute}) · ${payload.homeTeam} ${payload.homeScore}:${payload.awayScore} ${payload.awayTeam}`,
            });
          }
        });
      }
    } catch {}
  }
}

export function dismissGoalAlert(): void {
  if (activeDismissTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(activeDismissTimer);
    activeDismissTimer = null;
  }
  for (const fn of listeners) {
    fn(null);
  }
}

// ============================================================================
// IDEE 1: .ICS CALENDAR GENERATOR (Single Match or Full BVB Season Schedule)
// ============================================================================
function formatIcsDateUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function buildIcsEventBlock(m: UpcomingBvbMatch): string {
  const start = new Date(m.dateIso);
  const end = new Date(start.getTime() + 115 * 60 * 1000); // 1h 55m match duration
  const nowUtc = formatIcsDateUtc(new Date());
  const dtStart = formatIcsDateUtc(start);
  const dtEnd = formatIcsDateUtc(end);

  const summary = `⚽ BVB: ${m.homeTeam} vs. ${m.awayTeam} (${m.competition})`;
  const description = `${m.competition} - ${m.matchday}\\nAnstoß: ${m.dateFormatted} um ${m.timeFormatted}\\nStadion: ${m.venue}\\nExportiert aus dem BVB 09 Fan-Client.`;

  return [
    'BEGIN:VEVENT',
    `UID:bvb09-${m.id}@bvb09-fan-client.local`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${m.venue}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:Anpfiff in 30 Minuten: ${m.homeTeam} vs. ${m.awayTeam}`,
    'END:VALARM',
    'END:VEVENT',
  ].join('\r\n');
}

function triggerIcsDownload(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadSingleMatchIcs(match: UpcomingBvbMatch): void {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BVB 09 Fan-Client//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    buildIcsEventBlock(match),
    'END:VCALENDAR',
  ].join('\r\n');

  const safeOpp = match.opponent.replace(/[^a-zA-Z0-9äöüÄÖÜß-]/g, '-');
  triggerIcsDownload(`BVB-vs-${safeOpp}-${match.dateIso.slice(0, 10)}.ics`, ics);
}

export function downloadFullScheduleIcs(matches: UpcomingBvbMatch[]): void {
  const events = matches.map((m) => buildIcsEventBlock(m)).join('\r\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BVB 09 Fan-Client//DE',
    'X-WR-CALNAME:Borussia Dortmund Pflichtspiele 2026/27',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n');

  triggerIcsDownload('BVB-09-Spielplan-2026-27.ics', ics);
}
