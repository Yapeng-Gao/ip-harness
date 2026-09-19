import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const out = 'docs/ui-polish/agent-loop-evidence';
const base = 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleMsgs = [];
page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text() }));
page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e.message || e) }));

const WL = [/Download the React DevTools/i, /\[vite\]/i, /hot module|HMR/i, /React Router Future Flag/i, /DevTools/i, /favicon/i, /\[api-mock\]/i, /mock/i, /Warning:.*React/i, /deprecated/i, /prototype/i];
const isWl = (t) => WL.some((re) => re.test(t));

await page.goto(`${base}/agent/sessions/sess-oa-1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const deep = await page.evaluate(() => {
  const dock = document.querySelector('.agent-hitl-dock');
  const confirm = document.querySelector('.agent-confirm-panel, [data-testid="agent-confirm"], .agent-confirm');
  const rail = document.querySelector('.agent-aside, aside.agent-aside, [data-testid="agent-aside"]');
  const timeline = document.querySelector('[data-testid="session-timeline-scroller"], .session-timeline-scroller');
  const composerFold = document.querySelector('[data-testid="session-composer-fold"]');

  function countTransitionAll(root) {
    if (!root) return { count: 0, samples: [] };
    let count = 0;
    const samples = [];
    for (const el of [root, ...root.querySelectorAll('*')]) {
      const tp = getComputedStyle(el).transitionProperty;
      if (tp === 'all') {
        count++;
        if (samples.length < 10) {
          samples.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 70), testid: el.getAttribute('data-testid') || '' });
        }
      }
    }
    return { count, samples };
  }

  // scoped like AFE-S-1
  const scopes = {
    dock: countTransitionAll(dock),
    confirm: countTransitionAll(confirm),
    rail: countTransitionAll(rail),
  };
  const scopedTotal = scopes.dock.count + scopes.confirm.count + scopes.rail.count;

  // full session / main
  const sessionRoot = document.querySelector('.agent-session, main, [data-page]') || document.body;
  const fullSession = countTransitionAll(sessionRoot);

  // primary confirm labels/fonts/hit
  const statusLabels = ['待批准', '待授权', '逐步'];
  const statusFonts = statusLabels.map((lab) => {
    const el = [...document.querySelectorAll('span, label, button')].find((e) => (e.innerText || '').trim() === lab || (e.innerText || '').includes(lab));
    if (!el) return { lab, missing: true };
    return { lab, fs: parseFloat(getComputedStyle(el).fontSize), h: Math.round(el.getBoundingClientRect().height), text: (el.innerText || '').trim().slice(0, 24) };
  });
  const more = [...document.querySelectorAll('button')].find((b) => /还有\s*\d+\s*条/.test(b.innerText || ''));
  const cta = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes('批准策略'));
  const fold = composerFold || [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes('输入') && (b.innerText || '').includes('Agent'));

  // primary chrome hit ≥40: Confirm CTA, fold, more, side bots if any
  const primaryChrome = [];
  for (const [name, el] of [
    ['批准策略', cta],
    ['还有N条', more],
    ['composer-fold', fold],
  ]) {
    if (!el) { primaryChrome.push({ name, missing: true }); continue; }
    const r = el.getBoundingClientRect();
    primaryChrome.push({ name, h: Math.round(r.height), w: Math.round(r.width), text: (el.innerText || '').trim().slice(0, 40) });
  }

  // list hit <40 but classify: sidebar-nav / inbox-micro / segmented / timeline-chip / other
  function classify(el, text) {
    const cls = (el.className || '').toString();
    const tid = el.getAttribute('data-testid') || '';
    if (tid === 'agent-side-more' || /flex-1 flex-col items-cen/.test(cls) || el.closest('nav, .agent-shell-nav, [class*="side-nav"]')) return 'sidebar-nav';
    if (/^Inbox$/i.test(text) || /text-\[9px\]/.test(cls)) return 'inbox-micro';
    if (/segmented-item/.test(cls)) return 'segmented';
    if (tid === 'sidebar-new-session' || text === '新建会话') return 'sidebar-new';
    if (/筛选/.test(text)) return 'filter-micro';
    if (/调用/.test(text)) return 'timeline-invoke';
    if (el.closest('.agent-hitl-dock, .agent-confirm')) return 'hitl-dock';
    if (el.closest('.agent-aside')) return 'aside';
    return 'other';
  }

  const hitByClass = {};
  const hitList = [];
  const interactSel = 'button, a[href], [role="button"], summary';
  const vh = innerHeight, vw = innerWidth;
  for (const el of document.querySelectorAll(interactSel)) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > vh) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const h = Math.round(r.height);
    if (h >= 40) continue;
    const isChrome = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || el.closest('.agent-hitl-dock, header, nav, .agent-aside, .browse-sidebar');
    if (!isChrome && el.tagName === 'A' && !el.closest('nav, header')) continue;
    const text = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const cat = classify(el, text);
    hitByClass[cat] = (hitByClass[cat] || 0) + 1;
    if (hitList.length < 50) hitList.push({ text, h, w: Math.round(r.width), cat, testid: el.getAttribute('data-testid') || '' });
  }

  // fonts <12 on Confirm primary status (already) + primary UI labels excluding decorative inbox 9px micro
  const primaryFontOff = [];
  for (const el of document.querySelectorAll('.agent-confirm-panel button, .agent-confirm-panel label, .agent-confirm-panel span, .agent-hitl-dock button, .agent-hitl-dock label')) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs >= 12) continue;
    const text = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!text) continue;
    primaryFontOff.push({ text, fs, h: Math.round(r.height), cls: (el.className || '').toString().slice(0, 50) });
  }

  const bodyScroll = document.documentElement.scrollHeight > document.documentElement.clientHeight + 1 || document.body.scrollHeight > document.body.clientHeight + 1;
  const nested = [];
  for (const el of document.querySelectorAll('*')) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) nested.push({ testid: el.getAttribute('data-testid') || '', cls: (el.className || '').toString().slice(0, 60), h: Math.round(r.height) });
    }
  }

  const dockR = dock?.getBoundingClientRect();
  const tlR = timeline?.getBoundingClientRect();

  return {
    dockH: dockR ? Math.round(dockR.height) : null,
    dockTop: dockR ? Math.round(dockR.top) : null,
    timelineH: tlR ? Math.round(tlR.height) : null,
    bodyScroll,
    nestedScrollers: nested,
    transitionScoped: { ...scopes, total: scopedTotal },
    transitionFullSession: { count: fullSession.count, samples: fullSession.samples },
    statusFonts,
    primaryChrome,
    primaryFontOff,
    hitByClass,
    hitList,
    composerFoldInDock: !!(composerFold && dock && dock.contains(composerFold)),
    reasonCount: document.querySelectorAll('.agent-confirm-reason').length,
  };
});

// projects tool chips
async function proj(path) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const labels = ['分派任务', '汇总时间线', '打开专家私信'];
    const chips = labels.map((lab) => {
      const el = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes(lab));
      if (!el) return { lab, missing: true };
      const r = el.getBoundingClientRect();
      return { lab, h: Math.round(r.height), fs: parseFloat(getComputedStyle(el).fontSize), title: el.getAttribute('title') || '' };
    });
    const composer = document.querySelector('.project-chat-composer, [class*="composer"]') || document.querySelector('textarea')?.closest('div');
    const cr = composer?.getBoundingClientRect();
    // transition all in tool/composer area
    let tAll = 0;
    for (const el of document.querySelectorAll('.project-tool-chip, [class*="tool"], .project-chat-composer, button')) {
      if (getComputedStyle(el).transitionProperty === 'all') tAll++;
    }
    return { chips, composerTop: cr ? Math.round(cr.top) : null, vh: innerHeight, bodyScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1 };
  });
}

const general = await proj('/agent/projects/proj-demo-general');
const patent = await proj('/agent/projects/proj-demo-patent');

// catalog / harness glance hit micro
async function glance(path) {
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  return page.evaluate(() => {
    const compact = !!document.querySelector('.browse-sidebar-compact, [data-testid="browse-sidebar-compact"]');
    const bodyScroll = document.documentElement.scrollHeight > document.documentElement.clientHeight + 1;
    let hitlt40 = 0;
    for (const el of document.querySelectorAll('button, [role="button"]')) {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.height < 40 && r.top >= 0 && r.top < innerHeight) hitlt40++;
    }
    return { compact, bodyScroll, hitlt40, title: document.title };
  });
}
const catalog = await glance('/agent/agents');
const harness = await glance('/agent/harness');

// home
await page.goto(`${base}/agent`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const home = await page.evaluate(() => {
  const ctas = [...document.querySelectorAll('button, a')].filter((el) => (el.innerText || '').includes('开始办理'));
  const visible = ctas.filter((el) => el.getBoundingClientRect().height > 0);
  return {
    startCtaCount: visible.length,
    startCtaH: visible[0] ? Math.round(visible[0].getBoundingClientRect().height) : null,
    bodyScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
  };
});

const uniqErr = new Map();
for (const m of consoleMsgs) {
  if (m.type !== 'error' && m.type !== 'pageerror') continue;
  const k = m.text.slice(0, 180);
  if (!uniqErr.has(k)) uniqErr.set(k, { ...m, count: 1 });
  else uniqErr.get(k).count++;
}
const errors = [...uniqErr.values()];
const nonWl = errors.filter((e) => !isWl(e.text));

const refine = {
  session: deep,
  general,
  patent,
  catalog,
  harness,
  home,
  console: { errorUnique: errors.length, nonWhitelist: nonWl, nonWhitelistCount: nonWl.length, whitelistSample: errors.filter((e) => isWl(e.text)).slice(0, 10) },
  baselines: {
    feelGo_dockH: 157,
    feelGo_timelineH: 539,
    full_dockMax: 200,
    full_timelineMin1440: 480,
    feel_transitionScoped: 0,
  },
  deltas: {
    dockH_vs_feel: deep.dockH - 157,
    timelineH_vs_feel: deep.timelineH - 539,
    dockWithinFull: deep.dockH != null && deep.dockH <= 200,
    timelineWithinFull: deep.timelineH != null && deep.timelineH >= 480,
    transitionScopedStill0: deep.transitionScoped.total === 0,
  },
};

fs.writeFileSync(path.join(out, '_aloop-refine.json'), JSON.stringify(refine, null, 2));
console.log(JSON.stringify({
  dockH: deep.dockH,
  timelineH: deep.timelineH,
  deltas: refine.deltas,
  transitionScoped: deep.transitionScoped.total,
  transitionFull: deep.transitionFullSession.count,
  statusFonts: deep.statusFonts,
  primaryChrome: deep.primaryChrome,
  primaryFontOff: deep.primaryFontOff,
  hitByClass: deep.hitByClass,
  bodyScroll: deep.bodyScroll,
  nested: deep.nestedScrollers,
  patentChips: patent.chips,
  patentComposerTop: patent.composerTop,
  home,
  catalog,
  harness,
  consoleNonWl: nonWl.length,
}, null, 2));

await browser.close();
