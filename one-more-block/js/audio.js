/**
 * ONE MORE BLOCK - Audio & Haptics Engine
 * Procedural Web Audio API synthesizer (no external audio assets required)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.hapticsEnabled = true;
    this.masterGain = null;
    
    // Pentatonic scale frequencies for musical combo progression (C4 to C7)
    this.pentatonic = [
      261.63, 293.66, 329.63, 392.00, 440.00,  // Octave 4: C, D, E, G, A
      523.25, 587.33, 659.25, 783.99, 880.00,  // Octave 5: C, D, E, G, A
      1046.50, 1174.66, 1318.51, 1567.98, 1760.00, // Octave 6
      2093.00, 2349.32, 2637.02, 3135.96, 3520.00  // Octave 7
    ];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  setHaptics(enabled) {
    this.hapticsEnabled = enabled;
  }

  vibrate(pattern) {
    if (!this.hapticsEnabled || !('vibrate' in navigator)) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration errors
    }
  }

  // Soft tactile block placement thud
  playPlaceSound(pitchFactor = 1.0) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 * pitchFactor, t);
    osc.frequency.exponentialRampToValueAtTime(45 * pitchFactor, t + 0.12);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);

    this.vibrate(12);
  }

  // Musical chime when block placement is PERFECT (rises in pentatonic pitch)
  playPerfectSound(streak = 1) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const noteIdx = Math.min((streak - 1), this.pentatonic.length - 1);
    const freq = this.pentatonic[noteIdx];

    // Primary crystal chime (sine)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);

    // Harmonic bell overtone (higher octave triangle with fast decay)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, t);

    const decay = Math.min(0.35 + streak * 0.04, 0.8);
    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + decay);

    gain2.gain.setValueAtTime(0.18, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + (decay * 0.5));

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + decay);
    osc2.stop(t + decay);

    // Dynamic haptic pulse
    this.vibrate([20, 30, 25]);
  }

  // Big combo milestone celebration (e.g. 5x, 10x combo)
  playComboCelebration(comboLevel = 5) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const chord = comboLevel >= 10 
      ? [523.25, 659.25, 783.99, 1046.50] // C major quad
      : [440.00, 554.37, 659.25];         // A major triad

    chord.forEach((freq, idx) => {
      const startT = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.28, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startT);
      osc.stop(startT + 0.6);
    });

    this.vibrate([30, 40, 30, 40, 50]);
  }

  // Slice swoosh sound when overhang piece is cut off
  playSliceSound(cutRatio = 0.3) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400 - (cutRatio * 400), t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.12);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
    noise.stop(t + 0.12);

    this.vibrate([15, 25, 35]);
  }

  // Falling block sound when completely missed
  playMissSound() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.45);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.45);

    this.vibrate([50, 40, 80]);
  }

  // Game over sound
  playGameOverSound() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Sad minor cadence
    const notes = [220, 207.65, 196, 174.61]; // A3, G#3, G3, F3
    notes.forEach((freq, idx) => {
      const startT = t + idx * 0.13;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.3, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startT);
      osc.stop(startT + 0.35);
    });

    this.vibrate([80, 50, 100, 60, 140]);
  }

  // High score / new record triumphant fanfare
  playRecordCelebration() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const arpeggio = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.1 },  // G5
      { f: 1046.50, d: 0.35 } // C6 (held)
    ];

    let offset = 0;
    arpeggio.forEach((note) => {
      const startT = t + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, startT);

      gain.gain.setValueAtTime(0.35, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startT);
      osc.stop(startT + note.d);
      offset += 0.08;
    });

    this.vibrate([40, 50, 60, 50, 120]);
  }

  // Special event activation sound (Double Points, Slow Mo, etc.)
  playEventSound() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.25);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.28);

    this.vibrate(30);
  }

  // UI button click
  playClick() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.03);

    this.vibrate(8);
  }
}

// Global audio singleton
window.soundEngine = new SoundEngine();
