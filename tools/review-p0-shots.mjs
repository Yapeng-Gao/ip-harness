import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const suffix = process.argv[2] || 'before';
const outs = [
  '/workspace/ip-harness/docs/ui-polish/review-p0',
  '/workspace/ip-harness/.ui-evidence/review-p0',
];
for (const d of outs) fs.mkdirSync(d, { recursive: true });

function dest(name) {
  return outs.map((d) => path.join(d, `${name}-${suffix}.png`));
}

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

async function save(name, buffer) {
  for (const f of dest(name)) {
    if (suffix === 'before' && fs.existsSync(f)) {
      console.log('  skip existing', f);
      continue;
    }
    fs.writeFileSync(f, buffer);
    console.log('  saved', f);
  }
}

async function shotPage(name, url, waitMs = 1400) {
  console.log('→', name, url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(waitMs);
  const buf = await page.screenshot({ type: 'png', fullPage: false });
  await save(name, buf);
}

async function shotLocator(name, selector, opts = {}) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ timeout: 10000 });
  if (opts.scroll) await loc.scrollIntoViewIfNeeded();
  const buf = await loc.screenshot({ type: 'png' });
  await save(name, buf);
}

// mid dashboard
await shotPage('mid-dashboard', 'http://127.0.0.1:5173/');
await shotLocator('mid-priority-bar', '.dash-next');
await shotLocator('mid-inbox-secondary', '#ops-inbox, .dash-inbox');

// agent confirm — OA (disabled 授权递交 / full-check)
await shotPage('agent-session-oa', 'http://127.0.0.1:5175/agent/sessions/sess-oa-1?focus=hitl');
await shotLocator('agent-confirm-oa', '#session-confirm-bar, [data-confirm-bar]', { scroll: true });

// agent confirm — intake
await shotPage('agent-session-intake', 'http://127.0.0.1:5175/agent/sessions/sess-intake-1?focus=hitl');
await shotLocator('agent-confirm-intake', '#session-confirm-bar, [data-confirm-bar]', { scroll: true });

await browser.close();
console.log('done', suffix);
