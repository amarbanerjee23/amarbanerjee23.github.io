# Privacy-aware website analytics

This folder is the human-readable analytics surface for the public portfolio of **Dr Amar Banerjee**.

## Architecture

- The GitHub Pages site remains static and free.
- A Cloudflare Worker receives analytics events.
- Cloudflare D1 stores detailed pseudonymous events.
- Raw IP addresses are **never written to D1**.
- Cloudflare request metadata is used only for approximate country, region and city.
- No Google account, email address, GPS coordinate or browser fingerprint is collected.
- The public repository receives only aggregate 30-day summaries (`summary.json` and `summary.csv`).
- A protected `/admin/export.csv` endpoint provides pseudonymous event-level export when an administrator token is supplied. Do not publish that export in this public repository.

## Events captured after visitor consent

- page views
- section views
- CTA clicks
- brochure/PDF downloads
- email/contact clicks
- LinkedIn, ORCID and GitHub evidence clicks
- academic self-diagnosis choices

The browser sends only coarse device/browser/OS family and a random first-party visitor/session identifier. The Worker salts and hashes those identifiers before storage.

## One-time Cloudflare setup

1. On Cloudflare's Workers Free plan, create a D1 database named `portfolio-analytics`.
2. Copy its database ID.
3. Create a Cloudflare API token that can deploy Workers and edit D1 for this account.
4. In this GitHub repository, add Actions secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_D1_DATABASE_ID`
   - `ANALYTICS_ANON_SALT` (a long random secret)
   - `ANALYTICS_EXPORT_TOKEN` (a different long random secret)
5. Run the GitHub Action **Deploy privacy-aware analytics worker**.
6. Copy the deployed workers.dev URL, add `/collect`, and place that full URL in `analytics-config.js` as `endpoint`.
7. Add two more GitHub Actions secrets:
   - `ANALYTICS_EXPORT_URL` = the Worker base URL, without `/collect`
   - `ANALYTICS_EXPORT_TOKEN` = the same protected export token used above.
8. Import `analytics-bootstrap.js` from the website's shared script. Once the endpoint exists, the consent UI and collection activate automatically.

## Public summary

The scheduled GitHub Action **Export public-safe analytics summary** runs daily. It retrieves only aggregates for the last 30 days and commits them here. It intentionally does not expose anonymous visitor IDs or event-level city journeys publicly.

## Detailed private view

Use the protected Worker endpoint:

`GET /admin/export.csv?days=30`

with HTTP header:

`Authorization: Bearer <ANALYTICS_EXPORT_TOKEN>`

The export contains pseudonymous visitor/session hashes, approximate location and engagement events, but still contains no raw IP address or Google identity.

## Retention recommendation

Keep detailed event data for a limited period, for example 90 days, and retain aggregate summaries longer. A scheduled retention task can be added later if required.
