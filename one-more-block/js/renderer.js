/**
 * ONE MORE BLOCK - Isometric 2.5D Renderer
 * Orthographic isometric 3D projection, dynamic lighting, drop shadows, and themes
 */

class IsometricRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Virtual resolution & sizing
    this.width = canvas.width;
    this.height = canvas.height;
    this.dpr = window.devicePixelRatio || 1;

    // Isometric projection angle factors (2:1 isometric ratio)
    this.cos = 1.0;
    this.sin = 0.5;

    // Camera
    this.cameraY = 0;
    this.targetCameraY = 0;
    this.shakeAmount = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // Starfield for cosmic backgrounds
    this.stars = this.generateStars(60);
  }

  generateStars(count) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.03 + 0.01
      });
    }
    return stars;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for battery/performance
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);
  }

  shake(intensity = 6) {
    this.shakeAmount = Math.max(this.shakeAmount, intensity);
  }

  update(dt = 1) {
    // Smooth camera damping
    this.cameraY += (this.targetCameraY - this.cameraY) * 0.08 * dt;

    // Decay screen shake
    if (this.shakeAmount > 0.01) {
      this.shakeX = (Math.random() * 2 - 1) * this.shakeAmount;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeAmount;
      this.shakeAmount *= Math.pow(0.85, dt);
    } else {
      this.shakeAmount = 0;
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  // Convert 3D world coordinate (x, y, z) into 2D screen coordinate (sx, sy)
  toScreen(x, y, z) {
    const originX = this.width * 0.5 + this.shakeX;
    // Keep camera focused so the active building layer sits at ~62% of screen height
    const originY = this.height * 0.62 + (this.cameraY) + this.shakeY;

    const sx = originX + (x - z) * this.cos;
    const sy = originY + (x + z) * this.sin - y;
    return { x: sx, y: sy };
  }

  // Compute color scheme for a given floor and active skin
  getBlockColor(floor, skinId = 'neon') {
    switch (skinId) {
      case 'synthwave': {
        // Cycling between hot pink (320), violet (270), and electric cyan (180)
        const cycle = (floor * 14) % 360;
        const hue = (cycle < 180) ? (320 - cycle * 0.5) : (180 + (cycle - 180) * 0.77);
        return {
          h: hue,
          s: 90,
          l: 58,
          stroke: 'rgba(255, 255, 255, 0.45)'
        };
      }
      case 'candypop': {
        // Soft pastel rainbow
        const hue = (floor * 9 + 40) % 360;
        return {
          h: hue,
          s: 75,
          l: 72,
          stroke: 'rgba(255, 255, 255, 0.6)'
        };
      }
      case 'emerald': {
        // Imperial jade to champagne gold
        const step = floor % 30;
        const hue = 145 + Math.sin(step * 0.2) * 35; // 110 to 180 (greens/teals/golds)
        return {
          h: hue,
          s: 85,
          l: 52,
          stroke: 'rgba(255, 215, 0, 0.45)'
        };
      }
      case 'obsidian': {
        // Deep obsidian charcoal with gold trim
        const lightness = 22 + (floor % 10);
        return {
          h: 42,
          s: 15,
          l: lightness,
          stroke: '#ffd700'
        };
      }
      case 'hologram': {
        // Glowing cyan-violet laser
        const hue = 185 + Math.sin(floor * 0.15) * 45;
        return {
          h: hue,
          s: 100,
          l: 60,
          alpha: 0.85,
          stroke: '#ffffff'
        };
      }
      case 'neon':
      default: {
        // Classic smooth spectral gradient: 4 degrees hue advance per floor
        const hue = (320 + floor * 4.5) % 360;
        return {
          h: hue,
          s: 85,
          l: 56,
          stroke: 'rgba(255, 255, 255, 0.35)'
        };
      }
    }
  }

  // Draw background based on active theme
  renderBackground(themeId = 'dark_minimal') {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    switch (themeId) {
      case 'sunset_glow': {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#12072b');
        grad.addColorStop(0.55, '#2e124d');
        grad.addColorStop(0.85, '#6a1b51');
        grad.addColorStop(1, '#a83246');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Warm horizon glow
        const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.75, 10, w * 0.5, h * 0.75, w * 0.6);
        sunGrad.addColorStop(0, 'rgba(255, 140, 60, 0.22)');
        sunGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
      case 'cyber_grid': {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#030710');
        grad.addColorStop(1, '#081726');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Perspective grid lines on floor
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        const horizon = h * 0.7;
        for (let x = -w * 0.5; x <= w * 1.5; x += 40) {
          ctx.beginPath();
          ctx.moveTo(w * 0.5, horizon - 80);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = horizon - 40; y <= h; y += 24) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        break;
      }
      case 'aurora': {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#020b14');
        grad.addColorStop(0.5, '#051d28');
        grad.addColorStop(1, '#08252a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Northern lights soft aurora band
        const time = Date.now() * 0.001;
        ctx.save();
        ctx.filter = 'blur(30px)';
        ctx.fillStyle = 'rgba(0, 255, 160, 0.08)';
        ctx.beginPath();
        ctx.ellipse(w * 0.5 + Math.sin(time) * 40, h * 0.35, w * 0.45, 120, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 160, 255, 0.07)';
        ctx.beginPath();
        ctx.ellipse(w * 0.45, h * 0.28, w * 0.4, 100, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'dark_minimal':
      default: {
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 30, w * 0.5, h * 0.5, w * 0.85);
        grad.addColorStop(0, '#181b26');
        grad.addColorStop(0.65, '#0e1017');
        grad.addColorStop(1, '#07080c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        break;
      }
    }

    // Render subtle twinkling stars
    for (const star of this.stars) {
      const alpha = star.alpha * (0.8 + 0.2 * Math.sin(Date.now() * star.twinkleSpeed));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
    }

    ctx.restore();
  }

  // Draw the stationary foundation pedestal at bottom of tower
  renderPedestal(baseW, baseD, baseH = 50) {
    const ctx = this.ctx;
    const x = 0;
    const z = 0;
    const y = 0;

    // Pedestal drop shadow on ground
    const pGround = this.toScreen(x, -baseH - 10, z);
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(pGround.x, pGround.y, baseW * 1.2, baseD * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Render 3D stone pedestal block
    this.render3DBox({
      x, y: -baseH, z,
      w: baseW, d: baseD, h: baseH,
      color: { h: 220, s: 12, l: 18, stroke: 'rgba(255, 255, 255, 0.15)' },
      isPedestal: true
    });
  }

  // Draw drop shadow of moving block onto top surface of the tower with clipping
  renderDropShadow(movingBlock, topTowerBlock) {
    if (!movingBlock || !topTowerBlock) return;
    const ctx = this.ctx;

    const shadowY = topTowerBlock.y + topTowerBlock.h + 0.5;

    // 1. Clip to topTowerBlock's top face polygon so shadow only falls ON the tower
    const thw = topTowerBlock.w * 0.5;
    const thd = topTowerBlock.d * 0.5;
    const tx = topTowerBlock.x;
    const tz = topTowerBlock.z;

    const cBack = this.toScreen(tx - thw, shadowY, tz - thd);
    const cRight = this.toScreen(tx + thw, shadowY, tz - thd);
    const cFront = this.toScreen(tx + thw, shadowY, tz + thd);
    const cLeft = this.toScreen(tx - thw, shadowY, tz + thd);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cBack.x, cBack.y);
    ctx.lineTo(cRight.x, cRight.y);
    ctx.lineTo(cFront.x, cFront.y);
    ctx.lineTo(cLeft.x, cLeft.y);
    ctx.closePath();
    ctx.clip();

    // 2. Project moving block's shadow polygon onto that clipped region
    const hw = movingBlock.w * 0.5;
    const hd = movingBlock.d * 0.5;
    const x = movingBlock.x;
    const z = movingBlock.z;

    const pBack = this.toScreen(x - hw, shadowY, z - hd);
    const pRight = this.toScreen(x + hw, shadowY, z - hd);
    const pFront = this.toScreen(x + hw, shadowY, z + hd);
    const pLeft = this.toScreen(x - hw, shadowY, z + hd);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.moveTo(pBack.x, pBack.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pFront.x, pFront.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Draw target ghost marker for challenge record
  renderChallengeMarker(floor, recordFloor, blockW, blockD, challengerName = 'Friend') {
    if (recordFloor <= 0) return;
    const ctx = this.ctx;
    const y = recordFloor * 26; // 26 = BLOCK_HEIGHT

    // Projected position
    const pCenter = this.toScreen(0, y + 13, 0);

    // Glowing dashed line around tower height
    ctx.save();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);

    const hw = blockW * 0.7;
    const hd = blockD * 0.7;
    const pBack = this.toScreen(-hw, y, -hd);
    const pRight = this.toScreen(hw, y, -hd);
    const pFront = this.toScreen(hw, y, hd);
    const pLeft = this.toScreen(-hw, y, hd);

    ctx.beginPath();
    ctx.moveTo(pBack.x, pBack.y);
    ctx.lineTo(pRight.x, pRight.y);
    ctx.lineTo(pFront.x, pFront.y);
    ctx.lineTo(pLeft.x, pLeft.y);
    ctx.closePath();
    ctx.stroke();

    // Floating label pill
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.font = "bold 11px 'Outfit', -apple-system, sans-serif";
    const label = `🚩 ${challengerName.toUpperCase()}: FLOOR ${recordFloor}`;
    const tw = ctx.measureText(label).width;

    const lx = pRight.x + 12;
    const ly = pRight.y - 10;
    ctx.beginPath();
    ctx.roundRect(lx, ly, tw + 16, 20, 10);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillText(label, lx + 8, ly + 14);
    ctx.restore();
  }

  // Render a 3D isometric box with Top, Front-Right, and Front-Left faces
  render3DBox(box) {
    const ctx = this.ctx;
    const { x, y, z, w, d, h, color, opacity = 1.0, isGolden = false } = box;

    const hw = w * 0.5;
    const hd = d * 0.5;

    // Calculate 8 isometric corners
    // Bottom 4 vertices at y
    const p0 = this.toScreen(x - hw, y, z - hd); // Back-Bottom
    const p1 = this.toScreen(x + hw, y, z - hd); // Right-Bottom
    const p2 = this.toScreen(x + hw, y, z + hd); // Front-Bottom
    const p3 = this.toScreen(x - hw, y, z + hd); // Left-Bottom

    // Top 4 vertices at y + h
    const p4 = this.toScreen(x - hw, y + h, z - hd); // Back-Top
    const p5 = this.toScreen(x + hw, y + h, z - hd); // Right-Top
    const p6 = this.toScreen(x + hw, y + h, z + hd); // Front-Top
    const p7 = this.toScreen(x - hw, y + h, z + hd); // Left-Top

    ctx.save();
    ctx.globalAlpha = opacity;

    // Face color definitions with isometric directional shading
    let topFill, leftFill, rightFill;
    if (isGolden) {
      topFill = 'linear-gradient(to bottom, #ffe066, #f5b700)';
      leftFill = '#b38600';
      rightFill = '#cca300';
    } else {
      const hue = color.h;
      const sat = color.s;
      const lgt = color.l;
      const a = color.alpha || 1.0;

      // Top face is illuminated: pure vibrant color
      topFill = `hsla(${hue}, ${sat}%, ${lgt}%, ${a})`;
      // Front-Right face (+X face): moderate shading (~18% darker)
      rightFill = `hsla(${hue}, ${sat}%, ${Math.max(10, lgt - 18)}%, ${a})`;
      // Front-Left face (+Z face): deepest shading (~32% darker)
      leftFill = `hsla(${hue}, ${sat}%, ${Math.max(8, lgt - 32)}%, ${a})`;
    }

    // 1. FRONT-LEFT FACE (Vertices: p3, p2, p6, p7)
    ctx.fillStyle = leftFill;
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.closePath();
    ctx.fill();

    // 2. FRONT-RIGHT FACE (Vertices: p2, p1, p5, p6)
    ctx.fillStyle = rightFill;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.closePath();
    ctx.fill();

    // 3. TOP FACE (Vertices: p4, p5, p6, p7)
    ctx.fillStyle = topFill;
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.closePath();
    ctx.fill();

    // Top face delicate edge bevel/glow
    if (color.stroke) {
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Subtle edge highlight between front-left and front-right face (p6 to p2)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p6.x, p6.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.restore();
  }

  // Render falling debris pieces with gravity & tilt
  renderFallingPiece(piece) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.max(0, piece.alpha);

    // Render rotated box
    this.render3DBox({
      x: piece.x,
      y: piece.y,
      z: piece.z,
      w: piece.w,
      d: piece.d,
      h: piece.h,
      color: piece.color,
      opacity: piece.alpha
    });

    ctx.restore();
  }
}

window.IsometricRenderer = IsometricRenderer;
