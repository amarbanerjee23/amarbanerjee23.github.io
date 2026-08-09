# Website assets

Public HTML routes remain at repository root so existing page URLs stay stable. Frontend implementation files are segregated here.

```text
assets/
├── css/          # all site stylesheets
├── js/           # all browser JavaScript
└── media/
    ├── portraits/
    ├── icons/
    ├── illustrations/
    └── misc/
```

Other responsibilities deliberately remain separate: `downloads/` for downloadable brochures/resources, `analytics/` for privacy-safe exports, `analytics-worker/` for the Cloudflare Worker, `brochures-latex/` for source documents, `scripts/` for repository tooling, and `.github/` for CI/CD.

## URL contract

Public page URLs do not change. Browser-facing asset references use site-root paths such as `/assets/css/styles.css`, `/assets/js/script.js` and `/assets/media/portraits/headshot.png`, so moving implementation files does not make resolution depend on the current HTML page or JavaScript directory.

## Guardrails

`python scripts/check-static-assets.py` verifies local references. `python scripts/check-asset-layout.py` prevents CSS, JavaScript and image implementation files from drifting back into repository root. The Static site integrity workflow also syntax-checks all browser JavaScript and performs a live GitHub Pages smoke test after deployment to `main`.
