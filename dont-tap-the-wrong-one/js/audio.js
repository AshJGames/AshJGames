/**
 * DON'T TAP THE WRONG ONE - Audio & Haptic Feedback Engine
 * Built with Web Audio API for zero-latency, 100% offline procedural sound design.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.hapticsEnabled = true;
    this.masterGain = null;
    this.isInitialized = false;

    // Load sound settings from localStorage
    try {
      const savedMute = localStorage.getItem('dttwo_muted');
      if (savedMute !== null) {
        this.muted = JSON.parse(savedMute);
      }
      const savedHaptic = localStorage.getItem('dttwo_haptics');
      if (savedHaptic !== null) {
        this.hapticsEnabled = savedHaptic === null ? true : JSON.parse(savedHaptic);
      }
    } catch (e) {
      console.warn('Audio settings read error:', e);
    }
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  resume() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
    }
    try {
      localStorage.setItem('dttwo_muted', JSON.stringify(this.muted));
    } catch (e) {}
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setHaptics(enabled) {
    this.hapticsEnabled = !!enabled;
    try {
      localStorage.setItem('dttwo_haptics', JSON.stringify(this.hapticsEnabled));
    } catch (e) {}
  }

  vibrate(pattern) {
    if (!this.hapticsEnabled || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }

  // Play subtle tap click
  playTap() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.05);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);

    this.vibrate(12);
  }

  // Correct answer chime: pitch scales with combo count (1 to 20+)
  playCorrect(combo = 1) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Base frequency increases with combo level (pentatonic scale step feeling)
    const baseFreqs = [330, 370, 415, 494, 554, 659, 740, 831, 988, 1108];
    const pitchIndex = Math.min(combo - 1, baseFreqs.length - 1);
    const root = baseFreqs[Math.max(0, pitchIndex)];
    const octave = 1 + Math.floor(Math.min(combo, 30) / 10) * 0.25;

    // Dual oscillator chime (warm square + bright sine)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(root * octave, t);
    osc1.frequency.exponentialRampToValueAtTime(root * 1.5 * octave, t + 0.12);

    osc2.frequency.setValueAtTime(root * 2 * octave, t);
    osc2.frequency.exponentialRampToValueAtTime(root * 2.5 * octave, t + 0.15);

    gainNode.gain.setValueAtTime(0.25, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.22);
    osc2.stop(t + 0.22);

    this.vibrate(18);
  }

  // Wrong answer buzz / glitch explosion
  playWrong() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;

    // Low distorted saw wave dropping fast
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.38);

    // Harsh double buzz vibration
    this.vibrate([60, 40, 90]);
  }

  // Combo milestone fanfare (every 5 combo)
  playComboMilestone(combo = 5) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    chords.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.24);
    });

    this.vibrate([30, 20, 30, 20, 50]);
  }

  // Timer warning tick (urgent woodblock style)
  playTick(urgent = false) {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = urgent ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(urgent ? 880 : 660, t);
    osc.frequency.exponentialRampToValueAtTime(urgent ? 440 : 330, t + 0.04);

    gain.gain.setValueAtTime(urgent ? 0.2 : 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.04);

    if (urgent) this.vibrate(20);
  }

  // Dramatic Game Over sound
  playGameOver() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const notes = [311.13, 293.66, 277.18, 261.63, 196.0]; // Eb, D, C#, C, G
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.18);
    });

    this.vibrate([100, 50, 150]);
  }

  // High score / Personal best fanfare
  playNewBest() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const victoryNotes = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.5, d: 0.35 }
    ];

    let offset = 0;
    victoryNotes.forEach(({ f, d }) => {
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + d);
      offset += d * 0.85;
    });

    this.vibrate([40, 30, 40, 30, 120]);
  }

  // Chaos mode distortion glitch sound
  playGlitch() {
    if (this.muted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.setValueAtTime(800, t + 0.03);
    osc.frequency.setValueAtTime(220, t + 0.06);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);

    this.vibrate(35);
  }
}

// Global audio singleton
window.gameSound = new SoundEngine();
