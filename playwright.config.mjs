import { defineConfig } from '@playwright/test';

// Browser-based validation of the built site (run `npm run build` first).
// Mermaid diagrams and locale rendering happen client-side (JS hydration),
// so they are verified here in a real browser rather than in the static HTML.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 15_000 },
  workers: 1,
  use: {
    // Origin only. Tests use full /vcdoc/... paths (the site's baseUrl) so URL
    // resolution is unambiguous (a leading "/" resolves against the origin,
    // NOT against a pathful baseURL).
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  reporter: [['list']],
  webServer: {
    // Requires a prior `npm run build` (serves the build/ directory).
    command: 'npm run serve -- --port 4173',
    url: 'http://localhost:4173/vcdoc/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
