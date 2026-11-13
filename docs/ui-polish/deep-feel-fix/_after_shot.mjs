import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT = '/workspace/ip-harness/docs/ui-polish/deep-feel-fix';
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  const p = path.join(OUT, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log('SHOT', name);
}

async function goto(page, port, route, wait = 900) {
  const url = `http://127.0.0.1:${port}${route}`;
  const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(wait);
  return resp?.status() ?? null;
}

async function measure(page, sel) {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      fs: cs.fontSize,
      fw: cs.fontWeight,
      cls: (el.className || '').toString().slice(0, 160),
      text: (el.textContent || '').trim().slice(0, 80),
    };
  }, sel);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const metrics = {};

// DF-M1 mid dashboard inbox
await goto(page, 5173, '/');
await shot(page, 'AFTER-DF-M1-dashboard-inbox.png');
metrics.m1_action = await measure(page, '.dash-inbox-action');
metrics.m1_row = await measure(page, '.dash-inbox-row');

// DF-M4 mid 洞察
metrics.m4_insight = await measure(page, 'button.nav-section-btn, button.nav-section');
await shot(page, 'AFTER-DF-M4-mid-insight.png');

// DF-S2 — just capture row (active hard to screenshot); home is enough
await shot(page, 'AFTER-DF-S2-inbox-row.png');

// DF-M2 search
await goto(page, 5182, '/');
await shot(page, 'AFTER-DF-M2-search-home.png');
const fold = page.locator('details summary', { hasText: '开发者' });
if (await fold.count()) {
  await fold.first().click();
  await page.waitForTimeout(300);
  await shot(page, 'AFTER-DF-M2-search-devfold.png');
}

// DF-M4 / DF agent chrome
await goto(page, 5175, '/');
await shot(page, 'AFTER-DF-M4-agent-chrome.png');
metrics.m4_persona = await measure(page, 'button[aria-label="切换 Persona"]');
metrics.m4_workspace = await measure(page, 'button[aria-label="切换工作区"]');

// DF-S3 confirm session
await goto(page, 5175, '/agent/sess-oa-1');
await page.waitForTimeout(800);
await shot(page, 'AFTER-DF-S3-confirm.png');

// DF-M3 figure edit seed
await goto(page, 5187, '/edit/fig-seed-exploded');
await page.waitForTimeout(1000);
await shot(page, 'AFTER-DF-M3-figure-edit-seed.png');
metrics.m4_doc = await measure(page, 'a.figure-top-link, a[href*="5178"]');
metrics.m4_step = await measure(page, '.figure-step-chip, ol a');

// DF-S1 ops config
await goto(page, 5176, '/config');
await shot(page, 'AFTER-DF-S1-ops-config.png');
metrics.s1_switch = await measure(page, 'button[role="switch"]');

// DF-S4 inspire sparks
await goto(page, 5185, '/sparks');
await shot(page, 'AFTER-DF-S4-sparks-empty.png');

// DF-S5 doc-harness — open anno if possible
await goto(page, 5178, '/');
await page.waitForTimeout(800);
// try to select text and open annotation — best-effort
await shot(page, 'AFTER-DF-S5-doc-anno.png');

// DF-S6 fto matrix
await goto(page, 5183, '/matrix');
await page.waitForTimeout(800);
await shot(page, 'AFTER-DF-S6-matrix.png');

// DF-C1 loadtest
await goto(page, 5179, '/loadtest');
await shot(page, 'AFTER-DF-C1-loadtest-empty.png');

// DF-C2 prompt
await goto(page, 5185, '/');
await shot(page, 'AFTER-DF-C2-inspire-prompt.png');

// DF-C3 mid KPI
await goto(page, 5173, '/');
await shot(page, 'AFTER-DF-C3-kpi.png');

fs.writeFileSync(path.join(OUT, '_after-metrics.json'), JSON.stringify(metrics, null, 2));
console.log('METRICS', JSON.stringify(metrics, null, 2));
await browser.close();
