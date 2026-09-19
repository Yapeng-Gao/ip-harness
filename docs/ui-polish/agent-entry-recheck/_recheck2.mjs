import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = 'http://127.0.0.1:5175';
const OUT = '/workspace/ip-harness/docs/ui-polish/agent-entry-recheck';
const prev = JSON.parse(fs.readFileSync(path.join(OUT, '_probe.json'), 'utf8'));

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // P0-AE-2: force navigate via chip href
  await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('[data-testid="home-needs-human-chip"]').click({ force: true });
  await page.waitForTimeout(800);
  const filterUrl = page.url();
  await page.screenshot({ path: path.join(OUT, 'AFTER-02-sessions-filter.png'), fullPage: false });
  const sessionsProbe = await page.evaluate(() => ({
    url: location.href,
    hasFilter: location.search.includes('filter=needs_human'),
    bodyHas待确认: /待确认/.test(document.body.innerText),
  }));
  prev['P0-AE-2'].filterUrl = filterUrl;
  prev['P0-AE-2'].sessionsProbe = sessionsProbe;
  prev['P0-AE-2'].chipClickError = undefined;

  // Home sidebar compact check — no full session list rows to sess-*
  await page.goto(`${BASE}/agent`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const homeSide = await page.evaluate(() => {
    const side = document.querySelector('[data-testid="agent-side-nav"]')?.closest('aside') 
      || document.querySelector('aside');
    const html = side?.innerText || '';
    const sessLinks = [...document.querySelectorAll('a[href*="/agent/sessions/sess-"]')].filter((a) => {
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top < 900;
    });
    return {
      sideText: html.slice(0, 800),
      visibleSessLinks: sessLinks.map((a) => ({ href: a.getAttribute('href'), text: a.innerText.slice(0, 40), top: Math.round(a.getBoundingClientRect().top) })),
      hasChip: !!document.querySelector('[data-testid="home-needs-human-chip"]'),
      chipText: document.querySelector('[data-testid="home-needs-human-chip"]')?.innerText,
    };
  });
  prev['P0-AE-2'].homeSide = homeSide;

  // More menu contents
  await page.locator('button:has-text("更多")').first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(400);
  const moreText = await page.evaluate(() => document.body.innerText);
  prev['P0-AE-1'].moreContains = {
    新建会话: /新建会话/.test(moreText),
    项目: /项目/.test(moreText),
  };
  await page.screenshot({ path: path.join(OUT, 'AFTER-01c-home-more.png'), fullPage: false });

  // P1-AE-3 patent project
  await page.goto(`${BASE}/agent/projects/proj-demo-patent`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const patent = await page.evaluate(() => {
    const t = document.body.innerText;
    // find case-bind region text
    const bindEls = [...document.querySelectorAll('*')].filter((el) => {
      const s = (el.innerText || '').trim();
      return (s.includes('创建并绑定') || s.includes('写回中台') || s.includes('案件（可选）') || s.includes('须绑定')) && s.length < 400;
    }).slice(0, 8).map((el) => (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200));
    return {
      url: location.href,
      hasMustBind: /写回中台前须绑定/.test(t),
      hasOptionalSoft: /案件（可选）/.test(t) || /关联案件（可选）/.test(t),
      hasCreateBind: /创建并绑定/.test(t),
      hasBindExisting: /绑定已有/.test(t),
      hasPatentSteps: /收目标|拆派|等回执|汇总/.test(t),
      bindSnippets: bindEls,
      snippet: t.slice(0, 1800),
    };
  });
  await page.screenshot({ path: path.join(OUT, 'AFTER-05-patent-bind.png'), fullPage: false });
  prev['P1-AE-3'] = { ...prev['P1-AE-3'], ...patent, shot: 'AFTER-05-patent-bind.png' };

  // general for contrast
  await page.goto(`${BASE}/agent/projects/proj-demo-general`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const general = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      url: location.href,
      hasMustBind: /写回中台前须绑定/.test(t),
      hasOptionalSoft: /案件（可选）|关联案件（可选）/.test(t),
      hasCreateBind: /创建并绑定/.test(t),
    };
  });
  await page.screenshot({ path: path.join(OUT, 'AFTER-04-general-bind.png'), fullPage: false });
  prev['P1-AE-3'].generalSoft = general;

  // P1-AE-2: case bind should be top strip when needs_human — check y of case bind vs dock
  await page.goto(`${BASE}/agent/sessions/sess-oa-1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const layout = await page.evaluate(() => {
    const dock = document.querySelector('.agent-hitl-dock');
    const confirm = document.querySelector('.confirm-hitl');
    const reason = document.querySelector('.agent-confirm-reason');
    const caseBind = [...document.querySelectorAll('[class*="case"], [data-testid*="case"], [class*="CaseBind"]')].find((el) => /绑定|案件/.test(el.innerText || ''));
    // also text-based
    const bindBtn = [...document.querySelectorAll('button, a')].find((el) => /创建并绑定|绑定已有/.test(el.innerText || ''));
    const rect = (el) => el ? (() => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { y: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), pos: s.position, cls: (el.className||'').toString().slice(0,80) }; })() : null;
    return {
      dock: rect(dock),
      confirm: rect(confirm),
      reason: reason ? reason.innerText : null,
      caseBind: rect(caseBind),
      bindBtn: bindBtn ? { ...rect(bindBtn), text: bindBtn.innerText.slice(0,40) } : null,
      primaryCtAs: [...document.querySelectorAll('.agent-confirm-cta, .confirm-hitl-actions button')].map((b) => ({
        text: b.innerText.slice(0, 30),
        disabled: b.disabled,
        cls: (b.className||'').toString().slice(0, 60),
      })),
    };
  });
  prev['P1-AE-2'].layout = layout;

  fs.writeFileSync(path.join(OUT, '_probe.json'), JSON.stringify(prev, null, 2));
  console.log(JSON.stringify({
    P0_AE_2: prev['P0-AE-2'],
    P1_AE_3: prev['P1-AE-3'],
    P1_AE_2_layout: layout,
    P0_AE_1_more: prev['P0-AE-1'].moreContains,
  }, null, 2));
  await browser.close();
})();
