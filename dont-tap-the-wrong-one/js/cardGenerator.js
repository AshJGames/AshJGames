/**
 * DON'T TAP THE WRONG ONE - Canvas Score Card & Viral Share Generator
 * Dynamically renders an eye-catching, high-resolution score card for social sharing.
 */

class ScoreCardGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 1000;
    this.ctx = this.canvas.getContext('2d');
  }

  // Generate unique challenge code encoding score, mode, and timestamp
  generateChallengeCode(mode, score) {
    const modePrefix = (mode || 'classic').slice(0, 2).toUpperCase();
    const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${modePrefix}-${score}-${hash}`;
  }

  // Generate shareable URL with parameters
  getShareUrl(mode, score, challengeCode) {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      challenge: challengeCode,
      challengerScore: score,
      mode: mode
    });
    return `${base}?${params.toString()}`;
  }

  // Select funny evaluation based on performance
  getRoastEvaluation(score, streak, reason) {
    if (reason === 'timeout') {
      const timeoutRoasts = [
        { title: 'BRAIN BUFFERING 404', text: 'You froze like dial-up internet!' },
        { title: 'DEER IN HEADLIGHTS', text: 'Stared into the neon abyss and blinked.' },
        { title: 'TIME IS RELATIVE', text: '...and you ran completely out of it.' }
      ];
      return timeoutRoasts[Math.floor(Math.random() * timeoutRoasts.length)];
    }

    if (score < 50) {
      const lowRoasts = [
        { title: 'EMOTIONAL DAMAGE', text: 'Were you even reading the screen?!' },
        { title: 'FINGER BETRAYAL', text: 'Your eyes said yes, your thumb said NOPE.' },
        { title: 'PANIC TAPPER', text: 'Randomly hitting buttons is not a strategy.' }
      ];
      return lowRoasts[Math.floor(Math.random() * lowRoasts.length)];
    } else if (score < 150) {
      const midRoasts = [
        { title: 'ALMOST A GENIUS', text: 'Good reflexes, but the brain short-circuited!' },
        { title: 'CHAOS VICTIM', text: 'One second of hesitation was all it took.' },
        { title: 'SOLID EFFORT', text: 'Respectable, but your friends will beat this.' }
      ];
      return midRoasts[Math.floor(Math.random() * midRoasts.length)];
    } else if (score < 350) {
      const highPraises = [
        { title: 'CYBER REFLEXES', text: 'Synapses firing at near-quantum speeds!' },
        { title: 'ON PURE FIRE', text: 'Calculated, cool, and dangerously fast.' },
        { title: 'FOCUSED ASSASSIN', text: 'Dodged the decoys like a champion.' }
      ];
      return highPraises[Math.floor(Math.random() * highPraises.length)];
    } else {
      const godPraises = [
        { title: 'GODLIKE ASCENSION', text: 'You see through the matrix. Untouchable.' },
        { title: 'LETHAL PRECISION', text: 'Your reflexes defy human biological limits.' },
        { title: 'ABSOLUTE MASTER', text: 'Challenge your friends and watch them weep.' }
      ];
      return godPraises[Math.floor(Math.random() * godPraises.length)];
    }
  }

  // Draw full canvas score card
  async createScoreCard(gameData) {
    const ctx = this.ctx;
    const w = 800;
    const h = 1000;

    const {
      score = 0,
      streak = 0,
      mode = 'Classic',
      accuracy = 100,
      reactionMs = 380,
      playerName = 'Player',
      reason = 'wrong_tap'
    } = gameData;

    const evaluation = this.getRoastEvaluation(score, streak, reason);
    const challengeCode = this.generateChallengeCode(mode, score);

    // Background Cyber Dark Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0b12');
    bgGrad.addColorStop(0.5, '#121424');
    bgGrad.addColorStop(1, '#06070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle neon grid lines
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Outer Neon Glow Border
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 18;
    this.roundRect(ctx, 28, 28, w - 56, h - 56, 24);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Corner Accents
    ctx.fillStyle = '#FF1744';
    ctx.fillRect(20, 20, 24, 6);
    ctx.fillRect(20, 20, 6, 24);
    ctx.fillRect(w - 44, 20, 24, 6);
    ctx.fillRect(w - 26, 20, 6, 24);
    ctx.fillRect(20, h - 26, 24, 6);
    ctx.fillRect(20, h - 44, 6, 24);
    ctx.fillRect(w - 44, h - 26, 24, 6);
    ctx.fillRect(w - 26, h - 44, 6, 24);

    // Top Header: Game Logo / Brand
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '4px';
    ctx.fillText("DON'T TAP THE WRONG ONE", w / 2, 95);

    // Mode Pill Badge
    const modeBadge = `${mode.toUpperCase()} MODE`;
    ctx.fillStyle = 'rgba(255, 23, 68, 0.15)';
    this.roundRect(ctx, w / 2 - 120, 118, 240, 36, 18);
    ctx.fill();
    ctx.strokeStyle = '#FF1744';
    ctx.lineWidth = 2;
    this.roundRect(ctx, w / 2 - 120, 118, 240, 36, 18);
    ctx.stroke();

    ctx.fillStyle = '#FF1744';
    ctx.font = '700 16px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(modeBadge, w / 2, 142);

    // Massive Score Display
    ctx.fillStyle = '#8E94A8';
    ctx.font = '600 18px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('FINAL SCORE', w / 2, 220);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 110px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 24;
    ctx.fillText(score.toString(), w / 2, 330);
    ctx.shadowBlur = 0;

    // Player Title / Roast Banner
    ctx.fillStyle = '#1E2238';
    this.roundRect(ctx, 60, 375, w - 120, 105, 16);
    ctx.fill();
    ctx.strokeStyle = '#FFEA00';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 60, 375, w - 120, 105, 16);
    ctx.stroke();

    ctx.fillStyle = '#FFEA00';
    ctx.font = '800 24px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.fillText(evaluation.title, w / 2, 415);

    ctx.fillStyle = '#E0E4F0';
    ctx.font = '500 18px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`"${evaluation.text}"`, w / 2, 452);

    // 3 Stat Badges Grid
    const statsY = 515;
    const colWidth = 205;
    const statCols = [
      { label: 'MAX STREAK', val: `🔥 ${streak}`, x: 80 },
      { label: 'ACCURACY', val: `🎯 ${accuracy}%`, x: 297 },
      { label: 'BEST REFLEX', val: `⚡ ${reactionMs}ms`, x: 515 }
    ];

    statCols.forEach(col => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      this.roundRect(ctx, col.x, statsY, colWidth, 110, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      this.roundRect(ctx, col.x, statsY, colWidth, 110, 16);
      ctx.stroke();

      ctx.fillStyle = '#8E94A8';
      ctx.font = '600 14px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.fillText(col.label, col.x + colWidth / 2, statsY + 36);

      ctx.fillStyle = '#00E676';
      ctx.font = '800 28px "Inter", "Segoe UI", system-ui, sans-serif';
      ctx.fillText(col.val, col.x + colWidth / 2, statsY + 82);
    });

    // Challenge Card Callout Box
    ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
    this.roundRect(ctx, 60, 665, w - 120, 140, 20);
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 2;
    this.roundRect(ctx, 60, 665, w - 120, 140, 20);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 22px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.fillText('⚡ CAN YOU BEAT THIS SCORE? ⚡', w / 2, 712);

    ctx.fillStyle = '#00E5FF';
    ctx.font = '700 20px "Courier New", monospace';
    ctx.fillText(`CHALLENGE CODE: ${challengeCode}`, w / 2, 755);

    ctx.fillStyle = '#A0A7C0';
    ctx.font = '500 15px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`Player: ${playerName} • Play offline in browser`, w / 2, 785);

    // Footer
    ctx.fillStyle = '#656C85';
    ctx.font = '600 16px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Tap. Think fast. Don’t mess up. 🔥', w / 2, 855);

    ctx.fillStyle = '#FF1744';
    ctx.font = '700 14px "Inter", "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Play now: donttapthewrongone.app', w / 2, 885);

    return {
      canvas: this.canvas,
      dataUrl: this.canvas.toDataURL('image/png'),
      challengeCode
    };
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Native Web Share or Clipboard Fallback
  async shareScore(gameData) {
    const { score, mode = 'Classic' } = gameData;
    const challengeCode = this.generateChallengeCode(mode, score);
    const shareUrl = this.getShareUrl(mode, score, challengeCode);
    const shareText = `I scored ${score} in DON'T TAP THE WRONG ONE (${mode} Mode)! 😂 Can you beat my reflexes? Beat my code [${challengeCode}]:`;

    if (navigator.share) {
      try {
        // Try sharing with generated image file if supported
        const cardResult = await this.createScoreCard(gameData);
        const blob = await (await fetch(cardResult.dataUrl)).blob();
        const file = new File([blob], `score_${score}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "DON'T TAP THE WRONG ONE",
            text: shareText,
            url: shareUrl,
            files: [file]
          });
          return { success: true, method: 'native_file' };
        } else {
          await navigator.share({
            title: "DON'T TAP THE WRONG ONE",
            text: shareText,
            url: shareUrl
          });
          return { success: true, method: 'native_text' };
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed, fallback to clipboard', err);
          return this.copyToClipboard(shareText, shareUrl);
        }
        return { success: false, aborted: true };
      }
    } else {
      return this.copyToClipboard(shareText, shareUrl);
    }
  }

  async copyToClipboard(text, url) {
    const fullText = `${text} ${url}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
        return { success: true, method: 'clipboard' };
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return { success: true, method: 'clipboard' };
      }
    } catch (e) {
      console.warn('Clipboard failed:', e);
      return { success: false, error: e };
    }
  }
}

window.gameScoreCard = new ScoreCardGenerator();
