# Moving off Electron: options for a Linux-only desktop app (2026-11-11)

## Short answer

Keep the web page and swap only the shell. Palette Shelf is one HTML file that keeps everything in `localStorage`. Electron only provides a window and a save-file dialog (`app/main.js` is about 25 lines). A true native rewrite (GTK, Qt) would mean redoing about 180 KB of UI, the canvas analysis views and the tests, and you'd gain nothing you would notice.

**Recommendation:** move to **Tauri v2**, building `.deb` and `.rpm` for your own machines plus an AppImage as the portable fallback. It is a moderate job (a day or two) and it doesn't touch `palette-shelf.html`. If any device is ARM, or you want zero build tooling, the alternatives below are better.

## What I checked on this machine

Tauri and Wails both render with **WebKitGTK** on Linux, not Chromium. This Mint 22.3 install has WebKitGTK 2.52, so I ran the built page in it ([tests/webkit_smoke.py](tests/webkit_smoke.py)):

| Check | Result in WebKitGTK 2.52 |
|---|---|
| Page loads, renders, light/dark theme | ✅ no errors |
| localStorage save and load | ✅ |
| Remove plus undo, colour editor, drag code paths | ✅ |
| Analysis (25 canvases), jump list | ✅ |
| Random generator, Satisfactory generator (28 swatches) | ✅ |
| PNG export (`canvas.toBlob`) and zip building | ✅ |
| `::details-content` (backup panel animation) | ✅ supported |
| Clipboard API | ✅ present |
| **EyeDropper (💧 pick from screen)** | ❌ not in WebKit. The button hides itself, so nothing breaks, but the feature is gone. |
| Saving files | ⚠️ not tested. Electron's `will-download` dialog has no automatic equivalent, so the shell must handle it (see below). |

So the page itself is ready for a WebKit shell today.

## The options

| | Electron (now) | **Tauri v2** | Wails v3 | Installable web app (PWA) | Python + WebKitGTK launcher |
|---|---|---|---|---|---|
| Engine | Bundled Chromium | System WebKitGTK | System WebKitGTK (GTK4 / WebKitGTK 6 by default in v3) | Your browser | System WebKitGTK |
| Download size | ~100 MB AppImage (typical for Electron) | `.deb`/`.rpm` a few MB; AppImage ~70 MB (it has to bundle WebKitGTK) | Similar to Tauri | 0 (served page) | Tiny, but needs Python GI on each machine |
| Memory use | Highest (a full Chromium) | Lower | Lower | Shared with the browser | Lower |
| Build tools | Node ≥ 22 (now installed at `~/.local/opt/node22`) | Rust toolchain + `libwebkit2gtk-4.1-dev` | Go + GTK dev packages | None | None |
| EyeDropper | ✅ | ❌ | ❌ | ✅ in Chromium/Chrome, ❌ Firefox | ❌ |
| ARM (Pi, Pinebook, phone) | ✅ electron-builder can cross-build arm64 from this PC | Needs an ARM machine or a cross toolchain | Same as Tauri | ✅ any device with a browser | ✅ if Python GI is installed |
| File save | Works now | Needs `tauri-plugin-dialog` + `tauri-plugin-fs`, or a download handler | Needs a small Go binding | Browser download | A few lines on `decide-destination` |
| Existing Electron tests | ✅ all of them | Keep running them in Electron as the reference engine, plus `webkit_smoke.py` | Same | ✅ | Same as Tauri |
| Maturity | Stable | Stable (v2) | v3 is newly out of beta; release notes disagree on the current version | Stable | DIY |

### Notes on each

**Tauri v2 (recommended).**
- Setup: `cargo install tauri-cli`, then `cargo tauri init` with `frontendDist` pointing at a folder that holds `app/index.html`. `build.py` already produces a CSP-safe single file, so no bundler is needed.
- Packages: `cargo tauri build --bundles deb,rpm,appimage`.
- Saving files: replace the anchor-click download in `saveText`/`exportSave` with a call to the dialog and fs plugins when `window.__TAURI__` exists. Keep the anchor path for the browser and Electron builds. That is the only code change.
- Building: build on the oldest distro you need to support. Tauri's docs say this for AppImage, because WebKitGTK and glibc are taken from the build machine.
- Size: the small size only holds for `.deb`/`.rpm`. An AppImage still carries its own WebKitGTK, so it ends up roughly as big as Electron's.

**Wails v3.**
- The same idea as Tauri, but in Go, and it packages AppImage, deb, rpm and Arch in one command.
- Choose it only if you'd rather write Go than Rust. v3 has only just left beta.

**Installable web app (PWA).**
- The cheapest route: no build at all. Add a `manifest.json` and a tiny service worker, host the page (GitHub Pages, or `python3 -m http.server` on the LAN), and use "Install app" in Chromium, Chrome or Edge.
- It works on every Linux device you own, ARM included, and keeps EyeDropper.
- Downsides: data lives in that browser profile, Firefox on Linux can't install it, and it needs a URL rather than a file.

**Python + WebKitGTK launcher.**
- About 30 lines (the smoke test is most of it). Ship it as a `.desktop` file and script, or as a Flatpak.
- It has no packaging story beyond Flatpak, and it depends on each machine having `gir1.2-webkit2-4.1`.

**Flatpak** is a distribution channel, not a shell. It can wrap Electron or Tauri and gives one-command updates from your own repo across all your machines. `flatpak` is already installed here. It's worth it once there are three or more machines to keep up to date.

## Moving your saved palettes

Each shell keeps its own `localStorage`, so palettes don't carry over by themselves. Use the backup flow added in this release: **Back up or restore → Save backup file** in the old app, then **Open backup file → Replace everything** in the new one.

## Suggested path

1. Keep shipping the Electron AppImage for now. It works, and every test runs against it.
2. Try Tauri on a branch. The only code change in the page is a `saveText` branch for `window.__TAURI__`. Run `webkit_smoke.py`, then build `.deb` and AppImage and compare size and memory against Electron with `ls -lh` and `ps -o rss`.
3. If any target device is ARM, or the Rust toolchain isn't worth it, use the installable web app on those devices instead. The same `palette-shelf.html` serves both.

Sources: [Tauri AppImage docs](https://v2.tauri.app/distribute/appimage/), [Tauri bundler 2.10.0 notes](https://v2.tauri.app/release/tauri-bundler/v2.10.0/), [Tauri size estimate (third-party)](https://stuffbucket.github.io/skills/catalog/tauri-bundling-linux-packaging/), [Wails v3 Linux packaging](https://v3.wails.io/guides/build/linux), [Wails releases](https://github.com/wailsapp/wails/releases), [WebKit EyeDropper bug 229755](https://bugs.webkit.org/show_bug.cgi?id=229755), [EyeDropper support](https://web-platform-dx.github.io/web-features-explorer/features/eyedropper).
