#!/usr/bin/env python3
"""Build the desktop page and the Windows file from palette-shelf.html.

Needs `npm install` inside app/ first (it reads the Space Mono fonts from node_modules).
Writes app/index.html (loaded by Electron), dist/palette-shelf-windows.html (a single file that opens in any browser)
and tauri/www/index.html (loaded by the Tauri build).
"""
import base64, pathlib, re, sys
root = pathlib.Path(__file__).parent
src = (root / 'palette-shelf.html').read_text()
fontdir = root / 'app/node_modules/@fontsource/space-mono/files'
link = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap">'
assert src.count(link) == 1, 'Google Fonts link not found in palette-shelf.html'
faces = []
for style in ('normal', 'italic'):
    for w in (400, 700):
        b = base64.b64encode((fontdir / f'space-mono-latin-{w}-{style}.woff2').read_bytes()).decode()
        faces.append(f"@font-face{{font-family:'Space Mono';font-style:{style};font-weight:{w};font-display:swap;src:url(data:font/woff2;base64,{b}) format('woff2')}}")
fonts = '<style>' + ''.join(faces) + '</style>'
csp = ("default-src 'self' data: blob:; style-src 'self' 'unsafe-inline' data:; "
       "script-src 'self' 'unsafe-inline'; font-src data:; img-src data: blob:")
head = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        f'<meta http-equiv="Content-Security-Policy" content="{csp}">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<title>Palette Shelf</title>'
        '<style>html,body{margin:0}</style></head><body>\n')
out = head + src.replace(link, fonts) + '\n</body></html>\n'
(root / 'app/index.html').write_text(out)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/palette-shelf-windows.html').write_text(out)
# Tauri build: same page, with the CSP also allowing Tauri's IPC channel
tauri_out = out.replace("img-src data: blob:", "img-src data: blob:; connect-src ipc: http://ipc.localhost", 1)
assert tauri_out != out, 'CSP not found'
(root / 'tauri/www').mkdir(parents=True, exist_ok=True)
(root / 'tauri/www/index.html').write_text(tauri_out)
# GitHub Pages: the standalone build, served at /app/ next to the landing page in docs/
(root / 'docs/app').mkdir(parents=True, exist_ok=True)
(root / 'docs/app/index.html').write_text(out)
print('wrote app/index.html, dist/palette-shelf-windows.html, tauri/www/index.html and docs/app/index.html', len(out), 'bytes')
