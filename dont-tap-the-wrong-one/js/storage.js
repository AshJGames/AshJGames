/**
 * DON'T TAP THE WRONG ONE - Local Storage & Player Progression
 * Manages stats, high scores, themes, daily streaks, and persistent settings.
 */

const STORAGE_KEYS = {
  HIGH_SCORES: 'dttwo_high_scores',
  STATS: 'dttwo_stats',
  THEME: 'dttwo_active_theme',
  UNLOCKED_THEMES: 'dttwo_unlocked_themes',
  ACHIEVEMENTS: 'dttwo_achievements',
  DAILY: 'dttwo_daily_data',
  PLAYER_NAME: 'dttwo_player_name',
};

const THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Electric cyan, hot pink, lime, and amber glows.',
    unlockCondition: 'Default Theme',
    isUnlocked: true,
  },
  {
    id: 'arcade80s',
    name: '80s Synthwave',
    description: 'Deep magenta, violet, sunset orange, and cyan.',
    unlockCondition: 'Score 200+ in any mode',
    unlockCheck: (stats, highScores) => {
      return Object.values(highScores).some(h => (h?.score || 0) >= 200);
    }
  },
  {
    id: 'matrix',
    name: 'Terminal Matrix',
    description: 'Monochrome phosphorous greens and digital noir.',
    unlockCondition: 'Reach a streak of 15 in Chaos Mode',
    unlockCheck: (stats, highScores) => {
      return (highScores.chaos?.streak || 0) >= 15;
    }
  },
  {
    id: 'pastel',
    name: 'Candy Pastel Pop',
    description: 'Playful marshmallow pastel tones with soft glow.',
    unlockCondition: 'Play 15 total games',
    unlockCheck: (stats) => (stats.gamesPlayed || 0) >= 15
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    description: 'Blazing crimson, incandescent gold, and plasma violet.',
    unlockCondition: 'Score 300+ in Impossible Mode',
    unlockCheck: (stats, highScores) => {
      return (highScores.impossible?.score || 0) >= 300;
    }
  }
];

class StorageManager {
  constructor() {
    this.highScores = this.load(STORAGE_KEYS.HIGH_SCORES, {
      classic: { score: 0, streak: 0, date: null },
      chaos: { score: 0, streak: 0, date: null },
      impossible: { score: 0, streak: 0, date: null },
      daily: { score: 0, streak: 0, date: null }
    });

    this.stats = this.load(STORAGE_KEYS.STATS, {
      gamesPlayed: 0,
      totalCorrect: 0,
      totalWrong: 0,
      bestStreakEver: 0,
      fastestReactionMs: 9999,
      consecutiveDays: 1,
      lastActiveDate: null,
      totalScoreEarned: 0,
    });

    this.dailyData = this.load(STORAGE_KEYS.DAILY, {
      history: {}, // 'YYYY-MM-DD': { score, completedAt }
    });

    this.unlockedThemes = this.load(STORAGE_KEYS.UNLOCKED_THEMES, ['cyberpunk']);
    this.activeTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'cyberpunk';
    this.playerName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || this.generateDefaultName();

    this.updateDailyStreak();
    this.checkThemeUnlocks();
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return { ...fallback, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn(`Error loading key ${key}:`, e);
    }
    return fallback;
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Error saving key ${key}:`, e);
    }
  }

  generateDefaultName() {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const defaultName = `TapMaster#${randomId}`;
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, defaultName);
    } catch (e) {}
    return defaultName;
  }

  setPlayerName(name) {
    if (!name || !name.trim()) return;
    this.playerName = name.trim().slice(0, 16);
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, this.playerName);
    } catch (e) {}
  }

  getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  updateDailyStreak() {
    const today = this.getTodayKey();
    const lastActive = this.stats.lastActiveDate;

    if (!lastActive) {
      this.stats.consecutiveDays = 1;
      this.stats.lastActiveDate = today;
      this.save(STORAGE_KEYS.STATS, this.stats);
      return;
    }

    if (lastActive === today) {
      return; // Already recorded today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (lastActive === yStr) {
      this.stats.consecutiveDays = (this.stats.consecutiveDays || 1) + 1;
    } else {
      this.stats.consecutiveDays = 1; // Streak broke
    }

    this.stats.lastActiveDate = today;
    this.save(STORAGE_KEYS.STATS, this.stats);
  }

  recordGame(mode, score, streak, correctCount, wrongCount, minReactionMs) {
    this.stats.gamesPlayed += 1;
    this.stats.totalCorrect += correctCount;
    this.stats.totalWrong += wrongCount;
    this.stats.totalScoreEarned += score;

    if (streak > this.stats.bestStreakEver) {
      this.stats.bestStreakEver = streak;
    }

    if (minReactionMs && minReactionMs < this.stats.fastestReactionMs) {
      this.stats.fastestReactionMs = minReactionMs;
    }

    // High score check
    let isNewBest = false;
    const modeKey = mode.toLowerCase();
    const currentBest = this.highScores[modeKey] || { score: 0, streak: 0 };

    if (score > currentBest.score) {
      isNewBest = true;
      this.highScores[modeKey] = {
        score,
        streak: Math.max(streak, currentBest.streak),
        date: new Date().toISOString()
      };
      this.save(STORAGE_KEYS.HIGH_SCORES, this.highScores);
    } else if (streak > (currentBest.streak || 0)) {
      this.highScores[modeKey].streak = streak;
      this.save(STORAGE_KEYS.HIGH_SCORES, this.highScores);
    }

    // If Daily Challenge, record in daily data
    if (modeKey === 'daily') {
      const today = this.getTodayKey();
      const existingDaily = this.dailyData.history[today] || { score: 0 };
      if (score >= existingDaily.score) {
        this.dailyData.history[today] = {
          score,
          streak,
          completedAt: new Date().toISOString()
        };
        this.save(STORAGE_KEYS.DAILY, this.dailyData);
      }
    }

    this.save(STORAGE_KEYS.STATS, this.stats);
    this.checkThemeUnlocks();

    return { isNewBest, previousBest: currentBest.score };
  }

  checkThemeUnlocks() {
    const newlyUnlocked = [];
    THEMES.forEach(t => {
      if (!this.unlockedThemes.includes(t.id)) {
        if (t.unlockCheck && t.unlockCheck(this.stats, this.highScores)) {
          this.unlockedThemes.push(t.id);
          newlyUnlocked.push(t);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      this.save(STORAGE_KEYS.UNLOCKED_THEMES, this.unlockedThemes);
    }
    return newlyUnlocked;
  }

  setTheme(themeId) {
    if (!this.unlockedThemes.includes(themeId)) return false;
    this.activeTheme = themeId;
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, themeId);
      document.documentElement.setAttribute('data-theme', themeId);
    } catch (e) {}
    return true;
  }

  getBestScore(mode) {
    const key = mode.toLowerCase();
    return (this.highScores[key] && this.highScores[key].score) || 0;
  }

  getOverallAccuracy() {
    const total = this.stats.totalCorrect + this.stats.totalWrong;
    if (total === 0) return 100;
    return Math.round((this.stats.totalCorrect / total) * 100);
  }
}

// Global storage singleton
window.gameStorage = new StorageManager();
