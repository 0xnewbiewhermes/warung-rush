// art.js — the game's drawing vocabulary: palette, night-market materials (wood, tile, steel,
// steam, embers) and small primitives every other module draws with. No images, no fonts, no
// network: every pixel here is a canvas path.

export const PAL = {
  night: '#08171a',
  wall: '#0e2a2f',
  wallDeep: '#0a2024',
  tile: '#123840',
  tileLine: '#0d2b32',
  lamp: '#ffb45a',
  lampCore: '#fff0c8',
  woodTop: '#b06a3a',
  woodTopLit: '#c9803f',
  woodSide: '#6f3d22',
  woodEdge: '#8b4d29',
  steel: '#40525b',
  steelLit: '#63787f',
  steelDark: '#22323a',
  ember: '#ff6a2a',
  emberHot: '#ffd166',
  leaf: '#2f7a4a',
  leafLit: '#4aa466',
  rice: '#f6efdd',
  riceShade: '#ddd0b4',
  sambal: '#b52d22',
  sambalLit: '#e0452f',
  satay: '#b06a2c',
  satayChar: '#45280f',
  sauce: '#c98a3c',
  cucumber: '#7fc46a',
  egg: '#f7d78a',
  plate: '#eef3f1',
  plateRim: '#b9c7c4',
  plateShade: '#c8d4d1',
  ticket: '#f6efdc',
  ticketInk: '#22302c',
  gold: '#ffcf5c',
  bad: '#ff6b5e',
  good: '#7ee0a1',
  text: '#f2f6f3',
  dim: '#93a8a0',
};

export function rr(c, x, y, w, h, r = 6) {
  const k = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + k, y);
  c.arcTo(x + w, y, x + w, y + h, k);
  c.arcTo(x + w, y + h, x, y + h, k);
  c.arcTo(x, y + h, x, y, k);
  c.arcTo(x, y, x + w, y, k);
  c.closePath();
}

export function fillRR(c, x, y, w, h, r, fill) {
  rr(c, x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
}

export function shadow(c, x, y, rx, ry, a = 0.35) {
  const g = c.createRadialGradient(x, y, 0, x, y, rx);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.save();
  c.translate(x, y);
  c.scale(1, ry / rx);
  c.beginPath();
  c.arc(0, 0, rx, 0, Math.PI * 2);
  c.fillStyle = g;
  c.fill();
  c.restore();
}

// The back wall: a tiled night-market wall with a warm wash from the hanging lamps.
export function wall(c, w, hWall, lampXs = []) {
  const g = c.createLinearGradient(0, 0, 0, hWall);
  g.addColorStop(0, PAL.wallDeep);
  g.addColorStop(0.55, PAL.wall);
  g.addColorStop(1, '#0c2529');
  c.fillStyle = g;
  c.fillRect(0, 0, w, hWall);
  // tiles
  c.strokeStyle = 'rgba(255,255,255,0.035)';
  c.lineWidth = 1;
  for (let y = 18; y < hWall; y += 26) {
    c.beginPath();
    c.moveTo(0, y + 0.5);
    c.lineTo(w, y + 0.5);
    c.stroke();
  }
  for (let x = 0; x < w; x += 34) {
    c.beginPath();
    c.moveTo(x + 0.5, 0);
    c.lineTo(x + 0.5, hWall);
    c.stroke();
  }
  // lamp glow
  for (const lx of lampXs) {
    const gg = c.createRadialGradient(lx, 10, 8, lx, 10, 190);
    gg.addColorStop(0, 'rgba(255,196,110,0.30)');
    gg.addColorStop(0.45, 'rgba(255,170,80,0.10)');
    gg.addColorStop(1, 'rgba(255,170,80,0)');
    c.fillStyle = gg;
    c.fillRect(lx - 200, 0, 400, hWall + 60);
  }
}

export function lamp(c, x, yTop, cordLen) {
  c.strokeStyle = '#0a1416';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x, yTop);
  c.lineTo(x, yTop + cordLen);
  c.stroke();
  const y = yTop + cordLen;
  c.fillStyle = '#1a2a2c';
  c.beginPath();
  c.moveTo(x - 22, y);
  c.lineTo(x + 22, y);
  c.lineTo(x + 12, y + 14);
  c.lineTo(x - 12, y + 14);
  c.closePath();
  c.fill();
  const g = c.createRadialGradient(x, y + 16, 2, x, y + 16, 26);
  g.addColorStop(0, PAL.lampCore);
  g.addColorStop(0.35, PAL.lamp);
  g.addColorStop(1, 'rgba(255,140,60,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y + 14, 26, 0, Math.PI * 2);
  c.fill();
}

// A wooden counter: top face with grain, a lit front edge and a dark apron.
export function counter(c, x, y, w, h, { lit = false } = {}) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, lit ? PAL.woodTopLit : PAL.woodTop);
  g.addColorStop(0.16, lit ? PAL.woodTop : PAL.woodEdge);
  g.addColorStop(1, PAL.woodSide);
  c.fillStyle = g;
  c.fillRect(x, y, w, h);
  // grain
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.strokeStyle = 'rgba(60,26,12,0.22)';
  c.lineWidth = 1;
  for (let i = 0; i < h * 0.9; i += 7) {
    const yy = y + 4 + i;
    c.beginPath();
    c.moveTo(x, yy);
    for (let xx = x; xx < x + w; xx += 40) c.lineTo(xx, yy + Math.sin((xx + i) * 0.05) * 1.1);
    c.stroke();
  }
  c.restore();
  // top highlight
  c.fillStyle = 'rgba(255,220,170,0.16)';
  c.fillRect(x, y, w, 2);
  c.fillStyle = 'rgba(0,0,0,0.28)';
  c.fillRect(x, y + h - 4, w, 4);
}

export function steelPanel(c, x, y, w, h, r = 4) {
  const g = c.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, PAL.steelLit);
  g.addColorStop(0.35, PAL.steel);
  g.addColorStop(1, PAL.steelDark);
  fillRR(c, x, y, w, h, r, g);
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = 1;
  rr(c, x + 0.5, y + 0.5, w - 1, h - 1, r);
  c.stroke();
}

export function steam(c, x, y, t, scale = 1, alpha = 0.5) {
  c.save();
  c.globalAlpha = alpha;
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = t * 1.5 + i * 2.1;
    const off = Math.sin(ph) * 6 * scale;
    c.lineWidth = (2.4 - i * 0.5) * scale;
    c.beginPath();
    c.moveTo(x + off * 0.2, y);
    c.bezierCurveTo(
      x - 8 * scale + off, y - 14 * scale,
      x + 10 * scale + off, y - 26 * scale,
      x + off * 0.5, y - 40 * scale,
    );
    c.stroke();
  }
  c.restore();
}

export function emberGlow(c, x, y, w, t) {
  const g = c.createRadialGradient(x, y, 2, x, y, w * 0.75);
  g.addColorStop(0, 'rgba(255,120,50,0.55)');
  g.addColorStop(0.5, 'rgba(255,90,30,0.18)');
  g.addColorStop(1, 'rgba(255,90,30,0)');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, w, w * 0.42, 0, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 9; i++) {
    const fx = x - w * 0.7 + ((i * 137.5) % (w * 1.4));
    const flick = 0.6 + 0.4 * Math.sin(t * 6 + i * 1.7);
    c.fillStyle = `rgba(255,${120 + Math.floor(70 * flick)},60,${0.35 + 0.3 * flick})`;
    c.beginPath();
    c.arc(fx, y + Math.sin(i * 2.3 + t * 3) * 3, 2.2 + flick * 1.6, 0, Math.PI * 2);
    c.fill();
  }
}

export function sparks(c, x, y, t, n = 5) {
  for (let i = 0; i < n; i++) {
    const p = ((t * 0.9 + i / n) % 1);
    const px = x + Math.sin(i * 3.1 + t) * 10;
    const py = y - p * 26;
    c.fillStyle = `rgba(255,190,90,${(1 - p) * 0.8})`;
    c.beginPath();
    c.arc(px, py, 1.6 * (1 - p) + 0.6, 0, Math.PI * 2);
    c.fill();
  }
}

export function label(c, text, x, y, { size = 13, color = PAL.text, weight = 600, align = 'left', font = 'ui-sans-serif, system-ui, sans-serif' } = {}) {
  c.fillStyle = color;
  c.font = `${weight} ${size}px ${font}`;
  c.textAlign = align;
  c.textBaseline = 'alphabetic';
  c.fillText(text, x, y);
}

export function plateShape(c, x, y, r, { leaf = false } = {}) {
  shadow(c, x, y + r * 0.55, r * 1.05, r * 0.34, 0.45);
  c.fillStyle = PAL.plateShade;
  c.beginPath();
  c.ellipse(x, y + 3, r, r * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = PAL.plate;
  c.beginPath();
  c.ellipse(x, y, r, r * 0.62, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = PAL.plateRim;
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, y - 1, r * 0.86, r * 0.53, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath();
  c.ellipse(x - r * 0.25, y - r * 0.2, r * 0.3, r * 0.12, -0.4, 0, Math.PI * 2);
  c.fill();
  if (leaf) {
    c.fillStyle = PAL.leaf;
    c.beginPath();
    c.ellipse(x + r * 0.18, y + 2, r * 0.55, r * 0.3, 0.15, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = PAL.leafLit;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x - r * 0.3, y + 4);
    c.lineTo(x + r * 0.6, y - 2);
    c.stroke();
  }
}
