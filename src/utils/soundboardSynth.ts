/**
 * BVB Südtribüne Soundboard Audio Synthesizer (Web Audio API)
 * Synthesizes 5 authentic BVB stadium audio tracks procedurally:
 * 1. Tor-Jubel & Horn (Goal explosion)
 * 2. BVB Torhymne ("Ole, hier kommt der BVB" Melody)
 * 3. Südtribüne Trommel (Stadium drum beat)
 * 4. Schiedsrichter-Pfiff (Referee Whistle)
 * 5. Stadion-Atmo (Crowd Roar Hum)
 */

export function playBVBSoundTrack(trackId: 'goal' | 'anthem' | 'drum' | 'whistle' | 'crowd'): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    switch (trackId) {
      case 'goal': {
        // Goal cheer + brass horn sweep
        const duration = 2.8;
        const horn1 = ctx.createOscillator();
        const horn2 = ctx.createOscillator();
        const hornGain = ctx.createGain();

        horn1.type = 'sawtooth';
        horn2.type = 'square';
        horn1.frequency.setValueAtTime(220, now);
        horn1.frequency.exponentialRampToValueAtTime(440, now + 0.3);
        horn2.frequency.setValueAtTime(440, now);
        horn2.frequency.exponentialRampToValueAtTime(880, now + 0.3);

        hornGain.gain.setValueAtTime(0.01, now);
        hornGain.gain.linearRampToValueAtTime(0.4, now + 0.15);
        hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        horn1.connect(hornGain);
        horn2.connect(hornGain);
        hornGain.connect(ctx.destination);
        horn1.start(now);
        horn2.start(now);
        horn1.stop(now + 1.8);
        horn2.stop(now + 1.8);

        // Crowd roar
        playCrowdNoise(ctx, now, duration, 0.5);
        break;
      }

      case 'anthem': {
        // BVB Hymn Melody ("Ole, hier kommt der BVB" - 4 notes)
        const notes = [
          { f: 392.00, d: 0.35 }, // G4
          { f: 440.00, d: 0.35 }, // A4
          { f: 493.88, d: 0.35 }, // B4
          { f: 523.25, d: 0.70 }, // C5
          { f: 493.88, d: 0.35 }, // B4
          { f: 440.00, d: 0.70 }, // A4
        ];
        let noteTime = now;
        notes.forEach(({ f, d }) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, noteTime);

          g.gain.setValueAtTime(0.01, noteTime);
          g.gain.linearRampToValueAtTime(0.35, noteTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, noteTime + d - 0.02);

          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + d);
          noteTime += d;
        });
        break;
      }

      case 'drum': {
        // Südtribüne Stadium Drum Rhythms (3 heavy thuds)
        [0, 0.4, 0.8, 1.1, 1.3].forEach((offset) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(110, now + offset);
          osc.frequency.exponentialRampToValueAtTime(40, now + offset + 0.15);

          g.gain.setValueAtTime(0.6, now + offset);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);

          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.22);
        });
        break;
      }

      case 'whistle': {
        // Referee Whistle (high dual frequency)
        const duration = 0.6;
        const w1 = ctx.createOscillator();
        const w2 = ctx.createOscillator();
        const wg = ctx.createGain();

        w1.type = 'sine';
        w2.type = 'sine';
        w1.frequency.setValueAtTime(2800, now);
        w2.frequency.setValueAtTime(2850, now);

        wg.gain.setValueAtTime(0.01, now);
        wg.gain.linearRampToValueAtTime(0.3, now + 0.05);
        wg.gain.exponentialRampToValueAtTime(0.001, now + duration);

        w1.connect(wg);
        w2.connect(wg);
        wg.connect(ctx.destination);
        w1.start(now);
        w2.start(now);
        w1.stop(now + duration);
        break;
      }

      case 'crowd': {
        // Prolonged Südtribüne Crowd Atmosphere
        playCrowdNoise(ctx, now, 3.5, 0.35);
        break;
      }
    }

    // Auto close audio context
    setTimeout(() => {
      ctx.close();
    }, 4000);
  } catch (err) {
    console.warn("Soundboard error:", err);
  }
}

function playCrowdNoise(ctx: AudioContext, now: number, duration: number, volume: number) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.15;
  }

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(900, now);
  filter.Q.setValueAtTime(0.7, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  src.start(now);
  src.stop(now + duration);
}
