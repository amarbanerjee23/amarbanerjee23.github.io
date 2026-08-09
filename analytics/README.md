# Privacy-aware website analytics

This folder is the human-readable analytics surface for the public portfolio of **Dr Amar Banerjee**.

## Architecture

- The GitHub Pages site remains static and free.
- A Cloudflare Worker receives analytics events after visitor consent.
- Cloudflare D1 stores detailed pseudonymous events.
- Raw IP addresses are **never written to D1**.
- Cloudflare request metadata is used only for approximate country, region and city.
- No Google account, email address, GPS coordinate or browser fingerprint is collected.
- The public repository receives only aggregate 30-day summaries (`summary.json` and `summary.csv`).
- Public city and referrer groups smaller than three anonymous visitors/sessions are suppressed.
- A protected `/admin/export.csv` endpoint is available only if an optional `EXPORT_TOKEN` Worker secret is configured.

## Events captured after visitor consent

- page views
- section views
- CTA clicks
- brochure/PDF downloads
- email/contact clicks
- LinkedIn, ORCID and GitHub evidence clicks
- academic self-diagnosis choices

The browser sends only coarse device/browser/OS family and random first-party visitor/session IDs. The Worker hashes those random IDs again with SHA-256 before storage so the value in D1 is not the value stored in the browser.

## Simplified activation

The automated GitHub workflow now needs only two Cloudflare credentials:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Run **Bootstrap and deploy privacy-aware analytics**. It automatically deploys the Worker, provisions D1 from the committed binding, applies the schema, discovers the Worker URL, updates `analytics-config.js`, checks health and commits activation back to the website.

See `analytics-worker/SETUP.md` for the exact steps and the alternative Cloudflare Workers Builds route.

## Public summary

The Worker exposes `/summary.json` containing aggregate, public-safe metrics only. The scheduled GitHub Action **Export public-safe analytics summary** reads that endpoint every day and commits the latest 30-day view to:

- `analytics/summary.json`
- `analytics/summary.csv`

The export workflow needs no analytics API key or export token once the collector endpoint is activated.

## Detailed private view

Detailed pseudonymous records remain in Cloudflare D1. The optional protected endpoint is:

`GET /admin/export.csv?days=30`

If an `EXPORT_TOKEN` secret is configured on the Worker, send:

`Authorization: Bearer <EXPORT_TOKEN>`

Do not publish event-level exports in this public repository.

## Retention recommendation

Keep detailed event data for a limited period, for example 90 days, and retain aggregate summaries longer. A scheduled retention task can be added later if required.
