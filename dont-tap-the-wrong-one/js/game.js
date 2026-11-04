/**
 * DON'T TAP THE WRONG ONE - Main Game State Machine & Logic Controller
 * Orchestrates modes (Classic, Chaos, Impossible, Daily), timing, scoring, and validations.
 */

class GameEngine {
  constructor(sound, storage, promptEngine, achievements) {
    this.sound = sound;
    this.storage = storage;
    this.promptEngine = promptEngine;
    this.achievements = achievements;

    // Game state
    this.state = 'IDLE'; // IDLE, PLAYING, GAME_OVER, PAUSED
    this.mode = 'classic'; // classic, chaos, impossible, daily
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.roundNumber = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.negativePromptsSolved = 0;

    // Active question & timer
    this.currentPrompt = null;
    this.activeButtons = []; // array of { id, colorId, label, hex, glow, index }
    this.questionStartTime = 0;
    this.questionTimer = null;
    this.questionDurationMs = 2500;
    this.questionTimeRemainingMs = 2500;

    // Mode-specific timers
    this.classicTotalTimeMs = 30000;
    this.classicTimeRemainingMs = 30000;
    this.classicTicker = null;

    // Reaction tracking
    this.minReactionMs = 9999;
    this.totalReactionMs = 0;

    // Tapping lock to prevent double taps
    this.inputLocked = false;

    // Callback listeners for UI binding
    this.listeners = {
      onQuestionReady: null,
      onTick: null,
      onCorrect: null,
      onWrong: null,
      onGameOver: null,
      onChaosGlitch: null,
      onComboMilestone: null,
    };
  }

  setListener(event, callback) {
    this.listeners[event] = callback;
  }

  emit(event, data) {
    if (typeof this.listeners[event] === 'function') {
      this.listeners[event](data);
    }
  }

  // Start new game in selected mode
  start(mode = 'classic') {
    this.mode = mode.toLowerCase();
    this.state = 'PLAYING';
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.roundNumber = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.negativePromptsSolved = 0;
    this.minReactionMs = 9999;
    this.totalReactionMs = 0;
    this.inputLocked = false;

    this.promptEngine.reset();

    // Set PRNG seed if Daily Challenge
    if (this.mode === 'daily') {
      const todayStr = this.storage.getTodayKey().replace(/-/g, '');
      const seedNumber = parseInt(todayStr, 10);
      this.promptEngine.setSeed(seedNumber);
    } else {
      this.promptEngine.setSeed(null);
    }

    // Initialize Classic Mode 30s session clock
    if (this.mode === 'classic') {
      this.classicTotalTimeMs = 30000;
      this.classicTimeRemainingMs = 30000;
      this.startClassicSessionTimer();
    }

    this.nextRound();
  }

  // Classic mode 30-second endurance timer
  startClassicSessionTimer() {
    this.clearClassicTimer();
    const interval = 50; // smooth 20 ticks per second

    this.classicTicker = setInterval(() => {
      if (this.state !== 'PLAYING') return;

      this.classicTimeRemainingMs -= interval;
      const progress = Math.max(0, this.classicTimeRemainingMs / this.classicTotalTimeMs);

      // Warning ticks in last 5 seconds
      if (this.classicTimeRemainingMs <= 5000 && this.classicTimeRemainingMs > 0) {
        if (Math.floor(this.classicTimeRemainingMs / 1000) !== Math.floor((this.classicTimeRemainingMs + interval) / 1000)) {
          this.sound.playTick(true);
        }
      }

      this.emit('onTick', {
        mode: 'classic',
        timeRemainingMs: Math.max(0, this.classicTimeRemainingMs),
        progress,
        isWarning: this.classicTimeRemainingMs <= 5000
      });

      if (this.classicTimeRemainingMs <= 0) {
        this.clearClassicTimer();
        this.endGame('timeout', 'Time expired in Classic 30s challenge!');
      }
    }, interval);
  }

  clearClassicTimer() {
    if (this.classicTicker) {
      clearInterval(this.classicTicker);
      this.classicTicker = null;
    }
  }

  // Question countdown for Chaos, Impossible, and Daily modes
  startQuestionTimer(durationMs) {
    this.clearQuestionTimer();
    this.questionDurationMs = durationMs;
    this.questionTimeRemainingMs = durationMs;

    const interval = 40;
    this.questionTimer = setInterval(() => {
      if (this.state !== 'PLAYING') return;

      this.questionTimeRemainingMs -= interval;
      const progress = Math.max(0, this.questionTimeRemainingMs / this.questionDurationMs);

      // Audio ticks when under 30% of time
      if (progress < 0.3 && progress > 0.05) {
        if (Math.floor(this.questionTimeRemainingMs / 250) !== Math.floor((this.questionTimeRemainingMs + interval) / 250)) {
          this.sound.playTick(false);
        }
      }

      this.emit('onTick', {
        mode: this.mode,
        timeRemainingMs: Math.max(0, this.questionTimeRemainingMs),
        progress,
        isWarning: progress < 0.3
      });

      if (this.questionTimeRemainingMs <= 0) {
        this.clearQuestionTimer();
        this.handleTimeout();
      }
    }, interval);
  }

  clearQuestionTimer() {
    if (this.questionTimer) {
      clearInterval(this.questionTimer);
      this.questionTimer = null;
    }
  }

  // Calculate dynamic per-question time limit based on round and mode
  calculateTimeLimit() {
    if (this.mode === 'classic') {
      // In classic mode, per-question timer acts as rapid urgency (e.g. 2.2s -> 1.4s)
      return Math.max(1400, 2400 - this.roundNumber * 35);
    } else if (this.mode === 'chaos') {
      // Chaos mode gets progressively faster and more hectic
      return Math.max(900, 2100 - this.roundNumber * 45);
    } else if (this.mode === 'impossible') {
      // Impossible mode is brutally fast from the start
      return Math.max(750, 1350 - this.roundNumber * 25);
    } else {
      // Daily mode
      return Math.max(1200, 2200 - this.roundNumber * 40);
    }
  }

  // Prepare and serve next question
  nextRound() {
    if (this.state !== 'PLAYING') return;

    this.roundNumber += 1;
    this.inputLocked = false;

    // Determine buttons palette (4 buttons normally, 6 in late Chaos or Impossible)
    let buttonColorIds = ['red', 'blue', 'green', 'yellow'];
    if ((this.mode === 'chaos' && this.roundNumber >= 12) || (this.mode === 'impossible' && this.roundNumber >= 8)) {
      buttonColorIds = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    }

    // In Chaos mode, shuffle button positions frequently
    if (this.mode === 'chaos' || (this.mode === 'impossible' && this.roundNumber % 3 === 0)) {
      buttonColorIds = this.promptEngine.shuffle(buttonColorIds);
    }

    // Map buttons with palette metadata
    const paletteList = window.COLOR_PALETTE || [];
    this.activeButtons = buttonColorIds.map((cid, idx) => {
      const p = paletteList.find(item => item.id === cid) || paletteList[0] || { name: cid.toUpperCase(), hex: '#fff', glow: 'rgba(255,255,255,0.5)' };
      return {
        id: `btn_${cid}_${idx}`,
        colorId: cid,
        name: p.name,
        hex: p.hex,
        glow: p.glow,
        buttonIndex: idx,
        isFlashing: false
      };
    });

    // Generate verified prompt
    this.currentPrompt = this.promptEngine.generatePrompt(this.roundNumber, this.mode, buttonColorIds);

    // If flashing decoy prompt, tag the flashing button
    if (this.currentPrompt.flashingColorId) {
      const flBtn = this.activeButtons.find(b => b.colorId === this.currentPrompt.flashingColorId);
      if (flBtn) flBtn.isFlashing = true;
    }

    // Chaos Mode visual glitch trigger (random chance)
    if (this.mode === 'chaos' && Math.random() < 0.28 && this.roundNumber > 3) {
      this.sound.playGlitch();
      this.emit('onChaosGlitch', {
        type: Math.random() > 0.5 ? 'invert' : 'shake',
        duration: 350
      });
    }

    const timeLimitMs = this.calculateTimeLimit();
    this.questionStartTime = Date.now();

    // Start question timer
    this.startQuestionTimer(timeLimitMs);

    // Notify UI
    this.emit('onQuestionReady', {
      round: this.roundNumber,
      prompt: this.currentPrompt,
      buttons: this.activeButtons,
      timeLimitMs,
      streak: this.streak,
      score: this.score,
      mode: this.mode
    });
  }

  // Handle player tapping a button
  handleTap(buttonIndex) {
    if (this.state !== 'PLAYING' || this.inputLocked) return;

    // Lock immediately to prevent multi-tap race conditions
    this.inputLocked = true;
    this.clearQuestionTimer();

    const reactionMs = Math.max(1, Date.now() - this.questionStartTime);
    this.totalReactionMs += reactionMs;
    if (reactionMs < this.minReactionMs) {
      this.minReactionMs = reactionMs;
    }

    const tappedButton = this.activeButtons[buttonIndex];
    if (!tappedButton) {
      this.inputLocked = false;
      return;
    }

    // Validate using the prompt's self-contained validation logic
    const validation = this.currentPrompt.validate(tappedButton);

    if (validation.isCorrect) {
      this.handleCorrectTap(tappedButton, reactionMs);
    } else {
      this.handleWrongTap(tappedButton, validation.explanation);
    }
  }

  handleCorrectTap(tappedButton, reactionMs) {
    this.correctCount += 1;
    this.streak += 1;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }

    // Record last correct color for memory questions
    this.promptEngine.recordAnswer(tappedButton.colorId);

    if (this.currentPrompt.isNegative) {
      this.negativePromptsSolved += 1;
    }

    // Scoring calculation: Base (10) + Speed bonus + Combo Multiplier
    const basePoints = 10;
    let speedBonus = 0;
    if (reactionMs <= 350) {
      speedBonus = 15;
    } else if (reactionMs <= 600) {
      speedBonus = 10;
    } else if (reactionMs <= 1000) {
      speedBonus = 5;
    }

    // Combo multiplier: scales from 1.0x to 4.0x
    const multiplier = Math.min(4.0, 1.0 + Math.floor(this.streak / 3) * 0.25);
    const earnedPoints = Math.round((basePoints + speedBonus) * multiplier);
    this.score += earnedPoints;

    // Bonus time for Classic Mode (+0.4s to +0.8s on quick taps)
    if (this.mode === 'classic') {
      const timeBonus = reactionMs < 500 ? 800 : 400;
      this.classicTimeRemainingMs = Math.min(35000, this.classicTimeRemainingMs + timeBonus);
    }

    // Sound feedback
    this.sound.playCorrect(this.streak);

    // Combo milestone check (every 5)
    let comboMilestone = null;
    if (this.streak > 0 && this.streak % 5 === 0) {
      const milestoneBonus = this.streak * 10;
      this.score += milestoneBonus;
      comboMilestone = { streak: this.streak, bonus: milestoneBonus };
      this.sound.playComboMilestone(this.streak);
      this.emit('onComboMilestone', comboMilestone);
    }

    // Check live achievements
    const newlyUnlockedAchievements = this.achievements.check({
      mode: this.mode,
      currentScore: this.score,
      currentStreak: this.streak,
      totalCorrect: this.correctCount,
      reactionMs,
      negativePromptsSolved: this.negativePromptsSolved,
      isGameOver: false
    });

    // Notify UI
    this.emit('onCorrect', {
      tappedButton,
      earnedPoints,
      multiplier,
      speedBonus,
      totalScore: this.score,
      streak: this.streak,
      reactionMs,
      comboMilestone,
      unlockedAchievements: newlyUnlockedAchievements
    });

    // Advance to next question with a crisp micro-pause (120ms) for visual gratification
    setTimeout(() => {
      if (this.state === 'PLAYING') {
        this.nextRound();
      }
    }, 120);
  }

  handleWrongTap(tappedButton, explanation) {
    this.wrongCount += 1;
    this.sound.playWrong();

    this.emit('onWrong', {
      tappedButton,
      explanation
    });

    this.endGame('wrong_tap', explanation);
  }

  handleTimeout() {
    this.sound.playWrong();
    const explanation = `Time ran out! You had ${Math.round(this.questionDurationMs / 100) / 10} seconds to respond.`;
    this.endGame('timeout', explanation);
  }

  endGame(reason, explanation) {
    if (this.state !== 'PLAYING') return;

    this.state = 'GAME_OVER';
    this.clearQuestionTimer();
    this.clearClassicTimer();

    const avgReaction = this.correctCount > 0
      ? Math.round(this.totalReactionMs / this.correctCount)
      : 0;

    const accuracy = this.correctCount + this.wrongCount > 0
      ? Math.round((this.correctCount / (this.correctCount + this.wrongCount)) * 100)
      : 0;

    // Record game in storage
    const { isNewBest, previousBest } = this.storage.recordGame(
      this.mode,
      this.score,
      this.maxStreak,
      this.correctCount,
      this.wrongCount,
      this.minReactionMs === 9999 ? 0 : this.minReactionMs
    );

    // Audio on game over
    if (isNewBest && this.score > 0) {
      this.sound.playNewBest();
    } else {
      this.sound.playGameOver();
    }

    // Check final achievements
    const newlyUnlockedAchievements = this.achievements.check({
      mode: this.mode,
      currentScore: this.score,
      currentStreak: this.maxStreak,
      totalCorrect: this.correctCount,
      reactionMs: avgReaction,
      negativePromptsSolved: this.negativePromptsSolved,
      isGameOver: true
    });

    const summary = {
      score: this.score,
      streak: this.maxStreak,
      mode: this.mode,
      accuracy,
      avgReactionMs: avgReaction,
      minReactionMs: this.minReactionMs === 9999 ? 0 : this.minReactionMs,
      isNewBest,
      previousBest,
      reason,
      explanation,
      playerName: this.storage.playerName,
      unlockedAchievements: newlyUnlockedAchievements
    };

    this.emit('onGameOver', summary);
  }
}

// Global game engine instance
window.gameEngine = new GameEngine(
  window.gameSound,
  window.gameStorage,
  window.gamePromptEngine,
  window.gameAchievements
);
