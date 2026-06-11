'use strict';

/* Game data: difficulties, zones, unlock and tuning constants. */

/* ================= data ================= */

const SAVE_KEY = 'mathHeroes_v1';

const DIFFS = {
  easy:   { label: 'Easy',   sub: 'up to 10', lo: 3,  max: 10 },
  medium: { label: 'Medium', sub: 'up to 30', lo: 8,  max: 30 },
  hard:   { label: 'Hard',   sub: 'up to 50', lo: 20, max: 50 },
};

const STARS_TO_UNLOCK_WEB = 4;
const STARS_TO_UNLOCK_HOLLOW = 4;

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
  hollow: {
    key: 'hollow', name: 'Hallownest', hero: 'Hollow Knight', op: 'mix',
    item: 'geo', skill: 'Add & subtract', theme: 'theme-hollow',
  },
};

const QUESTIONS_PER_LEVEL = 5;
