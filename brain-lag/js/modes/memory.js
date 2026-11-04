/**
 * BRAIN LAG - Mode 3: Memory Meltdown
 * Sequence memory test with neon cyber pads, progressive length, and reverse recall.
 */

class MemoryMeltdownMode {
  constructor(game) {
    this.game = game;
    this.name = 'memory';
    this.title = 'Memory Meltdown';
    this.description = 'Memorize the flashing sequence and repeat it accurately. Sequence grows each round!';
    this.pads = [
      { id: 0, name: 'CYAN', color: '#00f5d4', freq: 440, symbol: '▲' },
      { id: 1, name: 'MAGENTA', color: '#ff0054', freq: 554.37, symbol: '■' },
      { id: 2, name: 'GOLD', color: '#fee440', freq: 659.25, symbol: '★' },
      { id: 3, name: 'PURPLE', color: '#b5179e', freq: 880, symbol: '◆' }
    ];
    this.level = 1;
    this.sequence = [];
    this.playerInput = [];
    this.isShowingSequence = false;
    this.isReverseRound = false;
    this.inputTimer = null;
    this.timeLeft = 8;
  }

  start() {
    this.level = 1;
    this.startRound();
  }

  startRound() {
    this.playerInput = [];
    this.isShowingSequence = true;

    // Sequence length starts at 3, grows by 1 every level
    const seqLength = 2 + this.level;
    this.isReverseRound = this.level >= 5 && Math.random() > 0.5;

    // Generate random sequence
    this.sequence = [];
    for (let i = 0; i < seqLength; i++) {
      this.sequence.push(Math.floor(Math.random() * 4));
    }

    this.renderBoard();
    this.playSequence();
  }

  renderBoard() {
    const banner = this.isShowingSequence 
      ? `LEVEL ${this.level} • MEMORIZE SEQUENCE (${this.sequence.length} STEPS)` 
      : (this.isReverseRound ? `REPEAT IN REVERSE ORDER! 🔄` : `REPEAT THE SEQUENCE!`);

    this.game.setQuestionCategory(banner);
    this.game.setQuestionPrompt(this.isShowingSequence ? "Watch the pads flash..." : (this.isReverseRound ? "Tap the sequence BACKWARDS!" : "Tap the pads in order:"));

    this.game.questionContainer.innerHTML = `
      <div class="memory-status-box">
        <span class="memory-level-badge">LEVEL ${this.level}</span>
        <span class="memory-prompt-text">${this.isReverseRound ? '⚠️ REVERSE ORDER!' : 'Standard Sequence'}</span>
      </div>
    `;

    // Render 4 glowing pads
    const optionsContainer = this.game.optionsContainer;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'memory-grid';

    this.pads.forEach((pad, index) => {
      const padEl = document.createElement('button');
      padEl.className = 'memory-pad';
      padEl.id = `memory-pad-${index}`;
      padEl.style.setProperty('--pad-color', pad.color);
      padEl.innerHTML = `
        <span class="pad-symbol">${pad.symbol}</span>
        <span class="pad-num">${index + 1}</span>
      `;
      padEl.addEventListener('click', () => this.handlePadClick(index, padEl));
      optionsContainer.appendChild(padEl);
    });

    this.disablePadInput(true);
  }

  disablePadInput(disabled) {
    const pads = document.querySelectorAll('.memory-pad');
    pads.forEach(p => {
      if (disabled) {
        p.classList.add('disabled');
      } else {
        p.classList.remove('disabled');
      }
    });
  }

  playSequence() {
    this.disablePadInput(true);
    let step = 0;
    const interval = Math.max(320, 600 - (this.level - 1) * 35); // Flashes get faster at higher levels

    const playNext = () => {
      if (this.game.isGameOver) return;

      if (step < this.sequence.length) {
        const padIndex = this.sequence[step];
        this.flashPad(padIndex, interval * 0.75);
        step++;
        setTimeout(playNext, interval);
      } else {
        // Finished playback, enable player input
        setTimeout(() => {
          this.isShowingSequence = false;
          this.disablePadInput(false);
          this.game.setQuestionCategory(this.isReverseRound ? `⚠️ REVERSE ORDER (LEVEL ${this.level})` : `YOUR TURN! (LEVEL ${this.level})`);
          this.game.setQuestionPrompt(this.isReverseRound ? "Repeat the sequence BACKWARDS!" : "Repeat the exact sequence:");
          this.startInputTimer();
        }, 300);
      }
    };

    setTimeout(playNext, 600);
  }

  flashPad(index, duration = 300) {
    const pad = this.pads[index];
    const el = document.getElementById(`memory-pad-${index}`);
    if (el) {
      el.classList.add('active-flash');
      window.soundEngine.playTone(pad.freq, 'sine', duration / 1000, 0.35);
      setTimeout(() => {
        el.classList.remove('active-flash');
      }, duration);
    }
  }

  startInputTimer() {
    if (this.inputTimer) clearInterval(this.inputTimer);
    // Time limit: 3s + 1.2s per pad in sequence
    const totalTime = 3 + this.sequence.length * 1.2;
    this.timeLeft = totalTime;
    this.game.updateTimer(this.timeLeft, totalTime);

    this.inputTimer = setInterval(() => {
      this.timeLeft -= 0.1;
      this.game.updateTimer(Math.max(0, this.timeLeft), totalTime);

      if (this.timeLeft <= 0) {
        clearInterval(this.inputTimer);
        this.game.onWrongAnswer({
          explanation: "Time ran out while trying to recall the sequence!",
          reason: "MEMORY OVERFLOW! Pad sequence forgotten."
        });
      }
    }, 100);
  }

  handlePadClick(index, padElement) {
    if (this.isShowingSequence || this.game.isTransitioning || this.game.isGameOver) return;

    // Flash tapped pad
    this.flashPad(index, 200);

    // Determine target sequence based on whether it is reverse round
    const expectedSequence = this.isReverseRound ? [...this.sequence].reverse() : this.sequence;
    const currentStepIndex = this.playerInput.length;
    const expectedPadIndex = expectedSequence[currentStepIndex];

    if (index === expectedPadIndex) {
      // Correct step
      this.playerInput.push(index);
      
      // Check if sequence completed
      if (this.playerInput.length === expectedSequence.length) {
        clearInterval(this.inputTimer);
        this.disablePadInput(true);

        const basePoints = 25 + this.level * 10;
        const speedBonus = Math.max(0, Math.round(this.timeLeft * 5));

        this.game.onCorrectAnswer({
          basePoints,
          speedBonus,
          button: padElement
        });

        this.level += 1;
        setTimeout(() => {
          if (!this.game.isGameOver) {
            this.startRound();
          }
        }, 400);
      }
    } else {
      // Mistake!
      clearInterval(this.inputTimer);
      this.disablePadInput(true);

      const correctSymbol = this.pads[expectedPadIndex].symbol;
      const tappedSymbol = this.pads[index].symbol;

      this.game.onWrongAnswer({
        button: padElement,
        explanation: `Expected ${this.pads[expectedPadIndex].name} (${correctSymbol}), but you tapped ${this.pads[index].name} (${tappedSymbol})!`,
        reason: "MEMORY MELTDOWN! Sequence scrambled."
      });
    }
  }

  cleanup() {
    if (this.inputTimer) {
      clearInterval(this.inputTimer);
      this.inputTimer = null;
    }
  }
}

window.MemoryMeltdownMode = MemoryMeltdownMode;
