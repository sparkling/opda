import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4321';
const externalServer = Boolean(process.env.BASE_URL);

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /\.spec\.mjs$/u,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    // Permit only small rasterisation differences between native Chromium
    // hosts; geometry and palette drift still fail the reviewed baseline.
    // Tolerate anti-aliasing and small layout jitter; a real change still shows as a
    // block of differing pixels, and any change in page size fails outright.
    toHaveScreenshot: { threshold: 0.3, maxDiffPixelRatio: 0.02 },
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  outputDir: 'test-results',
  snapshotDir: 'tests/e2e/__screenshots__',
  // One baseline set, rendered on Linux (the CI runner). Font rasterisation differs
  // on Darwin, so visual.spec.mjs skips itself elsewhere rather than failing on noise.
  snapshotPathTemplate: '{snapshotDir}/{testFileName}-snapshots/{arg}{ext}',
  use: {
    baseURL,
    browserName: 'chromium',
    colorScheme: 'light',
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: externalServer ? undefined : {
    command: 'pnpm exec astro preview --host 127.0.0.1 --port 4321',
    url: baseURL,
    // A release gate must exercise the just-built dist/, never a stale local
    // preview that happened to be listening on the same port.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
