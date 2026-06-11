'use strict';

/* Game session: questions, scene animation, answering, level completion. */

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
    } else if (q.fx === 'toss') {
      await SceneFX.hornetEnter();
      if (session.animToken !== token) return;
    } else if (q.fx === 'grub') {
      await SceneFX.grubEnter();
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
      else if (q.fx === 'slash') SceneFX.geoSlash();
      else if (q.fx === 'grub') SceneFX.geoRise();
      else if (q.fx === 'toss') SceneFX.geoToss();
      await sleep(step);
    }
    if (q.fx === 'zoom') SceneFX.stopRunSoon();
    else if (q.fx === 'tails') SceneFX.tailsExit();
    else if (q.fx === 'knuckles') SceneFX.knucklesExit();
    else if (q.fx === 'toss') SceneFX.hornetExit();
    else if (q.fx === 'grub') SceneFX.grubExit();
  } else {
    if (q.fx === 'goomba') {
      await SceneFX.goombaEnter();
      if (session.animToken !== token) return;
    } else if (q.fx === 'yoshi') {
      await SceneFX.yoshiEnter();
      if (session.animToken !== token) return;
    } else if (q.fx === 'shop') {
      SceneFX.shopAppear();
    } else if (q.fx === 'spend') {
      SceneFX.slyShopAppear();
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
      else if (q.fx === 'spend') SceneFX.geoSpend();
      else if (q.fx === 'knock') SceneFX.geoKnock();
      else if (q.fx === 'gift') SceneFX.geoGift();
      await sleep(step);
    }
    if (q.fx === 'goomba') SceneFX.goombaExit();
    else if (q.fx === 'shop') SceneFX.collectPowerup();
    else if (q.fx === 'yoshi') SceneFX.yoshiExit();
    else if (q.fx === 'spend') SceneFX.slyCheer();
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
