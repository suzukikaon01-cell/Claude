#!/usr/bin/env python3
"""Build the standalone website package (GitHub Pages) from dist/.

Usage: python3 scripts/build-pages.py <output-dir>
Copies only the files the game needs, wraps index.html in a full HTML document
(viewport, home-screen / fullscreen metadata) and writes a web app manifest + icons.
"""
import json, os, shutil, sys
from PIL import Image, ImageDraw

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, out = os.path.join(root, 'dist'), os.path.abspath(sys.argv[1])
SKIP_DIRS = {'client', os.path.join('config', 'versions'), os.path.join('assets', 'monster-previews')}
SKIP_FILES = {os.path.join('assets', 'heroes', 'xuefeng-reference.jpg'), 'map.html', 'monsters.html',
              'monster-gallery.js', 'map-debug-v14.js'}

for name in os.listdir(out) if os.path.isdir(out) else []:
    if name == '.git':
        continue
    path = os.path.join(out, name)
    shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)
for base, dirs, files in os.walk(src):
    rel = os.path.relpath(base, src)
    rel = '' if rel == '.' else rel
    dirs[:] = [d for d in dirs if os.path.join(rel, d) not in SKIP_DIRS]
    for f in files:
        r = os.path.join(rel, f)
        if r in SKIP_FILES or f.endswith('.css') or f.endswith('.md'):
            continue
        os.makedirs(os.path.join(out, rel), exist_ok=True)
        shutil.copy2(os.path.join(base, f), os.path.join(out, r))

body = open(os.path.join(src, 'index.html'), encoding='utf-8').read()
head = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="裂境战场">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
'''
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(head + body + '\n</html>\n')

manifest = {'name': '裂境战场 · RIFT ARENA', 'short_name': '裂境战场', 'start_url': './', 'scope': './',
            'display': 'fullscreen', 'orientation': 'landscape', 'background_color': '#0b141d',
            'theme_color': '#0b141d',
            'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                      {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]}
json.dump(manifest, open(os.path.join(out, 'manifest.webmanifest'), 'w', encoding='utf-8'), ensure_ascii=False)

for size in (192, 512):
    im = Image.new('RGB', (size, size), (11, 20, 29))
    d, c, r = ImageDraw.Draw(im), size / 2, size * .3
    d.polygon([(c, c - r), (c + r, c), (c, c + r), (c - r, c)], outline=(212, 181, 118), width=max(4, size // 24))
    k = r * .5
    d.polygon([(c, c - k), (c + k, c), (c, c + k), (c - k, c)], fill=(212, 181, 118))
    im.save(os.path.join(out, f'icon-{size}.png'))
open(os.path.join(out, '.nojekyll'), 'w').close()
print('built', out)
