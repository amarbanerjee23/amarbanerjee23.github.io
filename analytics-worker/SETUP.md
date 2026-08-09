# Near-zero-touch analytics activation

The website analytics system is already wired into the portfolio. Basic operation now needs only one unavoidable thing: permission to deploy into a Cloudflare account.

## Fastest path: two GitHub secrets, then one workflow run

1. Create or use a Cloudflare Free account.
2. In Cloudflare, create an API token for Workers/D1 deployment and copy the account ID.
3. In this GitHub repository, add only these two Actions secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Run the GitHub Action **Bootstrap and deploy privacy-aware analytics**.

The workflow then does the rest automatically:

- installs Wrangler;
- deploys the Worker;
- automatically provisions the D1 database from the `DB` binding;
- applies `schema.sql`;
- reads the deployed `workers.dev` URL from Wrangler's structured output;
- updates `analytics-config.js` with `<worker-url>/collect`;
- writes the base URL to `analytics/worker-url.txt`;
- verifies `/health`;
- commits the activated endpoint back to `main`.

After that, the existing website consent UI begins collecting anonymous analytics when a visitor opts in. The scheduled **Export public-safe analytics summary** workflow reads the safe `/summary.json` endpoint each day and updates `analytics/summary.json` and `analytics/summary.csv`. It needs no analytics export secret.

## Alternative: Cloudflare Workers Builds

Cloudflare can also connect directly to this GitHub repository through Workers Builds. Use `analytics-worker` as the root directory and `npm run deploy` as the deploy command. The committed Wrangler configuration uses automatic D1 provisioning, so no database ID is hard-coded.

With the direct Cloudflare build route, Cloudflare handles deployment authentication. After the first deploy, the resulting Worker URL still needs to be placed once in `analytics-config.js` because the public website is hosted separately on GitHub Pages.

## Privacy choices built into this implementation

- no raw visitor IP is written to D1;
- no Google identity is read or inferred;
- no GPS location is requested;
- no browser fingerprint is built;
- the browser random visitor/session IDs are SHA-256 hashed again before storage;
- public city and referrer summary groups with fewer than three anonymous visitors/sessions are suppressed;
- detailed pseudonymous records remain in Cloudflare D1 rather than the public GitHub repository.

An optional administrator export can still be enabled later by adding an `EXPORT_TOKEN` Worker secret. It is not required for normal analytics operation.
