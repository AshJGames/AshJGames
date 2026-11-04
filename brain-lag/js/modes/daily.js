/**
 * BRAIN LAG - Daily Brain Challenge Mode
 * Seeded by the current date (YYYY-MM-DD) so every player worldwide gets the exact same 10 challenges.
 */

class DailyChallengeMode {
  constructor(game) {
    this.game = game;
    this.name = 'daily';
    this.title = 'Daily Challenge';
    this.description = '10 curated challenges seeded daily. Same for every player worldwide!';
    this.questions = [];
    this.currentIndex = 0;
    this.timeLeft = 8;
    this.timer = null;
    this.currentQuestion = null;
  }

  // Seeded pseudo-random number generator (Mulberry32)
  createSeededRNG(seedStr) {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
    }
    return function() {
      h = Math.imul(h ^ (h >>> 15), 1 | h);
      h = (h + Math.imul(h ^ (h >>> 7), 61 | h)) ^ h;
      return ((h >>> 0) / 4294967296);
    };
  }

  start() {
    const today = window.storageManager.getTodayString();
    const rng = this.createSeededRNG(today);

    // Pick 10 fixed questions for today
    const all = [...(window.BRAIN_QUESTIONS || [])];
    
    // Seeded shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }

    this.questions = all.slice(0, 10);
    this.currentIndex = 0;
    this.nextQuestion();
  }

  nextQuestion() {
    if (this.currentIndex >= this.questions.length) {
      // Completed all 10 questions!
      window.storageManager.recordDailyCompletion(this.game.score);
      this.game.endGame("DAILY CHALLENGE COMPLETED! 🧠✨ Check your daily rank!");
      return;
    }

    this.currentQuestion = this.questions[this.currentIndex];
    this.renderQuestion();
  }

  renderQuestion() {
    const q = this.currentQuestion;
    const progressText = `QUESTION ${this.currentIndex + 1} OF 10`;

    this.game.setQuestionCategory(`📅 DAILY CHALLENGE • ${progressText}`);
    this.game.setQuestionPrompt(q.text);

    // Timer per question
    this.timeLeft = q.timeLimit || 8;
    this.startTimer(this.timeLeft);

    const optionsContainer = this.game.optionsContainer;
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

    this.startTime = performance.now();
  }

  startTimer(seconds) {
    if (this.timer) clearInterval(this.timer);
    this.timeLeft = seconds;
    this.game.updateTimer(this.timeLeft, seconds);

    this.timer = setInterval(() => {
      this.timeLeft -= 0.1;
      this.game.updateTimer(Math.max(0, this.timeLeft), seconds);

      if (this.timeLeft <= 2.0 && Math.floor(this.timeLeft * 10) % 5 === 0) {
        window.soundEngine.playTick(true);
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.game.onWrongAnswer({
          explanation: "Time ran out on this daily question!",
          reason: "CLOCK LAGGED OUT!"
        });
      }
    }, 100);
  }

  handleAnswer(selectedIndex, btnElement) {
    if (this.game.isTransitioning) return;
    clearInterval(this.timer);

    const q = this.currentQuestion;
    const elapsedSeconds = (performance.now() - this.startTime) / 1000;

    if (selectedIndex === q.correct) {
      this.game.onCorrectAnswer({
        basePoints: 20,
        speedBonus: Math.max(0, Math.round((q.timeLimit - elapsedSeconds) * 4)),
        button: btnElement
      });

      this.currentIndex += 1;
      setTimeout(() => {
        if (!this.game.isGameOver) this.nextQuestion();
      }, 300);
    } else {
      // In daily challenge, incorrect answers allow proceeding or ends run?
      // Ending run or penalizing: Prompt says "wrong answer: game over in timed survival modes"
      // In Daily Challenge, let's treat it as sudden death or show explanation then advance/gameover.
      this.game.onWrongAnswer({
        button: btnElement,
        explanation: q.explanation,
        reason: "DAILY CHALLENGE STRIKE!"
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

window.DailyChallengeMode = DailyChallengeMode;
