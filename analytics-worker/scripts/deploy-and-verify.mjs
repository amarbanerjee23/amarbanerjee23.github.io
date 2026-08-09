import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outputFile = path.join(root, '.wrangler-deploy-output.ndjson');
try { fs.rmSync(outputFile, { force: true }); } catch (_) {}

const run = (command, args, extraEnv = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  if (result.status !== 0) process.exit(result.status || 1);
};

console.log('\n[analytics] Deploying Worker and auto-provisioning D1...');
run('npx', ['wrangler', 'deploy'], { WRANGLER_OUTPUT_FILE_PATH: outputFile });

console.log('\n[analytics] Applying D1 schema...');
run('npx', ['wrangler', 'd1', 'execute', 'DB', '--remote', '--file=./schema.sql', '--yes']);

console.log('\n[analytics] Verifying D1 tables are queryable...');
run('npx', [
  'wrangler', 'd1', 'execute', 'DB', '--remote', '--yes',
  '--command=SELECT COUNT(*) AS events_count FROM events; SELECT COUNT(*) AS visitors_count FROM visitors;'
]);
console.log('[analytics] D1 schema check: PASS');

if (!fs.existsSync(outputFile)) {
  throw new Error('Wrangler structured deployment output was not created.');
}

const records = fs.readFileSync(outputFile, 'utf8')
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => {
    try { return JSON.parse(line); } catch (_) { return null; }
  })
  .filter(Boolean);

const deployments = records.filter(record => record.type === 'deploy');
const latest = deployments.at(-1);
const workerUrl = (latest?.targets || []).find(target => /^https:\/\//i.test(target));
if (!workerUrl) throw new Error('Could not determine the workers.dev deployment URL from Wrangler output.');

const baseUrl = workerUrl.replace(/\/$/, '');
console.log(`\n[analytics] Worker URL: ${baseUrl}`);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastError = '';
for (let attempt = 1; attempt <= 8; attempt += 1) {
  try {
    const response = await fetch(`${baseUrl}/health`, { headers: { 'Cache-Control': 'no-cache' } });
    const payload = await response.json();
    if (response.ok && payload.ok === true) {
      console.log('[analytics] Worker health check: PASS');
      console.log(`[analytics] COLLECT_URL=${baseUrl}/collect`);
      console.log(`[analytics] SUMMARY_URL=${baseUrl}/summary.json?days=30`);
      console.log('[analytics] ANALYTICS_READY=true');
      fs.rmSync(outputFile, { force: true });
      process.exit(0);
    }
    lastError = JSON.stringify(payload);
  } catch (error) {
    lastError = String(error);
  }
  console.log(`[analytics] Health attempt ${attempt}/8 not ready yet; retrying...`);
  await sleep(5000);
}

throw new Error(`Worker deployed but health verification failed: ${lastError}`);
