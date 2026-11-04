/**
 * BRAIN LAG - Mode 1: Don't Overthink
 * 30-second rapid-fire trick question gauntlet. One strike and you're out!
 */

class OverthinkMode {
  constructor(game) {
    this.game = game;
    this.name = 'overthink';
    this.title = "Don't Overthink";
    this.description = "30 seconds. Deceptive trick questions. One mistake ends the run!";
    this.pool = [];
    this.currentIndex = 0;
    this.timeLeft = 30;
    this.timer = null;
    this.currentQuestion = null;
  }

  start() {
    this.timeLeft = 30;
    this.game.updateTimer(this.timeLeft, 30);
    
    // Shuffle question pool excluding non-trick where possible or mixing trick, math, wordplay, logic
    const all = window.BRAIN_QUESTIONS || [];
    this.pool = [...all].sort(() => Math.random() - 0.5);
    this.currentIndex = 0;

    // Start 30s countdown
    this.timer = setInterval(() => {
      this.timeLeft -= 0.1;
      this.game.updateTimer(Math.max(0, this.timeLeft), 30);

      if (this.timeLeft <= 5.0 && Math.floor(this.timeLeft * 10) % 10 === 0) {
        window.soundEngine.playTick(true);
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.game.endGame("TIME'S UP! Brain lagged out on the clock.");
      }
    }, 100);

    this.nextQuestion();
  }

  nextQuestion() {
    if (this.currentIndex >= this.pool.length) {
      // Re-shuffle if exhausted
      this.pool.sort(() => Math.random() - 0.5);
      this.currentIndex = 0;
    }

    this.currentQuestion = this.pool[this.currentIndex++];
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.currentQuestion;
    const container = this.game.questionContainer;
    const optionsContainer = this.game.optionsContainer;

    this.game.setQuestionCategory(q.category.toUpperCase().replace('_', ' '));
    this.game.setQuestionPrompt(q.text);

    // Build option buttons
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid ' + (q.options.length <= 2 ? 'grid-2' : 'grid-4');

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'game-opt-btn';
      btn.innerHTML = `
        <span class="opt-key">${index + 1}</span>
        <span class="opt-text">${optText}</span>
      `;
      btn.addEventListener('click', () => this.handleAnswer(index, btn));
      optionsContainer.appendChild(btn);
    });

    this.questionStartTime = performance.now();
  }

  handleAnswer(selectedIndex, btnElement) {
    if (this.game.isTransitioning) return;
    const q = this.currentQuestion;
    const elapsedSeconds = (performance.now() - this.questionStartTime) / 1000;

    if (selectedIndex === q.correct) {
      // Correct!
      this.game.onCorrectAnswer({
        basePoints: 10,
        speedBonus: Math.max(0, Math.round((5 - elapsedSeconds) * 3)),
        button: btnElement
      });

      // Quick transition to next question
      setTimeout(() => {
        if (!this.game.isGameOver) {
          this.nextQuestion();
        }
      }, 250);
    } else {
      // Incorrect! Sudden death in Don't Overthink
      clearInterval(this.timer);
      this.game.onWrongAnswer({
        button: btnElement,
        correctIndex: q.correct,
        explanation: q.explanation,
        reason: "ONE MISTAKE & YOU'RE OUT!"
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

window.OverthinkMode = OverthinkMode;
