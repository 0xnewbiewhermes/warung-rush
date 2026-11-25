// shot.js — four frozen frames the maker screenshots with Chrome, each staged from the game's own
// live state so every pixel is a real render: ?shot=cover, ?shot=grill, ?shot=plate, ?shot=serve.
// A shot removes the randomness (a fixed seed) so the same frame comes back every run.

import { makeOrder, Shift } from './state.js';
import { LAYOUT } from './kitchen.js';

function reset(state) {
  state.orders = [];
  state.plate = { items: [], burnt: false };
  state.hand = null;
  state.score = 0;
  state.tips = 0;
  state.combo = 0;
  state.served = 0;
  state.clock = 132;
  state.message = null;
  state.messageT = 0;
  state.cook = null;
  state.cooking = null;
}

export function stageShot(state, chef, name) {
  reset(state);
  state.seedFixed = true;
  state.passReady = ['satay', 'gado'];

  if (name === 'cover') {
    state.orders = [
      makeOrder('satay', 19, 6),
      makeOrder('nasi', 11, 14),
      makeOrder('gado', 24, 2),
      makeOrder('nasi', 27, 1),
    ];
    state.plate = { items: ['rice', 'satay', 'satay'], burnt: false };
    state.hand = 'plate';
    state.clock = 78;
    state.shift = 2;
    state.score = 186;
    state.tips = 9;
    state.combo = 5;
    state.served = 7;
    state.walkouts = 1;
    state.customers = [
      { dish: 'satay', fuse: 0.42 },
      { dish: 'nasi', fuse: 0.72 },
      { dish: 'gado', fuse: 0.22 },
    ];
    state.message = { text: 'Rush hour — the whole street is queuing', tone: 'warn' };
    state.messageT = 0;
    chef.x = 966;
    chef.facing = 1;
    chef.walking = false;
    state.chef = chef;
    state.chefNear = 'prep';
    state.chefNearStation = LAYOUT.stations.find((s) => s.id === 'prep');
    state.cook = null;
    state.cooking = null;
    state.carryingPlate = false;
    state.wokContents = true;
  }

  if (name === 'grill') {
    state.orders = [makeOrder('satay', 9, 16), makeOrder('gado', 21, 4), makeOrder('nasi', 16, 9)];
    state.plate = { items: ['veg', 'sauce'], burnt: false };
    state.hand = 'skewer';
    state.clock = 47;
    state.shift = 3;
    state.score = 241;
    state.tips = 13;
    state.combo = 5;
    state.served = 11;
    state.message = { text: 'Skewers on — turn them before they char', tone: 'good' };
    state.messageT = 2.2;
    chef.x = 830;
    chef.facing = 1;
    state.chef = chef;
    state.chefNear = 'grill';
    state.chefNearStation = LAYOUT.stations.find((s) => s.id === 'grill');
    state.cook = { station: 'grill', t: 1.2, need: 1.6, out: 'cooked:satay' };
    state.cooking = state.cook;
  }

  if (name === 'plate') {
    state.orders = [makeOrder('nasi', 13, 10), makeOrder('satay', 22, 3), makeOrder('gado', 26, 1)];
    state.plate = { items: ['rice', 'sambal', 'egg'], burnt: false };
    state.hand = 'cooked:satay+sauce';
    state.clock = 63;
    state.shift = 2;
    state.score = 154;
    state.tips = 6;
    state.combo = 2;
    state.served = 5;
    state.message = { text: 'One plate, one ticket — match the rail', tone: 'good' };
    state.messageT = 2.2;
    chef.x = 930;
    chef.facing = 1;
    state.chef = chef;
    state.chefNear = 'prep';
    state.chefNearStation = LAYOUT.stations.find((s) => s.id === 'prep');
    state.cooking = null;
  }

  if (name === 'serve') {
    state.orders = [makeOrder('satay', 7, 18), makeOrder('gado', 19, 6), makeOrder('nasi', 24, 2)];
    state.plate = { items: ['satay', 'satay', 'satay', 'sauce', 'garnish'], burnt: false };
    state.hand = 'plate';
    state.clock = 24;
    state.shift = 3;
    state.score = 268;
    state.tips = 17;
    state.combo = 6;
    state.served = 14;
    state.message = { text: 'Sate Ayam away — 6× combo', tone: 'good' };
    state.messageT = 2.2;
    chef.x = 1160;
    chef.facing = 1;
    state.chef = chef;
    state.chefNear = 'pass';
    state.chefNearStation = { id: 'pass', kind: 'pass', x: LAYOUT.pass.x, name: 'Pass' };
    state.cooking = null;
    state.carryingPlate = true;
  }

  state.chefNear = state.chefNear || null;
  return state;
}
