/**
 * ONE MORE BLOCK - Particle & Visual Effects Engine
 * Renders shockwaves, sparkling stars, slicing dust, confetti bursts, and floating score texts.
 */

class ParticleEngine {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  // Ring shockwave expanding from the placed block
  addShockwave(isoX, isoY, w, d, color = '#ffffff') {
    this.shockwaves.push({
      x: isoX,
      y: isoY,
      w: w,
      d: d,
      scale: 1.0,
      alpha: 0.9,
      maxScale: 1.6,
      color: color
    });
  }

  // Sparkling star burst for perfect placement
  addSparkles(isoX, isoY, color = '#ffd700', count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 3.5 + 2.0;
      this.particles.push({
        x: isoX,
        y: isoY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 - (Math.random() * 2 + 1), // bias upwards
        size: Math.random() * 4 + 3,
        alpha: 1.0,
        decay: Math.random() * 0.025 + 0.02,
        color: color,
        type: 'spark'
      });
    }
  }

  // Dust & shards from block cutting
  addSliceDust(isoX, isoY, color = '#ffffff', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1.0;
      this.particles.push({
        x: isoX + (Math.random() * 20 - 10),
        y: isoY + (Math.random() * 10 - 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5 - Math.random() * 1.5,
        gravity: 0.12,
        size: Math.random() * 3 + 2,
        alpha: 0.85,
        decay: Math.random() * 0.03 + 0.025,
        color: color,
        type: 'dust'
      });
    }
  }

  // Full-screen celebratory confetti cannon for high score / milestone
  addConfetti(width, height, count = 80) {
    const colors = ['#ff2a70', '#05d9e8', '#f9f871', '#00ff87', '#ff8e53', '#9b51e0'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 4 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        width: Math.random() * 8 + 6,
        height: Math.random() * 14 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        decay: Math.random() * 0.008 + 0.006,
        type: 'confetti'
      });
    }
  }

  // Floating text like "+15", "PERFECT!", "COMBO x3"
  addFloatingText(isoX, isoY, text, color = '#fff', size = 20, isCombo = false) {
    this.floatingTexts.push({
      x: isoX,
      y: isoY,
      text: text,
      color: color,
      size: size,
      alpha: 1.0,
      vy: -1.8,
      life: 0,
      maxLife: 45,
      isCombo: isCombo
    });
  }

  update(dt = 1) {
    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.scale += 0.035 * dt;
      sw.alpha -= 0.03 * dt;
      if (sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      if (p.rotation !== undefined) {
        p.rotation += (p.rotSpeed || 0.05) * dt;
      }
      p.alpha -= (p.decay || 0.03) * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life += dt;
      if (ft.life > ft.maxLife * 0.6) {
        ft.alpha = 1.0 - (ft.life - ft.maxLife * 0.6) / (ft.maxLife * 0.4);
      }
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // Render shockwaves
    ctx.save();
    for (const sw of this.shockwaves) {
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Draw isometric diamond shape expanding
      const hw = (sw.w * sw.scale) / 2;
      const hd = (sw.d * sw.scale) / 2;
      // Diamond vertices in 2.5D projection
      const topX = sw.x;
      const topY = sw.y - (hw + hd) * 0.3;
      const rightX = sw.x + hw;
      const rightY = sw.y;
      const bottomX = sw.x;
      const bottomY = sw.y + (hw + hd) * 0.3;
      const leftX = sw.x - hw;
      const leftY = sw.y;

      ctx.moveTo(topX, topY);
      ctx.lineTo(rightX, rightY);
      ctx.lineTo(bottomX, bottomY);
      ctx.lineTo(leftX, leftY);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();

    // Render particles
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.type === 'confetti') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      } else if (p.type === 'spark') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        // Bright core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dust
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();

    // Render floating texts
    ctx.save();
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = ft.isCombo 
        ? `900 ${ft.size}px 'Outfit', 'Inter', -apple-system, sans-serif`
        : `700 ${ft.size}px 'Outfit', 'Inter', -apple-system, sans-serif`;
      
      // Shadow / Outline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.lineWidth = ft.isCombo ? 5 : 3;
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }
}

window.particleEngine = new ParticleEngine();
