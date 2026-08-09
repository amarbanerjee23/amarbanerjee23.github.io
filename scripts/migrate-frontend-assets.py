#!/usr/bin/env python3
"""Safely segregate frontend assets for the GitHub Pages site.

Public HTML routes stay at repository root. CSS and JavaScript are moved into
flat assets/css and assets/js directories so relative module relationships
remain simple. Media is grouped beneath assets/media. Every known local
reference is rewritten before the old paths disappear, then CI validates the
result before it can be committed by the migration workflow.
"""

from __future__ import annotations

import pathlib
import posixpath
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
IMAGE_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"}
TEXT_SUFFIXES = {".html", ".css", ".js", ".mjs", ".json", ".jsonc", ".yml", ".yaml", ".md", ".py", ".xml", ".txt", ".toml"}
WEB_SUFFIXES = {".html", ".css", ".js", ".mjs"}
SKIP_PARTS = {".git", "node_modules", "analytics-worker", "brochures-latex", ".wrangler", ".venv", "venv"}
SELF = pathlib.Path("scripts/migrate-frontend-assets.py")


def run(*args: str) -> None:
    subprocess.run(args, cwd=ROOT, check=True)


def rel(path: pathlib.Path) -> str:
    return path.relative_to(ROOT).as_posix()


def planned_mapping() -> dict[str, str]:
    mapping: dict[str, str] = {}
    for path in sorted(ROOT.glob("*.css")):
        mapping[path.name] = f"assets/css/{path.name}"
    for path in sorted(ROOT.glob("*.js")):
        mapping[path.name] = f"assets/js/{path.name}"

    headshot = ROOT / "headshot.png"
    if headshot.exists():
        mapping["headshot.png"] = "assets/media/portraits/headshot.png"

    assets = ROOT / "assets"
    if assets.exists():
        for path in sorted(assets.iterdir()):
            if not path.is_file() or path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            current = rel(path)
            if path.name == "favicon.svg":
                destination = "assets/media/icons/favicon.svg"
            elif path.name == "ai-innovation-network.svg":
                destination = "assets/media/illustrations/ai-innovation-network.svg"
            else:
                destination = f"assets/media/misc/{path.name}"
            mapping[current] = destination
    return mapping


def move_assets(mapping: dict[str, str]) -> None:
    for source_rel, destination_rel in mapping.items():
        source = ROOT / source_rel
        destination = ROOT / destination_rel
        if not source.exists():
            continue
        if destination.exists():
            raise RuntimeError(f"Refusing to overwrite existing destination: {destination_rel}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        run("git", "mv", source_rel, destination_rel)


def make_reference_pattern(mapping: dict[str, str]) -> re.Pattern[str]:
    alternatives = "|".join(re.escape(key) for key in sorted(mapping, key=len, reverse=True))
    return re.compile(rf"(?<![A-Za-z0-9_./-])(?P<prefix>\./|/)?(?P<asset>{alternatives})(?![A-Za-z0-9_./-])")


def rewrite_moved_references(text: str, source: pathlib.Path, mapping: dict[str, str], pattern: re.Pattern[str]) -> str:
    web_source = source.suffix.lower() in WEB_SUFFIXES

    def replace(match: re.Match[str]) -> str:
        destination = mapping[match.group("asset")]
        prefix = match.group("prefix") or ""
        # Browser-facing source files use site-root URLs. This makes moved files
        # independent of their own directory and prevents future relative-path drift.
        if web_source or prefix == "/":
            return "/" + destination
        return destination

    return pattern.sub(replace, text)


CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", re.I)


def root_css_local_urls(text: str) -> str:
    """Preserve the meaning of CSS url() references after CSS leaves repo root."""
    def replace(match: re.Match[str]) -> str:
        quote = match.group(1)
        value = match.group(2).strip()
        lowered = value.lower()
        if not value or value.startswith(("/", "#")) or lowered.startswith(("data:", "http://", "https://", "//", "var(")):
            return match.group(0)
        path, query_sep, query = value.partition("?")
        fragment = ""
        if "#" in path:
            path, hash_sep, frag = path.partition("#")
            fragment = hash_sep + frag
        normalized = posixpath.normpath(path)
        if normalized.startswith("../"):
            return match.group(0)
        rooted = "/" + normalized.lstrip("./")
        if query_sep:
            rooted += "?" + query
        rooted += fragment
        return f"url({quote}{rooted}{quote})"
    return CSS_URL_RE.sub(replace, text)


def should_process(path: pathlib.Path) -> bool:
    relative = path.relative_to(ROOT)
    if relative == SELF or any(part in SKIP_PARTS for part in relative.parts):
        return False
    return path.is_file() and path.suffix.lower() in TEXT_SUFFIXES


def rewrite_repository(mapping: dict[str, str]) -> None:
    if not mapping:
        return
    pattern = make_reference_pattern(mapping)
    moved_css = {destination for source, destination in mapping.items() if source.endswith(".css")}
    for path in sorted(ROOT.rglob("*")):
        if not should_process(path):
            continue
        original = path.read_text(encoding="utf-8", errors="strict")
        updated = rewrite_moved_references(original, path, mapping, pattern)
        if rel(path) in moved_css:
            updated = root_css_local_urls(updated)
        if updated != original:
            path.write_text(updated, encoding="utf-8")


def write_layout_checker() -> None:
    (ROOT / "scripts/check-asset-layout.py").write_text(
        '''#!/usr/bin/env python3\n"""Keep frontend implementation assets out of the repository root."""\nfrom pathlib import Path\nimport sys\nROOT = Path(__file__).resolve().parents[1]\nIMAGE_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"}\nloose = sorted(path.name for path in ROOT.iterdir() if path.is_file() and (path.suffix.lower() in {".css", ".js", ".mjs"} or path.suffix.lower() in IMAGE_SUFFIXES))\nif loose:\n    print("ASSET LAYOUT: FAIL")\n    print("Move frontend implementation assets under assets/: " + ", ".join(loose))\n    sys.exit(1)\nrequired = [ROOT / "assets/css", ROOT / "assets/js", ROOT / "assets/media"]\nmissing = [str(path.relative_to(ROOT)) for path in required if not path.is_dir()]\nif missing:\n    print("ASSET LAYOUT: FAIL")\n    print("Missing asset directories: " + ", ".join(missing))\n    sys.exit(1)\nprint("ASSET LAYOUT: PASS")\nprint("CSS, JavaScript and media are segregated under assets/.")\n''', encoding="utf-8")


def patch_integrity_workflow() -> None:
    workflow = ROOT / ".github/workflows/static-site-integrity.yml"
    if not workflow.exists():
        return
    text = workflow.read_text(encoding="utf-8")
    marker = "      - name: Validate frontend asset layout\n        run: python scripts/check-asset-layout.py\n"
    if marker not in text:
        anchor = "      - name: Validate HTML, CSS and JavaScript asset references\n        run: python scripts/check-static-assets.py\n"
        if anchor not in text:
            raise RuntimeError("Could not find static asset validation step")
        text = text.replace(anchor, anchor + "\n" + marker)
    workflow.write_text(text, encoding="utf-8")


def write_assets_readme() -> None:
    (ROOT / "assets/README.md").write_text(
        """# Website assets\n\nPublic HTML routes remain at repository root so existing page URLs stay stable. Frontend implementation files are segregated here.\n\n```text\nassets/\n├── css/          # all site stylesheets\n├── js/           # all browser JavaScript\n└── media/\n    ├── portraits/\n    ├── icons/\n    ├── illustrations/\n    └── misc/\n```\n\nOther responsibilities deliberately remain separate: `downloads/` for downloadable brochures/resources, `analytics/` for privacy-safe exports, `analytics-worker/` for the Cloudflare Worker, `brochures-latex/` for source documents, `scripts/` for repository tooling, and `.github/` for CI/CD.\n\n## Guardrails\n\n`python scripts/check-static-assets.py` verifies local references. `python scripts/check-asset-layout.py` prevents CSS, JavaScript and image implementation files from drifting back into repository root.\n""", encoding="utf-8")


def main() -> None:
    mapping = planned_mapping()
    if mapping:
        print("Planned frontend asset moves:")
        for source, destination in mapping.items():
            print(f"- {source} -> {destination}")
        move_assets(mapping)
        rewrite_repository(mapping)
        print(f"Organized {len(mapping)} frontend assets.")
    else:
        print("No loose frontend assets found; layout already organized.")
    write_layout_checker()
    patch_integrity_workflow()
    write_assets_readme()


if __name__ == "__main__":
    main()
