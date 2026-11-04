/**
 * BRAIN LAG - Canvas Particles & Animated Mascot System
 */

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.confetti = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createConfetti(x, y, count = 70) {
    const colors = ['#00f5d4', '#7b2cbf', '#fee440', '#ff0054', '#3a86ff', '#39ff14', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4;
      this.confetti.push({
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height / 2,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.18,
        drag: 0.96,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.008,
        isRound: Math.random() > 0.5
      });
    }
  }

  createSparks(x, y, count = 25, color = '#ff0054') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  loop() {
    if (!this.running) return;
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render & Update Confetti
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        const c = this.confetti[i];
        c.vy += c.gravity;
        c.vx *= c.drag;
        c.vy *= c.drag;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotationSpeed;
        c.life -= c.decay;

        if (c.life <= 0 || c.y > this.canvas.height + 50) {
          this.confetti.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(c.x, c.y);
        this.ctx.rotate((c.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, c.life);
        this.ctx.fillStyle = c.color;

        if (c.isRound) {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        }
        this.ctx.restore();
      }

      // Render & Update Sparks
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.life);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    requestAnimationFrame(() => this.loop());
  }
}

/**
 * Animated Brain Mascot Drawer (SVG/Canvas)
 * Displays emotional states: idle, thinking, ecstatic (combo), lagged (dizzy error)
 */
class MascotController {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = 'idle'; // idle | thinking | combo | lagged | galaxy
    this.blinkTimer = 0;
    this.isBlinking = false;
    this.render();
  }

  setState(newState, autoResetMs = 0) {
    this.state = newState;
    this.render();
    if (autoResetMs > 0) {
      setTimeout(() => {
        this.state = 'idle';
        this.render();
      }, autoResetMs);
    }
  }

  render() {
    if (!this.container) return;

    let eyeContent = '';
    let mouthContent = '';
    let auraClass = '';
    let accessory = '';

    switch (this.state) {
      case 'lagged':
        eyeContent = `
          <!-- Left X eye -->
          <line x1="38" y1="42" x2="48" y2="52" stroke="#ff0054" stroke-width="3" stroke-linecap="round"/>
          <line x1="48" y1="42" x2="38" y2="52" stroke="#ff0054" stroke-width="3" stroke-linecap="round"/>
          <!-- Right X eye -->
          <line x1="62" y1="42" x2="72" y2="52" stroke="#ff0054" stroke-width="3" stroke-linecap="round"/>
          <line x1="72" y1="42" x2="62" y2="52" stroke="#ff0054" stroke-width="3" stroke-linecap="round"/>
        `;
        mouthContent = `<path d="M 46 64 Q 55 58 64 64" stroke="#ff0054" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        auraClass = 'mascot-shocked';
        accessory = `
          <g class="spark-arcs">
            <path d="M 25 35 Q 20 25 15 30" stroke="#fee440" stroke-width="2" fill="none" />
            <path d="M 85 35 Q 90 25 95 30" stroke="#fee440" stroke-width="2" fill="none" />
            <path d="M 55 12 L 53 18 L 57 20 L 54 26" stroke="#fee440" stroke-width="2" fill="none" />
          </g>
        `;
        break;

      case 'combo':
      case 'galaxy':
        // Cool sunglasses / Galaxy shades
        eyeContent = `
          <polygon points="32,42 50,42 47,56 35,56" fill="#111" stroke="#00f5d4" stroke-width="2"/>
          <polygon points="60,42 78,42 75,56 63,56" fill="#111" stroke="#00f5d4" stroke-width="2"/>
          <line x1="50" y1="45" x2="60" y2="45" stroke="#00f5d4" stroke-width="2"/>
          <!-- Glare line -->
          <line x1="35" y1="46" x2="45" y2="52" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="63" y1="46" x2="73" y2="52" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
        `;
        mouthContent = `<path d="M 46 62 Q 55 70 64 62" stroke="#00f5d4" stroke-width="3" fill="none" stroke-linecap="round"/>`;
        auraClass = 'mascot-fire';
        accessory = `
          <circle cx="55" cy="52" r="48" stroke="url(#galaxyGrad)" stroke-width="2" stroke-dasharray="8 6" fill="none" class="mascot-orbit"/>
        `;
        break;

      case 'thinking':
        eyeContent = `
          <!-- Squint / one eyebrow raised -->
          <ellipse cx="43" cy="46" rx="4" ry="4" fill="#ffffff" />
          <circle cx="44" cy="45" r="2" fill="#111" />
          <ellipse cx="67" cy="48" rx="4" ry="2" fill="#ffffff" />
          <circle cx="67" cy="48" r="1.5" fill="#111" />
          <path d="M 37 38 Q 43 35 48 38" stroke="#00f5d4" stroke-width="2" fill="none" />
          <path d="M 62 42 Q 67 44 72 43" stroke="#00f5d4" stroke-width="2" fill="none" />
        `;
        mouthContent = `<path d="M 48 64 Q 55 64 62 62" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        auraClass = 'mascot-thinking';
        break;

      case 'idle':
      default:
        eyeContent = `
          <ellipse cx="43" cy="47" rx="5" ry="6" fill="#ffffff" />
          <circle cx="44" cy="47" r="2.5" fill="#0d0f18" />
          <circle cx="45.5" cy="45.5" r="1" fill="#00f5d4" />
          
          <ellipse cx="67" cy="47" rx="5" ry="6" fill="#ffffff" />
          <circle cx="68" cy="47" r="2.5" fill="#0d0f18" />
          <circle cx="69.5" cy="45.5" r="1" fill="#00f5d4" />
        `;
        mouthContent = `<path d="M 48 62 Q 55 67 62 62" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        auraClass = 'mascot-idle';
        break;
    }

    this.container.innerHTML = `
      <svg viewBox="0 0 110 100" class="mascot-svg ${auraClass}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b5179e" />
            <stop offset="50%" stop-color="#7209b7" />
            <stop offset="100%" stop-color="#3a0ca3" />
          </linearGradient>
          <linearGradient id="galaxyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f5d4" />
            <stop offset="50%" stop-color="#fee440" />
            <stop offset="100%" stop-color="#ff0054" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Ambient glow aura -->
        <ellipse cx="55" cy="52" rx="42" ry="36" fill="rgba(181, 23, 158, 0.2)" filter="url(#neonGlow)"/>

        <!-- Main Brain Body -->
        <g id="brain-body" filter="url(#neonGlow)">
          <!-- Left hemisphere lobes -->
          <path d="
            M 55 24
            C 44 14, 25 18, 22 34
            C 14 38, 12 52, 22 64
            C 18 74, 28 84, 40 82
            C 48 82, 52 78, 55 76
            C 58 78, 62 82, 70 82
            C 82 84, 92 74, 88 64
            C 98 52, 96 38, 88 34
            C 85 18, 66 14, 55 24 Z"
            fill="url(#brainGrad)"
            stroke="#c77dff"
            stroke-width="2.5"
          />

          <!-- Brain folds / sulci -->
          <path d="M 55 24 L 55 76" stroke="#4a0e4e" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M 32 30 Q 42 36 34 46 Q 26 52 38 60" stroke="#c77dff" stroke-width="2" fill="none" opacity="0.7"/>
          <path d="M 78 30 Q 68 36 76 46 Q 84 52 72 60" stroke="#c77dff" stroke-width="2" fill="none" opacity="0.7"/>
          <path d="M 42 66 Q 48 72 40 76" stroke="#c77dff" stroke-width="2" fill="none" opacity="0.7"/>
          <path d="M 68 66 Q 62 72 70 76" stroke="#c77dff" stroke-width="2" fill="none" opacity="0.7"/>
        </g>

        <!-- Accessories (Sunglasses, sparks, halo) -->
        ${accessory}

        <!-- Face / Eyes & Mouth -->
        <g id="mascot-face">
          ${eyeContent}
          ${mouthContent}
        </g>
      </svg>
    `;
  }
}

window.ParticleSystem = ParticleSystem;
window.MascotController = MascotController;
