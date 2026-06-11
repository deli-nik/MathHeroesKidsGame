'use strict';

/* All SVG art: hero faces, full-body scene actors, props and items. */

/* ================= character art ================= */

function sonicSVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Sonic">
    <path d="M58 14 L20 16 L44 34 L10 40 L40 54 L8 66 L40 72 L18 92 L50 86" fill="#1d4fd1"/>
    <circle cx="68" cy="60" r="40" fill="#2b6ae0"/>
    <ellipse cx="76" cy="78" rx="24" ry="17" fill="#f6cfa0"/>
    <ellipse cx="62" cy="52" rx="13" ry="18" fill="#fff"/>
    <ellipse cx="86" cy="52" rx="13" ry="18" fill="#fff"/>
    <circle cx="65" cy="56" r="5.5" fill="#1a8f3c"/>
    <circle cx="83" cy="56" r="5.5" fill="#1a8f3c"/>
    <circle cx="66.5" cy="54" r="2" fill="#fff"/>
    <circle cx="84.5" cy="54" r="2" fill="#fff"/>
    <ellipse cx="92" cy="70" rx="5" ry="4" fill="#222"/>
    <path d="M62 84 Q74 94 88 84" stroke="#9c6b33" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function marioSVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Mario">
    <circle cx="60" cy="66" r="38" fill="#f6cfa0"/>
    <path d="M22 56 Q24 22 60 20 Q96 22 98 56 L92 56 Q88 36 60 34 Q32 36 28 56 Z" fill="#e2231a"/>
    <rect x="18" y="52" width="84" height="12" rx="6" fill="#e2231a"/>
    <circle cx="60" cy="38" r="11" fill="#fff"/>
    <text x="60" y="44" text-anchor="middle" font-size="16" font-weight="bold" fill="#e2231a" font-family="Arial">M</text>
    <ellipse cx="46" cy="70" rx="6" ry="8" fill="#fff"/>
    <ellipse cx="74" cy="70" rx="6" ry="8" fill="#fff"/>
    <circle cx="47" cy="72" r="3.5" fill="#2b6ae0"/>
    <circle cx="73" cy="72" r="3.5" fill="#2b6ae0"/>
    <ellipse cx="60" cy="82" rx="9" ry="7" fill="#f0b27a"/>
    <path d="M42 90 Q50 84 60 90 Q70 84 78 90 Q70 98 60 94 Q50 98 42 90 Z" fill="#5a3a1a"/>
  </svg>`;
}

function spideySVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Spidey">
    <ellipse cx="60" cy="62" rx="40" ry="42" fill="#d42b2b"/>
    <g stroke="#8f1414" stroke-width="1.6" fill="none">
      <path d="M60 20 V104"/>
      <path d="M22 50 H98"/>
      <path d="M26 76 H94"/>
      <path d="M30 34 Q60 48 90 34"/>
      <path d="M22 62 Q60 76 98 62"/>
      <path d="M30 90 Q60 102 90 90"/>
      <path d="M38 24 L26 88"/>
      <path d="M82 24 L94 88"/>
    </g>
    <path d="M30 56 Q42 42 56 56 Q52 74 34 70 Q28 64 30 56 Z" fill="#fff" stroke="#111" stroke-width="3"/>
    <path d="M90 56 Q78 42 64 56 Q68 74 86 70 Q92 64 90 56 Z" fill="#fff" stroke="#111" stroke-width="3"/>
  </svg>`;
}

function hollowKnightSVG() {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="Hollow Knight">
    <path d="M34 38 Q18 16 14 2 Q34 10 42 30 Z" fill="#e8eef2" stroke="#c2ccd4" stroke-width="2"/>
    <path d="M86 38 Q102 16 106 2 Q86 10 78 30 Z" fill="#e8eef2" stroke="#c2ccd4" stroke-width="2"/>
    <path d="M60 96 Q26 96 24 62 Q24 32 60 30 Q96 32 96 62 Q94 96 60 96 Z" fill="#f4f7f9" stroke="#c2ccd4" stroke-width="3"/>
    <ellipse cx="44" cy="62" rx="9" ry="13" fill="#13131c"/>
    <ellipse cx="76" cy="62" rx="9" ry="13" fill="#13131c"/>
    <circle cx="46.5" cy="57" r="2.4" fill="#3b4a66"/>
    <circle cx="78.5" cy="57" r="2.4" fill="#3b4a66"/>
    <path d="M52 92 Q60 98 68 92 L66 108 Q60 114 54 108 Z" fill="#1c2733"/>
  </svg>`;
}

const HERO_SVG = { speedy: sonicSVG, mushroom: marioSVG, web: spideySVG, hollow: hollowKnightSVG };

/* ---------- full-body actors for the action scene ---------- */

function sonicBodySVG() {
  return `<svg viewBox="0 0 120 150" role="img" aria-label="Sonic running">
    <g class="leg leg-l">
      <rect x="50" y="104" width="7" height="24" rx="3.5" fill="#2b6ae0"/>
      <ellipse cx="51" cy="132" rx="13" ry="8" fill="#e2231a"/>
      <rect x="40" y="126" width="24" height="5" rx="2.5" fill="#fff"/>
    </g>
    <g class="leg leg-r">
      <rect x="64" y="104" width="7" height="24" rx="3.5" fill="#2b6ae0"/>
      <ellipse cx="70" cy="132" rx="13" ry="8" fill="#e2231a"/>
      <rect x="59" y="126" width="24" height="5" rx="2.5" fill="#fff"/>
    </g>
    <g class="hero-bob">
      <path d="M50 10 L18 12 L38 26 L10 32 L34 42 L8 52 L34 56 L16 70 L40 68" fill="#1d4fd1"/>
      <ellipse cx="60" cy="92" rx="17" ry="19" fill="#2b6ae0"/>
      <ellipse cx="60" cy="97" rx="10" ry="12" fill="#f6cfa0"/>
      <circle cx="62" cy="42" r="32" fill="#2b6ae0"/>
      <ellipse cx="70" cy="56" rx="19" ry="13" fill="#f6cfa0"/>
      <ellipse cx="57" cy="36" rx="10" ry="14" fill="#fff"/>
      <ellipse cx="76" cy="36" rx="10" ry="14" fill="#fff"/>
      <circle cx="60" cy="40" r="4.4" fill="#1a8f3c"/>
      <circle cx="74" cy="40" r="4.4" fill="#1a8f3c"/>
      <ellipse cx="82" cy="50" rx="4" ry="3.2" fill="#222"/>
      <path d="M58 62 Q68 69 78 61" stroke="#9c6b33" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function marioBodySVG() {
  return `<svg viewBox="0 0 120 160" role="img" aria-label="Mario">
    <g class="leg leg-l">
      <rect x="47" y="110" width="9" height="22" rx="4" fill="#2b6ae0"/>
      <ellipse cx="49" cy="137" rx="13" ry="8" fill="#5a3a1a"/>
    </g>
    <g class="leg leg-r">
      <rect x="64" y="110" width="9" height="22" rx="4" fill="#2b6ae0"/>
      <ellipse cx="71" cy="137" rx="13" ry="8" fill="#5a3a1a"/>
    </g>
    <g class="hero-bob">
      <rect x="36" y="74" width="48" height="20" rx="9" fill="#e2231a"/>
      <rect x="42" y="84" width="36" height="32" rx="10" fill="#2b6ae0"/>
      <rect x="48" y="76" width="6" height="14" fill="#2b6ae0"/>
      <rect x="66" y="76" width="6" height="14" fill="#2b6ae0"/>
      <circle cx="51" cy="92" r="3" fill="#f5b914"/>
      <circle cx="69" cy="92" r="3" fill="#f5b914"/>
      <circle cx="33" cy="90" r="7" fill="#f6cfa0"/>
      <circle cx="87" cy="90" r="7" fill="#f6cfa0"/>
      <circle cx="60" cy="44" r="28" fill="#f6cfa0"/>
      <path d="M32 38 Q34 14 60 12 Q86 14 88 38 L84 38 Q80 24 60 22 Q40 24 36 38 Z" fill="#e2231a"/>
      <rect x="26" y="34" width="68" height="10" rx="5" fill="#e2231a"/>
      <circle cx="60" cy="24" r="8" fill="#fff"/>
      <text x="60" y="29" text-anchor="middle" font-size="12" font-weight="bold" fill="#e2231a" font-family="Arial">M</text>
      <ellipse cx="50" cy="46" rx="4.5" ry="6" fill="#fff"/>
      <ellipse cx="70" cy="46" rx="4.5" ry="6" fill="#fff"/>
      <circle cx="51" cy="48" r="2.6" fill="#2b6ae0"/>
      <circle cx="69" cy="48" r="2.6" fill="#2b6ae0"/>
      <ellipse cx="60" cy="56" rx="7" ry="5.5" fill="#f0b27a"/>
      <path d="M46 62 Q52 58 60 62 Q68 58 74 62 Q68 69 60 66 Q52 69 46 62 Z" fill="#5a3a1a"/>
    </g>
  </svg>`;
}

function goombaSVG() {
  return `<svg viewBox="0 0 110 100" role="img" aria-label="Goomba">
    <ellipse class="foot foot-l" cx="34" cy="90" rx="17" ry="9" fill="#4a2e12"/>
    <ellipse class="foot foot-r" cx="76" cy="90" rx="17" ry="9" fill="#4a2e12"/>
    <g class="goomba-core">
      <path d="M55 4 Q100 6 104 50 Q104 68 88 70 L22 70 Q6 68 6 50 Q10 6 55 4 Z" fill="#9c5a24"/>
      <ellipse cx="55" cy="70" rx="32" ry="15" fill="#f3d9a4"/>
      <ellipse cx="42" cy="42" rx="8" ry="12" fill="#fff"/>
      <ellipse cx="68" cy="42" rx="8" ry="12" fill="#fff"/>
      <circle cx="44" cy="46" r="4" fill="#111"/>
      <circle cx="66" cy="46" r="4" fill="#111"/>
      <path d="M30 28 L52 36" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 28 L58 36" stroke="#111" stroke-width="5" stroke-linecap="round"/>
      <path d="M46 64 Q55 58 64 64" stroke="#111" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`;
}

function spideyBodySVG() {
  return `<svg viewBox="0 0 120 170" role="img" aria-label="Spidey hanging from a web">
    <rect x="56" y="0" width="8" height="26" rx="4" fill="#d42b2b"/>
    <circle cx="60" cy="2" r="6" fill="#d42b2b"/>
    <ellipse cx="60" cy="52" rx="26" ry="28" fill="#d42b2b"/>
    <g stroke="#8f1414" stroke-width="1.4" fill="none">
      <path d="M60 24 V80"/>
      <path d="M36 44 H84"/>
      <path d="M38 62 H82"/>
      <path d="M42 30 Q60 40 78 30"/>
      <path d="M34 52 Q60 62 86 52"/>
    </g>
    <path d="M40 48 Q48 38 58 48 Q55 60 42 57 Q38 53 40 48 Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
    <path d="M80 48 Q72 38 62 48 Q65 60 78 57 Q82 53 80 48 Z" fill="#fff" stroke="#111" stroke-width="2.5"/>
    <path d="M48 80 Q60 76 72 80 L70 112 Q60 118 50 112 Z" fill="#d42b2b"/>
    <path d="M52 84 L60 92 L68 84 M60 92 V108" stroke="#8f1414" stroke-width="2" fill="none"/>
    <ellipse cx="60" cy="96" rx="5" ry="7" fill="#111"/>
    <path d="M50 112 L42 140 Q40 150 48 150 L52 150" stroke="#2b3a8f" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M70 112 L78 138 Q80 148 72 150 L68 150" stroke="#2b3a8f" stroke-width="11" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function hollowBodySVG() {
  return `<svg viewBox="0 0 120 160" role="img" aria-label="Hollow Knight standing">
    <g class="hero-bob">
      <path d="M44 36 Q30 16 27 4 Q44 12 50 30 Z" fill="#e8eef2" stroke="#c2ccd4" stroke-width="2"/>
      <path d="M76 36 Q90 16 93 4 Q76 12 70 30 Z" fill="#e8eef2" stroke="#c2ccd4" stroke-width="2"/>
      <path d="M60 78 Q34 78 33 52 Q33 30 60 28 Q87 30 87 52 Q86 78 60 78 Z" fill="#f4f7f9" stroke="#c2ccd4" stroke-width="3"/>
      <ellipse cx="49" cy="54" rx="7" ry="10" fill="#13131c"/>
      <ellipse cx="71" cy="54" rx="7" ry="10" fill="#13131c"/>
      <circle cx="51" cy="50" r="1.8" fill="#3b4a66"/>
      <circle cx="73" cy="50" r="1.8" fill="#3b4a66"/>
      <path d="M42 74 Q60 86 78 74 L84 122 Q60 138 36 122 Z" fill="#1c2733"/>
      <path d="M50 80 L48 118 M60 84 V124 M70 80 L72 118" stroke="#39465c" stroke-width="2" fill="none"/>
      <path d="M86 92 L112 60 L116 52 L114 64 L92 98 Z" fill="#d7dee6" stroke="#9aa7b4" stroke-width="2"/>
    </g>
    <g class="leg leg-l">
      <rect x="48" y="126" width="7" height="20" rx="3.5" fill="#1c2733"/>
    </g>
    <g class="leg leg-r">
      <rect x="65" y="126" width="7" height="20" rx="3.5" fill="#1c2733"/>
    </g>
  </svg>`;
}

function hornetSVG() {
  return `<svg viewBox="0 0 120 140" role="img" aria-label="Hornet flying">
    <path d="M88 86 L118 78" stroke="#cfd8e0" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M60 48 Q30 64 34 104 Q60 122 86 104 Q90 64 60 48 Z" fill="#a8273c"/>
    <path d="M48 60 Q44 86 50 106 M72 60 Q76 86 70 106" stroke="#7d1b2c" stroke-width="2" fill="none"/>
    <path d="M49 50 C40 32 41 13 47 3 C49 0 52 2 53 9 C54 25 56 38 58 50 Z" fill="#f4f7f9" stroke="#c2ccd4" stroke-width="2"/>
    <path d="M71 50 C80 32 79 13 73 3 C71 0 68 2 67 9 C66 25 64 38 62 50 Z" fill="#f4f7f9" stroke="#c2ccd4" stroke-width="2"/>
    <path d="M60 100 Q42 88 41 64 Q42 44 60 42 Q78 44 79 64 Q78 88 60 100 Z" fill="#f4f7f9" stroke="#c2ccd4" stroke-width="2.5"/>
    <ellipse cx="51" cy="70" rx="5.5" ry="8" fill="#13131c"/>
    <ellipse cx="69" cy="70" rx="5.5" ry="8" fill="#13131c"/>
  </svg>`;
}

function grubSVG() {
  return `<svg viewBox="0 0 100 90" role="img" aria-label="Happy Grub">
    <ellipse cx="50" cy="62" rx="33" ry="25" fill="#f1e8d4" stroke="#d8cba8" stroke-width="2.5"/>
    <path d="M20 58 Q50 72 80 58 M24 70 Q50 82 76 70" stroke="#d8cba8" stroke-width="2" fill="none"/>
    <ellipse cx="50" cy="36" rx="23" ry="21" fill="#2c3a55"/>
    <ellipse cx="42" cy="33" rx="5" ry="8" fill="#fff"/>
    <ellipse cx="58" cy="33" rx="5" ry="8" fill="#fff"/>
    <path d="M42 46 Q50 53 58 46" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function slyStallSVG() {
  return `<svg viewBox="0 0 140 120" role="img" aria-label="Sly's shop stall">
    <rect x="14" y="6" width="8" height="100" fill="#5a4226" rx="3"/>
    <rect x="118" y="6" width="8" height="100" fill="#5a4226" rx="3"/>
    <path d="M6 22 L134 22 L128 4 L12 4 Z" fill="#3a4a66"/>
    <path d="M6 22 Q14 34 22 22 Q30 34 38 22 Q46 34 54 22 Q62 34 70 22 Q78 34 86 22 Q94 34 102 22 Q110 34 118 22 Q126 34 134 22" fill="#4d6285"/>
    <circle cx="70" cy="44" r="7" fill="#cfe8ff" opacity="0.9"/>
    <circle cx="70" cy="44" r="11" fill="#9fd8ef" opacity="0.3"/>
    <rect x="10" y="78" width="120" height="34" rx="4" fill="#7a5a32" stroke="#5a4226" stroke-width="3"/>
    <path d="M10 88 H130" stroke="#5a4226" stroke-width="2"/>
  </svg>`;
}

function slySVG() {
  return `<svg viewBox="0 0 80 80" role="img" aria-label="Sly the shopkeeper">
    <path d="M30 16 Q24 4 16 2 M50 16 Q56 4 64 2" stroke="#8a96a4" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="2" r="3.5" fill="#8a96a4"/>
    <circle cx="64" cy="2" r="3.5" fill="#8a96a4"/>
    <ellipse cx="40" cy="56" rx="26" ry="20" fill="#aab8c2" stroke="#7e8c99" stroke-width="2.5"/>
    <path d="M16 52 Q40 64 64 52 M20 64 Q40 74 60 64" stroke="#7e8c99" stroke-width="2" fill="none"/>
    <ellipse cx="40" cy="32" rx="20" ry="18" fill="#e8eef2" stroke="#c2ccd4" stroke-width="2.5"/>
    <path d="M28 30 L38 34 M52 30 L42 34" stroke="#13131c" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M34 42 Q40 45 46 42" stroke="#13131c" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function tailsSVG() {
  return `<svg viewBox="0 0 130 110" role="img" aria-label="Tails flying">
    <g class="tail-fin tail-1">
      <path d="M78 58 Q112 38 128 16 Q120 48 94 66 Z" fill="#f2a33c"/>
      <path d="M128 16 Q117 34 106 46 L116 20 Z" fill="#fff"/>
    </g>
    <g class="tail-fin tail-2">
      <path d="M78 66 Q116 62 130 44 Q118 74 92 78 Z" fill="#f2a33c"/>
      <path d="M130 44 Q120 58 108 66 L120 46 Z" fill="#fff"/>
    </g>
    <ellipse cx="62" cy="70" rx="20" ry="16" fill="#f2a33c"/>
    <ellipse cx="58" cy="74" rx="11" ry="9" fill="#fff"/>
    <path d="M30 24 L22 6 L42 14 Z" fill="#f2a33c"/>
    <path d="M56 16 L64 2 L72 18 Z" fill="#f2a33c"/>
    <circle cx="48" cy="42" r="24" fill="#f2a33c"/>
    <ellipse cx="40" cy="52" rx="13" ry="9" fill="#fff"/>
    <ellipse cx="38" cy="38" rx="6" ry="9" fill="#fff"/>
    <ellipse cx="52" cy="38" rx="6" ry="9" fill="#fff"/>
    <circle cx="37" cy="40" r="3" fill="#2b6ae0"/>
    <circle cx="51" cy="40" r="3" fill="#2b6ae0"/>
    <circle cx="30" cy="48" r="2.6" fill="#222"/>
    <path d="M36 56 Q42 60 48 56" stroke="#9c6b33" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

function knucklesSVG() {
  return `<svg viewBox="0 0 120 130" role="img" aria-label="Knuckles">
    <path d="M34 62 L14 96 L42 76 Z" fill="#d8333c"/>
    <path d="M48 70 L40 106 L60 78 Z" fill="#d8333c"/>
    <path d="M86 62 L106 96 L78 76 Z" fill="#d8333c"/>
    <path d="M72 70 L80 106 L60 78 Z" fill="#d8333c"/>
    <circle cx="60" cy="44" r="32" fill="#d8333c"/>
    <ellipse cx="60" cy="58" rx="17" ry="11" fill="#f6cfa0"/>
    <ellipse cx="52" cy="38" rx="8" ry="12" fill="#fff"/>
    <ellipse cx="68" cy="38" rx="8" ry="12" fill="#fff"/>
    <circle cx="55" cy="42" r="3.6" fill="#7a3cb4"/>
    <circle cx="65" cy="42" r="3.6" fill="#7a3cb4"/>
    <ellipse cx="60" cy="52" rx="3.4" ry="2.6" fill="#222"/>
    <path d="M52 64 Q60 69 68 64" stroke="#9c6b33" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="34" cy="112" rx="17" ry="13" fill="#d8333c"/>
    <ellipse cx="86" cy="112" rx="17" ry="13" fill="#d8333c"/>
    <path d="M24 122 L28 114 L32 122 Z" fill="#fff"/>
    <path d="M34 122 L38 114 L42 122 Z" fill="#fff"/>
    <path d="M78 122 L82 114 L86 122 Z" fill="#fff"/>
    <path d="M88 122 L92 114 L96 122 Z" fill="#fff"/>
  </svg>`;
}

function yoshiSVG() {
  return `<svg viewBox="0 0 130 120" role="img" aria-label="Yoshi">
    <g class="tongue">
      <rect x="-78" y="76" width="88" height="11" rx="5.5" fill="#e0445c"/>
      <circle cx="-76" cy="81" r="8" fill="#e0445c"/>
    </g>
    <circle cx="82" cy="50" r="34" fill="#3cb44b"/>
    <ellipse cx="38" cy="74" rx="32" ry="24" fill="#fff"/>
    <path d="M38 50 Q70 38 92 56 L88 84 Q60 96 38 92 Z" fill="#3cb44b" opacity="0"/>
    <circle cx="70" cy="20" r="13" fill="#fff" stroke="#2a8a36" stroke-width="2"/>
    <circle cx="93" cy="20" r="13" fill="#fff" stroke="#2a8a36" stroke-width="2"/>
    <circle cx="66" cy="23" r="5" fill="#222"/>
    <circle cx="89" cy="23" r="5" fill="#222"/>
    <ellipse cx="22" cy="66" rx="3.5" ry="2.5" fill="#222"/>
    <path d="M14 86 Q34 96 58 90" stroke="#b03048" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M104 70 Q124 76 122 94 Q104 104 92 92 Z" fill="#e2231a"/>
    <path d="M104 70 Q124 76 122 94" stroke="#fff" stroke-width="4" fill="none"/>
  </svg>`;
}

function powerupSVG() {
  return `<svg viewBox="0 0 70 70" role="img" aria-label="Power-up mushroom">
    <path d="M35 4 Q64 6 66 34 Q66 42 58 42 L12 42 Q4 42 4 34 Q6 6 35 4 Z" fill="#e2231a"/>
    <circle cx="35" cy="17" r="8" fill="#fff"/>
    <circle cx="14" cy="32" r="6" fill="#fff"/>
    <circle cx="56" cy="32" r="6" fill="#fff"/>
    <rect x="20" y="42" width="30" height="20" rx="9" fill="#f6e3c0"/>
    <circle cx="29" cy="51" r="2.5" fill="#222"/>
    <circle cx="41" cy="51" r="2.5" fill="#222"/>
  </svg>`;
}

function crateSVG() {
  return `<svg viewBox="0 0 70 50" role="img" aria-label="Shop crate">
    <rect x="2" y="2" width="66" height="46" rx="5" fill="#c8965a" stroke="#8f5a1f" stroke-width="3"/>
    <path d="M4 4 L66 46 M66 4 L4 46" stroke="#8f5a1f" stroke-width="3"/>
  </svg>`;
}

/* ================= item art ================= */

const BALLOON_COLORS = ['#e25c5c', '#4d9be6', '#f5b914', '#8a6fe8', '#3cb44b', '#ef7fb1'];

function itemSVG(item, i) {
  if (item === 'ring') {
    return `<svg viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="13" fill="none" stroke="#f5b914" stroke-width="8"/>
      <circle cx="20" cy="20" r="17" fill="none" stroke="#c98f08" stroke-width="1.5"/>
      <circle cx="20" cy="20" r="9" fill="none" stroke="#c98f08" stroke-width="1.5"/>
      <path d="M12 13 A11 11 0 0 1 20 9" stroke="#fde9a8" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  if (item === 'coin') {
    return `<svg viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="17" fill="#f8c930" stroke="#c98f08" stroke-width="3"/>
      <circle cx="20" cy="20" r="11" fill="none" stroke="#c98f08" stroke-width="2"/>
      <path d="M20 13 L22 18 L27 18 L23 21.5 L24.5 27 L20 23.8 L15.5 27 L17 21.5 L13 18 L18 18 Z" fill="#c98f08"/>
    </svg>`;
  }
  if (item === 'geo') {
    return `<svg viewBox="0 0 40 40">
      <g stroke="#1c2733" stroke-width="1.7">
        <circle cx="20" cy="8" r="6" fill="#dce8ee"/>
        <circle cx="29" cy="11" r="5.5" fill="#cfdde6"/>
        <circle cx="33" cy="20" r="5" fill="#b8c9d4"/>
        <circle cx="30" cy="28" r="5.5" fill="#a3b4c1"/>
        <circle cx="21" cy="33" r="5.5" fill="#97a8b6"/>
        <circle cx="12" cy="30" r="5.5" fill="#a3b4c1"/>
        <circle cx="7" cy="21" r="5" fill="#c2d2dc"/>
        <circle cx="10" cy="12" r="5.5" fill="#d5e2ea"/>
        <circle cx="16" cy="19" r="6.5" fill="#cfdde6"/>
        <circle cx="25" cy="19" r="5.5" fill="#bfd0da"/>
        <circle cx="20" cy="26" r="5" fill="#aebfca"/>
      </g>
      <ellipse cx="14" cy="9" rx="2.6" ry="1.8" fill="#fff" opacity="0.85" transform="rotate(-20 14 9)"/>
    </svg>`;
  }
  const c = BALLOON_COLORS[i % BALLOON_COLORS.length];
  return `<svg viewBox="0 0 40 40">
    <ellipse cx="20" cy="15" rx="12" ry="14" fill="${c}"/>
    <ellipse cx="16" cy="10" rx="3.5" ry="5" fill="rgba(255,255,255,0.45)"/>
    <path d="M20 29 L17 33 L23 33 Z" fill="${c}"/>
    <path d="M20 33 Q16 36 20 39" stroke="#888" stroke-width="1.5" fill="none"/>
  </svg>`;
}
