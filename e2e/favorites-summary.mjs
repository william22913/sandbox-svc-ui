/**
 * Browser smoke for FEAT-005 (and the FEAT-004 badge it hangs off).
 * Run against `npm run preview` (port 4173):
 *   node e2e/favorites-summary.mjs
 * API calls are intercepted, so no backend is required.
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:4173';
const ARTIFACTS = new URL('./artifacts/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');

const envelope = (payload) => ({
  success: true,
  header: { request_id: 'e2e', version: '1.0.0', timestamp: '2026-11-08T00:00:00.000Z' },
  payload,
});

const listItems = [
  {
    item_id: '101',
    name: 'Kopi Arabika Gayo 250 g',
    category: 'Makanan & Minuman',
    price: 85000,
    available: true,
    favorited_at: '2026-10-22T09:00:00Z',
  },
];

async function main() {
  await mkdir(ARTIFACTS, { recursive: true });
  // --no-sandbox: the CI container cannot set up Chromium's own sandbox.
  const browser = await chromium.launch({
    args: ['--no-sandbox'],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  });

  const counts = { calls: 0, value: 5, status: 200, delay: 0 };
  const summary = { calls: 0, payload: { total: 5, discontinued: 1 }, status: 200, delay: 0 };

  async function installMocks(page) {
    await page.route('**/api/v1/favorites/count', async (route) => {
      counts.calls += 1;
      if (counts.delay) await new Promise((resolve) => setTimeout(resolve, counts.delay));
      if (counts.status !== 200) {
        await route.fulfill({
          status: counts.status,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, header: {}, payload: { status: counts.status, code: 'E-1-CMD-SYS-001', message: 'count failed' } }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope({ count: counts.value })),
      });
    });

    await page.route('**/api/v1/favorites/summary', async (route) => {
      summary.calls += 1;
      if (summary.delay) await new Promise((resolve) => setTimeout(resolve, summary.delay));
      if (summary.status !== 200) {
        await route.fulfill({
          status: summary.status,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, header: {}, payload: { status: summary.status, code: 'E-1-CMD-SYS-001', message: 'summary failed' } }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope(summary.payload)),
      });
    });

    await page.route('**/api/favorites**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: listItems, page: 1, page_size: 20, total: 1 }),
        });
        return;
      }
      await route.fulfill({ status: method === 'DELETE' ? 204 : 200, body: '' });
    });
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await installMocks(page);

  const reset = (nextCount, nextSummary) => {
    counts.value = nextCount;
    counts.status = 200;
    counts.delay = 0;
    summary.payload = nextSummary;
    summary.status = 200;
    summary.delay = 0;
    summary.calls = 0;
  };

  const goto = async (suffix) => {
    await page.goto(`${BASE}/favorites${suffix}`);
    await page.locator('.shell__brand').waitFor();
  };

  // A tooltip still fading out is at opacity 0; count only what the eye sees.
  const openTooltips = (p = page) =>
    p.evaluate(
      () =>
        [...document.querySelectorAll('.ant-tooltip')].filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.height > 0 && Number(getComputedStyle(node).opacity) > 0.05;
        }).length
    );

  // 1. No summary request on load; first hover shows the exact tooltip.
  reset(5, { total: 5, discontinued: 1 });
  await goto('?case=first-hover');
  await page.locator('[aria-label="5 favorit"]').waitFor();
  assert.equal(summary.calls, 0, 'no summary fetch on app load (REQ-007)');
  assert.equal((await page.locator('.shell__badge').innerText()).trim(), '5');
  await page.locator('.shell__badge').hover();
  await page.getByText('5 favorites (1 discontinued)').waitFor();
  assert.equal(summary.calls, 1, 'one summary fetch on first hover');

  // rc-align positions the surface one frame after it mounts.
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('.ant-tooltip')].some(
        (node) => node.getBoundingClientRect().left > 0
      ),
    null,
    { timeout: 3000 }
  );

  const metrics = await page.evaluate(() => {
    const badge = document.querySelector('.shell__badge > div');
    // antd keeps hidden tooltip shells around at 0,0 — measure the open one.
    const surface = [...document.querySelectorAll('.ant-tooltip')].find(
      (node) => !node.classList.contains('ant-tooltip-hidden') && node.getBoundingClientRect().height > 0
    );
    const inner = surface.querySelector('.ant-tooltip-inner');
    const arrow = surface.querySelector('.ant-tooltip-arrow');
    const badgeRect = badge.getBoundingClientRect();
    const innerRect = inner.getBoundingClientRect();
    const arrowRect = arrow.getBoundingClientRect();
    const innerStyle = getComputedStyle(inner);
    const badgeStyle = getComputedStyle(badge);
    return {
      badge: {
        width: badgeRect.width,
        height: badgeRect.height,
        background: badgeStyle.backgroundColor,
        border: `${badgeStyle.borderTopWidth} ${badgeStyle.borderTopColor}`,
        radius: badgeStyle.borderRadius,
        fontSize: badgeStyle.fontSize,
        fontWeight: badgeStyle.fontWeight,
        lineHeight: badgeStyle.lineHeight,
      },
      tooltip: {
        background: innerStyle.backgroundColor,
        color: innerStyle.color,
        radius: innerStyle.borderRadius,
        padding: innerStyle.padding,
        fontSize: innerStyle.fontSize,
        fontWeight: innerStyle.fontWeight,
        lineHeight: innerStyle.lineHeight,
        boxShadow: innerStyle.boxShadow,
        height: innerRect.height,
        width: innerRect.width,
      },
      arrow: { width: arrowRect.width, height: arrowRect.height, tipGap: innerRect.top - badgeRect.bottom },
      surfaceGap: innerRect.top - badgeRect.bottom,
      boxes: {
        badge: { top: badgeRect.top, bottom: badgeRect.bottom, left: badgeRect.left, width: badgeRect.width },
        surface: { top: surface.getBoundingClientRect().top, left: surface.getBoundingClientRect().left, width: surface.getBoundingClientRect().width, height: surface.getBoundingClientRect().height },
        inner: { top: innerRect.top, left: innerRect.left },
      },
    };
  });
  console.log('METRICS', JSON.stringify(metrics));

  assert.equal(metrics.badge.height, 20);
  assert.ok(metrics.badge.width >= 29, 'badge min width 29');
  assert.equal(metrics.badge.background, 'rgb(208, 47, 26)');
  assert.equal(metrics.badge.border, '1px rgb(255, 255, 255)');
  assert.equal(metrics.badge.fontSize, '10px');
  assert.equal(metrics.badge.fontWeight, '500');
  assert.equal(metrics.tooltip.background, 'rgb(66, 66, 66)');
  assert.equal(metrics.tooltip.color, 'rgb(255, 255, 255)');
  assert.equal(metrics.tooltip.radius, '4px');
  assert.equal(metrics.tooltip.padding, '4px 8px');
  assert.equal(metrics.tooltip.fontSize, '12px');
  assert.equal(metrics.tooltip.fontWeight, '400');
  assert.equal(metrics.tooltip.lineHeight, '14px');
  assert.equal(metrics.tooltip.height, 22);
  assert.ok(metrics.tooltip.boxShadow.includes('rgba(0, 0, 0, 0.1)'));
  // DesignBrief: "Below the badge, centred on it, arrow pointing up".
  assert.ok(metrics.boxes.surface.top >= metrics.boxes.badge.bottom, 'tooltip sits below the badge');
  const badgeCenter = metrics.boxes.badge.left + metrics.boxes.badge.width / 2;
  const surfaceCenter = metrics.boxes.surface.left + metrics.boxes.surface.width / 2;
  assert.ok(Math.abs(badgeCenter - surfaceCenter) <= 1, 'tooltip centred on the badge');

  await page.waitForTimeout(250); // let the fade finish before capturing
  await page.screenshot({ path: `${ARTIFACTS}/feat-005-tooltip-desktop.png` });
  await page.locator('.ant-tooltip').screenshot({ path: `${ARTIFACTS}/feat-005-tooltip-closeup.png` });
  await page.locator('.shell__badge').screenshot({ path: `${ARTIFACTS}/feat-005-badge-closeup.png` });
  console.log('PASS first-hover fetch + exact tooltip');

  // Click-through is a non-goal: the badge has no handler.
  await page.locator('.shell__badge').click();
  assert.equal(new URL(page.url()).pathname, '/favorites');
  console.log('PASS badge click does nothing');

  // 2. 99+ badge, exact integers in the tooltip.
  reset(150, { total: 150, discontinued: 3 });
  await goto('?case=capped');
  await page.locator('[aria-label="99+ favorit"]').waitFor();
  assert.equal((await page.locator('.shell__badge').innerText()).trim(), '99+');
  await page.locator('.shell__badge').hover();
  await page.getByText('150 favorites (3 discontinued)').waitFor();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${ARTIFACTS}/feat-005-tooltip-capped.png` });
  console.log('PASS 99+ badge with exact tooltip integers');

  // 3. No tooltip while loading; it appears when the summary becomes ready.
  reset(5, { total: 5, discontinued: 1 });
  summary.delay = 800;
  await goto('?case=loading');
  await page.locator('[aria-label="5 favorit"]').waitFor();
  await page.locator('.shell__badge').hover();
  await page.waitForTimeout(250);
  assert.equal(await openTooltips(), 0, 'no tooltip while loading');
  await page.getByText('5 favorites (1 discontinued)').waitFor({ timeout: 4000 });
  console.log('PASS no tooltip while loading, shown when ready');

  // 4. A 500 shows no tooltip; a later hover retries.
  reset(5, { total: 5, discontinued: 1 });
  summary.status = 500;
  await goto('?case=error');
  await page.locator('[aria-label="5 favorit"]').waitFor();
  await page.locator('.shell__badge').hover();
  await page.waitForTimeout(300);
  assert.equal(await openTooltips(), 0, 'no tooltip after 500');
  assert.equal((await page.locator('.shell__badge').innerText()).trim(), '5');
  summary.status = 200;
  await page.locator('.shell__brand').hover();
  await page.locator('.shell__badge').hover();
  await page.getByText('5 favorites (1 discontinued)').waitFor();
  console.log('PASS no tooltip after 500, retry on next hover');

  // 5. Zero favorites: no badge, no hover target, no fetch.
  reset(0, { total: 0, discontinued: 0 });
  await goto('?case=zero');
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.shell__badge').count(), 0);
  await page.locator('.shell__brand-row').hover();
  await page.waitForTimeout(250);
  assert.equal(await openTooltips(), 0);
  assert.equal(summary.calls, 0, 'no summary fetch without a badge');
  console.log('PASS hidden badge at zero with no fetch');

  // 6. Post-action refresh: the next tooltip reflects the new values.
  reset(5, { total: 5, discontinued: 1 });
  await page.goto(`${BASE}/catalog/101`);
  await page.locator('[aria-label="5 favorit"]').waitFor();
  await page.locator('.shell__badge').hover();
  await page.getByText('5 favorites (1 discontinued)').waitFor();
  counts.value = 6;
  summary.payload = { total: 6, discontinued: 1 };
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.getByRole('button', { name: 'Tersimpan' }).waitFor();
  await page.locator('[aria-label="6 favorit"]').waitFor();
  await page.locator('.shell__brand').hover();
  assert.equal(await page.getByText('5 favorites (1 discontinued)').isVisible(), false);
  await page.locator('.shell__badge').hover();
  await page.getByText('6 favorites (1 discontinued)').waitFor();
  assert.equal(summary.calls, 2, 'summary refetched after the action');
  console.log('PASS summary refreshed after favorite action, no stale values');

  // 7. Zero discontinued keeps the literal template (TC-018).
  reset(5, { total: 5, discontinued: 0 });
  await goto('?case=no-discontinued');
  await page.locator('.shell__badge').hover();
  await page.getByText('5 favorites (0 discontinued)').waitFor();
  console.log('PASS zero discontinued uses the literal template');

  // 8. One favorite keeps the literal plural (TC-019).
  reset(1, { total: 1, discontinued: 0 });
  await goto('?case=one');
  await page.locator('[aria-label="1 favorit"]').waitFor();
  await page.locator('.shell__badge').hover();
  await page.getByText('1 favorites (0 discontinued)').waitFor();
  console.log('PASS one favorite keeps the literal plural');

  // 9. All-discontinued totals agree (TC-034).
  reset(3, { total: 3, discontinued: 3 });
  await goto('?case=all-discontinued');
  await page.locator('.shell__badge').hover();
  await page.getByText('3 favorites (3 discontinued)').waitFor();
  console.log('PASS all-discontinued equal counts');

  // 10. The tooltip agrees with the badge count it hangs off (TC-021).
  reset(42, { total: 42, discontinued: 7 });
  await goto('?case=agree');
  assert.equal((await page.locator('.shell__badge').innerText()).trim(), '42');
  await page.locator('.shell__badge').hover();
  await page.getByText('42 favorites (7 discontinued)').waitFor();
  console.log('PASS tooltip agrees with the badge count');

  // 11. A repeat hover reuses the held summary (TC-022).
  reset(3, { total: 3, discontinued: 1 });
  await goto('?case=repeat');
  await page.locator('.shell__badge').hover();
  await page.getByText('3 favorites (1 discontinued)').waitFor();
  assert.equal(summary.calls, 1);
  await page.locator('.shell__brand').hover();
  await page.waitForTimeout(150);
  await page.locator('.shell__badge').hover();
  await page.getByText('3 favorites (1 discontinued)').waitFor();
  assert.equal(summary.calls, 1, 'repeat hover does not refetch');
  console.log('PASS repeat hover does not refetch');

  // 12. Badge hidden while the count is loading: no tooltip, no fetch (TC-024).
  reset(5, { total: 5, discontinued: 1 });
  counts.delay = 5000;
  await page.goto(`${BASE}/favorites?case=count-loading`);
  await page.locator('.shell__brand').waitFor();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.shell__badge').count(), 0, 'no badge while the count loads');
  await page.locator('.shell__brand-row').hover();
  await page.waitForTimeout(200);
  assert.equal(summary.calls, 0, 'no summary fetch without a badge');
  console.log('PASS no badge, tooltip or fetch while the count loads');

  // 13. Count error hides the badge (TC-025).
  reset(5, { total: 5, discontinued: 1 });
  counts.status = 500;
  await goto('?case=count-error');
  await page.waitForTimeout(300);
  assert.equal(await page.locator('.shell__badge').count(), 0, 'no badge after a count error');
  await page.locator('.shell__brand-row').hover();
  await page.waitForTimeout(200);
  assert.equal(summary.calls, 0, 'no summary fetch after a count error');
  console.log('PASS no badge, tooltip or fetch after a count error');

  // 14. Unauthenticated: the count 401 sends the visitor to login (TC-026).
  reset(5, { total: 5, discontinued: 1 });
  counts.status = 401;
  await page.goto(`${BASE}/favorites?case=anonymous`);
  await page.waitForURL(/\/login/);
  assert.equal(await page.locator('.shell__badge').count(), 0);
  assert.equal(summary.calls, 0, 'no summary fetch for an anonymous visitor');
  console.log('PASS anonymous visitor: no badge, tooltip or fetch');

  // 15. Un-favorite refreshes the held summary (TC-030).
  reset(5, { total: 5, discontinued: 1 });
  await goto('?case=unfavorite');
  await page.locator('.shell__badge').hover();
  await page.getByText('5 favorites (1 discontinued)').waitFor();
  counts.value = 4;
  summary.payload = { total: 4, discontinued: 0 };
  await page.getByRole('button', { name: 'Hapus dari favorit' }).first().click();
  await page.locator('[aria-label="4 favorit"]').waitFor();
  await page.locator('.shell__brand').hover();
  await page.locator('.shell__badge').hover();
  await page.getByText('4 favorites (0 discontinued)').waitFor();
  assert.equal(summary.calls, 2, 'summary refetched after un-favoriting');
  console.log('PASS summary refreshed after un-favorite, no stale values');

  // 16. A failed post-action refresh never shows stale values (TC-031).
  reset(5, { total: 5, discontinued: 1 });
  await goto('?case=refresh-fails');
  await page.locator('.shell__badge').hover();
  await page.getByText('5 favorites (1 discontinued)').waitFor();
  counts.value = 4;
  summary.status = 500;
  await page.getByRole('button', { name: 'Hapus dari favorit' }).first().click();
  await page.locator('[aria-label="4 favorit"]').waitFor();
  await page.locator('.shell__brand').hover();
  await page.locator('.shell__badge').hover();
  await page.waitForTimeout(400);
  assert.equal(await page.getByText('5 favorites (1 discontinued)').isVisible(), false, 'old values never shown');
  assert.equal(await openTooltips(), 0, 'no tooltip after a failed refresh');
  summary.status = 200;
  summary.payload = { total: 4, discontinued: 0 };
  await page.locator('.shell__brand').hover();
  await page.locator('.shell__badge').hover();
  await page.getByText('4 favorites (0 discontinued)').waitFor();
  console.log('PASS failed refresh shows no stale values, retry works');

  // 17. A never-fetched summary stays first-hover-driven across an action (TC-032).
  reset(5, { total: 5, discontinued: 1 });
  await page.goto(`${BASE}/catalog/101?case=never-fetched`);
  await page.locator('[aria-label="5 favorit"]').waitFor();
  counts.value = 6;
  summary.payload = { total: 6, discontinued: 1 };
  await page.getByRole('button', { name: 'Simpan' }).click();
  await page.locator('[aria-label="6 favorit"]').waitFor();
  assert.equal(summary.calls, 0, 'an action does not fetch a summary that was never hovered');
  await page.locator('.shell__badge').hover();
  await page.getByText('6 favorites (1 discontinued)').waitFor();
  assert.equal(summary.calls, 1, 'the first hover still fetches once');
  console.log('PASS never-fetched summary stays first-hover-driven');

  // 18. Un-favoriting the last item hides the badge and the tooltip (TC-035).
  reset(1, { total: 1, discontinued: 0 });
  await goto('?case=last');
  await page.locator('.shell__badge').hover();
  await page.getByText('1 favorites (0 discontinued)').waitFor();
  counts.value = 0;
  summary.payload = { total: 0, discontinued: 0 };
  await page.getByRole('button', { name: 'Hapus dari favorit' }).first().click();
  await page.locator('.shell__badge').waitFor({ state: 'detached' });
  await page.locator('.shell__brand-row').hover();
  await page.waitForTimeout(300);
  assert.equal(await openTooltips(), 0, 'no tooltip once the badge is gone');
  console.log('PASS un-favoriting the last item hides the badge and tooltip');

  // 19. Mobile placement screenshot.
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await installMocks(mobile);
  counts.value = 5;
  summary.payload = { total: 5, discontinued: 1 };
  summary.status = 200;
  summary.delay = 0;
  await mobile.goto(`${BASE}/favorites`);
  await mobile.locator('[aria-label="5 favorit"]').waitFor();
  await mobile.locator('.shell__badge').hover();
  await mobile.getByText('5 favorites (1 discontinued)').waitFor();
  await mobile.waitForTimeout(250);
  await mobile.screenshot({ path: `${ARTIFACTS}/feat-005-tooltip-mobile.png` });
  console.log('PASS mobile screenshot');

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
