import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const out = 'docs/ui-polish/agent-feel-fix';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = 'http://127.0.0.1:5175';

const results = { checks: {} };

async function shot(name) {
  await page.screenshot({ path: path.join(out, name), fullPage: false });
}

await page.goto(`${base}/agent/projects/proj-demo-patent`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('01-patent-tools-after.png');

const tools = await page.evaluate(() => {
  const labels = ['分派任务', '汇总时间线', '打开专家私信'];
  const found = labels.map((lab) => {
    const el = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes(lab));
    if (!el) return { lab, missing: true };
    const r = el.getBoundingClientRect();
    return {
      lab,
      tag: el.tagName,
      text: el.innerText.trim().slice(0, 48),
      h: Math.round(r.height),
      top: Math.round(r.top),
      title: el.getAttribute('title'),
      aria: el.getAttribute('aria-label'),
    };
  });
  const composer =
    document.querySelector('.project-chat-composer') ||
    document.querySelector('textarea[aria-label="消息"]')?.closest('.sticky, .border-t');
  const cr = composer?.getBoundingClientRect();
  const eng = [...document.body.querySelectorAll('*')].filter((el) =>
    /^(dispatch_task|summarize_timeline|open_expert_dm)$/.test((el.textContent || '').trim()),
  );
  return {
    found,
    composerTop: cr ? Math.round(cr.top) : null,
    composerH: cr ? Math.round(cr.height) : null,
    vh: window.innerHeight,
    englishPrimaryVisible: eng.slice(0, 5).map((e) => e.textContent.trim()),
  };
});
results.checks['AFE-M-1'] = tools;
results.checks['AFE-M-2'] = {
  composerTop: tools.composerTop,
  vh: tools.vh,
  pass: tools.composerTop != null && tools.composerTop <= 780,
};
await shot('02-patent-density-after.png');

await page.goto(`${base}/agent/projects/proj-demo-general`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await shot('03-general-tools-after.png');
const gen = await page.evaluate(() => {
  const labels = ['分派任务', '汇总时间线', '打开专家私信'];
  return labels.map((lab) => {
    const el = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes(lab));
    if (!el) return { lab, missing: true };
    const r = el.getBoundingClientRect();
    return { lab, h: Math.round(r.height), title: el.getAttribute('title') };
  });
});
results.checks['AFE-M-1-general'] = gen;

await page.goto(`${base}/agent/sessions/sess-oa-1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('04-session-confirm-after.png');

const confirm = await page.evaluate(() => {
  const bar =
    document.querySelector('#session-confirm-bar') ||
    document.querySelector('[data-confirm-bar]') ||
    document.querySelector('.confirm-hitl');
  const chipTexts = ['待批准', '待授权', '逐步'];
  const chips = chipTexts.map((t) => {
    const el = [...(bar?.querySelectorAll('*') || [])].find((e) => (e.textContent || '').trim() === t);
    if (!el) return { t, missing: true };
    return { t, fs: parseFloat(getComputedStyle(el).fontSize), h: Math.round(el.getBoundingClientRect().height) };
  });
  const more = bar?.querySelector('.agent-confirm-more');
  const mr = more?.getBoundingClientRect();
  const cta =
    bar?.querySelector('.agent-confirm-cta') ||
    bar?.querySelector('button.ui-btn-success') ||
    bar?.querySelector('button.ui-btn');
  const cr = cta?.getBoundingClientRect();
  const fold =
    document.querySelector('.agent-hitl-composer-fold > summary') ||
    document.querySelector('[data-testid="session-composer-fold"] > summary');
  const fr = fold?.getBoundingClientRect();
  const dual = [...document.querySelectorAll('a,button')]
    .filter((el) => /作业中台|知产 Agent|办理台/.test(el.textContent || ''))
    .map((el) => ({
      t: (el.textContent || '').trim().slice(0, 24),
      top: Math.round(el.getBoundingClientRect().top),
      left: Math.round(el.getBoundingClientRect().left),
      tag: el.tagName,
      cls: (el.className || '').toString().slice(0, 48),
    }));
  let allCount = 0;
  const samples = [];
  document
    .querySelectorAll('.agent-hitl-dock, .agent-hitl-dock *, .confirm-hitl, .confirm-hitl *, .agent-rail-row, .agent-rail-row *')
    .forEach((el) => {
      const tp = getComputedStyle(el).transitionProperty;
      if (tp === 'all') {
        allCount++;
        if (samples.length < 6)
          samples.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 40), tp });
      }
    });
  return {
    chips,
    more: more ? { h: Math.round(mr.height), t: more.textContent.trim() } : null,
    cta: cta ? { h: Math.round(cr.height), t: cta.textContent.trim().slice(0, 24) } : null,
    fold: fold ? { h: Math.round(fr.height), t: fold.textContent.trim().slice(0, 48) } : null,
    dual,
    transitionAll: allCount,
    transitionSamples: samples,
  };
});
results.checks['AFE-M-3'] = confirm;
results.checks['AFE-S-3'] = { dualCount: confirm.dual.length, dual: confirm.dual };
results.checks['AFE-S-1'] = { transitionAll: confirm.transitionAll, samples: confirm.transitionSamples };

try {
  const bar = page.locator('#session-confirm-bar, .confirm-hitl, [data-confirm-bar]').first();
  await bar.screenshot({ path: path.join(out, '05-confirm-closeup-after.png') });
} catch {}

await page.goto(`${base}/agent/agents`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await shot('06-catalog-after.png');
const catalog = await page.evaluate(() => {
  const notes = [
    ...document.querySelectorAll(
      '.agent-picker-card__tier-note, .agent-picker-card__tier-note, [class*="tier-note"]',
    ),
  ];
  return notes.slice(0, 6).map((n) => {
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return {
      h: Math.round(r.height),
      clamp: cs.webkitLineClamp,
      textLen: (n.textContent || '').length,
      t: (n.textContent || '').slice(0, 80),
      cls: (n.className || '').toString().slice(0, 60),
    };
  });
});
results.checks['AFE-S-2'] = catalog;

await page.goto(`${base}/agent/projects/proj-demo-patent`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const tl = await page.evaluate(() => {
  const next = document.querySelector('[data-testid="project-timeline-next"]');
  const cta = document.querySelector('[data-testid="project-timeline-cta-orch"]');
  return {
    hasNext: !!next,
    hasCta: !!cta,
    text: (next?.textContent || cta?.textContent || '').slice(0, 100),
  };
});
results.checks['AFE-S-4'] = tl;
await shot('07-timeline-cta-after.png');

// chrome hits sample
const chrome = await page.evaluate(() => {
  const bots = [...document.querySelectorAll('.project-bot-link, a[data-testid^="project-bot-"]')].slice(0, 3);
  const binds = [...document.querySelectorAll('[data-testid="case-bind-controls"] button')].slice(0, 3);
  const meas = (els) =>
    els.map((el) => ({
      t: el.textContent.trim().slice(0, 24),
      h: Math.round(el.getBoundingClientRect().height),
    }));
  return { bots: meas(bots), binds: meas(binds) };
});
results.checks['AFE-S-5'] = chrome;

fs.writeFileSync(path.join(out, '_afe-after.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
