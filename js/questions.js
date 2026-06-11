'use strict';

/* Word-problem sentences and question generation. */

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
  if (zone.key === 'hollow') {
    if (op === 'add') {
      return pick([
        {
          fx: 'slash',
          text: `The Knight has <b class="num">${a}</b> ${it(a)}. Slash! A beetle drops <b class="num">${b}</b> more!`,
          suffix: 'How many geos now?',
        },
        {
          fx: 'grub',
          text: `The Knight finds <b class="num">${a}</b> ${it(a)}. A happy Grub gives <b class="num">${b}</b> more!`,
          suffix: 'How many geos now?',
        },
        {
          fx: 'toss',
          text: `The Knight has <b class="num">${a}</b> ${it(a)}. Hornet tosses <b class="num">${b}</b> more!`,
          suffix: 'How many geos now?',
        },
      ]);
    }
    return pick([
      {
        fx: 'spend',
        text: `The Knight has <b class="num">${a}</b> ${it(a)}. He spends <b class="num">${b}</b> at Sly's shop!`,
        suffix: 'How many geos are left?',
      },
      {
        fx: 'knock',
        text: `The Knight holds <b class="num">${a}</b> ${it(a)}. Bonk! A Tiktik knocks <b class="num">${b}</b> away!`,
        suffix: 'How many geos are left?',
      },
      {
        fx: 'gift',
        text: `The Knight has <b class="num">${a}</b> ${it(a)}. He gives <b class="num">${b}</b> to the little Grubs!`,
        suffix: 'How many geos are left?',
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
