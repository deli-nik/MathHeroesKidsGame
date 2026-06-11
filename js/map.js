'use strict';

/* World map screen: node selection, tooltips, locking, rendering. */

/* ---------- map ---------- */

let selectedZoneKey = 'speedy';

function selectNode(zoneKey, speak = true) {
  const locked = isNodeLocked(zoneKey);
  
  if (locked) {
    if (speak) {
      if (zoneKey.startsWith('web') && isNodeLocked('web')) {
        const earned = getStarsForHero('speedy') + getStarsForHero('mushroom');
        say(`Earn ${STARS_TO_UNLOCK_WEB} stars with Sonic and Mario to unlock Web City!`);
      } else if (zoneKey.startsWith('hollow') && isNodeLocked('hollow')) {
        say(`Earn ${STARS_TO_UNLOCK_HOLLOW} stars with Spidey to unlock Hallownest!`);
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

/* The tooltip lives outside the map board (which clips overflow), so it is
   fixed-positioned from the node's viewport rect. Clamped to the screen edges,
   with the arrow shifted so it still points at the node. */
let tooltipNode = null;

function placeTooltip(node) {
  const tooltip = $('#map-tooltip');
  if (!tooltip) return;
  tooltipNode = node;
  const rect = node.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const half = (tooltip.offsetWidth || 300) / 2;
  const clampedX = Math.max(half + 6, Math.min(window.innerWidth - half - 6, x));
  tooltip.style.left = `${clampedX}px`;
  tooltip.style.top = `${rect.top - 12}px`;
  const arrow = tooltip.querySelector('.tooltip-arrow');
  if (arrow) arrow.style.left = `calc(50% + ${Math.round(x - clampedX)}px)`;
  tooltip.classList.add('active');
}

function repositionTooltip() {
  if (tooltipNode && tooltipNode.isConnected) placeTooltip(tooltipNode);
}

window.addEventListener('scroll', repositionTooltip, true);
window.addEventListener('resize', repositionTooltip);

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
    <div class="tooltip-face">${HERO_SVG[baseKey]()}</div>
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
    hideTooltip();
    startZone(zoneKey);
  };

  placeTooltip(node);
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
      <div class="tooltip-face locked">${HERO_SVG[baseKey]()}</div>
      <h4 class="tooltip-title">${zone.name}</h4>
      <p class="tooltip-skill">${zone.skill} with ${zone.hero}</p>
      <div class="tooltip-stars" style="color: #888;">☆☆☆</div>
      <div class="tooltip-lock-note">🔒 Earn ${STARS_TO_UNLOCK_WEB} stars to unlock!<br>(${earned} / ${STARS_TO_UNLOCK_WEB} earned)</div>
    `;
  } else if (zoneKey.startsWith('hollow') && isNodeLocked('hollow')) {
    const earned = getStarsForHero('web');
    content.innerHTML = `
      <div class="tooltip-face locked">${HERO_SVG[baseKey]()}</div>
      <h4 class="tooltip-title">${zone.name}</h4>
      <p class="tooltip-skill">${zone.skill} with ${zone.hero}</p>
      <div class="tooltip-stars" style="color: #888;">☆☆☆</div>
      <div class="tooltip-lock-note">🔒 Earn ${STARS_TO_UNLOCK_HOLLOW} stars in Web City to unlock!<br>(${earned} / ${STARS_TO_UNLOCK_HOLLOW} earned)</div>
    `;
  } else {
    const displayNum = zoneKey.includes('_') ? ` ${zoneKey.split('_')[1]}` : ' 1';
    content.innerHTML = `
      <div class="tooltip-face locked">${HERO_SVG[baseKey]()}</div>
      <h4 class="tooltip-title">${zone.name}${displayNum}</h4>
      <p class="tooltip-skill">${zone.skill} with ${zone.hero}</p>
      <div class="tooltip-stars" style="color: #888;">☆☆☆</div>
      <div class="tooltip-lock-note">🔒 Beat the previous level to unlock!</div>
    `;
  }
  
  placeTooltip(node);

  document.querySelectorAll('.map-node').forEach((n) => n.classList.remove('active'));
  node.classList.add('active');
}

function hideTooltip() {
  tooltipNode = null;
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

  // Set all 20 node faces
  const heroes = ['speedy', 'mushroom', 'web', 'hollow'];
  for (const hero of heroes) {
    const faceEl = $('#face-' + hero);
    if (faceEl) faceEl.innerHTML = HERO_SVG[hero]();
    for (let i = 2; i <= 5; i++) {
      const subFaceEl = $('#face-' + hero + '_' + i);
      if (subFaceEl) subFaceEl.innerHTML = HERO_SVG[hero]();
    }
  }

  // Build the list of all 20 zone keys
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
      if (confirm("Reset all obtained stars? This will lock Web City and Hallownest again!")) {
        save.stars = { speedy: 0, mushroom: 0, web: 0, hollow: 0 };
        for (let i = 2; i <= 5; i++) {
          save.stars[`speedy_${i}`] = 0;
          save.stars[`mushroom_${i}`] = 0;
          save.stars[`web_${i}`] = 0;
          save.stars[`hollow_${i}`] = 0;
        }
        persist();
        renderMap();
        say("Stars reset! Levels locked.");
      }
    };
  }

  const total = earned + getStarsForHero('web') + getStarsForHero('hollow');
  $('#total-stars').textContent = `⭐ Total stars: ${total} of 60`;

  // Select current node (or default)
  if (isNodeLocked(selectedZoneKey)) {
    selectedZoneKey = 'speedy';
  }
  selectNode(selectedZoneKey, false);
}
