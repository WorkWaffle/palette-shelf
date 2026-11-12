# Palette Shelf 1.9.0 functionality review (2026-11-11)

Method: the design-critique skill (Nielsen heuristics, UX laws, an excise audit and a posture check). I ran the page in a browser at 1300 and 380 wide, clicked through Swatches, Analysis, Generate, Random palette and Satisfactory, and read the matching code paths in `palette-shelf.html`.
Severity scale: 4 = blocks a task or loses data, 3 = major, 2 = minor, 1 = cosmetic.

Context: one owner who knows the app well. It is a sovereign app used in long sessions for three jobs: classroom slides, game art and Satisfactory USS sets. Expert features and density suit it, so I don't recommend simplifying the controls.

## 0. Project setup (fix first, outside the app)

| # | Problem | Fix |
|---|---|---|
| S1 | `tests/baseline.js:11` reads fixtures from `/root/.claude/uploads/…`, which don't exist here. The snapshot crashes at the USS import step. | Copy the five palette files and `USS_Default.json` into `tests/fixtures/`, then point `up` there. Until then, a copy of the test that skips lines 45, 46 and 48 runs. |
| S2 | The Electron binary is missing. Electron 44's installer needs Node ≥ 22.12, and this machine has Node 18.19, so `npm install` skipped the download. No Electron test, `npm start` or `npm run dist` can run. | Install Node 22 (nvm or NodeSource), then run `cd app && npm install` again. |
| S3 | `npm install` changed `app/package.json` from pinned `44.5.1`/`26.17.0` to `^44.11.1`/`^26.18.0` (uncommitted). | Either pin again or commit it on purpose. Pinning keeps the AppImage reproducible. |
| S4 | `xvfb-run` isn't installed. You have a real display (`:0`), so the Electron tests can run without it. | Update `CLAUDE.md`, or run `apt install xvfb` if you want headless runs. |

## 1. Data safety (severity 4–3)

| # | Finding | Principle | Recommendation |
|---|---|---|---|
| D1 | **Removing a sub-palette (`data-dg`) deletes it at once**, with no confirmation and no undo. Deleting a whole palette asks first, so the riskier per-group action is the less protected one. | H3 user control, H5 error prevention, H4 consistency | Add **undo** in the toast ("Removed “Leaves” · Undo") instead of a confirmation. One undo slot holding a `structuredClone` of the palette is enough. |
| D2 | The colour ✕ removes it at once; a mis-tap on a phone loses the colour. The ✕ is also under 32px (19 targets measured below 32px at 380 wide). | H3, Fitts's law | The same toast undo covers this. Enlarge the hit area to 40px+ with padding while keeping the glyph small. |
| D3 | `save()` swallows every error (`catch(e){}`). If localStorage is full or blocked, the user sees edits that won't survive a reload. | H1 visibility, H9 | On failure, show a sticky banner: "Couldn't save — copy a backup now". |
| D4 | Backup is copy and paste text only, hidden in a collapsed `<details>` at the bottom of the rail. Restore always **appends** (new ids), so restoring twice duplicates everything. | H3, recognition over recall | Add "Save backup file" and "Open backup file" (the `.json` file and the download and drop paths already exist). On restore, offer "Replace all" or "Add". In the desktop app, consider an automatic dated backup on quit. |

## 2. Editing gaps (severity 3)

| # | Finding | Principle | Recommendation |
|---|---|---|---|
| E1 | **You can't edit an existing colour.** A swatch click copies the hex. Changing a colour means ✕, then picking and adding again, which loses its position. | Direct manipulation, Tesler's law (excise) | Swatch menu or long-press: **Edit**, with a picker, hex and OKLCH sliders (L/C/H) and a live contrast readout, saved in place. You already have the OKLCH maths. |
| E2 | **Colours can't be reordered or moved between sub-palettes by dragging.** USS has full drag and drop, but palettes don't. The only ordering is "Sort → Keep this order". | Jakob's law (consistency inside the app), H4 | Reuse the USS drag code (`dragstart`/`drop` with `dropL/dropR`) for `.sw` tiles and `section.group`. Add keyboard moves (Alt+arrows) to match the USS tiles. |
| E3 | No **duplicate palette** or **duplicate sub-palette**. USS has "Duplicate", but palettes don't. Variants are common for slides (light/dark deck) and game art (day/night). | H7 flexibility | Add "Duplicate" next to Rename. |
| E4 | Colours are deduplicated per group (`if(!g.colors.includes(c))`) with no message. Pasting 8 hexes and getting 6 looks like a bug. | H1 | Toast: "Added 6 · 2 already in Leaves". |
| E5 | There's no screen eyedropper. In Electron (Chromium), `EyeDropper` is available. | H7 | A 💧 button next to the colour input, shown only `if('EyeDropper' in window)`. This is useful for sampling a game screenshot or slide. |

## 3. Output for the three real uses (severity 3–2)

Export is GIMP `.gpl`, Paint.NET `.txt` and `.hex` only. Those cover pixel editors, but not the other two jobs.

| # | Use | Missing | Recommendation |
|---|---|---|---|
| X1 | Classroom slides | Google Slides and PowerPoint can't import any of these formats. | **PNG swatch sheet** (named chips with hex, one row per sub-palette) to paste into a slide. Also add **"Copy as text with names"**, where each line is `Burnt umber #8C2F1B`. |
| X2 | Game design | Aseprite, Lospec and most engines take a **1×N PNG** (Lospec's standard download) or 8×/32× scaled versions. | Add `png` (1×, 8×, 32×) to the format list. It is a canvas draw plus `toBlob` through `saveText`'s download path. |
| X3 | Web and dev | CSS custom properties or JSON | `--leaves-1: #8c2f1b;` per sub-palette, plus plain JSON. Low effort, and the export scope code already handles groups. |
| X4 | Import | Lospec `.png` palette strips, `.ase` (Adobe/Aseprite swatches) and a pasted image | PNG import (read unique pixels with `getImageData`, capped at 256) matches X2. For a pasted screenshot, quantise it to N colours (k-means in OKLab), which would be a strong addition. |

## 4. Flow and findability (severity 2)

| # | Finding | Principle | Recommendation |
|---|---|---|---|
| F1 | Generate tab → "Add to this palette" and Random → "Save palette" give no link back to the result. | H1, peak-end | After saving, select the new palette or sub-palette and briefly highlight it (the `ui.landed` flag already exists). |
| F2 | The Random generator settings panel is very long (≈14 control groups). It is fine for an expert, but the preview is far from many controls on smaller windows. | Proximity, working memory | Make the preview strip sticky at the top of the Random panel so each change is visible next to the control. |
| F3 | On phones the whole palette list sits above the open palette, so you scroll past every palette to reach the one you tapped. | Fitts's law and navigation | On ≤600px, scroll to `#main` (or collapse the list) when a palette is opened. |
| F4 | Analysis is one long page with 12 sections and no index. | Miller's law, navigation | Add a small jump list (chips) at the top: Accessibility · Contrast · Dither · Maps · Ramps… |
| F5 | Accessibility check results list merging pairs, but the pair isn't clickable. | Direct manipulation | Clicking a pair opens E1's editor on one of the two colours, with a "nudge apart" button (`accRepair` for one pair). |
| F6 | There are no global keyboard shortcuts (only the stepped controls, wheel and USS tiles). | Perpetual intermediates, H7 | Minimal set: `/` search, `N` new palette, `R` random/shuffle, `Ctrl+Z` undo (after D1), `Esc` close panel. Show them in button `title`s. |

## 5. Smaller polish (severity 1)

- "Copy all hex" copies `#aaa, #bbb`. Offer a format choice (comma, newline, with names), which ties in with X1.
- Search matches name or hex, but not the nearest colour ("palettes containing something close to #c4551f"). This is cheap with the `sim` function.
- The theme toggle label reads "Light" while dark mode is showing. Check that it describes the action ("Switch to light") and not the state.

## Suggested order

1. S1–S3 (tests and build working), then record a fresh baseline.
2. D1 + D2 (toast undo), D3 (save failure banner). These are small and don't affect generator output.
3. E1 colour editor, E2 drag to reorder, E3 duplicate.
4. X1/X2 PNG export, then X4 PNG and image import.
5. Flow items F1–F6 as they come up.

None of these needs a change to the saved `palette-shelf-v1` shape, and none touches `genRandom`, so `baseline.js` output should stay identical throughout.

## Status after the implementation pass (2026-11-11)

All items are done. Exceptions:
- **D4 automatic backup on quit:** not done. It needs IPC in `app/main.js`, and the new **Save backup file** button covers the need.
- **F2 sticky preview:** already in 1.9.0 (`#randPeek` is sticky), so no change was needed.
- **Copy all hex format choice:** done as the new Export → **Text → Names and hex** format.

Checks:
- `baseline.js` output is byte-identical before and after.
- `actions.js` saved state is identical at every step except restore, which now asks Add/Replace. The test now clicks Add.
- The `audit.js` issue list is unchanged (the same 18 entries).
- `testuss.js` passes, and there are no console errors.
- The `uishots` differences come from the new rail text and buttons.

## Preset variety audit (2026-11-11, version 2.1.0)

**Method.** For each preset I ran 60 shuffles with default settings (`tests/variety.js`), plus a contact sheet of 8 shuffles per preset. The columns:
- **dist:** mean OKLab distance between two shuffles' palettes (each colour to its nearest match in the other). Higher means each shuffle feels more different. "Open" is the reference at 0.058.
- **hue bins:** how many 15° hue slices appear across all 60 shuffles.
- **family sets:** how many different combinations of 30° hue families appear in 60 shuffles.
- **top set:** how often the most common combination appears.

| Preset | dist | hue bins | family sets | top set | Verdict |
|---|---|---|---|---|---|
| Open (no theme) | 0.058 | 24/24 | 58/60 | 3% | reference |
| **Gruvbox-style** | 0.032 | 17/24 | **4/60** | **43%** | 🔴 near-identical every shuffle |
| '90s computing (2.1.0) | 0.070 | 22/24 | 50/60 | 5% | ✅ fixed this release (was 0.051, 16/24, 31/60) |
| Cyberpunk (2.1.0) | 0.077 | 24/24 | 55/60 | 5% | ✅ fixed this release (was 0.044, 11/24, 3/60) |
| Scandinavian | 0.036 | 14/24 | 30/60 | 12% | ✅ fine; low distance comes from its deliberately low chroma |
| '60s | 0.044 | 14/24 | 29/60 | 13% | ✅ fine |
| **'70s** | 0.040 | 10/24 | 12/60 | 22% | 🟡 the same browns, olives and terracottas |
| '80s neon | 0.053 | 14/24 | 14/60 | 28% | 🟡 mild; varied enough in practice |
| Vaporwave | 0.039 | 11/24 | 9/60 | 17% | 🟡 mild; three windows by design |
| Pastel | 0.023 | 24/24 | 36/60 | 12% | ✅ hues vary widely; low distance comes from everything being light |
| **Earthy** | 0.037 | 10/24 | **6/60** | **50%** | 🔴 only two windows, so it's always brown + olive + green |
| **Autumn** | 0.032 | 10/24 | 10/60 | 32% | 🟠 the same rust, brown, amber and mustard ramps |
| **Ocean** | 0.030 | 12/24 | 11/60 | 37% | 🟠 the same teal and navy ramps |
| Mono screen | 0.015 | 2/24 | 1/60 | 100% | ⚪ one hue by design, but 2 of 60 shuffles came out identical |

### Fixes applied (2.1.0)

All flagged presets were retuned. Each fix widens the range of hues; the chroma range and the overall look stay the same. Figures are from 60 shuffles before → after.

| Preset | Change | dist | family sets | top set |
|---|---|---|---|---|
| Gruvbox-style | `spread:'multi'` picking 4–6 of the 7 template families (new `pick` template option), hue wander ±10° (new `jit` option) | 0.032 → 0.055 | 4 → 41 | 43% → 8% |
| Earthy | Added clay (35), ochre (85), sage (150), slate (230) and plum-brown (350) windows to the brown and olive ones | 0.037 → 0.044 | 6 → 41 | 50% → 8% |
| Autumn | Windows for rust, amber (×2), mustard, deep red, burgundy and an evergreen accent, `spread:'multi'` (was analogous in one window) | 0.032 → 0.044 | 10 → 29 | 32% → 8% |
| Ocean | Sea-only windows from seafoam (155) to indigo (278), `spread:'multi'`. A trial with sand and coral accents drowned the sea hues, so it was dropped. | 0.030 → 0.044 | 11 → 23 | 37% → 12% |
| '70s | Added muted teal (200) and dusty plum (330) windows | 0.040 → 0.050 | 12 → 43 | 22% → 8% |
| '80s neon | Windows widened from ±10–15° to ±15–20° | 0.053 → 0.057 | 14 → 22 | 28% → 22% |
| Vaporwave | Windows widened from ±15–18° to ±22–24° | 0.039 → 0.042 | 9 → 21 | 17% → 15% |
| Mono screen | With the screen hue on Style default, each shuffle picks a phosphor: green (most often), pea green, amber, orange, cyan or blue | 0.015 → 0.059 | 1 → 6 | 100% → 27% |

The generator code changed in one place only: template styles read `jit` and `pick`. The defaults (7° and 4–5) keep saved-palette styles byte-identical. Open, Scandinavian, '60s and Pastel are unchanged.
