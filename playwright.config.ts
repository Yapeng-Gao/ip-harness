import { defineConfig, devices } from '@playwright/test'

const chrome = { ...devices['Desktop Chrome'] }

/**
 * Multi-shell projects. baseURL is always http://localhost:<port>
 * (never 127.0.0.1 — cross-port cookies / APP_DEV_URLS).
 * No webServer: confirm 5173–5177 / 5180 by hand before running.
 * api-mock health lives in L0 via request + absolute URL (no api project).
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    headless: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mid',
      use: { ...chrome, baseURL: 'http://localhost:5173' },
      testMatch: /l0-smoke\.spec\.ts/,
      grep: /L0-MID/,
    },
    {
      name: 'workbench',
      use: { ...chrome, baseURL: 'http://localhost:5174' },
      testMatch: /l0-smoke\.spec\.ts/,
      grep: /L0-WB/,
    },
    {
      name: 'agent',
      use: { ...chrome, baseURL: 'http://localhost:5175' },
      testMatch: /l0-smoke\.spec\.ts/,
      grep: /L0-AG/,
    },
    {
      name: 'ops',
      use: { ...chrome, baseURL: 'http://localhost:5176' },
      testMatch: /l0-smoke\.spec\.ts/,
      grep: /L0-OPS/,
    },
    {
      name: 'iam',
      use: { ...chrome, baseURL: 'http://localhost:5177' },
      testMatch: /l0-smoke\.spec\.ts/,
      grep: /L0-IAM/,
    },
    {
      name: 'chromium',
      use: { ...chrome, baseURL: 'http://localhost:5173' },
      testMatch: /(?:l0-smoke|critical-paths|api-mock-smoke)\.spec\.ts/,
      grep: /L0-API|L1-/,
    },
  ],
})
