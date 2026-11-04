/**
 * BRAIN LAG - Local Storage & Player Progression Engine
 */

class StorageManager {
  constructor() {
    this.KEY_DATA = 'brainlag_player_data';
    this.KEY_SETTINGS = 'brainlag_settings';
    this.data = this.loadData();
  }

  getDefaultData() {
    return {
      highScores: {
        overthink: 0,
        colorchaos: 0,
        memory: 0,
        reflex: 0,
        destroyer: 0,
        daily: 0
      },
      bestStreaks: {
        overthink: 0,
        colorchaos: 0,
        memory: 0,
        reflex: 0,
        destroyer: 0
      },
      fastestReflexMs: 9999,
      stats: {
        totalGames: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        highestOverallStreak: 0,
        sharesCount: 0
      },
      daily: {
        lastPlayedDate: null,
        currentStreak: 0,
        lastCompletedDate: null,
        bestDailyScore: 0
      },
      achievements: {},
      unlockedThemes: ['cyber-neon'],
      activeTheme: 'cyber-neon'
    };
  }

  loadData() {
    try {
      const raw = localStorage.getItem(this.KEY_DATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Deep merge with defaults so updates won't break
        const defaults = this.getDefaultData();
        return {
          ...defaults,
          ...parsed,
          highScores: { ...defaults.highScores, ...(parsed.highScores || {}) },
          bestStreaks: { ...defaults.bestStreaks, ...(parsed.bestStreaks || {}) },
          stats: { ...defaults.stats, ...(parsed.stats || {}) },
          daily: { ...defaults.daily, ...(parsed.daily || {}) },
          achievements: parsed.achievements || {},
          unlockedThemes: parsed.unlockedThemes || ['cyber-neon']
        };
      }
    } catch (e) {
      console.warn("Error loading storage:", e);
    }
    return this.getDefaultData();
  }

  save() {
    try {
      localStorage.setItem(this.KEY_DATA, JSON.stringify(this.data));
    } catch (e) {
      console.warn("Error saving storage:", e);
    }
  }

  getHighScore(mode) {
    return this.data.highScores[mode] || 0;
  }

  recordGameEnd({ mode, score, streak, correct, total, fastestReactionMs }) {
    let isNewHigh = false;
    let isNewStreak = false;

    // Update Mode high score
    if (score > (this.data.highScores[mode] || 0)) {
      this.data.highScores[mode] = score;
      isNewHigh = true;
    }

    // Update streak
    if (streak > (this.data.bestStreaks[mode] || 0)) {
      this.data.bestStreaks[mode] = streak;
      isNewStreak = true;
    }

    if (streak > this.data.stats.highestOverallStreak) {
      this.data.stats.highestOverallStreak = streak;
    }

    // Update Reflex
    if (fastestReactionMs && fastestReactionMs > 50 && fastestReactionMs < this.data.fastestReflexMs) {
      this.data.fastestReflexMs = fastestReactionMs;
    }

    // Global Stats
    this.data.stats.totalGames += 1;
    this.data.stats.totalQuestions += total;
    this.data.stats.totalCorrect += correct;

    // Check achievements
    const newlyUnlocked = this.checkAchievements({
      mode,
      score,
      streak,
      correct,
      total,
      fastestReactionMs,
      isNewHigh
    });

    this.save();
    return { isNewHigh, isNewStreak, newlyUnlocked };
  }

  getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  checkDailyLogin() {
    const today = this.getTodayString();
    const lastDate = this.data.daily.lastPlayedDate;

    if (!lastDate) {
      this.data.daily.currentStreak = 1;
      this.data.daily.lastPlayedDate = today;
    } else if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (lastDate === yesterdayStr) {
        this.data.daily.currentStreak += 1;
      } else {
        this.data.daily.currentStreak = 1; // streak broken
      }
      this.data.daily.lastPlayedDate = today;
    }

    if (this.data.daily.currentStreak >= 3) {
      this.unlockAchievement('daily_streak_3');
    }

    this.save();
    return {
      today,
      streak: this.data.daily.currentStreak,
      completedToday: this.data.daily.lastCompletedDate === today
    };
  }

  recordDailyCompletion(score) {
    const today = this.getTodayString();
    this.data.daily.lastCompletedDate = today;
    if (score > (this.data.daily.bestDailyScore || 0)) {
      this.data.daily.bestDailyScore = score;
    }
    const newlyUnlocked = [];
    if (this.unlockAchievement('daily_starter')) newlyUnlocked.push('daily_starter');
    this.save();
    return newlyUnlocked;
  }

  recordShare() {
    this.data.stats.sharesCount += 1;
    const unlocked = [];
    if (this.unlockAchievement('sharer')) unlocked.push('sharer');
    this.save();
    return unlocked;
  }

  unlockAchievement(id) {
    if (!this.data.achievements[id]) {
      this.data.achievements[id] = {
        unlockedAt: Date.now()
      };
      // Unlock bonus themes based on achievements
      const count = Object.keys(this.data.achievements).length;
      if (count >= 3 && !this.data.unlockedThemes.includes('synth-sunset')) {
        this.data.unlockedThemes.push('synth-sunset');
      }
      if (count >= 6 && !this.data.unlockedThemes.includes('matrix-code')) {
        this.data.unlockedThemes.push('matrix-code');
      }
      if (count >= 9 && !this.data.unlockedThemes.includes('electric-candy')) {
        this.data.unlockedThemes.push('electric-candy');
      }
      this.save();
      return true;
    }
    return false;
  }

  checkAchievements(ctx) {
    const newlyUnlocked = [];

    const check = (id, condition) => {
      if (condition && this.unlockAchievement(id)) {
        newlyUnlocked.push(id);
      }
    };

    check('first_game', this.data.stats.totalGames >= 1);
    check('streak_5', ctx.streak >= 5);
    check('streak_10', ctx.streak >= 10);
    check('streak_20', ctx.streak >= 20);
    check('color_pro', ctx.mode === 'colorchaos' && ctx.score >= 500);
    check('memory_titan', ctx.mode === 'memory' && ctx.score >= 500);
    check('reflex_god', ctx.fastestReactionMs && ctx.fastestReactionMs <= 250);
    check('destroyer_champ', ctx.mode === 'destroyer' && ctx.score >= 800);
    check('perfectionist', ctx.total >= 8 && ctx.correct === ctx.total);
    check('brain_century', this.data.stats.totalCorrect >= 100);

    return newlyUnlocked;
  }

  getOverallAccuracy() {
    if (this.data.stats.totalQuestions === 0) return 100;
    return Math.round((this.data.stats.totalCorrect / this.data.stats.totalQuestions) * 100);
  }

  setTheme(themeId) {
    if (this.data.unlockedThemes.includes(themeId)) {
      this.data.activeTheme = themeId;
      this.save();
      return true;
    }
    return false;
  }
}

// Global Definitions for Badges
window.ACHIEVEMENT_DEFINITIONS = {
  first_game: {
    id: 'first_game',
    title: 'First Synapse',
    desc: 'Complete your very first game of Brain Lag.',
    icon: '⚡'
  },
  first_lag: {
    id: 'first_lag',
    title: 'Brain Freeze',
    desc: 'Lag out on an obvious trick question.',
    icon: '🧊'
  },
  streak_5: {
    id: 'streak_5',
    title: 'On Fire',
    desc: 'Reach a 5x streak combo.',
    icon: '🔥'
  },
  streak_10: {
    id: 'streak_10',
    title: 'Galaxy Mind',
    desc: 'Reach a 10x streak without a single mistake.',
    icon: '🧠'
  },
  streak_20: {
    id: 'streak_20',
    title: 'Transcendent Being',
    desc: 'Achieve an astonishing 20x combo streak.',
    icon: '👑'
  },
  color_pro: {
    id: 'color_pro',
    title: 'Stroop Master',
    desc: 'Score 500+ in Color Chaos.',
    icon: '🎨'
  },
  memory_titan: {
    id: 'memory_titan',
    title: 'Elephant Memory',
    desc: 'Score 500+ in Memory Meltdown.',
    icon: '🐘'
  },
  reflex_god: {
    id: 'reflex_god',
    title: 'Speed of Light',
    desc: 'React in under 250ms in Reflex Rush.',
    icon: '⚡'
  },
  destroyer_champ: {
    id: 'destroyer_champ',
    title: 'Destroyer Conqueror',
    desc: 'Score 800+ in Brain Destroyer.',
    icon: '💥'
  },
  daily_starter: {
    id: 'daily_starter',
    title: 'Daily Dedication',
    desc: 'Complete a Daily Brain Challenge.',
    icon: '📅'
  },
  daily_streak_3: {
    id: 'daily_streak_3',
    title: '3-Day Brainwave',
    desc: 'Play Brain Lag 3 days in a row.',
    icon: '🌟'
  },
  perfectionist: {
    id: 'perfectionist',
    title: 'Zero Lag Run',
    desc: 'Finish a run with 100% accuracy (min 8 questions).',
    icon: '🎯'
  },
  sharer: {
    id: 'sharer',
    title: 'Social Menace',
    desc: 'Share your score card or challenge a friend.',
    icon: '📢'
  },
  brain_century: {
    id: 'brain_century',
    title: 'Century Club',
    desc: 'Answer 100 questions correctly across all games.',
    icon: '💯'
  }
};

window.storageManager = new StorageManager();
