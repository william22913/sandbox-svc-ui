/**
 * Real-backend pass for FEAT-005. Unlike e2e/favorites-summary.mjs this script
 * talks to the running sandbox-svc, so it needs the app under test (`npm run
 * preview`, port 4173) and the BE:
 *
 *   node e2e/real-be.mjs
 *
 * BE_BASE_URL   the service, default http://host.docker.internal:18080
 * BE_TOKEN      an access token already seeded in the BE's Redis. Without it
 *               the authenticated cases are reported BLOCKED, not passed.
 *
 * Expected bodies are transcribed from the BE's own Postman assertions
 * (`postman/collection.json`, "__feat005 Summary — …") and from
 * docs/FEAT-005/api/openapi.yaml, so a drift in either shows up here.
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BE = process.env.BE_BASE_URL || 'http://host.docker.internal:18080';
const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:4173';
const TOKEN = process.env.BE_TOKEN || '';
const ARTIFACTS = new URL('./artifacts/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const UNAUTHORIZED = 'E-1-CMD-AUT-001';

const results = [];
const record = (name, state, detail) => results.push({ name, state, detail });

async function call(path, token = '') {
  const res = await fetch(`${BE}${path}`, { headers: token ? { Authorization: token } : {} });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { status: res.status, body, text, headers: res.headers };
}

const isErrorEnvelope = (body) =>
  body?.success === false &&
  typeof body?.header?.request_id === 'string' &&
  typeof body?.payload?.code === 'string' &&
  body?.payload?.total === undefined &&
  body?.payload?.discontinued === undefined;

async function httpPhase() {
  const health = await call('/v1/health');
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { db: 'UP', redis: 'UP', status: 'UP' });
  record('RB-01 GET /v1/health', 'PASS', JSON.stringify(health.body));

  // The same 401 the Postman collection asserts for anonymous and invalid
  // tokens; the app's interceptor keys off the status, not the code.
  for (const [id, path, token] of [
    ['RB-02 anonymous summary', '/v1/favorites/summary', ''],
    ['RB-03 invalid-token summary', '/v1/favorites/summary', 'live-unseeded-token'],
    ['RB-04 anonymous list', '/v1/favorites', ''],
  ]) {
    const res = await call(path, token);
    assert.equal(res.status, 401, `${id}: expected 401, got ${res.status}`);
    assert.equal(isErrorEnvelope(res.body), true, `${id}: unexpected body ${res.text}`);
    assert.equal(res.body.payload.code, UNAUTHORIZED);
    record(id, 'PASS', `401 ${res.body.payload.code} ${path}`);
  }

  // FEAT-004's count route is what the badge calls. The released BE answers
  // 405, which no FE mapping can turn into a count.
  const count = await call('/v1/favorites/count', TOKEN || 'live-user-1-token');
  if (count.status === 200) {
    assert.ok(Number.isInteger(count.body?.payload?.count), `count payload ${count.text}`);
    record('RB-05 GET /v1/favorites/count', 'PASS', `200 payload.count=${count.body.payload.count}`);
  } else {
    record(
      'RB-05 GET /v1/favorites/count',
      'MISMATCH',
      `${count.status} - route absent from the released BE (FEAT-004 not deployed)`
    );
  }

  if (TOKEN) {
    const summary = await call('/v1/favorites/summary', TOKEN);
    assert.equal(summary.status, 200, `summary ${summary.status} ${summary.text}`);
    // Exactly the two fields favoriteService reads
    // (src/core/services/favoriteService.js: fetchFavoritesSummary).
    const { total, discontinued } = summary.body.payload;
    assert.ok(Number.isInteger(total) && total >= 0, `total ${total}`);
    assert.ok(Number.isInteger(discontinued) && discontinued >= 0, `discontinued ${discontinued}`);
    assert.ok(discontinued <= total, `${discontinued} > ${total}`);
    record('RB-06 authenticated summary body', 'PASS', JSON.stringify(summary.body.payload));
  } else {
    const seeded = await call('/v1/favorites/summary', 'live-user-1-token');
    record(
      'RB-06 authenticated summary body',
      'BLOCKED',
      `live-user-1-token -> ${seeded.status}; the BE's Redis holds no seed (see docs/FEAT-005/fe-test-results.md §11)`
    );
  }

  const cors = health.headers;
  record(
    'RB-07 CORS on the BE',
    'NOTE',
    `allow-origin=${cors.get('access-control-allow-origin')} allow-credentials=${cors.get('access-control-allow-credentials')} (a credentialed browser call to a wildcard origin is refused, so the app reaches the BE through a same-origin proxy, as nginx does)`
  );
}

/**
 * Browser phase: the app's own FEAT-004/005 calls are forwarded to the real
 * BE (`route.fetch` = the same-origin proxy nginx is in production); only the
 * FEAT-001 list call is stubbed so the page does not redirect to login.
 */
async function browserPhase() {
  await mkdir(ARTIFACTS, { recursive: true });
  const browser = await chromium.launch({
    args: ['--no-sandbox'],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const seen = { count: [], summary: [], list: 0 };

  const forward = async (route) => {
    const url = new URL(route.request().url());
    const target = `${BE}${url.pathname.replace(/^\/api/, '')}${url.search}`;
    const response = await route.fetch({
      url: target,
      headers: { ...route.request().headers(), ...(TOKEN ? { authorization: TOKEN } : {}) },
    });
    const status = response.status();
    (url.pathname.endsWith('/summary') ? seen.summary : seen.count).push(status);
    await route.fulfill({ response });
  };

  await page.route('**/api/v1/favorites/count', forward);
  await page.route('**/api/v1/favorites/summary', forward);
  await page.route('**/api/favorites**', (route) => {
    seen.list += 1;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            item_id: '101',
            name: 'Kopi Arabika Gayo 250 g',
            category: 'Makanan & Minuman',
            price: 85000,
            available: true,
            favorited_at: '2026-10-22T09:00:00Z',
          },
        ],
        page: 1,
        page_size: 20,
        total: 1,
      }),
    });
  });

  await page.goto(`${BASE}/favorites?case=real-be`);
  await page.getByText('Kopi Arabika Gayo 250 g').waitFor();
  await page.waitForTimeout(500);

  const badges = await page.locator('.shell__badge').count();
  await page.screenshot({ path: `${ARTIFACTS}/feat-004-real-be-badge.png` });

  assert.equal(seen.list, 1, 'the FEAT-001 list call should have run');
  assert.equal(seen.count.length, 1, 'the badge should have asked the BE for a count');
  assert.equal(seen.summary.length, 0, 'no summary request without a visible badge');

  if (seen.count[0] === 200) {
    assert.equal(badges, 1, 'a 200 count should render the badge');
    record('RB-08 app against the real BE', 'PASS', `count ${seen.count[0]}, badge rendered`);
  } else {
    assert.equal(badges, 0, `badge must stay hidden after count ${seen.count[0]}`);
    record(
      'RB-08 app against the real BE',
      'PASS',
      `count ${seen.count[0]} -> no badge, no summary request (badge is correctly hidden, but the BE cannot supply a count)`
    );
  }

  await browser.close();
}

async function main() {
  try {
    await httpPhase();
    await browserPhase();
  } finally {
    for (const { name, state, detail } of results) console.log(`${state.padEnd(8)} ${name} - ${detail}`);
    const blocked = results.filter((r) => r.state === 'MISMATCH' || r.state === 'BLOCKED');
    if (blocked.length) console.log(`\n${blocked.length} case(s) not PASS: ${blocked.map((r) => r.name).join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
