# Warung Rush

A night-market warung cooking game: you run one cook through a dinner service, taking tickets off
the rail, frying rice, grilling satay, dressing it in peanut sauce and plating it before the closing
time runs out. It runs in a desktop browser from static files: no build step, no network request,
no library — every pixel of the kitchen, the food and the steam is drawn with canvas paths.

## How to play

- **WASD / arrow keys** walk the cook along the counter, **E** (or **space**) uses the station you
  stand at, and **clicking** a station walks there and uses it. Hold **E** at the wok or the grill to
  cook: let go too early and the food is raw, hold too long and it burns.
- Take an ingredient from its tray, cook it where the recipe says, dress it at the sauce pot, then
  pick up a clean plate at the plating board, add what you cooked, and carry the plate to the PASS.
- Each ticket on the order rail has a fuse. Match the plate to the ticket to serve it; combos and
  speed raise the tip. Closing time ends the shift.

The three dishes combine differently: **Sate Ayam** wants three grilled skewers and sauce,
**Nasi Goreng** wants wok rice, a fried egg and sambal, **Gado-Gado** wants blanched veg, dressing
and krupuk. A plate only matches the ticket whose parts it carries.

## Files

```
game/index.html          the page and its canvas
game/src/main.js         boot, the shift loop, keyboard and pointer input, the tiny synth
game/src/state.js        recipes, tickets, plates, the clock, the score
game/src/kitchen.js      the room: stations, the pass, the cook, and each station's rule
game/src/hud.js          the order rail, shift clock, score, prompts, the closing card
game/src/food.js         every dish drawn from paths: satay, rice, gado-gado, sambal, krupuk
game/src/art.js          palette and materials: wood, tile, steel, steam, embers
game/src/shot.js         four staged frames the maker screenshots (?shot=cover|grill|plate|serve)
main.ts                  the hand-in: copies game/ and screenshots/ and writes dossier.json
serve.ts                 a static server for local play: node serve.ts
vendor/makefun-game.ts   the kit's dossier library, unchanged
screenshots/             four real renders, taken in Chrome from the game's own code
```

## Run it

```sh
node serve.ts        # then open http://localhost:8080
```

Screenshot frames, for reference: `http://localhost:8080/?shot=cover` (also `grill`, `plate`, `serve`).

## Build the entry

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=17fk2ks1&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
