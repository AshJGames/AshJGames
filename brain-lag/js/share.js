/**
 * BRAIN LAG - Viral Growth & Score Card Engine
 * HTML5 Canvas dynamic score card generation, Web Share API, Clipboard fallback,
 * and Friend Challenge link decoding.
 */

class ShareEngine {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1200;
    this.canvas.height = 630;
    this.ctx = this.canvas.getContext('2d');
  }

  getDiagnosis(score) {
    if (score < 100) {
      return {
        title: "DIAGNOSIS: 404 BRAIN NOT FOUND",
        sub: "A goldfish just outscored you. Please reboot your brain.",
        mascot: "lagged"
      };
    } else if (score < 300) {
      return {
        title: "DIAGNOSIS: NEURONS ON VACATION",
        sub: "Your brain needs a critical software update!",
        mascot: "lagged"
      };
    } else if (score < 600) {
      return {
        title: "DIAGNOSIS: ROOM TEMP IQ",
        sub: "Decent human specimen! That was dangerously close to intelligence.",
        mascot: "thinking"
      };
    } else if (score < 900) {
      return {
        title: "DIAGNOSIS: CERTIFIED BIG BRAIN",
        sub: "That was suspiciously intelligent! Are you sure you didn't cheat?",
        mascot: "combo"
      };
    } else {
      return {
        title: "DIAGNOSIS: 200 IQ GALAXY TRANSCENDENCE",
        sub: "NASA wants to study your brainwaves. You broke the simulation!",
        mascot: "galaxy"
      };
    }
  }

  generateScoreCardImage({ modeTitle, score, streak, accuracy, correct, fastestMs }) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const diag = this.getDiagnosis(score);

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0c0e17');
    bgGrad.addColorStop(0.5, '#16192e');
    bgGrad.addColorStop(1, '#240046');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Cyber Grid & Accent Glows
    ctx.save();
    ctx.strokeStyle = 'rgba(157, 78, 221, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Glowing Neon Border
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 20;
    ctx.strokeRect(20, 20, w - 40, h - 40);
    ctx.restore();

    // 3. Header: BRAIN LAG Logo
    ctx.save();
    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#fee440';
    ctx.shadowColor = '#fee440';
    ctx.shadowBlur = 15;
    ctx.fillText('BRAIN LAG', 60, 90);

    ctx.font = '700 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#00f5d4';
    ctx.shadowColor = '#00f5d4';
    ctx.shadowBlur = 10;
    ctx.fillText('THE VIRAL REFLEX & TRICK CHALLENGE', 60, 125);
    ctx.restore();

    // 4. Mode Badge
    ctx.save();
    ctx.fillStyle = 'rgba(181, 23, 158, 0.4)';
    ctx.strokeStyle = '#ff0054';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w - 380, 55, 320, 50, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(modeTitle.toUpperCase(), w - 220, 88);
    ctx.restore();

    // 5. Score Hero Display
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = '700 28px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#a2d2ff';
    ctx.fillText('FINAL SCORE', 60, 210);

    ctx.font = '900 120px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = score >= 500 ? '#fee440' : '#00f5d4';
    ctx.shadowBlur = 35;
    ctx.fillText(score.toString(), 60, 320);
    ctx.restore();

    // 6. Diagnosis Banner
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(60, 355, 700, 110, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 26px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = score >= 600 ? '#39ff14' : (score >= 300 ? '#fee440' : '#ff0054');
    ctx.fillText(diag.title, 85, 400);

    ctx.font = '500 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(diag.sub, 85, 438);
    ctx.restore();

    // 7. Stats Pillars
    const stats = [
      { label: 'ACCURACY', val: `${accuracy}%` },
      { label: 'MAX STREAK', val: `${streak}x` },
      { label: 'CORRECT', val: `${correct}` }
    ];
    if (fastestMs && fastestMs < 9000) {
      stats.push({ label: 'FASTEST REFLEX', val: `${fastestMs}ms` });
    }

    const startX = 60;
    const statBoxWidth = 160;
    stats.forEach((s, i) => {
      const boxX = startX + i * (statBoxWidth + 20);
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.strokeStyle = 'rgba(0, 245, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(boxX, 490, statBoxWidth, 90, 12);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '600 14px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(s.label, boxX + statBoxWidth / 2, 520);

      ctx.font = '800 30px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#00f5d4';
      ctx.fillText(s.val, boxX + statBoxWidth / 2, 560);
      ctx.restore();
    });

    // 8. Mascot & Brain Icon Illustration
    ctx.save();
    ctx.translate(950, 320);
    // Draw cyber brain circle
    const circGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 160);
    circGrad.addColorStop(0, 'rgba(181, 23, 158, 0.4)');
    circGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = circGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 160, 0, Math.PI * 2);
    ctx.fill();

    // Mascot Emoji/Emblem
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '120px serif';
    const mascotEmoji = score >= 900 ? '👑' : (score >= 600 ? '🧠' : (score >= 300 ? '🤔' : '🥴'));
    ctx.fillText(mascotEmoji, 0, -10);

    // Call to action below mascot
    ctx.font = '800 20px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#fee440';
    ctx.shadowColor = '#fee440';
    ctx.shadowBlur = 10;
    ctx.fillText('CAN YOU BEAT THIS?', 0, 120);
    ctx.restore();

    // 9. Watermark footer
    ctx.save();
    ctx.font = '600 16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.fillText('PLAY FREE • NO INSTALL • BRAIN LAG', w - 40, h - 35);
    ctx.restore();

    return this.canvas.toDataURL('image/png');
  }

  createChallengeUrl({ mode, score, playerName = 'A friend' }) {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams({
      challenge: '1',
      mode: mode,
      score: score.toString(),
      challenger: playerName
    });
    return `${base}?${params.toString()}`;
  }

  parseChallengeUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('challenge') === '1') {
        return {
          isChallenge: true,
          mode: params.get('mode') || 'overthink',
          targetScore: parseInt(params.get('score'), 10) || 500,
          challenger: params.get('challenger') || 'A Friend'
        };
      }
    } catch (e) {}
    return { isChallenge: false };
  }

  async shareScore({ modeTitle, mode, score, streak, accuracy, correct, fastestMs, playerName }) {
    const challengeUrl = this.createChallengeUrl({ mode, score, playerName });
    const textMsg = `I scored ${score} in BRAIN LAG (${modeTitle})! 🧠😂 Can your brain handle the trick questions, or will your neurons lag out? Beat my score: ${challengeUrl}`;

    // Record share count in storage
    if (window.storageManager) {
      window.storageManager.recordShare();
    }

    // Try Web Share API with Canvas image file first
    if (navigator.share) {
      try {
        const dataUrl = this.generateScoreCardImage({ modeTitle, score, streak, accuracy, correct, fastestMs });
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'brain-lag-score.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'BRAIN LAG Challenge',
            text: textMsg,
            url: challengeUrl,
            files: [file]
          });
          return { method: 'native_file', success: true };
        } else {
          await navigator.share({
            title: 'BRAIN LAG Challenge',
            text: textMsg,
            url: challengeUrl
          });
          return { method: 'native_link', success: true };
        }
      } catch (err) {
        if (err.name === 'AbortError') return { method: 'aborted', success: false };
        // Fallback to clipboard
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(textMsg);
      return { method: 'clipboard', success: true, text: textMsg };
    } catch (e) {
      return { method: 'manual', success: false, text: textMsg };
    }
  }

  downloadScoreCardImage({ modeTitle, score, streak, accuracy, correct, fastestMs }) {
    const dataUrl = this.generateScoreCardImage({ modeTitle, score, streak, accuracy, correct, fastestMs });
    const link = document.createElement('a');
    link.download = `brain-lag-score-${score}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.shareEngine = new ShareEngine();
