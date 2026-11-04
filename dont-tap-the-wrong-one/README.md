# DON'T TAP THE WRONG ONE ⚡🎮
### A Viral, Addictive, Mobile-First Neon Reflex Game

> **"Read the command. Avoid the tricks. Don't tap the wrong color!"**

**DON'T TAP THE WRONG ONE** is an ultra-fast, mobile-first browser game built with pure **HTML5, CSS3, and Vanilla JavaScript**. Designed around rapid cognitive dissonance, the Stroop effect, negative command logic, and tactile neon arcade feedback, it is immediately intuitive to pick up, intensely challenging to master, and engineered for viral social sharing.

---

## 🌟 Key Features

### 1. 🧠 Dynamic Cognitive Instruction Engine
Every single round generates a verified, unambiguous command from 10+ distinct challenge categories:
- **Direct Commands**: `"Tap RED"`, `"Tap BLUE"`
- **Negative Avoidance**: `"DON'T tap GREEN"`, `"Tap anything except YELLOW"`
- **Semantic Associations**: `"Tap the color of the sky"`, `"Tap the color of grass"`, `"Tap the color of a banana"`
- **Arcade Opposite Colors**: `"Tap the opposite of RED"` (Green), `"Tap the opposite of BLUE"` (Yellow)
- **Stroop Effect**: 
  - `"Tap the INK COLOR"` (Word reads *BLUE* but font glows in *RED*)
  - `"Read the WORD, ignore the ink!"`
- **Memory Challenges**: `"Tap the color from the PREVIOUS round!"`
- **Positional & Ordinals**: `"Tap the FIRST button"`, `"Tap the LAST button"`
- **Letter Count Puzzles**: `"Tap the color with 3 letters"` (RED), `"Tap the color with 6 letters"` (YELLOW)
- **Flashing Decoy Alerts**: Decoy button pulses on screen while prompt warns: `"IGNORE the flashing button! Tap GREEN"`
- **Glitch Corrections (Chaos Mode)**: Prompt starts fake `~~Tap BLUE~~`, then dynamically glitches into `"CORRECTION: Tap RED!"`
- **Double Negatives (Impossible Mode)**: `"Do NOT avoid RED!"`, `"DO NOT NOT tap GREEN!"`

### 2. 🕹️ Four Exciting Game Modes
| Mode | Description | Win / Lose Condition |
| :--- | :--- | :--- |
| **⚡ Classic Mode** | 30-second rapid sprint. Quick taps add bonus seconds to your clock! Earn combos and speed multipliers. | Wrong tap or 30s session timeout ends round. |
| **🌀 Chaos Mode** | Shifting buttons, glitch alerts, flashing decoy buttons, and continuous speed escalation. | Wrong tap or individual question timer timeout ends round. |
| **☠️ Impossible Mode** | Sub-second reaction windows (down to 750ms), reverse psychology, Stroop overload, memory chaining. | Wrong tap or timeout ends round. Hardcore reflexes only! |
| **📅 Daily Challenge** | Seeded deterministic challenge based on the calendar date (`YYYY-MM-DD`). Every player worldwide faces the exact same sequence today! | One try per day to set your highest global rank. |

### 3. 🎯 Combo & Scoring System
- **Base Score**: `+10` points per correct tap.
- **Speed Bonus**: Extra `+15` points for sub-350ms taps, `+10` for sub-600ms taps, `+5` for sub-1000ms taps.
- **Dynamic Combo Multiplier**: Scales smoothly from `x1.0` up to `x4.0` as streak grows.
- **Combo Milestones**: Every 5 consecutive taps triggers a milestone banner (`"COMBO x10! ON FIRE!"`) with bonus points.
- **Personal Best Tracking**: Automatically saves high scores, max streaks, accuracy %, and fastest reaction times to `localStorage`.

### 4. 🚀 Viral Growth & Social Sharing Architecture
- **Web Share API**: Native one-click mobile sharing with pre-formatted challenge text:
  > *"I scored 420 in DON'T TAP THE WRONG ONE (Chaos Mode)! 😂 Can you beat my reflexes? Beat my challenge code [CH-420-X89]: https://.../?challenge=CH-420-X89&challengerScore=420&mode=chaos"*
- **Dynamic HTML5 Canvas Score Card Generator**:
  - Automatically draws an 800x1000 high-resolution neon score card in real time.
  - Features player score, accuracy %, max streak, reflex speed in milliseconds, unique challenge code, and personalized humorous diagnosis/roast.
  - One-click **"Save Image"** (downloads PNG) and **"Copy Link"**.
- **Challenge URL Detection**: When a friend opens a challenge URL, the game greets them with an active banner: `⚔️ Friend Challenge: Beat 420 points in CHAOS mode!`.
- **Funny Failure Roasts**: Dynamic humor engine tailored to the cause of defeat (`"BRAIN BUFFERING 404"`, `"FINGER BETRAYAL"`, `"EMOTIONAL DAMAGE"`, `"ALMOST A GENIUS"`, `"CYBER REFLEXES"`).

### 5. 🔊 Procedural Web Audio & Haptic Feedback Engine
- Zero external audio files or network dependencies — procedural Web Audio API synthesizer.
- Dynamic pitch modulation: chime pitch ascends on the musical scale as combos increase.
- Custom waveforms for taps, combo fanfares, low-timer heartbeat pulses, error buzzes, and game-over falls.
- Mobile haptic vibration feedback via `navigator.vibrate()`.
- Persistent mute/unmute control.

### 6. 🏆 Progression & Retention
- **12 Unlockable Achievement Badges** (`First Blood`, `Speed Demon`, `On Fire!`, `Matrix Reflexes`, `Centurion`, `Chaos Conductor`, `Mission Impossible`, etc.).
- **5 Unlockable Aesthetic Themes**:
  1. *Cyberpunk Neon* (Default electric cyan, crimson, amber)
  2. *80s Synthwave* (Deep magenta, violet, sunset orange)
  3. *Terminal Matrix* (Monochrome phosphor green)
  4. *Candy Pastel Pop* (Soft marshmallow pastel hues)
  5. *Solar Flare* (Incandescent gold, fiery red)
- **Consecutive-day Login Streak** tracking for habit-forming daily play.

### 7. 📱 Progressive Web App (PWA) & Desktop Ready
- Responsive mobile-first design optimized for iOS Safari, Android Chrome, iPad, and desktop screens.
- **Desktop Keyboard Support**: Tapping `1`, `2`, `3`, `4` (or `Q`, `W`, `A`, `S`) triggers corresponding colored buttons.
- Installable to home screen via `manifest.json`.
- Offline caching via `sw.js` Service Worker.

---

## 📁 Project Structure

```text
Game/
├── index.html              # Mobile-first semantic UI & screen layouts
├── manifest.json           # PWA web app manifest
├── sw.js                   # Service Worker for 100% offline gameplay
├── css/
│   ├── main.css            # Dark neon theme variables, layout & resets
│   ├── components.css      # Buttons, HUD, modals, score cards, toasts
│   └── animations.css      # Screen shake, glitch effects, ripples, pulses
├── js/
│   ├── audio.js            # Procedural Web Audio API sound & haptics engine
│   ├── storage.js          # LocalStorage manager (scores, streaks, stats, themes)
│   ├── prompts.js          # Instruction engine with 10+ cognitive categories
│   ├── confetti.js         # Canvas particle confetti & fireworks physics
│   ├── cardGenerator.js    # Canvas score card image & viral challenge generator
│   ├── achievements.js     # Achievements system & unlock checker
│   ├── game.js             # Core game state machine, modes, timers & scoring
│   ├── ui.js               # UI controller, screen transitions, modal dialogs
│   └── app.js              # Bootloader, keyboard bindings & PWA registration
├── icons/
│   └── icon.svg            # Vector glowing neon button icon
└── tests/
    └── gameplay.test.js    # Automated Node test suite for mechanics & PRNG
```

---

## 🚀 How to Run Locally

Because the game uses modern browser features (Canvas, Web Audio API, Service Workers), it is recommended to run it through any simple local HTTP server:

### Option A: VS Code Live Server (Easiest)
1. Open the `Game` folder in VS Code.
2. Right click `index.html` and click **"Open with Live Server"**.

### Option B: Node.js (npx serve)
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

### Option C: Python 3
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option D: Direct Browser Open
You can also directly double-click `index.html` to open it in Chrome, Safari, Edge, or Firefox. (Note: Service Worker caching requires `http://` or `https://` protocol, but all gameplay, audio, canvas, and local storage work immediately).

---

## 🌐 Free 1-Click Deployment

This project is completely static (no backend database required for initial version) and can be deployed in 60 seconds to any free hosting provider:

### Deploy to Netlify
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the `Game` folder.
3. Your game is live with free HTTPS and global CDN!

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory and follow prompts.

### Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. In your repository, go to **Settings** > **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.

---

## 🧪 Running Automated Tests

Run the built-in test suite to verify prompt generation, PRNG seed determinism, combo multipliers, scoring, and achievement triggers:

```bash
node tests/gameplay.test.js
```

---

## 📜 License
MIT License. Built for viral fun and high-octane reflex competition!
