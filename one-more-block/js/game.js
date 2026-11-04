/**
 * ONE MORE BLOCK - Core Game Engine
 * Handles stacking physics, dynamic cutting, combos, game modes, and special events
 */

const BLOCK_HEIGHT = 26;
const BASE_SIZE = 140;
const MIN_SIZE = 6;
const MOVE_RANGE = 220;

// Funny game-over quotes based on close calls, high scores, or early falls
const FUNNY_MESSAGES = [
  "Physics had personal beef with that block.",
  "Your thumb slipped, didn't it? Just one more try!",
  "Tower said: 'I have decided to become art.'",
  "That was SO close! You were right in the zone!",
  "Gravity: 1, You: 0. Time for a rematch!",
  "Just one more block! You can definitely beat that record.",
  "Architects everywhere are shedding a tear.",
  "You were on fire! Run it back!",
  "The leaning tower of... whoops.",
  "So close to greatness! One more run?"
];

class GameEngine {
  constructor(renderer) {
    this.renderer = renderer;
    this.mode = 'classic'; // 'classic', 'endless', 'hardcore', 'daily'
    this.state = 'MENU';   // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'

    // Tower & Block state
    this.towerBlocks = [];
    this.fallingPieces = [];
    this.currentBlock = null;
    this.currentFloor = 0;
    this.score = 0;
    this.comboStreak = 0;
    this.highestStreakThisRun = 0;
    this.nearMissesThisRun = 0;

    // Active event (null, 'double_points', 'slow_mo', 'golden_block', 'wind_gust')
    this.activeEvent = null;
    this.eventFloorsRemaining = 0;

    // Movement & Difficulty settings
    this.baseSpeed = 2.6;
    this.maxSpeed = 6.2;
    this.perfectTolerance = 3.5;
    this.scoreMultiplier = 1.0;

    // Seeded RNG for Daily Mode
    this.rng = Math.random;

    // Challenge target
    this.challengeFloor = 0;
    this.challengerName = '';
    this.hasDefeatedChallenge = false;

    // Input debounce
    this.lastActionTime = 0;

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onScoreUpdate = null;
    this.onEventTrigger = null;
  }

  setChallenge(floor, name = 'Friend') {
    this.challengeFloor = parseInt(floor, 10) || 0;
    this.challengerName = name || 'Friend';
    this.hasDefeatedChallenge = false;
  }

  start(mode = 'classic') {
    this.mode = mode;
    this.state = 'PLAYING';
    this.score = 0;
    this.currentFloor = 0;
    this.comboStreak = 0;
    this.highestStreakThisRun = 0;
    this.nearMissesThisRun = 0;
    this.activeEvent = null;
    this.eventFloorsRemaining = 0;
    this.fallingPieces = [];
    this.hasDefeatedChallenge = false;

    window.particleEngine.reset();
    window.soundEngine.init();

    // Mode-specific tunings
    let startingSize = BASE_SIZE;
    if (this.mode === 'daily') {
      const seed = window.dailyManager.getDailySeed();
      this.rng = window.dailyManager.createRNG(seed);
      this.baseSpeed = 2.8;
      this.maxSpeed = 6.5;
      this.perfectTolerance = 3.5;
      this.scoreMultiplier = 1.0;
    } else if (this.mode === 'hardcore') {
      this.rng = Math.random;
      startingSize = 110;
      this.baseSpeed = 3.8;
      this.maxSpeed = 8.5;
      this.perfectTolerance = 2.4;
      this.scoreMultiplier = 2.0;
    } else if (this.mode === 'endless') {
      this.rng = Math.random;
      startingSize = 135;
      this.baseSpeed = 2.6;
      this.maxSpeed = 7.5;
      this.perfectTolerance = 3.2;
      this.scoreMultiplier = 1.2;
    } else {
      // Classic
      this.rng = Math.random;
      startingSize = BASE_SIZE;
      this.baseSpeed = 2.5;
      this.maxSpeed = 6.0;
      this.perfectTolerance = 3.8;
      this.scoreMultiplier = 1.0;
    }

    // Initialize Base Block (Floor 0)
    const activeSkin = window.storageManager.data.activeSkin;
    const baseColor = this.renderer.getBlockColor(0, activeSkin);
    this.towerBlocks = [
      {
        x: 0,
        y: 0,
        z: 0,
        w: startingSize,
        d: startingSize,
        h: BLOCK_HEIGHT,
        color: baseColor,
        floor: 0
      }
    ];

    // Reset Camera
    this.renderer.cameraY = 0;
    this.renderer.targetCameraY = 0;

    // Spawn first moving block (Floor 1)
    this.spawnNextBlock();

    if (this.onStateChange) this.onStateChange(this.state);
    if (this.onScoreUpdate) this.onScoreUpdate(this.currentFloor, this.score, this.comboStreak);
  }

  spawnNextBlock() {
    this.currentFloor++;
    const prevBlock = this.towerBlocks[this.towerBlocks.length - 1];
    const activeSkin = window.storageManager.data.activeSkin;

    // Alternating axis: Floor 1 is X, Floor 2 is Z, etc.
    const axis = (this.currentFloor % 2 === 1) ? 'x' : 'z';

    // Calculate speed based on floor progression and mode
    const speedInc = Math.min(this.currentFloor * 0.055, this.maxSpeed - this.baseSpeed);
    let speed = this.baseSpeed + speedInc;

    // Apply active events
    if (this.activeEvent === 'slow_mo') {
      speed *= 0.55;
    }

    // Direction alternates or starts randomly
    const direction = (this.rng() > 0.5) ? 1 : -1;
    const spawnPos = -direction * MOVE_RANGE;

    // Chance to trigger special event every 10 floors
    let isGolden = false;
    if (this.activeEvent) {
      this.eventFloorsRemaining--;
      if (this.eventFloorsRemaining <= 0) {
        this.activeEvent = null;
        if (this.onEventTrigger) this.onEventTrigger(null);
      }
    } else if (this.currentFloor > 4 && this.currentFloor % 9 === 0 && this.rng() < 0.6) {
      this.triggerRandomEvent();
    }

    if (this.activeEvent === 'golden_block') {
      isGolden = true;
    }

    const blockColor = this.renderer.getBlockColor(this.currentFloor, activeSkin);

    this.currentBlock = {
      x: (axis === 'x') ? spawnPos : prevBlock.x,
      y: this.currentFloor * BLOCK_HEIGHT,
      z: (axis === 'z') ? spawnPos : prevBlock.z,
      w: prevBlock.w,
      d: prevBlock.d,
      h: BLOCK_HEIGHT,
      axis: axis,
      speed: speed,
      direction: direction,
      color: blockColor,
      floor: this.currentFloor,
      isGolden: isGolden,
      windOffset: 0
    };

    // Update camera target so the active building layer stays centered
    this.renderer.targetCameraY = Math.max(0, (this.currentFloor - 4) * BLOCK_HEIGHT);
  }

  triggerRandomEvent() {
    const events = ['double_points', 'slow_mo', 'golden_block', 'expand_block'];
    const chosen = events[Math.floor(this.rng() * events.length)];
    this.activeEvent = chosen;
    this.eventFloorsRemaining = (chosen === 'golden_block' || chosen === 'expand_block') ? 1 : 4;

    window.soundEngine.playEventSound();

    if (chosen === 'expand_block') {
      // Immediate platform bonus
      const prevBlock = this.towerBlocks[this.towerBlocks.length - 1];
      prevBlock.w = Math.min(BASE_SIZE, prevBlock.w + 14);
      prevBlock.d = Math.min(BASE_SIZE, prevBlock.d + 14);
      const scr = this.renderer.toScreen(prevBlock.x, prevBlock.y + BLOCK_HEIGHT, prevBlock.z);
      window.particleEngine.addFloatingText(scr.x, scr.y, 'PLATFORM EXPANDED! 🌟', '#05d9e8', 22, true);
    }

    if (this.onEventTrigger) {
      this.onEventTrigger(chosen);
    }
  }

  // Handle player tap / click / spacebar drop
  placeBlock(force = false) {
    if (this.state !== 'PLAYING' || !this.currentBlock) return;

    // Prevent accidental multi-tap triggers in the same frame
    const now = performance.now();
    if (!force && this.lastActionTime && (now - this.lastActionTime < 40)) return;
    this.lastActionTime = now;

    const block = this.currentBlock;
    const prev = this.towerBlocks[this.towerBlocks.length - 1];
    const axis = block.axis;

    // Check challenge defeat
    if (this.challengeFloor > 0 && this.currentFloor === this.challengeFloor && !this.hasDefeatedChallenge) {
      this.hasDefeatedChallenge = true;
      const scr = this.renderer.toScreen(block.x, block.y + BLOCK_HEIGHT, block.z);
      window.particleEngine.addFloatingText(scr.x, scr.y - 30, '🏆 CHALLENGE CRUSHED!', '#ffd700', 26, true);
      window.soundEngine.playRecordCelebration();
    }

    if (axis === 'x') {
      const diff = block.x - prev.x;
      const absDiff = Math.abs(diff);

      // 1. PERFECT PLACEMENT
      if (absDiff <= this.perfectTolerance) {
        this.handlePerfectPlacement(block, prev, 'x');
      }
      // 2. PARTIAL OVERLAP (CUTTING)
      else if (absDiff < prev.w) {
        this.handlePartialPlacement(block, prev, 'x', diff, absDiff);
      }
      // 3. COMPLETE MISS
      else {
        this.handleCompleteMiss(block, 'x');
      }
    } else {
      // axis === 'z'
      const diff = block.z - prev.z;
      const absDiff = Math.abs(diff);

      // 1. PERFECT PLACEMENT
      if (absDiff <= this.perfectTolerance) {
        this.handlePerfectPlacement(block, prev, 'z');
      }
      // 2. PARTIAL OVERLAP (CUTTING)
      else if (absDiff < prev.d) {
        this.handlePartialPlacement(block, prev, 'z', diff, absDiff);
      }
      // 3. COMPLETE MISS
      else {
        this.handleCompleteMiss(block, 'z');
      }
    }
  }

  handlePerfectPlacement(block, prev, axis) {
    // Snap to exact previous position
    if (axis === 'x') block.x = prev.x;
    if (axis === 'z') block.z = prev.z;

    this.comboStreak++;
    if (this.comboStreak > this.highestStreakThisRun) {
      this.highestStreakThisRun = this.comboStreak;
    }

    // Sound progression
    window.soundEngine.playPerfectSound(this.comboStreak);

    // Calculate points
    let points = 10 + (this.comboStreak * 5);
    if (this.activeEvent === 'double_points') points *= 2;
    if (block.isGolden) points *= 3;
    points = Math.round(points * this.scoreMultiplier);
    this.score += points;

    // Visual particles & shockwave
    const scr = this.renderer.toScreen(block.x, block.y + BLOCK_HEIGHT, block.z);
    window.particleEngine.addShockwave(scr.x, scr.y, block.w, block.d, '#ffffff');
    window.particleEngine.addSparkles(scr.x, scr.y, '#ffd700', 16 + this.comboStreak * 2);

    // Combo milestones
    if (this.comboStreak >= 5) {
      window.soundEngine.playComboCelebration(this.comboStreak);
      // Platform recovery bonus: expand block size back towards original!
      const growAmount = 8;
      block.w = Math.min(BASE_SIZE, block.w + growAmount);
      block.d = Math.min(BASE_SIZE, block.d + growAmount);
      window.particleEngine.addFloatingText(scr.x, scr.y - 20, `RECOVERY! +${growAmount}px 💫`, '#00ff87', 22, true);
    } else {
      const label = this.comboStreak > 1 ? `PERFECT x${this.comboStreak}! +${points}` : `PERFECT! +${points}`;
      window.particleEngine.addFloatingText(scr.x, scr.y, label, '#ffffff', 20, this.comboStreak > 2);
    }

    // Add block to tower
    this.towerBlocks.push(block);
    if (this.onScoreUpdate) this.onScoreUpdate(this.currentFloor, this.score, this.comboStreak);
    this.spawnNextBlock();
  }

  handlePartialPlacement(block, prev, axis, diff, absDiff) {
    // Reset combo streak
    this.comboStreak = 0;

    let newW = block.w;
    let newD = block.d;
    let newX = block.x;
    let newZ = block.z;

    let sliceW = 0;
    let sliceD = 0;
    let sliceX = block.x;
    let sliceZ = block.z;

    if (axis === 'x') {
      newW = prev.w - absDiff;
      sliceW = absDiff;
      sliceD = block.d;
      newX = prev.x + (diff / 2);

      // Position of falling sliced piece
      if (diff > 0) {
        sliceX = newX + (newW / 2) + (sliceW / 2);
      } else {
        sliceX = newX - (newW / 2) - (sliceW / 2);
      }
    } else {
      // axis === 'z'
      newD = prev.d - absDiff;
      sliceD = absDiff;
      sliceW = block.w;
      newZ = prev.z + (diff / 2);

      // Position of falling sliced piece
      if (diff > 0) {
        sliceZ = newZ + (newD / 2) + (sliceD / 2);
      } else {
        sliceZ = newZ - (newD / 2) - (sliceD / 2);
      }
    }

    // Check near-miss save
    if (newW <= 18 || newD <= 18) {
      this.nearMissesThisRun++;
    }

    // Check collapse if remaining platform is too tiny
    if (newW < MIN_SIZE || newD < MIN_SIZE) {
      this.handlePlatformCollapse(block);
      return;
    }

    // Spawn falling slice debris
    const cutRatio = (axis === 'x') ? (sliceW / prev.w) : (sliceD / prev.d);
    window.soundEngine.playPlaceSound();
    window.soundEngine.playSliceSound(cutRatio);

    // Screen shake proportional to cut ratio
    if (window.storageManager.data.settings.screenShake) {
      this.renderer.shake(Math.min(10, 3 + cutRatio * 12));
    }

    // Sliced piece with physics
    this.fallingPieces.push({
      x: sliceX,
      y: block.y,
      z: sliceZ,
      w: sliceW,
      d: sliceD,
      h: block.h,
      color: block.color,
      vy: 0,
      vx: (axis === 'x' ? (diff > 0 ? 1 : -1) : 0) * 1.8,
      vz: (axis === 'z' ? (diff > 0 ? 1 : -1) : 0) * 1.8,
      alpha: 1.0,
      rotX: 0,
      rotZ: 0
    });

    // Dust particles along slice edge
    const scrCut = this.renderer.toScreen(sliceX, block.y + BLOCK_HEIGHT * 0.5, sliceZ);
    window.particleEngine.addSliceDust(scrCut.x, scrCut.y, 'rgba(255,255,255,0.7)', 10);

    // Update block dimensions
    block.w = newW;
    block.d = newD;
    block.x = newX;
    block.z = newZ;

    let points = 10;
    if (this.activeEvent === 'double_points') points *= 2;
    if (block.isGolden) points *= 2;
    points = Math.round(points * this.scoreMultiplier);
    this.score += points;

    const scr = this.renderer.toScreen(block.x, block.y + BLOCK_HEIGHT, block.z);
    window.particleEngine.addFloatingText(scr.x, scr.y, `+${points}`, '#fff', 18, false);

    // Add remaining block to tower
    this.towerBlocks.push(block);
    if (this.onScoreUpdate) this.onScoreUpdate(this.currentFloor, this.score, this.comboStreak);
    this.spawnNextBlock();
  }

  handlePlatformCollapse(block) {
    // Platform is too tiny, it collapses and falls
    this.fallingPieces.push({
      x: block.x,
      y: block.y,
      z: block.z,
      w: block.w,
      d: block.d,
      h: block.h,
      color: block.color,
      vy: 0,
      vx: 0,
      vz: 0,
      alpha: 1.0
    });
    this.currentBlock = null;
    this.gameOver('COLLAPSED');
  }

  handleCompleteMiss(block, axis) {
    // Entire block missed, falls off
    window.soundEngine.playMissSound();
    this.fallingPieces.push({
      x: block.x,
      y: block.y,
      z: block.z,
      w: block.w,
      d: block.d,
      h: block.h,
      color: block.color,
      vy: 0,
      vx: (axis === 'x') ? block.direction * 3.5 : 0,
      vz: (axis === 'z') ? block.direction * 3.5 : 0,
      alpha: 1.0
    });

    this.currentBlock = null;
    this.gameOver('MISSED');
  }

  gameOver(reason = 'MISSED') {
    this.state = 'GAMEOVER';
    window.soundEngine.playGameOverSound();

    if (window.storageManager.data.settings.screenShake) {
      this.renderer.shake(12);
    }

    // Save score & check records
    const finalFloor = Math.max(0, this.currentFloor - 1);
    const result = window.storageManager.recordGame(this.mode, finalFloor, this.score, {
      placedBlocks: finalFloor,
      perfects: this.highestStreakThisRun,
      highestStreak: this.highestStreakThisRun,
      nearMisses: this.nearMissesThisRun
    });

    // If daily mode, record daily streak
    if (this.mode === 'daily') {
      window.dailyManager.recordDailyPlay();
    }

    // Check if player beat new record
    if (result.isNewFloorRecord || result.isNewScoreRecord) {
      window.soundEngine.playRecordCelebration();
      window.particleEngine.addConfetti(this.renderer.width, this.renderer.height, 90);
    }

    // Pick random psychological quote
    const quote = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];

    // Performance title
    let rating = 'ROOKIE STACKER';
    if (finalFloor >= 50) rating = '👑 BLOCK GOD';
    else if (finalFloor >= 35) rating = '⚡ MASTER ARCHITECT';
    else if (finalFloor >= 20) rating = '🏗️ CRANE MASTER';
    else if (finalFloor >= 10) rating = '🧱 SKILLED BUILDER';

    if (this.onStateChange) {
      this.onStateChange(this.state, {
        floor: finalFloor,
        score: this.score,
        rating: rating,
        quote: quote,
        recordResult: result,
        challengeDefeated: this.hasDefeatedChallenge
      });
    }
  }

  pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  update(dt = 1) {
    if (this.state === 'PLAYING' && this.currentBlock) {
      const block = this.currentBlock;

      // Update block movement
      if (block.axis === 'x') {
        block.x += block.speed * block.direction * dt;
        if (block.x > MOVE_RANGE) {
          block.x = MOVE_RANGE;
          block.direction = -1;
        } else if (block.x < -MOVE_RANGE) {
          block.x = -MOVE_RANGE;
          block.direction = 1;
        }
      } else {
        block.z += block.speed * block.direction * dt;
        if (block.z > MOVE_RANGE) {
          block.z = MOVE_RANGE;
          block.direction = -1;
        } else if (block.z < -MOVE_RANGE) {
          block.z = -MOVE_RANGE;
          block.direction = 1;
        }
      }

      // Hardcore mode sway or wind gust
      if (this.mode === 'hardcore' && this.currentFloor > 12) {
        const sway = Math.sin(Date.now() * 0.005) * 0.6;
        if (block.axis === 'x') block.z += sway;
        else block.x += sway;
      }
    }

    // Update falling debris physics
    for (let i = this.fallingPieces.length - 1; i >= 0; i--) {
      const p = this.fallingPieces[i];
      p.vy += 0.55 * dt; // gravity
      p.y -= p.vy * dt;
      p.x += (p.vx || 0) * dt;
      p.z += (p.vz || 0) * dt;
      p.alpha -= 0.018 * dt;

      if (p.alpha <= 0 || p.y < -200) {
        this.fallingPieces.splice(i, 1);
      }
    }

    // Update renderer camera & screen shake
    this.renderer.update(dt);
  }

  render() {
    const activeTheme = window.storageManager.data.activeTheme;
    this.renderer.renderBackground(activeTheme);

    // 1. Render Foundation Pedestal
    this.renderer.renderPedestal(BASE_SIZE, BASE_SIZE, 60);

    // 2. Render Stacked Tower Blocks
    for (const b of this.towerBlocks) {
      this.renderer.render3DBox(b);
    }

    // 3. Render Challenge Marker if set
    if (this.challengeFloor > 0) {
      this.renderer.renderChallengeMarker(
        this.currentFloor,
        this.challengeFloor,
        BASE_SIZE,
        BASE_SIZE,
        this.challengerName
      );
    }

    // 4. Render Active Moving Block Drop Shadow
    if (this.state === 'PLAYING' && this.currentBlock && this.towerBlocks.length > 0) {
      const topTowerBlock = this.towerBlocks[this.towerBlocks.length - 1];
      this.renderer.renderDropShadow(this.currentBlock, topTowerBlock);
    }

    // 5. Render Active Moving Block
    if (this.state === 'PLAYING' && this.currentBlock) {
      this.renderer.render3DBox(this.currentBlock);
    }

    // 6. Render Falling Pieces
    for (const piece of this.fallingPieces) {
      this.renderer.renderFallingPiece(piece);
    }

    // 7. Render Particles & Floating Texts
    window.particleEngine.render(this.renderer.ctx);
  }
}

window.GameEngine = GameEngine;
