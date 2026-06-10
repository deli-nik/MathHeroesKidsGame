'use strict';

/* ================= data ================= */

const SAVE_KEY = 'mathHeroes_v1';

const DIFFS = {
  easy:   { label: 'Easy',   sub: 'up to 10', lo: 3,  max: 10 },
  medium: { label: 'Medium', sub: 'up to 30', lo: 8,  max: 30 },
  hard:   { label: 'Hard',   sub: 'up to 50', lo: 20, max: 50 },
};

const STARS_TO_UNLOCK_WEB = 4;

const ZONES = {
  speedy: {
    key: 'speedy', name: 'Speedy Zone', hero: 'Sonic', op: 'add',
    item: 'ring', skill: 'Addition', theme: 'theme-speedy',
  },
  mushroom: {
    key: 'mushroom', name: 'Mushroom Kingdom', hero: 'Mario', op: 'sub',
    item: 'coin', skill: 'Subtraction', theme: 'theme-mushroom',
  },
  web: {
    key: 'web', name: 'Web City', hero: 'Spidey', op: 'mix',
    item: 'balloon', skill: 'Add & subtract', theme: 'theme-web',
  },
};

const QUESTIONS_PER_LEVEL = 5;

/* ================= save ================= */

let save = loadSave();

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.stars) {
        if (!s.difficulty) s.difficulty = 'easy';
        // Initialize new sub-levels
        for (let i = 2; i <= 5; i++) {
          if (s.stars[`speedy_${i}`] === undefined) s.stars[`speedy_${i}`] = 0;
          if (s.stars[`mushroom_${i}`] === undefined) s.stars[`mushroom_${i}`] = 0;
          if (s.stars[`web_${i}`] === undefined) s.stars[`web_${i}`] = 0;
        }
        return s;
      }
    }
  } catch (e) { /* fresh start */ }
  
  const defaultSave = { difficulty: 'easy', stars: { speedy: 0, mushroom: 0, web: 0 } };
  for (let i = 2; i <= 5; i++) {
    defaultSave.stars[`speedy_${i}`] = 0;
    defaultSave.stars[`mushroom_${i}`] = 0;
    defaultSave.stars[`web_${i}`] = 0;
  }
  return defaultSave;
}

function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
}

/* ================= progression & scoreboard helpers ================= */

function getPrevLevelKey(zoneKey) {
  const parts = zoneKey.split('_');
  const hero = parts[0];
  const num = parseInt(parts[1]);
  if (num === 2) return hero;
  return `${hero}_${num - 1}`;
}

function getStarsForHero(hero) {
  let sum = save.stars[hero] || 0;
  for (let i = 2; i <= 5; i++) {
    sum += save.stars[`${hero}_${i}`] || 0;
  }
  return sum;
}

function isNodeLocked(zoneKey) {
  if (zoneKey === 'speedy' || zoneKey === 'mushroom') return false;
  
  if (zoneKey.startsWith('speedy_')) {
    const prevKey = getPrevLevelKey(zoneKey);
    return save.stars[prevKey] === 0;
  }
  
  if (zoneKey.startsWith('mushroom_')) {
    const prevKey = getPrevLevelKey(zoneKey);
    return save.stars[prevKey] === 0;
  }
  
  if (zoneKey === 'web') {
    const earned = getStarsForHero('speedy') + getStarsForHero('mushroom');
    return earned < STARS_TO_UNLOCK_WEB;
  }
  
  if (zoneKey.startsWith('web_')) {
    const prevKey = getPrevLevelKey(zoneKey);
    return isNodeLocked(prevKey) || save.stars[prevKey] === 0;
  }
  
  return false;
}

function getHeroScoreboard(zonePrefix, difficulty) {
  let totalBest = 0;
  let totalLatest = 0;
  let hasAnyPlay = false;
  
  const suffixes = ['', '_2', '_3', '_4', '_5'];
  for (const suffix of suffixes) {
    const key = zonePrefix + suffix;
    const best = Records.allTimeBest(key, difficulty);
    const latest = Records.allTimeLatest(key, difficulty);
    if (best !== null) {
      totalBest += best;
      hasAnyPlay = true;
    }
    if (latest !== null) {
      totalLatest += latest;
    }
  }
  
  return hasAnyPlay ? { best: totalBest, latest: totalLatest } : null;
}

/* ================= daily score records ================= */

const RECORDS_KEY = 'mathHeroesRecords_v1';
const SCORE_MAX = 16000;
const SCORE_MIN = 1000;

const Records = {
  data: (() => {
    try {
      const raw = localStorage.getItem(RECORDS_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d && typeof d.days === 'object' && d.days) return d;
      }
    } catch (e) { /* fresh start */ }
    return { days: {} };
  })(),

  save() {
    try { localStorage.setItem(RECORDS_KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  },

  todayKey() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  },

  recordLevel(zoneKey, difficulty, score) {
    const day = this.data.days[this.todayKey()] || (this.data.days[this.todayKey()] = {});
    const compositeKey = `${zoneKey}_${difficulty}`;
    const z = day[compositeKey] || (day[compositeKey] = { best: 0, latest: 0, plays: 0 });
    z.best = Math.max(z.best, score);
    z.latest = score;
    z.plays += 1;
    this.save();
  },

  zoneToday(zoneKey, difficulty) {
    const day = this.data.days[this.todayKey()];
    if (!day) return null;
    const compositeKey = `${zoneKey}_${difficulty}`;
    return day[compositeKey] || day[zoneKey] || null;
  },

  allTimeBest(zoneKey, difficulty) {
    let max = 0;
    const compositeKey = `${zoneKey}_${difficulty}`;
    for (const day of Object.values(this.data.days)) {
      const record = day[compositeKey] || day[zoneKey];
      if (record && record.best > max) {
        max = record.best;
      }
    }
    return max > 0 ? max : null;
  },

  allTimeLatest(zoneKey, difficulty) {
    const sortedDates = Object.keys(this.data.days).sort().reverse();
    const compositeKey = `${zoneKey}_${difficulty}`;
    for (const dateKey of sortedDates) {
      const day = this.data.days[dateKey];
      const record = day[compositeKey] || day[zoneKey];
      if (record && record.latest) {
        return record.latest;
      }
    }
    return null;
  },

  deleteDay(dateKey) {
    delete this.data.days[dateKey];
    this.save();
  },
};

function questionScore(elapsedMs) {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(SCORE_MAX - elapsedMs)));
}

/* ================= helpers ================= */

const $ = (sel) => document.querySelector(sel);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];

function numWord(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10), o = n % 10;
  return TENS[t] + (o ? '-' + ONES[o] : '');
}

/* ================= speech ================= */

let voice = null;

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
  voice = vs.find((v) => /child|kid|junior|zira|aria|jenny|samantha/i.test(v.name)) || vs[0] || null;
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = pickVoice;
  pickVoice();
}

function say(text, { rate = 0.92, interrupt = true } = {}) {
  if (!('speechSynthesis' in window)) return;
  if (interrupt) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.rate = rate;
  u.pitch = 1.1;
  speechSynthesis.speak(u);
}

/* ================= sound effects ================= */

let audioCtx = null;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const c = ctx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur);
}

const sfx = {
  pop: () => tone(660 + Math.random() * 220, 0, 0.12, 'triangle', 0.12),
  correct: () => { tone(523, 0, 0.15); tone(659, 0.12, 0.15); tone(784, 0.24, 0.3); },
  oops: () => tone(196, 0, 0.35, 'sawtooth', 0.07),
  star: () => { tone(880, 0, 0.12, 'triangle'); tone(1175, 0.1, 0.25, 'triangle'); },
};

/* ================= character art ================= */

function sonicSVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Sonic">
    <path d="M58 14 L20 16 L44 34 L10 40 L40 54 L8 66 L40 72 L18 92 L50 86" fill="#1d4fd1"/>
    <circle cx="68" cy="60" r="40" fill="#2b6ae0"/>
    <ellipse cx="76" cy="78" rx="24" ry="17" fill="#f6cfa0"/>
    <ellipse cx="62" cy="52" rx="13" ry="18" fill="#fff"/>
    <ellipse cx="86" cy="52" rx="13" ry="18" fill="#fff"/>
    <circle cx="65" cy="56" r="5.5" fill="#1a8f3c"/>
    <circle cx="83" cy="56" r="5.5" fill="#1a8f3c"/>
    <circle cx="66.5" cy="54" r="2" fill="#fff"/>
    <circle cx="84.5" cy="54" r="2" fill="#fff"/>
    <ellipse cx="92" cy="70" rx="5" ry="4" fill="#222"/>
    <path d="M62 84 Q74 94 88 84" stroke="#9c6b33" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function marioSVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Mario">
    <circle cx="60" cy="66" r="38" fill="#f6cfa0"/>
    <path d="M22 56 Q24 22 60 20 Q96 22 98 56 L92 56 Q88 36 60 34 Q32 36 28 56 Z" fill="#e2231a"/>
    <rect x="18" y="52" width="84" height="12" rx="6" fill="#e2231a"/>
    <circle cx="60" cy="38" r="11" fill="#fff"/>
    <text x="60" y="44" text-anchor="middle" font-size="16" font-weight="bold" fill="#e2231a" font-family="Arial">M</text>
    <ellipse cx="46" cy="70" rx="6" ry="8" fill="#fff"/>
    <ellipse cx="74" cy="70" rx="6" ry="8" fill="#fff"/>
    <circle cx="47" cy="72" r="3.5" fill="#2b6ae0"/>
    <circle cx="73" cy="72" r="3.5" fill="#2b6ae0"/>
    <ellipse cx="60" cy="82" rx="9" ry="7" fill="#f0b27a"/>
    <path d="M42 90 Q50 84 60 90 Q70 84 78 90 Q70 98 60 94 Q50 98 42 90 Z" fill="#5a3a1a"/>
  </svg>`;
}

function spideySVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Spidey">
    <ellipse cx="60" cy="62" rx="40" ry="42" fill="#d42b2b"/>
    <g stroke="#8f1414" stroke-width="1.6" fill="none">
      <path d="M60 20 V104"/>
      <path d="M22 50 H98"/>
      <path d="M26 76 H94"/>
      <path d="M30 34 Q60 48 90 34"/>
      <path d="M22 62 Q60 76 98 62"/>
      <path d="M30 90 Q60 102 90 90"/>
      <path d="M38 24 L26 88"/>
      <path d="M82 24 L94 88"/>
    </g>
    <path d="M30 56 Q42 42 56 56 Q52 74 34 70 Q28 64 30 56 Z" fill="#fff" stroke="#111" stroke-width="3"/>
    <path d="M90 56 Q78 42 64 56 Q68 74 86 70 Q92 64 90 56 Z" fill="#fff" stroke="#111" stroke-width="3"/>
  </svg>`;
}

const HERO_SVG = { speedy: sonicSVG, mushroom: marioSVG, web: spideySVG };

/* ---------- full-body actors for the action scene ---------- */

function sonicBodySVG() {
  return `<svg viewBox="0 0 120 150" role="img" aria-label="Sonic running">
    <g class="leg leg-l">
      <rect x="50" y="104" width="7" height="24" rx="3.5" fill="#2b6ae0"/>
      <ellipse cx="51" cy="132" rx="13" ry="8" fill="#e2231a"/>
      <rect x="40" y="126" width="24" height="5" rx="2.5" fill="#fff"/>
    </g>
    <g class="leg leg-r">
      <rect x="64" y="104" width="7" height="24" rx="3.5" fill="#2b6ae0"/>
      <ellipse cx="70" cy="132" rx="13" ry="8" fill="#e2231a"/>
      <rect x="59" y="126" width="24" height="5" rx="2.5" fill="#fff"/>
    </g>
    <g class="hero-bob">
      <path d="M50 10 L18 12 L38 26 L10 32 L34 42 L8 52 L34 56 L16 70 L40 68" fill="#1d4fd1"/>
      <ellipse cx="60" cy="92" rx="17" ry="19" fill="#2b6ae0"/>
      <ellipse cx="60" cy="97" rx="10" ry="12" fill="#f6cfa0"/>
      <circle cx="62" cy="42" r="32" fill="#2b6ae0"/>
      <ellipse cx="70" cy="56" rx="19" ry="13" fill="#f6cfa0"/>
      <ellipse cx="57" cy="36" rx="10" ry="14" fill="#fff"/>
      <ellipse cx="76" cy="36" rx="10" ry="14" fill="#fff"/>
      <circle cx="60" cy="40" r="4.4" fill="#1a8f3c"/>
      <circle cx="74" cy="40" r="4.4" fill="#1a8f3c"/>
      <ellipse cx="82" cy="50" rx="4" ry="3.2" fill="#222"/>
      <path d="M58 62 Q68 69 78 61" stroke="#9c6b33" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function marioBodySVG() {
  return `<svg viewBox="0 0 120 160" role="img" aria-label="Mario">
    <g class="leg leg-l">
      <rect x="47" y="110" width="9" height="22" rx="4" fill="#2b6ae0"/>
      <ellipse cx="49" cy="137" rx="13" ry="8" fill="#5a3a1a"/>
    </g>
    <g class="leg leg-r">
      <rect x="64" y="110" width="9" height="22" rx="4" fill="#2b6ae0"/>
      <ellipse cx="71" cy="137" rx="13" ry="8" fill="#5a3a1a"/>
    </g>
    <g class="hero-bob">
      <rect x="36" y="74" width="48" height="20" rx="9" fill="#e2231a"/>
      <rect x="42" y="84" width="36" height="32" rx="10" fill="#2b6ae0"/>
      <rect x="48" y="76" width="6" height="14" fill="#2b6ae0"/>
      <rect x="66" y="76" width="6" height="14" fill="#2b6ae0"/>
      <circle cx="51" cy="92" r="3" fill="#f5b914"/>
      <circle cx="69" cy="92" r="3" fill="#f5b914"/>
      <circle cx="33" cy="90" r="7" fill="#f6cfa0"/>
      <circle cx="87" cy="90" r="7" fill="#f6cfa0"/>
      <circle cx="60" cy="44" r="28" fill="#f6cfa0"/>
      <path d="M32 38 Q34 14 60 12 Q86 14 88 38 L84 38 Q80 24 60 22 Q40 24 36 38 Z" fill="#e2231a"/>
      <rect x="26" y="34" width="68" height="10" rx="5" fill="#e2231a"/>
      <circle cx="60" cy="24" r="8" fill="#fff"/>
      <text x="60" y="29" text-anchor="middle" font-size="12" font-weight="bold" fill="#e2231a" font-family="Arial">M</text>
      <ellipse cx="50" cy="46" rx="4.5" ry="6" fill="#fff"/>
      <ellipse cx="70" cy="46" rx="4.5" ry="6" fill="#fff"/>
      <circle cx="51" cy="48" r="2.6" fill="#2b6ae0"/>
      <circle cx="69" cy="48" r="2.6" fill="#2b6ae0"/>
      <ellipse cx="60" cy="56" rx="7" ry="5.5" fill="#f0b27a"/>
      <path d="M46 62 Q52 58 60 62 Q68 58 74 62 Q68 69 60 66 Q52 69 46 62 Z" fill="#5a3a1a"/>
    </g>
  </svg>`;
}

function goombaSVG() {
  return `<svg viewBox="0 0 110 100" role="img" aria-label="Goomba">
    <ellipse class="foot foot-l" cx="34" cy="90" rx="17" ry="9" fill="#4a2e12"/>
    <ellipse class="foot foot-r" cx="76" cy="90" rx="17" ry="9" fill="#4a2e12"/>
    <g class="goomba-core">
      <path d="M55 4 Q100 6 104 50 Q104 68 88 70 L22 70 Q6 68 6 50 Q10 6 55 4 Z" fill="#9c5a24"/>
      <ellipse cx="55" cy="70" rx="32" ry="15" fill="#f3d9a4"/>
      <ellipse cx="42" cy="42" rx="8" ry="12" fill="#fff"/>
      <ellipse cx="68" cy="42" rx="8" ry="12" fill="#fff"/>
      <circle cx="44" cy="46" r="4" fill="#111"/>
      <circle cx="66" cy="46" r="4" fill="#111"/>
      <path d="M30 28 L52 36" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 28 L58 36" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <path d="M46 64 Q55 58 64 64" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function spideyBodySVG() {
  return `<svg viewBox="0 0 120 170" role="img" aria-label="Spidey hanging from a web">
    <rect x="56" y="0" width="8" height="26" rx="4" fill="#d42b2b"/>
    <circle cx="60" cy="2" r="6" fill="#d42b2b"/>
    <ellipse cx="60" cy="52" rx="26" ry="28" fill="#d42b2b"/>
    <g stroke="#8f1414" stroke-width="1.4" fill="none">
      <path d="M60 24 V80"/>
      <path d="M36 44 H84"/>
      <path d="M38 62 H82"/>
      <path d="M42 30 Q60 40 78 30"/>
      <path d="M34 52 Q60 62 86 52"/>
    </g>
    <path d="M40 48 Q48 38 58 48 Q55 60 42 57 Q38 53 40 48 Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
    <path d="M80 48 Q72 38 62 48 Q65 60 78 57 Q82 53 80 48 Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
    <path d="M48 80 Q60 76 72 80 L70 112 Q60 118 50 112 Z" fill="#d42b2b"/>
    <path d="M52 84 L60 92 L68 84 M60 92 V108" stroke="#8f1414" stroke-width="2" fill="none"/>
    <ellipse cx="60" cy="96" rx="5" ry="7" fill="#111"/>
    <path d="M50 112 L42 140 Q40 150 48 150 L52 150" stroke="#2b3a8f" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M70 112 L78 138 Q80 148 72 150 L68 150" stroke="#2b3a8f" stroke-width="11" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function tailsSVG() {
  return `<svg viewBox="0 0 130 110" role="img" aria-label="Tails flying">
    <g class="tail-fin tail-1">
      <path d="M78 58 Q112 38 128 16 Q120 48 94 66 Z" fill="#f2a33c"/>
      <path d="M128 16 Q117 34 106 46 L116 20 Z" fill="#fff"/>
    </g>
    <g class="tail-fin tail-2">
      <path d="M78 66 Q116 62 130 44 Q118 74 92 78 Z" fill="#f2a33c"/>
      <path d="M130 44 Q120 58 108 66 L120 46 Z" fill="#fff"/>
    </g>
    <ellipse cx="62" cy="70" rx="20" ry="16" fill="#f2a33c"/>
    <ellipse cx="58" cy="74" rx="11" ry="9" fill="#fff"/>
    <path d="M30 24 L22 6 L42 14 Z" fill="#f2a33c"/>
    <path d="M56 16 L64 2 L72 18 Z" fill="#f2a33c"/>
    <circle cx="48" cy="42" r="24" fill="#f2a33c"/>
    <ellipse cx="40" cy="52" rx="13" ry="9" fill="#fff"/>
    <ellipse cx="38" cy="38" rx="6" ry="9" fill="#fff"/>
    <ellipse cx="52" cy="38" rx="6" ry="9" fill="#fff"/>
    <circle cx="37" cy="40" r="3" fill="#2b6ae0"/>
    <circle cx="51" cy="40" r="3" fill="#2b6ae0"/>
    <circle cx="30" cy="48" r="2.6" fill="#222"/>
    <path d="M36 56 Q42 60 48 56" stroke="#9c6b33" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function knucklesSVG() {
  return `<svg viewBox="0 0 120 130" role="img" aria-label="Knuckles">
    <path d="M34 62 L14 96 L42 76 Z" fill="#d8333c"/>
    <path d="M48 70 L40 106 L60 78 Z" fill="#d8333c"/>
    <path d="M86 62 L106 96 L78 76 Z" fill="#d8333c"/>
    <path d="M72 70 L80 106 L60 78 Z" fill="#d8333c"/>
    <circle cx="60" cy="44" r="32" fill="#d8333c"/>
    <ellipse cx="60" cy="58" rx="17" ry="11" fill="#f6cfa0"/>
    <ellipse cx="52" cy="38" rx="8" ry="12" fill="#fff"/>
    <ellipse cx="68" cy="38" rx="8" ry="12" fill="#fff"/>
    <circle cx="55" cy="42" r="3.6" fill="#7a3cb4"/>
    <circle cx="65" cy="42" r="3.6" fill="#7a3cb4"/>
    <ellipse cx="60" cy="52" rx="3.4" ry="2.6" fill="#222"/>
    <path d="M52 64 Q60 69 68 64" stroke="#9c6b33" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="112" rx="17" ry="13" fill="#d8333c"/>
    <ellipse cx="86" cy="112" rx="17" ry="13" fill="#d8333c"/>
    <path d="M24 122 L28 114 L32 122 Z" fill="#fff"/>
    <path d="M34 122 L38 114 L42 122 Z" fill="#fff"/>
    <path d="M78 122 L82 114 L86 122 Z" fill="#fff"/>
    <path d="M88 122 L92 114 L96 122 Z" fill="#fff"/>
  </svg>`;
}

function yoshiSVG() {
  return `<svg viewBox="0 0 130 120" role="img" aria-label="Yoshi">
    <g class="tongue">
      <rect x="-78" y="76" width="88" height="11" rx="5.5" fill="#e0445c"/>
      <circle cx="-76" cy="81" r="8" fill="#e0445c"/>
    </g>
    <circle cx="82" cy="50" r="34" fill="#3cb44b"/>
    <ellipse cx="38" cy="74" rx="32" ry="24" fill="#fff"/>
    <path d="M38 50 Q70 38 92 56 L88 84 Q60 96 38 92 Z" fill="#3cb44b" opacity="0"/>
    <circle cx="70" cy="20" r="13" fill="#fff" stroke="#2a8a36" stroke-width="2"/>
    <circle cx="93" cy="20" r="13" fill="#fff" stroke="#2a8a36" stroke-width="2"/>
    <circle cx="66" cy="23" r="5" fill="#222"/>
    <circle cx="89" cy="23" r="5" fill="#222"/>
    <ellipse cx="22" cy="66" rx="3.5" ry="2.5" fill="#222"/>
    <path d="M14 86 Q34 96 58 90" stroke="#b03048" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M104 70 Q124 76 122 94 Q104 104 92 92 Z" fill="#e2231a"/>
    <path d="M104 70 Q124 76 122 94" stroke="#fff" stroke-width="4" fill="none"/>
  </svg>`;
}

function powerupSVG() {
  return `<svg viewBox="0 0 70 70" role="img" aria-label="Power-up mushroom">
    <path d="M35 4 Q64 6 66 34 Q66 42 58 42 L12 42 Q4 42 4 34 Q6 6 35 4 Z" fill="#e2231a"/>
    <circle cx="35" cy="17" r="8" fill="#fff"/>
    <circle cx="14" cy="32" r="6" fill="#fff"/>
    <circle cx="56" cy="32" r="6" fill="#fff"/>
    <rect x="20" y="42" width="30" height="20" rx="9" fill="#f6e3c0"/>
    <circle cx="29" cy="51" r="2.5" fill="#222"/>
    <circle cx="41" cy="51" r="2.5" fill="#222"/>
  </svg>`;
}

function crateSVG() {
  return `<svg viewBox="0 0 70 50" role="img" aria-label="Shop crate">
    <rect x="2" y="2" width="66" height="46" rx="5" fill="#c8965a" stroke="#8f5a1f" stroke-width="3"/>
    <path d="M4 4 L66 46 M66 4 L4 46" stroke="#8f5a1f" stroke-width="3"/>
  </svg>`;
}

/* ================= action scene controller ================= */

const SceneFX = {
  root: null,
  hero: null,
  goomba: null,
  rig: null,
  zoneKey: null,
  runTimer: null,
  pile: [],

  setup(zone) {
    this.zoneKey = zone.key;
    this.pile = [];
    const root = (this.root = $('#action-scene'));
    root.className = 'action-scene scene-' + zone.key;
    root.innerHTML = '<div class="hills"></div><div class="ground"></div>';
    this.hero = null;
    this.goomba = null;
    this.rig = null;
    this.tails = null;
    this.knuckles = null;
    this.yoshi = null;
    this.shroom = null;
    this.tailsVisible = false;
    if (zone.key === 'speedy') {
      root.insertAdjacentHTML('beforeend',
        `<div class="actor hero">${sonicBodySVG()}</div><div class="actor tails">${tailsSVG()}</div><div class="actor knuckles">${knucklesSVG()}</div>`);
      this.hero = root.querySelector('.hero');
      this.tails = root.querySelector('.tails');
      this.knuckles = root.querySelector('.knuckles');
    } else if (zone.key === 'mushroom') {
      root.insertAdjacentHTML('beforeend',
        `<div class="qblock">?</div><div class="actor hero">${marioBodySVG()}</div><div class="actor goomba">${goombaSVG()}</div><div class="actor yoshi">${yoshiSVG()}</div>`);
      this.hero = root.querySelector('.hero');
      this.goomba = root.querySelector('.goomba');
      this.yoshi = root.querySelector('.yoshi');
    } else {
      root.insertAdjacentHTML('beforeend',
        `<div class="swing-rig"><div class="thread"></div>${spideyBodySVG()}</div>`);
      this.rig = root.querySelector('.swing-rig');
    }
  },

  spawnFx(left, bottom) {
    if (!this.root) return null;
    const el = document.createElement('div');
    el.className = 'fx-item';
    el.innerHTML = itemSVG(ZONES[this.zoneKey].item, randInt(0, 5));
    el.style.left = left + 'px';
    if (bottom != null) el.style.bottom = bottom + 'px';
    this.root.appendChild(el);
    return el;
  },

  startRun() {
    if (!this.root) return;
    this.root.classList.add('scroll-fast');
    if (this.hero) this.hero.classList.add('running');
  },

  stopRunSoon() {
    clearTimeout(this.runTimer);
    this.runTimer = setTimeout(() => {
      if (this.root) this.root.classList.remove('scroll-fast');
      if (this.hero) this.hero.classList.remove('running');
    }, 900);
  },

  ringIn() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(root.clientWidth + 20);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = '120px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 580);
    setTimeout(() => { el.remove(); }, 1050);
  },

  balloonIn() {
    const root = this.root;
    if (!root) return;
    const target = root.clientWidth * 0.44 + 14;
    const el = this.spawnFx(root.clientWidth + 20, 70);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = target + 'px';
      el.style.bottom = '95px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 600);
    setTimeout(() => { el.remove(); }, 1100);
  },

  balloonOut() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(root.clientWidth * 0.44 + randInt(-20, 40), 95);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('float-up');
    }));
    setTimeout(() => { el.remove(); }, 1500);
  },

  makePile(count) {
    if (!this.root || this.zoneKey !== 'mushroom') return;
    for (let i = 0; i < count; i++) {
      const col = i % 4, row = Math.floor(i / 4);
      const el = this.spawnFx(180 + col * 26, 44 + row * 24);
      if (el) this.pile.push(el);
    }
  },

  async goombaEnter() {
    const g = this.goomba;
    if (!g) return;
    this.goombaVisible = true;
    g.classList.add('walking');
    g.style.left = '300px';
    await sleep(1150);
    if (g.isConnected) g.classList.remove('walking');
  },

  goombaExit() {
    const g = this.goomba;
    this.goombaVisible = false;
    if (!g || !g.isConnected) return;
    g.classList.add('walking');
    g.style.left = '105%';
    setTimeout(() => { if (g.isConnected) g.classList.remove('walking'); }, 1200);
  },

  stealOne() {
    const el = this.pile.pop();
    if (!el || !el.isConnected) return;
    el.style.left = '310px';
    el.style.bottom = '78px';
    setTimeout(() => { el.classList.add('pop'); }, 420);
    setTimeout(() => { el.remove(); }, 900);
  },

  clearPile() {
    this.pile.forEach((el) => el.remove());
    this.pile = [];
  },

  clearProps() {
    if (!this.root) return;
    this.root.querySelectorAll('.fx-prop').forEach((el) => el.remove());
    this.shroom = null;
    this.tailsVisible = false;
    if (this.tails && this.tails.isConnected) this.tails.style.left = '105%';
    if (this.knuckles && this.knuckles.isConnected) this.knuckles.style.bottom = '-130px';
    if (this.yoshi && this.yoshi.isConnected) {
      this.yoshi.style.left = '105%';
      this.yoshi.classList.remove('lick', 'walking');
    }
  },

  async knucklesEnter() {
    const k = this.knuckles;
    if (!k) return;
    k.style.bottom = '34px';
    await sleep(850);
  },

  knucklesExit() {
    const k = this.knuckles;
    if (!k || !k.isConnected) return;
    setTimeout(() => { if (k.isConnected) k.style.bottom = '-130px'; }, 500);
  },

  digRing() {
    if (!this.root) return;
    const el = this.spawnFx(286, 26);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = '236px';
      el.style.bottom = '128px';
    }));
    setTimeout(() => {
      if (!el.isConnected) return;
      el.style.left = '122px';
      el.style.bottom = '62px';
    }, 320);
    setTimeout(() => { el.classList.add('pop'); }, 880);
    setTimeout(() => { el.remove(); }, 1350);
  },

  async yoshiEnter() {
    const y = this.yoshi;
    if (!y) return;
    y.classList.add('walking');
    y.style.left = '296px';
    await sleep(1150);
    if (y.isConnected) y.classList.remove('walking');
  },

  yoshiExit() {
    const y = this.yoshi;
    if (!y || !y.isConnected) return;
    y.classList.remove('lick');
    y.classList.add('walking');
    y.style.left = '105%';
    setTimeout(() => { if (y.isConnected) y.classList.remove('walking'); }, 1200);
  },

  yoshiEat() {
    const y = this.yoshi;
    const el = this.pile.pop();
    if (!el || !el.isConnected) return;
    if (y && y.isConnected) {
      y.classList.add('lick');
      setTimeout(() => { if (y.isConnected) y.classList.remove('lick'); }, 260);
    }
    el.style.left = '296px';
    el.style.bottom = '60px';
    setTimeout(() => { el.classList.add('pop'); }, 380);
    setTimeout(() => { el.remove(); }, 850);
  },

  balloonRise() {
    const root = this.root;
    if (!root) return;
    const target = root.clientWidth * 0.44 + 14;
    const el = this.spawnFx(target + randInt(-30, 50), 6);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = target + 'px';
      el.style.bottom = '95px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 650);
    setTimeout(() => { el.remove(); }, 1150);
  },

  balloonZip() {
    const root = this.root;
    if (!root) return;
    const target = root.clientWidth * 0.44 + 14;
    const el = this.spawnFx(root.clientWidth + 20, randInt(80, 110));
    if (!el) return;
    el.classList.add('zip');
    sfx.pop();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = target + 'px';
      el.style.bottom = '95px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 340);
    setTimeout(() => { el.remove(); }, 800);
  },

  balloonBurst() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(root.clientWidth * 0.44 + randInt(-30, 50), randInt(85, 110));
    if (!el) return;
    setTimeout(() => { if (el.isConnected) el.classList.add('burst'); }, 220);
    setTimeout(() => { el.remove(); }, 650);
  },

  balloonDrift() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(root.clientWidth * 0.44 + randInt(-20, 50), 95);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('drift');
    }));
    setTimeout(() => { el.remove(); }, 1450);
  },

  async tailsEnter() {
    const t = this.tails;
    if (!t) return;
    this.tailsVisible = true;
    t.style.left = '215px';
    await sleep(1100);
  },

  tailsExit() {
    this.tailsVisible = false;
    const t = this.tails;
    if (!t || !t.isConnected) return;
    t.style.left = '105%';
  },

  tailsDrop() {
    if (!this.root) return;
    const el = this.spawnFx(232, 112);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = '122px';
      el.style.bottom = '62px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 600);
    setTimeout(() => { el.remove(); }, 1100);
  },

  shopAppear() {
    if (!this.root) return;
    const crate = document.createElement('div');
    crate.className = 'fx-prop';
    crate.style.cssText = 'left:322px;bottom:40px;width:70px;';
    crate.innerHTML = crateSVG();
    this.root.appendChild(crate);
    const m = document.createElement('div');
    m.className = 'fx-prop shroom';
    m.style.cssText = 'left:332px;bottom:84px;width:50px;';
    m.innerHTML = powerupSVG();
    this.root.appendChild(m);
    this.shroom = m;
  },

  spendOne() {
    const el = this.pile.pop();
    if (!el || !el.isConnected) return;
    el.style.left = '346px';
    el.style.bottom = '96px';
    setTimeout(() => { el.classList.add('pop'); }, 420);
    setTimeout(() => { el.remove(); }, 900);
  },

  collectPowerup() {
    const m = this.shroom;
    if (!m || !m.isConnected) return;
    m.style.left = '104px';
    m.style.bottom = '76px';
    setTimeout(() => {
      if (!m.isConnected) return;
      m.classList.add('pop');
      sfx.star();
      if (this.hero && this.hero.isConnected) {
        this.hero.classList.add('jump');
        setTimeout(() => { if (this.hero) this.hero.classList.remove('jump'); }, 900);
      }
    }, 1000);
    setTimeout(() => { m.remove(); }, 1600);
  },

  celebrate() {
    if (this.zoneKey === 'speedy' && this.hero) {
      const hero = this.hero;
      this.root.classList.add('scroll-fast');
      hero.classList.add('spin');
      setTimeout(() => {
        if (hero.isConnected) hero.classList.remove('spin');
        if (this.root) this.root.classList.remove('scroll-fast');
      }, 1550);
    } else if (this.zoneKey === 'mushroom' && this.hero) {
      const hero = this.hero;
      const block = this.root.querySelector('.qblock');
      hero.classList.add('jump');
      setTimeout(() => {
        if (block) block.classList.add('bonk');
        sfx.star();
        const coin = this.spawnFx(96, 130);
        if (coin) {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            coin.style.bottom = '175px';
            coin.classList.add('pop');
          }));
          setTimeout(() => coin.remove(), 800);
        }
      }, 320);
      setTimeout(() => {
        if (hero.isConnected) hero.classList.remove('jump');
        if (block && block.isConnected) block.classList.remove('bonk');
      }, 900);
    } else if (this.zoneKey === 'web' && this.rig) {
      const rig = this.rig;
      rig.classList.add('big-swing');
      setTimeout(() => { if (rig.isConnected) rig.classList.remove('big-swing'); }, 1750);
    }
  },

  reactWrong() {
    const a = this.hero || this.rig;
    if (a) {
      a.classList.add('wobble');
      setTimeout(() => a.classList.remove('wobble'), 600);
    }
    if (this.goombaVisible && this.goomba && this.goomba.isConnected) {
      this.goomba.classList.add('laugh');
      setTimeout(() => this.goomba.classList.remove('laugh'), 1000);
    }
  },
};

/* ================= item art ================= */

const BALLOON_COLORS = ['#e25c5c', '#4d9be6', '#f5b914', '#8a6fe8', '#3cb44b', '#ef7fb1'];

function itemSVG(item, i) {
  if (item === 'ring') {
    return `<svg viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="13" fill="none" stroke="#f5b914" stroke-width="8"/>
      <circle cx="20" cy="20" r="17" fill="none" stroke="#c98f08" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#c98f08" stroke-width="1.5"/>
      <path d="M12 13 A11 11 0 0 1 20 9" stroke="#fde9a8" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  if (item === 'coin') {
    return `<svg viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="17" fill="#f8c930" stroke="#c98f08" stroke-width="3"/>
      <circle cx="20" cy="20" r="11" fill="none" stroke="#c98f08" stroke-width="2"/>
      <path d="M20 13 L22 18 L27 18 L23 21.5 L24.5 27 L20 23.8 L15.5 27 L17 21.5 L13 18 L18 18 Z" fill="#c98f08"/>
    </svg>`;
  }
  const c = BALLOON_COLORS[i % BALLOON_COLORS.length];
  return `<svg viewBox="0 0 40 40">
    <ellipse cx="20" cy="15" rx="12" ry="14" fill="${c}"/>
    <ellipse cx="16" cy="10" rx="3.5" ry="5" fill="rgba(255,255,255,0.45)"/>
    <path d="M20 29 L17 33 L23 33 Z" fill="${c}"/>
    <path d="M20 33 Q16 36 20 39" stroke="#888" stroke-width="1.5" fill="none"/>
  </svg>`;
}

/* ================= sentences ================= */

function sentenceFor(zone, op, a, b) {
  const it = (n) => `${n === 1 ? zone.item : zone.item + 's'}`;
  if (zone.key === 'speedy') {
    return pick([
      {
        fx: 'zoom',
        text: `Sonic has <b class="num">${a}</b> ${it(a)}. He zooms ahead and grabs <b class="num">${b}</b> more!`,
        suffix: 'How many rings now?',
      },
      {
        fx: 'tails',
        text: `Sonic finds <b class="num">${a}</b> ${it(a)}. Tails flies in with <b class="num">${b}</b> more!`,
        suffix: 'How many rings now?',
      },
      {
        fx: 'knuckles',
        text: `Sonic has <b class="num">${a}</b> ${it(a)}. Knuckles digs up <b class="num">${b}</b> more!`,
        suffix: 'How many rings now?',
      },
    ]);
  }
  if (zone.key === 'mushroom') {
    return pick([
      {
        fx: 'shop',
        text: `Mario has <b class="num">${a}</b> ${it(a)}. He spends <b class="num">${b}</b> on a power-up!`,
        suffix: 'How many coins are left?',
      },
      {
        fx: 'goomba',
        text: `Mario has <b class="num">${a}</b> ${it(a)}. A sneaky Goomba takes <b class="num">${b}</b>!`,
        suffix: 'How many coins are left?',
      },
      {
        fx: 'yoshi',
        text: `Mario has <b class="num">${a}</b> ${it(a)}. Yoshi is hungry and gobbles <b class="num">${b}</b>!`,
        suffix: 'How many coins are left?',
      },
    ]);
  }
  if (op === 'add') {
    return pick([
      {
        fx: 'catch',
        text: `Spidey catches <b class="num">${a}</b> ${it(a)}. He swings and grabs <b class="num">${b}</b> more!`,
        suffix: 'How many balloons now?',
      },
      {
        fx: 'zip',
        text: `Spidey has <b class="num">${a}</b> ${it(a)}. Thwip! He webs <b class="num">${b}</b> more!`,
        suffix: 'How many balloons now?',
      },
      {
        fx: 'rise',
        text: `Spidey holds <b class="num">${a}</b> ${it(a)}. <b class="num">${b}</b> more float up from the street!`,
        suffix: 'How many balloons now?',
      },
    ]);
  }
  return pick([
    {
      fx: 'away',
      text: `Spidey holds <b class="num">${a}</b> ${it(a)}. Whoosh! <b class="num">${b}</b> float away!`,
      suffix: 'How many balloons are left?',
    },
    {
      fx: 'burst',
      text: `Spidey has <b class="num">${a}</b> ${it(a)}. Pop! <b class="num">${b}</b> balloons burst!`,
      suffix: 'How many balloons are left?',
    },
    {
      fx: 'drift',
      text: `Spidey has <b class="num">${a}</b> ${it(a)}. He gives <b class="num">${b}</b> to kids below!`,
      suffix: 'How many balloons are left?',
    },
  ]);
}

/* ================= question generation ================= */

function makeQuestion(zone) {
  const d = DIFFS[save.difficulty];
  const op = zone.op === 'mix' ? (Math.random() < 0.5 ? 'add' : 'sub') : zone.op;
  let a, b, result;
  if (op === 'add') {
    result = randInt(d.lo, d.max);
    a = randInt(1, result - 1);
    b = result - a;
  } else {
    a = randInt(d.lo, d.max);
    b = randInt(1, a - 1);
    result = a - b;
  }
  const set = new Set([result]);
  const pool = [result + 1, result - 1, result + 2, result - 2, result + 10, result - 10, a, b]
    .filter((x) => x >= 0 && x !== result);
  shuffle(pool);
  for (const p of pool) { if (set.size < 3) set.add(p); }
  let filler = result + 3;
  while (set.size < 3) set.add(filler++);
  const sent = sentenceFor(zone, op, a, b);
  return { op, a, b, result, choices: shuffle([...set]), ...sent };
}

/* ================= screens ================= */

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $('#screen-' + name).classList.add('active');
}

/* ---------- map ---------- */

let selectedZoneKey = 'speedy';

function selectNode(zoneKey, speak = true) {
  const locked = isNodeLocked(zoneKey);
  
  if (locked) {
    if (speak) {
      if (zoneKey.startsWith('web') && isNodeLocked('web')) {
        const earned = getStarsForHero('speedy') + getStarsForHero('mushroom');
        say(`Earn ${STARS_TO_UNLOCK_WEB} stars with Sonic and Mario to unlock Web City!`);
      } else {
        say("Beat the previous level to unlock this level!");
      }
    }
    showTooltipForLockedNode(zoneKey);
    return;
  }
  
  selectedZoneKey = zoneKey;
  
  document.querySelectorAll('.map-node').forEach((n) => n.classList.remove('active'));
  
  const activeNode = $('#node-' + zoneKey);
  if (activeNode) {
    activeNode.classList.add('active');
    positionTooltip(activeNode, zoneKey);
    activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  
  if (speak) {
    const baseKey = zoneKey.split('_')[0];
    const zone = ZONES[baseKey];
    const displayNum = zoneKey.includes('_') ? ` ${zoneKey.split('_')[1]}` : ' 1';
    say(`${zone.name}${displayNum}! ${zone.skill} with ${zone.hero}.`);
  }
}

function positionTooltip(node, zoneKey) {
  const tooltip = $('#map-tooltip');
  if (!tooltip) return;
  
  const baseKey = zoneKey.split('_')[0];
  const zone = ZONES[baseKey];
  const stars = save.stars[zoneKey] || 0;
  const best = Records.allTimeBest(zoneKey, save.difficulty);
  const latest = Records.allTimeLatest(zoneKey, save.difficulty);
  const fmt = (n) => n.toLocaleString();
  
  const content = $('#tooltip-content');
  const displayNum = zoneKey.includes('_') ? ` ${zoneKey.split('_')[1]}` : ' 1';
  content.innerHTML = `
    <h4 class="tooltip-title">${zone.name}${displayNum}</h4>
    <p class="tooltip-skill">${zone.skill} with ${zone.hero}</p>
    <div class="tooltip-stars">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}</div>
    <div class="tooltip-scores">
      <span>Best: <b>${best !== null ? fmt(best) : '—'}</b></span>
      <span>Latest: <b>${latest !== null ? fmt(latest) : '—'}</b></span>
    </div>
    <button class="tooltip-play-btn" id="btn-play-level">PLAY</button>
  `;
  
  $('#btn-play-level').onclick = () => {
    tooltip.classList.remove('active');
    startZone(zoneKey);
  };
  
  const x = node.offsetLeft + node.clientWidth / 2;
  const y = node.offsetTop;
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y - 12}px`;
  tooltip.classList.add('active');
}

function showTooltipForLockedNode(zoneKey) {
  const node = $('#node-' + zoneKey);
  const tooltip = $('#map-tooltip');
  if (!node || !tooltip) return;
  
  const baseKey = zoneKey.split('_')[0];
  const zone = ZONES[baseKey];
  const content = $('#tooltip-content');
  
  if (zoneKey.startsWith('web') && isNodeLocked('web')) {
    const earned = getStarsForHero('speedy') + getStarsForHero('mushroom');
    content.innerHTML = `
      <h4 class="tooltip-title">${zone.name}</h4>
      <p class="tooltip-skill">${zone.skill} with ${zone.hero}</p>
      <div class="tooltip-stars" style="color: #888;">☆☆☆</div>
      <div class="tooltip-lock-note">🔒 Earn ${STARS_TO_UNLOCK_WEB} stars to unlock!<br>(${earned} / ${STARS_TO_UNLOCK_WEB} earned)</div>
    `;
  } else {
    const displayNum = zoneKey.includes('_') ? ` ${zoneKey.split('_')[1]}` : ' 1';
    content.innerHTML = `
      <h4 class="tooltip-title">${zone.name}${displayNum}</h4>
      <p class="tooltip-skill">${zone.skill} with ${zone.hero}</p>
      <div class="tooltip-stars" style="color: #888;">☆☆☆</div>
      <div class="tooltip-lock-note">🔒 Beat the previous level to unlock!</div>
    `;
  }
  
  const x = node.offsetLeft + node.clientWidth / 2;
  const y = node.offsetTop;
  
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y - 12}px`;
  tooltip.classList.add('active');
  
  document.querySelectorAll('.map-node').forEach((n) => n.classList.remove('active'));
  node.classList.add('active');
}

function hideTooltip() {
  const tooltip = $('#map-tooltip');
  if (tooltip) tooltip.classList.remove('active');
}

function renderMap() {
  const diffRow = $('#difficulty-row');
  diffRow.innerHTML = '';
  for (const [key, d] of Object.entries(DIFFS)) {
    const btn = document.createElement('button');
    btn.className = 'diff-btn' + (save.difficulty === key ? ' selected' : '');
    btn.innerHTML = `${d.label}<small>numbers ${d.sub}</small>`;
    btn.onclick = () => {
      save.difficulty = key;
      persist();
      renderMap();
      say(`${d.label} mode! Numbers ${d.sub}.`);
    };
    diffRow.appendChild(btn);
  }

  // Set all 15 node faces
  const heroes = ['speedy', 'mushroom', 'web'];
  for (const hero of heroes) {
    const faceEl = $('#face-' + hero);
    if (faceEl) faceEl.innerHTML = HERO_SVG[hero]();
    for (let i = 2; i <= 5; i++) {
      const subFaceEl = $('#face-' + hero + '_' + i);
      if (subFaceEl) subFaceEl.innerHTML = HERO_SVG[hero]();
    }
  }

  // Build the list of all 15 zone keys
  const allZoneKeys = [];
  for (const hero of heroes) {
    allZoneKeys.push(hero);
    for (let i = 2; i <= 5; i++) {
      allZoneKeys.push(`${hero}_${i}`);
    }
  }

  const earned = getStarsForHero('speedy') + getStarsForHero('mushroom');
  const webLocked = earned < STARS_TO_UNLOCK_WEB;

  // Render stars for all 15 nodes
  for (const zoneKey of allZoneKeys) {
    const stars = save.stars[zoneKey] || 0;
    const starsText = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
    const starEl = $(`#stars-${zoneKey}`);
    if (starEl) starEl.textContent = starsText;
  }

  // Update locked states for all 15 nodes
  for (const zoneKey of allZoneKeys) {
    const nodeEl = $(`#node-${zoneKey}`);
    if (nodeEl) {
      const locked = isNodeLocked(zoneKey);
      if (locked) {
        nodeEl.classList.add('locked');
      } else {
        nodeEl.classList.remove('locked');
      }
    }
  }

  // Set click handlers for all 15 nodes
  for (const zoneKey of allZoneKeys) {
    const nodeEl = $(`#node-${zoneKey}`);
    if (nodeEl) {
      nodeEl.onclick = () => selectNode(zoneKey);
    }
  }

  const resetBtn = $('#btn-reset-stars');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm("Reset all obtained stars? This will lock Web City again!")) {
        save.stars = { speedy: 0, mushroom: 0, web: 0 };
        for (let i = 2; i <= 5; i++) {
          save.stars[`speedy_${i}`] = 0;
          save.stars[`mushroom_${i}`] = 0;
          save.stars[`web_${i}`] = 0;
        }
        persist();
        renderMap();
        say("Stars reset! Levels locked.");
      }
    };
  }

  const total = earned + getStarsForHero('web');
  $('#total-stars').textContent = `⭐ Total stars: ${total} of 45`;

  // Select current node (or default)
  if (isNodeLocked(selectedZoneKey)) {
    selectedZoneKey = 'speedy';
  }
  selectNode(selectedZoneKey, false);
}

/* ---------- game session ---------- */

let session = null;

function startZone(zoneKey) {
  const baseKey = zoneKey.split('_')[0];
  const zone = ZONES[baseKey];
  session = { zone, zoneKey, qIndex: 0, firstTry: 0, busy: false, score: 0 };
  const screen = $('#screen-game');
  screen.className = 'screen active ' + zone.theme;
  $('#game-char').innerHTML = HERO_SVG[zone.key]();
  SceneFX.setup(zone);
  document.querySelectorAll('.screen').forEach((s) => { if (s !== screen) s.classList.remove('active'); });
  nextQuestion();
}

function updateDots() {
  const dots = $('#dots');
  dots.innerHTML = '';
  for (let i = 0; i < QUESTIONS_PER_LEVEL; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < session.qIndex ? ' done' : i === session.qIndex ? ' now' : '');
    dots.appendChild(d);
  }
}

function speakQuestion() {
  if (!session || !session.q) return;
  const plain = session.q.text.replace(/<[^>]+>/g, '');
  say(`${plain} ${session.q.suffix}`);
}

async function nextQuestion() {
  session.q = makeQuestion(session.zone);
  session.wrong = 0;
  session.answered = false;
  const q = session.q;

  updateDots();
  $('#question-text').innerHTML = `${q.text} <br>${q.suffix}`;
  $('#equation').innerHTML =
    `${q.a} ${q.op === 'add' ? '+' : '−'} ${q.b} = <span class="answer-slot">?</span>`;

  renderAnswers(q);
  session.qStart = performance.now();
  speakQuestion();
  await animateScene(q);
}

function renderAnswers(q) {
  const wrap = $('#answers');
  wrap.innerHTML = '';
  for (const c of q.choices) {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="digit">${c}</span><span class="word">${numWord(c)}</span>`;
    btn.onclick = () => onAnswer(btn, c);
    wrap.appendChild(btn);
  }
}

/* ---------- scene animation ---------- */

async function animateScene(q) {
  const wrap = $('#objects');
  wrap.innerHTML = '';
  const total = q.op === 'add' ? q.a + q.b : q.a;
  wrap.classList.toggle('small', total > 20);

  const objs = [];
  for (let i = 0; i < total; i++) {
    const span = document.createElement('span');
    span.className = 'obj';
    span.innerHTML = itemSVG(session.zone.item, i);
    if (q.op === 'add' && i >= q.a) span.classList.add('hidden-yet', 'added');
    wrap.appendChild(span);
    objs.push(span);
  }

  const token = (session.animToken = {});
  const zoneKey = session.zone.key;
  SceneFX.clearPile();
  SceneFX.clearProps();
  if (zoneKey === 'mushroom') SceneFX.makePile(Math.min(q.b, 8));
  await sleep(700);
  if (session.animToken !== token) return;

  const step = q.b > 10 ? 120 : 320;
  if (q.op === 'add') {
    if (q.fx === 'zoom') SceneFX.startRun();
    else if (q.fx === 'tails') {
      await SceneFX.tailsEnter();
      if (session.animToken !== token) return;
    } else if (q.fx === 'knuckles') {
      await SceneFX.knucklesEnter();
      if (session.animToken !== token) return;
    }
    for (let i = q.a; i < total; i++) {
      if (session.animToken !== token) return;
      objs[i].classList.remove('hidden-yet');
      objs[i].classList.add('arrive');
      sfx.pop();
      if (q.fx === 'zoom') SceneFX.ringIn();
      else if (q.fx === 'tails') SceneFX.tailsDrop();
      else if (q.fx === 'knuckles') SceneFX.digRing();
      else if (q.fx === 'catch') SceneFX.balloonIn();
      else if (q.fx === 'zip') SceneFX.balloonZip();
      else if (q.fx === 'rise') SceneFX.balloonRise();
      await sleep(step);
    }
    if (q.fx === 'zoom') SceneFX.stopRunSoon();
    else if (q.fx === 'tails') SceneFX.tailsExit();
    else if (q.fx === 'knuckles') SceneFX.knucklesExit();
  } else {
    if (q.fx === 'goomba') {
      await SceneFX.goombaEnter();
      if (session.animToken !== token) return;
    } else if (q.fx === 'yoshi') {
      await SceneFX.yoshiEnter();
      if (session.animToken !== token) return;
    } else if (q.fx === 'shop') {
      SceneFX.shopAppear();
    }
    await sleep(400);
    for (let i = total - 1; i >= total - q.b; i--) {
      if (session.animToken !== token) return;
      objs[i].classList.add('gone');
      sfx.pop();
      if (q.fx === 'goomba') SceneFX.stealOne();
      else if (q.fx === 'shop') SceneFX.spendOne();
      else if (q.fx === 'yoshi') SceneFX.yoshiEat();
      else if (q.fx === 'away') SceneFX.balloonOut();
      else if (q.fx === 'burst') SceneFX.balloonBurst();
      else if (q.fx === 'drift') SceneFX.balloonDrift();
      await sleep(step);
    }
    if (q.fx === 'goomba') SceneFX.goombaExit();
    else if (q.fx === 'shop') SceneFX.collectPowerup();
    else if (q.fx === 'yoshi') SceneFX.yoshiExit();
  }
}

/* ---------- counting help ---------- */

async function countTogether(q) {
  say("Let's count together!");
  await sleep(1300);
  const objs = [...document.querySelectorAll('#objects .obj')].filter((o) => !o.classList.contains('gone'));
  objs.forEach((o) => o.classList.remove('counted'));
  const n = objs.length;

  const highlight = (obj, label) => {
    obj.classList.add('counted', 'pulse');
    const tag = document.createElement('span');
    tag.className = 'count-label';
    tag.textContent = label;
    obj.appendChild(tag);
    setTimeout(() => obj.classList.remove('pulse'), 520);
  };

  if (n <= 20) {
    for (let i = 0; i < n; i++) {
      highlight(objs[i], i + 1);
      say(String(i + 1));
      await sleep(680);
    }
  } else {
    const fullRows = Math.floor(n / 10);
    for (let r = 0; r < fullRows; r++) {
      for (let i = r * 10; i < r * 10 + 10; i++) objs[i].classList.add('counted');
      highlight(objs[r * 10 + 9], (r + 1) * 10);
      say(String((r + 1) * 10));
      await sleep(950);
    }
    for (let i = fullRows * 10; i < n; i++) {
      highlight(objs[i], i + 1);
      say(String(i + 1));
      await sleep(680);
    }
  }

  await sleep(400);
  say(`${q.result} ${session.zone.item}s! Now you try!`);
}

/* ---------- answering ---------- */

const PRAISE = ['Awesome!', 'Great job!', 'You got it!', 'Super!', 'Amazing!', 'Way to go!'];

async function onAnswer(btn, val) {
  if (!session || session.busy || session.answered) return;
  const q = session.q;

  if (val === q.result) {
    session.answered = true;
    session.score += questionScore(performance.now() - (session.qStart || performance.now()));
    if (session.wrong === 0) session.firstTry++;
    btn.classList.add('right');
    document.querySelectorAll('.answer-btn').forEach((b) => { b.disabled = true; });
    $('#equation').innerHTML =
      `${q.a} ${q.op === 'add' ? '+' : '−'} ${q.b} = <span class="answer-slot">${q.result}</span>`;
    sfx.correct();
    confetti();
    SceneFX.celebrate();
    const char = $('#game-char');
    char.classList.add('bounce');
    setTimeout(() => char.classList.remove('bounce'), 1300);
    say(`${pick(PRAISE)} ${q.a} ${q.op === 'add' ? 'plus' : 'minus'} ${q.b} equals ${q.result}!`);
    await sleep(2400);
    advance();
    return;
  }

  session.wrong++;
  btn.classList.add('wrong');
  btn.disabled = true;
  sfx.oops();
  SceneFX.reactWrong();

  if (session.wrong === 1) {
    session.busy = true;
    say('Not quite! ');
    await sleep(1000);
    await countTogether(q);
    session.busy = false;
  } else {
    session.answered = true;
    session.busy = true;
    session.score += SCORE_MIN;
    const right = [...document.querySelectorAll('.answer-btn')]
      .find((b) => b.querySelector('.digit').textContent === String(q.result));
    if (right) right.classList.add('right');
    document.querySelectorAll('.answer-btn').forEach((b) => { b.disabled = true; });
    $('#equation').innerHTML =
      `${q.a} ${q.op === 'add' ? '+' : '−'} ${q.b} = <span class="answer-slot">${q.result}</span>`;
    say(`The answer is ${q.result}. ${q.a} ${q.op === 'add' ? 'plus' : 'minus'} ${q.b} equals ${q.result}. You'll get the next one!`);
    await sleep(3000);
    session.busy = false;
    advance();
  }
}

function advance() {
  if (!session) return;
  session.qIndex++;
  if (session.qIndex >= QUESTIONS_PER_LEVEL) {
    finishLevel();
  } else {
    nextQuestion();
  }
}

/* ---------- level complete ---------- */

function finishLevel() {
  const correct = session.firstTry;
  const stars = correct >= 5 ? 3 : correct === 4 ? 2 : correct === 3 ? 1 : 0;
  const zoneKey = session.zoneKey || session.zone.key;
  const isNewBest = stars > save.stars[zoneKey];
  if (isNewBest) {
    save.stars[zoneKey] = stars;
    persist();
  }
  const prevBest = (Records.zoneToday(zoneKey, save.difficulty) || { best: 0 }).best;
  Records.recordLevel(zoneKey, save.difficulty, session.score);
  const beatBest = prevBest > 0 && session.score > prevBest;
  $('#level-score').innerHTML =
    `Score: <b>${session.score.toLocaleString()}</b>` +
    (beatBest ? ' <span class="best-badge">New best today!</span>' : '');

  $('#complete-title').textContent = stars > 0 ? 'Level complete!' : 'Good try!';
  $('#complete-char').innerHTML = HERO_SVG[session.zone.key]();
  const row = $('#star-row');
  row.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span');
    s.textContent = '★';
    if (i >= stars) s.classList.add('dim');
    row.appendChild(s);
    if (i < stars) setTimeout(() => sfx.star(), 300 * i + 200);
  }
  const msg = stars === 3 ? `Perfect! ${session.zone.hero} is so proud of you!`
    : stars > 0 ? `You got ${correct} out of ${QUESTIONS_PER_LEVEL}! Keep going, hero!`
    : `Practice makes perfect! Try again with ${session.zone.hero}!`;
  $('#complete-msg').textContent = msg;
  showScreen('complete');
  confetti(stars > 0 ? 50 : 12);
  say(stars === 3 ? 'Wow! Three stars! Perfect!' : msg);

  $('#btn-again').onclick = () => startZone(zoneKey);
}

/* ---------- history screen ---------- */

let historyDifficulty = 'easy';

function renderHistory() {
  const diffRow = $('#history-difficulty-row');
  if (diffRow) {
    diffRow.innerHTML = '';
    for (const [key, d] of Object.entries(DIFFS)) {
      const btn = document.createElement('button');
      btn.className = 'diff-btn' + (historyDifficulty === key ? ' selected' : '');
      btn.innerHTML = `${d.label}`;
      btn.onclick = () => {
        historyDifficulty = key;
        renderHistory();
        say(`${d.label} score history!`);
      };
      diffRow.appendChild(btn);
    }
  }

  const wrap = $('#history-wrap');
  const days = Records.data.days || {};
  const keys = Object.keys(days).sort().reverse();

  if (!keys.length) {
    wrap.innerHTML = '<p class="history-empty">No games played yet. Go earn some scores, hero!</p>';
    return;
  }

  const fmtDate = (k) => {
    const d = new Date(k + 'T00:00:00');
    return isNaN(d) ? k : d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const cell = (day, zoneKey) => {
    let sum = 0;
    let hasAnyPlay = false;
    const suffixes = ['', '_2', '_3', '_4', '_5'];
    for (const suffix of suffixes) {
      const key = zoneKey + suffix;
      const compositeKey = `${key}_${historyDifficulty}`;
      const record = day[compositeKey] || (historyDifficulty === 'easy' ? day[key] : null);
      if (record) {
        sum += record.best;
        hasAnyPlay = true;
      }
    }
    return hasAnyPlay ? sum.toLocaleString() : '—';
  };

  let rows = '';
  for (const k of keys) {
    const day = days[k];
    rows += `<tr>
      <td class="h-date">${fmtDate(k)}${k === Records.todayKey() ? ' <span class="h-today">today</span>' : ''}</td>
      <td>${cell(day, 'speedy')}</td>
      <td>${cell(day, 'mushroom')}</td>
      <td>${cell(day, 'web')}</td>
      <td><button class="h-clear" data-day="${k}" aria-label="Clear this day">&#10006;</button></td>
    </tr>`;
  }

  wrap.innerHTML = `<table class="history-table">
    <thead><tr>
      <th>Date</th>
      <th>Sonic</th>
      <th>Mario</th>
      <th>Spidey</th>
      <th></th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  wrap.querySelectorAll('.h-clear').forEach((btn) => {
    btn.onclick = () => {
      const k = btn.dataset.day;
      if (confirm(`Clear the scores for ${fmtDate(k)}?`)) {
        Records.deleteDay(k);
        renderHistory();
      }
    };
  });
}

/* ---------- confetti ---------- */

function confetti(count = 28) {
  const colors = ['#ff6b6b', '#4d9be6', '#ffd23f', '#3cb44b', '#8a6fe8', '#ef7fb1'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = pick(colors);
    p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
    p.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

/* ================= wire up ================= */

$('#title-chars').innerHTML = sonicSVG() + marioSVG() + spideySVG();

$('#btn-play').onclick = () => {
  ctx();
  say('Welcome to Math Heroes! Choose your world!');
  renderMap();
  showScreen('map');
};

$('#btn-back').onclick = () => {
  session = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  renderMap();
  showScreen('map');
};

$('#btn-replay').onclick = speakQuestion;

$('#btn-map').onclick = () => {
  renderMap();
  showScreen('map');
};

$('#btn-history').onclick = () => {
  historyDifficulty = save.difficulty;
  renderHistory();
  showScreen('history');
};

$('#btn-history-back').onclick = () => {
  renderMap();
  showScreen('map');
};

$('#map-board').onclick = (e) => {
  const node = e.target.closest('.map-node');
  const tooltip = e.target.closest('.map-tooltip');
  if (!node && !tooltip) {
    hideTooltip();
    document.querySelectorAll('.map-node').forEach((n) => n.classList.remove('active'));
  }
};
