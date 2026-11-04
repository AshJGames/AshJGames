/**
 * ONE MORE BLOCK - Storage & Progression Engine
 * LocalStorage manager for high scores, achievements, unlockables, and stats
 */

const STORAGE_KEY = 'one_more_block_data_v1';

const DEFAULT_DATA = {
  version: 1,
  // High scores per mode
  scores: {
    classic: { bestFloor: 0, bestScore: 0 },
    endless: { bestFloor: 0, bestScore: 0 },
    hardcore: { bestFloor: 0, bestScore: 0 },
    daily: { bestFloor: 0, bestScore: 0, lastPlayedDate: '' }
  },
  // Overall lifetime stats
  stats: {
    gamesPlayed: 0,
    totalBlocksPlaced: 0,
    totalPerfects: 0,
    highestStreak: 0,
    dailyStreak: 0,
    lastDailyDate: '',
    nearMissSaves: 0
  },
  // Customization
  activeSkin: 'neon',
  activeTheme: 'dark_minimal',
  unlockedSkins: ['neon'],
  unlockedThemes: ['dark_minimal'],
  // Settings
  settings: {
    sound: true,
    haptics: true,
    particles: true,
    screenShake: true
  },
  // Unlocked achievement IDs
  achievements: [],
  // Recent game history (last 5 games)
  recentGames: []
};

// Skin definitions with requirements to unlock
const SKINS_CATALOG = [
  {
    id: 'neon',
    name: 'Classic Neon',
    description: 'Vibrant shifting spectral colors. Iconic & crisp.',
    unlockReq: 'Unlocked by default',
    unlocked: true,
    preview: ['#ff2a70', '#05d9e8', '#f9f871']
  },
  {
    id: 'synthwave',
    name: 'Synthwave 80s',
    description: 'Outrun sunset neon pink, violet, and electric cyan.',
    unlockReq: 'Reach Floor 25 in any mode',
    unlocked: false,
    preview: ['#ff007f', '#7928ca', '#00f2fe']
  },
  {
    id: 'candypop',
    name: 'Candy Pop',
    description: 'Joyful pastel macarons and bouncy sherbet gradients.',
    unlockReq: 'Hit a 5x Perfect Combo',
    unlocked: false,
    preview: ['#ff9a9e', '#fecfef', '#a1c4fd']
  },
  {
    id: 'emerald',
    name: 'Emerald Royale',
    description: 'Lush imperial jade and sparkling champagne gold.',
    unlockReq: 'Reach Floor 50 in Classic Mode',
    unlocked: false,
    preview: ['#00b09b', '#96c93d', '#f7b733']
  },
  {
    id: 'obsidian',
    name: 'Obsidian Gold',
    description: 'Sleek luxury dark obsidian with metallic gold trim.',
    unlockReq: 'Score 1,000 points in Hardcore Mode',
    unlocked: false,
    preview: ['#1e1e24', '#444444', '#d4af37']
  },
  {
    id: 'hologram',
    name: 'Cyber Hologram',
    description: 'Futuristic sci-fi laser crystal with luminous outlines.',
    unlockReq: 'Unlock 8 achievements',
    unlocked: false,
    preview: ['#00f0ff', '#7000ff', '#ffffff']
  }
];

// Theme definitions with backgrounds
const THEMES_CATALOG = [
  {
    id: 'dark_minimal',
    name: 'Obsidian Studio',
    description: 'Sleek dark gradient with subtle star dust.',
    unlockReq: 'Default theme',
    unlocked: true,
    previewColor: '#0f111a'
  },
  {
    id: 'sunset_glow',
    name: 'Sunset Horizon',
    description: 'Warm dusk twilight with magenta and amber glow.',
    unlockReq: 'Play 5 games',
    unlocked: false,
    previewColor: '#2b1055'
  },
  {
    id: 'cyber_grid',
    name: 'Cyber Matrix',
    description: 'Neon wireframe ground plane and digital starlight.',
    unlockReq: 'Reach Floor 30 in Endless Mode',
    unlocked: false,
    previewColor: '#050b14'
  },
  {
    id: 'aurora',
    name: 'Northern Lights',
    description: 'Hypnotic emerald and sapphire polar curtains.',
    unlockReq: 'Play a Daily Challenge',
    unlocked: false,
    previewColor: '#031b26'
  }
];

// Achievement master list
const ACHIEVEMENTS_CATALOG = [
  { id: 'first_stack', title: 'First Floor', desc: 'Place your very first block', icon: '🧱' },
  { id: 'tower_15', title: 'Rising High', desc: 'Reach Floor 15 in any mode', icon: '🏗️' },
  { id: 'tower_30', title: 'Skyscraper', desc: 'Reach Floor 30 in any mode', icon: '🏙️' },
  { id: 'tower_50', title: 'Stratosphere', desc: 'Reach Floor 50 in any mode', icon: '🚀' },
  { id: 'tower_100', title: 'Cosmic Titan', desc: 'Reach Floor 100 in any mode', icon: '🌌' },
  { id: 'combo_3', title: 'In The Groove', desc: 'Achieve 3 consecutive perfect placements', icon: '🎯' },
  { id: 'combo_5', title: 'Precision Master', desc: 'Achieve 5 consecutive perfect placements', icon: '⚡' },
  { id: 'combo_10', title: 'Zen Stacker', desc: 'Achieve 10 consecutive perfect placements', icon: '🧘' },
  { id: 'hardcore_20', title: 'Speed Demon', desc: 'Reach Floor 20 in Hardcore Mode', icon: '🔥' },
  { id: 'endless_40', title: 'Endless Horizon', desc: 'Reach Floor 40 in Endless Mode', icon: '♾️' },
  { id: 'daily_done', title: 'Daily Devotee', desc: 'Play your first Daily Challenge', icon: '📅' },
  { id: 'close_call', title: 'Edge Of Glory', desc: 'Place a block on a platform under 20px wide', icon: '🤏' },
  { id: 'total_200', title: 'Master Mason', desc: 'Place 200 total blocks in your career', icon: '🏆' }
];

class StorageManager {
  constructor() {
    this.data = this.load();
    this.checkUnlockables();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
      const parsed = JSON.parse(raw);
      // Merge with defaults to ensure missing properties exist
      return {
        ...DEFAULT_DATA,
        ...parsed,
        scores: { ...DEFAULT_DATA.scores, ...(parsed.scores || {}) },
        stats: { ...DEFAULT_DATA.stats, ...(parsed.stats || {}) },
        settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
        unlockedSkins: parsed.unlockedSkins || ['neon'],
        unlockedThemes: parsed.unlockedThemes || ['dark_minimal'],
        achievements: parsed.achievements || [],
        recentGames: parsed.recentGames || []
      };
    } catch (e) {
      console.error('Failed to load storage, resetting to default', e);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  getBest(mode = 'classic') {
    return this.data.scores[mode] || { bestFloor: 0, bestScore: 0 };
  }

  getGlobalBestFloor() {
    const s = this.data.scores;
    return Math.max(
      s.classic?.bestFloor || 0,
      s.endless?.bestFloor || 0,
      s.hardcore?.bestFloor || 0,
      s.daily?.bestFloor || 0
    );
  }

  recordGame(mode, floor, score, stats = {}) {
    const modeKey = mode.toLowerCase();
    if (!this.data.scores[modeKey]) {
      this.data.scores[modeKey] = { bestFloor: 0, bestScore: 0 };
    }

    const currentBest = this.data.scores[modeKey];
    const isNewFloorRecord = floor > currentBest.bestFloor;
    const isNewScoreRecord = score > currentBest.bestScore;

    if (isNewFloorRecord) currentBest.bestFloor = floor;
    if (isNewScoreRecord) currentBest.bestScore = score;

    // Update stats
    this.data.stats.gamesPlayed += 1;
    this.data.stats.totalBlocksPlaced += (stats.placedBlocks || floor);
    this.data.stats.totalPerfects += (stats.perfects || 0);
    if ((stats.highestStreak || 0) > this.data.stats.highestStreak) {
      this.data.stats.highestStreak = stats.highestStreak;
    }
    if (stats.nearMisses) {
      this.data.stats.nearMissSaves += stats.nearMisses;
    }

    // Record recent game
    this.data.recentGames.unshift({
      date: new Date().toISOString(),
      mode,
      floor,
      score,
      isRecord: isNewFloorRecord || isNewScoreRecord
    });
    if (this.data.recentGames.length > 8) {
      this.data.recentGames.pop();
    }

    // Check unlocks & achievements
    const newlyUnlockedAchievements = this.evaluateAchievements(mode, floor, score, stats);
    const newlyUnlockedSkins = this.checkUnlockables();

    this.save();

    return {
      isNewFloorRecord,
      isNewScoreRecord,
      newlyUnlockedAchievements,
      newlyUnlockedSkins,
      bestFloor: currentBest.bestFloor,
      bestScore: currentBest.bestScore
    };
  }

  evaluateAchievements(mode, floor, score, stats) {
    const newUnlocks = [];
    const check = (id, condition) => {
      if (!this.data.achievements.includes(id) && condition) {
        this.data.achievements.push(id);
        const ach = ACHIEVEMENTS_CATALOG.find(a => a.id === id);
        if (ach) newUnlocks.push(ach);
      }
    };

    check('first_stack', this.data.stats.totalBlocksPlaced >= 1);
    check('tower_15', floor >= 15);
    check('tower_30', floor >= 30);
    check('tower_50', floor >= 50);
    check('tower_100', floor >= 100);
    check('combo_3', (stats.highestStreak || 0) >= 3);
    check('combo_5', (stats.highestStreak || 0) >= 5);
    check('combo_10', (stats.highestStreak || 0) >= 10);
    check('hardcore_20', mode === 'hardcore' && floor >= 20);
    check('endless_40', mode === 'endless' && floor >= 40);
    check('daily_done', mode === 'daily');
    check('close_call', (stats.nearMisses || 0) > 0 || this.data.stats.nearMissSaves > 0);
    check('total_200', this.data.stats.totalBlocksPlaced >= 200);

    return newUnlocks;
  }

  checkUnlockables() {
    const newSkins = [];
    const newThemes = [];

    const unlockSkin = (id) => {
      if (!this.data.unlockedSkins.includes(id)) {
        this.data.unlockedSkins.push(id);
        newSkins.push(id);
      }
    };

    const unlockTheme = (id) => {
      if (!this.data.unlockedThemes.includes(id)) {
        this.data.unlockedThemes.push(id);
        newThemes.push(id);
      }
    };

    // Evaluate skin criteria
    if (this.getGlobalBestFloor() >= 25) unlockSkin('synthwave');
    if (this.data.stats.highestStreak >= 5) unlockSkin('candypop');
    if ((this.data.scores.classic?.bestFloor || 0) >= 50) unlockSkin('emerald');
    if ((this.data.scores.hardcore?.bestScore || 0) >= 1000) unlockSkin('obsidian');
    if (this.data.achievements.length >= 8) unlockSkin('hologram');

    // Evaluate theme criteria
    if (this.data.stats.gamesPlayed >= 5) unlockTheme('sunset_glow');
    if ((this.data.scores.endless?.bestFloor || 0) >= 30) unlockTheme('cyber_grid');
    if (this.data.scores.daily?.bestFloor > 0) unlockTheme('aurora');

    if (newSkins.length > 0 || newThemes.length > 0) {
      this.save();
    }

    return { skins: newSkins, themes: newThemes };
  }

  setSkin(skinId) {
    if (this.data.unlockedSkins.includes(skinId)) {
      this.data.activeSkin = skinId;
      this.save();
      return true;
    }
    return false;
  }

  setTheme(themeId) {
    if (this.data.unlockedThemes.includes(themeId)) {
      this.data.activeTheme = themeId;
      this.save();
      return true;
    }
    return false;
  }

  updateSettings(key, val) {
    this.data.settings[key] = val;
    this.save();
  }
}

window.storageManager = new StorageManager();
