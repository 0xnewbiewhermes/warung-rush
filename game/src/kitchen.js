// kitchen.js — the room: a night-market warung counter that runs the full width of the frame, its
// stations, the pass alcove and the chef. Drawing and interaction live together because a station's
// look is its rule: the wok takes rice, the grill takes skewers, the pass takes a finished plate.

import { PAL, rr, shadow, label, steam, emberGlow, sparks, counter } from './art.js';
import { wok, grill, tray, plated, peanutSauce, sataySkewer, riceMound } from './food.js';
import { matches } from './state.js';

export const LAYOUT = {
  bandBottom: 104,
  wallBottom: 178,
  counterTop: 178,
  counterFront: 374,
  counterBottom: 400,
  floorTop: 400,
  floorBottom: 480,
  standY: 452,
  boardRail: { x: 196, y: 10, w: 616, h: 86 },
  score: { x: 10, y: 12, w: 176, h: 56 },
  clock: { x: 824, y: 12, w: 186, h: 56 },
  shift: { x: 1020, y: 12, w: 250, h: 56 },
  stations: [
    { id: 'rice', kind: 'tray', ing: 'rice', x: 306, w: 80, name: 'Rice' },
    { id: 'skewer', kind: 'tray', ing: 'skewer', x: 396, w: 80, name: 'Skewers' },
    { id: 'veg', kind: 'tray', ing: 'veg', x: 486, w: 80, name: 'Veg' },
    { id: 'egg', kind: 'tray', ing: 'egg', x: 572, w: 70, name: 'Eggs' },
    { id: 'wok', kind: 'wok', x: 682, w: 124, name: 'Wok' },
    { id: 'grill', kind: 'grill', x: 830, w: 150, name: 'Grill' },
    { id: 'sauce', kind: 'sauce', x: 950, w: 78, name: 'Sauce' },
    { id: 'prep', kind: 'prep', x: 1042, w: 104, name: 'Plate' },
  ],
  pass: { x: 1186, w: 176 },
  chefMin: 292,
  chefMax: 1078,
};

const COOK = {
  wok: { need: 1.7, raw: 'rice', out: 'cooked:rice' },
  grill: { need: 1.6, raw: 'skewer', out: 'cooked:satay' },
};

export function stationAt(x) {
  let best = null;
  let bestD = 1e9;
  for (const s of LAYOUT.stations) {
    const d = Math.abs(x - s.x);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  const dp = Math.abs(x - LAYOUT.pass.x);
  if (dp < 88 && dp < bestD) {
    best = { id: 'pass', kind: 'pass', x: LAYOUT.pass.x, w: LAYOUT.pass.w, name: 'Pass' };
    bestD = dp;
  }
  return bestD < 78 ? best : null;
}

export function heldName(hand) {
  if (!hand) return '';
  if (hand.startsWith('cooked:')) return 'hot ' + hand.slice(7).replace('+sauce', ' + sauce');
  if (hand.startsWith('burnt:')) return 'burnt ' + hand.slice(6);
  return hand;
}

export function useStation(state, station) {
  if (!station || state.over) return null;
  const hand = state.hand;
  if (station.kind === 'tray') {
    if (hand) return { kind: 'nope', why: 'hands full' };
    state.hand = station.ing;
    return { kind: 'pick', what: station.ing };
  }
  if (station.id === 'wok' || station.id === 'grill') {
    const rule = COOK[station.id];
    if (hand === rule.raw) {
      state.cook = { station: station.id, t: 0, need: rule.need, out: rule.out };
      return { kind: 'cookstart', what: station.id };
    }
    if (hand && hand.startsWith('cooked:')) return { kind: 'nope', why: 'already cooked' };
    if (hand) return { kind: 'nope', why: `that is not ${rule.raw}` };
    return { kind: 'sizzle' };
  }
  if (station.id === 'sauce') {
    if (hand === 'cooked:satay' || hand === 'cooked:rice' || hand === 'veg') {
      state.hand = hand + '+sauce';
      return { kind: 'sauce' };
    }
    return { kind: 'nope', why: 'nothing to dress' };
  }
  if (station.id === 'prep') {
    if (hand === 'plate') return { kind: 'nope', why: 'plate already out' };
    if (state.plate.items.length === 0 && !hand) {
      state.hand = 'plate';
      return { kind: 'plate' };
    }
    if (hand) {
      const base = hand.replace('+sauce', '');
      if (base.startsWith('burnt:')) {
        state.plate.items.push(base.slice(6));
        state.plate.burnt = true;
        state.hand = null;
        return { kind: 'burnt' };
      }
      const item = base.startsWith('cooked:') ? base.slice(7) : base;
      state.plate.items.push(item);
      if (hand.endsWith('+sauce')) state.plate.items.push('sauce');
      state.hand = null;
      return { kind: 'place', what: item };
    }
    return { kind: 'nope', why: 'take a plate first' };
  }
  if (station.kind === 'pass') {
    if (hand !== 'plate') return { kind: 'nope', why: 'carry a plate' };
    const order = state.orders.find((o) => matches(state.plate, o.recipeId));
    if (!order) return { kind: 'nope', why: 'no ticket matches' };
    state.serve(order);
    return { kind: 'serve', order };
  }
  return null;
}

export function cookTick(state, dt) {
  const c = state.cook;
  if (!c || !c.station) return null;
  c.t += dt;
  if (c.t >= c.need) {
    if (c.t > c.need * 1.95) {
      state.hand = 'burnt:' + c.out.slice(7);
      state.cook = null;
      return { kind: 'burnt' };
    }
    state.hand = c.out;
    state.cook = null;
    return { kind: 'cooked', what: c.out };
  }
  return null;
}

export function partsOf(state) {
  const parts = {};
  for (const it of state.plate.items) {
    if (it === 'satay') parts.satay = (parts.satay || 0) + 1;
    else parts[it] = true;
  }
  return parts;
}

// ---------------------------------------------------------------- drawing

export function drawScene(c, state, t, opts = {}) {
  drawHeader(c);
  drawWall(c, t, opts);
  drawCounter(c, state, t);
  drawFloor(c);
  customers(c, state, t);
  drawChef(c, state, t, opts);
  drawHand(c, state, t);
  c.fillStyle = '#1a1009';
  c.fillRect(-360, LAYOUT.counterBottom - 6, 2000, 10);
}

function drawHeader(c) {
  const hg = c.createLinearGradient(0, 0, 0, LAYOUT.bandBottom);
  hg.addColorStop(0, '#050d0f');
  hg.addColorStop(1, '#0a1a1d');
  c.fillStyle = hg;
  c.fillRect(-360, 0, 2000, LAYOUT.bandBottom);
  c.fillStyle = 'rgba(255,190,120,0.18)';
  c.fillRect(-360, LAYOUT.bandBottom - 2, 2000, 2);
}

function drawWall(c, t, opts = {}) {
  const y0 = LAYOUT.bandBottom;
  const h = LAYOUT.wallBottom - y0;
  const wg = c.createLinearGradient(0, y0, 0, LAYOUT.wallBottom);
  wg.addColorStop(0, '#0d272c');
  wg.addColorStop(1, '#081a1e');
  c.fillStyle = wg;
  c.fillRect(-360, y0, 2000, h);
  c.save();
  c.beginPath();
  c.rect(0, y0, 1280, h);
  c.clip();
  c.strokeStyle = 'rgba(255,255,255,0.04)';
  c.lineWidth = 1;
  for (let x = 0; x < 1280; x += 26) {
    c.beginPath();
    c.moveTo(x, y0);
    c.lineTo(x, LAYOUT.wallBottom);
    c.stroke();
  }
  for (let y = y0 + 16; y < LAYOUT.wallBottom; y += 20) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(1280, y);
    c.stroke();
  }
  for (const lx of [386, 646, 903, 1180]) {
    const g = c.createRadialGradient(lx, y0, 4, lx, y0, 170);
    g.addColorStop(0, 'rgba(255,196,110,0.26)');
    g.addColorStop(1, 'rgba(255,196,110,0)');
    c.fillStyle = g;
    c.fillRect(lx - 180, y0, 360, h + 30);
  }
  c.restore();

  // shelf of jars on the left wall
  shelf(c, 24, 128, 240);
  // hanging lamps under the band
  for (const lx of [386, 646, 903, 1180]) {
    c.strokeStyle = '#071012';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(lx, y0);
    c.lineTo(lx, y0 + 12);
    c.stroke();
    c.fillStyle = '#16282a';
    c.beginPath();
    c.moveTo(lx - 22, y0 + 12);
    c.lineTo(lx + 22, y0 + 12);
    c.lineTo(lx + 12, y0 + 26);
    c.lineTo(lx - 12, y0 + 26);
    c.closePath();
    c.fill();
    const g = c.createRadialGradient(lx, y0 + 27, 2, lx, y0 + 27, 28);
    g.addColorStop(0, PAL.lampCore);
    g.addColorStop(0.4, PAL.lamp);
    g.addColorStop(1, 'rgba(255,140,60,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(lx, y0 + 26, 28, 0, Math.PI * 2);
    c.fill();
  }

  // hand-painted name over the wok (skipped on a zoomed frame, where the rail covers it)
  if (!opts.zoom) paintSign(c, 700, 150, 236, 'WARUNG RUSH');
  utensil(c, 300, 132);
  utensil(c, 330, 128);
}

function shelf(c, x, y, w) {
  c.fillStyle = '#3a2317';
  rr(c, x, y, w, 7, 3);
  c.fill();
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.fillRect(x, y + 7, w, 4);
  const jars = [
    { w: 34, h: 40, col: '#b52d22', label: 'sambal' },
    { w: 30, h: 34, col: '#c9a24a', label: 'krupuk' },
    { w: 28, h: 46, col: '#7fa653', label: 'pickle' },
    { w: 26, h: 30, col: '#d8d2b8', label: 'salt' },
    { w: 34, h: 38, col: '#8b5a2b', label: 'kecap' },
  ];
  let jx = x + 16;
  for (const j of jars) {
    c.fillStyle = 'rgba(0,0,0,0.3)';
    c.beginPath();
    c.ellipse(jx + j.w / 2, y, j.w * 0.6, 3, 0, 0, Math.PI * 2);
    c.fill();
    const g = c.createLinearGradient(jx, y - j.h, jx + j.w, y);
    g.addColorStop(0, 'rgba(255,255,255,0.28)');
    g.addColorStop(0.25, j.col);
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    c.fillStyle = g;
    rr(c, jx, y - j.h, j.w, j.h, 4);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.18)';
    rr(c, jx + 3, y - j.h + 4, 4, j.h - 12, 2);
    c.fill();
    c.fillStyle = '#2b1b10';
    rr(c, jx - 1, y - j.h - 5, j.w + 2, 6, 2);
    c.fill();
    jx += j.w + 12;
  }
}

function paintSign(c, cx, cy, w, text) {
  c.save();
  c.translate(cx, cy);
  c.fillStyle = 'rgba(8,16,14,0.6)';
  rr(c, -w / 2, -24, w, 48, 7);
  c.fill();
  c.strokeStyle = 'rgba(255,196,110,0.4)';
  c.lineWidth = 2;
  rr(c, -w / 2 + 1, -23, w - 2, 46, 7);
  c.stroke();
  label(c, text, 0, 6, { size: 24, weight: 800, color: '#ffd9a0', align: 'center' });
  label(c, 'sate · nasi goreng · gado-gado', 0, 20, { size: 9.5, weight: 700, color: 'rgba(255,220,180,0.62)', align: 'center' });
  c.restore();
}

function utensil(c, x, y) {
  c.strokeStyle = 'rgba(200,215,210,0.3)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x, y - 16);
  c.lineTo(x, y);
  c.stroke();
  c.beginPath();
  c.ellipse(x, y + 7, 8, 11, 0.2, 0, Math.PI * 2);
  c.stroke();
}

function drawCounter(c, state, t) {
  counter(c, -360, LAYOUT.counterTop, 2000, LAYOUT.counterFront - LAYOUT.counterTop + 10);
  const ag = c.createLinearGradient(0, LAYOUT.counterFront, 0, LAYOUT.counterBottom);
  ag.addColorStop(0, '#5d3118');
  ag.addColorStop(1, '#2a160b');
  c.fillStyle = ag;
  c.fillRect(-360, LAYOUT.counterFront, 2000, LAYOUT.counterBottom - LAYOUT.counterFront);
  // back edge shadow so the counter reads as depth
  const sg = c.createLinearGradient(0, LAYOUT.counterTop, 0, LAYOUT.counterTop + 16);
  sg.addColorStop(0, 'rgba(0,0,0,0.45)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = sg;
  c.fillRect(-360, LAYOUT.counterTop, 2000, 16);

  for (const lx of [386, 646, 903, 1180]) {
    const g = c.createRadialGradient(lx, LAYOUT.counterTop + 60, 8, lx, LAYOUT.counterTop + 60, 190);
    g.addColorStop(0, 'rgba(255,190,110,0.16)');
    g.addColorStop(1, 'rgba(255,190,110,0)');
    c.fillStyle = g;
    c.fillRect(lx - 200, LAYOUT.counterTop, 400, 190);
  }
  for (const s of LAYOUT.stations) drawStation(c, s, state, t);
  drawProps(c, t);
  passAlcove(c, state, t);
}

function drawFloor(c) {
  const g = c.createLinearGradient(0, LAYOUT.floorTop, 0, 480);
  g.addColorStop(0, '#0f1e19');
  g.addColorStop(1, '#050c0a');
  c.fillStyle = g;
  c.fillRect(-360, LAYOUT.floorTop, 2000, 480 - LAYOUT.floorTop);
  c.strokeStyle = 'rgba(255,255,255,0.035)';
  for (let x = -360; x < 1640; x += 76) {
    c.beginPath();
    c.moveTo(x, LAYOUT.floorTop);
    c.lineTo(x + 34, 480);
    c.stroke();
  }
}


function drawProps(c, t) {
  // the front band: a rice sack, a lime basket, a bowl stack and a hanging ladle
  c.fillStyle = '#d9cba6';
  c.beginPath();
  c.moveTo(232, 372);
  c.quadraticCurveTo(214, 336, 236, 330);
  c.quadraticCurveTo(258, 330, 258, 352);
  c.quadraticCurveTo(262, 366, 256, 372);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(120,95,60,0.6)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(224, 344);
  c.quadraticCurveTo(240, 338, 258, 344);
  c.stroke();
  label(c, 'beras', 240, 360, { size: 8, weight: 800, color: '#6b5a3a', align: 'center' });
  // lime basket
  c.strokeStyle = '#8a5f2a';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(1082, 352, 34, 14, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = 'rgba(80,55,25,0.35)';
  c.fill();
  for (let i = 0; i < 5; i++) {
    c.fillStyle = i % 2 ? '#5fae42' : '#79c24e';
    c.beginPath();
    c.arc(1062 + i * 11, 346 - (i % 3) * 4, 7, 0, Math.PI * 2);
    c.fill();
  }
  // stack of bowls
  for (let i = 0; i < 3; i++) {
    c.fillStyle = i % 2 ? '#e8ddd0' : '#f3ece2';
    c.beginPath();
    c.ellipse(624, 356 - i * 7, 26, 9, 0, 0, Math.PI * 2);
    c.fill();
  }
  // a bowl of chilies
  c.fillStyle = '#1d2a2a';
  c.beginPath();
  c.ellipse(626, 300, 26, 13, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#2c3d3d';
  c.beginPath();
  c.ellipse(626, 296, 22, 10, 0, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 6; i++) {
    const a = i * 1.1;
    c.fillStyle = i % 2 ? '#c0392b' : '#d8452f';
    c.beginPath();
    c.ellipse(626 + Math.cos(a) * 12, 294 + Math.sin(a) * 5, 7, 3.4, a, 0, Math.PI * 2);
    c.fill();
  }
  // folded service towel
  c.save();
  c.translate(884, 306);
  c.rotate(-0.06);
  c.fillStyle = '#2f6b73';
  rr(c, -24, -9, 48, 18, 3);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.35)';
  c.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(-22, i * 5);
    c.lineTo(22, i * 5);
    c.stroke();
  }
  c.restore();
  // scattered chili and lime by the prep board
  c.fillStyle = '#cf3f2c';
  c.beginPath();
  c.ellipse(1108, 322, 6, 3, 0.4, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(1120, 330, 5, 2.6, -0.3, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#5fae42';
  c.beginPath();
  c.ellipse(1096, 332, 7, 5, 0.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#c9e77f';
  c.beginPath();
  c.ellipse(1095, 330, 4, 2.6, 0.2, 0, Math.PI * 2);
  c.fill();
  // stack of clean plates at the far left of the counter
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i % 2 ? '#e6ecea' : '#f2f6f4';
    c.beginPath();
    c.ellipse(228, 316 - i * 6, 30, 11, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(150,170,166,0.5)';
    c.lineWidth = 1;
    c.beginPath();
    c.ellipse(228, 315 - i * 6, 26, 9, 0, 0, Math.PI * 2);
    c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.beginPath();
  c.ellipse(218, 288, 12, 3, -0.2, 0, Math.PI * 2);
  c.fill();
}

function drawStation(c, s, state, t) {
  const yTop = LAYOUT.counterTop + 22;
  const near = state.chefNear === s.id;
  if (near) {
    const g = c.createLinearGradient(0, yTop - 20, 0, yTop + 130);
    g.addColorStop(0, 'rgba(255,207,92,0)');
    g.addColorStop(1, 'rgba(255,207,92,0.12)');
    c.fillStyle = g;
    c.fillRect(s.x - s.w / 2 - 8, yTop - 20, s.w + 16, 150);
    c.strokeStyle = 'rgba(255,207,92,0.35)';
    c.lineWidth = 1.5;
    rr(c, s.x - s.w / 2 - 4, yTop + 14, s.w + 8, 96, 8);
    c.stroke();
  }

  const hideLabel = state.chef && Math.abs(state.chef.x - s.x) < 74;
  if (s.kind === 'tray') {
    tray(c, s.x - s.w / 2, yTop + 10, s.w, 76, s.ing, t);
    if (!hideLabel) label(c, s.name, s.x, yTop + 100, { size: 11, color: near ? PAL.gold : 'rgba(215,230,220,0.6)', align: 'center', weight: 700 });
  }

  if (s.kind === 'wok') {
    wok(c, s.x, yTop + 54, 62, { heat: state.cooking && state.cooking.station === s.id ? 1 : 0.2, contents: state.wokContents !== false });
    if (state.cooking && state.cooking.station === s.id) {
      steam(c, s.x, yTop + 26, t, 1.2, 0.45);
      sparks(c, s.x, yTop + 30, t, 5);
    }
    if (!hideLabel) label(c, 'Wok', s.x, yTop + 118, { size: 11, color: near ? PAL.gold : 'rgba(215,230,220,0.6)', align: 'center', weight: 700 });
  }

  if (s.kind === 'grill') {
    grill(c, s.x, yTop + 52, 68, { t });
    emberGlow(c, s.x, yTop + 70, 78, t);
    // three skewers lying across the grate, close enough to read at thumbnail size
    for (let i = 0; i < 3; i++) {
      sataySkewer(c, s.x, yTop + 30 + i * 14, 104, 0.02, 0.82, { char: 0.38 + i * 0.12 });
    }
    steam(c, s.x, yTop + 14, t + 0.8, 1.1, 0.3);
    if (!hideLabel) label(c, 'Grill', s.x, yTop + 120, { size: 11, color: near ? PAL.gold : 'rgba(215,230,220,0.6)', align: 'center', weight: 700 });
  }

  if (s.kind === 'sauce') {
    c.fillStyle = 'rgba(0,0,0,0.32)';
    c.beginPath();
    c.ellipse(s.x, yTop + 64, 34, 13, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#26343a';
    c.beginPath();
    c.ellipse(s.x, yTop + 60, 34, 18, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#0f1a1f';
    c.beginPath();
    c.ellipse(s.x, yTop + 56, 28, 14, 0, 0, Math.PI * 2);
    c.fill();
    peanutSauce(c, s.x, yTop + 55, 26);
    if (!hideLabel) label(c, 'Sauce', s.x, yTop + 96, { size: 11, color: near ? PAL.gold : 'rgba(215,230,220,0.6)', align: 'center', weight: 700 });
  }

  if (s.kind === 'prep') {
    c.fillStyle = '#7e4c28';
    rr(c, s.x - 54, yTop + 16, 108, 76, 6);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.22)';
    c.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.moveTo(s.x - 50, yTop + 24 + i * 14);
      c.lineTo(s.x + 50, yTop + 24 + i * 14);
      c.stroke();
    }
    c.strokeStyle = 'rgba(255,220,180,0.2)';
    c.lineWidth = 2;
    rr(c, s.x - 53, yTop + 17, 106, 74, 6);
    c.stroke();
    if (state.plate.items.length > 0 || state.hand === 'plate') {
      plated(c, s.x, yTop + 52, 50, partsOf(state));
      if (state.plate.burnt) {
        c.fillStyle = 'rgba(25,12,5,0.5)';
        c.beginPath();
        c.ellipse(s.x, yTop + 54, 38, 22, 0, 0, Math.PI * 2);
        c.fill();
      }
      steam(c, s.x, yTop + 34, t, 0.9, 0.2);
    } else {
      for (let i = 0; i < 3; i++) plated(c, s.x - 18 + i * 18, yTop + 54, 19, {});
    }
    if (!hideLabel) label(c, 'Plate', s.x, yTop + 106, { size: 11, color: near ? PAL.gold : 'rgba(215,230,220,0.6)', align: 'center', weight: 700 });
  }

  if (near && state.cooking && state.cooking.station === s.id) {
    const p = Math.min(1, state.cooking.t / state.cooking.need);
    c.fillStyle = 'rgba(0,0,0,0.62)';
    rr(c, s.x - 32, yTop + 2, 64, 9, 4);
    c.fill();
    c.fillStyle = p > 0.82 ? PAL.gold : '#8be08f';
    rr(c, s.x - 31, yTop + 3, 62 * p, 7, 4);
    c.fill();
  }
}

function passAlcove(c, state, t) {
  const x = LAYOUT.pass.x;
  // alcove frame on the wall
  const y0 = LAYOUT.wallBottom - 74;
  const g = c.createLinearGradient(0, y0, 0, LAYOUT.wallBottom);
  g.addColorStop(0, 'rgba(255,180,90,0.14)');
  g.addColorStop(1, 'rgba(255,180,90,0.03)');
  c.fillStyle = g;
  c.fillRect(1092, y0, 184, 74);
  c.strokeStyle = 'rgba(255,200,140,0.28)';
  c.lineWidth = 2;
  rr(c, 1092, y0 + 3, 184, 68, 7);
  c.stroke();
  label(c, 'PASS', x, y0 + 20, { size: 12, weight: 800, color: '#ffcf9a', align: 'center' });
  c.strokeStyle = 'rgba(255,170,90,0.5)';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x, y0 + 26);
  c.lineTo(x, y0 + 40);
  c.stroke();
  const lg = c.createLinearGradient(x - 46, y0 + 40, x + 46, y0 + 40);
  lg.addColorStop(0, 'rgba(255,140,60,0)');
  lg.addColorStop(0.5, 'rgba(255,175,95,0.65)');
  lg.addColorStop(1, 'rgba(255,140,60,0)');
  c.fillStyle = lg;
  c.fillRect(x - 46, y0 + 38, 92, 6);

  const ready = state.passReady || ['satay', 'gado'];
  // woven service mat under the pass plates
  c.fillStyle = 'rgba(90,60,30,0.55)';
  rr(c, x - 88, LAYOUT.counterTop + 34, 176, 76, 8);
  c.fill();
  c.strokeStyle = 'rgba(255,220,160,0.12)';
  c.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    c.beginPath();
    c.moveTo(x - 86, LAYOUT.counterTop + 40 + i * 10);
    c.lineTo(x + 86, LAYOUT.counterTop + 40 + i * 10);
    c.stroke();
  }
  plated(c, x - 40, LAYOUT.counterTop + 46, 52, ready.includes('satay') ? { satay: 3, sauce: true, garnish: true, sambal: true } : { rice: true });
  plated(c, x + 44, LAYOUT.counterTop + 48, 46, ready.includes('gado') ? { veg: true, sauce: true, krupuk: true, garnish: true } : {});
  steam(c, x - 40, LAYOUT.counterTop + 22, t, 0.9, 0.3);
  steam(c, x + 38, LAYOUT.counterTop + 24, t + 1.4, 0.9, 0.24);
  c.fillStyle = 'rgba(126,224,161,0.94)';
  rr(c, x - 32, LAYOUT.counterTop + 96, 64, 18, 4);
  c.fill();
  label(c, 'READY', x, LAYOUT.counterTop + 109, { size: 10, weight: 800, color: '#08170e', align: 'center' });
}

function customers(c, state, t) {
  // people at the counter, each with the ticket they are waiting on: the frame's proof of a live loop
  const spots = [{ x: 356, y: 414, c: '#2c4a52' }, { x: 466, y: 420, c: '#4a2f3a' }, { x: 592, y: 410, c: '#3a4a2c' }];
  const live = (state.orders || []).filter((o) => o.state === 'active').slice(0, 3);
  const waiting = state.customers || live.map((o) => ({ dish: o.recipeId, fuse: o.fuse / (o.maxFuse || 1) }));
  spots.forEach((s2, i) => {
    const w = waiting[i];
    if (!w) return;
    const bob = Math.sin(t * 1.6 + i * 1.7) * 2;
    c.save();
    c.translate(s2.x, s2.y + bob);
    // body
    c.fillStyle = s2.c;
    c.beginPath();
    c.moveTo(-26, 34);
    c.quadraticCurveTo(-30, -6, 0, -8);
    c.quadraticCurveTo(30, -6, 26, 34);
    c.closePath();
    c.fill();
    // head
    c.fillStyle = '#c98a5a';
    c.beginPath();
    c.arc(0, -20, 13, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.beginPath();
    c.arc(0, -26, 13, Math.PI, 0);
    c.fill();
    // eyes
    c.fillStyle = '#1a2220';
    c.beginPath();
    c.arc(-4.5, -19, 1.8, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(4.5, -19, 1.8, 0, Math.PI * 2);
    c.fill();
    // order bubble with the dish and its fuse
    const bx = 0;
    const by = -64;
    c.fillStyle = 'rgba(247,240,220,0.94)';
    rr(c, bx - 26, by - 16, 52, 30, 6);
    c.fill();
    c.fillStyle = 'rgba(247,240,220,0.94)';
    c.beginPath();
    c.moveTo(-5, by + 14);
    c.lineTo(5, by + 14);
    c.lineTo(0, by + 22);
    c.closePath();
    c.fill();
    if (w.dish === 'satay') {
      sataySkewer(c, bx, by - 2, 34, -0.12, 0.44, { char: 0.4 });
    } else if (w.dish === 'nasi') {
      riceMound(c, bx - 4, by + 2, 10);
      c.fillStyle = '#f0b93f';
      c.beginPath();
      c.arc(bx + 8, by - 2, 4, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillStyle = PAL.leaf;
      c.beginPath();
      c.ellipse(bx, by - 2, 14, 8, 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#a8cf6a';
      c.beginPath();
      c.ellipse(bx - 4, by - 5, 7, 4, 0.4, 0, Math.PI * 2);
      c.fill();
    }
    // fuse under the bubble
    c.fillStyle = 'rgba(29,42,38,0.18)';
    rr(c, bx - 20, by + 16, 40, 4, 2);
    c.fill();
    c.fillStyle = w.fuse < 0.35 ? '#cf3f2c' : '#4f9d63';
    rr(c, bx - 20, by + 16, 40 * w.fuse, 4, 2);
    c.fill();
    c.restore();
  });
}

function drawChef(c, state, t, opts) {
  const chef = state.chef || { x: 620, facing: 1, walking: false };
  const x = chef.x;
  const y = LAYOUT.standY;
  const bob = chef.walking ? Math.sin(t * 11) * 3 : Math.sin(t * 2) * 1;
  shadow(c, x, y + 30, 44, 12, 0.5);
  c.save();
  c.translate(x, y + bob);
  c.scale(1.08, 1.08);
  const flip = chef.facing >= 0 ? 1 : -1;
  c.scale(flip, 1);
  c.fillStyle = '#26343d';
  rr(c, -21, -4, 16, 32, 6);
  c.fill();
  rr(c, 5, -4, 16, 32, 6);
  c.fill();
  c.fillStyle = '#0f1e1c';
  rr(c, -23, 22, 19, 7, 3);
  c.fill();
  rr(c, 4, 22, 19, 7, 3);
  c.fill();
  const ag = c.createLinearGradient(0, -66, 0, 0);
  ag.addColorStop(0, '#f3ead6');
  ag.addColorStop(1, '#c7b795');
  c.fillStyle = ag;
  c.beginPath();
  c.moveTo(-29, -64);
  c.lineTo(29, -64);
  c.lineTo(35, 0);
  c.lineTo(-35, 0);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(150,60,40,0.7)';
  rr(c, -15, -36, 30, 5, 2);
  c.fill();
  c.fillStyle = '#8f3a28';
  c.beginPath();
  c.moveTo(-31, -98);
  c.quadraticCurveTo(0, -110, 31, -98);
  c.lineTo(33, -60);
  c.lineTo(-33, -60);
  c.closePath();
  c.fill();
  c.strokeStyle = '#cf9463';
  c.lineWidth = 12.5;
  c.lineCap = 'round';
  const arm = chef.walking ? Math.sin(t * 11) * 7 : 0;
  c.beginPath();
  c.moveTo(-25, -90);
  c.lineTo(-41, -54 + arm);
  c.stroke();
  c.beginPath();
  c.moveTo(25, -90);
  c.lineTo(43, -58 - arm);
  c.stroke();
  c.fillStyle = '#dca06d';
  c.beginPath();
  c.arc(0, -120, 20, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(0,0,0,0.12)';
  c.beginPath();
  c.arc(6, -116, 18, -0.6, 1.2);
  c.fill();
  c.fillStyle = '#f4ecd8';
  c.beginPath();
  c.arc(0, -130, 20, Math.PI, 0);
  c.fill();
  c.fillRect(-22, -132, 44, 8);
  c.fillStyle = 'rgba(0,0,0,0.16)';
  c.fillRect(-22, -126, 44, 2);
  c.fillStyle = 'rgba(180,90,60,0.9)';
  rr(c, -22, -133, 44, 4, 2);
  c.fill();
  c.restore();

  if (state.hand === 'plate') {
    const hx = x + (flip > 0 ? 44 : -44);
    c.strokeStyle = '#cf9463';
    c.lineWidth = 8;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x + (flip > 0 ? 26 : -26), y - 62);
    c.lineTo(hx, y - 74);
    c.stroke();
    plated(c, hx, y - 78, 30, partsOf(state));
    steam(c, hx, y - 92, t, 0.7, 0.16);
  }
}

function drawHand(c, state, t) {
  if (!state.hand || state.hand === 'plate') return;
  const x = (state.chef?.x ?? 620) + (state.chef?.facing >= 0 ? 62 : -62);
  const y = LAYOUT.standY - 158 + Math.sin(t * 3) * 2;
  const h = state.hand;
  const txt = heldName(h);
  const w = Math.max(80, txt.length * 6.8 + 16);
  c.fillStyle = 'rgba(4,10,9,0.82)';
  rr(c, x - w / 2, y - 46, w, 19, 5);
  c.fill();
  label(c, txt, x, y - 33, { size: 10.5, weight: 800, color: h.startsWith('burnt') ? PAL.bad : PAL.gold, align: 'center' });
  if (h.startsWith('burnt:')) {
    c.fillStyle = '#2a1a10';
    c.beginPath();
    c.arc(x, y - 12, 11, 0, Math.PI * 2);
    c.fill();
  } else if (h.includes('satay')) {
    sataySkewer(c, x, y - 10, 46, -0.35, 0.6, { char: 0.5 });
  } else if (h.includes('rice')) {
    riceMound(c, x, y - 12, 18);
  } else if (h === 'veg') {
    c.fillStyle = PAL.leaf;
    c.beginPath();
    c.ellipse(x, y - 12, 19, 12, 0.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#a8cf6a';
    c.beginPath();
    c.ellipse(x - 5, y - 16, 9, 5, 0.4, 0, Math.PI * 2);
    c.fill();
  } else if (h === 'egg') {
    c.fillStyle = '#fbf7ea';
    c.beginPath();
    c.ellipse(x, y - 12, 16, 11, 0.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#f0b93f';
    c.beginPath();
    c.arc(x, y - 12, 7, 0, Math.PI * 2);
    c.fill();
  }
}
