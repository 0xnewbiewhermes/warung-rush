// food.js — every dish and ingredient drawn from canvas paths, tuned to read as food at thumbnail
// size: char stripes on the satay, egg and scallion flecks in the fried rice, a glossy sauce swirl,
// a banana leaf and lime on the plate. Each function takes a centre and a scale so the same dish
// works on a tray, in a pan and on a plate.

import { PAL, shadow, rr } from './art.js';

function seeded(n) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------- rice

export function riceMound(c, x, y, s, { fried = false } = {}) {
  shadow(c, x, y + s * 0.5, s * 1.05, s * 0.34, 0.4);
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.45, s * 0.15, x, y, s);
  g.addColorStop(0, '#fffdf3');
  g.addColorStop(0.55, PAL.rice);
  g.addColorStop(1, PAL.riceShade);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.66, 0, Math.PI, 0);
  c.quadraticCurveTo(x + s * 0.96, y + s * 0.46, x, y + s * 0.54);
  c.quadraticCurveTo(x - s * 0.96, y + s * 0.46, x - s, y);
  c.fill();
  // grains: short strokes, denser near the crown
  for (let i = 0; i < 58; i++) {
    const a = seeded(i + x) * Math.PI * 2;
    const r = Math.sqrt(seeded(i * 3 + y)) * s * 0.86;
    const px = x + Math.cos(a) * r;
    const py = y - s * 0.2 + Math.sin(a) * r * 0.4;
    c.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(214,200,172,0.6)';
    c.save();
    c.translate(px, py);
    c.rotate(a * 0.7);
    c.beginPath();
    c.ellipse(0, 0, s * 0.055, s * 0.023, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath();
  c.ellipse(x - s * 0.28, y - s * 0.42, s * 0.3, s * 0.1, -0.35, 0, Math.PI * 2);
  c.fill();
  if (fried) {
    // nasi goreng: egg, scallion and chili flecks through the rice
    const bits = [
      ['#f6d27a', 9], ['#7fbf5a', 7], ['#cf3f2c', 4], ['#fdf3d6', 6],
    ];
    let k = 0;
    for (const [col, n] of bits) {
      c.fillStyle = col;
      for (let i = 0; i < n; i++, k++) {
        const px = x - s * 0.7 + seeded(k * 7 + x) * s * 1.4;
        const py = y - s * 0.5 + seeded(k * 11 + y) * s * 0.75;
        c.beginPath();
        c.ellipse(px, py, s * 0.05, s * 0.03, k, 0, Math.PI * 2);
        c.fill();
      }
    }
    // a fried egg resting on top, sunny side up
    c.save();
    c.translate(x + s * 0.34, y - s * 0.42);
    c.fillStyle = '#fbf7ea';
    c.beginPath();
    c.ellipse(0, 0, s * 0.34, s * 0.26, 0.2, 0, Math.PI * 2);
    c.fill();
    const yg = c.createRadialGradient(-s * 0.05, -s * 0.05, 1, 0, 0, s * 0.18);
    yg.addColorStop(0, '#ffe9a8');
    yg.addColorStop(1, '#f0b93f');
    c.fillStyle = yg;
    c.beginPath();
    c.arc(0, -s * 0.02, s * 0.16, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
}

// ---------------------------------------------------------------- satay

export function sataySkewer(c, x, y, len, angle, s, { char = 0.5, sauce = 0, raw = false } = {}) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = '#d8b184';
  c.fillRect(-len / 2, -1.6 * s, len, 3.2 * s);
  c.fillStyle = 'rgba(90,55,20,0.35)';
  c.fillRect(-len / 2, 0.7 * s, len, 1.1 * s);
  const n = 4;
  for (let i = 0; i < n; i++) {
    const px = -len * 0.37 + (i / (n - 1)) * len * 0.74;
    const g = c.createRadialGradient(px - 3 * s, -4 * s, 1, px, 0, 11 * s);
    if (raw) {
      g.addColorStop(0, '#f0c39a');
      g.addColorStop(0.6, '#dda87c');
      g.addColorStop(1, '#a9794f');
    } else {
      g.addColorStop(0, '#e0a45c');
      g.addColorStop(0.55, PAL.satay);
      g.addColorStop(1, '#77431a');
    }
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(px, 0, 9.4 * s, 7.8 * s, 0, 0, Math.PI * 2);
    c.fill();
    if (!raw) {
      // char stripes
      c.fillStyle = `rgba(52,26,9,${0.35 + 0.45 * char})`;
      for (let b = -1; b <= 1; b++) {
        c.save();
        c.translate(px, 0);
        c.rotate(b * 0.5);
        c.beginPath();
        c.ellipse(0, b * 2.4 * s, 7.6 * s, 1.5 * s, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      // glaze
      c.fillStyle = 'rgba(255,214,150,0.55)';
      c.beginPath();
      c.ellipse(px - 2.6 * s, -3.4 * s, 3.2 * s, 1.5 * s, -0.5, 0, Math.PI * 2);
      c.fill();
    } else {
      c.fillStyle = 'rgba(255,235,210,0.35)';
      c.beginPath();
      c.ellipse(px - 2.4 * s, -2.8 * s, 2.8 * s, 1.2 * s, -0.5, 0, Math.PI * 2);
      c.fill();
    }
  }
  if (sauce > 0) {
    c.fillStyle = `rgba(201,138,60,${0.8 * sauce})`;
    c.beginPath();
    c.ellipse(0, 1.4 * s, len * 0.37, 4.4 * s, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = `rgba(255,235,190,${0.5 * sauce})`;
    c.beginPath();
    c.ellipse(-len * 0.12, 0.2 * s, len * 0.2, 1.6 * s, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export function peanutSauce(c, x, y, s, { drips = 0 } = {}) {
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.3, s * 0.1, x, y, s);
  g.addColorStop(0, '#e6ae66');
  g.addColorStop(0.7, PAL.sauce);
  g.addColorStop(1, '#8f5719');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  // swirl
  c.strokeStyle = 'rgba(255,232,190,0.5)';
  c.lineWidth = Math.max(1, s * 0.09);
  c.beginPath();
  c.arc(x - s * 0.1, y - s * 0.05, s * 0.45, 0.6, 2.6);
  c.stroke();
  for (let i = 0; i < 8; i++) {
    c.fillStyle = 'rgba(255,240,205,0.5)';
    c.beginPath();
    c.arc(x - s * 0.55 + seeded(i) * s * 1.1, y - s * 0.2 + seeded(i + 7) * s * 0.42, s * 0.055, 0, Math.PI * 2);
    c.fill();
  }
  for (let i = 0; i < drips; i++) {
    c.fillStyle = 'rgba(170,100,35,0.9)';
    c.beginPath();
    c.ellipse(x + (i - 1) * s * 0.5, y + s * 0.5 + i * 2, s * 0.07, s * 0.18, 0, 0, Math.PI * 2);
    c.fill();
  }
}

export function cucumber(c, x, y, s, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.fillStyle = '#2f7038';
  c.beginPath();
  c.ellipse(0, 0, s, s * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#b8e39a';
  c.beginPath();
  c.ellipse(0, 0, s * 0.74, s * 0.44, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.ellipse(Math.cos(i * 1.8) * s * 0.32, Math.sin(i * 1.8) * s * 0.2, s * 0.07, s * 0.05, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

export function lime(c, x, y, s) {
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath();
  c.ellipse(x + 1, y + 2, s, s * 0.7, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#4f9d3a';
  c.beginPath();
  c.ellipse(x, y, s, s * 0.75, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#d4ef8f';
  c.beginPath();
  c.ellipse(x - s * 0.08, y - s * 0.12, s * 0.62, s * 0.44, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.beginPath();
  c.ellipse(x - s * 0.3, y - s * 0.3, s * 0.2, s * 0.1, -0.5, 0, Math.PI * 2);
  c.fill();
}

export function sambalDollop(c, x, y, s) {
  const g = c.createRadialGradient(x - s * 0.3, y - s * 0.3, 1, x, y, s);
  g.addColorStop(0, PAL.sambalLit);
  g.addColorStop(0.7, PAL.sambal);
  g.addColorStop(1, '#701611');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, s, s * 0.64, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.45)';
  c.beginPath();
  c.ellipse(x - s * 0.3, y - s * 0.28, s * 0.3, s * 0.12, -0.3, 0, Math.PI * 2);
  c.fill();
  // a few chili seeds
  c.fillStyle = 'rgba(255,220,170,0.8)';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(x - s * 0.2 + i * s * 0.25, y + s * 0.1, s * 0.05, s * 0.03, i, 0, Math.PI * 2);
    c.fill();
  }
}

export function krupuk(c, x, y, s, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.beginPath();
  c.ellipse(2, 3, s, s * 0.7, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#eec27c';
  c.beginPath();
  c.ellipse(0, 0, s, s * 0.7, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,248,215,0.8)';
  c.beginPath();
  c.ellipse(-s * 0.2, -s * 0.2, s * 0.55, s * 0.32, 0.2, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(160,100,40,0.4)';
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.arc(s * 0.18 * i, s * 0.08 * i, s * 0.1, 0, Math.PI * 2);
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
  const items = [
    ['#eef6d4', 0, 0, 1.05], ['#8fc45a', 0.5, 0.18, 0.8], ['#d8e9a8', -0.5, 0.14, 0.75],
    ['#6faa3f', 0.22, -0.24, 0.62], ['#f6fbe4', -0.28, 0.32, 0.58], ['#a8cf6a', 0.66, -0.08, 0.5],
  ];
  for (const [col, dx, dy, k] of items) {
    c.fillStyle = col;
    c.save();
    c.translate(x + dx * s, y + dy * s);
    c.rotate(dx * 1.2);
    c.beginPath();
    c.ellipse(0, 0, s * 0.52 * k, s * 0.17 * k, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }
  // peanut dressing pour
  c.fillStyle = 'rgba(201,138,60,0.55)';
  c.beginPath();
  c.ellipse(x, y - s * 0.05, s * 0.5, s * 0.22, 0.1, 0, Math.PI * 2);
  c.fill();
}

// ---------------------------------------------------------------- equipment

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
  c.strokeStyle = '#3c2a1c';
  c.lineWidth = s * 0.09;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x + s * 0.92, y + s * 0.02);
  c.lineTo(x + s * 1.28, y - s * 0.26);
  c.stroke();
  if (contents) {
    // fried rice in the pan
    c.fillStyle = '#f1d79a';
    c.beginPath();
    c.ellipse(x, y + s * 0.06, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 6; i++) {
      c.fillStyle = ['#cf3f2c', '#7fbf5a', '#f6d27a'][i % 3];
      c.beginPath();
      c.arc(x - s * 0.55 + seeded(i) * s * 1.1, y + s * 0.02 + seeded(i + 3) * s * 0.2, s * 0.06, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.beginPath();
    c.ellipse(x - s * 0.3, y - s * 0.02, s * 0.3, s * 0.08, -0.1, 0, Math.PI * 2);
    c.fill();
  }
  if (heat > 0) {
    c.fillStyle = `rgba(255,120,50,${0.25 * heat})`;
    c.beginPath();
    c.ellipse(x, y + s * 0.18, s * 0.85, s * 0.25, 0, 0, Math.PI * 2);
    c.fill();
  }
}

export function grill(c, x, y, s, { t = 0 } = {}) {
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

// ---------------------------------------------------------------- the plate

export function plated(c, x, y, s, parts = {}) {
  const p = { rice: false, satay: 0, veg: false, sauce: false, garnish: false, sambal: false, krupuk: false, fried: false, ...parts };
  shadow(c, x, y + s * 0.62, s * 1.18, s * 0.36, 0.5);
  // plate body
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
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.beginPath();
  c.ellipse(x - s * 0.34, y - s * 0.24, s * 0.28, s * 0.1, -0.35, 0, Math.PI * 2);
  c.fill();

  // banana leaf under the food
  if (p.rice || p.satay > 0 || p.veg) {
    const lg = c.createLinearGradient(x - s * 0.6, y - s * 0.2, x + s * 0.6, y + s * 0.3);
    lg.addColorStop(0, '#3f8a52');
    lg.addColorStop(1, '#256b3a');
    c.fillStyle = lg;
    c.beginPath();
    c.ellipse(x + s * 0.05, y + s * 0.04, s * 0.66, s * 0.36, 0.08, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(190,240,190,0.4)';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(x - s * 0.55, y + s * 0.1);
    c.quadraticCurveTo(x + s * 0.05, y - s * 0.1, x + s * 0.62, y + s * 0.02);
    c.stroke();
  }
  if (p.veg) gadoVeg(c, x + s * 0.14, y - s * 0.02, s * 0.6);
  if (p.rice) riceMound(c, x - s * 0.18, y - s * 0.04, s * 0.5, { fried: p.fried });
  if (p.satay > 0) {
    const n = Math.min(3, p.satay);
    for (let i = 0; i < n; i++) {
      sataySkewer(c, x + s * 0.14 + i * s * 0.02, y - s * 0.16 + i * s * 0.17, s * 0.95, -0.1 + i * 0.05, 0.62, { char: 0.55 });
    }
  }
  if (p.sauce) peanutSauce(c, x + s * 0.04, y + s * 0.18, s * 0.3, { drips: 2 });
  if (p.sambal) sambalDollop(c, x + s * 0.64, y + s * 0.08, s * 0.15);
  if (p.krupuk) krupuk(c, x - s * 0.58, y + s * 0.1, s * 0.17, -0.4);
  if (p.garnish) {
    cucumber(c, x + s * 0.56, y - s * 0.26, s * 0.17, -0.5);
    cucumber(c, x + s * 0.68, y - s * 0.12, s * 0.15, 0.3);
    lime(c, x - s * 0.62, y - s * 0.24, s * 0.13);
  }
  // a final sheen across the whole plate
  c.fillStyle = 'rgba(255,255,255,0.06)';
  c.beginPath();
  c.ellipse(x, y, s * 0.95, s * 0.55, 0, 0, Math.PI * 2);
  c.fill();
}

export function tray(c, x, y, w, h, kind, t = 0) {
  c.fillStyle = 'rgba(0,0,0,0.35)';
  rr(c, x, y + 3, w, h, 6);
  c.fill();
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#5d6d73');
  g.addColorStop(1, '#26343a');
  rr(c, x, y, w, h, 6);
  c.fillStyle = g;
  c.fill();
  rr(c, x + 3, y + 3, w - 6, h - 6, 5);
  c.fillStyle = '#182730';
  c.fill();
  const cx = x + w / 2;
  const cy = y + h / 2 + 2;
  if (kind === 'rice') {
    riceMound(c, cx, cy + 6, 24);
  } else if (kind === 'satay' || kind === 'skewer') {
    for (let i = 0; i < 3; i++) sataySkewer(c, cx, cy - 9 + i * 9, 58, 0.04, 0.5, { raw: true });
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
