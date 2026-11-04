/**
 * BRAIN LAG - Mode 2: Color Chaos (Stroop Effect Mayhem)
 * Dynamic color & text confusion with shifting rules and accelerating timers.
 */

class ColorChaosMode {
  constructor(game) {
    this.game = game;
    this.name = 'colorchaos';
    this.title = 'Color Chaos';
    this.description = 'Identify the right color property under shifting rules. Speed increases every round!';
    this.colors = [
      { name: 'RED', hex: '#ff0054' },
      { name: 'BLUE', hex: '#3a86ff' },
      { name: 'GREEN', hex: '#39ff14' },
      { name: 'YELLOW', hex: '#fee440' },
      { name: 'PURPLE', hex: '#b5179e' },
      { name: 'ORANGE', hex: '#ff7b00' }
    ];
    this.roundCount = 0;
    this.roundTimeLimit = 3.5;
    this.timeLeft = 3.5;
    this.timer = null;
    this.currentTask = null;
  }

  start() {
    this.roundCount = 0;
    this.nextRound();
  }

  nextRound() {
    this.roundCount += 1;
    // Gradually ramp speed from 3.5s down to 1.4s
    this.roundTimeLimit = Math.max(1.4, 3.5 - (this.roundCount - 1) * 0.12);
    this.timeLeft = this.roundTimeLimit;
    this.game.updateTimer(this.timeLeft, this.roundTimeLimit);

    // Pick 3 distinct colors: one for word text, one for text color (font color), one for card background or decoy
    const shuffled = [...this.colors].sort(() => Math.random() - 0.5);
    const wordMeaning = shuffled[0];
    const textColor = shuffled[1];
    const cardBgColor = Math.random() > 0.4 ? shuffled[2] : null;

    // Rules
    const rules = [
      { rule: 'TEXT_COLOR', prompt: 'TAP THE INK / FONT COLOR', target: textColor },
      { rule: 'WORD_MEANING', prompt: 'TAP THE WORD MEANING', target: wordMeaning }
    ];

    if (cardBgColor && this.roundCount >= 4) {
      rules.push({ rule: 'BG_COLOR', prompt: 'TAP THE BACKGROUND BOX COLOR', target: cardBgColor });
    }

    if (this.roundCount >= 7) {
      rules.push({
        rule: 'NOT_MATCHING',
        prompt: 'TAP WHAT IS NEITHER INK NOR WORD!',
        target: shuffled[3] // Something completely unmentioned
      });
    }

    const selectedRule = rules[Math.floor(Math.random() * rules.length)];

    // 4 Options to display
    const optionsPool = [selectedRule.target];
    for (let c of shuffled) {
      if (!optionsPool.includes(c)) optionsPool.push(c);
      if (optionsPool.length === 4) break;
    }
    optionsPool.sort(() => Math.random() - 0.5);

    this.currentTask = {
      rule: selectedRule.rule,
      prompt: selectedRule.prompt,
      wordMeaning,
      textColor,
      cardBgColor,
      correctTarget: selectedRule.target,
      options: optionsPool
    };

    this.renderRound();
    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.roundStartTime = performance.now();

    this.timer = setInterval(() => {
      this.timeLeft -= 0.05;
      this.game.updateTimer(Math.max(0, this.timeLeft), this.roundTimeLimit);

      if (this.timeLeft <= 1.0 && Math.floor(this.timeLeft * 20) % 5 === 0) {
        window.soundEngine.playTick(true);
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.game.onWrongAnswer({
          explanation: `Time expired! The correct answer was ${this.currentTask.correctTarget.name}.`,
          reason: "TOO SLOW! Brain overloaded by colors."
        });
      }
    }, 50);
  }

  renderRound() {
    const task = this.currentTask;
    this.game.setQuestionCategory(`ROUND ${this.roundCount} • STROOP TEST`);
    
    // Custom Stroop Card in Question Container
    const bgStyle = task.cardBgColor 
      ? `background: ${task.cardBgColor.hex}22; border: 2px solid ${task.cardBgColor.hex};` 
      : 'background: rgba(255,255,255,0.04); border: 2px solid rgba(255,255,255,0.1);';

    this.game.questionContainer.innerHTML = `
      <div class="color-rule-banner">${task.prompt}</div>
      <div class="color-word-card" style="${bgStyle}">
        <span class="color-target-word" style="color: ${task.textColor.hex}; text-shadow: 0 0 20px ${task.textColor.hex}aa;">
          ${task.wordMeaning.name}
        </span>
      </div>
    `;

    // Render Answer Buttons
    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-4';

    task.options.forEach((colorObj, index) => {
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn color-opt-btn';
      btn.style.setProperty('--btn-glow', colorObj.hex);
      btn.innerHTML = `
        <span class="color-pill" style="background: ${colorObj.hex}; box-shadow: 0 0 10px ${colorObj.hex};"></span>
        <span class="opt-text">${colorObj.name}</span>
      `;
      btn.addEventListener('click', () => this.handleAnswer(colorObj, btn));
      optionsContainer.appendChild(btn);
    });
  }

  handleAnswer(selectedColor, btnElement) {
    if (this.game.isTransitioning) return;
    clearInterval(this.timer);

    const task = this.currentTask;
    const elapsedSeconds = (performance.now() - this.roundStartTime) / 1000;

    if (selectedColor.name === task.correctTarget.name) {
      // Correct!
      const speedBonus = Math.max(0, Math.round((this.roundTimeLimit - elapsedSeconds) * 10));
      this.game.onCorrectAnswer({
        basePoints: 15,
        speedBonus: speedBonus,
        button: btnElement
      });

      setTimeout(() => {
        if (!this.game.isGameOver) {
          this.nextRound();
        }
      }, 200);
    } else {
      // Incorrect!
      this.game.onWrongAnswer({
        button: btnElement,
        explanation: `Rule: "${task.prompt}". Word was ${task.wordMeaning.name} in ${task.textColor.name} text. Correct choice was ${task.correctTarget.name}!`,
        reason: "STROOP OVERLOAD! Colors scrambled your synapses."
      });
    }
  }

  cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

window.ColorChaosMode = ColorChaosMode;
