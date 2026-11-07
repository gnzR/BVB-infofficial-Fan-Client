import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Target, Zap, Flame, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { playStadiumCheerSound } from '../../utils/cheerSound';
import { playBVBSoundTrack } from '../../utils/soundboardSynth';

interface PlayerProfile {
  id: string;
  name: string;
  number: number;
  role: 'striker' | 'keeper';
  power: number;
  accuracy: number;
  description: string;
}

const BVB_PLAYERS: PlayerProfile[] = [
  {
    id: 'guirassy',
    name: 'Serhou Guirassy',
    number: 9,
    role: 'striker',
    power: 94,
    accuracy: 88,
    description: 'Eiskalter Torjäger – brutale Schusskraft vor der Gelben Wand.',
  },
  {
    id: 'adeyemi',
    name: 'Karim Adeyemi',
    number: 27,
    role: 'striker',
    power: 86,
    accuracy: 92,
    description: 'Speedsprinter – Hohe Präzision & dynamischer Schuss.',
  },
  {
    id: 'brandt',
    name: 'Julian Brandt',
    number: 10,
    role: 'striker',
    power: 88,
    accuracy: 96,
    description: 'Spielleiter – Zirkelt den Ball zentimetergenau in den Winkel.',
  },
  {
    id: 'kobel',
    name: 'Gregor Kobel (Torwart)',
    number: 1,
    role: 'keeper',
    power: 90,
    accuracy: 94,
    description: 'Torwart-Modus – Hechte als Kobel & pariere gegnerische Elfmeter!',
  },
];

export type GoalZone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // 0=TopLeft ... 8=BotRight

// Precision Percentage Coordinates inside the unified Goal Stage
// The goal frame spans left: 8%, right: 92%, top: 10%, bottom: 74%
export interface ZoneCoord {
  id: GoalZone;
  label: string;
  isWinkel: boolean;
  ballLeft: number; // in % of pitch width
  ballTop: number;  // in % of pitch height
  keeperLeft: number;
  keeperTop: number;
  keeperRotate: number;
  divePose: 'high-left' | 'high-mid' | 'high-right' | 'mid-left' | 'center' | 'mid-right' | 'low-left' | 'low-mid' | 'low-right';
}

const GOAL_COORDINATES: Record<GoalZone, ZoneCoord> = {
  // Top Row (Kreuzeck & Latte)
  0: {
    id: 0,
    label: 'Kreuzeck Links',
    isWinkel: true,
    ballLeft: 22,
    ballTop: 20,
    keeperLeft: 25,
    keeperTop: 24,
    keeperRotate: -45,
    divePose: 'high-left',
  },
  1: {
    id: 1,
    label: 'Latte Mitte',
    isWinkel: false,
    ballLeft: 50,
    ballTop: 18,
    keeperLeft: 50,
    keeperTop: 20,
    keeperRotate: 0,
    divePose: 'high-mid',
  },
  2: {
    id: 2,
    label: 'Kreuzeck Rechts',
    isWinkel: true,
    ballLeft: 78,
    ballTop: 20,
    keeperLeft: 75,
    keeperTop: 24,
    keeperRotate: 45,
    divePose: 'high-right',
  },

  // Mid Row (Halbhoch & Zentrum)
  3: {
    id: 3,
    label: 'Halbhoch Links',
    isWinkel: false,
    ballLeft: 22,
    ballTop: 42,
    keeperLeft: 26,
    keeperTop: 42,
    keeperRotate: -30,
    divePose: 'mid-left',
  },
  4: {
    id: 4,
    label: 'Tormitte',
    isWinkel: false,
    ballLeft: 50,
    ballTop: 42,
    keeperLeft: 50,
    keeperTop: 44,
    keeperRotate: 0,
    divePose: 'center',
  },
  5: {
    id: 5,
    label: 'Halbhoch Rechts',
    isWinkel: false,
    ballLeft: 78,
    ballTop: 42,
    keeperLeft: 74,
    keeperTop: 42,
    keeperRotate: 30,
    divePose: 'mid-right',
  },

  // Low Row (Flach ins Eck & Mitte)
  6: {
    id: 6,
    label: 'Flach Links',
    isWinkel: true,
    ballLeft: 20,
    ballTop: 66,
    keeperLeft: 23,
    keeperTop: 63,
    keeperRotate: -25,
    divePose: 'low-left',
  },
  7: {
    id: 7,
    label: 'Flach Mitte',
    isWinkel: false,
    ballLeft: 50,
    ballTop: 66,
    keeperLeft: 50,
    keeperTop: 62,
    keeperRotate: 0,
    divePose: 'low-mid',
  },
  8: {
    id: 8,
    label: 'Flach Rechts',
    isWinkel: true,
    ballLeft: 80,
    ballTop: 66,
    keeperLeft: 77,
    keeperTop: 63,
    keeperRotate: 25,
    divePose: 'low-right',
  },
};

// Sound effects using Web Audio API
function playSoundFX(type: 'kick' | 'net' | 'post' | 'save' | 'catch') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    } else if (type === 'post') {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc2.type = 'square';
      osc.frequency.setValueAtTime(1020, ctx.currentTime);
      osc2.frequency.setValueAtTime(1480, ctx.currentTime);
      gain.gain.setValueAtTime(0.75, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.65);
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.7);
      osc2.stop(ctx.currentTime + 0.7);
    } else if (type === 'net') {
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.35);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.65, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'save' || type === 'catch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch {
    // Ignore audio context errors if blocked by browser policy
  }
}

// ====================================================================
// ATHLETIC GOALKEEPER COMPONENT (Professional Vector Artwork & Shading)
// ====================================================================
interface AthleticKeeperProps {
  pose: 'idle' | 'high-left' | 'high-mid' | 'high-right' | 'mid-left' | 'center' | 'mid-right' | 'low-left' | 'low-mid' | 'low-right' | 'scoop';
  isDiving: boolean;
  hasParried: boolean;
  isKobel: boolean;
}

function AthleticKeeper({ pose, isDiving, hasParried, isKobel }: AthleticKeeperProps) {
  // Athletic Jersey Palette
  // Gregor Kobel: BVB Neon Emerald Green with Black Accents
  // Opponent Keeper: Vivid Neon Orange/Black
  const jerseyColor = isKobel ? '#10b981' : '#f97316';
  const jerseyTrim = '#042f2e';
  const gloveColor = '#FDE100'; // BVB Yellow Grip Gloves
  const glovePalm = '#ef4444'; // Red grip latex pads

  // Dynamic limb angles depending on dive pose
  const isHighLeft = pose === 'high-left';
  const isHighRight = pose === 'high-right';
  const isHighMid = pose === 'high-mid';
  const isLowLeft = pose === 'low-left';
  const isLowRight = pose === 'low-right';
  const isLowMid = pose === 'low-mid' || pose === 'scoop';
  const isMidLeft = pose === 'mid-left';
  const isMidRight = pose === 'mid-right';

  return (
    <div className={`relative w-28 h-40 sm:w-32 sm:h-44 flex items-center justify-center select-none ${!isDiving ? 'animate-bounce' : ''}`} style={{ animationDuration: '2.5s' }}>
      <svg
        viewBox="0 0 140 180"
        className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] overflow-visible"
      >
        <defs>
          {/* Shading gradients */}
          <linearGradient id="jerseyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={jerseyColor} />
            <stop offset="70%" stopColor={jerseyColor} />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* LEGS & CLEATS */}
        {/* ======================================================== */}
        {isHighLeft && (
          // Leaping Left: Right trailing leg, Left power push leg
          <g>
            <path d="M 55 105 Q 40 135 25 155" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            <path d="M 75 105 Q 90 130 115 145" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" />
            <ellipse cx="20" cy="158" rx="8" ry="4" fill="#FDE100" />
            <ellipse cx="118" cy="147" rx="8" ry="4" fill="#FDE100" />
          </g>
        )}

        {isHighRight && (
          // Leaping Right: Left trailing leg, Right power push leg
          <g>
            <path d="M 85 105 Q 100 135 115 155" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            <path d="M 65 105 Q 50 130 25 145" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" />
            <ellipse cx="120" cy="158" rx="8" ry="4" fill="#FDE100" />
            <ellipse cx="22" cy="147" rx="8" ry="4" fill="#FDE100" />
          </g>
        )}

        {(isLowLeft || isMidLeft) && (
          // Sliding / diving low to the left
          <g>
            <path d="M 50 100 Q 25 115 5 125" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            <path d="M 75 102 Q 60 120 40 135" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" />
            <ellipse cx="4" cy="125" rx="8" ry="4" fill="#FDE100" />
            <ellipse cx="38" cy="136" rx="8" ry="4" fill="#FDE100" />
          </g>
        )}

        {(isLowRight || isMidRight) && (
          // Sliding / diving low to the right
          <g>
            <path d="M 90 100 Q 115 115 135 125" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            <path d="M 65 102 Q 80 120 100 135" stroke="#0f172a" strokeWidth="11" strokeLinecap="round" />
            <ellipse cx="136" cy="125" rx="8" ry="4" fill="#FDE100" />
            <ellipse cx="102" cy="136" rx="8" ry="4" fill="#FDE100" />
          </g>
        )}

        {(pose === 'idle' || isHighMid || isLowMid || pose === 'center') && (
          // Athletic Wide Ready Stance / Squat on line
          <g>
            {/* Left Leg */}
            <path d="M 52 105 L 42 145 L 36 170" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            {/* Right Leg */}
            <path d="M 88 105 L 98 145 L 104 170" stroke="#0f172a" strokeWidth="12" strokeLinecap="round" />
            {/* BVB Yellow Socks Rings */}
            <path d="M 38 148 L 44 148" stroke="#FDE100" strokeWidth="3" />
            <path d="M 96 148 L 102 148" stroke="#FDE100" strokeWidth="3" />
            {/* Cleats */}
            <ellipse cx="34" cy="172" rx="9" ry="4" fill="#FDE100" />
            <ellipse cx="106" cy="172" rx="9" ry="4" fill="#FDE100" />
          </g>
        )}

        {/* Goalkeeper Shorts */}
        <path d="M 46 95 L 94 95 L 98 115 L 75 112 L 70 112 L 42 115 Z" fill="url(#shortsGrad)" stroke="#090d16" strokeWidth="2" />

        {/* ======================================================== */}
        {/* ATHLETIC TORSO & BVB GOALKEEPER JERSEY */}
        {/* ======================================================== */}
        <g>
          {/* Muscular torso shape */}
          <path
            d="M 40 44 L 100 44 L 94 98 L 46 98 Z"
            fill="url(#jerseyGrad)"
            stroke={jerseyTrim}
            strokeWidth="2.5"
          />
          {/* Athletic shoulder contour & contrast stripes */}
          <path d="M 40 44 L 52 98" stroke="#000000" strokeWidth="2" opacity="0.25" />
          <path d="M 100 44 L 88 98" stroke="#000000" strokeWidth="2" opacity="0.25" />
          <path d="M 40 54 L 100 54" stroke="#ffffff" strokeWidth="1.5" opacity="0.2" />

          {/* BVB / GK Emblem on Chest */}
          <circle cx="56" cy="62" r="7" fill="#000000" />
          <circle cx="56" cy="62" r="6" fill="#FDE100" />
          <text x="56" y="65" fill="#000000" fontSize="6" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            BVB
          </text>

          {/* Number 1 for Gregor Kobel */}
          <text x="74" y="80" fill="#ffffff" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing="1">
            1
          </text>
        </g>

        {/* ======================================================== */}
        {/* HEAD, HAIR & FOCUSED FACE */}
        {/* ======================================================== */}
        <g>
          {/* Neck */}
          <rect x="63" y="34" width="14" height="12" rx="2" fill="#e2a77a" />
          {/* Athletic Head */}
          <circle cx="70" cy="26" r="16" fill="#f0be92" stroke="#d49a6a" strokeWidth="1" />
          {/* Modern Athletic Fade Hair / Styled */}
          <path d="M 54 22 C 54 10, 86 10, 86 22 C 86 16, 54 16, 54 22 Z" fill="#2d1b0d" />
          <path d="M 54 20 Q 70 8 86 20 L 86 26 L 82 24 L 58 24 L 54 26 Z" fill="#1e1108" />

          {/* Focused Eyes on the ball */}
          <ellipse cx="64" cy="26" rx="2.5" ry="2" fill="#ffffff" />
          <ellipse cx="76" cy="26" rx="2.5" ry="2" fill="#ffffff" />
          <circle cx="64" cy="26" r="1.2" fill="#000000" />
          <circle cx="76" cy="26" r="1.2" fill="#000000" />
          {/* Determined Eyebrows */}
          <path d="M 60 22 L 67 24" stroke="#1e1108" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 80 22 L 73 24" stroke="#1e1108" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* ======================================================== */}
        {/* ARMS & DETAILED GOALKEEPER GLOVES */}
        {/* ======================================================== */}
        {/* LEFT ARM & GLOVE */}
        {isHighLeft ? (
          // Reaching high up left
          <g>
            <path d="M 44 48 Q 20 25 2 12" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="2" cy="10" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="-4" y="5" width="12" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : isLowLeft ? (
          // Reaching low left
          <g>
            <path d="M 44 54 Q 15 70 -5 88" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="-5" cy="88" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="-10" y="84" width="12" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : isMidLeft ? (
          // Reaching mid left
          <g>
            <path d="M 44 50 Q 15 45 -4 42" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="-4" cy="42" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="-9" y="38" width="12" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : isHighMid ? (
          // Both arms high for crossbar
          <g>
            <path d="M 44 48 Q 38 20 34 -4" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="34" cy="-4" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="29" y="-8" width="10" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : (
          // Ready stance left arm
          <g>
            <path d="M 42 50 Q 22 58 14 74" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="14" cy="74" r="10" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="9" y="70" width="10" height="5" rx="2" fill={glovePalm} />
          </g>
        )}

        {/* RIGHT ARM & GLOVE */}
        {isHighRight ? (
          // Reaching high up right
          <g>
            <path d="M 96 48 Q 120 25 138 12" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="138" cy="10" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="132" y="5" width="12" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : isLowRight ? (
          // Reaching low right
          <g>
            <path d="M 96 54 Q 125 70 145 88" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="145" cy="88" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="138" y="84" width="12" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : isMidRight ? (
          // Reaching mid right
          <g>
            <path d="M 96 50 Q 125 45 144 42" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="144" cy="42" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="137" y="38" width="12" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : isHighMid ? (
          // Both arms high for crossbar
          <g>
            <path d="M 96 48 Q 102 20 106 -4" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="106" cy="-4" r="11" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="101" y="-8" width="10" height="6" rx="2" fill={glovePalm} />
          </g>
        ) : (
          // Ready stance right arm
          <g>
            <path d="M 98 50 Q 118 58 126 74" stroke={jerseyColor} strokeWidth="13" strokeLinecap="round" />
            <circle cx="126" cy="74" r="10" fill={gloveColor} stroke="#000000" strokeWidth="2" />
            <rect x="121" y="70" width="10" height="5" rx="2" fill={glovePalm} />
          </g>
        )}

        {/* Glove Save Shockwave Flash */}
        {hasParried && (
          <g className="animate-ping">
            <circle cx="70" cy="50" r="45" fill="none" stroke="#FDE100" strokeWidth="5" />
            <circle cx="70" cy="50" r="30" fill="#FDE100" opacity="0.5" />
          </g>
        )}
      </svg>
    </div>
  );
}

// ====================================================================
// MAIN PENALTY KING GAME
// ====================================================================
export function PenaltyKingGame() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile>(BVB_PLAYERS[0]);
  const [score, setScore] = useState<number>(0);
  const [shotsTaken, setShotsTaken] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('bvb_penalty_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Phases: 'aiming' | 'power' | 'animating' | 'result'
  const [gamePhase, setGamePhase] = useState<'aiming' | 'power' | 'animating' | 'result'>('aiming');
  const [selectedZone, setSelectedZone] = useState<GoalZone | null>(null);
  const [power, setPower] = useState<number>(50);
  const [isPowerRising, setIsPowerRising] = useState<boolean>(true);

  // Unified Coordinates for Ball & Goalkeeper
  const [keeperZone, setKeeperZone] = useState<GoalZone | null>(null);
  const [isKeeperDiving, setIsKeeperDiving] = useState<boolean>(false);
  const [hasParried, setHasParried] = useState<boolean>(false);
  const [netBulging, setNetBulging] = useState<boolean>(false);
  const [postClang, setPostClang] = useState<boolean>(false);

  // Ball position in % of pitch canvas (starts at 11m penalty spot)
  const [ballPos, setBallPos] = useState<{
    left: number;
    top: number;
    scale: number;
    rotate: number;
  }>({ left: 50, top: 88, scale: 1.0, rotate: 0 });

  const [lastShotResult, setLastShotResult] = useState<{
    success: boolean;
    type: 'GOAL' | 'SAVED' | 'POST' | 'OVER';
    message: string;
  } | null>(null);

  const powerRef = useRef<number>(50);

  // Power Meter Oscillation Loop
  useEffect(() => {
    if (gamePhase !== 'power') return;

    const interval = setInterval(() => {
      setPower((prev) => {
        let next = isPowerRising ? prev + 3.4 : prev - 3.4;
        if (next >= 100) {
          next = 100;
          setIsPowerRising(false);
        } else if (next <= 0) {
          next = 0;
          setIsPowerRising(true);
        }
        powerRef.current = Math.round(next);
        return Math.round(next);
      });
    }, 22);

    return () => clearInterval(interval);
  }, [gamePhase, isPowerRising]);

  // Handle Zone Selection
  const handleSelectZone = (zoneId: GoalZone) => {
    if (gamePhase !== 'aiming') return;
    setSelectedZone(zoneId);
    setGamePhase('power');
  };

  // Trigger Shoot Action & Animation Sequence
  const handleShoot = () => {
    if (gamePhase !== 'power' || selectedZone === null) return;
    const finalPower = powerRef.current;
    const isKeeperMode = selectedPlayer.role === 'keeper';
    const targetCoord = GOAL_COORDINATES[selectedZone];

    setGamePhase('animating');
    playSoundFX('kick');

    // ================================================================
    // CRITICAL FIX: REALISTIC FOOTBALL DIVE & OUTCOME LOGIC
    // ================================================================
    let isGoal = false;
    let shotType: 'GOAL' | 'SAVED' | 'POST' | 'OVER' = 'GOAL';
    let msg = '';
    let diveTargetZone: GoalZone = selectedZone;

    if (finalPower > 95) {
      // OVER THE BAR: Too much power
      isGoal = false;
      shotType = 'OVER';
      msg = 'Drüber! Zu viel Rücklage – der Ball saust über die Latte auf die Südtribüne!';
      // Keeper stays or dives slightly
      diveTargetZone = selectedZone;
    } else if (finalPower < 20) {
      // WEAK ROLLER: Ball rolls slowly down the middle, keeper scoops it up
      isGoal = false;
      shotType = 'SAVED';
      diveTargetZone = 7; // Low center scoop
      msg = 'Zu kraftlos geschossen! Der Torwart fängt den flachen Ball ganz lässig auf.';
    } else if (isKeeperMode) {
      // PLAYER IS GREGOR KOBEL:
      // CPU shoots somewhere. If player guessed the CPU corner, Kobel saves!
      const cpuShotZone: GoalZone = Math.floor(Math.random() * 9) as GoalZone;
      diveTargetZone = selectedZone;

      if (selectedZone === cpuShotZone) {
        isGoal = true; // Player guarded successfully!
        shotType = 'SAVED';
        msg = 'Klasse Parade von Gregor Kobel! Du hast die Ecke geahnt und den Ball festgehalten!';
      } else {
        isGoal = false;
        shotType = 'GOAL';
        msg = 'Tor für den Schützen! Kobel hechtete in die falsche Ecke.';
      }
    } else {
      // PLAYER IS STRIKER:
      // CPU Keeper decides which corner to dive to
      // 55% chance keeper chooses a different corner, 45% chance keeper guesses right corner
      const willGuessRight = Math.random() < 0.40;

      if (willGuessRight) {
        diveTargetZone = selectedZone; // Keeper guesses exact same corner!

        if (targetCoord.isWinkel && finalPower >= 70 && finalPower <= 90) {
          // Unstoppable corner shot even if keeper guessed correctly!
          isGoal = true;
          shotType = 'GOAL';
          msg = 'TRAUMTOR! Perfekt in den Knick gezirkelt – trotz Hechtsprung chancenlos für den Keeper!';
        } else if (finalPower > 85) {
          // Hammered past keeper's fingers
          isGoal = true;
          shotType = 'GOAL';
          msg = 'TOOOOR! Der Keeper war noch mit den Fingerspitzen dran, aber die Wucht war zu groß!';
        } else {
          // Keeper makes the save!
          isGoal = false;
          shotType = 'SAVED';
          msg = 'GLANZPARADE! Der Torhüter hechtet in die richtige Ecke und wehrt die Kugel ab!';
        }
      } else {
        // KEEPER JUMPED TO WRONG CORNER -> MUST BE A GOAL!
        // Choose any other zone that is NOT selectedZone
        const otherZones = ([0, 1, 2, 3, 4, 5, 6, 7, 8] as GoalZone[]).filter((z) => z !== selectedZone);
        diveTargetZone = otherZones[Math.floor(Math.random() * otherZones.length)];

        if (finalPower > 90 && Math.random() < 0.25) {
          // Hits post
          isGoal = false;
          shotType = 'POST';
          msg = 'ALUMINIUM! Der Ball klatscht mit voller Wucht an den Innenpfosten!';
        } else {
          isGoal = true;
          shotType = 'GOAL';
          msg = 'TOOOOR FÜR DEN BVB! Eiskalt verwandelt – der Torwart sprang in die falsche Ecke!';
        }
      }
    }

    // Set Keeper Dive Target
    setKeeperZone(diveTargetZone);
    setIsKeeperDiving(true);

    // ================================================================
    // BALL TRAJECTORY COORDINATE CALCULATION
    // ================================================================
    let finalBallLeft = targetCoord.ballLeft;
    let finalBallTop = targetCoord.ballTop;
    let finalBallScale = 0.52;

    if (shotType === 'OVER') {
      finalBallTop = 2; // Over crossbar into crowd
      finalBallScale = 0.45;
    } else if (finalPower < 20) {
      // Weak shot rolls only to keeper's feet in center
      finalBallLeft = 50;
      finalBallTop = 68;
      finalBallScale = 0.68;
    } else if (shotType === 'POST') {
      finalBallLeft = targetCoord.ballLeft < 50 ? 10 : 90; // Edge of post
      finalBallTop = 30;
    }

    // Trigger Ball Flight
    setBallPos({
      left: finalBallLeft,
      top: finalBallTop,
      scale: finalBallScale,
      rotate: 720,
    });

    // Moment of impact (480ms)
    setTimeout(() => {
      if (shotType === 'GOAL') {
        setNetBulging(true);
        playSoundFX('net');
        playStadiumCheerSound();
        playBVBSoundTrack('goal');
      } else if (shotType === 'SAVED') {
        setHasParried(true);
        playSoundFX('save');
        // Ball rebounds off gloves if hard, or stays in hands if scoop
        if (finalPower >= 20) {
          setBallPos((prev) => ({
            ...prev,
            top: prev.top + 8,
            scale: 0.62,
            rotate: prev.rotate + 180,
          }));
        }
      } else if (shotType === 'POST') {
        setPostClang(true);
        playSoundFX('post');
        setBallPos((prev) => ({
          ...prev,
          left: prev.left < 50 ? 2 : 98,
          top: prev.top + 16,
          scale: 0.65,
        }));
      } else if (shotType === 'OVER') {
        playBVBSoundTrack('whistle');
      }
    }, 480);

    // Conclude round at 1250ms
    setTimeout(() => {
      setShotsTaken((prev) => prev + 1);

      const wonRound = (selectedPlayer.role === 'striker' && isGoal) || (selectedPlayer.role === 'keeper' && shotType === 'SAVED');

      if (wonRound) {
        setScore((prev) => prev + 1);
        setStreak((prev) => {
          const next = prev + 1;
          if (next > highScore) {
            setHighScore(next);
            try {
              localStorage.setItem('bvb_penalty_highscore', next.toString());
            } catch {}
          }
          return next;
        });
      } else {
        setStreak(0);
        if (shotType !== 'OVER') {
          playBVBSoundTrack('whistle');
        }
      }

      setLastShotResult({ success: wonRound, type: shotType, message: msg });
      setGamePhase('result');
    }, 1250);
  };

  const handleNextShot = () => {
    setSelectedZone(null);
    setKeeperZone(null);
    setLastShotResult(null);
    setIsKeeperDiving(false);
    setHasParried(false);
    setNetBulging(false);
    setPostClang(false);
    setBallPos({ left: 50, top: 88, scale: 1.0, rotate: 0 });
    setPower(50);
    setGamePhase('aiming');
  };

  const handleResetGame = () => {
    setScore(0);
    setShotsTaken(0);
    setStreak(0);
    handleNextShot();
  };

  // Determine Active Keeper Pose & Position
  const activeDiveCoord = keeperZone !== null ? GOAL_COORDINATES[keeperZone] : null;

  const currentKeeperLeft = isKeeperDiving && activeDiveCoord ? activeDiveCoord.keeperLeft : 50;
  const currentKeeperTop = isKeeperDiving && activeDiveCoord ? activeDiveCoord.keeperTop : 56;
  const currentKeeperRotate = isKeeperDiving && activeDiveCoord ? activeDiveCoord.keeperRotate : 0;
  const currentKeeperPose = isKeeperDiving && activeDiveCoord ? activeDiveCoord.divePose : 'idle';

  return (
    <div className="space-y-6 select-none font-sans">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-[#111318] via-[#1a1d26] to-[#111318] p-5 rounded-2xl border border-[#FDE100]/30 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#FDE100] text-black font-extrabold text-xs uppercase tracking-wider font-bvb">
              BVB Fan-Game #1
            </span>
            <span className="text-xs text-slate-400 font-mono">Signal Iduna Park • Südtribüne</span>
          </div>
          <h2 className="text-2xl font-black text-white font-bvb uppercase tracking-wide mt-1 flex items-center gap-2">
            ⚽ Elfmeter-König vor der Gelben Wand
          </h2>
        </div>

        {/* STATS BADGES */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Tore / Versuche</div>
            <div className="text-lg font-black text-[#FDE100] font-mono">{score} / {shotsTaken}</div>
          </div>

          <div className="px-3.5 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Aktuelle Serie</div>
            <div className="text-lg font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>{streak}</span>
            </div>
          </div>

          <div className="px-3.5 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
            <div className="text-[10px] text-amber-300 font-mono uppercase">Rekord-Streak</div>
            <div className="text-lg font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" />
              <span>{highScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PLAYER SELECTOR */}
      <div className="bg-[#111318] p-4 rounded-xl border border-slate-800">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-bvb block mb-3">
          Wähle deinen BVB-Schützen oder Torwart Gregor Kobel:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BVB_PLAYERS.map((player) => (
            <button
              key={player.id}
              onClick={() => {
                setSelectedPlayer(player);
                handleNextShot();
              }}
              className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                selectedPlayer.id === player.id
                  ? 'bg-[#FDE100]/15 border-[#FDE100] text-white shadow-md shadow-[#FDE100]/20'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-[#FDE100]/40 flex items-center justify-center text-sm font-extrabold font-bvb text-[#FDE100] shrink-0">
                #{player.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-white truncate font-bvb">{player.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{player.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* UNIFIED 3D PERSPECTIVE PITCH & GOAL ARENA                      */}
      {/* Both the Goal, 9 Aiming Zones, Keeper and Ball share 1 canvas  */}
      {/* ============================================================== */}
      <div className="relative bg-gradient-to-b from-[#060c18] via-[#051a14] to-[#03110d] p-4 sm:p-6 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl">
        
        {/* Background Südtribüne Banner */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#FDE100]/15 via-[#FDE100]/5 to-transparent pointer-events-none flex flex-col items-center justify-start pt-3 overflow-hidden">
          <div className="flex items-center gap-4 opacity-30 text-amber-200">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold">★ BORUSSIA DORTMUND ★</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold">25.000 STEHPLÄTZE</span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-mono font-bold">★ GELBE WAND ★</span>
          </div>
          <span className="text-4xl sm:text-7xl font-black text-[#FDE100]/10 tracking-widest font-bvb uppercase select-none mt-2">
            SÜDTRIBÜNE
          </span>
          <div className="absolute top-1 left-8 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-1 right-8 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Phase Guidance Badge */}
        <div className="relative text-center mb-4 z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-[#FDE100]/40 rounded-full text-xs text-[#FDE100] font-mono shadow-lg">
            {selectedPlayer.role === 'keeper'
              ? '🧤 KOBEL-MODUS: Wähle die Ecke, in die du zum Abwehren hechten willst!'
              : gamePhase === 'aiming'
              ? '🎯 SCHRITT 1: Wähle deine Ziel-Ecke im Tor'
              : gamePhase === 'power'
              ? '⚡ SCHRITT 2: Stoppe die Schusskraft im grünen Bereich und drücke SCHIESSEN!'
              : gamePhase === 'animating'
              ? '⚽ BALL FLIEGT INS TOR...'
              : '🏁 Schuss ausgewertet!'}
          </span>
        </div>

        {/* ============================================================== */}
        {/* UNIFIED STADIUM STAGE CONTAINER (Aspect 16:11, Relative canvas) */}
        {/* ============================================================== */}
        <div className="relative w-full max-w-2xl mx-auto aspect-[16/11] min-h-[360px] sm:min-h-[420px] rounded-xl overflow-hidden border border-emerald-900/60 bg-emerald-950/40 shadow-inner">
          
          {/* Turf Lawn & Striping Perspective */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a231b] via-[#093527] to-[#0d4633] pointer-events-none">
            {/* Lawn stripes */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
            {/* 16-Meter Box Arc */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-28 border-t-2 border-white/20 rounded-t-full pointer-events-none" />
          </div>

          {/* ============================================================ */}
          {/* THE SOCCER GOAL (Left 10% to 90%, Top 12% to 68%)             */}
          {/* ============================================================ */}
          <div className="absolute left-[10%] right-[10%] top-[12%] h-[56%] z-10 pointer-events-none">
            
            {/* Net mesh with bulge animation */}
            <div className={`absolute inset-0 bg-black/40 border border-white/20 rounded-t-sm transition-transform duration-200 ${netBulging ? 'scale-[1.04] bg-[#FDE100]/10 shadow-[0_0_30px_rgba(253,225,0,0.5)]' : ''}`}>
              <svg className="w-full h-full opacity-45" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="netMesh" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M 0 0 L 14 14 M 14 0 L 0 14" fill="none" stroke="#ffffff" strokeWidth="0.7" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#netMesh)" />
              </svg>
              {/* Depth shadow inside goal */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/60" />
            </div>

            {/* Goal Posts & Crossbar (White Steel Frame with Highlights) */}
            <div className="absolute inset-0 border-t-[10px] sm:border-t-[12px] border-x-[10px] sm:border-x-[12px] border-slate-100 rounded-t-sm shadow-[0_15px_25px_rgba(0,0,0,0.9)]">
              {/* Metallic 3D Highlight sheen */}
              <div className="absolute -top-[10px] sm:-top-[12px] inset-x-0 h-1 bg-gradient-to-r from-slate-400 via-white to-slate-400" />
              <div className="absolute top-0 -left-[10px] sm:-left-[12px] bottom-0 w-1 bg-gradient-to-b from-white via-slate-300 to-slate-500" />
              <div className="absolute top-0 -right-[10px] sm:-right-[12px] bottom-0 w-1 bg-gradient-to-b from-white via-slate-300 to-slate-500" />
            </div>

            {/* White Goal Line on Turf */}
            <div className="absolute -bottom-1 inset-x-0 h-2 bg-white/90 shadow-md" />
          </div>

          {/* ============================================================ */}
          {/* 9 AIMING TARGET SECTORS (Exact match with Goal Frame)        */}
          {/* ============================================================ */}
          <div className="absolute left-[10%] right-[10%] top-[12%] h-[56%] grid grid-cols-3 grid-rows-3 gap-1 p-1 z-20">
            {([0, 1, 2, 3, 4, 5, 6, 7, 8] as GoalZone[]).map((zoneId) => {
              const zone = GOAL_COORDINATES[zoneId];
              const isSelected = selectedZone === zoneId;
              const isKeeperHere = keeperZone === zoneId && (gamePhase === 'animating' || gamePhase === 'result');

              return (
                <button
                  key={zoneId}
                  disabled={gamePhase !== 'aiming'}
                  onClick={() => handleSelectZone(zoneId)}
                  className={`relative rounded-md transition-all flex flex-col items-center justify-center p-1 text-center font-mono ${
                    gamePhase === 'aiming'
                      ? 'cursor-pointer hover:bg-[#FDE100]/25 hover:border-2 hover:border-[#FDE100] group'
                      : 'cursor-default'
                  } ${
                    isSelected
                      ? 'bg-[#FDE100]/30 border-2 border-[#FDE100] shadow-[0_0_15px_#FDE100]'
                      : 'border border-white/5 bg-transparent'
                  }`}
                >
                  {gamePhase === 'aiming' && (
                    <div className="opacity-45 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                      <Target
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          zone.isWinkel ? 'text-[#FDE100]' : 'text-slate-300'
                        } group-hover:scale-125 transition-transform`}
                      />
                      <span className="text-[9px] sm:text-[10px] text-white font-bold mt-0.5">
                        {zone.label}
                      </span>
                      {zone.isWinkel && (
                        <span className="text-[7px] sm:text-[8px] text-[#FDE100] font-extrabold uppercase">
                          Winkel ★
                        </span>
                      )}
                    </div>
                  )}

                  {/* Result overlay badges on zones */}
                  {gamePhase === 'result' && isSelected && lastShotResult?.type === 'GOAL' && (
                    <div className="absolute inset-0 bg-emerald-500/40 border-2 border-emerald-400 rounded-md flex items-center justify-center text-white font-black text-xs sm:text-sm animate-pulse z-30">
                      ⚽ TOR!
                    </div>
                  )}

                  {gamePhase === 'result' && isKeeperHere && lastShotResult?.type === 'SAVED' && (
                    <div className="absolute inset-0 bg-rose-500/40 border-2 border-rose-400 rounded-md flex items-center justify-center text-rose-100 font-black text-xs sm:text-sm z-30">
                      🧤 GEHALTEN!
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* THE ATHLETIC GOALKEEPER (Smoothly positioned in Canvas)      */}
          {/* ============================================================ */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-15 pointer-events-none transition-all ease-out"
            style={{
              left: `${currentKeeperLeft}%`,
              top: `${currentKeeperTop}%`,
              transform: `translate(-50%, -50%) rotate(${currentKeeperRotate}deg)`,
              transitionDuration: isKeeperDiving ? '460ms' : '220ms',
            }}
          >
            {/* Overhead Badge */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/85 border border-[#FDE100]/40 rounded text-[9px] font-mono text-emerald-300 whitespace-nowrap shadow-md">
              {selectedPlayer.role === 'keeper' ? '🧤 Gregor Kobel' : '🧤 Torwart'}
            </div>

            <AthleticKeeper
              pose={currentKeeperPose}
              isDiving={isKeeperDiving}
              hasParried={hasParried}
              isKobel={selectedPlayer.role === 'keeper'}
            />
          </div>

          {/* ============================================================ */}
          {/* 11M PENALTY SPOT (Chalk Dot on Pitch)                        */}
          {/* ============================================================ */}
          <div className="absolute left-1/2 bottom-[10%] -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
            <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] border border-slate-300" />
            <div className="text-[10px] text-emerald-300/80 font-mono mt-1">11m Punkt</div>
          </div>

          {/* ============================================================ */}
          {/* THE SOCCER BALL (Trajectory from 11m to exact Goal Zone)     */}
          {/* ============================================================ */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none transition-all ease-out"
            style={{
              left: `${ballPos.left}%`,
              top: `${ballPos.top}%`,
              transform: `translate(-50%, -50%) scale(${ballPos.scale}) rotate(${ballPos.rotate}deg)`,
              transitionDuration: gamePhase === 'animating' ? '480ms' : '0ms',
            }}
          >
            {/* Ball Shadow on Grass */}
            <div
              className="w-10 h-3 bg-black/60 rounded-full blur-[2px] -mb-1 mx-auto transition-opacity"
              style={{ opacity: gamePhase === 'animating' ? 0.25 : 0.7 }}
            />

            {/* High-Res BVB Soccer Ball */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white shadow-2xl relative overflow-hidden border border-slate-400 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Telstar pentagons */}
                <polygon points="50,32 64,42 59,58 41,58 36,42" fill="#111318" />
                <polygon points="50,5 34,17 38,32 50,32 62,32 66,17" fill="#111318" />
                <polygon points="85,30 68,36 64,42 75,56 90,48" fill="#111318" />
                <polygon points="15,30 32,36 36,42 25,56 10,48" fill="#111318" />
                <polygon points="50,85 68,76 60,62 40,62 32,76" fill="#111318" />
                {/* Yellow accents */}
                <polygon points="76,82 92,68 85,55 70,62" fill="#FDE100" />
                <polygon points="24,82 8,68 15,55 30,62" fill="#FDE100" />
              </svg>
            </div>
          </div>

          {/* Post Metallic Clang Flash */}
          {postClang && (
            <div className="absolute top-[28%] left-[10%] w-8 h-8 rounded-full bg-[#FDE100] animate-ping z-30" />
          )}
        </div>

        {/* ============================================================== */}
        {/* POWER TIMING METER                                             */}
        {/* ============================================================== */}
        {gamePhase === 'power' && (
          <div className="mt-4 max-w-md mx-auto bg-slate-900/95 p-4 rounded-xl border border-[#FDE100]/60 shadow-2xl text-center space-y-3 z-30 relative animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1 text-[#FDE100]">
                <Zap className="w-4 h-4" /> Schusskraft & Timing:
              </span>
              <span className="font-mono text-[#FDE100] font-extrabold text-sm">{power}%</span>
            </div>

            {/* Visual Power Bar */}
            <div className="relative h-7 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-[#FDE100] to-rose-600 shadow-md"
                style={{ width: `${power}%` }}
              />

              {/* Sweet spot marker (70% - 90%) */}
              <div className="absolute inset-y-0 left-[70%] w-[20%] bg-emerald-400/30 border-x-2 border-emerald-400 flex items-center justify-center text-[9px] text-emerald-200 font-black uppercase">
                ★ OPTIMUM ★
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
              <span>0% (Zu kraftlos)</span>
              <span className="text-emerald-400 font-bold">80% (Winkel-Perfektion)</span>
              <span className="text-rose-400 font-bold">100% (Drüber!)</span>
            </div>

            <button
              onClick={handleShoot}
              className="w-full py-3.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-xl text-base uppercase tracking-wider font-bvb shadow-lg shadow-[#FDE100]/30 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>SCHIESSEN!</span>
            </button>
          </div>
        )}

        {/* SHOT ANIMATING INDICATOR */}
        {gamePhase === 'animating' && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/90 border border-[#FDE100] text-[#FDE100] font-bold text-sm shadow-xl animate-pulse font-bvb">
              <span>⚽ Schuss läuft! Torhüter hechtet...</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* RESULT BANNER & REPLAY CONTROLS                                */}
        {/* ============================================================== */}
        {gamePhase === 'result' && lastShotResult && (
          <div className="mt-5 max-w-lg mx-auto bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border-2 border-[#FDE100] text-center space-y-4 shadow-2xl animate-fade-in relative z-30">
            <div className="flex items-center justify-center gap-2">
              {lastShotResult.success ? (
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
            </div>

            <div>
              <h3 className={`text-2xl font-black font-bvb uppercase tracking-wide ${lastShotResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                {lastShotResult.type === 'GOAL'
                  ? '🎉 TOOOOR FÜR DEN BVB!'
                  : lastShotResult.type === 'SAVED'
                  ? '🧤 GLANZPARADE DES KEEPERS!'
                  : lastShotResult.type === 'POST'
                  ? '💥 ALUMINIUM-TREFFER!'
                  : '❌ DRÜBER GESCHOSSEN!'}
              </h3>
              <p className="text-sm text-slate-300 font-sans mt-1.5">{lastShotResult.message}</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleNextShot}
                className="px-6 py-2.5 bg-[#FDE100] hover:bg-[#ffe733] text-black font-extrabold rounded-xl text-sm font-bvb uppercase tracking-wider cursor-pointer shadow-md hover:scale-105 transition-transform"
              >
                Nächster Elfmeter ⚽
              </button>

              <button
                onClick={handleResetGame}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Neu starten</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
