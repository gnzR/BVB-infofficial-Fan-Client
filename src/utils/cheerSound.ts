/**
 * Synthesizes a 2.5s BVB Stadium Cheer sound effect ("Südtribüne / Yellow Wall")
 * using the Web Audio API without external audio file dependencies.
 */
export function playStadiumCheerSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const duration = 2.5;

    // --- 1. Stadium Horn Blast (Harmonic Brass Rise) ---
    const hornOsc1 = ctx.createOscillator();
    const hornOsc2 = ctx.createOscillator();
    const hornGain = ctx.createGain();

    hornOsc1.type = 'sawtooth';
    hornOsc2.type = 'square';

    // Pitch sweep: 180Hz rising to 320Hz then settling
    hornOsc1.frequency.setValueAtTime(180, now);
    hornOsc1.frequency.exponentialRampToValueAtTime(320, now + 0.3);
    hornOsc1.frequency.linearRampToValueAtTime(300, now + 1.2);

    hornOsc2.frequency.setValueAtTime(360, now);
    hornOsc2.frequency.exponentialRampToValueAtTime(640, now + 0.3);
    hornOsc2.frequency.linearRampToValueAtTime(600, now + 1.2);

    // Horn Volume Envelope
    hornGain.gain.setValueAtTime(0.001, now);
    hornGain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    hornGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    // Lowpass filter to give brass stadium timbre
    const hornFilter = ctx.createBiquadFilter();
    hornFilter.type = 'lowpass';
    hornFilter.frequency.setValueAtTime(1200, now);

    hornOsc1.connect(hornGain);
    hornOsc2.connect(hornGain);
    hornGain.connect(hornFilter);
    hornFilter.connect(ctx.destination);

    hornOsc1.start(now);
    hornOsc2.start(now);
    hornOsc1.stop(now + 1.6);
    hornOsc2.stop(now + 1.6);

    // --- 2. Stadium Crowd Cheer (Filtered Pink/White Noise Roar) ---
    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filter algorithm
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // scale down
      b6 = white * 0.115926;
    }

    const crowdSource = ctx.createBufferSource();
    crowdSource.buffer = noiseBuffer;

    // Bandpass filter to simulate crowd roar frequencies (400Hz - 2500Hz)
    const crowdFilter = ctx.createBiquadFilter();
    crowdFilter.type = 'bandpass';
    crowdFilter.frequency.setValueAtTime(800, now);
    crowdFilter.Q.setValueAtTime(0.8, now);

    // Dynamic swell for "Goal / Cheer" surge
    const crowdGain = ctx.createGain();
    crowdGain.gain.setValueAtTime(0.01, now);
    crowdGain.gain.linearRampToValueAtTime(0.45, now + 0.3); // Initial roar burst
    crowdGain.gain.linearRampToValueAtTime(0.30, now + 1.2); // Prolonged cheering
    crowdGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    crowdSource.connect(crowdFilter);
    crowdFilter.connect(crowdGain);
    crowdGain.connect(ctx.destination);

    crowdSource.start(now);
    crowdSource.stop(now + duration);

    // Clean up context after playback
    setTimeout(() => {
      ctx.close();
    }, duration * 1000 + 300);

  } catch (err) {
    console.warn("Audio Context cheer sound error:", err);
  }
}

/**
 * Synthesizes a realistic 0.3s Newspaper Page Flip / Paper Rustle sound effect
 * using Web Audio API for news updates.
 */
export function playPageFlipSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const duration = 0.35;

    const bufferSize = ctx.sampleRate * duration;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Highpass filter for crisp paper friction texture
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + duration);
    filter.Q.setValueAtTime(1.5, now);

    // Short rustle envelope (fast attack, double flutter decay)
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.12);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);

    setTimeout(() => {
      ctx.close();
    }, duration * 1000 + 100);

  } catch (e) {
    console.warn('Page flip sound error:', e);
  }
}
