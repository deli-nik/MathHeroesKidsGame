'use strict';

/* Text-to-speech and synthesized sound effects. */

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
