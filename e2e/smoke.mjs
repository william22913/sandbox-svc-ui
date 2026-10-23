/**
 * Browser smoke for FEAT-001. Run against `npm run preview` (port 4173):
 *   node e2e/smoke.mjs
 * API calls are intercepted, so no backend is required.
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:4173';
const ARTIFACTS = new URL('./artifacts/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const mode = { get: 'list', post: 'ok' };

const items = [
  {
    item_id: '101',
    name: 'Kopi Arabika Gayo 250 g',
    category: 'Makanan & Minuman',
    price: 85000,
    available: true,
    favorited_at: '2026-10-22T09:00:00Z',
  },
  {
    item_id: '102',
    name: 'Teh Hijau Premium 100 g',
    category: 'Makanan & Minuman',
    price: 42500,
    available: true,
    favorited_at: '2026-10-21T09:00:00Z',
  },
  {
    item_id: '103',
    name: 'Cangkir Keramik Handmade',
    category: 'Peralatan Rumah',
    price: 125000,
    available: false,
    favorited_at: '2026-10-20T09:00:00Z',
  },
];

async function main() {
  await mkdir(ARTIFACTS, { recursive: true });
  const browser = await chromium.launch(
    process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : { channel: 'chrome' }
  );
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.route('**/api/favorites**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      if (mode.get === '401') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error_code: 'UNAUTHENTICATED', message: 'login required' }),
        });
        return;
      }
      if (mode.get === 'empty') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], page: 1, page_size: 20, total: 0 }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: items, page: 1, page_size: 20, total: 137 }),
      });
      return;
    }
    if (request.method() === 'POST' && mode.post === 'limit') {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          error_code: 'FAVORITES_LIMIT_REACHED',
          message: 'limit reached',
        }),
      });
      return;
    }
    await route.fulfill({ status: request.method() === 'DELETE' ? 204 : 200, body: '' });
  });

  // 1. Populated list, newest-first columns, paging footer.
  await page.goto(`${BASE}/favorites`);
  await page.getByText('Kopi Arabika Gayo 250 g').waitFor();
  assert.equal(await page.locator('.favorites-table__footer').innerText().then((text) => text.includes('1-20 dari 137')), true);
  assert.equal(await page.getByText('Tidak Tersedia').isVisible(), true);
  await page.screenshot({ path: `${ARTIFACTS}/favorites-desktop.png`, fullPage: true });
  console.log('PASS populated list + paging footer');

  // 2. Mobile stacked layout.
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.route('**/api/favorites**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: items, page: 1, page_size: 20, total: 137 }),
    })
  );
  await mobile.goto(`${BASE}/favorites`);
  await mobile.getByText('Kopi Arabika Gayo 250 g').waitFor();
  assert.equal(await mobile.locator('thead').isVisible(), false);
  await mobile.screenshot({ path: `${ARTIFACTS}/favorites-mobile.png`, fullPage: true });
  console.log('PASS mobile stacked layout');

  // 3. Empty state (REQ-009).
  mode.get = 'empty';
  await page.goto(`${BASE}/favorites`);
  await page.getByText('Belum ada favorit').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Jelajahi Katalog' }).isVisible(), true);
  await page.screenshot({ path: `${ARTIFACTS}/favorites-empty.png`, fullPage: true });
  console.log('PASS empty state');
  mode.get = 'list';

  // 4. Detail star: cap error inline (REQ-011), then a successful save.
  await page.goto(`${BASE}/catalog`);
  await page.getByRole('link', { name: 'Kopi Arabika Gayo 250 g' }).click();
  const star = page.getByRole('button', { name: 'Simpan' });
  await star.waitFor();
  mode.post = 'limit';
  await star.click();
  await page.getByRole('alert').filter({ hasText: 'Anda dapat menyimpan hingga 500 favorit.' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Simpan' }).getAttribute('aria-pressed'), 'false');
  await page.screenshot({ path: `${ARTIFACTS}/item-detail-cap-error.png`, fullPage: true });
  console.log('PASS inline cap error');

  mode.post = 'ok';
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.getByRole('button', { name: 'Tersimpan' }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Tersimpan' }).getAttribute('aria-pressed'), 'true');
  console.log('PASS optimistic star toggle');

  // 5. 401 redirects to login with a return path, then returns (REQ-006/012).
  mode.get = '401';
  await page.goto(`${BASE}/favorites`);
  await page.waitForURL(/\/login\?redirect=%2Ffavorites/);
  console.log('PASS 401 redirect to login');
  mode.get = 'list';
  await page.getByRole('button', { name: 'Masuk' }).click();
  await page.waitForURL(/\/favorites$/);
  await page.getByText('Kopi Arabika Gayo 250 g').waitFor();
  console.log('PASS login return path');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
