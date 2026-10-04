# Unrot

A quiet 2D pixel-art sandbox where real time spent on good habits builds a small world in snowy woods under an aurora. The full design is in [docs/plan.md](docs/plan.md).

**Status:** milestone 1 (Foundation). Grey placeholder map, walking, camera, saving, dev panel.

## Run it

Needs Node 22.12 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the game with live reload |
| `npm test` | Runs the unit tests |
| `npm run build` | Typechecks and builds to `dist/` |
| `npm run typecheck` | Typechecks only |

## Controls

| Key | Action |
| --- | --- |
| WASD or arrow keys | Walk (W and S move along the depth of the path) |
| E | Interact (nothing to interact with yet) |
| Esc | Open settings, or close whatever is open |

The game saves on its own: shortly after every change, when you stop walking, every 30 seconds, and when the tab is hidden or closed.

**Settings** (Esc) has **Export save**, which downloads the save as a JSON file, and **Import save**, which loads one back after asking first.

## Dev panel

Press **`** (backquote, the key left of 1) to open or close it. It does not pause the game.

| Control | What it does |
| --- | --- |
| Time x1 / x10 / x60 | Speeds up game time. Time gained is kept in the save. Resets to x1 on reload. |
| +10 wood / +10 stone | Adds materials |
| Aurora | Forces tonight's aurora strength. "Rolled" goes back to the real roll. Not saved. |
| Jump to | Moves the player to an area |
| Reset save | Starts a new game. Click twice to confirm. |

The bottom of the panel shows position, area, materials, game time, the sky phase, tonight's aurora and when the game last saved.

## Code layout

```
src/
  data/      tuning numbers, areas, sky, menu text
  state/     GameState, storage (IndexedDB), save upgrades, clock, store
  world/     map rules and the outdoor scene
  render/    drawing (grey placeholders for now)
  systems/   movement, sky, keyboard input
  ui/        settings menu, dev panel
tests/       unit tests (vitest)
docs/        the plan, art notes, moodboard
```

Game rules change the `GameState`; rendering only reads it. Every timer reads the game clock, never frame counts. Content and numbers live in `src/data`.

When `GameState` changes shape, bump `SAVE_VERSION` in `src/state/GameState.ts` and add a step to `UPGRADES` in `src/state/upgrades.ts`. Old saves are upgraded on load and a copy of the old version is kept in IndexedDB.
