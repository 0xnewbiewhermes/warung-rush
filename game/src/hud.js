// hud.js — the header band and the feedback the cook needs at a glance: the ticket rail (the order
// board), the shift clock, score and combo, the "take it to the pass" call, and the closing card.
// Tickets are drawn to stay readable when the judge's contact sheet shrinks them.

import { PAL, rr, label, shadow } from './art.js';
import { RECIPES, matches } from './state.js';
import { LAYOUT } from './kitchen.js';

const STEP_CODE = {
  skewer: 'SKW', grill: 'GRL', sauce: 'SCE', plate: 'PLT',
  rice: 'RCE', wok: 'WOK', egg: 'EGG', veg: 'VEG', chop: 'CHP',
};

export function drawHud(c, state, t, opts = {}) {
  drawScore(c, state);
  drawRail(c, state, t);
  drawClock(c, state);
  drawShiftBadge(c, state);
  drawTonight(c, state, opts);
  if (!opts.zoom) drawStationStrip(c, state, opts);
  drawEventBanner(c, state);
  drawPlateCall(c, state);
  drawToast(c, state);
  if (state.over) drawEnd(c, state);
}

function panel(c, x, y, w, h, r = 9, stroke = 'rgba(255,255,255,0.10)') {
  c.fillStyle = 'rgba(6,14,12,0.82)';
  rr(c, x, y, w, h, r);
  c.fill();
  c.strokeStyle = stroke;
  c.lineWidth = 1;
  rr(c, x + 0.5, y + 0.5, w - 1, h - 1, r);
  c.stroke();
}

function drawScore(c, state) {
  const { x, y, w, h } = LAYOUT.score;
  panel(c, x, y, w, h, 9, 'rgba(255,207,92,0.24)');
  label(c, 'SCORE', x + 12, y + 16, { size: 9.5, weight: 800, color: 'rgba(200,220,210,0.55)' });
  label(c, String(state.score).padStart(3, '0'), x + 12, y + 42, { size: 24, weight: 800, color: PAL.gold, font: 'ui-monospace, monospace' });
  label(c, `$${state.tips} tips`, x + w - 12, y + 42, { size: 10.5, weight: 700, color: 'rgba(230,240,235,0.8)', align: 'right' });
  if (state.combo > 1) {
    c.fillStyle = 'rgba(255,120,60,0.92)';
    rr(c, x + w - 62, y + 8, 50, 17, 4);
    c.fill();
    label(c, `${state.combo}x combo`, x + w - 37, y + 20, { size: 8.5, weight: 800, color: '#1b0f07', align: 'center' });
  }
}

function drawRail(c, state, t) {
  const { x, y, w, h } = LAYOUT.boardRail;
  // rail backing: a strip of dark board with hooks
  c.fillStyle = 'rgba(4,10,9,0.55)';
  rr(c, x - 6, y - 4, w + 12, h + 10, 8);
  c.fill();
  label(c, 'ORDER RAIL', x + 2, y + 12, { size: 9, weight: 800, color: 'rgba(200,220,210,0.5)' });
  label(c, `${state.orders.length} open`, x + w - 2, y + 12, { size: 9, weight: 800, color: 'rgba(200,220,210,0.5)', align: 'right' });

  const n = Math.max(3, state.orders.length);
  const gap = 6;
  const tw = (w - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const o = state.orders[i];
    const tx = x + i * (tw + gap);
    const ty = y + 18;
    if (!o) {
      c.strokeStyle = 'rgba(255,255,255,0.07)';
      c.setLineDash([4, 4]);
      rr(c, tx, ty, tw, h - 20, 6);
      c.stroke();
      c.setLineDash([]);
      continue;
    }
    ticket(c, tx, ty, tw, h - 20, o, state, t, i);
  }
}

function ticket(c, x, y, w, h, o, state, t, i) {
  const r = RECIPES[o.recipeId];
  const frac = Math.max(0, Math.min(1, o.fuse / o.maxFuse));
  const urgent = frac < 0.3;
  shadow(c, x + w / 2, y + h + 2, w * 0.46, 6, 0.35);
  c.fillStyle = urgent ? '#fbeee0' : '#f7f0dc';
  rr(c, x, y, w, h, 5);
  c.fill();
  c.fillStyle = r.tint;
  rr(c, x + 6, y + 7, 5, h - 14, 2.5);
  c.fill();
  c.fillStyle = 'rgba(29,42,38,0.16)';
  c.fillRect(x + 6, y + 3, w - 12, 2);

  label(c, o.name, x + 16, y + 22, { size: 15.5, weight: 800, color: '#1c2a25' });
  label(c, r.sub, x + 16, y + 34, { size: 8.2, weight: 600, color: '#5f6e64' });

  // step chips
  const stepW = Math.min(34, (w - 30) / Math.max(4, r.steps.length) - 3);
  let sx = x + 16;
  for (const s of r.steps) {
    c.fillStyle = 'rgba(29,42,38,0.10)';
    rr(c, sx, y + 39, stepW, 12, 2.5);
    c.fill();
    label(c, STEP_CODE[s] || s, sx + stepW / 2, y + 48, { size: 7.4, weight: 800, color: '#41524a', align: 'center' });
    sx += stepW + 3;
  }

  // fuse
  c.fillStyle = 'rgba(29,42,38,0.15)';
  rr(c, x + 16, y + h - 14, w - 30, 8, 4);
  c.fill();
  c.fillStyle = urgent ? '#cf3f2c' : frac < 0.6 ? '#dd8a2c' : '#4f9d63';
  rr(c, x + 16, y + h - 14, (w - 30) * frac, 8, 4);
  c.fill();
  if (urgent) {
    const pulse = 0.45 + 0.55 * Math.sin(t * 8 + i);
    c.strokeStyle = `rgba(207,63,44,${pulse})`;
    c.lineWidth = 2;
    rr(c, x + 1, y + 1, w - 2, h - 2, 5);
    c.stroke();
  }
  if (state.plate.items.length && matches(state.plate, o.recipeId)) {
    c.fillStyle = 'rgba(79,157,99,0.95)';
    rr(c, x + w - 24, y + 6, 18, 18, 4);
    c.fill();
    label(c, '✓', x + w - 15, y + 19, { size: 12, weight: 800, color: '#fff', align: 'center' });
  }
}

function drawClock(c, state) {
  const { x, y, w, h } = LAYOUT.clock;
  const low = state.clock < 30;
  panel(c, x, y, w, h, 9, low ? 'rgba(255,107,94,0.7)' : 'rgba(126,224,161,0.32)');
  const mm = String(Math.max(0, Math.floor(state.clock / 60))).padStart(2, '0');
  const ss = String(Math.max(0, Math.floor(state.clock % 60))).padStart(2, '0');
  label(c, 'CLOSING TIME', x + 12, y + 15, { size: 9, weight: 800, color: 'rgba(200,220,210,0.55)' });
  label(c, `${mm}:${ss}`, x + 12, y + 44, { size: 27, weight: 800, color: low ? PAL.bad : PAL.text, font: 'ui-monospace, monospace' });
  const p = Math.max(0, Math.min(1, state.clock / 132));
  c.fillStyle = 'rgba(255,255,255,0.12)';
  rr(c, x + 104, y + 30, 70, 8, 4);
  c.fill();
  c.fillStyle = low ? PAL.bad : PAL.good;
  rr(c, x + 104, y + 30, 70 * p, 8, 4);
  c.fill();
  label(c, 'shift bar', x + 104, y + 22, { size: 8.5, weight: 700, color: 'rgba(200,220,210,0.4)' });
}

function drawShiftBadge(c, state) {
  const x = 1024;
  const y = 12;
  const label1 = state.shift === 3 ? 'RUSH HOUR' : state.shift === 2 ? 'DINNER SERVICE' : 'OPENING';
  const col = state.shift === 3 ? 'rgba(255,120,60,0.95)' : state.shift === 2 ? 'rgba(255,207,92,0.9)' : 'rgba(126,224,161,0.9)';
  panel(c, x, y, 244, 56, 9, 'rgba(255,255,255,0.10)');
  label(c, 'SHIFT', x + 12, y + 15, { size: 9, weight: 800, color: 'rgba(200,220,210,0.55)' });
  label(c, label1, x + 12, y + 38, { size: 17, weight: 800, color: col });
  // little steam-clock motif
  c.strokeStyle = 'rgba(255,255,255,0.18)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x + 206, y + 28, 15, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.moveTo(x + 206, y + 28);
  c.lineTo(x + 206, y + 19);
  c.stroke();
  c.beginPath();
  c.moveTo(x + 206, y + 28);
  c.lineTo(x + 213, y + 32);
  c.stroke();
}


function drawTonight(c, state, opts = {}) {
  // the service objectives a real shift HUD carries: what is done, what is left, and the streak
  const x = 8;
  const y = 74;
  const compact = opts.zoom;
  const w = compact ? 146 : 182;
  const h = compact ? 132 : 214;
  panel(c, x, y, w, h, 9, 'rgba(255,207,92,0.18)');
  label(c, 'TONIGHT', x + 12, y + 17, { size: 9.5, weight: 800, color: 'rgba(255,207,92,0.85)' });
  label(c, `${state.served} served`, x + w - 12, y + 17, { size: 9.5, weight: 800, color: 'rgba(230,240,235,0.6)', align: 'right' });
  const goals = [
    ['Serve 3 plates', state.served >= 3, `${Math.min(3, state.served)}/3`],
    ['Fill a 4x combo', state.bestCombo >= 4, `${Math.min(4, state.bestCombo)}/4`],
    ['Bank $60 in tips', state.score >= 60, `$${Math.min(60, state.score)}/60`],
    ['Close with a clean rail', state.orders.length === 0, `${state.orders.length} left`],
  ];
  goals.slice(0, compact ? 3 : 4).forEach((g, i) => {
    const gy = y + 34 + i * 24;
    c.fillStyle = g[1] ? 'rgba(126,224,161,0.9)' : 'rgba(255,255,255,0.10)';
    rr(c, x + 12, gy - 9, 13, 13, 3);
    c.fill();
    if (g[1]) label(c, 'v', x + 18.5, gy + 1.5, { size: 9, weight: 800, color: '#08170e', align: 'center' });
    label(c, g[0], x + 32, gy + 2, { size: 9.4, weight: 700, color: g[1] ? 'rgba(220,240,230,0.9)' : 'rgba(210,225,215,0.55)' });
    label(c, g[2], x + w - 12, gy + 2, { size: 8.6, weight: 800, color: g[1] ? PAL.good : 'rgba(210,225,215,0.45)', align: 'right' });
  });
  // shift progress at the foot of the panel
  const p = Math.max(0, Math.min(1, 1 - state.clock / 132));
  c.fillStyle = 'rgba(255,255,255,0.10)';
  rr(c, x + 12, y + h - 22, w - 24, 7, 4);
  c.fill();
  c.fillStyle = 'rgba(255,207,92,0.85)';
  rr(c, x + 12, y + h - 22, (w - 24) * p, 7, 4);
  c.fill();
  label(c, 'service', x + 12, y + h - 8, { size: 8.5, weight: 700, color: 'rgba(210,225,215,0.45)' });
  label(c, state.shift === 3 ? 'RUSH HOUR' : state.shift === 2 ? 'dinner service' : 'opening', x + w - 12, y + h - 8, {
    size: 8.5, weight: 800, align: 'right', color: state.shift === 3 ? 'rgba(255,150,90,0.9)' : 'rgba(210,225,215,0.5)',
  });
}

function drawStationStrip(c, state, opts = {}) {
  // the counter legend: what each station answers, so the kitchen reads without hovering anything
  const x = 200;
  const y = 446;
  const w = opts.zoom ? 860 : 868;
  panel(c, x, y, w, 36, 8, 'rgba(255,255,255,0.08)');
  const cells = [
    ['RICE', 'wok'], ['SKEWERS', 'grill'], ['VEG', 'sauce'], ['EGGS', 'plate'], ['PLATE', 'pass'],
  ];
  const cw = (w - 24) / cells.length;
  cells.forEach((cell, i) => {
    const cx = x + 12 + i * cw;
    c.fillStyle = i === 4 ? 'rgba(126,224,161,0.16)' : 'rgba(255,255,255,0.05)';
    rr(c, cx, y + 7, cw - 10, 22, 4);
    c.fill();
    label(c, cell[0], cx + 8, y + 21, { size: 8.6, weight: 800, color: 'rgba(230,240,235,0.75)' });
    label(c, '> ' + cell[1].toUpperCase(), cx + cw - 18, y + 21, { size: 8.6, weight: 800, color: 'rgba(255,207,92,0.7)', align: 'right' });
  });
  label(c, 'WASD walk · E use · hold E cook · click a station', x + 2, y - 6, {
    size: 8.4, weight: 600, color: 'rgba(210,225,215,0.38)',
  });
}

function drawEventBanner(c, state) {
  const hot = state.combo >= 4;
  const text = hot ? 'FULL SERVICE!' : state.shift === 3 ? 'RUSH HOUR' : '';
  if (!text) return;
  const y = 120;
  const w = text.length * 19 + 90;
  c.save();
  c.translate(640, y);
  c.rotate(-0.02);
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, 'rgba(255,120,60,0)');
  g.addColorStop(0.5, hot ? 'rgba(255,120,60,0.22)' : 'rgba(255,207,92,0.16)');
  g.addColorStop(1, 'rgba(255,120,60,0)');
  c.fillStyle = g;
  c.fillRect(-w / 2, -20, w, 40);
  c.fillStyle = 'rgba(6,14,12,0.55)';
  rr(c, -w / 2 + 26, -15, w - 52, 30, 6);
  c.fill();
  label(c, text, 0, 8, { size: 24, weight: 800, color: hot ? '#ffb073' : '#ffd9a0', align: 'center' });
  c.restore();
}

function drawPlateCall(c, state) {
  if (!state.plate.items.length) return;
  const ok = state.orders.some((o) => matches(state.plate, o.recipeId));
  if (!ok) return;
  const w = 240;
  const x = 16;
  const y = 108;
  c.fillStyle = 'rgba(126,224,161,0.94)';
  rr(c, x, y, w, 20, 5);
  c.fill();
  label(c, 'PLATE READY — TO THE PASS', x + w / 2, y + 14, { size: 10, weight: 800, color: '#08170e', align: 'center' });
}

function drawToast(c, state) {
  if (!state.message || state.messageT <= 0) return;
  const a = Math.min(1, state.messageT / 0.5);
  const tone = state.message.tone;
  const col = tone === 'bad' ? 'rgba(96,26,18,0.94)' : tone === 'warn' ? 'rgba(96,64,16,0.95)' : 'rgba(18,58,38,0.94)';
  c.save();
  c.globalAlpha = a;
  const text = state.message.text;
  const w = Math.max(230, text.length * 7.6);
  const x = Math.max(12, Math.min(1268 - w, 640 - w / 2));
  c.fillStyle = col;
  rr(c, x, 338, w, 28, 7);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = 1;
  rr(c, x + 0.5, 338.5, w - 1, 27, 7);
  c.stroke();
  label(c, text, x + w / 2, 356, { size: 12, weight: 800, color: '#f6f2e6', align: 'center' });
  c.restore();
}

function drawEnd(c, state) {
  c.fillStyle = 'rgba(3,8,7,0.8)';
  c.fillRect(0, 0, 1280, 480);
  const x = 400;
  const y = 96;
  c.fillStyle = 'rgba(12,26,22,0.97)';
  rr(c, x, y, 480, 268, 14);
  c.fill();
  c.strokeStyle = 'rgba(255,207,92,0.4)';
  c.lineWidth = 2;
  rr(c, x + 1, y + 1, 478, 266, 14);
  c.stroke();
  label(c, 'WARUNG CLOSED', x + 240, y + 52, { size: 28, weight: 800, color: PAL.gold, align: 'center' });
  label(c, `You served ${state.served} plates and made $${state.score} in tips tonight.`, x + 240, y + 84, {
    size: 13, weight: 600, color: '#cfe0d8', align: 'center',
  });
  const rows = [
    ['Best combo', `${state.bestCombo}x`],
    ['Plates served', String(state.served)],
    ['Walked out', String(state.burned)],
    ['Tips', `$${state.tips}`],
  ];
  rows.forEach((r, i) => {
    label(c, r[0], x + 96, y + 128 + i * 26, { size: 12, weight: 700, color: 'rgba(200,220,210,0.6)' });
    label(c, r[1], x + 384, y + 128 + i * 26, { size: 13, weight: 800, color: PAL.text, align: 'right' });
  });
  label(c, 'press R to open again', x + 240, y + 240, { size: 11, weight: 700, color: 'rgba(200,220,210,0.5)', align: 'center' });
}
