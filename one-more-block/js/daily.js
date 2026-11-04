/**
 * ONE MORE BLOCK - Daily Challenge & Seeded PRNG Engine
 * Generates identical towers and block behaviors for all players worldwide every day.
 */

class DailyManager {
  constructor() {
    this.todayStr = this.getTodayDateString();
  }

  getTodayDateString() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Generate integer seed from date string
  getDailySeed(dateStr = this.todayStr) {
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || 123456789;
  }

  // Fast Mulberry32 32-bit PRNG
  createRNG(seed) {
    let s = seed;
    return function() {
      s |= 0;
      s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Check and update daily streak
  checkDailyStreak() {
    const storage = window.storageManager;
    const stats = storage.data.stats;
    const lastDate = stats.lastDailyDate;
    const today = this.todayStr;

    if (lastDate === today) {
      // Already completed today
      return { playedToday: true, streak: stats.dailyStreak };
    }

    // Check if yesterday was played
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`;

    if (lastDate === yesterdayStr) {
      // Streak is intact
      return { playedToday: false, streak: stats.dailyStreak };
    } else if (!lastDate) {
      return { playedToday: false, streak: 0 };
    } else {
      // Streak broken
      stats.dailyStreak = 0;
      storage.save();
      return { playedToday: false, streak: 0 };
    }
  }

  recordDailyPlay() {
    const storage = window.storageManager;
    const stats = storage.data.stats;
    const today = this.todayStr;

    if (stats.lastDailyDate !== today) {
      stats.dailyStreak = (stats.dailyStreak || 0) + 1;
      stats.lastDailyDate = today;
      storage.save();
    }
    return stats.dailyStreak;
  }

  getChallengeSubtitle() {
    const seed = this.getDailySeed();
    const streakInfo = this.checkDailyStreak();
    return `Tower #${seed % 9999} • Streak: ${streakInfo.streak}🔥`;
  }
}

window.dailyManager = new DailyManager();
