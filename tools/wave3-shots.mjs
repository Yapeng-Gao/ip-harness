import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'docs/ui-polish/wave3';
const suffix = process.argv[3] || 'before';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();

async function shot(name, url, waitMs = 1200, after) {
  console.log('→', name, url);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(waitMs);
    if (after) await after(page);
    const file = path.join(out, `${name}-${suffix}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('  saved', file);
  } catch (e) {
    console.error('  FAIL', name, e.message);
  }
}

await shot('mid-dashboard', 'http://127.0.0.1:5173/');
await shot('mid-case-library', 'http://127.0.0.1:5173/cases');
await shot('mid-case-detail', 'http://127.0.0.1:5173/cases/c1');
await shot('agent-session', 'http://127.0.0.1:5175/agent/sessions', 1500, async (p) => {
  const link = p.locator('a[href*="/agent/sessions/"]').first();
  if (await link.count()) {
    await link.click();
    await p.waitForTimeout(1500);
    const url = p.url();
    if (!url.includes('focus=hitl')) {
      const u = new URL(url);
      u.searchParams.set('focus', 'hitl');
      await p.goto(u.toString(), { waitUntil: 'networkidle', timeout: 45000 });
      await p.waitForTimeout(1200);
    }
    const bar = p.locator('[data-confirm-bar], #session-confirm-bar');
    if (await bar.count()) await bar.first().scrollIntoViewIfNeeded();
  }
});
await shot('ops-home', 'http://127.0.0.1:5176/');
await shot('iam-home', 'http://127.0.0.1:5177/');
await shot('iam-login', 'http://127.0.0.1:5177/login');
await shot('workbench-home', 'http://127.0.0.1:5174/workbench');

await browser.close();
console.log('done');
