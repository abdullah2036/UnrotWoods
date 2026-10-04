# Unrot: design and build plan

Oct 4, 2026 · @abdullah

## What Unrot is

Unrot is a quiet 2D pixel-art sandbox where real time spent on good habits builds a small world in snowy woods under an aurora. It has no story, combat, score or ending.

The player lives in a cabin, explores a hand-designed map, and starts habit sessions: reading, writing, coding or just sitting. Sessions run in real time, so 30 minutes of reading is 30 real minutes. Those minutes finish whatever the player is building, and what gets built stays for the rest of the game.

The working title is Unrot, and the place is called Unrot Woods.

Every feature is judged against these principles:

- **Voluntary.** Nothing checks whether the player is really reading. They can start a session and leave the room.
- **Slow on purpose.** No XP, levels, streaks, daily rewards or notifications.
- **Progress shows in the world.** A bridge, a full bookshelf, a cat that moved in.
- **The scenery is the reward.** The sky and the aurora matter more than any mechanic.
- **Hand-made and finite.** All dialogue and challenges are written by hand. No generated text in the game.

## Decisions already made

These are fixed for the prototype. Change them only if Abdullah says so.

| Decision | Choice | Why |
| --- | --- | --- |
| Project | A new game in a new repo | The portfolio is inspiration, not a base to upgrade |
| Platform | Web tech, played in the browser during the prototype | Text screens (reader, journal, editor) are easy, and Claude Code can run and screenshot it |
| Stack | TypeScript, Vite, Phaser 4 pinned to one exact version | A real 2D framework for maps, cameras and collisions |
| View | Side-on with a walkable depth band, like the portfolio | The sky and aurora stay on screen at all times |
| World | One hand-designed map the player adds to | No digging or block building |
| Resolution | 480×270 internal, integer upscaling, nearest-neighbour | Same crisp pixel look as the portfolio |
| Habits | Reading, writing, sitting, coding, custom timers | Small set that covers the idea |
| Saving | Local and automatic, plus export and import of a save file | Progress is the point of the game |
| Art | Original, drawn in code or generated to PNG by scripts | No downloaded or copied assets |
| Release | Free on itch.io with optional donations, after the prototype is tested | Desktop packaging happens then, not now |

## The world

The prototype is one continuous map, about eight screens wide, with five areas from west to east. The player starts at the cabin and can walk anywhere straight away, except across the river.

| Area | What is there | What the player does |
| --- | --- | --- |
| Lake and dock | Open water reflecting the sky, a dock, the neighbour | Sit on the dock, talk, build the lake bench |
| Cabin clearing (start) | The cabin, woodpile, small fire, the stray cat | Enter the cabin, sit by the fire |
| Pine woods | Dense trees, rocks, a fallen log | Gather wood and stone, sit on the log |
| River | A river that blocks the way east | Build the bridge |
| Overlook | An open hill with the widest sky | Sit and watch, build the overlook campfire |

The cabin interior is its own scene, entered through the door. It starts with a bed, a desk and a window showing the live sky.

In the prototype the far bank is closed until the bridge exists. A slow long way around can be added later.

### Sky and time

Unrot Woods is in deep winter and never reaches full daylight, so the aurora is always possible. One cycle takes 48 real minutes: dusk, night, deep night, then a blue dawn glow.

Each night rolls an aurora strength:

- **Faint:** a pale band low on the horizon.
- **Ribbon:** one clear green ribbon.
- **Curtains:** tall green and violet curtains across half the sky.
- **Full sky:** rare, about one night in twenty. The whole sky moves and the snow turns green.

Some nights have light snowfall. Strong aurora nights are clear.

## The core loop

Real minutes of habit time are what finish a build. The session is the loading screen.

1. Walk around and gather wood and stone.
2. Go to a build site, pay the materials and start the build.
3. Start any habit session. Its real minutes go into the active build.
4. When the build has enough minutes, it appears in the world and stays for good.
5. Each build opens something: a new area, a new place to sit, or a new habit.

One build is active at a time. Minutes earned with no active build are still logged.

| Build | Materials | Habit minutes | What it adds |
| --- | --- | --- | --- |
| Bridge | 20 wood, 5 stone | 60 | Opens the overlook |
| Lake bench | 8 wood | 20 | A sitting spot by the water |
| Bookshelf | 12 wood | 30 | Shows the player's books in the cabin |
| Desk computer | 10 wood, 10 stone | 45 | Unlocks coding sessions |
| Overlook campfire | 10 wood, 8 stone | 30 | A sitting spot with the best sky view |

These numbers are starting values. They live in a data file and get tuned after Abdullah plays.

During a session, small things can happen on their own: a deer walks past, a shooting star, the aurora surges. They are never announced.

## Systems

Each system below is built in its simplest working form, so Abdullah can test all of them in the prototype.

### Save

- The whole game lives in one state object that autosaves after every change and every 30 seconds.
- Loading restores everything exactly: position, materials, builds, cabin layout, books and reading positions, journal, habit log, cat trust, sky state.
- The settings menu can export the save to a file and import it back.
- Saves carry a version number. Older saves are upgraded on load, never thrown away.

### Habits

- Prototype habits: Reading, Writing, Coding, Sitting, plus custom habits the player names (stretching, studying, prayer). Custom habits are timers only.
- A session starts at a spot in the world: bed, desk, bench, log, dock or fire.
- The player picks open-ended or a target of 10, 20, 30, 45 or 60 minutes. A target ends the session by itself with a soft sound.
- During a session the interface hides and the character does the activity. Elapsed time shows only when the player asks for it.
- Ending early keeps the minutes already earned.
- The habit log is a plain page: minutes per habit per day, and all-time totals. No streaks, goals or badges.

### Gathering and building

- Two materials only: wood from trees and stone from rocks. Sources regrow after about 10 real minutes.
- A build site shows a faint outline of what can be built there.
- Builds follow the core loop above and are permanent.

### Cabin

- Items go into fixed floor and wall slots, not free placement.
- Six starter items: rug, lamp, plant, chair, small shelf, picture frame. Each costs a few materials and no habit minutes.
- A picture frame shows an image the player imports from their computer, drawn pixelated on the wall and viewable full size.
- Finished builds and finished books leave an object in the cabin.

### Reading

- The library screen imports EPUB, TXT and PDF files. Files stay on the player's device.
- EPUB and TXT show as reflowed text in a normal readable font inside a pixel-art book frame, with page turns and adjustable text size.
- PDF pages show as they are, one page at a time.
- The game remembers the position in every book and shows percent read.
- Two public-domain books ship with the game so reading works without importing. Take them from Project Gutenberg and confirm their status.
- A reading session can also cover a paper book: timer only, the character reads.

### Writing

- The journal is at the desk: dated entries, plain text, saved automatically.
- The game adds its own one-line entries for events, such as "Built the bridge."

### Coding

- Needs the desk computer build.
- A pixel-styled screen with the problem, an editor, a run button and test results.
- JavaScript only. Each session draws a random challenge from a hand-written pool of 20, with no repeats until the pool is used up.
- No autocomplete, hints or AI.
- Player code runs in a sandboxed worker with a time limit.
- This is built last. If it proves costly, it is the first thing to cut.

### Cat and neighbour

- A stray cat appears near the cabin. Each real day with at least one session, it comes closer. After about five such days it lives in the cabin.
- One neighbour stands by the lake with 15 hand-written lines of quiet advice, one new line per night, then short greetings.
- The lines live in a data file so Abdullah can rewrite them.

## Art direction

The scenery must clearly beat the portfolio: more depth, richer light, and the aurora as the centrepiece. If the sky is not beautiful, the prototype has failed, whatever else works.

### Research first

- Before drawing anything, search the web for references: "pixel art aurora", "pixel art night forest", "pixel art snowy woods", "pixel art winter cabin", "pixel art cabin interior", "pixel art lake reflection".
- Browse pixel-art sites such as Lospec and itch.io for palettes, layering and lighting ideas.
- Write what was learned into `docs/art-notes.md`: palettes, how depth is built, how light and snow are handled.
- References are for inspiration only. Do not download, trace or copy any artwork. Everything in the game is original.
- If Abdullah adds images to `docs/moodboard`, they take priority over this section.

### Baseline: the portfolio

Study [the portfolio repo](https://github.com/abdullah2036/pixelportfolio), especially `src/game/render/generators` (sky and aurora, mountains, forests, terrain, trees, fire, water) and `src/game/render/pixel.ts` (dithering and noise). Reuse the ideas and the feel. Do not copy its structure, and aim well above its level of detail.

### Requirements

- **Depth:** at least eight parallax layers, back to front: stars, aurora, far mountains, near mountains, far tree line, mid forest, the walkable strip, foreground silhouettes. Distant layers are paler and bluer.
- **Aurora:** animated curtains that drift and ripple, in the four strengths listed under Sky and time. Green through teal to violet, with red very rarely. It reflects in the lake, and at full strength it tints the snow.
- **Light:** warm orange from windows, fires and lanterns against cold blue snow, with soft dithered glows.
- **Snow:** on branches and roofs, and two layers of falling snow at different speeds.
- **Water:** rippled reflections of the sky and of nearby lights.
- **Palette:** one limited palette of cold blues and teals with warm accents, used everywhere.
- **Character:** a small sprite with idle, walk, sit, read, write and chop animations.
- **Cabin interior:** warm wood, soft lamp light, and a window showing the live sky.

### Checking the result

Take screenshots of every area and compare them critically with the references, then iterate. Send Abdullah screenshots at the end of the art milestone and wait for his reaction before moving on.

## Sound

There is no music. The game has ambient sound only: wind, fire, water, footsteps in snow and a distant owl, each louder as the player gets closer to its source.

Sounds are synthesised with Web Audio, as in the portfolio, or come from recordings that are free to use. Settings have one volume slider and a mute switch.

## Technical plan

The game is a TypeScript web app: Phaser draws the world on a canvas, and ordinary HTML draws every text screen on top.

- **Stack:** TypeScript, Vite, Phaser 4 pinned to one exact version. Read the current Phaser 4 documentation before writing engine code, because most examples online are for Phaser 3.
- **Text screens:** library, reader, journal, code editor, habit log and settings are HTML and CSS overlays styled to match the pixel look.
- **Libraries:** PDF.js for PDFs, an EPUB parser such as epub.js, CodeMirror for the editor. Add others only when needed.
- **State:** one plain, JSON-serialisable `GameState` with a `saveVersion`. Game rules read and change the state; rendering only draws it.
- **Storage:** IndexedDB behind one small module with four functions: load, save, export, import. Books and images are stored as files beside the save. This keeps a later desktop build simple without building it now.
- **Time:** every timer is computed from clock timestamps, never from frame counts. Sessions keep counting when the window is hidden or minimised. If the game is closed mid-session, the session ends at the last autosave.
- **Data files:** builds, cabin items, habits, coding challenges, dialogue, session events and tuning numbers all live in `src/data`. No content is hard-coded in game logic.
- **Controls:** keyboard only. WASD or arrows to walk, E to interact, Esc to close.
- **Dev panel:** opened with a key. Time multiplier (×1, ×10, ×60), add materials, set aurora strength, jump to an area, reset the save. Abdullah needs this to test a 60-minute build in one minute.
- **Tests:** unit tests for state changes, save and load, save upgrades and session time maths. Browser screenshot runs for visual checks.

```
src/
  data/      builds, items, habits, challenges, dialogue, tuning
  state/     GameState, rules, storage, save upgrades
  world/     map, areas, interactables, build sites
  render/    sky, aurora, parallax, lighting, sprites
  systems/   sessions, building, gathering, cabin, cat
  ui/        library, reader, journal, editor, log, settings, dev panel
  audio/
docs/        this plan, art-notes.md, moodboard/
```

## Milestones

Seven milestones, built in this order because each one stands on the one before. Every milestone ends with a playable build that Abdullah tests before the next one starts.

| # | Milestone | What gets built | What Abdullah tests |
| --- | --- | --- | --- |
| 1 | Foundation | Project setup, game state, save, load and export, walking and camera on a grey placeholder map, dev panel | Walk, close the game, reopen in the same spot. Export a save and import it back. |
| 2 | The look | Art research, sky, aurora, all five areas, cabin interior, snow, light, ambient sound | Walk the whole map. Step through the aurora strengths in the dev panel. Say what looks wrong. |
| 3 | Habits | Session spots, targets, custom habits, habit log, session events | Run a sitting session with the window minimised and check the minutes. Add a custom habit. |
| 4 | Building | Gathering, build sites, the five builds | Gather, start the bridge, finish it at ×60, cross it, reload and confirm it is still there. |
| 5 | Cabin, reading, writing | Item slots, picture import, library, reader, journal | Import an EPUB and a PDF, read, reload and check the position. Place items. Write an entry. |
| 6 | Life and coding | Cat, neighbour, desk computer, coding challenges | Talk to the neighbour over several nights. Solve one challenge and fail one. |
| 7 | Polish | Title screen, settings, tuning, fixes from Abdullah's notes | Play one full hour from a fresh save at normal speed. |

After the prototype passes milestone 7: desktop packaging and the itch.io page.

## Out of scope

None of this is built in the prototype, and no code is written to prepare for it.

- Multiplayer, accounts and cloud saves
- More regions, a village, trading, characters with schedules
- Farming, tools, crafting chains, any material beyond wood and stone
- XP, levels, streaks, achievements, notifications
- Music
- Generated dialogue or any AI feature inside the game
- Languages other than JavaScript in the coding desk
- Touch controls and phone layouts
- Desktop packaging and the store page

## Working rules for Claude Code

- Work in milestone order. End each milestone with a playable build, a short list of what to test, and a commit.
- Stop after each milestone and wait for Abdullah's feedback.
- Build only what this plan lists. If something seems missing, ask before adding it.
- Choose the simplest thing that works. No abstractions for features that are out of scope.
- Keep all text, numbers and content in data files.
- Small technical choices are yours. Anything that changes how the game looks or feels goes to Abdullah first.
- When a decision changes, update the copy of this plan in the repo.
- Keep a README with how to run the game, the controls and the dev panel keys.
