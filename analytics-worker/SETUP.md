# One-time activation checklist

The analytics code is already wired into the website, but collection remains inactive until a Cloudflare Worker URL is configured.

1. Create a free Cloudflare account if you do not already have one.
2. Create a D1 database named `portfolio-analytics`.
3. Add these GitHub Actions secrets to this repository:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_D1_DATABASE_ID`
   - `ANALYTICS_ANON_SALT`
   - `ANALYTICS_EXPORT_TOKEN`
4. Run `.github/workflows/deploy-analytics-worker.yml` from the Actions tab.
5. Copy the Worker URL shown by Wrangler after deployment.
6. Set `analytics-config.js` → `endpoint` to `<worker-url>/collect`.
7. Add:
   - `ANALYTICS_EXPORT_URL` = the Worker base URL
   - `ANALYTICS_EXPORT_TOKEN` = the same export token from step 3
8. Run `.github/workflows/export-analytics-summary.yml` once manually to verify `analytics/summary.csv` updates.

No Google sign-in is required or used. No raw visitor IP is stored.
