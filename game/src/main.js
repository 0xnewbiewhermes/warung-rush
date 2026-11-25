// main.js — boots Warung Rush, runs the shift loop, reads keyboard and mouse, and stages the
// screenshot scenes. Everything else lives in its own module: state (rules), kitchen (room and
// stations), hud (what the cook reads), shot (the four frozen frames), food and art (the drawing).

import { Shift } from './state.js';
import { drawScene, useStation, cookTick, stationAt, LAYOUT } from './kitchen.js';
import { drawHud } from './hud.js';
import { stageShot } from './shot.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 7) || 7;
const zoom = Number(params.get('zoom') || 1) || 1;
const fx = Number(params.get('fx') || 640) || 640;
const fy = Number(params.get('fy') || 250) || 250;
const dy = Number(params.get('dy') || 0) || 0;

const state = new Shift(seed);
const chef = { x: 620, facing: 1, walking: false, carry: null };
state.chef = chef;
state.cook = null;
state.cooking = null;
state.wokContents = true;
state.chefNear = null;
state.chefNearStation = null;
state.carryingPlate = false;

const keys = new Set();
let last = performance.now();
let clockT = 0;
let holdE = false;

// ---------- audio: a tiny synth, no files, no network ----------
let actx = null;
function audio() {
  if (!actx) {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      actx = null;
    }
  }
  return actx;
}
function blip(freq, dur = 0.08, type = 'sine', gain = 0.05) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(a.destination);
  const now = a.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  o.start(now);
  o.stop(now + dur + 0.02);
}
function sfx(kind) {
  if (kind === 'pick') blip(520, 0.06, 'triangle');
  else if (kind === 'place') blip(360, 0.07, 'triangle');
  else if (kind === 'serve') { blip(660, 0.09, 'sine', 0.07); setTimeout(() => blip(880, 0.12, 'sine', 0.06), 80); }
  else if (kind === 'burnt') blip(120, 0.18, 'sawtooth', 0.05);
  else if (kind === 'cooked') blip(740, 0.07, 'square', 0.04);
  else if (kind === 'nope') blip(180, 0.05, 'sine', 0.03);
  else if (kind === 'plate') blip(440, 0.06, 'triangle');
}

// ---------- input ----------
addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['arrowleft', 'arrowright', 'a', 'd', 'e', ' ', 'r', 'w', 's', 'arrowup', 'arrowdown'].includes(k)) e.preventDefault();
  keys.add(k);
  if (k === 'e' || k === ' ') {
    if (!holdE) {
      holdE = true;
      interact();
    }
  }
  if (k === 'r' && state.over) restart();
});
addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  keys.delete(k);
  if (k === 'e' || k === ' ') holdE = false;
});
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 1280;
  const y = ((e.clientY - r.top) / r.height) * 480;
  // click a station: walk there and use it
  const s = nearestByX(x, y);
  if (s) {
    chef.x = Math.max(LAYOUT.chefMin, Math.min(LAYOUT.chefMax, s.x));
    chef.facing = s.x >= chef.x ? 1 : -1;
    refreshNear();
    interact();
  }
});

function nearestByX(x, y) {
  let best = null;
  let bestD = 1e9;
  for (const s of LAYOUT.stations) {
    const d = Math.abs(x - s.x) + Math.abs(y - (LAYOUT.counterTop + 40)) * 0.25;
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  const pass = { id: 'pass', kind: 'pass', x: LAYOUT.pass.x, w: LAYOUT.pass.w, name: 'Pass' };
  const dp = Math.abs(x - pass.x) + Math.abs(y - 140) * 0.25;
  if (dp < bestD) best = pass;
  return best;
}

function refreshNear() {
  const s = stationAt(chef.x);
  state.chefNear = s ? s.id : null;
  state.chefNearStation = s;
}

function interact() {
  refreshNear();
  const s = state.chefNearStation;
  if (!s) return;
  const ev = useStation(state, s, chef);
  if (ev) {
    sfx(ev.kind === 'cookstart' ? 'pick' : ev.kind);
    state.cooking = state.cook;
  }
}

function restart() {
  const fresh = new Shift(seed + Math.floor(performance.now() % 97));
  Object.assign(state, fresh);
  state.chef = chef;
  chef.x = 620;
  state.cooking = null;
  state.chefNear = null;
  state.chefNearStation = null;
  state.carryingPlate = false;
}

// ---------- loop ----------
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  clockT += dt;

  if (!shotName) {
    // movement
    let vx = 0;
    if (keys.has('a') || keys.has('arrowleft')) vx -= 1;
    if (keys.has('d') || keys.has('arrowright')) vx += 1;
    if (vx !== 0) {
      chef.x = Math.max(LAYOUT.chefMin, Math.min(LAYOUT.chefMax, chef.x + vx * 230 * dt));
      chef.facing = vx;
      chef.walking = true;
    } else {
      chef.walking = false;
    }
    refreshNear();

    // hold E to cook at the wok or the grill
    if (holdE && state.cook) {
      const ev = cookTick(state, dt);
      state.cooking = state.cook;
      if (ev) {
        sfx(ev.kind);
        state.cooking = null;
        state.wokContents = false;
        setTimeout(() => { state.wokContents = true; }, 900);
      }
    } else if (state.cook) {
      // let go: the food keeps cooking a moment, then comes off undercooked
      state.cook.t += dt * 0.35;
      if (state.cook.t >= state.cook.need) {
        state.hand = state.cook.out;
        state.cook = null;
        state.cooking = null;
      }
    }

    state.carryingPlate = state.hand === 'plate';
    state.tick(dt, clockT);
    if (state.over && state.burned === undefined) state.burned = 0;
  }

  ctx.clearRect(0, 0, 1280, 480);
  if (zoom !== 1) {
    // a closer camera for a staged screenshot: the world is drawn larger, the HUD stays legible
    ctx.save();
    ctx.translate(640, 240 + dy);
    ctx.scale(zoom, zoom);
    ctx.translate(-fx, -fy);
    drawScene(ctx, state, clockT, { shot: shotName, zoom });
    ctx.restore();
  } else {
    drawScene(ctx, state, clockT, { shot: shotName });
  }
  drawHud(ctx, state, clockT, { zoom });
  requestAnimationFrame(frame);
}

if (shotName) {
  stageShot(state, chef, shotName);
  const hint = document.getElementById('hint');
  if (hint) hint.style.display = 'none';
  document.body.style.background = '#08171a';
} else {
  // first order already on the rail so the counter never looks empty
  state.spawn();
  state.spawn();
}

requestAnimationFrame(frame);
