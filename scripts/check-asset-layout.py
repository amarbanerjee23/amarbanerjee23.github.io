#!/usr/bin/env python3
"""Keep frontend implementation assets out of the repository root."""
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
IMAGE_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"}
loose = sorted(path.name for path in ROOT.iterdir() if path.is_file() and (path.suffix.lower() in {".css", ".js", ".mjs"} or path.suffix.lower() in IMAGE_SUFFIXES))
if loose:
    print("ASSET LAYOUT: FAIL")
    print("Move frontend implementation assets under assets/: " + ", ".join(loose))
    sys.exit(1)
required = [ROOT / "assets/css", ROOT / "assets/js", ROOT / "assets/media"]
missing = [str(path.relative_to(ROOT)) for path in required if not path.is_dir()]
if missing:
    print("ASSET LAYOUT: FAIL")
    print("Missing asset directories: " + ", ".join(missing))
    sys.exit(1)
print("ASSET LAYOUT: PASS")
print("CSS, JavaScript and media are segregated under assets/.")
