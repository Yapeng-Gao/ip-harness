import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const out = process.argv[2] || 'docs/ui-polish/deep-w4';
const suffix = process.argv[3] || 'after';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();

async function shot(name, url, waitMs = 1500, after) {
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

const base = 'http://127.0.0.1:5174';

await shot('research-step1', `${base}/workbench/research/c2`, 1600, async (p) => {
  const hit = p.locator('text=检索结果').first();
  if (await hit.count()) await hit.scrollIntoViewIfNeeded();
});
await shot('intake-step1', `${base}/workbench/intake/c5`, 1400);
await shot('draft-step1', `${base}/workbench/draft/c4`, 1400);
await shot('prosecution-step1', `${base}/workbench/prosecution/c1`, 1400);
await shot('maintain-step1', `${base}/workbench/maintain/c6`, 1400);
await shot('monetize-step1', `${base}/workbench/monetize/c3`, 1400);
await shot('watch-step1', `${base}/workbench/watch/c9`, 1400);
await shot('layout-step1', `${base}/workbench/layout`, 1400);
await shot('inventor-step1', `${base}/inventor`, 1400);

await browser.close();
console.log('done');
