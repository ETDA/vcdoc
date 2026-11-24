import { test, expect } from '@playwright/test';

// Run against the built site (build/) served by the webServer in
// playwright.config.mjs. The site's baseUrl is /vcdoc/, so all paths below are
// full /vcdoc/... URLs.

const HOME = '/vcdoc/';

test.describe('locale support', () => {
  test('Thai homepage renders at the root', async ({ page }) => {
    await page.goto(HOME);
    await expect(page.locator('h1').first()).toContainText('Thai VC ARF');
  });

  test('Thai chapter renders at /thai-vc-arf/...', async ({ page }) => {
    await page.goto('/vcdoc/thai-vc-arf/scope/');
    await expect(page.locator('h1').first()).toContainText('ขอบข่าย');
  });

  test('English summary renders at /en/thai-vc-arf/...', async ({ page }) => {
    await page.goto('/vcdoc/en/thai-vc-arf/minimal-interoperability-reference/');
    await expect(page.locator('h1').first()).toContainText("Thailand's VC stack");
  });
});

test.describe('mermaid diagrams', () => {
  test('sequence diagram renders after hydration', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto('/vcdoc/thai-vc-arf/08.1-issuance-full-flow-detail/');

    // The container is empty in the static HTML and is populated with an <svg>
    // only after the client hydrates and runs mermaid.render().
    const container = page.locator('.docusaurus-mermaid-container');
    await expect(container.first()).toBeAttached();

    const svg = container.first().locator('svg');
    await expect(svg).toBeAttached();
    // Rendered diagram must contain real content, not an empty wrapper.
    await expect
      .poll(async () => svg.evaluate((el) => el.querySelectorAll('path, text, foreignObject').length))
      .toBeGreaterThan(0);

    expect(errors).toEqual([]);
  });

  test('every mermaid block in a page renders', async ({ page }) => {
    // 13-vc-status-and-revocation has 7 mermaid blocks in source.
    await page.goto('/vcdoc/thai-vc-arf/vc-status-and-revocation/');
    const containers = page.locator('.docusaurus-mermaid-container');
    await expect(containers.first()).toBeAttached();
    await expect(containers).toHaveCount(7);
  });
});

test.describe('doc integrity', () => {
  test('sidebar lists chapter navigation', async ({ page }) => {
    await page.goto('/vcdoc/thai-vc-arf/scope/');
    const sidebar = page.locator('nav.menu');
    await expect(sidebar).toContainText('ขอบข่าย');
    await expect(sidebar).toContainText('2. บทนิยาม');
  });
});

test.describe('version chain', () => {
  test('version dropdown lists the frozen draft with its Thai release date', async ({ page }) => {
    await page.goto('/vcdoc/thai-vc-arf/scope/');

    const dropdown = page.locator('.navbar__item.dropdown').first();
    await dropdown.locator('button, a').first().click();

    const menu = page.locator('.dropdown__menu').first();
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('2.0 DRAFT 1 · กำลังจัดทำ');
    await expect(menu).toContainText('2.0 DRAFT 0 · 6 ตุลาคม 2569');
  });

  test('frozen page shows the archive banner and its release date', async ({ page }) => {
    await page.goto('/vcdoc/2.0-draft-0/thai-vc-arf/scope/');

    await expect(page.locator('.theme-doc-version-banner')).toContainText('เก็บถาวรแล้ว');
    await expect(page.locator('.theme-doc-version-banner')).toContainText('6 ตุลาคม 2569');
    await expect(page.locator('.theme-doc-version-badge')).toContainText('เผยแพร่ 6 ตุลาคม 2569');
    await expect(page.locator('h1').first()).toContainText('ขอบข่าย');
  });

  test('current draft page is marked as in progress', async ({ page }) => {
    await page.goto('/vcdoc/thai-vc-arf/scope/');
    await expect(page.locator('.theme-doc-version-badge')).toContainText('กำลังจัดทำ');
    await expect(page.locator('.theme-doc-version-badge')).toContainText('2.0 DRAFT 1');
  });

  test('/versions lists every version with its release date', async ({ page }) => {
    await page.goto('/vcdoc/versions/');

    await expect(page.locator('h1')).toContainText('ประวัติเวอร์ชัน');
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(3);
    // Match on the row header, not on row text: the newer row links to
    // "ส่วนต่างจาก 2.0 DRAFT 0" and would match a plain text filter too.
    const draft0 = page.getByRole('row', { name: /^2\.0 DRAFT 0 / });
    await expect(draft0).toContainText('6 ตุลาคม 2569');
    await expect(draft0).toContainText('ถูกแทนที่');
    await expect(page.getByRole('row', { name: /^2\.0 DRAFT 1 / })).toContainText('กำลังจัดทำ');
  });

  test('delta hub lists the changed chapters with line counts', async ({ page }) => {
    await page.goto('/vcdoc/versions/diff/2.0-draft-0__current/');

    await expect(page.locator('h1')).toContainText('2.0 DRAFT 1');
    const rows = page.locator('table tbody tr');
    // Counts change with every content sync, so assert the shape of a count
    // cell rather than one number.
    await expect(rows.first()).toContainText(/\+\d+/);
    await expect(rows.first()).toContainText(/[−-]\d+/);
    await expect(rows.first().locator('a')).toHaveAttribute('href', /\/versions\/diff\/2\.0-draft-0__current\//);
    await expect(page.getByRole('link', { name: 'เปิดตารางส่วนต่างระดับข้อ' })).toBeVisible();
  });

  test('clause table page renders the clause delta table', async ({ page }) => {
    await page.goto('/vcdoc/versions/diff/2.0-draft-0__current/clauses/');

    const table = page.locator('table');
    await expect(table.locator('caption')).toContainText('ตารางส่วนต่างระดับข้อ');
    await expect(table.locator('thead th')).toHaveCount(5);
    await expect(table.locator('thead th').first()).toContainText('ข้อ');
    await expect(page.getByText(/ข้อที่ไม่มีการเปลี่ยนแปลง/)).toBeVisible();
    await expect(page.locator('details li').first()).toContainText(/\S/);
  });

  test('chapter diff page renders diff markup', async ({ page }) => {
    await page.goto('/vcdoc/versions/diff/2.0-draft-0__current/scope/');

    // The sticky A/B bar is our own markup; the file name is the one we passed
    // to jsdiff, so neither assertion depends on what the diff body contains.
    await expect(page.locator('.d2h-wrapper').first()).toBeAttached();
    await expect(page.locator('.d2h-file-name').first()).toContainText('01-scope.md');
    await expect(page.locator('.d2h-ins').first()).toBeAttached();
    await expect(page.locator('.d2h-del').first()).toBeAttached();
    await expect(page.getByText('A ·')).toBeVisible();
  });
});
