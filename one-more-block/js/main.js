/**
 * ONE MORE BLOCK - Main Controller & UI Bindings
 * Handles screen transitions, input, modals, and the game loop
 */

let canvas, renderer, game;
let lastTime = 0;

// URL parameters inspection for challenge mode
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const challenge = params.get('challenge');
  const mode = params.get('mode') || 'classic';
  const name = params.get('name') || 'Friend';

  if (challenge) {
    const challengeFloor = parseInt(challenge, 10);
    if (challengeFloor > 0) {
      game.setChallenge(challengeFloor, name);
      showChallengeBanner(challengeFloor, name);
      // Automatically switch to that mode
      selectMode(mode);
    }
  }
}

function showChallengeBanner(floor, name) {
  const banner = document.getElementById('challengeAlertBanner');
  if (banner) {
    banner.innerHTML = `<span>🔥 <strong>${name.toUpperCase()}</strong> challenged you to beat <strong>FLOOR ${floor}</strong>!</span>`;
    banner.classList.remove('hidden');
  }
}

// Switch screens: 'home', 'gameplay', 'gameover'
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');

  // Update sound engine state
  window.soundEngine.resume();
}

function openModal(modalId) {
  window.soundEngine.playClick();
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('visible');
    // Refresh modal contents if dynamic
    if (modalId === 'skinsModal') renderSkinsModal();
    if (modalId === 'achievementsModal') renderAchievementsModal();
  }
}

function closeModal(modalId) {
  window.soundEngine.playClick();
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('visible');
}

// Mode Selection
function selectMode(mode) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  game.mode = mode;
  updateHomeStats();
}

function updateHomeStats() {
  const best = window.storageManager.getBest(game.mode);
  const bestFloorEl = document.getElementById('homeBestFloor');
  const bestScoreEl = document.getElementById('homeBestScore');
  if (bestFloorEl) bestFloorEl.textContent = best.bestFloor;
  if (bestScoreEl) bestScoreEl.textContent = best.bestScore.toLocaleString();

  // Daily info if daily mode
  const dailyBadge = document.getElementById('homeDailySubtitle');
  if (dailyBadge) {
    if (game.mode === 'daily') {
      dailyBadge.textContent = window.dailyManager.getChallengeSubtitle();
      dailyBadge.classList.remove('hidden');
    } else {
      dailyBadge.classList.add('hidden');
    }
  }
}

// Render Skins & Themes modal
function renderSkinsModal() {
  const storage = window.storageManager;
  const skinsContainer = document.getElementById('skinsList');
  const themesContainer = document.getElementById('themesList');

  if (skinsContainer) {
    skinsContainer.innerHTML = '';
    SKINS_CATALOG.forEach(skin => {
      const isUnlocked = storage.data.unlockedSkins.includes(skin.id);
      const isActive = storage.data.activeSkin === skin.id;

      const item = document.createElement('div');
      item.className = `custom-item ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`;
      
      const previewDots = skin.preview.map(c => `<span class="preview-dot" style="background:${c}"></span>`).join('');

      item.innerHTML = `
        <div class="item-header">
          <div class="item-preview">${previewDots}</div>
          <div class="item-info">
            <div class="item-name">${skin.name} ${isActive ? '✓' : ''}</div>
            <div class="item-desc">${skin.description}</div>
          </div>
        </div>
        <div class="item-status">${isUnlocked ? (isActive ? 'EQUIPPED' : 'TAP TO EQUIP') : `🔒 ${skin.unlockReq}`}</div>
      `;

      if (isUnlocked) {
        item.addEventListener('click', () => {
          storage.setSkin(skin.id);
          window.soundEngine.playClick();
          renderSkinsModal();
        });
      }
      skinsContainer.appendChild(item);
    });
  }

  if (themesContainer) {
    themesContainer.innerHTML = '';
    THEMES_CATALOG.forEach(theme => {
      const isUnlocked = storage.data.unlockedThemes.includes(theme.id);
      const isActive = storage.data.activeTheme === theme.id;

      const item = document.createElement('div');
      item.className = `custom-item ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`;

      item.innerHTML = `
        <div class="item-header">
          <div class="item-preview theme-thumb" style="background:${theme.previewColor}"></div>
          <div class="item-info">
            <div class="item-name">${theme.name} ${isActive ? '✓' : ''}</div>
            <div class="item-desc">${theme.description}</div>
          </div>
        </div>
        <div class="item-status">${isUnlocked ? (isActive ? 'EQUIPPED' : 'TAP TO EQUIP') : `🔒 ${theme.unlockReq}`}</div>
      `;

      if (isUnlocked) {
        item.addEventListener('click', () => {
          storage.setTheme(theme.id);
          window.soundEngine.playClick();
          renderSkinsModal();
        });
      }
      themesContainer.appendChild(item);
    });
  }
}

// Render Achievements modal
function renderAchievementsModal() {
  const container = document.getElementById('achievementsList');
  if (!container) return;
  const storage = window.storageManager;
  container.innerHTML = '';

  ACHIEVEMENTS_CATALOG.forEach(ach => {
    const isUnlocked = storage.data.achievements.includes(ach.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="ach-icon">${isUnlocked ? ach.icon : '🔒'}</div>
      <div class="ach-info">
        <div class="ach-title">${ach.title}</div>
        <div class="ach-desc">${ach.desc}</div>
      </div>
      <div class="ach-badge">${isUnlocked ? 'COMPLETED' : 'LOCKED'}</div>
    `;
    container.appendChild(card);
  });
}

// Show Game Over UI
function handleGameOverUI(data) {
  showScreen('gameOverScreen');

  document.getElementById('goFinalFloor').textContent = data.floor;
  document.getElementById('goFinalScore').textContent = data.score.toLocaleString();
  document.getElementById('goRating').textContent = data.rating;
  document.getElementById('goQuote').textContent = `"${data.quote}"`;

  const modeBadge = document.getElementById('goCurrentMode');
  if (modeBadge) {
    modeBadge.textContent = game.mode.toUpperCase();
  }

  const best = window.storageManager.getBest(game.mode);
  document.getElementById('goBestFloor').textContent = best.bestFloor;

  const recordBadge = document.getElementById('goRecordBadge');
  if (recordBadge) {
    if (data.recordResult?.isNewFloorRecord || data.recordResult?.isNewScoreRecord) {
      recordBadge.classList.remove('hidden');
    } else {
      recordBadge.classList.add('hidden');
    }
  }

  // Pre-generate Score Card URL in memory
  window.shareManager.generateScoreCard(
    data.floor,
    data.score,
    data.rating,
    game.mode,
    window.storageManager.data.activeSkin
  ).then(dataUrl => {
    window.latestScoreCardUrl = dataUrl;
    window.latestFloor = data.floor;
  });
}

// Main game loop using delta time
function gameLoop(time) {
  if (!lastTime) lastTime = time;
  const dt = Math.min((time - lastTime) / 16.666, 2.5); // Normalized to 60fps
  lastTime = time;

  game.update(dt);
  game.render();

  requestAnimationFrame(gameLoop);
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  renderer = new IsometricRenderer(canvas);
  game = new GameEngine(renderer);

  // Resize canvas
  window.addEventListener('resize', () => renderer.resize());
  renderer.resize();

  // Engine callbacks
  game.onStateChange = (state, data) => {
    if (state === 'GAMEOVER' && data) {
      handleGameOverUI(data);
    } else if (state === 'PLAYING') {
      showScreen('gameplayScreen');
    } else if (state === 'PAUSED') {
      document.getElementById('pauseModal').classList.add('visible');
    }
  };

  game.onScoreUpdate = (floor, score, streak) => {
    const hudFloor = document.getElementById('hudFloor');
    const hudScore = document.getElementById('hudScore');
    const hudStreak = document.getElementById('hudStreak');

    if (hudFloor) hudFloor.textContent = floor;
    if (hudScore) hudScore.textContent = score;

    if (hudStreak) {
      if (streak >= 2) {
        hudStreak.textContent = `PERFECT x${streak} 🔥`;
        hudStreak.classList.remove('hidden');
        hudStreak.classList.add('pulse');
      } else {
        hudStreak.classList.add('hidden');
        hudStreak.classList.remove('pulse');
      }
    }
  };

  game.onEventTrigger = (event) => {
    const banner = document.getElementById('activeEventBanner');
    if (!banner) return;
    if (!event) {
      banner.classList.add('hidden');
    } else {
      let text = '';
      if (event === 'double_points') text = '⚡ 2X DOUBLE POINTS ACTIVATED!';
      else if (event === 'slow_mo') text = '⏱️ FOCUS TIME: SLOW MOTION';
      else if (event === 'golden_block') text = '✨ GOLDEN BLOCK: BONUS CHANCE';
      else if (event === 'expand_block') text = '🌟 PLATFORM EXPANDED!';

      banner.textContent = text;
      banner.classList.remove('hidden');
    }
  };

  // Wire User Interactions for block drop
  const handleDropInput = (e) => {
    if (game.state === 'PLAYING') {
      // Don't trigger if clicked on pause button
      if (e && e.target && e.target.closest('#btnPause')) return;
      game.placeBlock();
    }
  };

  window.addEventListener('pointerdown', (e) => {
    // Only handle if clicking on canvas or gameplay area
    if (e.target.closest('.modal') || e.target.closest('.interactive-btn')) return;
    handleDropInput(e);
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      if (game.state === 'PLAYING') {
        e.preventDefault();
        handleDropInput(e);
      } else if (game.state === 'GAMEOVER') {
        e.preventDefault();
        startGame();
      }
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      if (game.state === 'PLAYING') game.pause();
      else if (game.state === 'PAUSED') resumeGame();
    }
  });

  // Home Screen Buttons
  document.getElementById('btnPlay').addEventListener('click', () => {
    window.soundEngine.playClick();
    startGame();
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.soundEngine.playClick();
      selectMode(btn.dataset.mode);
    });
  });

  document.getElementById('btnHowToPlay').addEventListener('click', () => openModal('howToPlayModal'));
  document.getElementById('btnSkins').addEventListener('click', () => openModal('skinsModal'));
  document.getElementById('btnAchievements').addEventListener('click', () => openModal('achievementsModal'));

  // Sound & Haptics toggles
  const soundToggle = document.getElementById('toggleSound');
  const hapticsToggle = document.getElementById('toggleHaptics');

  const updateSoundUI = () => {
    const isMuted = !window.storageManager.data.settings.sound;
    window.soundEngine.setMuted(isMuted);
    if (soundToggle) soundToggle.textContent = isMuted ? '🔇 Sound: Off' : '🔊 Sound: On';
  };
  const updateHapticsUI = () => {
    const enabled = window.storageManager.data.settings.haptics;
    window.soundEngine.setHaptics(enabled);
    if (hapticsToggle) hapticsToggle.textContent = enabled ? '📳 Haptics: On' : '📴 Haptics: Off';
  };

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const cur = window.storageManager.data.settings.sound;
      window.storageManager.updateSettings('sound', !cur);
      updateSoundUI();
      window.soundEngine.playClick();
    });
  }

  if (hapticsToggle) {
    hapticsToggle.addEventListener('click', () => {
      const cur = window.storageManager.data.settings.haptics;
      window.storageManager.updateSettings('haptics', !cur);
      updateHapticsUI();
      window.soundEngine.playClick();
    });
  }

  updateSoundUI();
  updateHapticsUI();

  // Gameplay HUD Buttons
  document.getElementById('btnPause').addEventListener('click', () => {
    window.soundEngine.playClick();
    game.pause();
  });

  // Pause Modal Buttons
  document.getElementById('btnResume').addEventListener('click', () => resumeGame());
  document.getElementById('btnRestart').addEventListener('click', () => {
    closeModal('pauseModal');
    startGame();
  });
  document.getElementById('btnQuitHome').addEventListener('click', () => {
    closeModal('pauseModal');
    game.state = 'MENU';
    showScreen('homeScreen');
    updateHomeStats();
  });

  // Game Over Screen Buttons
  document.getElementById('btnPlayAgain').addEventListener('click', () => {
    window.soundEngine.playClick();
    startGame();
  });

  document.getElementById('btnShareScore').addEventListener('click', () => {
    window.soundEngine.playClick();
    const finalFloor = parseInt(document.getElementById('goFinalFloor').textContent, 10);
    const finalScore = parseInt(document.getElementById('goFinalScore').textContent.replace(/,/g, ''), 10);
    window.shareManager.shareScore(finalFloor, finalScore, game.mode);
  });

  document.getElementById('btnChallengeFriends').addEventListener('click', () => {
    window.soundEngine.playClick();
    const finalFloor = parseInt(document.getElementById('goFinalFloor').textContent, 10);
    window.shareManager.copyChallengeLink(finalFloor, game.mode);
  });

  document.getElementById('btnViewCard').addEventListener('click', () => {
    window.soundEngine.playClick();
    if (window.latestScoreCardUrl) {
      const img = document.getElementById('scoreCardImage');
      if (img) img.src = window.latestScoreCardUrl;
      openModal('scoreCardModal');
    }
  });

  document.getElementById('btnDownloadCard').addEventListener('click', () => {
    window.soundEngine.playClick();
    if (window.latestScoreCardUrl) {
      window.shareManager.downloadCard(window.latestScoreCardUrl, window.latestFloor || 1);
    }
  });

  document.getElementById('btnGoHome').addEventListener('click', () => {
    window.soundEngine.playClick();
    game.state = 'MENU';
    showScreen('homeScreen');
    updateHomeStats();
  });

  // Close modals
  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.remove('visible');
    });
  });

  // Check URL params for friend challenge
  parseUrlParams();
  updateHomeStats();

  // Start animation loop
  requestAnimationFrame(gameLoop);
});

function startGame() {
  document.getElementById('pauseModal').classList.remove('visible');
  document.getElementById('scoreCardModal').classList.remove('visible');
  game.start(game.mode);
}

function resumeGame() {
  document.getElementById('pauseModal').classList.remove('visible');
  window.soundEngine.playClick();
  game.resume();
}
