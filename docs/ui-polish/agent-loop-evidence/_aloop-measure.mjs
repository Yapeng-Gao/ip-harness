import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const out = 'docs/ui-polish/agent-loop-evidence';
fs.mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleMsgs = [];
page.on('console', (msg) => {
  consoleMsgs.push({ type: msg.type(), text: msg.text(), loc: msg.location()?.url || '' });
});
page.on('pageerror', (err) => {
  consoleMsgs.push({ type: 'pageerror', text: String(err.message || err), loc: '' });
});

const WHITELIST = [
  /Download the React DevTools/i,
  /\[vite\]/i,
  /hot module|HMR/i,
  /React Router Future Flag/i,
  /deprecated/i,
  /mock/i,
  /favicon\.ico/i,
  /Failed to load resource:.*favicon/i,
  /net::ERR_.*favicon/i,
  /Warning:.*React/i,
  /\[api-mock\]/i,
  /prototype/i,
  /DevTools/i,
];

function isWhitelist(t) {
  return WHITELIST.some((re) => re.test(t));
}

async function shot(name) {
  await page.screenshot({ path: path.join(out, name), fullPage: false });
}

function measureChrome() {
  return page.evaluate(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const bodyScroll =
      document.documentElement.scrollHeight > document.documentElement.clientHeight + 1 ||
      document.body.scrollHeight > document.body.clientHeight + 1 ||
      window.scrollY > 0 ||
      document.documentElement.scrollTop > 0;

    const htmlOv = getComputedStyle(document.documentElement).overflow + '/' + getComputedStyle(document.documentElement).overflowY;
    const bodyOv = getComputedStyle(document.body).overflow + '/' + getComputedStyle(document.body).overflowY;
    const root = document.querySelector('#root');
    const rootOv = root ? getComputedStyle(root).overflow + '/' + getComputedStyle(root).overflowY : null;

    const nestedScrollers = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const oy = cs.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          nestedScrollers.push({
            tag: el.tagName,
            id: el.id || '',
            testid: el.getAttribute('data-testid') || '',
            cls: (el.className || '').toString().slice(0, 80),
            sh: el.scrollHeight,
            ch: el.clientHeight,
            h: Math.round(r.height),
          });
        }
      }
    }

    // Interactive chrome hit areas
    const interactSel =
      'button, a[href], [role="button"], input[type="button"], input[type="submit"], summary, [tabindex]:not([tabindex="-1"])';
    const hitOffenders = [];
    const hitOk = [];
    for (const el of document.querySelectorAll(interactSel)) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      // skip offscreen / decorative
      if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
      const h = Math.round(r.height);
      const w = Math.round(r.width);
      const minDim = Math.min(h, w);
      // chrome: toolbar/nav/dock/aside/header — skip pure text links in timeline content if very long
      const text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().slice(0, 48);
      const info = {
        text,
        tag: el.tagName,
        testid: el.getAttribute('data-testid') || '',
        h,
        w,
        minDim,
        cls: (el.className || '').toString().slice(0, 60),
      };
      // Flag if height < 40 for chrome controls (buttons/role=button/summary); links in content can be text-height
      const isChrome =
        el.tagName === 'BUTTON' ||
        el.getAttribute('role') === 'button' ||
        el.tagName === 'SUMMARY' ||
        el.closest('.agent-hitl-dock, .agent-shell-header, header, nav, .agent-aside, .browse-sidebar, .project-tool, [class*="toolbar"], [class*="chip"]');
      if (isChrome && h < 40) {
        hitOffenders.push(info);
      } else if (isChrome) {
        hitOk.push(info);
      }
    }

    // Font sizes < 12 on primary UI labels (buttons, labels, badges in chrome — not decorative icons)
    const fontOffenders = [];
    const labelLike = document.querySelectorAll(
      'button, label, [role="button"], .agent-confirm-panel *, .agent-hitl-dock button, .agent-hitl-dock label, .agent-hitl-dock [class*="chip"], [data-testid*="confirm"] *, .project-tool-chip, a.btn, .ui-btn, .btn-press'
    );
    const seen = new Set();
    for (const el of labelLike) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.bottom < 0 || r.top > vh) continue;
      const cs = getComputedStyle(el);
      const fs = parseFloat(cs.fontSize);
      if (!(fs < 12)) continue;
      const text = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (!text || text.length < 1) continue;
      // skip pure icons / single glyphs that are decorative
      if (/^[\u200b\s·•●○]+$/.test(text)) continue;
      const key = `${text}|${fs}|${Math.round(r.top)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      fontOffenders.push({
        text,
        fs: Math.round(fs * 10) / 10,
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 60),
        h: Math.round(r.height),
      });
    }

    // HITL dock / timeline
    const dock = document.querySelector('.agent-hitl-dock, [data-testid="agent-hitl-dock"]');
    const timeline =
      document.querySelector('[data-testid="session-timeline-scroller"]') ||
      document.querySelector('.session-timeline-scroller');
    const dockR = dock?.getBoundingClientRect();
    const tlR = timeline?.getBoundingClientRect();

    // transition:all exact
    let transitionAllExact = 0;
    const transitionSamples = [];
    const scope =
      document.querySelector('.agent-session, [data-testid="agent-session"], main') || document.body;
    for (const el of scope.querySelectorAll('*')) {
      const tp = getComputedStyle(el).transitionProperty;
      if (tp === 'all') {
        transitionAllExact++;
        if (transitionSamples.length < 12) {
          transitionSamples.push({
            tag: el.tagName,
            cls: (el.className || '').toString().slice(0, 70),
            testid: el.getAttribute('data-testid') || '',
          });
        }
      }
    }

    return {
      vh,
      vw,
      bodyScroll,
      overflow: { html: htmlOv, body: bodyOv, root: rootOv },
      nestedScrollers: nestedScrollers.slice(0, 20),
      nestedScrollerCount: nestedScrollers.length,
      hitOffenders: hitOffenders.slice(0, 40),
      hitOffenderCount: hitOffenders.length,
      hitOkSample: hitOk.slice(0, 8),
      fontOffenders: fontOffenders.slice(0, 40),
      fontOffenderCount: fontOffenders.length,
      dockH: dockR ? Math.round(dockR.height) : null,
      dockTop: dockR ? Math.round(dockR.top) : null,
      timelineH: tlR ? Math.round(tlR.height) : null,
      transitionAllExact,
      transitionSamples,
      url: location.href,
      title: document.title,
    };
  });
}

const results = {
  meta: {
    head: '58f04f9',
    viewport: '1440x900',
    base,
    date: '2026-09-19',
    tz: 'Asia/Shanghai',
  },
  pages: {},
  console: { all: [], nonWhitelist: [] },
};

async function visit(key, urlPath, png) {
  const before = consoleMsgs.length;
  await page.goto(`${base}${urlPath}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const m = await measureChrome();
  await shot(png);
  const pageConsole = consoleMsgs.slice(before);
  results.pages[key] = { path: urlPath, measure: m, consoleCount: pageConsole.length, png };
  return m;
}

// Paths: Home → sess-oa-1 → projects general/patent → Catalog/Harness
await visit('home', '/agent', '01-home.png');
await visit('session_oa1', '/agent/sessions/sess-oa-1', '02-session-oa1.png');
// dock closeup crop via clip if possible
await page.locator('.agent-hitl-dock').first().screenshot({ path: path.join(out, '03-dock-closeup.png') }).catch(() => {});
await visit('proj_general', '/agent/projects/proj-demo-general', '04-proj-general.png');
await visit('proj_patent', '/agent/projects/proj-demo-patent', '05-proj-patent.png');
await visit('catalog', '/agent/agents', '06-catalog.png');
await visit('harness', '/agent/harness', '07-harness.png');

// Aggregate console
const uniq = new Map();
for (const m of consoleMsgs) {
  const k = `${m.type}|${m.text.slice(0, 160)}`;
  if (!uniq.has(k)) uniq.set(k, { ...m, count: 1 });
  else uniq.get(k).count++;
}
const allUnique = [...uniq.values()];
const nonWl = allUnique.filter((m) => (m.type === 'error' || m.type === 'pageerror') && !isWhitelist(m.text));
const wlErrors = allUnique.filter((m) => (m.type === 'error' || m.type === 'pageerror') && isWhitelist(m.text));

results.console = {
  totalEvents: consoleMsgs.length,
  unique: allUnique.length,
  errorUnique: allUnique.filter((m) => m.type === 'error' || m.type === 'pageerror').length,
  nonWhitelistErrors: nonWl,
  nonWhitelistCount: nonWl.length,
  whitelistErrors: wlErrors.slice(0, 20),
  sampleAll: allUnique.slice(0, 30),
};

// Summary rollup
const sess = results.pages.session_oa1?.measure || {};
results.summary = {
  dockH: sess.dockH,
  timelineH: sess.timelineH,
  bodyScroll_session: sess.bodyScroll,
  nestedScrollers_session: sess.nestedScrollerCount,
  transitionAllExact_session: sess.transitionAllExact,
  hitOffenders_by_page: Object.fromEntries(
    Object.entries(results.pages).map(([k, v]) => [k, v.measure.hitOffenderCount])
  ),
  fontOffenders_by_page: Object.fromEntries(
    Object.entries(results.pages).map(([k, v]) => [k, v.measure.fontOffenderCount])
  ),
  bodyScroll_by_page: Object.fromEntries(
    Object.entries(results.pages).map(([k, v]) => [k, v.measure.bodyScroll])
  ),
  transitionAll_by_page: Object.fromEntries(
    Object.entries(results.pages).map(([k, v]) => [k, v.measure.transitionAllExact])
  ),
  consoleNonWhitelist: results.console.nonWhitelistCount,
};

fs.writeFileSync(path.join(out, '_aloop-measures.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.summary, null, 2));
console.log('--- non-whitelist ---');
console.log(JSON.stringify(nonWl, null, 2));
console.log('--- session hit offenders sample ---');
console.log(JSON.stringify(sess.hitOffenders?.slice(0, 15), null, 2));
console.log('--- session font offenders ---');
console.log(JSON.stringify(sess.fontOffenders?.slice(0, 15), null, 2));

await browser.close();
