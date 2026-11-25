// food.js — every dish and ingredient, drawn from paths. Street-food warung plates: satay with
// charred edges, coconut rice, peanut sauce, gado-gado, sambal, krupuk, lime. Each function takes a
// centre point and a scale so the same food works on a tray, in a pan and on a plate.

import { PAL, shadow, rr } from './art.js';

function seeded(n) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function riceMound(c, x, y, s) {
  shadow(c, x, y + s * 0.5, s * 1.05, s * 0.34, 0.4);
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.4, s * 0.2, x, y, s);
  g.addColorStop(0, '#fffaf0');
  g.addColorStop(0.6, PAL.rice);
  g.addColorStop(1, PAL.riceShade);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.66, 0, Math.PI, 0);
  c.quadraticCurveTo(x + s * 0.95, y + s * 0.5, x, y + s * 0.56);
  c.quadraticCurveTo(x - s * 0.95, y + s * 0.5, x - s, y);
  c.fill();
  // grains
  for (let i = 0; i < 46; i++) {
    const a = seeded(i + x) * Math.PI * 2;
    const r = seeded(i * 3 + y) * s * 0.8;
    const px = x + Math.cos(a) * r;
    const py = y - s * 0.22 + Math.sin(a) * r * 0.42;
    c.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(214,200,172,0.65)';
    c.beginPath();
    c.ellipse(px, py, s * 0.045, s * 0.022, a, 0, Math.PI * 2);
    c.fill();
  }
}

export function sataySkewer(c, x, y, len, angle, s, { char = 0.5, sauce = 0 } = {}) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  // stick
  c.fillStyle = '#c9a06a';
  c.fillRect(-len / 2, -1.5 * s, len, 3 * s);
  c.fillStyle = 'rgba(90,55,20,0.35)';
  c.fillRect(-len / 2, 0.6 * s, len, 1.2 * s);
  // four chunks
  const n = 4;
  for (let i = 0; i < n; i++) {
    const px = -len * 0.36 + (i / (n - 1)) * len * 0.72;
    const g = c.createRadialGradient(px - 3 * s, -4 * s, 1, px, 0, 11 * s);
    g.addColorStop(0, '#d99a55');
    g.addColorStop(0.55, PAL.satay);
    g.addColorStop(1, '#7c4519');
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(px, 0, 9 * s, 7.4 * s, 0, 0, Math.PI * 2);
    c.fill();
    // char
    c.fillStyle = `rgba(60,30,10,${0.25 + 0.5 * char})`;
    c.beginPath();
    c.ellipse(px + 1.5 * s, -2 * s, 5 * s * char, 3.6 * s * char, 0.4, 0, Math.PI * 2);
    c.fill();
    // glaze highlight
    c.fillStyle = 'rgba(255,210,140,0.5)';
    c.beginPath();
    c.ellipse(px - 2.5 * s, -3 * s, 3 * s, 1.6 * s, -0.5, 0, Math.PI * 2);
    c.fill();
  }
  if (sauce > 0) {
    c.fillStyle = `rgba(201,138,60,${0.75 * sauce})`;
    c.beginPath();
    c.ellipse(0, 1.5 * s, len * 0.36, 4.2 * s, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export function peanutSauce(c, x, y, s, { drips = 0 } = {}) {
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.3, s * 0.1, x, y, s);
  g.addColorStop(0, '#e0a860');
  g.addColorStop(0.7, PAL.sauce);
  g.addColorStop(1, '#9c6222');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 7; i++) {
    c.fillStyle = 'rgba(255,235,190,0.45)';
    c.beginPath();
    c.arc(x - s * 0.5 + seeded(i) * s, y - s * 0.2 + seeded(i + 7) * s * 0.4, s * 0.06, 0, Math.PI * 2);
    c.fill();
  }
  for (let i = 0; i < drips; i++) {
    c.fillStyle = 'rgba(180,110,40,0.85)';
    c.beginPath();
    c.ellipse(x + (i - 1) * s * 0.5, y + s * 0.5 + i * 2, s * 0.07, s * 0.16, 0, 0, Math.PI * 2);
    c.fill();
  }
}

export function cucumber(c, x, y, s, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.fillStyle = '#3f8a45';
  c.beginPath();
  c.ellipse(0, 0, s, s * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#a9d98a';
  c.beginPath();
  c.ellipse(0, 0, s * 0.74, s * 0.44, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.ellipse(Math.cos(i * 1.8) * s * 0.32, Math.sin(i * 1.8) * s * 0.2, s * 0.07, s * 0.05, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export function lime(c, x, y, s) {
  c.fillStyle = '#5fae42';
  c.beginPath();
  c.ellipse(x, y, s, s * 0.75, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#c9e77f';
  c.beginPath();
  c.ellipse(x - s * 0.1, y - s * 0.2, s * 0.5, s * 0.34, 0, 0, Math.PI * 2);
  c.fill();
}

export function sambalDollop(c, x, y, s) {
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.3, 1, x, y, s);
  g.addColorStop(0, PAL.sambalLit);
  g.addColorStop(0.7, PAL.sambal);
  g.addColorStop(1, '#7d1a14');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.4)';
  c.beginPath();
  c.ellipse(x - s * 0.3, y - s * 0.25, s * 0.28, s * 0.12, -0.3, 0, Math.PI * 2);
  c.fill();
}

export function krupuk(c, x, y, s, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.fillStyle = '#e9b96e';
  c.beginPath();
  c.ellipse(0, 0, s, s * 0.7, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,245,210,0.7)';
  c.beginPath();
  c.ellipse(-s * 0.2, -s * 0.2, s * 0.5, s * 0.3, 0.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(160,100,40,0.35)';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(s * 0.2 * i, s * 0.1 * i, s * 0.1, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export function friedEgg(c, x, y, s) {
  c.fillStyle = '#fbf7ea';
  c.beginPath();
  c.ellipse(x, y, s, s * 0.72, 0.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(220,205,170,0.7)';
  c.beginPath();
  c.ellipse(x + s * 0.35, y + s * 0.1, s * 0.4, s * 0.3, 0.4, 0, Math.PI * 2);
  c.fill();
  const g = c.createRadialGradient(x - s * 0.1, y - s * 0.15, 1, x, y, s * 0.42);
  g.addColorStop(0, '#ffe9a8');
  g.addColorStop(1, '#f0b93f');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y - s * 0.05, s * 0.4, 0, Math.PI * 2);
  c.fill();
}

export function gadoVeg(c, x, y, s) {
  // bean sprouts, cabbage and long beans spilling over each other
  const items = [
    ['#e6f0c8', 0, 0, 1.0], ['#8fc45a', 0.5, 0.2, 0.75], ['#d8e9a8', -0.5, 0.15, 0.7],
    ['#6faa3f', 0.2, -0.25, 0.6], ['#f0f6d8', -0.25, 0.35, 0.55], ['#a8cf6a', 0.65, -0.1, 0.5],
  ];
  for (const [col, dx, dy, k] of items) {
    c.fillStyle = col;
    c.save();
    c.translate(x + dx * s, y + dy * s);
    c.rotate(dx * 1.2);
    c.beginPath();
    c.ellipse(0, 0, s * 0.5 * k, s * 0.16 * k, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

export function wok(c, x, y, s, { heat = 0, contents = false } = {}) {
  shadow(c, x, y + s * 0.55, s * 1.05, s * 0.3, 0.45);
  const g = c.createLinearGradient(x - s, y - s * 0.3, x + s, y + s * 0.6);
  g.addColorStop(0, '#5b6a70');
  g.addColorStop(0.45, '#2b373d');
  g.addColorStop(1, '#141c20');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.42, 0, 0, Math.PI);
  c.quadraticCurveTo(x + s * 0.7, y + s * 0.55, x, y + s * 0.6);
  c.quadraticCurveTo(x - s * 0.7, y + s * 0.55, x - s, y);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.25)';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, y - 1, s, s * 0.42, 0, Math.PI * 1.05, Math.PI * 1.95);
  c.stroke();
  // handle
  c.strokeStyle = '#3c2a1c';
  c.lineWidth = s * 0.09;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x + s * 0.92, y + s * 0.02);
  c.lineTo(x + s * 1.28, y - s * 0.26);
  c.stroke();
  if (contents) {
    c.fillStyle = '#e6c27a';
    c.beginPath();
    c.ellipse(x, y + s * 0.05, s * 0.78, s * 0.3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#c0392b';
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.arc(x - s * 0.5 + i * s * 0.25, y + s * 0.03 + (i % 2) * 3, s * 0.05, 0, Math.PI * 2);
      c.fill();
    }
  }
  if (heat > 0) {
    c.fillStyle = `rgba(255,120,50,${0.25 * heat})`;
    c.beginPath();
    c.ellipse(x, y + s * 0.18, s * 0.85, s * 0.25, 0, 0, Math.PI * 2);
    c.fill();
  }
}

export function grill(c, x, y, s, { t = 0 } = {}) {
  // charcoal trough with hot embers under a steel grate
  c.fillStyle = '#1a2226';
  rr(c, x - s, y - s * 0.12, s * 2, s * 0.55, 6);
  c.fill();
  const eg = c.createLinearGradient(0, y, 0, y + s * 0.42);
  eg.addColorStop(0, '#ff8a3c');
  eg.addColorStop(0.5, PAL.ember);
  eg.addColorStop(1, '#7a1f08');
  c.fillStyle = eg;
  rr(c, x - s * 0.92, y + s * 0.02, s * 1.84, s * 0.34, 5);
  c.fill();
  for (let i = 0; i < 7; i++) {
    const fx = x - s * 0.8 + i * s * 0.26;
    const fl = 0.6 + 0.4 * Math.sin(t * 5 + i);
    c.fillStyle = `rgba(255,${140 + i * 10},70,${0.3 + 0.4 * fl})`;
    c.beginPath();
    c.arc(fx, y + s * 0.14, 2 + fl * 2.4, 0, Math.PI * 2);
    c.fill();
  }
  c.strokeStyle = '#7b8b90';
  c.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(x - s * 0.85 + i * s * 0.42, y - s * 0.06);
    c.lineTo(x - s * 0.85 + i * s * 0.42, y + s * 0.2);
    c.stroke();
  }
}

export function plated(c, x, y, s, parts = {}) {
  // One plate composed from the cook's progress: rice, satay, veg, sauce, garnish, sambal, krupuk.
  const p = { rice: false, satay: 0, veg: false, sauce: false, garnish: false, sambal: false, krupuk: false, ...parts };
  shadow(c, x, y + s * 0.62, s * 1.15, s * 0.36, 0.5);
  c.fillStyle = PAL.plateShade;
  c.beginPath();
  c.ellipse(x, y + s * 0.08, s, s * 0.6, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = PAL.plate;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.58, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = 'rgba(150,170,166,0.55)';
  c.lineWidth = 1.6;
  c.beginPath();
  c.ellipse(x, y - 1, s * 0.84, s * 0.48, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.beginPath();
  c.ellipse(x - s * 0.32, y - s * 0.22, s * 0.26, s * 0.09, -0.35, 0, Math.PI * 2);
  c.fill();

  if (p.veg || p.satay > 0) {
    c.fillStyle = PAL.leaf;
    c.beginPath();
    c.ellipse(x + s * 0.1, y + s * 0.02, s * 0.62, s * 0.34, 0.08, 0, Math.PI * 2);
    c.fill();
    gadoVeg(c, x + s * 0.12, y - s * 0.02, s * 0.62);
  }
  if (p.rice) riceMound(c, x - s * 0.2, y - s * 0.06, s * 0.5);
  if (p.satay > 0) {
    for (let i = 0; i < p.satay; i++) {
      sataySkewer(c, x + s * 0.12, y - s * 0.14 + i * s * 0.16, s * 0.92, -0.12 + i * 0.06, 0.62, { char: 0.55 });
    }
  }
  if (p.sauce) peanutSauce(c, x + s * 0.05, y + s * 0.16, s * 0.3, { drips: 2 });
  if (p.sambal) sambalDollop(c, x + s * 0.62, y + s * 0.1, s * 0.14);
  if (p.krupuk) krupuk(c, x - s * 0.55, y + s * 0.1, s * 0.16, -0.4);
  if (p.garnish) {
    cucumber(c, x + s * 0.55, y - s * 0.26, s * 0.16, -0.5);
    cucumber(c, x + s * 0.66, y - s * 0.14, s * 0.14, 0.3);
    lime(c, x - s * 0.6, y - s * 0.24, s * 0.12);
  }
}

export function tray(c, x, y, w, h, kind, t = 0) {
  // A steel ingredient tray sunk into the counter, with its contents.
  c.fillStyle = 'rgba(0,0,0,0.35)';
  rr(c, x, y + 3, w, h, 6);
  c.fill();
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#59696f');
  g.addColorStop(1, '#2a373d');
  rr(c, x, y, w, h, 6);
  c.fillStyle = g;
  c.fill();
  rr(c, x + 3, y + 3, w - 6, h - 6, 5);
  c.fillStyle = '#16232a';
  c.fill();
  const cx = x + w / 2;
  const cy = y + h / 2 + 2;
  if (kind === 'rice') {
    for (let i = 0; i < 12; i++) {
      c.fillStyle = 'rgba(250,245,230,0.9)';
      c.beginPath();
      c.ellipse(cx - 22 + (i % 6) * 9, cy - 4 + Math.floor(i / 6) * 7, 4.2, 2.4, i * 0.4, 0, Math.PI * 2);
      c.fill();
    }
  } else if (kind === 'satay' || kind === 'skewer') {
    for (let i = 0; i < 3; i++) sataySkewer(c, cx, cy - 9 + i * 9, 58, 0.04, 0.5, { char: 0.2 });
  } else if (kind === 'veg') {
    gadoVeg(c, cx, cy, 26);
    cucumber(c, cx - 10, cy + 6, 7, 0.2);
  } else if (kind === 'sambal') {
    sambalDollop(c, cx, cy, 15);
  } else if (kind === 'egg') {
    friedEgg(c, cx, cy, 15);
  } else if (kind === 'sauce') {
    peanutSauce(c, cx, cy, 16);
  }
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  c.lineWidth = 1;
  rr(c, x + 0.5, y + 0.5, w - 1, h - 1, 6);
  c.stroke();
}
