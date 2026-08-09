#!/usr/bin/env python3
"""Guard the browser/Worker CORS contract for portfolio analytics.

The browser intentionally sends analytics without cookies/HTTP credentials. The
Worker also keeps credential-compatible CORS headers so older cached clients
that used sendBeacon do not fail while caches expire.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
client = (ROOT / 'assets/js/analytics.js').read_text(encoding='utf-8')
worker = (ROOT / 'analytics-worker' / 'src' / 'index.js').read_text(encoding='utf-8')

errors = []

if "credentials: 'omit'" not in client and 'credentials: "omit"' not in client:
    errors.append("assets/js/analytics.js must use fetch credentials:'omit'.")

if 'navigator.sendBeacon(' in client:
    errors.append('assets/js/analytics.js must not send cross-origin analytics with navigator.sendBeacon().')

required_worker_fragments = [
    "'Access-Control-Allow-Origin': origin",
    "'Access-Control-Allow-Credentials': 'true'",
    "'Access-Control-Allow-Methods': 'POST, OPTIONS'",
    "'Access-Control-Allow-Headers': 'Content-Type'",
]
for fragment in required_worker_fragments:
    if fragment not in worker:
        errors.append(f'Worker CORS contract is missing: {fragment}')

if "origin !== allowedOrigin" not in worker:
    errors.append('Worker must continue restricting collection to the configured website origin.')

if errors:
    print('ANALYTICS CORS CONTRACT: FAIL')
    for error in errors:
        print(f'- {error}')
    raise SystemExit(1)

print('ANALYTICS CORS CONTRACT: PASS')
