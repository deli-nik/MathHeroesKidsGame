'use strict';

/* Score history screen. */

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
      <td>${cell(day, 'hollow')}</td>
      <td><button class="h-clear" data-day="${k}" aria-label="Clear this day">&#10006;</button></td>
    </tr>`;
  }

  wrap.innerHTML = `<table class="history-table">
    <thead><tr>
      <th>Date</th>
      <th>Sonic</th>
      <th>Mario</th>
      <th>Spidey</th>
      <th>Knight</th>
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
