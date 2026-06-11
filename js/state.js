'use strict';

/* Persistent state: save data, level progression, daily score records. */

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
        if (s.stars.hollow === undefined) s.stars.hollow = 0;
        for (let i = 2; i <= 5; i++) {
          if (s.stars[`speedy_${i}`] === undefined) s.stars[`speedy_${i}`] = 0;
          if (s.stars[`mushroom_${i}`] === undefined) s.stars[`mushroom_${i}`] = 0;
          if (s.stars[`web_${i}`] === undefined) s.stars[`web_${i}`] = 0;
          if (s.stars[`hollow_${i}`] === undefined) s.stars[`hollow_${i}`] = 0;
        }
        return s;
      }
    }
  } catch (e) { /* fresh start */ }

  const defaultSave = { difficulty: 'easy', stars: { speedy: 0, mushroom: 0, web: 0, hollow: 0 } };
  for (let i = 2; i <= 5; i++) {
    defaultSave.stars[`speedy_${i}`] = 0;
    defaultSave.stars[`mushroom_${i}`] = 0;
    defaultSave.stars[`web_${i}`] = 0;
    defaultSave.stars[`hollow_${i}`] = 0;
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

  if (zoneKey === 'hollow') {
    return getStarsForHero('web') < STARS_TO_UNLOCK_HOLLOW;
  }

  if (zoneKey.startsWith('hollow_')) {
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
