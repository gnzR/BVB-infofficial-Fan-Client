import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Beer, Heart, Eye, Sparkles, AlertTriangle, CheckCircle2, X, Volume2 } from 'lucide-react';

type EasterEggStage = 'question' | 'answer_bvb' | 'answer_beer' | 'answer_schalke';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  isYellow: boolean;
}

export const SchalkerEasterEggModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<EasterEggStage>('question');
  const [dodgeCount, setDodgeCount] = useState(0);
  const [dodgeOffset, setDodgeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [deconProgress, setDeconProgress] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const clickTimestampsRef = useRef<number[]>([]);
  const lastEventTimeRef = useRef<number>(0);

  // Global listener for 4 rapid right-clicks anywhere in the application
  useEffect(() => {
    const recordRightClick = (e: MouseEvent) => {
      const now = performance.now();
      // Deduplicate mousedown(button=2) and contextmenu firing for the same physical click
      if (now - lastEventTimeRef.current < 45) {
        if (clickTimestampsRef.current.length >= 2) {
          e.preventDefault();
        }
        return;
      }
      lastEventTimeRef.current = now;

      // Keep only right-clicks within the last 1500ms window
      const recent = clickTimestampsRef.current.filter((t) => now - t < 1500);
      recent.push(now);
      clickTimestampsRef.current = recent;

      // Prevent native browser context menu when user is rapidly right-clicking
      if (recent.length >= 2) {
        e.preventDefault();
      }

      if (recent.length >= 4) {
        e.preventDefault();
        clickTimestampsRef.current = [];
        setStage('question');
        setDodgeCount(0);
        setDodgeOffset({ x: 0, y: 0 });
        setDeconProgress(0);
        setIsOpen(true);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      recordRightClick(e);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        recordRightClick(e);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Generate black & yellow confetti when Answer 1 is selected
  useEffect(() => {
    if (stage === 'answer_bvb') {
      const pieces: ConfettiPiece[] = Array.from({ length: 42 }, (_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.6,
        size: 8 + Math.floor(Math.random() * 10),
        isYellow: idx % 2 === 0,
      }));
      setConfetti(pieces);
    } else {
      setConfetti([]);
    }
  }, [stage]);

  // Run Decontamination Progress bar when Answer 3 (Schalke) is selected
  useEffect(() => {
    if (stage !== 'answer_schalke') return;
    setDeconProgress(0);
    const interval = window.setInterval(() => {
      setDeconProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 110);

    return () => window.clearInterval(interval);
  }, [stage]);

  // Evasive button logic (Lösung 3) for Option 3
  const handleEvadeSchalkeButton = () => {
    if (dodgeCount >= 2) return; // After 2 dodges, let the user click it!
    const nextCount = dodgeCount + 1;
    setDodgeCount(nextCount);

    // Jump to a noticeable offset inside the modal
    const directions = [
      { x: 68, y: -22 },
      { x: -64, y: 18 },
      { x: 52, y: 20 },
      { x: -55, y: -18 },
    ];
    const chosen = directions[nextCount % directions.length];
    setDodgeOffset(chosen);
  };

  const handleSelectSchalke = () => {
    if (dodgeCount < 1) {
      handleEvadeSchalkeButton();
      return;
    }
    setDodgeOffset({ x: 0, y: 0 });
    setStage('answer_schalke');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Black & Yellow Confetti Overlay for Answer 1 */}
      {stage === 'answer_bvb' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[10000]">
          {confetti.map((c) => (
            <div
              key={c.id}
              style={{
                left: `${c.left}%`,
                width: `${c.size}px`,
                height: `${c.size * 1.4}px`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
              }}
              className={`absolute -top-6 rounded-sm animate-bounce shadow-md ${
                c.isYellow
                  ? 'bg-[#FDE100] border border-black/40 shadow-[#FDE100]/50'
                  : 'bg-[#111111] border border-[#FDE100]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Flashing Decontamination Border for Answer 3 */}
      {stage === 'answer_schalke' && deconProgress < 100 && (
        <div className="fixed inset-0 pointer-events-none z-[9998] border-[10px] border-[#FDE100] animate-pulse bg-[#FDE100]/10" />
      )}

      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-b from-slate-900 via-[#0d1117] to-black border-2 border-[#FDE100] shadow-[0_0_60px_rgba(253,225,0,0.35)] overflow-hidden">
        {/* Top Security Warning Stripe */}
        <div className="bg-[#FDE100] text-black px-5 py-2.5 flex items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4 text-black animate-bounce" />
            <span>SÜDTRIBÜNEN-TÜRSTEHER • SEKTIONSKONTROLLE 09</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-black/70 hover:text-black p-1 rounded-lg hover:bg-black/10 transition-colors"
            title="Fenster schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {/* STAGE 1: THE QUESTION */}
          {stage === 'question' && (
            <div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-[#FDE100]/15 border-2 border-[#FDE100] flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(253,225,0,0.25)]">
                  <span className="text-3xl">🤨</span>
                </div>
                <div>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40 mb-1.5">
                    4x Hektischer Rechtsklick erkannt
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                    Du bist aber kein <span className="text-[#FDE100] underline decoration-wavy">Schalker</span>, oder?
                  </h2>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
                Moment mal, Kollege! Wer hier 4-mal so nervös mit der rechten Maustaste im Westfalenstadion herumklickt, macht sich extrem verdächtig. Bevor wir dich weiterlassen: <strong className="text-[#FDE100]">Wie lautet deine Ausrede?</strong>
              </p>

              <div className="space-y-3.5 relative">
                {/* ANSWER 1: PURE BVB */}
                <button
                  onClick={() => setStage('answer_bvb')}
                  className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-[#FDE100] to-amber-400 hover:from-[#ffe838] hover:to-amber-300 text-black font-bold border-2 border-black shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-3.5 group"
                >
                  <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">🖤💛</span>
                  <div>
                    <div className="text-sm sm:text-base font-black uppercase tracking-tight">
                      „Niemals! Mein Blut ist rein Schwarz-Gelb (Echte Liebe)!“
                    </div>
                    <div className="text-xs font-medium text-black/75 mt-0.5">
                      Dauerkarte Block 12 im Herzen – ich wollte nur den Rasen testen!
                    </div>
                  </div>
                </button>

                {/* ANSWER 2: FINGER CRAMP / BRINKHOFF'S */}
                <button
                  onClick={() => setStage('answer_beer')}
                  className="w-full text-left p-4 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-bold border border-slate-700 hover:border-[#FDE100]/60 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-3.5 group"
                >
                  <span className="text-2xl shrink-0 group-hover:rotate-12 transition-transform">🍺</span>
                  <div>
                    <div className="text-sm sm:text-base font-bold text-[#FDE100]">
                      „Beruhig dich, Chef! Ich hatte nur einen Krampf im Finger – hol mir lieber ein Brinkhoff’s!“
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Vor lauter Aufregung an der Maus abgerutscht. Passiert den Besten!
                    </div>
                  </div>
                </button>

                {/* ANSWER 3: SCHALKE CONFESSION (WITH EVASIVE BUTTON GAG FROM LÖSUNG 3) */}
                <div className="pt-1 relative">
                  {dodgeCount > 0 && (
                    <div className="mb-2 text-center animate-bounce">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/40">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        {dodgeCount === 1
                          ? 'Halt Stopp! Bist du dir WIRKLICH sicher?! Überleg’s dir noch mal!'
                          : 'Letzte Warnung vom Türsteher! Beim nächsten Klick gibt’s die Schwarz-Gelb-Dusche!'}
                      </span>
                    </div>
                  )}

                  <button
                    onMouseEnter={handleEvadeSchalkeButton}
                    onClick={handleSelectSchalke}
                    style={{
                      transform: `translate(${dodgeOffset.x}px, ${dodgeOffset.y}px)`,
                      transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                    className="w-full text-left p-3.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 text-blue-200 border border-blue-500/30 hover:border-blue-400/60 shadow-md flex items-center gap-3.5 group"
                  >
                    <span className="text-2xl shrink-0">🔵⚪</span>
                    <div>
                      <div className="text-sm font-bold text-blue-300">
                        „Ähm… Glück auf?! Ich wollte nur mal heimlich gucken, wie sich eine Meisterschale anfühlt…“
                      </div>
                      <div className="text-[11px] text-blue-400/80 mt-0.5">
                        {dodgeCount === 0
                          ? '(Gefährliche Antwort – auf eigene Gefahr anklicken!)'
                          : dodgeCount === 1
                          ? '(Der Button weicht aus! Versuch’s noch mal, wenn du dich traust…)'
                          : '(Okay, der Türsteher hält ihn jetzt fest – klick drauf!)'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2A: ANSWER 1 (PURE BVB) */}
          {stage === 'answer_bvb' && (
            <div className="text-center py-3">
              <div className="w-20 h-20 rounded-full bg-[#FDE100] text-black flex items-center justify-center mx-auto mb-4 border-4 border-black shadow-[0_0_40px_rgba(253,225,0,0.6)]">
                <CheckCircle2 className="w-11 h-11 stroke-[2.5]" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> 100 % Echte Liebe verifiziert
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
                Test bestanden! Willkommen auf der <span className="text-[#FDE100]">Südtribüne</span>!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-6">
                „Entschuldige die Kontrolle, Borusse! Wer so leidenschaftlich auf der Maus herumhämmert, hat eindeutig das schwarz-gelbe Vollgas-Gen. Dein Platz in Block 12 ist frei!“
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 rounded-xl bg-[#FDE100] hover:bg-[#ffe838] text-black font-black uppercase text-sm tracking-wider shadow-lg transition-transform active:scale-95"
              >
                Heja BVB! Weiter im Programm 🖤💛
              </button>
            </div>
          )}

          {/* STAGE 2B: ANSWER 2 (BRINKHOFF'S BEER) */}
          {stage === 'answer_beer' && (
            <div className="text-center py-3">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border-2 border-[#FDE100] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
                <Beer className="w-11 h-11 text-[#FDE100] animate-bounce" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                🍺 Stadion-Rezept gegen Fingerkrampf
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
                Na gut, lass ich noch mal <span className="text-[#FDE100]">durchgehen</span>!
              </h3>
              <div className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed bg-slate-950/90 border border-slate-800 rounded-xl p-4 mb-6 space-y-2">
                <p>
                  Der Stadion-Türsteher schiebt dir ein eiskaltes, frisch gezapftes <strong className="text-[#FDE100]">Brinkhoff’s No. 1</strong> über den Tresen:
                </p>
                <p className="italic text-[#FDE100] font-serif">
                  „Trink erst mal nen Schluck für die Nerven, Chef! Und beim nächsten Mal wieder geschmeidig mit links klicken – wir sind hier schließlich im Tempel und nicht auf dem Rummel!“
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 rounded-xl bg-[#FDE100] hover:bg-[#ffe838] text-black font-black uppercase text-sm tracking-wider shadow-lg transition-transform active:scale-95"
              >
                Prost & Weitermachen! 🍻
              </button>
            </div>
          )}

          {/* STAGE 2C: ANSWER 3 (SCHALKE -> DECONTAMINATION & BINOCULARS GAG) */}
          {stage === 'answer_schalke' && (
            <div className="py-2">
              <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-3.5 mb-4 flex items-center gap-3">
                <Volume2 className="w-7 h-7 text-red-400 shrink-0 animate-ping" />
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-red-300">
                    🚨 ALARM STUFE 09 • VERBOTENE FARBE IM SEKTOR ENTDECKT!
                  </div>
                  <div className="text-xs text-red-200/90">
                    Automatische Schwarz-Gelb-Dekontamination wurde sofort eingeleitet…
                  </div>
                </div>
              </div>

              {/* Binoculars / Fernglas Gag Box */}
              <div className="bg-slate-950 border border-[#FDE100]/50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#FDE100]/15 border border-[#FDE100] flex items-center justify-center shrink-0">
                    <Eye className="w-5 h-5 text-[#FDE100]" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-[#FDE100]">
                      🔭 Optischer Meisterschalen-Assistent (Fernglas-Modus)
                    </div>
                    <div className="text-sm font-black text-white">
                      Entfernung zur letzten Schalker Schale: <span className="text-[#FDE100]">68 Jahre (1958)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Kein Wunder, dass du hier heimlich reinguckst! Bei uns im BVB-Trophäenschrank stehen <strong className="text-[#FDE100]">8 Deutsche Meisterschaften, 5 DFB-Pokalsiege, 1 Champions-League-Titel und 1 Weltpokal</strong> – ganz ohne Schwarz-Weiß-Fernseher!
                </p>
              </div>

              {/* Live Decontamination Progress Bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-[#FDE100] uppercase tracking-wider">
                    {deconProgress < 100
                      ? '🧹 Spüle Königsblau aus dem Speicher – Ersetze durch BVB-Gold…'
                      : '✅ Schwarz-Gelb-Wäsche zu 100 % abgeschlossen!'}
                  </span>
                  <span className="font-mono text-white">{deconProgress}%</span>
                </div>
                <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#FDE100] via-amber-400 to-[#FDE100] rounded-full transition-all duration-150"
                    style={{ width: `${deconProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setStage('question');
                    setDodgeCount(0);
                    setDodgeOffset({ x: 0, y: 0 });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700"
                >
                  ← Zurück zur Befragung
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FDE100] hover:bg-[#ffe838] text-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 fill-black" />
                  Ich bereue alles – Ab jetzt nur noch BVB! 🖤💛
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
