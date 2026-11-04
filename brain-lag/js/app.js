/**
 * BRAIN LAG - Main Game Controller & Architecture
 */

class BrainLagApp {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.fastestReactionMs = 9999;
    this.currentMode = null;
    this.isTransitioning = false;
    this.isGameOver = false;
    this.activeScreen = 'home';
    this.challengeContext = null;

    this.cacheDom();
    this.initMascotAndParticles();
    this.bindEvents();
    this.checkUrlChallenge();
    this.updateHomeScreenStats();
    this.applyActiveTheme();
    this.registerServiceWorker();
  }

  cacheDom() {
    // Screens
    this.screenHome = document.getElementById('screen-home');
    this.screenGame = document.getElementById('screen-game');
    this.screenGameOver = document.getElementById('screen-gameover');
    
    // Modals
    this.modalAchievements = document.getElementById('modal-achievements');
    this.modalHowToPlay = document.getElementById('modal-howtoplay');
    this.modalDaily = document.getElementById('modal-daily');
    this.modalChallengeBanner = document.getElementById('modal-challenge-banner');

    // Game HUD elements
    this.hudModeTitle = document.getElementById('hud-mode-title');
    this.hudScore = document.getElementById('hud-score');
    this.hudStreak = document.getElementById('hud-streak');
    this.hudStreakBadge = document.getElementById('hud-streak-badge');
    this.hudTimerBar = document.getElementById('hud-timer-bar');
    this.hudChallengeTarget = document.getElementById('hud-challenge-target');

    // Question & Input elements
    this.questionCategoryEl = document.getElementById('question-category');
    this.questionPromptEl = document.getElementById('question-prompt');
    this.questionContainer = document.getElementById('question-content-box');
    this.optionsContainer = document.getElementById('options-container');

    // Game Over elements
    this.goScoreEl = document.getElementById('go-final-score');
    this.goAccuracyEl = document.getElementById('go-accuracy');
    this.goStreakEl = document.getElementById('go-streak');
    this.goCorrectEl = document.getElementById('go-correct');
    this.goTitleEl = document.getElementById('go-diag-title');
    this.goQuoteEl = document.getElementById('go-diag-quote');
    this.goNewRecordBadge = document.getElementById('go-new-record-badge');
    this.goChallengerResult = document.getElementById('go-challenger-result');

    // Controls
    this.btnMute = document.getElementById('btn-sound-toggle');
  }

  initMascotAndParticles() {
    this.particles = new window.ParticleSystem('particles-canvas');
    this.mascot = new window.MascotController('brain-mascot-container');
    this.updateSoundButtonUI();
  }

  bindEvents() {
    // Mode Buttons on Home Screen
    document.querySelectorAll('[data-start-mode]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modeKey = btn.getAttribute('data-start-mode');
        window.soundEngine.playTap();
        this.startGame(modeKey);
      });
    });

    // Sound toggle
    if (this.btnMute) {
      this.btnMute.addEventListener('click', () => {
        const isMuted = window.soundEngine.toggleMute();
        this.updateSoundButtonUI();
        if (!isMuted) window.soundEngine.playTap();
      });
    }

    // Modal triggers
    document.getElementById('btn-open-achievements')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.openAchievementsModal();
    });

    document.getElementById('btn-open-howtoplay')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.openModal('modal-howtoplay');
    });

    document.getElementById('btn-open-daily')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.openDailyModal();
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn, .modal-backdrop').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          window.soundEngine.playTap();
          this.closeAllModals();
        }
      });
    });

    // Game navigation
    document.getElementById('btn-pause-game')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      if (confirm("Quit current run and return to home menu?")) {
        this.quitGameToHome();
      }
    });

    document.getElementById('go-btn-replay')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      const currentModeKey = this.currentMode ? this.currentMode.name : 'overthink';
      this.startGame(currentModeKey);
    });

    document.getElementById('go-btn-home')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.showScreen('home');
      this.updateHomeScreenStats();
    });

    document.getElementById('go-btn-share')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.handleShareAction();
    });

    document.getElementById('go-btn-download-card')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.handleDownloadScoreCard();
    });

    // Daily play button in modal
    document.getElementById('btn-start-daily-challenge')?.addEventListener('click', () => {
      window.soundEngine.playTap();
      this.closeAllModals();
      this.startGame('daily');
    });

    // Keyboard Shortcuts (1, 2, 3, 4, Space)
    window.addEventListener('keydown', (e) => {
      if (this.activeScreen === 'game' && !this.isTransitioning && !this.isGameOver) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          const buttons = this.optionsContainer.querySelectorAll('.game-opt-btn, .memory-pad');
          if (buttons[idx]) {
            buttons[idx].click();
          }
        }
      }
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  updateSoundButtonUI() {
    if (!this.btnMute) return;
    const muted = window.soundEngine.isMuted();
    this.btnMute.innerHTML = muted ? '🔇 <span class="nav-btn-text">MUTED</span>' : '🔊 <span class="nav-btn-text">SOUND ON</span>';
    this.btnMute.classList.toggle('active-muted', muted);
  }

  checkUrlChallenge() {
    const challenge = window.shareEngine.parseChallengeUrl();
    if (challenge && challenge.isChallenge) {
      this.challengeContext = challenge;
      
      const challengerName = document.getElementById('challenge-sender-name');
      const challengerScore = document.getElementById('challenge-target-score');
      const challengerMode = document.getElementById('challenge-mode-name');

      if (challengerName) challengerName.textContent = challenge.challenger;
      if (challengerScore) challengerScore.textContent = challenge.targetScore;
      if (challengerMode) challengerMode.textContent = challenge.mode.toUpperCase();

      document.getElementById('btn-accept-challenge')?.addEventListener('click', () => {
        window.soundEngine.playTap();
        this.closeAllModals();
        this.startGame(challenge.mode);
      });

      this.openModal('modal-challenge-banner');
    }
  }

  applyActiveTheme() {
    const theme = window.storageManager.data.activeTheme || 'cyber-neon';
    document.body.className = `theme-${theme}`;
  }

  showScreen(screenId) {
    this.activeScreen = screenId;
    ['home', 'game', 'gameover'].forEach(id => {
      const el = document.getElementById(`screen-${id}`);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('screen-active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('screen-active');
        }
      }
    });
  }

  openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('hidden');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  }

  openAchievementsModal() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const unlocked = window.storageManager.data.achievements || {};
    const allDefs = Object.values(window.ACHIEVEMENT_DEFINITIONS);

    allDefs.forEach(ach => {
      const isUnlocked = !!unlocked[ach.id];
      const card = document.createElement('div');
      card.className = `achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <h4>${ach.title}</h4>
          <p>${ach.desc}</p>
          <span class="ach-status">${isUnlocked ? 'UNLOCKED ✅' : 'LOCKED 🔒'}</span>
        </div>
      `;
      grid.appendChild(card);
    });

    this.openModal('modal-achievements');
  }

  openDailyModal() {
    const login = window.storageManager.checkDailyLogin();
    const streakEl = document.getElementById('daily-streak-count');
    const statusEl = document.getElementById('daily-status-msg');
    const startBtn = document.getElementById('btn-start-daily-challenge');

    if (streakEl) streakEl.textContent = `${login.streak} DAY STREAK 🔥`;
    if (statusEl) {
      if (login.completedToday) {
        statusEl.innerHTML = `✅ You have completed today's challenge! Best Score: <strong>${window.storageManager.data.daily.bestDailyScore || 0}</strong>. You can replay to improve your score!`;
        if (startBtn) startBtn.textContent = 'REPLAY TODAY (PRACTICE)';
      } else {
        statusEl.textContent = "10 fixed puzzles generated for today. Same questions worldwide!";
        if (startBtn) startBtn.textContent = 'PLAY TODAY’S CHALLENGE 🧠';
      }
    }

    this.openModal('modal-daily');
  }

  updateHomeScreenStats() {
    const stats = window.storageManager.data.stats;
    const hs = window.storageManager.data.highScores;

    const elTotalScore = document.getElementById('stat-total-correct');
    const elAccuracy = document.getElementById('stat-overall-accuracy');
    const elBestStreak = document.getElementById('stat-best-streak');

    if (elTotalScore) elTotalScore.textContent = stats.totalCorrect;
    if (elAccuracy) elAccuracy.textContent = `${window.storageManager.getOverallAccuracy()}%`;
    if (elBestStreak) elBestStreak.textContent = `${stats.highestOverallStreak}x`;

    // Mode High Score pills
    document.querySelectorAll('[data-high-score-for]').forEach(el => {
      const mode = el.getAttribute('data-high-score-for');
      el.textContent = `PB: ${hs[mode] || 0}`;
    });
  }

  startGame(modeKey) {
    if (this.currentMode) {
      this.currentMode.cleanup();
    }

    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.fastestReactionMs = 9999;
    this.isTransitioning = false;
    this.isGameOver = false;

    // Instantiate Mode
    switch (modeKey) {
      case 'overthink':
        this.currentMode = new window.OverthinkMode(this);
        break;
      case 'colorchaos':
        this.currentMode = new window.ColorChaosMode(this);
        break;
      case 'memory':
        this.currentMode = new window.MemoryMeltdownMode(this);
        break;
      case 'reflex':
        this.currentMode = new window.ReflexRushMode(this);
        break;
      case 'destroyer':
        this.currentMode = new window.BrainDestroyerMode(this);
        break;
      case 'daily':
        this.currentMode = new window.DailyChallengeMode(this);
        break;
      default:
        this.currentMode = new window.OverthinkMode(this);
        break;
    }

    // Set UI Header
    if (this.hudModeTitle) this.hudModeTitle.textContent = this.currentMode.title.toUpperCase();
    this.updateScoreHud();
    this.updateStreakHud();
    
    // Ghost target indicator
    if (this.challengeContext && this.challengeContext.isChallenge) {
      this.hudChallengeTarget.classList.remove('hidden');
      this.hudChallengeTarget.innerHTML = `TARGET: <span>${this.challengeContext.targetScore}</span> (${this.challengeContext.challenger})`;
    } else {
      this.hudChallengeTarget.classList.add('hidden');
    }

    this.showScreen('game');
    this.mascot.setState('thinking');
    this.currentMode.start();
  }

  quitGameToHome() {
    if (this.currentMode) {
      this.currentMode.cleanup();
      this.currentMode = null;
    }
    this.showScreen('home');
    this.updateHomeScreenStats();
  }

  setQuestionCategory(text) {
    if (this.questionCategoryEl) this.questionCategoryEl.textContent = text;
  }

  setQuestionPrompt(text) {
    if (this.questionPromptEl) {
      this.questionPromptEl.textContent = text;
      // Re-trigger punch animation
      this.questionPromptEl.classList.remove('prompt-pop');
      void this.questionPromptEl.offsetWidth; // reflow
      this.questionPromptEl.classList.add('prompt-pop');
    }
  }

  updateTimer(timeLeft, maxTime) {
    if (!this.hudTimerBar) return;
    const pct = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
    this.hudTimerBar.style.width = `${pct}%`;

    // Dynamic warning colors
    if (pct < 25) {
      this.hudTimerBar.className = 'timer-bar-fill timer-critical';
    } else if (pct < 50) {
      this.hudTimerBar.className = 'timer-bar-fill timer-warning';
    } else {
      this.hudTimerBar.className = 'timer-bar-fill';
    }
  }

  onCorrectAnswer({ basePoints = 10, speedBonus = 0, button = null, customMessage = null, fastestReactionMs = null }) {
    this.correctCount += 1;
    this.streak += 1;
    if (this.streak > this.maxStreak) this.maxStreak = this.streak;

    if (fastestReactionMs && fastestReactionMs < this.fastestReactionMs) {
      this.fastestReactionMs = fastestReactionMs;
    }

    // Streak multiplier: 5x = 1.5x, 10x = 2.0x, 15x = 2.5x, 20x = 3.0x
    const multiplier = 1 + Math.min(2.0, Math.floor(this.streak / 5) * 0.5);
    const addedPoints = Math.round((basePoints + speedBonus) * multiplier);
    this.score += addedPoints;

    // Audio & Feedback
    if (this.streak >= 5) {
      window.soundEngine.playCombo(this.streak);
      this.mascot.setState(this.streak >= 10 ? 'galaxy' : 'combo', 1200);
      this.particles.createConfetti(window.innerWidth / 2, 200, 25);
    } else {
      window.soundEngine.playCorrect();
      this.mascot.setState('thinking', 800);
    }

    // Button feedback
    if (button) {
      button.classList.add('btn-correct-flash');
      setTimeout(() => button.classList.remove('btn-correct-flash'), 400);
    }

    // Floating text indicator
    this.showFloatingText(button || document.body, `+${addedPoints} ${customMessage || ''}`);
    this.updateScoreHud();
    this.updateStreakHud();
  }

  onWrongAnswer({ button = null, explanation = '', reason = 'BRAIN LAGGED!' }) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.wrongCount += 1;
    this.streak = 0;

    // Haptics on mobile devices
    if (navigator.vibrate) {
      try { navigator.vibrate([80, 50, 100]); } catch (e) {}
    }

    // Audio & Mascot
    window.soundEngine.playWrong();
    this.mascot.setState('lagged');

    // Visual camera shake & glitch sparks
    const rect = button ? button.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    this.particles.createSparks(rect.left + 50, rect.top + 20, 30, '#ff0054');
    
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 450);

    if (button) {
      button.classList.add('btn-wrong-flash');
    }

    // Display Explanation Toast/Banner before transitioning to Game Over
    this.showExplanationModal(reason, explanation, () => {
      this.endGame(reason);
    });
  }

  showExplanationModal(reason, explanation, callback) {
    const modal = document.getElementById('modal-explanation');
    const reasonEl = document.getElementById('explanation-reason');
    const textEl = document.getElementById('explanation-text');
    const btnContinue = document.getElementById('btn-explanation-continue');

    if (reasonEl) reasonEl.textContent = reason;
    if (textEl) textEl.textContent = explanation;

    if (modal) modal.classList.remove('hidden');

    let isDone = false;
    const finish = () => {
      if (isDone) return;
      isDone = true;
      if (modal) modal.classList.add('hidden');
      callback();
    };

    if (btnContinue) {
      // Remove any previous listener by replacing element clone
      const newBtn = btnContinue.cloneNode(true);
      btnContinue.parentNode.replaceChild(newBtn, btnContinue);
      newBtn.addEventListener('click', finish);
    }

    setTimeout(finish, 4500); // Auto-advance after 4.5s
  }

  showFloatingText(targetEl, text) {
    const el = document.createElement('div');
    el.className = 'floating-score-tag';
    el.textContent = text;
    
    const rect = targetEl.getBoundingClientRect();
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top}px`;

    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 900);
  }

  updateScoreHud() {
    if (this.hudScore) this.hudScore.textContent = this.score;
  }

  updateStreakHud() {
    if (this.hudStreak) this.hudStreak.textContent = `${this.streak}x`;
    if (this.hudStreakBadge) {
      if (this.streak >= 5) {
        this.hudStreakBadge.classList.add('streak-active');
        this.hudStreakBadge.innerHTML = `🔥 COMBO ${this.streak}x`;
      } else {
        this.hudStreakBadge.classList.remove('streak-active');
        this.hudStreakBadge.innerHTML = `⚡ ${this.streak}x`;
      }
    }
  }

  endGame(summaryReason) {
    if (this.currentMode) {
      this.currentMode.cleanup();
    }

    const totalQuestions = this.correctCount + this.wrongCount;
    const accuracy = totalQuestions > 0 ? Math.round((this.correctCount / totalQuestions) * 100) : 0;

    // Record game in persistent storage
    const modeKey = this.currentMode ? this.currentMode.name : 'overthink';
    const result = window.storageManager.recordGameEnd({
      mode: modeKey,
      score: this.score,
      streak: this.maxStreak,
      correct: this.correctCount,
      total: totalQuestions,
      fastestReactionMs: this.fastestReactionMs
    });

    // Populate Game Over Screen
    if (this.goScoreEl) this.goScoreEl.textContent = this.score;
    if (this.goAccuracyEl) this.goAccuracyEl.textContent = `${accuracy}%`;
    if (this.goStreakEl) this.goStreakEl.textContent = `${this.maxStreak}x`;
    if (this.goCorrectEl) this.goCorrectEl.textContent = this.correctCount;

    const diag = window.shareEngine.getDiagnosis(this.score);
    if (this.goTitleEl) this.goTitleEl.textContent = diag.title;
    if (this.goQuoteEl) this.goQuoteEl.textContent = diag.sub;

    if (this.goNewRecordBadge) {
      this.goNewRecordBadge.classList.toggle('hidden', !result.isNewHigh);
    }

    // Challenger target evaluation
    if (this.goChallengerResult) {
      if (this.challengeContext && this.challengeContext.isChallenge) {
        this.goChallengerResult.classList.remove('hidden');
        if (this.score > this.challengeContext.targetScore) {
          this.goChallengerResult.innerHTML = `🏆 <strong>VICTORY!</strong> You crushed ${this.challengeContext.challenger}'s score of ${this.challengeContext.targetScore}!`;
          this.goChallengerResult.className = 'challenger-result-banner banner-win';
        } else {
          this.goChallengerResult.innerHTML = `💀 <strong>FAILED!</strong> ${this.challengeContext.challenger}'s score (${this.challengeContext.targetScore}) still reigns supreme!`;
          this.goChallengerResult.className = 'challenger-result-banner banner-loss';
        }
      } else {
        this.goChallengerResult.classList.add('hidden');
      }
    }

    // Audio & Confetti
    if (result.isNewHigh && this.score > 100) {
      window.soundEngine.playNewRecord();
      this.particles.createConfetti(window.innerWidth / 2, window.innerHeight / 2, 90);
    } else {
      window.soundEngine.playGameOver();
    }

    this.showScreen('gameover');

    // Notify newly unlocked achievements
    if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
      setTimeout(() => {
        result.newlyUnlocked.forEach(id => {
          const ach = window.ACHIEVEMENT_DEFINITIONS[id];
          if (ach) {
            window.soundEngine.playAchievement();
            this.showAchievementToast(ach);
          }
        });
      }, 700);
    }
  }

  showAchievementToast(ach) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <div class="toast-icon">${ach.icon}</div>
      <div class="toast-body">
        <span class="toast-sub">ACHIEVEMENT UNLOCKED!</span>
        <strong class="toast-title">${ach.title}</strong>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
  }

  async handleShareAction() {
    const modeKey = this.currentMode ? this.currentMode.name : 'overthink';
    const modeTitle = this.currentMode ? this.currentMode.title : "Don't Overthink";
    const totalQ = this.correctCount + this.wrongCount;
    const accuracy = totalQ > 0 ? Math.round((this.correctCount / totalQ) * 100) : 100;

    const res = await window.shareEngine.shareScore({
      mode: modeKey,
      modeTitle: modeTitle,
      score: this.score,
      streak: this.maxStreak,
      accuracy: accuracy,
      correct: this.correctCount,
      fastestMs: this.fastestReactionMs,
      playerName: 'Player'
    });

    if (res.method === 'clipboard') {
      alert("📋 Challenge link & score copied to your clipboard! Send it to your friends to see if they can beat your score!");
    }
  }

  handleDownloadScoreCard() {
    const modeTitle = this.currentMode ? this.currentMode.title : "Don't Overthink";
    const totalQ = this.correctCount + this.wrongCount;
    const accuracy = totalQ > 0 ? Math.round((this.correctCount / totalQ) * 100) : 100;

    window.shareEngine.downloadScoreCardImage({
      modeTitle: modeTitle,
      score: this.score,
      streak: this.maxStreak,
      accuracy: accuracy,
      correct: this.correctCount,
      fastestMs: this.fastestReactionMs
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.log("ServiceWorker registration skipped:", err);
        });
      });
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new BrainLagApp();
});
