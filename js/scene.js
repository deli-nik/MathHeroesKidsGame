'use strict';

/* SceneFX: the animated action scene at the bottom of the game screen. */

/* ================= action scene controller ================= */

const SceneFX = {
  root: null,
  hero: null,
  goomba: null,
  rig: null,
  zoneKey: null,
  runTimer: null,
  pile: [],
  dx: 0,

  setup(zone) {
    this.zoneKey = zone.key;
    this.pile = [];
    const root = (this.root = $('#action-scene'));
    // Shift the ground ensemble toward the screen center (44%, like Spidey's
    // swing rig); clamped to 0 on narrow screens where the layout fills the width.
    this.dx = Math.max(0, Math.min(Math.round(root.clientWidth * 0.44) - 110, root.clientWidth - 440));
    root.className = 'action-scene scene-' + zone.key;
    root.innerHTML = '<div class="hills"></div><div class="ground"></div>';
    this.hero = null;
    this.goomba = null;
    this.rig = null;
    this.tails = null;
    this.knuckles = null;
    this.yoshi = null;
    this.shroom = null;
    this.hornet = null;
    this.grub = null;
    this.sly = null;
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
    } else if (zone.key === 'hollow') {
      root.insertAdjacentHTML('beforeend',
        `<div class="actor hero knight">${hollowBodySVG()}</div><div class="actor hornet">${hornetSVG()}</div><div class="actor grub">${grubSVG()}</div>`);
      this.hero = root.querySelector('.hero');
      this.hornet = root.querySelector('.hornet');
      this.grub = root.querySelector('.grub');
    } else {
      root.insertAdjacentHTML('beforeend',
        `<div class="swing-rig"><div class="thread"></div>${spideyBodySVG()}</div>`);
      this.rig = root.querySelector('.swing-rig');
    }
    if (this.hero) this.hero.style.left = (64 + this.dx) + 'px';
    const qblock = root.querySelector('.qblock');
    if (qblock) qblock.style.left = (86 + this.dx) + 'px';
    if (this.knuckles) this.knuckles.style.left = (268 + this.dx) + 'px';
    if (this.grub) this.grub.style.left = (172 + this.dx) + 'px';
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
      el.style.left = (120 + this.dx) + 'px';
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
      const el = this.spawnFx(180 + this.dx + col * 26, 44 + row * 24);
      if (el) this.pile.push(el);
    }
  },

  async goombaEnter() {
    const g = this.goomba;
    if (!g) return;
    this.goombaVisible = true;
    g.classList.add('walking');
    g.style.left = (300 + this.dx) + 'px';
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
    el.style.left = (310 + this.dx) + 'px';
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
    this.sly = null;
    if (this.hornet && this.hornet.isConnected) this.hornet.style.left = '105%';
    if (this.grub && this.grub.isConnected) this.grub.style.bottom = '-95px';
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
    const el = this.spawnFx(286 + this.dx, 26);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = (236 + this.dx) + 'px';
      el.style.bottom = '128px';
    }));
    setTimeout(() => {
      if (!el.isConnected) return;
      el.style.left = (122 + this.dx) + 'px';
      el.style.bottom = '62px';
    }, 320);
    setTimeout(() => { el.classList.add('pop'); }, 880);
    setTimeout(() => { el.remove(); }, 1350);
  },

  async yoshiEnter() {
    const y = this.yoshi;
    if (!y) return;
    y.classList.add('walking');
    y.style.left = (296 + this.dx) + 'px';
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
    el.style.left = (296 + this.dx) + 'px';
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

  geoSlash() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(root.clientWidth + 20, 62);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = (124 + this.dx) + 'px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 580);
    setTimeout(() => { el.remove(); }, 1050);
  },

  async hornetEnter() {
    const h = this.hornet;
    if (!h) return;
    h.style.left = (218 + this.dx) + 'px';
    await sleep(1100);
  },

  hornetExit() {
    const h = this.hornet;
    if (!h || !h.isConnected) return;
    setTimeout(() => { if (h.isConnected) h.style.left = '105%'; }, 400);
  },

  async grubEnter() {
    const g = this.grub;
    if (!g) return;
    g.style.bottom = '36px';
    await sleep(850);
  },

  grubExit() {
    const g = this.grub;
    if (!g || !g.isConnected) return;
    setTimeout(() => { if (g.isConnected) g.style.bottom = '-95px'; }, 500);
  },

  slyShopAppear() {
    if (!this.root) return;
    const stall = document.createElement('div');
    stall.className = 'fx-prop';
    stall.style.cssText = `left:${296 + this.dx}px;bottom:40px;width:120px;`;
    stall.innerHTML = slyStallSVG();
    this.root.appendChild(stall);
    const sly = document.createElement('div');
    sly.className = 'fx-prop';
    sly.style.cssText = `left:${328 + this.dx}px;bottom:78px;width:56px;`;
    sly.innerHTML = slySVG();
    this.root.appendChild(sly);
    this.sly = sly;
  },

  slyCheer() {
    const s = this.sly;
    if (!s || !s.isConnected) return;
    sfx.star();
    s.style.transform = 'translateY(-14px)';
    setTimeout(() => { if (s.isConnected) s.style.transform = ''; }, 500);
  },

  geoRise() {
    const root = this.root;
    if (!root) return;
    const g = this.grub;
    if (g && g.isConnected) {
      g.classList.add('wiggle');
      setTimeout(() => { if (g.isConnected) g.classList.remove('wiggle'); }, 380);
    }
    const el = this.spawnFx(180 + this.dx + randInt(-6, 16), 50);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = (124 + this.dx) + 'px';
      el.style.bottom = '62px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 600);
    setTimeout(() => { el.remove(); }, 1100);
  },

  geoToss() {
    const root = this.root;
    if (!root) return;
    const h = this.hornet;
    if (h && h.isConnected) {
      h.classList.add('flick');
      setTimeout(() => { if (h.isConnected) h.classList.remove('flick'); }, 330);
    }
    const el = this.spawnFx(236 + this.dx + randInt(-8, 14), 110);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = (124 + this.dx) + 'px';
      el.style.bottom = '62px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 600);
    setTimeout(() => { el.remove(); }, 1100);
  },

  geoSpend() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(124 + this.dx, 62);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = (344 + this.dx) + 'px';
      el.style.bottom = '92px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 560);
    setTimeout(() => { el.remove(); }, 1050);
  },

  geoKnock() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(124 + this.dx + randInt(-10, 30), 62);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.add('float-up');
    }));
    setTimeout(() => { el.remove(); }, 1500);
  },

  geoGift() {
    const root = this.root;
    if (!root) return;
    const el = this.spawnFx(124 + this.dx + randInt(-10, 40), 62);
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
    t.style.left = (215 + this.dx) + 'px';
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
    const el = this.spawnFx(232 + this.dx, 112);
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.left = (122 + this.dx) + 'px';
      el.style.bottom = '62px';
    }));
    setTimeout(() => { el.classList.add('pop'); }, 600);
    setTimeout(() => { el.remove(); }, 1100);
  },

  shopAppear() {
    if (!this.root) return;
    const crate = document.createElement('div');
    crate.className = 'fx-prop';
    crate.style.cssText = `left:${322 + this.dx}px;bottom:40px;width:70px;`;
    crate.innerHTML = crateSVG();
    this.root.appendChild(crate);
    const m = document.createElement('div');
    m.className = 'fx-prop shroom';
    m.style.cssText = `left:${332 + this.dx}px;bottom:84px;width:50px;`;
    m.innerHTML = powerupSVG();
    this.root.appendChild(m);
    this.shroom = m;
  },

  spendOne() {
    const el = this.pile.pop();
    if (!el || !el.isConnected) return;
    el.style.left = (346 + this.dx) + 'px';
    el.style.bottom = '96px';
    setTimeout(() => { el.classList.add('pop'); }, 420);
    setTimeout(() => { el.remove(); }, 900);
  },

  collectPowerup() {
    const m = this.shroom;
    if (!m || !m.isConnected) return;
    m.style.left = (104 + this.dx) + 'px';
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
        const coin = this.spawnFx(96 + this.dx, 130);
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
    } else if (this.zoneKey === 'hollow' && this.hero) {
      const hero = this.hero;
      hero.classList.add('jump');
      sfx.star();
      setTimeout(() => { if (hero.isConnected) hero.classList.remove('jump'); }, 900);
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
