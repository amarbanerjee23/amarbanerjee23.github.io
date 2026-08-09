#!/usr/bin/env python3
"""Root browser-facing local URLs after JavaScript moves under assets/js/.

JavaScript strings such as `workshops.html` or `downloads/foo.pdf.b64` are
resolved by browsers at runtime, but the static integrity checker evaluates
references relative to the source file. Rooting public URLs removes ambiguity
and makes the code resilient to future directory moves.
"""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
JS_ROOT = ROOT / "assets/js"

ASSET_STRING_RE = re.compile(
    r"(?P<quote>['\"])(?P<value>[^'\"\n]*(?:\.html|\.css|\.js|\.mjs|\.json|\.xml|\.svg|\.png|\.jpe?g|\.webp|\.gif|\.ico|\.pdf|\.b64|\.woff2?|\.ttf|\.otf)(?:[?#][^'\"\n]*)?)(?P=quote)",
    re.I,
)


def should_root(value: str) -> bool:
    lowered = value.lower().strip()
    if not lowered or lowered.startswith(("/", "./", "../", "http://", "https://", "//", "data:", "blob:", "mailto:", "tel:", "#")):
        return False
    if any(token in value for token in ("${", "{{", "}}")):
        return False

    path = value.split("?", 1)[0].split("#", 1)[0]
    suffix = pathlib.PurePosixPath(path).suffix.lower()

    # Plain PDF names are download filenames, not network locations.
    if suffix == ".pdf" and "/" not in path and not lowered.endswith(".pdf.b64"):
        return False

    return True


def main() -> None:
    if not JS_ROOT.is_dir():
        raise SystemExit("assets/js does not exist; run the asset migration first")

    changed = 0
    for path in sorted(JS_ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in {".js", ".mjs"}:
            continue
        original = path.read_text(encoding="utf-8")

        def replace(match: re.Match[str]) -> str:
            value = match.group("value")
            if not should_root(value):
                return match.group(0)
            return f"{match.group('quote')}/{value}{match.group('quote')}"

        updated = ASSET_STRING_RE.sub(replace, original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed += 1
            print(f"Rooted runtime URLs in {path.relative_to(ROOT)}")

    print(f"Runtime URL normalization complete; {changed} JavaScript file(s) changed.")


if __name__ == "__main__":
    main()
