#!/usr/bin/env python3
"""One-time, idempotent frontend asset migration for the GitHub Pages site.

Goals:
- keep public HTML pages at repository root for stable URLs;
- place CSS, JavaScript and media under a predictable assets/ hierarchy;
- rewrite every local reference before the old paths disappear;
- preserve root-relative browser URLs so nested asset locations do not change runtime resolution;
- add CI guardrails so loose root assets are not reintroduced later.

The script is intentionally conservative: downloads, analytics data, Worker code,
LaTeX sources, GitHub workflows and public HTML routes keep their existing homes.
"""

from __future__ import annotations

import os
import pathlib
import posixpath
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]

CSS_DESTINATIONS = {
    "styles.css": "assets/css/base/styles.css",
    "portfolio.css": "assets/css/base/portfolio.css",
    "facilitation.css": "assets/css/base/facilitation.css",
    "ux.css": "assets/css/base/ux.css",
    "ux-state-of-art.css": "assets/css/base/ux-state-of-art.css",
    "ux-calm-v2.css": "assets/css/base/ux-calm-v2.css",
    "ai-background.css": "assets/css/base/ai-background.css",
    "story-ui.css": "assets/css/components/story-ui.css",
    "story-ui-responsive.css": "assets/css/components/story-ui-responsive.css",
    "story-unfold.css": "assets/css/components/story-unfold.css",
    "sticky-nav-fix.css": "assets/css/components/sticky-nav-fix.css",
    "reading-comfort.css": "assets/css/components/reading-comfort.css",
    "academic-offerings.css": "assets/css/components/academic-offerings.css",
    "contact-intake.css": "assets/css/components/contact-intake.css",
    "academic-conversion.css": "assets/css/components/academic-conversion.css",
    "academic-future.css": "assets/css/pages/academic-future.css",
    "academic-programs.css": "assets/css/pages/academic-programs.css",
    "academic-partnerships.css": "assets/css/pages/academic-partnerships.css",
    "research-ip.css": "assets/css/pages/research-ip.css",
    "profile-page.css": "assets/css/pages/profile-page.css",
}

JS_DESTINATIONS = {
    "script.js": "assets/js/core/script.js",
    "story-ui.js": "assets/js/core/story-ui.js",
    "story-unfold.js": "assets/js/core/story-unfold.js",
    "analytics-bootstrap.js": "assets/js/components/analytics-bootstrap.js",
    "analytics.js": "assets/js/components/analytics.js",
    "analytics-config.js": "assets/js/components/analytics-config.js",
    "academic-offerings.js": "assets/js/components/academic-offerings.js",
    "contact-intake.js": "assets/js/components/contact-intake.js",
    "academic-home.js": "assets/js/pages/academic-home.js",
    "academic-programs.js": "assets/js/pages/academic-programs.js",
    "profile-page.js": "assets/js/pages/profile-page.js",
    "academic-engagement.js": "assets/js/pages/academic-engagement.js",
    "research-supplement.js": "assets/js/pages/research-supplement.js",
    "gallery.js": "assets/js/pages/gallery.js",
    "gallery-images.js": "assets/js/pages/gallery-images.js",
}

IMAGE_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"}
TEXT_SUFFIXES = {
    ".html", ".css", ".js", ".mjs", ".json", ".jsonc", ".yml", ".yaml",
    ".md", ".py", ".xml", ".txt", ".toml",
}
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
        destination = CSS_DESTINATIONS.get(path.name, f"assets/css/legacy/{path.name}")
        mapping[path.name] = destination

    for path in sorted(ROOT.glob("*.js")):
        destination = JS_DESTINATIONS.get(path.name, f"assets/js/legacy/{path.name}")
        mapping[path.name] = destination

    headshot = ROOT / "headshot.png"
    if headshot.exists():
        mapping["headshot.png"] = "assets/media/portraits/headshot.png"

    assets = ROOT / "assets"
    if assets.exists():
        for path in sorted(assets.iterdir()):
            if not path.is_file() or path.suffix.lower() not in IMAGE_SUFFIXES:
                continue
            current = path.relative_to(ROOT).as_posix()
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
    keys = sorted(mapping, key=len, reverse=True)
    alternatives = "|".join(re.escape(key) for key in keys)
    return re.compile(
        rf"(?<![A-Za-z0-9_./-])(?P<prefix>\./|/)?(?P<asset>{alternatives})(?![A-Za-z0-9_./-])"
    )


def rewrite_moved_references(text: str, source: pathlib.Path, mapping: dict[str, str], pattern: re.Pattern[str]) -> str:
    web_source = source.suffix.lower() in WEB_SUFFIXES

    def replace(match: re.Match[str]) -> str:
        prefix = match.group("prefix") or ""
        destination = mapping[match.group("asset")]
        if prefix == "/" or web_source:
            return "/" + destination
        return destination

    return pattern.sub(replace, text)


CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)([^)'\"]+)\1\s*\)", re.I)


def root_css_local_urls(text: str) -> str:
    """CSS files used to live at repo root; preserve that resolution after moving."""

    def replace(match: re.Match[str]) -> str:
        quote = match.group(1)
        value = match.group(2).strip()
        lowered = value.lower()
        if not value or value.startswith(("/", "#")) or lowered.startswith(("data:", "http://", "https://", "//", "var(")):
            return match.group(0)
        path, separator, suffix = value.partition("?")
        fragment = ""
        if "#" in path:
            path, hash_sep, fragment = path.partition("#")
            fragment = hash_sep + fragment
        normalized = posixpath.normpath(path)
        if normalized.startswith("../"):
            return match.group(0)
        rooted = "/" + normalized.lstrip("./")
        if separator:
            rooted += "?" + suffix
        rooted += fragment
        return f"url({quote}{rooted}{quote})"

    return CSS_URL_RE.sub(replace, text)


def should_process(path: pathlib.Path) -> bool:
    relative = path.relative_to(ROOT)
    if relative == SELF:
        return False
    if any(part in SKIP_PARTS for part in relative.parts):
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
    checker = ROOT / "scripts/check-asset-layout.py"
    checker.write_text(
        '''#!/usr/bin/env python3\n"""Keep frontend implementation assets out of the repository root."""\n\nfrom pathlib import Path\nimport sys\n\nROOT = Path(__file__).resolve().parents[1]\nIMAGE_SUFFIXES = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".ico"}\n\nloose = sorted(\n    path.name for path in ROOT.iterdir()\n    if path.is_file() and (path.suffix.lower() in {".css", ".js", ".mjs"} or path.suffix.lower() in IMAGE_SUFFIXES)\n)\n\nif loose:\n    print("ASSET LAYOUT: FAIL")\n    print("Frontend implementation assets belong under assets/: " + ", ".join(loose))\n    sys.exit(1)\n\nrequired = [\n    ROOT / "assets/css/base",\n    ROOT / "assets/css/components",\n    ROOT / "assets/css/pages",\n    ROOT / "assets/js/core",\n    ROOT / "assets/js/components",\n    ROOT / "assets/js/pages",\n    ROOT / "assets/media",\n]\nmissing = [str(path.relative_to(ROOT)) for path in required if not path.is_dir()]\nif missing:\n    print("ASSET LAYOUT: FAIL")\n    print("Missing required asset directories: " + ", ".join(missing))\n    sys.exit(1)\n\nprint("ASSET LAYOUT: PASS")\nprint("Frontend CSS, JavaScript and media are segregated under assets/.")\n''',
        encoding="utf-8",
    )


def patch_integrity_workflow() -> None:
    workflow = ROOT / ".github/workflows/static-site-integrity.yml"
    if not workflow.exists():
        return
    text = workflow.read_text(encoding="utf-8")
    marker = "      - name: Validate frontend asset layout\n        run: python scripts/check-asset-layout.py\n"
    if marker in text:
        return
    anchor = "      - name: Validate HTML, CSS and JavaScript asset references\n        run: python scripts/check-static-assets.py\n"
    if anchor not in text:
        raise RuntimeError("Could not find static asset validation step to extend")
    workflow.write_text(text.replace(anchor, anchor + "\n" + marker), encoding="utf-8")


def write_assets_readme(mapping: dict[str, str]) -> None:
    readme = ROOT / "assets/README.md"
    legacy_css = sorted(destination for destination in mapping.values() if destination.startswith("assets/css/legacy/"))
    legacy_js = sorted(destination for destination in mapping.values() if destination.startswith("assets/js/legacy/"))
    legacy_note = ""
    if legacy_css or legacy_js:
        legacy_note = (
            "\n## Legacy bucket\n\n"
            "Files that were not part of the named active architecture were retained under `legacy/` rather than deleted. "
            "The static-reference checker protects against removing them while they are still referenced.\n"
        )
    readme.write_text(
        """# Frontend assets\n\nThe public HTML routes intentionally remain at repository root. Frontend implementation assets are grouped here so the repository root stays readable and URLs remain predictable.\n\n## Layout\n\n```text\nassets/\n├── css/\n│   ├── base/        # shared foundations and global UX layers\n│   ├── components/  # reusable navigation, contact and offering components\n│   ├── pages/       # page-specific academic/profile/research styling\n│   └── legacy/      # retained only when an uncategorised historical file exists\n├── js/\n│   ├── core/        # shared runtime, story navigation and orchestration\n│   ├── components/  # analytics, contact and reusable academic components\n│   ├── pages/       # page-specific behaviour\n│   └── legacy/      # retained only when an uncategorised historical file exists\n└── media/\n    ├── portraits/\n    ├── icons/\n    ├── illustrations/\n    └── misc/\n```\n\n## Stable areas kept outside `assets/`\n\n- `*.html`: stable public GitHub Pages routes\n- `downloads/`: downloadable brochures/resources\n- `analytics/`: privacy-safe exported analytics summaries\n- `analytics-worker/`: Cloudflare Worker application\n- `brochures-latex/`: brochure source documents\n- `scripts/`: repository validation and maintenance tools\n- `.github/`: CI/CD automation\n\n## Guardrails\n\n`python scripts/check-static-assets.py` validates local browser references. `python scripts/check-asset-layout.py` prevents CSS, JavaScript or image implementation assets from drifting back into repository root.\n"""
        + legacy_note,
        encoding="utf-8",
    )


def main() -> None:
    mapping = planned_mapping()
    if not mapping:
        print("No loose frontend assets found; layout already organized.")
        write_layout_checker()
        patch_integrity_workflow()
        return

    print("Planned frontend asset moves:")
    for source, destination in mapping.items():
        print(f"- {source} -> {destination}")

    move_assets(mapping)
    rewrite_repository(mapping)
    write_layout_checker()
    patch_integrity_workflow()
    write_assets_readme(mapping)

    print(f"Organized {len(mapping)} frontend assets.")


if __name__ == "__main__":
    main()
