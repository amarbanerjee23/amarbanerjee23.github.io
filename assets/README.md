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

## Guardrails

`python scripts/check-static-assets.py` verifies local references. `python scripts/check-asset-layout.py` prevents CSS, JavaScript and image implementation files from drifting back into repository root.
