import fs from 'fs';
import { defineConfig, devices } from '@playwright/test';

const chromePath = process.env.PLAYWRIGHT_CHROME_EXECUTABLE ?? process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const configureChrome = fs.existsSync(chromePath);

const chromiumUse = {
  ...devices['Desktop Chrome'],
  ...(configureChrome ? { channel: 'chrome' } : {}),
};

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: chromiumUse },
  ],
});
