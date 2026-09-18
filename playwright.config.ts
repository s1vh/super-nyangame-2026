import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:5173/super-nyangame-2026/', viewport: { width: 1280, height: 800 }, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
    { name: 'edge', use: { browserName: 'chromium', channel: 'msedge' } },
  ],
  webServer: [
    { command: 'npm run dev -- --strictPort', url: 'http://127.0.0.1:5173/super-nyangame-2026/', reuseExistingServer: !process.env.CI },
    { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://127.0.0.1:4173/super-nyangame-2026/', reuseExistingServer: !process.env.CI },
  ],
});
