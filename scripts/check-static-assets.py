#!/usr/bin/env python3
"""Fail CI when a public page references a local static asset that is missing.

The checker distinguishes source-relative imports/CSS URLs from browser runtime
URLs embedded in JavaScript. Browser strings such as `downloads/file.pdf.b64`
or `workshops.html` are document-root resources even when the JavaScript file
itself lives under assets/js/.
"""

from __future__ import annotations

import html.parser
import pathlib
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC_SUFFIXES = {".html", ".css", ".js"}
ASSET_SUFFIXES = {
    ".html", ".css", ".js", ".mjs", ".json", ".xml",
    ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico",
    ".pdf", ".b64", ".woff", ".woff2", ".ttf", ".otf",
}
SKIP_DIRS = {
    ".git", ".github", "node_modules", "analytics-worker", "brochures-latex",
    ".wrangler", ".venv", "venv", "dist", "build",
}

CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", re.I)
CSS_IMPORT_RE = re.compile(r"@import\s+(?:url\(\s*)?['\"]([^'\"]+)['\"]\s*\)?", re.I)
JS_IMPORT_RE = re.compile(
    r"(?:import\s*(?:\([^)]*?['\"]([^'\"]+)['\"]\)|[^;]*?from\s*['\"]([^'\"]+)['\"])|"
    r"export\s+[^;]*?from\s*['\"]([^'\"]+)['\"])",
    re.S,
)
JS_ASSET_STRING_RE = re.compile(
    r"['\"]([^'\"\n]*(?:\.html|\.css|\.js|\.mjs|\.json|\.xml|\.svg|\.png|\.jpe?g|\.webp|\.gif|\.ico|\.pdf|\.b64|\.woff2?|\.ttf|\.otf)(?:[?#][^'\"\n]*)?)['\"]",
    re.I,
)


def is_skipped(path: pathlib.Path) -> bool:
    try:
        rel = path.relative_to(ROOT)
    except ValueError:
        return True
    return any(part in SKIP_DIRS for part in rel.parts)


def normalise_reference(raw: str) -> str | None:
    value = raw.strip()
    if not value:
        return None
    lowered = value.lower()
    if lowered.startswith(("http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:", "blob:")):
        return None
    if value.startswith("#"):
        return None
    if any(token in value for token in ("${", "{{", "}}", "<%", "%>")):
        return None
    parsed = urlsplit(value)
    path = unquote(parsed.path).strip()
    if not path or path == "/":
        return None
    return path


def resolve_reference(source: pathlib.Path, kind: str, raw: str) -> pathlib.Path | None:
    path = normalise_reference(raw)
    if path is None:
        return None
    if path.startswith("/"):
        return (ROOT / path.lstrip("/")).resolve()

    # JS imports are source-relative. Other JS asset strings are browser/document
    # resources, so a plain URL is rooted at the public site rather than assets/js.
    if kind == "js asset string" and not path.startswith(("./", "../")):
        return (ROOT / path).resolve()

    return (source.parent / path).resolve()


class HTMLReferences(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for attr in ("href", "src", "poster", "data-src"):
            if values.get(attr):
                self.refs.append((f"{tag}[{attr}]", values[attr] or ""))
        srcset = values.get("srcset")
        if srcset:
            for item in srcset.split(","):
                url = item.strip().split()[0] if item.strip() else ""
                if url:
                    self.refs.append((f"{tag}[srcset]", url))


def collect_references(source: pathlib.Path) -> list[tuple[str, str]]:
    text = source.read_text(encoding="utf-8", errors="replace")
    refs: list[tuple[str, str]] = []
    if source.suffix.lower() == ".html":
        parser = HTMLReferences()
        parser.feed(text)
        refs.extend(parser.refs)
    elif source.suffix.lower() == ".css":
        refs.extend(("css url()", match.group(2)) for match in CSS_URL_RE.finditer(text))
        refs.extend(("css @import", match.group(1)) for match in CSS_IMPORT_RE.finditer(text))
    elif source.suffix.lower() in {".js", ".mjs"}:
        import_targets: set[str] = set()
        for match in JS_IMPORT_RE.finditer(text):
            target = next((group for group in match.groups() if group), None)
            if target:
                refs.append(("js import", target))
                import_targets.add(target)
        for match in JS_ASSET_STRING_RE.finditer(text):
            target = match.group(1)
            if target not in import_targets:
                refs.append(("js asset string", target))
    return refs


def should_validate(raw: str) -> bool:
    path = normalise_reference(raw)
    if path is None:
        return False
    suffix = pathlib.Path(path).suffix.lower()
    return suffix in ASSET_SUFFIXES or ".pdf.b64" in path.lower()


def is_runtime_download_filename(kind: str, raw: str) -> bool:
    if kind != "js asset string":
        return False
    path = normalise_reference(raw)
    if path is None:
        return False
    return pathlib.PurePosixPath(path).suffix.lower() == ".pdf" and "/" not in path and "\\" not in path


def main() -> int:
    sources = [
        path for path in ROOT.rglob("*")
        if path.is_file() and not is_skipped(path) and path.suffix.lower() in PUBLIC_SUFFIXES
    ]
    errors: list[str] = []
    checked = 0
    seen: set[tuple[pathlib.Path, str, str]] = set()

    for source in sorted(sources):
        for kind, raw in collect_references(source):
            if is_runtime_download_filename(kind, raw) or not should_validate(raw):
                continue
            key = (source, kind, raw)
            if key in seen:
                continue
            seen.add(key)
            target = resolve_reference(source, kind, raw)
            if target is None:
                continue
            checked += 1
            try:
                target.relative_to(ROOT)
            except ValueError:
                errors.append(f"{source.relative_to(ROOT)}: {kind} escapes repository root: {raw}")
                continue
            if not target.exists():
                errors.append(
                    f"{source.relative_to(ROOT)}: {kind} references missing local asset {raw!r} "
                    f"-> {target.relative_to(ROOT)}"
                )

    if errors:
        print("STATIC ASSET INTEGRITY: FAIL\n")
        for error in errors:
            print(f"- {error}")
        print(f"\nChecked {checked} local asset references across {len(sources)} public source files.")
        return 1

    print("STATIC ASSET INTEGRITY: PASS")
    print(f"Checked {checked} local asset references across {len(sources)} public source files; no missing local assets found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
