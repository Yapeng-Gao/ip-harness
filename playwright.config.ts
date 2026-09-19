import { defineConfig, devices } from '@playwright/test'

const chrome = { ...devices['Desktop Chrome'] }

/**
 * Multi-shell projects. baseURL is always http://localhost:<port>
 * (never 127.0.0.1 — cross-port cookies / APP_DEV_URLS).
 * No webServer: confirm 5173–5177 / 5180 / 5182–5187 by hand before running.
 * api-mock health lives in L0 via request + absolute URL (no api project).
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: false,
  // Multi-shell Vite + Chromium: keep 1 worker to avoid page crashed under low free RAM.
  workers: 1,
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
      name: 'agent-stepwise',
      use: { ...chrome, baseURL: 'http://localhost:5175' },
      testMatch: /agent-stepwise-s0-s2\.spec\.ts|agent-stepwise-s3-s5\.spec\.ts|agent-stepwise-s6-s9\.spec\.ts/,
      timeout: 90_000,
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
      name: 'search',
      use: { ...chrome, baseURL: 'http://localhost:5182' },
      testMatch: /l0-parallel-smoke\.spec\.ts/,
      grep: /L0-SEARCH/,
    },
    {
      name: 'fto',
      use: { ...chrome, baseURL: 'http://localhost:5183' },
      testMatch: /l0-parallel-smoke\.spec\.ts/,
      grep: /L0-FTO/,
    },
    {
      name: 'mining',
      use: { ...chrome, baseURL: 'http://localhost:5184' },
      testMatch: /l0-parallel-smoke\.spec\.ts/,
      grep: /L0-MINING/,
    },
    {
      name: 'inspire',
      use: { ...chrome, baseURL: 'http://localhost:5185' },
      testMatch: /l0-parallel-smoke\.spec\.ts/,
      grep: /L0-INSPIRE/,
    },
    {
      name: 'landscape',
      use: { ...chrome, baseURL: 'http://localhost:5186' },
      testMatch: /l0-parallel-smoke\.spec\.ts/,
      grep: /L0-LANDSCAPE/,
    },
    {
      name: 'figure',
      use: { ...chrome, baseURL: 'http://localhost:5187' },
      testMatch: /l0-parallel-smoke\.spec\.ts/,
      grep: /L0-FIGURE/,
    },
    {
      name: 'chromium',
      use: { ...chrome, baseURL: 'http://localhost:5173' },
      testMatch: /(?:l0-smoke|critical-paths|api-mock-smoke)\.spec\.ts/,
      grep: /L0-API|L1-/,
    },
  ],
})
