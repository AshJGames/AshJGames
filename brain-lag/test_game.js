/**
 * BRAIN LAG - Automated Verification & Test Suite
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("=== RUNNING BRAIN LAG TEST SUITE ===\n");

// 1. Check Question Bank
console.log("[Test 1] Verifying Master Question Bank...");
const questionsFile = fs.readFileSync(path.join(__dirname, 'js', 'questions.js'), 'utf8');

// Mock window
global.window = {};
eval(questionsFile);

const questions = window.BRAIN_QUESTIONS;
assert(Array.isArray(questions), "BRAIN_QUESTIONS must be an array");
assert(questions.length >= 150, `Expected at least 150 questions, found: ${questions.length}`);
console.log(`✓ Question bank verified: ${questions.length} questions.`);

const categories = {};
const ids = new Set();
questions.forEach((q, idx) => {
  assert(q.id, `Question at index ${idx} missing ID`);
  assert(!ids.has(q.id), `Duplicate ID found: ${q.id}`);
  ids.add(q.id);
  assert(q.text && q.text.length > 5, `Question ${q.id} text too short`);
  assert(Array.isArray(q.options) && q.options.length >= 2, `Question ${q.id} invalid options`);
  assert(typeof q.correct === 'number' && q.correct >= 0 && q.correct < q.options.length, `Question ${q.id} invalid correct index`);
  assert(q.explanation && q.explanation.length > 5, `Question ${q.id} missing explanation`);
  categories[q.category] = (categories[q.category] || 0) + 1;
});

console.log("Category breakdown:", categories);

// 2. Check HTML Element ID Consistency
console.log("\n[Test 2] Checking HTML ID consistency with JavaScript references...");
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const appJsContent = fs.readFileSync(path.join(__dirname, 'js', 'app.js'), 'utf8');

// Extract all getElementById calls in app.js
const idMatches = appJsContent.match(/getElementById\(['"]([^'"]+)['"]\)/g) || [];
const checkedIds = new Set();
idMatches.forEach(m => {
  const id = m.match(/getElementById\(['"]([^'"]+)['"]\)/)[1];
  if (!checkedIds.has(id)) {
    checkedIds.add(id);
    const exists = htmlContent.includes(`id="${id}"`);
    assert(exists, `DOM element ID "${id}" referenced in app.js was NOT found in index.html!`);
  }
});
console.log(`✓ All ${checkedIds.size} DOM element IDs referenced in app.js match index.html elements!`);

// 3. Test Storage Manager Logic
console.log("\n[Test 3] Testing Storage Manager logic...");
// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v.toString(); }
};

const storageJsContent = fs.readFileSync(path.join(__dirname, 'js', 'storage.js'), 'utf8');
eval(storageJsContent);

const sm = window.storageManager;
assert.strictEqual(sm.getHighScore('overthink'), 0);

// Record a game
const res1 = sm.recordGameEnd({
  mode: 'overthink',
  score: 450,
  streak: 6,
  correct: 8,
  total: 9,
  fastestReactionMs: 320
});

assert.strictEqual(res1.isNewHigh, true);
assert.strictEqual(res1.isNewStreak, true);
assert.strictEqual(sm.getHighScore('overthink'), 450);
assert.strictEqual(sm.data.stats.totalCorrect, 8);
assert(sm.data.achievements['streak_5'], "streak_5 achievement should be unlocked");
console.log("✓ Storage manager state, streaks, and achievement progression working perfectly!");

// 4. Test Share Engine Link Generation & Decoding
console.log("\n[Test 4] Testing Share Engine URL Generation & Parsing...");
// Mock window location & document for Node environment
global.document = {
  createElement: (tag) => {
    return {
      width: 0,
      height: 0,
      getContext: () => ({
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        fillRect: () => {},
        strokeRect: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        fillText: () => {},
        roundRect: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        arc: () => {}
      }),
      toDataURL: () => 'data:image/png;base64,mock'
    };
  }
};
window.location = {
  origin: "https://brainlag.game",
  pathname: "/play",
  search: "?challenge=1&mode=colorchaos&score=720&challenger=Sarah"
};

const shareJsContent = fs.readFileSync(path.join(__dirname, 'js', 'share.js'), 'utf8');
eval(shareJsContent);

const se = window.shareEngine;
const parsedChallenge = se.parseChallengeUrl();
assert.strictEqual(parsedChallenge.isChallenge, true);
assert.strictEqual(parsedChallenge.mode, 'colorchaos');
assert.strictEqual(parsedChallenge.targetScore, 720);
assert.strictEqual(parsedChallenge.challenger, 'Sarah');

const generatedUrl = se.createChallengeUrl({ mode: 'reflex', score: 950, playerName: 'Bob' });
assert(generatedUrl.includes('mode=reflex'));
assert(generatedUrl.includes('score=950'));
assert(generatedUrl.includes('challenger=Bob'));
console.log("✓ Challenge URL generation and parameter parsing verified!");

// 5. Check All Mode Files Exist and Syntax Is Clean
console.log("\n[Test 5] Checking syntax for all game modes...");
const modeFiles = ['overthink.js', 'colorchaos.js', 'memory.js', 'reflex.js', 'destroyer.js', 'daily.js'];
modeFiles.forEach(file => {
  const filePath = path.join(__dirname, 'js', 'modes', file);
  const code = fs.readFileSync(filePath, 'utf8');
  assert(code.length > 200, `Mode file ${file} is unexpectedly empty`);
  // Try evaluating to ensure syntax is valid
  new Function(code);
  console.log(`✓ Mode file verified clean: js/modes/${file}`);
});

console.log("\n=========================================");
console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (5/5)  ");
console.log("=========================================");
