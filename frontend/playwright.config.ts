import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env['PORT'] ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  workers: 2,
  timeout: 30_000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
        channel: process.env['PLAYWRIGHT_CHANNEL'],
      },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: baseURL,
    timeout: 30_000,
    reuseExistingServer: false,
    env: { PORT: String(port) },
  },
});
