/**
 * BRAIN LAG - Procedural Web Audio Engine
 * Zero external assets needed; ultra-low latency, pure Web Audio API synthesizer.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.8;
    this.initialized = false;

    // Load muted state
    try {
      const savedMute = localStorage.getItem('brainlag_muted');
      if (savedMute !== null) {
        this.muted = savedMute === 'true';
      }
    } catch (e) {
      this.muted = false;
    }
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('brainlag_muted', this.muted);
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.3, detune = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (detune) osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playTap() {
    if (this.muted) return;
    this.init();
    this.playTone(600, 'triangle', 0.04, 0.15);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Upbeat sparkling two-tone chord (E5 -> B5)
    const now = this.ctx.currentTime;
    [659.25, 987.77].forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.22, 0.25);
      }, i * 60);
    });
  }

  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Punchy low discord buzz (thud + square rasp)
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(133, this.ctx.currentTime); // Dissonant beating

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch (e) {}
  }

  playTick(urgent = false) {
    if (this.muted) return;
    this.init();
    const freq = urgent ? 950 : 750;
    this.playTone(freq, 'sine', 0.05, urgent ? 0.25 : 0.12);
  }

  playCombo(streak) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Rising arpeggios that scale higher as streak builds up
    const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major pentatonic
    const notesCount = Math.min(5, Math.max(2, streak));

    for (let i = 0; i < notesCount; i++) {
      setTimeout(() => {
        const note = baseFreqs[i % baseFreqs.length] * (streak >= 5 ? 1.2 : 1.0);
        this.playTone(note, 'triangle', 0.18, 0.22);
      }, i * 45);
    }
  }

  playAchievement() {
    if (this.muted) return;
    this.init();
    // Victory fanfare arpeggio (C, G, C, E)
    const fanfare = [523.25, 783.99, 1046.50, 1318.51, 1567.98];
    fanfare.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.35, 0.28);
      }, idx * 80);
    });
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    // Descending retro game over slide
    const notes = [440, 415.3, 392, 349.2, 293.6];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.25, 0.22);
      }, idx * 100);
    });
  }

  playNewRecord() {
    if (this.muted) return;
    this.init();
    // Triumphant double octave sparkle
    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'triangle', 0.3, 0.3);
      }, idx * 70);
    });
  }
}

window.soundEngine = new SoundEngine();
