// state.js — the rules of a shift: recipes, orders, the plate in progress, the clock, the score.
// The kitchen (kitchen.js) draws this state and main.js feeds it input; nothing here touches the
// canvas, so the same state can be staged for a screenshot or played for real.

export const RECIPES = {
  satay: {
    id: 'satay',
    name: 'Sate Ayam',
    sub: 'grilled skewers, peanut sauce',
    price: 14,
    steps: ['skewer', 'grill', 'sauce', 'plate'],
    parts: { satay: 3, sauce: true, garnish: true },
    tint: '#e0a860',
  },
  nasi: {
    id: 'nasi',
    name: 'Nasi Goreng',
    sub: 'wok rice, fried egg, sambal',
    price: 12,
    steps: ['rice', 'wok', 'egg', 'plate'],
    parts: { rice: true, sambal: true, garnish: true },
    tint: '#f0c86a',
  },
  gado: {
    id: 'gado',
    name: 'Gado-Gado',
    sub: 'blanched veg, peanut dressing',
    price: 11,
    steps: ['veg', 'chop', 'sauce', 'plate'],
    parts: { veg: true, sauce: true, krupuk: true, garnish: true },
    tint: '#9ad06a',
  },
};

export const PARTS_LABEL = {
  rice: 'rice',
  satay: 'skewers',
  veg: 'veg',
  sauce: 'sauce',
  sambal: 'sambal',
  garnish: 'garnish',
  krupuk: 'krupuk',
};

let nextId = 1;

export function makeOrder(recipeId, fuse = 26, age = 0) {
  const r = RECIPES[recipeId];
  return { id: nextId++, recipeId, name: r.name, sub: r.sub, price: r.price, fuse, maxFuse: fuse, age, state: 'active' };
}

export function plateParts(plate) {
  // which recipe parts a plate already satisfies
  const p = { rice: false, satay: 0, veg: false, sauce: false, garnish: false, sambal: false, krupuk: false };
  for (const it of plate.items) {
    if (it === 'rice') p.rice = true;
    if (it === 'satay') p.satay = Math.min(3, p.satay + 1);
    if (it === 'veg') p.veg = true;
    if (it === 'sauce') p.sauce = true;
    if (it === 'garnish') p.garnish = true;
    if (it === 'sambal') p.sambal = true;
    if (it === 'krupuk') p.krupuk = true;
  }
  return p;
}

export function matches(plate, recipeId) {
  const p = plateParts(plate);
  const want = RECIPES[recipeId].parts;
  for (const k of Object.keys(want)) {
    const w = want[k];
    if (typeof w === 'number') {
      if (p[k] < w) return false;
    } else if (!p[k]) return false;
  }
  return true;
}

export function plateValue(plate, recipeId) {
  const r = RECIPES[recipeId];
  const p = plateParts(plate);
  const want = r.parts;
  let have = 0;
  let total = 0;
  for (const k of Object.keys(want)) {
    total += 1;
    const w = want[k];
    if (typeof w === 'number') have += Math.min(1, p[k] / w);
    else have += p[k] ? 1 : 0;
  }
  return total ? have / total : 0;
}

export class Shift {
  constructor(seed = 7) {
    this.seed = seed;
    this.rand = mulberry(seed);
    this.orders = [];
    this.plate = { items: [], burnt: false, x: 0, y: 0 };
    this.hand = null; // 'rice' | 'skewer' | 'veg' | 'egg' | 'plate' | 'cooked:satay' ...
    this.clock = 132; // seconds left in the shift
    this.score = 0;
    this.tips = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.served = 0;
    this.burned = 0;
    this.spawnTimer = 2.2;
    this.shift = 1;
    this.message = null;
    this.messageT = 0;
    this.over = false;
    this.cook = { station: null, t: 0, need: 0 }; // progression of a hold-to-cook
    this.pops = []; // floating score numbers
  }

  nextRecipe() {
    const keys = Object.keys(RECIPES);
    return keys[Math.floor(this.rand() * keys.length)];
  }

  spawn() {
    if (this.orders.length >= 4) return;
    const fuse = Math.max(14, 30 - this.shift * 3 - this.orders.length * 1.5);
    this.orders.push(makeOrder(this.nextRecipe(), fuse));
  }

  notify(text, tone = 'good') {
    this.message = { text, tone };
    this.messageT = 2.2;
  }

  addPop(x, y, text, tone = 'gold') {
    this.pops.push({ x, y, text, tone, t: 0 });
  }

  tick(dt, t) {
    if (this.over) return;
    this.clock -= dt;
    if (this.clock <= 0) {
      this.clock = 0;
      this.over = true;
      return;
    }
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = Math.max(4.2, 9.5 - this.shift * 1.1);
    }
    if (this.shift === 1 && this.clock < 92) this.shift = 2;
    if (this.shift === 2 && this.clock < 52) {
      this.shift = 3;
      this.notify('Rush hour — the whole street is queuing', 'warn');
    }
    for (const o of this.orders) {
      if (o.state !== 'active') continue;
      o.age += dt;
      o.fuse -= dt;
      if (o.fuse <= 0) {
        o.fuse = 0;
        o.state = 'expired';
        this.combo = 0;
        this.notify(`${o.name} walked out`, 'bad');
        this.addPop(150, 250, '-', 'bad');
      }
    }
    const live = this.orders.filter((o) => o.state === 'active');
    this.orders = this.orders.filter((o) => o.state === 'active' || (o.age - 0) < 99);
    this.orders = live;
    if (this.messageT > 0) this.messageT -= dt;
    for (const p of this.pops) p.t += dt;
    this.pops = this.pops.filter((p) => p.t < 1.1);
  }

  serve(order) {
    const quality = plateValue(this.plate, order.recipeId);
    const speed = Math.max(0, Math.min(1, order.fuse / order.maxFuse));
    const base = RECIPES[order.recipeId].price;
    const gain = Math.round(base * (0.6 + 0.4 * quality) * (1 + 0.35 * speed));
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const comboBonus = Math.min(6, this.combo - 1);
    this.tips += comboBonus;
    this.score += gain + comboBonus;
    this.served += 1;
    this.addPop(order.x || 1160, 160, `+${gain + comboBonus}`, 'gold');
    this.notify(`${order.name} served${this.combo > 1 ? ` · ${this.combo}× combo` : ''}`, 'good');
    const idx = this.orders.indexOf(order);
    if (idx >= 0) this.orders.splice(idx, 1);
    this.plate = { items: [], burnt: false, x: 0, y: 0 };
    this.hand = null;
  }
}

export function mulberry(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
