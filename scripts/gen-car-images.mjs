import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'images');

const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'cards.json'), 'utf8'));
const deck = cards.decks.cars;
const ids = [...deck.heroes, ...deck.items, ...deck.fields];
const byId = Object.fromEntries(cards.cards.map(c => [c.id, c]));

const W = 1200, H = 1680;

// Per-card accent palette (body colour + a sky tone) keyed by id.
const PAL = {
  car_ae86:        { body: '#e8e8ec', body2: '#b9bcc6', sky1: '#2a3550', sky2: '#7a5cff', accent: '#2ee6a8' },
  car_civic_si:    { body: '#d33b3b', body2: '#8c1f1f', sky1: '#102a3a', sky2: '#1f9be8', accent: '#2ee6a8' },
  car_golf_gti:    { body: '#1f2630', body2: '#0c1118', sky1: '#3a1414', sky2: '#e84d2e', accent: '#2ee6a8' },
  car_wrx_sti:     { body: '#1f6fe0', body2: '#0b3a86', sky1: '#0f1b2e', sky2: '#ffd23a', accent: '#2ee6a8' },
  car_evo_vi:      { body: '#e0e3ea', body2: '#9aa2b3', sky1: '#241236', sky2: '#b246e8', accent: '#2ee6a8' },
  car_m3_e36:      { body: '#3a4a5e', body2: '#1a2530', sky1: '#102031', sky2: '#5ad1ff', accent: '#2ee6a8' },
  car_gtr_r34:     { body: '#2a3f6e', body2: '#13203c', sky1: '#0a1020', sky2: '#3aa6ff', accent: '#2ee6a8' },
  car_mustang_gt:  { body: '#1a4fa0', body2: '#0c2a5c', sky1: '#3a1a0a', sky2: '#ff9a3a', accent: '#2ee6a8' },
  car_corvette_c5: { body: '#f0c419', body2: '#b88a0c', sky1: '#102a2a', sky2: '#34e0c0', accent: '#2ee6a8' },
  car_supra_mk4:   { body: '#ff7a18', body2: '#c24e07', sky1: '#1a1030', sky2: '#ffb648', accent: '#ffd23a' },
};
const ITEM_ACCENT = '#1fb8c4';
const FIELD_ACCENT = '#34c759';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// A low sports-coupe side profile, drawn in a 0..1000 x 0..360 local box,
// translated/scaled into place. `p` = palette.
function carSilhouette(tx, ty, scale, p) {
  const wheelR = 78;
  const body = `
    M 70,250
    C 78,205 120,190 170,184
    L 250,176
    C 300,128 380,108 470,108
    L 600,110
    C 690,112 740,140 800,184
    L 905,196
    C 950,202 962,222 958,250
    L 920,250
    A ${wheelR} ${wheelR} 0 0 0 ${920 - 2 * wheelR},250
    L 360,250
    A ${wheelR} ${wheelR} 0 0 0 ${360 - 2 * wheelR},250
    L 70,250 Z`;
  // greenhouse / windows
  const glass = `
    M 300,176
    C 345,138 400,124 470,124
    L 560,126
    C 615,128 650,150 690,180
    L 300,176 Z`;
  function wheel(cx) {
    return `
      <circle cx="${cx}" cy="250" r="${wheelR}" fill="#0b0d12"/>
      <circle cx="${cx}" cy="250" r="${wheelR - 18}" fill="#1b2027"/>
      <circle cx="${cx}" cy="250" r="22" fill="#3a4250"/>
      ${[0,60,120,180,240,300].map(a => {
        const rad = a * Math.PI / 180;
        const x1 = cx + Math.cos(rad) * 22, y1 = 250 + Math.sin(rad) * 22;
        const x2 = cx + Math.cos(rad) * (wheelR - 22), y2 = 250 + Math.sin(rad) * (wheelR - 22);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#2a313c" stroke-width="9"/>`;
      }).join('')}
      <circle cx="${cx}" cy="250" r="${wheelR}" fill="none" stroke="#000" stroke-width="4" opacity="0.5"/>`;
  }
  return `
  <g transform="translate(${tx},${ty}) scale(${scale})">
    <ellipse cx="500" cy="320" rx="470" ry="44" fill="#000" opacity="0.45"/>
    <path d="${body}" fill="url(#bodyGrad)" stroke="#000" stroke-width="5" stroke-linejoin="round"/>
    <path d="${body}" fill="none" stroke="${p.accent}" stroke-width="3" opacity="0.35" stroke-linejoin="round"/>
    <path d="${glass}" fill="#0d1622" opacity="0.92"/>
    <path d="${glass}" fill="url(#glassGrad)" opacity="0.5"/>
    <path d="M 250,232 L 880,232" stroke="#000" stroke-width="4" opacity="0.35"/>
    <rect x="150" y="206" width="46" height="26" rx="6" fill="${p.sky2}" opacity="0.9"/>
    <rect x="170" y="200" width="22" height="34" rx="5" fill="#fff" opacity="0.85"/>
    ${wheel(280)}
    ${wheel(840)}
  </g>`;
}

// Stylised winding race track for field cards, local 0..1000 x 0..520.
function trackArt(tx, ty, scale, accent) {
  return `
  <g transform="translate(${tx},${ty}) scale(${scale})">
    <path d="M 80,470 C 250,470 250,250 430,250 C 620,250 560,90 760,90 C 900,90 940,210 900,300"
      fill="none" stroke="#0a0d12" stroke-width="92" stroke-linecap="round"/>
    <path d="M 80,470 C 250,470 250,250 430,250 C 620,250 560,90 760,90 C 900,90 940,210 900,300"
      fill="none" stroke="#1b2230" stroke-width="76" stroke-linecap="round"/>
    <path d="M 80,470 C 250,470 250,250 430,250 C 620,250 560,90 760,90 C 900,90 940,210 900,300"
      fill="none" stroke="${accent}" stroke-width="6" stroke-dasharray="2 34" stroke-linecap="round" opacity="0.9"/>
    <rect x="60" y="446" width="60" height="48" fill="#0a0d12"/>
    ${[0,1,2,3].map(r => [0,1,2].map(c =>
      `<rect x="${60 + c*20}" y="${446 + r*12}" width="20" height="12" fill="${(r+c)%2? '#fff':'#11151c'}"/>`
    ).join('')).join('')}
  </g>`;
}

function kiBadge(cx, cy, n) {
  return `
    <circle cx="${cx}" cy="${cy}" r="52" fill="#0d0f14" stroke="#ff7a18" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="52" fill="url(#kiGrad)" opacity="0.25"/>
    <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
      font-family="DejaVu Sans" font-weight="bold" font-size="50" fill="#ffb648">${n}</text>`;
}

function pill(x, y, w, h, fill, text, textFill = '#0d0f14', fs = 30) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}"/>
    <text x="${x + w/2}" y="${y + h/2 + 2}" text-anchor="middle" dominant-baseline="central"
      font-family="DejaVu Sans" font-weight="bold" font-size="${fs}" fill="${textFill}"
      letter-spacing="2">${esc(text)}</text>`;
}

function statBox(x, y, w, label, value, color) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="118" rx="14" fill="#11141b" stroke="#2c333f" stroke-width="2"/>
    <text x="${x + w/2}" y="${y + 34}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold"
      font-size="24" fill="#8c97a8" letter-spacing="3">${label}</text>
    <text x="${x + w/2}" y="${y + 84}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold"
      font-size="46" fill="${color}">${value}</text>`;
}

function fmt(n) { return n.toLocaleString('en-US'); }

// Wrap text to a given char width, returns tspans.
function wrap(text, maxChars, x, y, lh, fs, fill) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.map((ln, i) =>
    `<text x="${x}" y="${y + i*lh}" font-family="DejaVu Sans" font-size="${fs}" fill="${fill}">${esc(ln)}</text>`
  ).join('');
}

// Fit a single-line title font size to width.
function titleSize(name, base, maxLen) {
  if (name.length <= maxLen) return base;
  return Math.max(34, Math.round(base * maxLen / name.length));
}

function heroSvg(c) {
  const p = PAL[c.id] ?? PAL.car_ae86;
  const ts = titleSize(c.name.toUpperCase(), 76, 16);
  const ult = c.isUltimateHero;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky1}"/>
      <stop offset="0.55" stop-color="${p.sky2}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#0d0f14"/>
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.body}"/>
      <stop offset="1" stop-color="${p.body2}"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8fd2ff"/>
      <stop offset="1" stop-color="#0d1622"/>
    </linearGradient>
    <radialGradient id="kiGrad" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb648"/><stop offset="1" stop-color="#ff7a18"/>
    </radialGradient>
    <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ult ? '#ffd23a' : p.accent}"/>
      <stop offset="1" stop-color="${ult ? '#ff7a18' : '#0f8f6a'}"/>
    </linearGradient>
    <linearGradient id="nameFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0f14" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#0d0f14" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#0d0f14"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" rx="56" fill="url(#frame)"/>
  <rect x="20" y="20" width="${W-40}" height="${H-40}" rx="42" fill="#0d0f14"/>
  <rect x="34" y="34" width="${W-68}" height="${H-68}" rx="32" fill="url(#sky)"/>

  <!-- sun + horizon -->
  <circle cx="600" cy="540" r="220" fill="${p.sky2}" opacity="0.35"/>
  <circle cx="600" cy="540" r="150" fill="${p.sky2}" opacity="0.45"/>
  <rect x="34" y="760" width="${W-68}" height="${H-68-760+32}" fill="#0d0f14" opacity="0.55"/>
  <path d="M 34,820 L ${W-34},820" stroke="${p.accent}" stroke-width="3" opacity="0.4"/>
  <!-- road -->
  <path d="M 470,820 L 730,820 L 940,1180 L 260,1180 Z" fill="#11151c" opacity="0.85"/>
  ${[0,1,2,3].map(i=>`<rect x="${590-12}" y="${860+i*80}" width="24" height="44" rx="6" fill="${p.accent}" opacity="${0.6-i*0.1}"/>`).join('')}

  ${carSilhouette(120, 560, 0.92, p)}

  <!-- top badges -->
  ${kiBadge(96, 96, c.kiCost)}
  ${pill(W-300, 60, 240, 64, ult ? '#ffd23a' : p.accent, ult ? 'GRID ★' : 'THE GRID')}

  <!-- name + stats -->
  <rect x="34" y="1180" width="${W-68}" height="${H-68-1180+32}" rx="32" fill="url(#nameFade)"/>
  <text x="80" y="1330" font-family="DejaVu Sans" font-weight="bold" font-size="${ts}"
    fill="#fff" letter-spacing="1">${esc(c.name.toUpperCase())}</text>
  <rect x="80" y="1356" width="${W-160}" height="2" fill="${p.accent}" opacity="0.5"/>

  ${statBox(80,  1400, 320, 'HP',  fmt(c.hp),  '#3aa6ff')}
  ${statBox(440, 1400, 320, 'ATK', fmt(c.atk), '#ff4d4d')}
  ${statBox(800, 1400, 320, 'DEF', fmt(c.def), '#9aa7b5')}

  <text x="${W/2}" y="1600" text-anchor="middle" font-family="DejaVu Sans" font-size="26"
    fill="#8c97a8" font-style="italic">${esc(c.abilities[0].text.replace(/\s*\([^)]*\)\s*$/, ''))}</text>
</svg>`;
}

function itemFieldSvg(c) {
  const isField = c.cardType === 'field';
  const accent = isField ? FIELD_ACCENT : ITEM_ACCENT;
  const typeLabel = isField ? 'FIELD / TRACK' : 'ITEM / MOD';
  const ts = titleSize(c.name.toUpperCase(), 56, 18);
  const art = isField
    ? trackArt(120, 420, 0.78, accent)
    : carSilhouette(120, 540, 0.78, { ...PAL.car_ae86, body: '#cfd4de', body2: '#8b93a3', sky2: accent, accent });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="hdr" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${isField ? '#1f9e48' : '#0f8f99'}"/>
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cfd4de"/><stop offset="1" stop-color="#8b93a3"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#33424f"/>
    </linearGradient>
    <radialGradient id="kiGrad" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb648"/><stop offset="1" stop-color="#ff7a18"/>
    </radialGradient>
    <linearGradient id="artbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1a1f29"/><stop offset="1" stop-color="#0d1016"/>
    </linearGradient>
  </defs>

  <rect x="0" y="0" width="${W}" height="${H}" rx="56" fill="#e8ecf2"/>
  <rect x="22" y="22" width="${W-44}" height="${H-44}" rx="40" fill="#f4f6fa" stroke="#d2d8e0" stroke-width="3"/>

  <!-- header -->
  <rect x="60" y="70" width="${W-120}" height="120" rx="24" fill="url(#hdr)"/>
  <text x="100" y="148" font-family="DejaVu Sans" font-weight="bold" font-size="${ts}"
    fill="#0d0f14" letter-spacing="1">${esc(c.name.toUpperCase())}</text>
  ${kiBadge(W-130, 130, c.kiCost)}

  <!-- type tag -->
  ${pill(100, 220, 360, 56, '#0d0f14', typeLabel, accent, 26)}

  <!-- art frame -->
  <rect x="80" y="310" width="${W-160}" height="760" rx="20" fill="url(#artbg)" stroke="#cdd4dd" stroke-width="6"/>
  <clipPath id="artclip"><rect x="86" y="316" width="${W-172}" height="748" rx="16"/></clipPath>
  <g clip-path="url(#artclip)">
    <rect x="86" y="316" width="${W-172}" height="748" fill="url(#artbg)"/>
    <circle cx="600" cy="600" r="300" fill="${accent}" opacity="0.18"/>
    ${art}
  </g>

  <!-- ability text -->
  <rect x="80" y="1110" width="${W-160}" height="${H-80-1110}" rx="20" fill="#eef1f6" stroke="#d8dee6" stroke-width="2"/>
  ${wrap(c.abilities[0].text, 42, 120, 1190, 64, 40, '#1a2230')}
</svg>`;
}

const made = [];
for (const id of ids) {
  const c = byId[id];
  const svg = c.cardType === 'hero' ? heroSvg(c) : itemFieldSvg(c);
  const outPath = path.join(OUT, `${id}.png`);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  made.push(`${id}.png`);
}
console.log('Generated', made.length, 'images:\n' + made.join('\n'));
