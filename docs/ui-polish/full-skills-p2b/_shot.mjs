import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/workspace/ip-harness/docs/ui-polish/full-skills-p2b';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

async function shot(url, file, prep) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);
  if (prep) await prep(page);
  const dest = path.join(OUT, file);
  await page.screenshot({ path: dest, fullPage: false });
  console.log('ok', file);
}

// FS-P2-7 empties
await shot('http://127.0.0.1:5179/gpus', 'AFTER-FS-P2-7-ai-infra-gpus.png');
await shot('http://127.0.0.1:5181/exports', 'AFTER-FS-P2-7-ai-data-exports.png');
await shot('http://127.0.0.1:5176/infra', 'AFTER-FS-P2-7-ops-infra.png');

// FS-P2-8 search sidebar (need lg viewport - already 1440)
await shot('http://127.0.0.1:5182/', 'AFTER-FS-P2-8-search-sidebar.png');

// FS-P2-9 agent main focus-visible
await shot('http://127.0.0.1:5175/agent', 'AFTER-FS-P2-9-agent-main-focus.png', async (p) => {
  await p.locator('#agent-main').focus();
  await p.waitForTimeout(200);
});

await browser.close();
console.log('all done');
