/**
 * DON'T TAP THE WRONG ONE - Instruction & Question Engine
 * Generates verified, unambiguous, escalating cognitive challenges.
 */

const PALETTE = [
  { id: 'red', name: 'RED', hex: '#FF1744', glow: 'rgba(255, 23, 68, 0.7)', opposite: 'green', letters: 3 },
  { id: 'blue', name: 'BLUE', hex: '#00E5FF', glow: 'rgba(0, 229, 255, 0.7)', opposite: 'yellow', letters: 4 },
  { id: 'green', name: 'GREEN', hex: '#00E676', glow: 'rgba(0, 230, 118, 0.7)', opposite: 'red', letters: 5 },
  { id: 'yellow', name: 'YELLOW', hex: '#FFEA00', glow: 'rgba(255, 234, 0, 0.7)', opposite: 'blue', letters: 6 },
  { id: 'purple', name: 'PURPLE', hex: '#D500F9', glow: 'rgba(213, 0, 249, 0.7)', opposite: 'orange', letters: 6 },
  { id: 'orange', name: 'ORANGE', hex: '#FF6D00', glow: 'rgba(255, 109, 0, 0.7)', opposite: 'purple', letters: 6 }
];

const SEMANTIC_ITEMS = [
  { item: 'the sky', color: 'blue' },
  { item: 'ocean water', color: 'blue' },
  { item: 'a ripe banana', color: 'yellow' },
  { item: 'the midday sun', color: 'yellow' },
  { item: 'a juicy lemon', color: 'yellow' },
  { item: 'fresh spring grass', color: 'green' },
  { item: 'an emerald gemstone', color: 'green' },
  { item: 'a red apple', color: 'red' },
  { item: 'a fire truck', color: 'red' },
  { item: 'a ruby gem', color: 'red' },
  { item: 'a stop sign', color: 'red' }
];

// Seeded PRNG for Daily Challenge mode (Mulberry32)
function createRNG(seed) {
  let s = seed >>> 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class PromptEngine {
  constructor() {
    this.history = [];
    this.lastCorrectColor = null;
    this.prng = null; // null = standard Math.random
  }

  setSeed(seedNumber) {
    if (seedNumber !== null && seedNumber !== undefined) {
      this.prng = createRNG(seedNumber);
    } else {
      this.prng = null;
    }
  }

  random() {
    return this.prng ? this.prng() : Math.random();
  }

  randomChoice(arr) {
    if (!arr || arr.length === 0) return null;
    const idx = Math.floor(this.random() * arr.length);
    return arr[idx];
  }

  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Generate question tailored to round, mode, and available buttons
  generatePrompt(roundNumber, mode, availableButtonColors) {
    const activePalette = PALETTE.filter(p => availableButtonColors.includes(p.id));
    const isChaos = mode === 'chaos';
    const isImpossible = mode === 'impossible';

    // Eligible categories based on mode and round progression
    const availableCategories = ['DIRECT'];

    if (roundNumber >= 2 || isChaos || isImpossible) {
      availableCategories.push('NEGATIVE');
      availableCategories.push('SEMANTIC');
    }

    if (roundNumber >= 4 || isChaos || isImpossible) {
      availableCategories.push('OPPOSITE');
      availableCategories.push('LETTER_COUNT');
    }

    if ((roundNumber >= 6 && this.lastCorrectColor && availableButtonColors.includes(this.lastCorrectColor)) || isImpossible) {
      if (this.lastCorrectColor && availableButtonColors.includes(this.lastCorrectColor)) {
        availableCategories.push('MEMORY_PREV');
      }
    }

    if (roundNumber >= 7 || isChaos || isImpossible) {
      availableCategories.push('STROOP_INK');
      availableCategories.push('STROOP_WORD');
      availableCategories.push('POSITIONAL');
    }

    if (isChaos || (roundNumber >= 10 && !isImpossible)) {
      availableCategories.push('FLASHING_IGNORE');
      if (isChaos) {
        availableCategories.push('GLITCH_CORRECTION');
      }
    }

    if (isImpossible || (roundNumber >= 15 && isChaos)) {
      availableCategories.push('DOUBLE_NEGATIVE');
    }

    // Pick category
    const category = this.randomChoice(availableCategories);
    const promptData = this.buildQuestion(category, activePalette, availableButtonColors, roundNumber, mode);

    return promptData;
  }

  buildQuestion(category, activePalette, availableButtonColors, roundNumber, mode) {
    const colors = activePalette.map(p => p.id);
    let flashingColor = null;

    switch (category) {
      case 'DIRECT': {
        const target = this.randomChoice(activePalette);
        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'DIRECT',
          type: 'direct',
          mainText: `Tap ${target.name}`,
          highlightWord: target.name,
          highlightColor: target.hex,
          targetColors: [target.id],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.colorId === target.id,
            expected: target.name,
            explanation: `Instruction was to tap ${target.name}.`
          })
        };
      }

      case 'NEGATIVE': {
        const forbidden = this.randomChoice(activePalette);
        const phrasing = this.random() > 0.5
          ? `DON'T tap ${forbidden.name}`
          : `Tap anything except ${forbidden.name}`;

        const validColors = colors.filter(c => c !== forbidden.id);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'NEGATIVE',
          type: 'negative',
          mainText: phrasing,
          highlightWord: forbidden.name,
          highlightColor: forbidden.hex,
          targetColors: validColors,
          isNegative: true,
          validate: (btn) => ({
            isCorrect: btn.colorId !== forbidden.id,
            expected: `NOT ${forbidden.name}`,
            explanation: `You tapped ${forbidden.name}, but you were told to avoid it!`
          })
        };
      }

      case 'SEMANTIC': {
        // Find semantic items where the color is currently available on screen
        const eligibleItems = SEMANTIC_ITEMS.filter(item => availableButtonColors.includes(item.color));
        if (eligibleItems.length === 0) {
          return this.buildQuestion('DIRECT', activePalette, availableButtonColors, roundNumber, mode);
        }
        const picked = this.randomChoice(eligibleItems);
        const targetPalette = activePalette.find(p => p.id === picked.color);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'SEMANTIC',
          type: 'semantic',
          mainText: `Tap the color of ${picked.item}`,
          targetColors: [picked.color],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.colorId === picked.color,
            expected: targetPalette.name,
            explanation: `${picked.item.toUpperCase()} is ${targetPalette.name}!`
          })
        };
      }

      case 'OPPOSITE': {
        const primaryPairs = activePalette.filter(p => p.opposite && availableButtonColors.includes(p.opposite));
        if (primaryPairs.length === 0) {
          return this.buildQuestion('DIRECT', activePalette, availableButtonColors, roundNumber, mode);
        }
        const chosen = this.randomChoice(primaryPairs);
        const oppositeTarget = activePalette.find(p => p.id === chosen.opposite);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'OPPOSITE',
          type: 'opposite',
          mainText: `Tap the OPPOSITE of ${chosen.name}`,
          highlightWord: chosen.name,
          highlightColor: chosen.hex,
          targetColors: [oppositeTarget.id],
          isNegative: true,
          validate: (btn) => ({
            isCorrect: btn.colorId === oppositeTarget.id,
            expected: oppositeTarget.name,
            explanation: `The arcade opposite of ${chosen.name} is ${oppositeTarget.name}.`
          })
        };
      }

      case 'LETTER_COUNT': {
        // Letter count challenge (e.g. 3 letters -> RED, 4 -> BLUE, 5 -> GREEN, 6 -> YELLOW)
        const chosen = this.randomChoice(activePalette);
        const count = chosen.letters;
        const matchingColors = activePalette.filter(p => p.letters === count).map(p => p.id);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'LETTER_COUNT',
          type: 'letter_count',
          mainText: `Tap the color with ${count} letters`,
          targetColors: matchingColors,
          isNegative: false,
          validate: (btn) => ({
            isCorrect: matchingColors.includes(btn.colorId),
            expected: chosen.name,
            explanation: `${chosen.name} has exactly ${count} letters!`
          })
        };
      }

      case 'MEMORY_PREV': {
        if (!this.lastCorrectColor || !availableButtonColors.includes(this.lastCorrectColor)) {
          return this.buildQuestion('DIRECT', activePalette, availableButtonColors, roundNumber, mode);
        }
        const prevTarget = activePalette.find(p => p.id === this.lastCorrectColor);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'MEMORY',
          type: 'memory',
          mainText: `Tap the color from the PREVIOUS round!`,
          targetColors: [this.lastCorrectColor],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.colorId === this.lastCorrectColor,
            expected: prevTarget ? prevTarget.name : 'Previous Color',
            explanation: `The previous round's correct color was ${prevTarget?.name || 'unknown'}.`
          })
        };
      }

      case 'STROOP_INK': {
        // Stroop test: word says one color, but is rendered in another ink color!
        // Prompt asks: "Tap the INK COLOR:"
        const textChoice = this.randomChoice(activePalette);
        const inkChoices = activePalette.filter(p => p.id !== textChoice.id);
        const inkChoice = this.randomChoice(inkChoices);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'STROOP',
          type: 'stroop_ink',
          prefixText: 'Tap the INK COLOR:',
          stroopWord: textChoice.name,
          stroopInkHex: inkChoice.hex,
          mainText: `Tap the INK COLOR of the word below`,
          targetColors: [inkChoice.id],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.colorId === inkChoice.id,
            expected: inkChoice.name,
            explanation: `The word was printed in ${inkChoice.name} ink!`
          })
        };
      }

      case 'STROOP_WORD': {
        // Stroop test: word says one color, ink is another.
        // Prompt asks: "Tap the WORD, ignore the ink!"
        const textChoice = this.randomChoice(activePalette);
        const inkChoices = activePalette.filter(p => p.id !== textChoice.id);
        const inkChoice = this.randomChoice(inkChoices);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'STROOP',
          type: 'stroop_word',
          prefixText: 'Read the WORD (Ignore ink):',
          stroopWord: textChoice.name,
          stroopInkHex: inkChoice.hex,
          mainText: `Tap the word, IGNORE the ink color!`,
          targetColors: [textChoice.id],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.colorId === textChoice.id,
            expected: textChoice.name,
            explanation: `The word spelled out ${textChoice.name}!`
          })
        };
      }

      case 'POSITIONAL': {
        // Positional prompt: "Tap button #1", "Tap the first button", "Tap the LAST button"
        const count = availableButtonColors.length;
        const index = Math.floor(this.random() * count);
        const ordinals = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH'];
        const ordinalName = ordinals[index] || `Button #${index + 1}`;

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'POSITIONAL',
          type: 'positional',
          targetIndex: index,
          mainText: `Tap the ${ordinalName} button!`,
          targetColors: [availableButtonColors[index]],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.buttonIndex === index,
            expected: `${ordinalName} button`,
            explanation: `You tapped button #${btn.buttonIndex + 1} instead of the ${ordinalName} button!`
          })
        };
      }

      case 'FLASHING_IGNORE': {
        // A decoy button is flashing on screen!
        flashingColor = this.randomChoice(colors);
        const targetColor = this.randomChoice(colors.filter(c => c !== flashingColor));
        const targetPalette = activePalette.find(p => p.id === targetColor);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'DISTRACTION',
          type: 'flashing_ignore',
          flashingColorId: flashingColor,
          mainText: `IGNORE the flashing button! Tap ${targetPalette.name}`,
          targetColors: [targetColor],
          isNegative: true,
          validate: (btn) => ({
            isCorrect: btn.colorId === targetColor,
            expected: targetPalette.name,
            explanation: btn.colorId === flashingColor
              ? `You fell for the flashing decoy!`
              : `Target was ${targetPalette.name}.`
          })
        };
      }

      case 'GLITCH_CORRECTION': {
        // Glitched fake instruction: starts with one command, struck out, then replaced
        const fakeColor = this.randomChoice(activePalette);
        const realColor = this.randomChoice(activePalette.filter(p => p.id !== fakeColor.id));

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'GLITCH',
          type: 'glitch_correction',
          isGlitch: true,
          fakeText: `Tap ${fakeColor.name}`,
          mainText: `CORRECTION: Tap ${realColor.name}!`,
          targetColors: [realColor.id],
          isNegative: false,
          validate: (btn) => ({
            isCorrect: btn.colorId === realColor.id,
            expected: realColor.name,
            explanation: `The first prompt was fake! The real prompt was ${realColor.name}.`
          })
        };
      }

      case 'DOUBLE_NEGATIVE': {
        // Reverse logic brain-teaser
        const target = this.randomChoice(activePalette);
        const variations = [
          `Do NOT avoid ${target.name}!`,
          `Refuse to tap anything except ${target.name}!`,
          `DO NOT NOT tap ${target.name}!`
        ];
        const phrasing = this.randomChoice(variations);

        return {
          id: `p_${Date.now()}_${Math.random()}`,
          category: 'DOUBLE_NEGATIVE',
          type: 'double_negative',
          mainText: phrasing,
          highlightWord: target.name,
          highlightColor: target.hex,
          targetColors: [target.id],
          isNegative: true,
          validate: (btn) => ({
            isCorrect: btn.colorId === target.id,
            expected: target.name,
            explanation: `Double reverse logic: you actually had to tap ${target.name}!`
          })
        };
      }

      default:
        return this.buildQuestion('DIRECT', activePalette, availableButtonColors, roundNumber, mode);
    }
  }

  recordAnswer(colorId) {
    this.lastCorrectColor = colorId;
  }

  reset() {
    this.history = [];
    this.lastCorrectColor = null;
  }
}

window.COLOR_PALETTE = PALETTE;
window.gamePromptEngine = new PromptEngine();
