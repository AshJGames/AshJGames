/**
 * BRAIN LAG - Mode 4: Reflex Rush
 * Split-second visual reflex challenges measuring millisecond response times.
 */

class ReflexRushMode {
  constructor(game) {
    this.game = game;
    this.name = 'reflex';
    this.title = 'Reflex Rush';
    this.description = 'Extreme reaction tests. Tap true targets instantly, avoid decoys, and race millisecond timers!';
    this.roundCount = 0;
    this.reactionTimeout = null;
    this.triggerTime = 0;
    this.isTriggerActive = false;
    this.distractorTimers = [];
  }

  start() {
    this.roundCount = 0;
    this.nextRound();
  }

  nextRound() {
    this.roundCount += 1;
    this.clearAllTimers();
    this.isTriggerActive = false;

    // Pick a reflex test variation
    const testTypes = ['target_symbol', 'color_pop', 'odd_one_out', 'even_rapid'];
    const selectedType = testTypes[Math.floor(Math.random() * testTypes.length)];

    this.game.setQuestionCategory(`REFLEX ROUND ${this.roundCount}`);

    switch (selectedType) {
      case 'target_symbol':
        this.runTargetSymbolTest();
        break;
      case 'color_pop':
        this.runColorPopTest();
        break;
      case 'odd_one_out':
        this.runOddOneOutTest();
        break;
      case 'even_rapid':
      default:
        this.runEvenRapidTest();
        break;
    }
  }

  runTargetSymbolTest() {
    this.game.setQuestionPrompt("TAP WHEN YOU SEE: ⚡ LIGHTNING! (Ignore decoys)");
    this.game.updateTimer(1, 1);

    const container = this.game.questionContainer;
    container.innerHTML = `
      <div class="reflex-arena" id="reflex-arena">
        <div class="reflex-decoy-zone" id="reflex-target">
          <span class="reflex-waiting-text">GET READY...</span>
        </div>
      </div>
    `;

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-1';

    const tapBtn = document.createElement('button');
    tapBtn.className = 'game-opt-btn reflex-tap-btn';
    tapBtn.innerHTML = `<span>STRIKE! ⚡</span>`;
    tapBtn.addEventListener('click', () => this.handleSymbolTap(tapBtn));
    optionsContainer.appendChild(tapBtn);

    const targetEl = document.getElementById('reflex-target');

    // Display 1-3 decoys before the real target
    const decoys = ['❄️', '🔥', '💧', '☁️', '🌪️'];
    const decoyCount = Math.floor(Math.random() * 3);
    let delay = Math.random() * 800 + 800;

    for (let i = 0; i < decoyCount; i++) {
      const t = setTimeout(() => {
        if (this.game.isGameOver || this.isTriggerActive) return;
        const decoy = decoys[Math.floor(Math.random() * decoys.length)];
        targetEl.innerHTML = `<span class="reflex-icon decoy">${decoy}</span>`;
        window.soundEngine.playTone(300, 'triangle', 0.08, 0.1);
      }, delay);
      this.distractorTimers.push(t);
      delay += Math.random() * 700 + 500;
    }

    // Real trigger
    const realTriggerTimer = setTimeout(() => {
      if (this.game.isGameOver) return;
      this.isTriggerActive = true;
      this.triggerTime = performance.now();
      targetEl.innerHTML = `<span class="reflex-icon real-target">⚡</span>`;
      targetEl.classList.add('flash-active');
      window.soundEngine.playTone(880, 'square', 0.12, 0.3);

      // Max window to react: 950ms down to 600ms
      const maxWindow = Math.max(550, 950 - this.roundCount * 25);
      this.reactionTimeout = setTimeout(() => {
        if (this.isTriggerActive) {
          this.game.onWrongAnswer({
            explanation: `Too slow! The target disappeared after ${maxWindow}ms.`,
            reason: "REFLEX LAGGED! Sluggish reaction."
          });
        }
      }, maxWindow);
    }, delay + Math.random() * 600 + 400);

    this.distractorTimers.push(realTriggerTimer);
  }

  handleSymbolTap(btn) {
    if (!this.isTriggerActive) {
      // False start! Tapped before target or on decoy
      this.clearAllTimers();
      this.game.onWrongAnswer({
        button: btn,
        explanation: "False start! You tapped before the ⚡ lightning appeared.",
        reason: "TRIGGER HAPPY! You swung at the wind."
      });
      return;
    }

    // Valid reflex hit!
    this.clearAllTimers();
    this.isTriggerActive = false;
    const reactionMs = Math.round(performance.now() - this.triggerTime);

    let speedBonus = 10;
    let label = 'OK';
    if (reactionMs <= 250) {
      speedBonus = 150;
      label = '⚡ GODLIKE';
    } else if (reactionMs <= 380) {
      speedBonus = 80;
      label = '🔥 FAST';
    } else {
      speedBonus = 30;
      label = '👍 DECENT';
    }

    this.game.onCorrectAnswer({
      basePoints: 20,
      speedBonus,
      fastestReactionMs: reactionMs,
      button: btn,
      customMessage: `${reactionMs}ms (${label})`
    });

    setTimeout(() => {
      if (!this.game.isGameOver) this.nextRound();
    }, 400);
  }

  runColorPopTest() {
    this.game.setQuestionPrompt("TAP AS SOON AS THE BOX TURNS GREEN!");
    this.game.updateTimer(1, 1);

    const container = this.game.questionContainer;
    container.innerHTML = `
      <div class="reflex-arena">
        <div class="color-pop-box" id="color-pop-box">
          <span>WAIT FOR GREEN...</span>
        </div>
      </div>
    `;

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-1';

    const tapBtn = document.createElement('button');
    tapBtn.className = 'game-opt-btn reflex-tap-btn';
    tapBtn.innerHTML = `<span>TAP HERE! 🛑</span>`;
    tapBtn.addEventListener('click', () => this.handleColorPopTap(tapBtn));
    optionsContainer.appendChild(tapBtn);

    const box = document.getElementById('color-pop-box');
    const delay = Math.random() * 1500 + 1200;

    const timer = setTimeout(() => {
      if (this.game.isGameOver) return;
      this.isTriggerActive = true;
      this.triggerTime = performance.now();
      box.style.background = '#39ff14';
      box.style.boxShadow = '0 0 35px #39ff14';
      box.innerHTML = `<span style="color:#000; font-weight:900;">NOW! TAP!</span>`;
      tapBtn.innerHTML = `<span>NOW! 🟢</span>`;
      window.soundEngine.playTone(700, 'sine', 0.1, 0.25);

      const maxWindow = Math.max(500, 850 - this.roundCount * 20);
      this.reactionTimeout = setTimeout(() => {
        if (this.isTriggerActive) {
          this.game.onWrongAnswer({
            explanation: `Reaction window closed! (${maxWindow}ms).`,
            reason: "REFLEX LAGGED! Neurons took too long."
          });
        }
      }, maxWindow);
    }, delay);

    this.distractorTimers.push(timer);
  }

  handleColorPopTap(btn) {
    if (!this.isTriggerActive) {
      this.clearAllTimers();
      this.game.onWrongAnswer({
        button: btn,
        explanation: "You jumped the gun before the box turned green!",
        reason: "PREMATURE REFLEX! Wait for the visual cue."
      });
      return;
    }

    this.clearAllTimers();
    this.isTriggerActive = false;
    const reactionMs = Math.round(performance.now() - this.triggerTime);

    let speedBonus = reactionMs <= 260 ? 140 : (reactionMs <= 380 ? 70 : 25);
    this.game.onCorrectAnswer({
      basePoints: 20,
      speedBonus,
      fastestReactionMs: reactionMs,
      button: btn,
      customMessage: `${reactionMs}ms`
    });

    setTimeout(() => {
      if (!this.game.isGameOver) this.nextRound();
    }, 400);
  }

  runOddOneOutTest() {
    this.game.setQuestionPrompt("QUICK! TAP THE ODD SYMBOL OUT:");
    const sets = [
      { normal: '🔷', odd: '🔶' },
      { normal: '🐱', odd: '🐶' },
      { normal: '⭐', odd: '✨' },
      { normal: '🍏', odd: '🍎' },
      { normal: '🛸', odd: '🚀' }
    ];
    const chosenSet = sets[Math.floor(Math.random() * sets.length)];
    const oddIndex = Math.floor(Math.random() * 4);

    this.game.questionContainer.innerHTML = `<div class="reflex-prompt-banner">FIND THE DIFFERENT ONE!</div>`;

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-4';

    this.triggerTime = performance.now();
    this.isTriggerActive = true;

    for (let i = 0; i < 4; i++) {
      const isOdd = i === oddIndex;
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn reflex-icon-btn';
      btn.innerHTML = `<span class="huge-symbol">${isOdd ? chosenSet.odd : chosenSet.normal}</span>`;
      btn.addEventListener('click', () => {
        if (!this.isTriggerActive) return;
        this.isTriggerActive = false;
        const reactionMs = Math.round(performance.now() - this.triggerTime);

        if (isOdd) {
          const speedBonus = Math.max(10, Math.round((1200 - reactionMs) / 8));
          this.game.onCorrectAnswer({
            basePoints: 15,
            speedBonus,
            fastestReactionMs: reactionMs,
            button: btn,
            customMessage: `${reactionMs}ms`
          });
          setTimeout(() => {
            if (!this.game.isGameOver) this.nextRound();
          }, 350);
        } else {
          this.game.onWrongAnswer({
            button: btn,
            explanation: `That wasn't the odd one! The odd one was ${chosenSet.odd}.`,
            reason: "VISUAL CONFUSION! Eyes tricked."
          });
        }
      });
      optionsContainer.appendChild(btn);
    }
  }

  runEvenRapidTest() {
    this.game.setQuestionPrompt("TAP THE EVEN NUMBER QUICKLY!");
    
    // Generate 3 odds, 1 even
    const odds = [13, 27, 45, 63, 79, 81, 95].sort(() => Math.random() - 0.5).slice(0, 3);
    const evens = [14, 28, 46, 64, 78, 82, 96];
    const evenVal = evens[Math.floor(Math.random() * evens.length)];

    const items = [...odds, evenVal].sort(() => Math.random() - 0.5);

    this.game.questionContainer.innerHTML = `<div class="reflex-prompt-banner">FIND THE EVEN NUMBER!</div>`;

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-4';

    this.triggerTime = performance.now();
    this.isTriggerActive = true;

    items.forEach(num => {
      const isEven = num % 2 === 0;
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn';
      btn.innerHTML = `<span class="opt-text" style="font-size:1.4rem; font-weight:800;">${num}</span>`;
      btn.addEventListener('click', () => {
        if (!this.isTriggerActive) return;
        this.isTriggerActive = false;
        const reactionMs = Math.round(performance.now() - this.triggerTime);

        if (isEven) {
          const speedBonus = Math.max(10, Math.round((1200 - reactionMs) / 8));
          this.game.onCorrectAnswer({
            basePoints: 15,
            speedBonus,
            fastestReactionMs: reactionMs,
            button: btn,
            customMessage: `${reactionMs}ms`
          });
          setTimeout(() => {
            if (!this.game.isGameOver) this.nextRound();
          }, 350);
        } else {
          this.game.onWrongAnswer({
            button: btn,
            explanation: `${num} is an ODD number! The even number was ${evenVal}.`,
            reason: "ARITHMETIC SHORT-CIRCUIT!"
          });
        }
      });
      optionsContainer.appendChild(btn);
    });
  }

  clearAllTimers() {
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = null;
    }
    this.distractorTimers.forEach(t => clearTimeout(t));
    this.distractorTimers = [];
  }

  cleanup() {
    this.clearAllTimers();
    this.isTriggerActive = false;
  }
}

window.ReflexRushMode = ReflexRushMode;
