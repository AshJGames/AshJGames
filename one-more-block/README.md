# 🧱 ONE MORE BLOCK

> **"Build the tallest tower without letting it collapse!"**
> A sleek, highly addictive isometric block-stacking browser arcade game built with HTML5 Canvas, Web Audio API, and vanilla JavaScript.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)
![FPS](https://img.shields.io/badge/Performance-60FPS-orange.svg)

---

## 🎮 Play & Experience

**ONE MORE BLOCK** is designed around instant accessibility, precision timing, and viral replayability:
- **Drop with precision**: Blocks glide smoothly across alternating **X** and **Z** axes. Tap, click, or hit <kbd>Space</kbd> to drop.
- **Dynamic slicing physics**: Any overhanging edge is cut off cleanly in real-time, tumbling down with 3D isometric gravity and spin.
- **Musical combo feedback**: Perfect placements trigger crystalline chimes following an ascending pentatonic scale.
- **Platform recovery**: Chain 5 or more perfect placements to earn a **Recovery Bonus**, expanding your platform back towards full width!
- **Special events**: Experience sudden surprises like **Slow-Motion Focus Time**, **Double Points**, and sparkling **Golden Blocks**.

---

## ✨ Features

### 1. Isometric 2.5D Rendering Engine
- **Custom Orthographic Canvas Renderer**: Crisp, lightweight 2.5D isometric projection running at 60-120 FPS on all devices.
- **Directional Shading & Edge Bevels**: Three-face directional lighting (Top, Front-Right, Front-Left) with realistic shadows.
- **Dynamic Drop Shadow**: Projects an intuitive, real-time shadow of the moving block directly onto the top face of the tower.
- **Smooth Spring Camera**: Tracks the tower upwards with gentle damping, keeping the active build layer centered.

### 2. Four Exciting Game Modes
| Mode | Description |
| :--- | :--- |
| **Classic** | The definitive stacking experience. Balanced starting size (`140px`), smooth speed curve, and forgiving initial tolerance. |
| **Endless** | For high-score chasers. Ever-increasing speeds, wind sways, and endless floor scaling. |
| **Hardcore** | 35% faster initial speeds, smaller starting platform (`110px`), tighter margins, and a **2.0x score multiplier**! |
| **Daily Challenge** | Seeded deterministic tower based on the current UTC date. Every player in the world plays the identical sequence today! Tracks consecutive daily streaks. |

### 3. Procedural Web Audio Engine
- **100% Asset-Free Audio**: Zero external audio downloads. Uses the Web Audio API for zero latency and instant loading.
- **Ascending Pentatonic Scale**: C4 through C7 notes ascend with every consecutive perfect placement.
- **Audio Feedback**: Slicing whooshes, tactile placement thuds, falling debris drops, high-score fanfare, and game-over cadence.
- **Haptic Vibration**: Integrated with `navigator.vibrate` for mobile tactile feedback.

### 4. Viral Growth & Social Sharing
- **1-Click Challenge Links**: Share a personalized URL (e.g. `?challenge=47&mode=classic&name=Alex`). When your friend opens it:
  - An in-game banner announces: *"🔥 Alex challenged you to beat FLOOR 47!"*
  - A glowing golden target line appears at Floor 47 on their tower!
  - Crossing floor 47 triggers a *"CHALLENGE CRUSHED!"* celebration!
- **Dynamic Social Score Card Generator**: Generates a high-resolution 1080x1080 graphic in memory featuring player stats, 3D tower silhouette, and rating—ready to share or download for Instagram Stories, Twitter, or TikTok.
- **Web Share API**: Native share sheet integration with automatic fallback to clipboard copy.

### 5. Progression, Skins & Achievements
- **Unlockable Block Skins**:
  - *Classic Neon* (Spectral gradient)
  - *Synthwave 80s* (Outrun pink, violet, and electric cyan)
  - *Candy Pop* (Pastel sherbet macarons)
  - *Emerald Royale* (Imperial jade & champagne gold)
  - *Obsidian Gold* (Luxury dark obsidian with metallic trim)
  - *Cyber Hologram* (Luminous translucent laser crystals)
- **Ambient Themes**: *Obsidian Studio*, *Sunset Horizon*, *Cyber Matrix*, and *Northern Lights*.
- **Achievement System**: 13 badges celebrating tower milestones, streak mastery, and hardcore survival.
- **Offline PWA Support**: Complete service worker caching and web manifest for home-screen installation.

---

## 🕹️ Controls

- **Tap / Click**: Drop the active block.
- **Spacebar / Up Arrow / Enter**: Drop the active block.
- **P / Esc**: Pause / Resume game.

---

## 📁 Project Architecture

```
ONE MORE BLOCK/
├── index.html              # Responsive HTML5 semantic layout, modals, HUD
├── manifest.webmanifest    # Progressive Web App configuration
├── sw.js                   # Service Worker for full offline capabilities
├── css/
│   └── style.css           # Mobile-first glassmorphism styling & animations
├── js/
│   ├── audio.js            # Procedural Web Audio API sound & haptics engine
│   ├── storage.js          # LocalStorage manager (scores, unlocks, achievements)
│   ├── daily.js            # Seeded PRNG & daily streak tracking
│   ├── particles.js        # Isometric particle effects (confetti, sparks, dust)
│   ├── renderer.js         # Isometric 2.5D canvas rendering & camera tracking
│   ├── game.js             # Core game state engine, slicing physics, and events
│   ├── share.js            # Web Share API & canvas score card generator
│   └── main.js             # Event wiring, UI state machine, game loop
├── icons/
│   ├── icon-192.png        # PWA app icon (192x192)
│   └── icon-512.png        # High-res PWA icon (512x512)
└── README.md               # Documentation
```

---

## 🚀 Local Development Setup

No build steps, compilers, or `node_modules` required. The game runs natively in any modern web browser.

### Option A: Using Python
```bash
# In the project root directory:
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

### Option B: Using Node.js
```bash
# Using npx serve:
npx serve .
```

### Option C: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## 🌐 Production Deployment

Since **ONE MORE BLOCK** is a static web app with zero dependencies, it can be deployed for free in seconds:

### Deploy to GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your game will be live at `https://<username>.github.io/<repo-name>/`.

### Deploy to Vercel or Netlify
- Drag and drop the project folder onto the **Netlify Drop** dashboard (`app.netlify.com/drop`), or
- Run `vercel` / `netlify deploy` in the project root.

---

## 📜 License

MIT License. Free to use, modify, and build upon.
