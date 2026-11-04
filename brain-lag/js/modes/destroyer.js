/**
 * BRAIN LAG - Mode 5: Brain Destroyer
 * The ultimate cognitive torture chamber.
 * Seamlessly rotates between trick questions, inverted Stroop, memory flashes,
 * sudden reflex bursts, and rule inversions ("PICK THE WRONG ANSWER!").
 */

class BrainDestroyerMode {
  constructor(game) {
    this.game = game;
    this.name = 'destroyer';
    this.title = 'Brain Destroyer';
    this.description = 'The ultimate gauntlet. Rotating challenges, inverted rules, and zero room for error.';
    this.roundCount = 0;
    this.activeSubEngine = null;
    this.timer = null;
    this.timeLeft = 5;
  }

  start() {
    this.roundCount = 0;
    this.nextRound();
  }

  nextRound() {
    this.roundCount += 1;
    this.cleanupSubEngine();

    // Challenge type rotation
    const types = ['inverted_question', 'rapid_stroop', 'reflex_strike', 'trick_hard'];
    const chosenType = types[(this.roundCount - 1) % types.length];

    this.game.setQuestionCategory(`DESTROYER LEVEL ${this.roundCount} • ${chosenType.toUpperCase().replace('_', ' ')}`);

    switch (chosenType) {
      case 'inverted_question':
        this.runInvertedQuestion();
        break;
      case 'rapid_stroop':
        this.runRapidStroop();
        break;
      case 'reflex_strike':
        this.runReflexStrike();
        break;
      case 'trick_hard':
      default:
        this.runHardTrick();
        break;
    }
  }

  runInvertedQuestion() {
    // "INVERTED RULE: CHOOSE THE INCORRECT / WRONG ANSWER!"
    const qList = (window.BRAIN_QUESTIONS || []).filter(q => q.options.length >= 3);
    const q = qList[Math.floor(Math.random() * qList.length)];

    this.game.setQuestionPrompt(`⚠️ REVERSE RULE: PICK THE INCORRECT ANSWER!\n"${q.text}"`);
    
    const timeLimit = Math.max(3.5, 6 - this.roundCount * 0.15);
    this.startTimer(timeLimit);

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid ' + (q.options.length <= 2 ? 'grid-2' : 'grid-4');

    q.options.forEach((optText, index) => {
      const isCorrectNormally = index === q.correct;
      // In reverse rule, anything EXCEPT the normal correct answer is valid!
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn';
      btn.innerHTML = `<span class="opt-text">${optText}</span>`;
      btn.addEventListener('click', () => {
        clearInterval(this.timer);
        if (!isCorrectNormally) {
          // Player successfully picked a wrong answer!
          this.game.onCorrectAnswer({
            basePoints: 25,
            speedBonus: Math.round(this.timeLeft * 6),
            button: btn,
            customMessage: "TRICK OVERCOME!"
          });
          setTimeout(() => {
            if (!this.game.isGameOver) this.nextRound();
          }, 300);
        } else {
          // Player fell into trap and picked the actually correct answer!
          this.game.onWrongAnswer({
            button: btn,
            explanation: `The rule was inverted! You were supposed to pick an INCORRECT answer, but you picked the true answer: "${optText}"!`,
            reason: "RULE INVERSION FAILURE!"
          });
        }
      });
      optionsContainer.appendChild(btn);
    });
  }

  runRapidStroop() {
    const colors = [
      { name: 'RED', hex: '#ff0054' },
      { name: 'BLUE', hex: '#3a86ff' },
      { name: 'GREEN', hex: '#39ff14' },
      { name: 'YELLOW', hex: '#fee440' }
    ].sort(() => Math.random() - 0.5);

    const word = colors[0];
    const ink = colors[1];

    // Glitch rule: alternate between Ink and Word rapidly
    const matchInk = Math.random() > 0.5;
    const prompt = matchInk ? "TAP THE INK COLOR! (IGNORE THE WORD)" : "TAP THE WORD MEANING! (IGNORE INK)";
    const target = matchInk ? ink : word;

    this.game.setQuestionPrompt(prompt);
    this.game.questionContainer.innerHTML = `
      <div class="color-word-card glitch-card" style="border: 2px dashed ${ink.hex};">
        <span class="color-target-word" style="color: ${ink.hex}; font-size: 2.4rem;">${word.name}</span>
      </div>
    `;

    const timeLimit = Math.max(1.8, 3.2 - this.roundCount * 0.1);
    this.startTimer(timeLimit);

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-4';

    colors.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn';
      btn.innerHTML = `<span class="opt-text">${c.name}</span>`;
      btn.addEventListener('click', () => {
        clearInterval(this.timer);
        if (c.name === target.name) {
          this.game.onCorrectAnswer({
            basePoints: 20,
            speedBonus: Math.round(this.timeLeft * 8),
            button: btn
          });
          setTimeout(() => {
            if (!this.game.isGameOver) this.nextRound();
          }, 300);
        } else {
          this.game.onWrongAnswer({
            button: btn,
            explanation: `Rule: ${prompt}. Expected ${target.name}, but you tapped ${c.name}!`,
            reason: "GLITCH OVERLOAD!"
          });
        }
      });
      optionsContainer.appendChild(btn);
    });
  }

  runReflexStrike() {
    this.game.setQuestionPrompt("ALERT: INSTANT REFLEX STRIKE! TAP TARGET IMMEDIATELY!");
    this.game.questionContainer.innerHTML = `
      <div class="reflex-arena">
        <div id="destroyer-strike-box" class="reflex-decoy-zone">
          <span style="font-size: 2.5rem;">💀</span>
        </div>
      </div>
    `;

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid grid-1';

    const tapBtn = document.createElement('button');
    tapBtn.className = 'game-opt-btn reflex-tap-btn';
    tapBtn.innerHTML = `<span>DEFEND NOW! 🛡️</span>`;
    optionsContainer.appendChild(tapBtn);

    const startTime = performance.now();
    const maxReactionTime = Math.max(450, 750 - this.roundCount * 20);

    let resolved = false;
    this.startTimer(maxReactionTime / 1000);

    tapBtn.addEventListener('click', () => {
      if (resolved) return;
      resolved = true;
      clearInterval(this.timer);
      const reactionMs = Math.round(performance.now() - startTime);

      this.game.onCorrectAnswer({
        basePoints: 25,
        speedBonus: Math.max(10, 800 - reactionMs),
        fastestReactionMs: reactionMs,
        button: tapBtn,
        customMessage: `${reactionMs}ms SHIELDED!`
      });

      setTimeout(() => {
        if (!this.game.isGameOver) this.nextRound();
      }, 300);
    });
  }

  runHardTrick() {
    const hardQuestions = (window.BRAIN_QUESTIONS || []).filter(q => q.difficulty >= 2);
    const q = hardQuestions[Math.floor(Math.random() * hardQuestions.length)];

    this.game.setQuestionPrompt(q.text);
    const timeLimit = Math.max(4, 7 - this.roundCount * 0.15);
    this.startTimer(timeLimit);

    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid ' + (q.options.length <= 2 ? 'grid-2' : 'grid-4');

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn';
      btn.innerHTML = `<span class="opt-text">${optText}</span>`;
      btn.addEventListener('click', () => {
        clearInterval(this.timer);
        if (index === q.correct) {
          this.game.onCorrectAnswer({
            basePoints: 20,
            speedBonus: Math.round(this.timeLeft * 5),
            button: btn
          });
          setTimeout(() => {
            if (!this.game.isGameOver) this.nextRound();
          }, 300);
        } else {
          this.game.onWrongAnswer({
            button: btn,
            explanation: q.explanation,
            reason: "DESTROYED! Trick question caught you."
          });
        }
      });
      optionsContainer.appendChild(btn);
    });
  }

  startTimer(seconds) {
    if (this.timer) clearInterval(this.timer);
    this.timeLeft = seconds;
    this.game.updateTimer(this.timeLeft, seconds);

    this.timer = setInterval(() => {
      this.timeLeft -= 0.05;
      this.game.updateTimer(Math.max(0, this.timeLeft), seconds);

      if (this.timeLeft <= 1.2 && Math.floor(this.timeLeft * 20) % 5 === 0) {
        window.soundEngine.playTick(true);
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.game.onWrongAnswer({
          explanation: "You ran out of time under extreme pressure!",
          reason: "BRAIN MELTED! Pressure overloaded synapses."
        });
      }
    }, 50);
  }

  cleanupSubEngine() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  cleanup() {
    this.cleanupSubEngine();
  }
}

window.BrainDestroyerMode = BrainDestroyerMode;
