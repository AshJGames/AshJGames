/**
 * DON'T TAP THE WRONG ONE - UI Controller & DOM Orchestration
 * Handles screen transitions, modal dialogs, animations, and user interactions.
 */

class UIController {
  constructor(engine, sound, storage, confetti, scoreCard, achievements) {
    this.engine = engine;
    this.sound = sound;
    this.storage = storage;
    this.confetti = confetti;
    this.scoreCard = scoreCard;
    this.achievements = achievements;

    this.selectedMode = 'classic';
    this.currentScoreCardData = null;
    this.challengeParams = null;

    this.dom = {};
  }

  init() {
    this.cacheDOM();
    this.parseUrlChallenge();
    this.bindEvents();
    this.bindEngineEvents();
    this.applyActiveTheme();
    this.updateWelcomeScreen();
  }

  cacheDOM() {
    // Screens
    this.dom.welcomeScreen = document.getElementById('welcomeScreen');
    this.dom.gameplayScreen = document.getElementById('gameplayScreen');
    this.dom.gameOverScreen = document.getElementById('gameOverScreen');

    // Welcome Screen elements
    this.dom.modeButtons = document.querySelectorAll('.mode-card');
    this.dom.btnPlay = document.getElementById('btnPlay');
    this.dom.btnSound = document.getElementById('btnSound');
    this.dom.btnStats = document.getElementById('btnStats');
    this.dom.btnAchievements = document.getElementById('btnAchievements');
    this.dom.btnThemes = document.getElementById('btnThemes');
    this.dom.btnHowToPlay = document.getElementById('btnHowToPlay');
    this.dom.dailyBanner = document.getElementById('dailyBanner');
    this.dom.dailyStreakCount = document.getElementById('dailyStreakCount');
    this.dom.challengeNotice = document.getElementById('challengeNotice');
    this.dom.challengeNoticeText = document.getElementById('challengeNoticeText');

    // Gameplay elements
    this.dom.hudScore = document.getElementById('hudScore');
    this.dom.hudStreak = document.getElementById('hudStreak');
    this.dom.hudMultiplier = document.getElementById('hudMultiplier');
    this.dom.hudModeBadge = document.getElementById('hudModeBadge');
    this.dom.timerProgress = document.getElementById('timerProgress');
    this.dom.timerText = document.getElementById('timerText');
    this.dom.instructionCard = document.getElementById('instructionCard');
    this.dom.instructionText = document.getElementById('instructionText');
    this.dom.instructionSubtext = document.getElementById('instructionSubtext');
    this.dom.stroopWordContainer = document.getElementById('stroopWordContainer');
    this.dom.buttonGrid = document.getElementById('buttonGrid');
    this.dom.floatingScoreContainer = document.getElementById('floatingScoreContainer');
    this.dom.comboMilestoneBanner = document.getElementById('comboMilestoneBanner');
    this.dom.btnPause = document.getElementById('btnPause');

    // Game Over elements
    this.dom.goScore = document.getElementById('goScore');
    this.dom.goNewBestBanner = document.getElementById('goNewBestBanner');
    this.dom.goRoastTitle = document.getElementById('goRoastTitle');
    this.dom.goRoastText = document.getElementById('goRoastText');
    this.dom.goStreak = document.getElementById('goStreak');
    this.dom.goAccuracy = document.getElementById('goAccuracy');
    this.dom.goReflex = document.getElementById('goReflex');
    this.dom.goExplanation = document.getElementById('goExplanation');
    this.dom.btnPlayAgain = document.getElementById('btnPlayAgain');
    this.dom.btnShareScore = document.getElementById('btnShareScore');
    this.dom.btnChallengeFriend = document.getElementById('btnChallengeFriend');
    this.dom.btnMainMenu = document.getElementById('btnMainMenu');

    // Modals
    this.dom.howToPlayModal = document.getElementById('howToPlayModal');
    this.dom.statsModal = document.getElementById('statsModal');
    this.dom.achievementsModal = document.getElementById('achievementsModal');
    this.dom.themesModal = document.getElementById('themesModal');
    this.dom.shareCardModal = document.getElementById('shareCardModal');

    // Toast Container
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  // Parse challenge parameters from URL query string
  parseUrlChallenge() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const challengeCode = urlParams.get('challenge');
      const score = urlParams.get('challengerScore');
      const mode = urlParams.get('mode') || 'classic';

      if (challengeCode && score) {
        this.challengeParams = { challengeCode, score: parseInt(score, 10), mode };
        if (this.dom.challengeNotice && this.dom.challengeNoticeText) {
          this.dom.challengeNoticeText.textContent = `⚔️ Friend Challenge: Beat ${score} points in ${mode.toUpperCase()} mode!`;
          this.dom.challengeNotice.classList.remove('hidden');
          this.selectedMode = mode;
        }
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }

  bindEvents() {
    // Mode selection
    this.dom.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.sound.playTap();
        this.dom.modeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMode = btn.dataset.mode;
      });
    });

    // Play button
    this.dom.btnPlay.addEventListener('click', () => {
      this.sound.playTap();
      this.sound.resume();
      this.startGame(this.selectedMode);
    });

    // Sound toggle
    this.dom.btnSound.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.updateSoundButtonUI(isMuted);
      this.showToast(isMuted ? '🔇 Sound muted' : '🔊 Sound enabled');
    });
    this.updateSoundButtonUI(this.sound.muted);

    // Navigation Modals
    this.dom.btnHowToPlay.addEventListener('click', () => this.openModal(this.dom.howToPlayModal));
    this.dom.btnStats.addEventListener('click', () => {
      this.renderStatsModal();
      this.openModal(this.dom.statsModal);
    });
    this.dom.btnAchievements.addEventListener('click', () => {
      this.renderAchievementsModal();
      this.openModal(this.dom.achievementsModal);
    });
    this.dom.btnThemes.addEventListener('click', () => {
      this.renderThemesModal();
      this.openModal(this.dom.themesModal);
    });

    // Close modals on clicking backdrop or close buttons
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.btn-modal-close')) {
          this.closeModal(overlay);
        }
      });
    });

    // Pause / Leave game
    this.dom.btnPause.addEventListener('click', () => {
      this.sound.playTap();
      if (confirm('Leave current game? Your score will be lost.')) {
        this.engine.state = 'IDLE';
        this.engine.clearClassicTimer();
        this.engine.clearQuestionTimer();
        this.showScreen('welcomeScreen');
        this.updateWelcomeScreen();
      }
    });

    // Game Over actions
    this.dom.btnPlayAgain.addEventListener('click', () => {
      this.sound.playTap();
      this.startGame(this.engine.mode);
    });

    this.dom.btnMainMenu.addEventListener('click', () => {
      this.sound.playTap();
      this.showScreen('welcomeScreen');
      this.updateWelcomeScreen();
    });

    this.dom.btnShareScore.addEventListener('click', () => {
      this.sound.playTap();
      this.handleShareClick();
    });

    this.dom.btnChallengeFriend.addEventListener('click', () => {
      this.sound.playTap();
      this.openScoreCardPreview();
    });
  }

  bindEngineEvents() {
    this.engine.setListener('onQuestionReady', (data) => this.renderQuestion(data));
    this.engine.setListener('onTick', (data) => this.renderTimer(data));
    this.engine.setListener('onCorrect', (data) => this.handleCorrectFeedback(data));
    this.engine.setListener('onWrong', (data) => this.handleWrongFeedback(data));
    this.engine.setListener('onGameOver', (data) => this.renderGameOver(data));
    this.engine.setListener('onChaosGlitch', (data) => this.triggerChaosGlitch(data));
    this.engine.setListener('onComboMilestone', (data) => this.showComboMilestone(data));
  }

  showScreen(screenId) {
    const screens = [this.dom.welcomeScreen, this.dom.gameplayScreen, this.dom.gameOverScreen];
    screens.forEach(s => {
      if (s) {
        if (s.id === screenId) {
          s.classList.remove('hidden');
          s.classList.add('active');
        } else {
          s.classList.add('hidden');
          s.classList.remove('active');
        }
      }
    });
  }

  openModal(modal) {
    if (!modal) return;
    this.sound.playTap();
    modal.classList.remove('hidden');
  }

  closeModal(modal) {
    if (!modal) return;
    this.sound.playTap();
    modal.classList.add('hidden');
  }

  showToast(message, duration = 2500) {
    if (!this.dom.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-bubble';
    toast.textContent = message;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  updateSoundButtonUI(isMuted) {
    if (this.dom.btnSound) {
      this.dom.btnSound.innerHTML = isMuted ? '🔇' : '🔊';
      this.dom.btnSound.setAttribute('aria-label', isMuted ? 'Unmute Audio' : 'Mute Audio');
    }
  }

  updateWelcomeScreen() {
    // Update best score badges on mode cards
    const modes = ['classic', 'chaos', 'impossible', 'daily'];
    modes.forEach(m => {
      const badge = document.querySelector(`.mode-card[data-mode="${m}"] .mode-best-val`);
      if (badge) {
        const best = this.storage.getBestScore(m);
        badge.textContent = best > 0 ? `Best: ${best}` : 'No record';
      }
    });

    // Update Daily Streak banner
    if (this.dom.dailyStreakCount) {
      this.dom.dailyStreakCount.textContent = `${this.storage.stats.consecutiveDays || 1} Days`;
    }

    // Update Achievement badge count on main menu
    const achBtnBadge = document.getElementById('achievementsCountBadge');
    if (achBtnBadge) {
      const unlocked = this.achievements.getUnlockedCount();
      const total = this.achievements.getTotalCount();
      achBtnBadge.textContent = `${unlocked}/${total}`;
    }
  }

  startGame(mode) {
    this.showScreen('gameplayScreen');
    this.engine.start(mode);
  }

  renderQuestion(data) {
    const { prompt, buttons, streak, score, mode } = data;

    // Update HUD
    this.dom.hudScore.textContent = score;
    this.dom.hudStreak.textContent = streak;
    this.dom.hudModeBadge.textContent = mode.toUpperCase();

    const multiplier = Math.min(4.0, 1.0 + Math.floor(streak / 3) * 0.25);
    this.dom.hudMultiplier.textContent = `x${multiplier.toFixed(1)}`;
    if (streak >= 5) {
      this.dom.hudMultiplier.classList.add('on-fire');
    } else {
      this.dom.hudMultiplier.classList.remove('on-fire');
    }

    // Reset instruction card visuals
    this.dom.instructionCard.className = 'instruction-card';
    this.dom.stroopWordContainer.innerHTML = '';
    this.dom.instructionSubtext.textContent = '';

    // Handle Glitch correction animation
    if (prompt.isGlitch) {
      this.dom.instructionText.innerHTML = `<span class="fake-struck">${prompt.fakeText}</span><br><span class="real-correction">${prompt.mainText}</span>`;
      this.dom.instructionCard.classList.add('card-glitch');
    } else if (prompt.category === 'STROOP') {
      this.dom.instructionText.textContent = prompt.prefixText || prompt.mainText;
      const stroopEl = document.createElement('div');
      stroopEl.className = 'stroop-display-word';
      stroopEl.textContent = prompt.stroopWord;
      stroopEl.style.color = prompt.stroopInkHex;
      stroopEl.style.textShadow = `0 0 16px ${prompt.stroopInkHex}`;
      this.dom.stroopWordContainer.appendChild(stroopEl);
    } else {
      // Direct, Negative, Semantic, Opposite
      if (prompt.highlightWord) {
        const regex = new RegExp(`(${prompt.highlightWord})`, 'gi');
        const coloredText = prompt.mainText.replace(regex, `<span class="prompt-highlight" style="color:${prompt.highlightColor || '#00E5FF'}; text-shadow: 0 0 12px ${prompt.highlightColor || '#00E5FF'}">$1</span>`);
        this.dom.instructionText.innerHTML = coloredText;
      } else {
        this.dom.instructionText.textContent = prompt.mainText;
      }
    }

    // Dynamic warning card border for negative prompts
    if (prompt.isNegative) {
      this.dom.instructionCard.classList.add('negative-card');
    }

    // Render Buttons Grid
    this.dom.buttonGrid.innerHTML = '';
    this.dom.buttonGrid.className = `button-grid buttons-${buttons.length}`;

    buttons.forEach((btn, idx) => {
      const buttonEl = document.createElement('button');
      buttonEl.type = 'button';
      buttonEl.className = `game-color-btn color-${btn.colorId}`;
      buttonEl.dataset.index = idx;
      buttonEl.dataset.color = btn.colorId;

      // Styling and glowing custom properties
      buttonEl.style.setProperty('--btn-color', btn.hex);
      buttonEl.style.setProperty('--btn-glow', btn.glow);

      if (btn.isFlashing) {
        buttonEl.classList.add('btn-flashing-decoy');
      }

      buttonEl.innerHTML = `
        <span class="btn-inner">
          <span class="btn-color-dot" style="background-color: ${btn.hex}; box-shadow: 0 0 10px ${btn.hex};"></span>
          <span class="btn-label">${btn.name}</span>
        </span>
      `;

      // Touch & click binding with debounce protection
      const handleTapEvent = (e) => {
        e.preventDefault();
        buttonEl.classList.add('tapped');
        this.engine.handleTap(idx);
      };

      buttonEl.addEventListener('touchstart', handleTapEvent, { passive: false });
      buttonEl.addEventListener('mousedown', handleTapEvent);

      this.dom.buttonGrid.appendChild(buttonEl);
    });
  }

  renderTimer(data) {
    const { progress, isWarning, mode, timeRemainingMs } = data;
    const pct = Math.max(0, Math.min(100, progress * 100));

    this.dom.timerProgress.style.width = `${pct}%`;

    // Time text display
    const seconds = (timeRemainingMs / 1000).toFixed(1);
    this.dom.timerText.textContent = mode === 'classic' ? `${seconds}s` : `${seconds}s`;

    if (pct > 50) {
      this.dom.timerProgress.style.backgroundColor = '#00E5FF';
      this.dom.timerProgress.style.boxShadow = '0 0 12px #00E5FF';
    } else if (pct > 25) {
      this.dom.timerProgress.style.backgroundColor = '#FFEA00';
      this.dom.timerProgress.style.boxShadow = '0 0 12px #FFEA00';
    } else {
      this.dom.timerProgress.style.backgroundColor = '#FF1744';
      this.dom.timerProgress.style.boxShadow = '0 0 16px #FF1744';
    }

    if (isWarning) {
      this.dom.timerProgress.classList.add('timer-warning-pulse');
    } else {
      this.dom.timerProgress.classList.remove('timer-warning-pulse');
    }
  }

  handleCorrectFeedback(data) {
    const { earnedPoints, tappedButton, speedBonus, unlockedAchievements } = data;

    // Spawn floating score popup
    this.spawnFloatingScore(`+${earnedPoints}`, speedBonus > 0 ? `⚡ Speed +${speedBonus}` : null);

    // Announce any achievements unlocked mid-game
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      unlockedAchievements.forEach(ach => {
        this.showToast(`🏆 Unlocked: ${ach.title}!`, 3000);
      });
    }
  }

  handleWrongFeedback(data) {
    // Screen shake
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 400);
  }

  spawnFloatingScore(mainText, subText) {
    if (!this.dom.floatingScoreContainer) return;
    const popup = document.createElement('div');
    popup.className = 'floating-score-popup';
    popup.innerHTML = `<strong>${mainText}</strong>${subText ? ` <small>${subText}</small>` : ''}`;

    this.dom.floatingScoreContainer.appendChild(popup);
    setTimeout(() => popup.remove(), 800);
  }

  showComboMilestone(data) {
    if (!this.dom.comboMilestoneBanner) return;
    this.dom.comboMilestoneBanner.textContent = `🔥 COMBO x${data.streak}! +${data.bonus} BONUS!`;
    this.dom.comboMilestoneBanner.classList.remove('hidden');
    this.dom.comboMilestoneBanner.classList.add('banner-pop');

    setTimeout(() => {
      this.dom.comboMilestoneBanner.classList.add('hidden');
      this.dom.comboMilestoneBanner.classList.remove('banner-pop');
    }, 1200);
  }

  triggerChaosGlitch(data) {
    const el = document.body;
    el.classList.add('chaos-glitch-active');
    setTimeout(() => {
      el.classList.remove('chaos-glitch-active');
    }, data.duration || 300);
  }

  renderGameOver(summary) {
    this.currentScoreCardData = summary;
    this.showScreen('gameOverScreen');

    // Score counter animation
    this.animateCounter(this.dom.goScore, 0, summary.score, 900);

    // Personal best banner & Confetti
    if (summary.isNewBest && summary.score > 0) {
      this.dom.goNewBestBanner.classList.remove('hidden');
      this.confetti.burst({ count: 120 });
    } else {
      this.dom.goNewBestBanner.classList.add('hidden');
    }

    // Roast / Praise
    const evaluation = this.scoreCard.getRoastEvaluation(summary.score, summary.streak, summary.reason);
    this.dom.goRoastTitle.textContent = evaluation.title;
    this.dom.goRoastText.textContent = `"${evaluation.text}"`;

    // Stats
    this.dom.goStreak.textContent = `🔥 ${summary.streak}`;
    this.dom.goAccuracy.textContent = `🎯 ${summary.accuracy}%`;
    this.dom.goReflex.textContent = `⚡ ${summary.minReactionMs || 300}ms`;
    this.dom.goExplanation.textContent = summary.explanation || '';

    // Check newly unlocked themes
    const newThemes = this.storage.checkThemeUnlocks();
    if (newThemes.length > 0) {
      newThemes.forEach(t => {
        this.showToast(`🎨 New Theme Unlocked: ${t.name}!`, 3500);
      });
    }

    // Check achievements
    if (summary.unlockedAchievements && summary.unlockedAchievements.length > 0) {
      summary.unlockedAchievements.forEach(ach => {
        this.showToast(`🏆 Achievement: ${ach.title}!`, 3000);
      });
    }
  }

  animateCounter(element, start, end, duration) {
    if (!element) return;
    if (end === 0) {
      element.textContent = '0';
      return;
    }
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = end;
      }
    };
    requestAnimationFrame(update);
  }

  async handleShareClick() {
    if (!this.currentScoreCardData) return;
    const res = await this.scoreCard.shareScore(this.currentScoreCardData);
    if (res.method === 'clipboard') {
      this.showToast('📋 Challenge link copied to clipboard!');
    } else if (res.success) {
      this.showToast('🚀 Shared successfully!');
    }
  }

  async openScoreCardPreview() {
    if (!this.currentScoreCardData) return;
    const cardModal = this.dom.shareCardModal;
    const previewContainer = document.getElementById('scoreCardImageContainer');
    const btnDownload = document.getElementById('btnDownloadCard');
    const btnCopyChallenge = document.getElementById('btnCopyChallengeLink');

    previewContainer.innerHTML = '<div class="card-loading">Generating neon score card...</div>';
    this.openModal(cardModal);

    const { canvas, dataUrl, challengeCode } = await this.scoreCard.createScoreCard(this.currentScoreCardData);

    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = 'generated-card-img';
    previewContainer.innerHTML = '';
    previewContainer.appendChild(img);

    btnDownload.onclick = () => {
      this.sound.playTap();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `DontTapTheWrongOne_Score_${this.currentScoreCardData.score}.png`;
      a.click();
      this.showToast('💾 Score card downloaded!');
    };

    btnCopyChallenge.onclick = async () => {
      this.sound.playTap();
      const shareUrl = this.scoreCard.getShareUrl(this.currentScoreCardData.mode, this.currentScoreCardData.score, challengeCode);
      const shareText = `Can you beat my score of ${this.currentScoreCardData.score} in DON'T TAP THE WRONG ONE?`;
      await this.scoreCard.copyToClipboard(shareText, shareUrl);
      this.showToast('📋 Challenge link copied to clipboard!');
    };
  }

  renderStatsModal() {
    const stats = this.storage.stats;
    const highScores = this.storage.highScores;

    document.getElementById('statTotalGames').textContent = stats.gamesPlayed || 0;
    document.getElementById('statBestStreak').textContent = stats.bestStreakEver || 0;
    document.getElementById('statOverallAccuracy').textContent = `${this.storage.getOverallAccuracy()}%`;
    document.getElementById('statFastestReaction').textContent = stats.fastestReactionMs === 9999 ? '0ms' : `${stats.fastestReactionMs}ms`;
    document.getElementById('statTotalScore').textContent = stats.totalScoreEarned.toLocaleString();
    document.getElementById('statConsecutiveDays').textContent = `${stats.consecutiveDays || 1} Days`;

    document.getElementById('statBestClassic').textContent = highScores.classic?.score || 0;
    document.getElementById('statBestChaos').textContent = highScores.chaos?.score || 0;
    document.getElementById('statBestImpossible').textContent = highScores.impossible?.score || 0;
    document.getElementById('statBestDaily').textContent = highScores.daily?.score || 0;
  }

  renderAchievementsModal() {
    const container = document.getElementById('achievementsListContainer');
    if (!container) return;

    const list = this.achievements.getAll();
    container.innerHTML = '';

    list.forEach(item => {
      const el = document.createElement('div');
      el.className = `achievement-item ${item.isUnlocked ? 'unlocked' : 'locked'}`;
      el.innerHTML = `
        <div class="achievement-icon">${item.icon}</div>
        <div class="achievement-info">
          <h4>${item.title}</h4>
          <p>${item.description}</p>
        </div>
        <div class="achievement-status">
          ${item.isUnlocked ? '✅' : '🔒'}
        </div>
      `;
      container.appendChild(el);
    });
  }

  renderThemesModal() {
    const container = document.getElementById('themesListContainer');
    if (!container) return;

    container.innerHTML = '';
    THEMES.forEach(t => {
      const isUnlocked = this.storage.unlockedThemes.includes(t.id);
      const isActive = this.storage.activeTheme === t.id;

      const el = document.createElement('div');
      el.className = `theme-item ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active-theme' : ''}`;
      el.innerHTML = `
        <div class="theme-header">
          <h4>${t.name} ${isActive ? '⚡ Active' : ''}</h4>
          <span class="theme-badge">${isUnlocked ? 'Unlocked' : 'Locked'}</span>
        </div>
        <p class="theme-desc">${t.description}</p>
        <p class="theme-condition"><small>${isUnlocked ? 'Ready to use' : `🔒 ${t.unlockCondition}`}</small></p>
      `;

      if (isUnlocked) {
        el.addEventListener('click', () => {
          this.sound.playTap();
          this.storage.setTheme(t.id);
          this.renderThemesModal();
          this.showToast(`🎨 Theme changed to ${t.name}!`);
        });
      }

      container.appendChild(el);
    });
  }

  applyActiveTheme() {
    const active = this.storage.activeTheme;
    if (active) {
      document.documentElement.setAttribute('data-theme', active);
    }
  }
}

window.gameUI = new UIController(
  window.gameEngine,
  window.gameSound,
  window.gameStorage,
  window.gameConfetti,
  window.gameScoreCard,
  window.gameAchievements
);
