// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPLIT-FLAP ENGINE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&'-.,/";

function makeFlap() {
  const f = document.createElement('div');
  f.className = 'flap';
  f.dataset.ch = ' ';

  const upper = document.createElement('div');
  upper.className = 'flap-upper';
  const uT = document.createElement('span');
  uT.className = 'ft';
  uT.textContent = '\u00A0';
  upper.appendChild(uT);

  const lower = document.createElement('div');
  lower.className = 'flap-lower';
  const lT = document.createElement('span');
  lT.className = 'ft';
  lT.textContent = '\u00A0';
  lower.appendChild(lT);

  f.appendChild(upper);
  f.appendChild(lower);
  return f;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Flip one character slot to a new character (single step)
function flapTo(flapEl, ch) {
  return new Promise(resolve => {
    const upper = flapEl.querySelector('.flap-upper');
    const uT    = upper.querySelector('.ft');
    const lT    = flapEl.querySelector('.flap-lower .ft');
    const show  = ch === ' ' ? '\u00A0' : ch;

    upper.classList.remove('is-up', 'is-down');
    void upper.offsetWidth;
    upper.classList.add('is-down');

    setTimeout(() => {
      uT.textContent = show;
      lT.textContent = show;
      flapEl.dataset.ch = ch;
      upper.classList.remove('is-down');
      void upper.offsetWidth;
      upper.classList.add('is-up');
      upper.addEventListener('animationend', () => {
        upper.classList.remove('is-up');
        resolve();
      }, { once: true });
    }, 66);
  });
}

// Animate a row of flaps to show a target string
async function animateRowTo(rowEl, target, startDelay) {
  const flaps = rowEl.querySelectorAll('.flap');
  const padded = target.toUpperCase().padEnd(flaps.length, ' ').slice(0, flaps.length);

  const all = [...flaps].map((flapEl, i) => {
    const want = padded[i];
    const have = flapEl.dataset.ch || ' ';
    if (have === want) return Promise.resolve();

    const ci  = Math.max(0, CHARS.indexOf(have));
    const ei  = CHARS.indexOf(want);
    if (ei < 0) return Promise.resolve();
    const steps = (ei - ci + CHARS.length) % CHARS.length;
    const cycle = Math.min(steps, 5 + (Math.random() * 3 | 0));
    const start = steps > 8 ? (ei - cycle + CHARS.length) % CHARS.length : ci;

    return new Promise(resolve => {
      setTimeout(async () => {
        if (steps > 8) {
          // jump near the target, skip the long spin
          const sc = CHARS[start] === ' ' ? '\u00A0' : CHARS[start];
          flapEl.querySelector('.flap-upper .ft').textContent = sc;
          flapEl.querySelector('.flap-lower .ft').textContent = sc;
          flapEl.dataset.ch = CHARS[start];
        }
        let cur = start;
        while (cur !== ei) {
          cur = (cur + 1) % CHARS.length;
          await flapTo(flapEl, CHARS[cur]);
          await sleep(16);
        }
        resolve();
      }, startDelay + i * 48);
    });
  });

  return Promise.all(all);
}

// Build a flap row with n slots
function buildRow(rowEl, n) {
  for (let i = 0; i < n; i++) rowEl.appendChild(makeFlap());
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHRASES — 2 rows × ROW_LEN chars each
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ROW_LEN = 27;

const phrases = [
  { r1: "2ND YEAR COMPUTER SYSTEM",   r2: "& NETWORK STUDENT IN UM"},
  { r1: "CURRENTLY EXPLORING",        r2: "OSINT"},
  { r1: "INTERESTED IN",              r2: "JOINING CTFS"},
  { r1: "PASSIONATE ABOUT",           r2: "WEBSITE DEVELOPMENT"},
  { r1: "LEARNING SOFTWARE-DEFINED",  r2: "NETWORKING CONCEPTS"},
  { r1: "CONTINUOUSLY LEARNING",      r2: "EVERY DAY"},
];

const row1El  = document.getElementById('boardRow1');
const row2El  = document.getElementById('boardRow2');
const bTop1El = document.getElementById('bTop1');
const bTop2El = document.getElementById('bTop2');
const bBot1El = document.getElementById('bBot1');
const bBot2El = document.getElementById('bBot2');

[bTop1El, bTop2El, row1El, row2El, bBot1El, bBot2El].forEach(el => buildRow(el, ROW_LEN));

// ── Phrase cycling (middle 2 rows) ──────────────────────
let phraseIdx = 0;
let animating = false;

function centerText(str, len) {
  const s = str.toUpperCase().slice(0, len);
  const pad = len - s.length;
  return ' '.repeat(Math.floor(pad / 2)) + s + ' '.repeat(Math.ceil(pad / 2));
}

async function showPhrase(idx, delay) {
  if (animating) return;
  animating = true;
  const p = phrases[idx];
  await Promise.all([
    animateRowTo(row1El, centerText(p.r1, ROW_LEN), delay),
    animateRowTo(row2El, centerText(p.r2, ROW_LEN), delay + 80),
  ]);
  animating = false;
}

let boardActive = true;

showPhrase(0, 700);
let phraseInterval = setInterval(() => {
  phraseIdx = (phraseIdx + 1) % phrases.length;
  showPhrase(phraseIdx, 0);
}, 5000);

// ── Idle flicker on extra rows ───────────────────────────
// Occasionally tick a random flap to a random char then back to blank,
// simulating an idle Solari board.
function idleTick(rowEl, interval) {
  const flaps = [...rowEl.querySelectorAll('.flap')];
  async function tick() {
    if (!boardActive) { setTimeout(tick, 500); return; }
    const flapEl = flaps[Math.floor(Math.random() * flaps.length)];
    const ch = CHARS[1 + Math.floor(Math.random() * (CHARS.length - 1))];
    await flapTo(flapEl, ch);
    await sleep(120 + Math.random() * 250);
    await flapTo(flapEl, ' ');
    setTimeout(tick, interval * (0.6 + Math.random()));
  }
  setTimeout(tick, Math.random() * interval);
}

idleTick(bTop1El, 1100);
idleTick(bTop2El, 1400);
idleTick(bBot1El, 900);
idleTick(bBot2El, 1600);

window.setBoardActive = function (active) {
  boardActive = active;
  if (!active) {
    clearInterval(phraseInterval);
  } else {
    phraseInterval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      showPhrase(phraseIdx, 0);
    }, 5000);
  }
};
