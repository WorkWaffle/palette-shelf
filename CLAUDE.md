# Palette Shelf

Personal colour-palette manager: palettes with sub-palettes, import/export (GIMP .gpl, Paint.NET .txt, .hex), analysis (Lospec/DawnBringer/Censor style, colour-blind and projector checks), a seeded random generator with a harmony wheel, and a Satisfactory Universal Swatch Slots (USS) builder. The owner uses it for classroom slides, game design and Satisfactory.

## Layout
- `palette-shelf.html` is the whole app: CSS, markup and JS in one file, no framework, no build step. It is also published as a claude.ai artifact, so it must stay a fragment (no doctype or head) with the Google Fonts `<link>` line intact.
- `app/` is the Electron wrapper (Linux AppImage). `app/index.html` is generated, never edited.
- `build.py` makes `app/index.html` and `dist/palette-shelf-windows.html` (single file, fonts embedded as base64, CSP added). Run `cd app && npm install` once first.
- `tests/` holds the regression scripts (below).

## Commands
- Build the AppImage: `python3 build.py && cd app && npm run dist` (bump `version` in `app/package.json` first).
- Run the app: `python3 build.py && cd app && npm start`.
- Headless tests need a display: prefix with `xvfb-run -a -s "-screen 0 1400x2700x24"` and run with `app/node_modules/electron/dist/electron --no-sandbox`.

## Code map (palette-shelf.html, in order)
CSS; markup (rail with #addPal, #openRandom, #openUss); then script: globals and `state`/`ui`; list and main rendering; colour maths (OKLab/OKLCH with a per-hex cache: `oklab`, `oklch`, `luminance`, `ratio`, `sim`, `projSim`); analysis; Generate tab; random generator (`genRandom`, `mulberry` seeded RNG, `REL` harmony relations); harmony wheel (`hw*`); legibility (`makeLegible`); colour names (`NAMEDATA`, a compact string); import/export; accessibility repair (`accScan`, `accRepair`); swatches view; USS builder (`ussGenerate`, views, events); general listeners; theme; init line `render();paintThemeBtn();`.

## Rules that matter
- **Do not change generator output by accident.** Same seed plus same options must give the same palettes and files. `tests/baseline.js` snapshots ~600 generator, export, parse and colour-maths results; run it before and after any change and `cmp` the JSON. A deliberate change (like the Tetradic definition) should be called out.
- Keep the init line exactly `render();paintThemeBtn();`. The test harness cuts the script there.
- Saved data is localStorage `palette-shelf-v1` (palettes) and `palette-shelf-theme`; `ui` is not persisted. Never change the saved shape without a migration.
- `renderMain()` rebuilds the main panel's innerHTML on most interactions, so CSS transitions on state classes inside it do not play and entrance animations replay. Motion is one-shot via flags (`ui.fresh`, `ui.landed`, `ui.expEnter`) applied after render.
- Motion tokens are `--ease-out` and `--ease-in-out`; durations 120-200ms; always include the reduced-motion fallback. Keyboard-driven and high-frequency actions are deliberately not animated.
- Layout must work from 380px phone to desktop with no cramped rows or long skinny text. `tests/audit.js` checks this.
- Style: Space Mono, amber palette with light/dark toggle, row-style settings panels, stepped sliders, toggle switches.

## Tests (all in `tests/`)
- `baseline.js <page.html> 'render\(\);paintThemeBtn\(\);' out.json`: Node data snapshot (no browser). Compare two runs with `cmp`.
- `uishots.js <page.html> <outdir>` (Electron): 24 screenshots at 1300 and 380 wide with seeded randomness; compare folders with `python3 cmpshots.py dirA dirB`.
- `actions.js <page.html> out.json` (Electron): scripted click-through that records saved state after each step; compare runs. Some step selectors may be stale after UI changes.
- `testuss.js` (Electron, uses `app/index.html`): Satisfactory generate, drag, move, export.
- `audit.js <page.html>`: layout audit across widths. `motion.js <page.html>`: checks each animation plays once. `perf.js <page.html>`: timings.
