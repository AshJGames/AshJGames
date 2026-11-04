/**
 * ONE MORE BLOCK - Viral Sharing & Challenge Engine
 * Web Share API, Dynamic Canvas Score Card Generator, Challenge URL links
 */

class ShareManager {
  constructor() {
    this.toastTimeout = null;
  }

  showToast(message, duration = 2500) {
    let toast = document.getElementById('shareToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'shareToast';
      toast.className = 'share-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, duration);
  }

  getChallengeUrl(floor, mode = 'classic') {
    const base = (typeof window !== 'undefined' && window.location && window.location.href)
      ? window.location.href
      : 'https://onemoreblock.game/';
    const url = new URL(base);
    url.searchParams.set('challenge', floor);
    url.searchParams.set('mode', mode);
    return url.toString();
  }

  generateShareText(floor, score, mode = 'classic') {
    const challengeUrl = this.getChallengeUrl(floor, mode);
    return `🧱 I just reached FLOOR ${floor} (Score: ${score}) in ONE MORE BLOCK! Can you build a taller tower?\n\nPlay here: ${challengeUrl}`;
  }

  async shareScore(floor, score, mode = 'classic') {
    const shareText = this.generateShareText(floor, score, mode);
    const challengeUrl = this.getChallengeUrl(floor, mode);

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ONE MORE BLOCK Challenge!',
          text: shareText,
          url: challengeUrl
        });
        return true;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed, copying to clipboard', err);
          this.copyToClipboard(shareText);
        }
      }
    } else {
      this.copyToClipboard(shareText);
    }
  }

  async copyChallengeLink(floor, mode = 'classic') {
    const challengeUrl = this.getChallengeUrl(floor, mode);
    await this.copyToClipboard(challengeUrl, '🔗 Challenge link copied to clipboard!');
  }

  async copyToClipboard(text, customToast = '📋 Copied to clipboard!') {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        this.showToast(customToast);
        return true;
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        this.showToast(customToast);
        return true;
      }
    } catch (e) {
      this.showToast('❌ Failed to copy link');
      return false;
    }
  }

  // Generate a high-resolution 1080x1080 social card
  generateScoreCard(floor, score, rating, mode = 'classic', skinId = 'neon') {
    return new Promise((resolve) => {
      const cardCanvas = document.createElement('canvas');
      const size = 1080;
      cardCanvas.width = size;
      cardCanvas.height = size;
      const ctx = cardCanvas.getContext('2d');

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, size, size);
      bgGrad.addColorStop(0, '#0a0d17');
      bgGrad.addColorStop(0.5, '#12172b');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Radial glow
      const radial = ctx.createRadialGradient(size * 0.5, size * 0.45, 50, size * 0.5, size * 0.45, size * 0.65);
      radial.addColorStop(0, 'rgba(5, 217, 232, 0.18)');
      radial.addColorStop(1, 'transparent');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, size, size);

      // Border outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 14;
      ctx.strokeRect(28, 28, size - 56, size - 56);

      // Game Title
      ctx.fillStyle = '#ffffff';
      ctx.font = "900 48px 'Outfit', -apple-system, sans-serif";
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText('ONE MORE BLOCK', size * 0.5, 120);

      // Mode pill badge
      ctx.fillStyle = '#ff2a70';
      ctx.beginPath();
      ctx.roundRect(size * 0.5 - 110, 150, 220, 42, 21);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = "bold 20px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '2px';
      ctx.fillText(`${mode.toUpperCase()} MODE`, size * 0.5, 178);

      // Draw stylized 3D tower stack
      const centerX = size * 0.5;
      const startY = 480;
      const blockCount = 7;
      for (let i = 0; i < blockCount; i++) {
        const bw = 240 - (i * 12);
        const bd = 240 - (i * 12);
        const bh = 34;
        const by = startY - (i * 38);
        const hue = (320 + (floor - blockCount + i) * 6) % 360;

        // Isometric diamond on card
        const hw = bw * 0.5;
        const hd = bd * 0.25;

        // Left face
        ctx.fillStyle = `hsl(${hue}, 85%, 30%)`;
        ctx.beginPath();
        ctx.moveTo(centerX - hw, by);
        ctx.lineTo(centerX, by + hd);
        ctx.lineTo(centerX, by + hd + bh);
        ctx.lineTo(centerX - hw, by + bh);
        ctx.closePath();
        ctx.fill();

        // Right face
        ctx.fillStyle = `hsl(${hue}, 85%, 42%)`;
        ctx.beginPath();
        ctx.moveTo(centerX, by + hd);
        ctx.lineTo(centerX + hw, by);
        ctx.lineTo(centerX + hw, by + bh);
        ctx.lineTo(centerX, by + hd + bh);
        ctx.closePath();
        ctx.fill();

        // Top face
        ctx.fillStyle = `hsl(${hue}, 85%, 58%)`;
        ctx.beginPath();
        ctx.moveTo(centerX, by - hd);
        ctx.lineTo(centerX + hw, by);
        ctx.lineTo(centerX, by + hd);
        ctx.lineTo(centerX - hw, by);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Large Floor Stat
      ctx.fillStyle = '#ffffff';
      ctx.font = "900 130px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '0px';
      ctx.fillText(`${floor}`, size * 0.5, 680);

      ctx.fillStyle = '#05d9e8';
      ctx.font = "bold 32px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '8px';
      ctx.fillText('FLOORS REACHED', size * 0.5, 730);

      // Score & Rating
      ctx.fillStyle = '#ffd700';
      ctx.font = "bold 44px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '2px';
      ctx.fillText(`SCORE: ${score.toLocaleString()}`, size * 0.5, 805);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = "600 28px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '3px';
      ctx.fillText(rating.toUpperCase(), size * 0.5, 855);

      // Challenge CTA footer
      ctx.fillStyle = '#ffffff';
      ctx.font = "bold 32px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '2px';
      ctx.fillText('🧱 CAN YOU BUILD TALLER?', size * 0.5, 960);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = "20px 'Outfit', -apple-system, sans-serif";
      ctx.letterSpacing = '1px';
      ctx.fillText('Play now: ONE MORE BLOCK', size * 0.5, 998);

      resolve(cardCanvas.toDataURL('image/png'));
    });
  }

  downloadCard(dataUrl, floor) {
    const link = document.createElement('a');
    link.download = `one-more-block-floor-${floor}.png`;
    link.href = dataUrl;
    link.click();
    this.showToast('📥 Score card downloaded!');
  }
}

window.shareManager = new ShareManager();
