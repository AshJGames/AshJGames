# 🧠 BRAIN LAG
> *"Your brain knows the answer... wait, NO!"*

A viral, addictive browser mini-game designed to challenge players' reflexes, working memory, lateral logic, attention, and ability to avoid obvious cognitive traps.

---

## 🌟 Features Overview

- **5 High-Octane Game Modes + Daily Brain Challenge**:
  1. **Don't Overthink**: 30-second rapid-fire trick question survival. One mistake ends the run!
  2. **Color Chaos**: The Stroop Effect on steroids. Identify font color, word meaning, or inverted rules as speed accelerates.
  3. **Memory Meltdown**: Flashing sequences of glowing cyber-pads. Memorize the pattern, then reproduce it forwards (and backwards!).
  4. **Reflex Rush**: Split-second visual reaction trials. Tap true targets, ignore decoys, and clock millisecond response times.
  5. **Brain Destroyer**: The ultimate gauntlet mixing all previous challenge types with unexpected inverted rules ("PICK THE WRONG ANSWER!").
  6. **Daily Challenge**: Seeded fixed 10-question gauntlet identical for every player worldwide each day (`YYYY-MM-DD`).

- **165+ Curated, Non-Ambiguous Questions**:
  - Handcrafted and verified across 6 categories: *Trick Questions*, *Fast Math*, *Logic Paradoxes*, *Wordplay*, *Visual Attention*, and *Common Sense Science Traps*.
  - Every question has one defensible, crystal-clear answer with a witty, educational explanation after mistakes.

- **Viral Social Features**:
  - **Dynamic Canvas Score Card Generator**: Generates an arcade 1200×630 share card complete with neon glowing logo, score, diagnosis title, performance stats, and mascot avatar.
  - **One-Click Web Share API & Clipboard Fallback**: Share directly to Instagram, WhatsApp, X (Twitter), Discord, or Messages.
  - **Friend Challenge Links (`?challenge=1&mode=...&score=...`)**: Friends who open your challenge link see a welcome banner and compete against your ghost score in real time!
  - **Funny Performance Diagnoses**: From `"404: Brain Not Found"` and `"Neurons On Vacation"` to `"200 IQ Galaxy Brain"`.

- **Audio & Visual Juice**:
  - **Zero-Dependency Web Audio API Procedural Synthesizer**: Instant zero-latency chimes, dissonant buzzes, countdown ticks, rising combo arpeggios, and victory fanfares without external audio file loading failures.
  - **Interactive Animated Brain Mascot**: Emotional expressions that react in real-time (idle breathing, squinting thought, 5x streak sunglasses, and shocked "X X" eyes with electric spark arcs).
  - **Confetti & Particle System**: Physics-driven confetti and sparks on combos, high scores, and new achievements.
  - **Screen Shake & Haptic Vibration**: Haptic feedback on supported mobile devices.

- **Progression & Retention**:
  - **14 Achievement Badges** to unlock (e.g., *Speed Demon*, *Galaxy Mind*, *Stroop Master*, *Zero Lag Run*).
  - **Unlockable Cyber Themes**: *Cyber Neon*, *Synth Sunset*, *Matrix Code*, and *Electric Candy*.
  - **Daily Login Streak**: Keeps track of consecutive daily plays.
  - **PWA Ready**: Offline Service Worker (`sw.js`) and Web Manifest (`manifest.json`) for full offline gameplay on mobile and desktop.

---

## 📁 Project Architecture

```
BRAIN LAG/
├── index.html               # Semantic HTML5 single-page arcade layout
├── manifest.json            # PWA web app manifest
├── sw.js                    # Service worker for offline caching
├── test_game.js             # Automated verification & test suite
├── build_questions.js       # Question generator & verification validator
├── README.md                # Documentation & deployment guide
├── css/
│   └── styles.css           # Modern cyber-arcade styling & animations
├── icons/
│   └── brain-icon.svg       # Vector PWA and favicon icon
└── js/
    ├── audio.js             # Web Audio API synthesizer engine
    ├── storage.js           # LocalStorage, progression & achievements
    ├── particles.js         # Canvas particles, confetti & mascot SVG controller
    ├── share.js             # Canvas score card generator & challenge link handler
    ├── questions.js         # Master bank of 165+ validated questions
    ├── app.js               # Central game loop, HUD & controller
    └── modes/
        ├── overthink.js     # Mode 1: Don't Overthink engine
        ├── colorchaos.js    # Mode 2: Color Chaos (Stroop) engine
        ├── memory.js        # Mode 3: Memory Meltdown engine
        ├── reflex.js        # Mode 4: Reflex Rush engine
        ├── destroyer.js     # Mode 5: Brain Destroyer gauntlet engine
        └── daily.js         # Daily seeded challenge engine
```

---

## 🕹️ Controls

- **Mouse / Touch**: Tap or click any answer button, cyber pad, or reflex target.
- **Keyboard (Desktop)**:
  - <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> — Select answer options or memory pads.
  - <kbd>Space</kbd> — Trigger reflex buttons or restart.
  - <kbd>Esc</kbd> — Close modals or return to menu.

---

## 🚀 Local Installation & Running

No complex build steps or dependencies required! BRAIN LAG is built with vanilla HTML5, CSS3, and JavaScript.

### Option 1: Direct File Launch
Double-click `index.html` to open directly in any modern browser (Chrome, Edge, Safari, Firefox).

### Option 2: Local HTTP Server (Recommended for PWA testing)
Using Python:
```bash
# Python 3
python -m http.server 8080
```
Or using Node.js:
```bash
npx serve .
# or
npx http-server -p 8080
```
Open `http://localhost:8080` in your browser.

---

## 🧪 Running the Automated Test Suite

To verify question bank validity, storage logic, and URL challenge parsing:
```bash
node test_game.js
```

---

## 🌐 Free Deployment Instructions

### 1. GitHub Pages (100% Free, Recommended)
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of BRAIN LAG"
   ```
2. Push to a GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/brain-lag.git
   git branch -M main
   git push -u origin main
   ```
3. Go to **Settings** > **Pages** in your repository.
4. Set source to **Deploy from a branch**, select branch `main` and folder `/(root)`, then click **Save**.
5. Your game will be live at `https://YOUR_USERNAME.github.io/brain-lag/`!

### 2. Vercel (1-Click Free Deployment)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory and follow the interactive prompts.
3. Your game is instantly deployed with global CDN caching.

### 3. Netlify (Drag & Drop)
1. Go to [netlify.com](https://www.netlify.com/).
2. Drag and drop the `BRAIN LAG` folder directly into the Netlify Sites dashboard.
3. Your game is live in 5 seconds with automatic SSL and custom domain support.

---

## 🧠 License
MIT License. Built for viral entertainment and cognitive training.
