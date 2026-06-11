'use strict';

/* App wiring: title screen art, buttons, startup. */

/* ================= wire up ================= */

$('#title-chars').innerHTML = sonicSVG() + marioSVG() + spideySVG() + hollowKnightSVG();

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
