#!/usr/bin/env python3
"""Normalize absolute same-origin asset URLs after frontend segregation."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://amarbanerjee23.github.io'
TEXT_SUFFIXES = {'.html', '.css', '.js', '.mjs', '.json', '.xml', '.md'}
SKIP = {'.git', 'node_modules', 'analytics-worker', 'brochures-latex'}

replacements = {
    f'{ORIGIN}/headshot.png': f'{ORIGIN}/assets/media/portraits/headshot.png',
    f'{ORIGIN}/assets/favicon.svg': f'{ORIGIN}/assets/media/icons/favicon.svg',
    f'{ORIGIN}/assets/ai-innovation-network.svg': f'{ORIGIN}/assets/media/illustrations/ai-innovation-network.svg',
}

changed = 0
for path in ROOT.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in TEXT_SUFFIXES:
        continue
    rel = path.relative_to(ROOT)
    if any(part in SKIP for part in rel.parts):
        continue
    original = path.read_text(encoding='utf-8')
    updated = original
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != original:
        path.write_text(updated, encoding='utf-8')
        changed += 1
        print(f'Updated same-origin metadata URL in {rel}')

print(f'Same-origin asset URL normalization: {changed} file(s) changed.')
