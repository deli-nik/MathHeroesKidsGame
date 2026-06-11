'use strict';

/* Shared UI: screen switching, map board fit-to-width scaling, confetti. */

/* ================= screens ================= */

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  $('#screen-' + name).classList.add('active');
  if (name === 'map') fitMapBoard();
}

/* Scale the 1000px-wide map board down to fit the wrapper so there is no
   horizontal scrollbar. Below 0.6x the nodes get too small to tap, so the
   scale is clamped there and the wrapper scrolls instead (narrow phones). */
function fitMapBoard() {
  const wrapper = document.querySelector('.map-board-wrapper');
  const board = $('#map-board');
  if (!wrapper || !board) return;
  const avail = wrapper.clientWidth;
  if (!avail) return;
  const scale = Math.max(0.6, Math.min(1, (avail - 2) / 1000));
  board.style.zoom = scale;
}

window.addEventListener('resize', fitMapBoard);

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
