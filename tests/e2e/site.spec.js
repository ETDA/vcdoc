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
