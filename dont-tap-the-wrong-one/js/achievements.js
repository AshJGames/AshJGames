/**
 * DON'T TAP THE WRONG ONE - Achievements & Badge System
 * Rewards skill, milestones, speed, and dedication.
 */

const ACHIEVEMENTS_DATA = [
  {
    id: 'first_tap',
    title: 'First Blood',
    description: 'Score your very first correct tap.',
    icon: '⚡',
    check: (gameEvent) => gameEvent.totalCorrect >= 1
  },
  {
    id: 'streak_5',
    title: 'Warming Up',
    description: 'Achieve a 5 combo streak.',
    icon: '🔥',
    check: (gameEvent) => gameEvent.currentStreak >= 5
  },
  {
    id: 'streak_10',
    title: 'On Fire!',
    description: 'Reach a 10 combo streak.',
    icon: '💥',
    check: (gameEvent) => gameEvent.currentStreak >= 10
  },
  {
    id: 'streak_25',
    title: 'Matrix Reflexes',
    description: 'Reach an unbelievable 25 combo streak.',
    icon: '🧠',
    check: (gameEvent) => gameEvent.currentStreak >= 25
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Tap a correct answer in under 350 milliseconds.',
    icon: '🚀',
    check: (gameEvent) => gameEvent.reactionMs > 0 && gameEvent.reactionMs <= 350
  },
  {
    id: 'score_100',
    title: 'Centurion',
    description: 'Score 100+ points in a single session.',
    icon: '🏆',
    check: (gameEvent) => gameEvent.currentScore >= 100
  },
  {
    id: 'score_500',
    title: 'Apex Player',
    description: 'Score 500+ points in a single session.',
    icon: '👑',
    check: (gameEvent) => gameEvent.currentScore >= 500
  },
  {
    id: 'chaos_master',
    title: 'Chaos Conductor',
    description: 'Score 150+ points in Chaos Mode.',
    icon: '🌀',
    check: (gameEvent) => gameEvent.mode === 'chaos' && gameEvent.currentScore >= 150
  },
  {
    id: 'impossible_hero',
    title: 'Impossible Conqueror',
    description: 'Score 100+ points in Impossible Mode.',
    icon: '☠️',
    check: (gameEvent) => gameEvent.mode === 'impossible' && gameEvent.currentScore >= 100
  },
  {
    id: 'daily_player',
    title: 'Daily Devotee',
    description: 'Complete a run in Daily Challenge mode.',
    icon: '📅',
    check: (gameEvent) => gameEvent.mode === 'daily' && gameEvent.isGameOver
  },
  {
    id: 'reverse_master',
    title: 'Reverse Thinker',
    description: 'Answer 5 negative or reverse-logic prompts correctly in one game.',
    icon: '🔄',
    check: (gameEvent) => (gameEvent.negativePromptsSolved || 0) >= 5
  },
  {
    id: 'streak_3_days',
    title: 'Streak Keeper',
    description: 'Play for 3 consecutive days.',
    icon: '⭐',
    check: (gameEvent, stats) => (stats?.consecutiveDays || 0) >= 3
  }
];

class AchievementsManager {
  constructor(storage) {
    this.storage = storage;
    this.unlocked = this.loadUnlocked();
  }

  loadUnlocked() {
    try {
      const data = localStorage.getItem('dttwo_achievements');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  saveUnlocked() {
    try {
      localStorage.setItem('dttwo_achievements', JSON.stringify(this.unlocked));
    } catch (e) {}
  }

  // Check achievements after any gameplay event (tap or game over)
  check(eventData) {
    const newlyUnlocked = [];
    const stats = this.storage.stats;

    ACHIEVEMENTS_DATA.forEach(ach => {
      if (!this.unlocked[ach.id]) {
        try {
          if (ach.check(eventData, stats)) {
            this.unlocked[ach.id] = {
              unlockedAt: new Date().toISOString(),
            };
            newlyUnlocked.push(ach);
          }
        } catch (e) {
          console.warn('Achievement check error for', ach.id, e);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveUnlocked();
    }

    return newlyUnlocked;
  }

  getAll() {
    return ACHIEVEMENTS_DATA.map(ach => ({
      ...ach,
      isUnlocked: !!this.unlocked[ach.id],
      unlockedAt: this.unlocked[ach.id]?.unlockedAt || null
    }));
  }

  getUnlockedCount() {
    return Object.keys(this.unlocked).length;
  }

  getTotalCount() {
    return ACHIEVEMENTS_DATA.length;
  }
}

window.gameAchievements = new AchievementsManager(window.gameStorage);
