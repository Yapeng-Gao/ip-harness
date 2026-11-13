import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const out = 'docs/ui-polish/agent-feel-recheck';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = 'http://127.0.0.1:5175';
const results = { headNote: 'live recheck', viewport: '1440x900', checks: {}, verdicts: {} };

async function shot(name) {
  await page.screenshot({ path: path.join(out, name), fullPage: false });
}

function passFail(id, ok, detail) {
  results.verdicts[id] = { status: ok ? 'PASS' : 'FAIL', detail };
  return ok;
}

// ——— Patent project: M-1, M-2, S-4, S-5 ———
await page.goto(`${base}/agent/projects/proj-demo-patent`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('01-patent-tools.png');

const patent = await page.evaluate(() => {
  const labels = ['分派任务', '汇总时间线', '打开专家私信'];
  const found = labels.map((lab) => {
    const el = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes(lab));
    if (!el) return { lab, missing: true };
    const r = el.getBoundingClientRect();
    return {
      lab,
      tag: el.tagName,
      text: (el.innerText || '').trim().slice(0, 48),
      h: Math.round(r.height),
      title: el.getAttribute('title') || '',
      aria: el.getAttribute('aria-label') || '',
    };
  });
  // visible primary text that is pure snake_case API id
  const engPrimary = [];
  for (const sel of document.querySelectorAll('button, [role="button"], .project-tool-chip, [class*="tool"]')) {
    const t = (sel.textContent || '').trim();
    if (/^(dispatch_task|summarize_timeline|open_expert_dm)$/.test(t)) {
      const r = sel.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) engPrimary.push(t);
    }
  }
  const composer =
    document.querySelector('.project-chat-composer') ||
    document.querySelector('textarea')?.closest('.sticky, [class*="composer"], .border-t');
  const cr = composer?.getBoundingClientRect();
  const next = document.querySelector('[data-testid="project-timeline-next"]');
  const cta = document.querySelector('[data-testid="project-timeline-cta-orch"]');
  const bots = [...document.querySelectorAll('.project-bot-link, a[data-testid^="project-bot-"], [data-testid*="bot"]')]
    .filter((el) => el.getBoundingClientRect().height > 0)
    .slice(0, 5)
    .map((el) => ({ t: el.textContent.trim().slice(0, 24), h: Math.round(el.getBoundingClientRect().height) }));
  const binds = [...document.querySelectorAll('[data-testid="case-bind-controls"] button, .case-bind button')]
    .filter((el) => el.getBoundingClientRect().height > 0)
    .slice(0, 4)
    .map((el) => ({ t: el.textContent.trim().slice(0, 24), h: Math.round(el.getBoundingClientRect().height) }));
  // AppSurfaceLinks vs ProductSwitcher
  const surf = [...document.querySelectorAll('a,button')]
    .filter((el) => {
      const t = (el.textContent || '').trim();
      return t === '作业中台' || t === '知产 Agent' || t === '办理台';
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        t: (el.textContent || '').trim(),
        top: Math.round(r.top),
        left: Math.round(r.left),
        w: Math.round(r.width),
        h: Math.round(r.height),
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 80),
        visible: r.width > 0 && r.height > 0 && r.top > -50,
      };
    });
  return {
    found,
    engPrimary,
    composerTop: cr ? Math.round(cr.top) : null,
    composerH: cr ? Math.round(cr.height) : null,
    vh: window.innerHeight,
    timeline: {
      hasNext: !!next,
      hasCta: !!cta,
      text: ((next || cta)?.textContent || '').trim().slice(0, 120),
    },
    bots,
    binds,
    surf,
  };
});
results.checks.patent = patent;
await shot('02-patent-density.png');

const m1ok =
  patent.found.every((f) => !f.missing && f.tag === 'BUTTON' && f.h >= 40) &&
  patent.engPrimary.length === 0 &&
  patent.found.every((f) => /dispatch_task|summarize_timeline|open_expert_dm/.test(f.title + f.aria));
passFail(
  'AFE-M-1',
  m1ok,
  `patent chips=${JSON.stringify(patent.found.map((f) => ({ lab: f.lab, h: f.h, tag: f.tag, title: f.title })))}; engPrimary=${JSON.stringify(patent.engPrimary)}`,
);

const m2ok = patent.composerTop != null && patent.composerTop <= 780;
passFail('AFE-M-2', m2ok, `composerTop=${patent.composerTop} @ vh=${patent.vh} (target ≲780)`);

const s4ok = patent.timeline.hasNext || patent.timeline.hasCta || /下一步|打开总控|分派/.test(patent.timeline.text);
passFail('AFE-S-4', s4ok, `timeline=${JSON.stringify(patent.timeline)}`);

const chromeHs = [...patent.bots, ...patent.binds].map((x) => x.h);
const s5ok = chromeHs.length > 0 && chromeHs.every((h) => h >= 40);
passFail('AFE-S-5', s5ok, `bots=${JSON.stringify(patent.bots)}; binds=${JSON.stringify(patent.binds)}`);

// ——— General project: M-1 spot ———
await page.goto(`${base}/agent/projects/proj-demo-general`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await shot('03-general-tools.png');
const gen = await page.evaluate(() => {
  const labels = ['分派任务', '汇总时间线', '打开专家私信'];
  const found = labels.map((lab) => {
    const el = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes(lab));
    if (!el) return { lab, missing: true };
    const r = el.getBoundingClientRect();
    return { lab, h: Math.round(r.height), title: el.getAttribute('title') || '', tag: el.tagName };
  });
  const engPrimary = [];
  for (const sel of document.querySelectorAll('button, [role="button"]')) {
    const t = (sel.textContent || '').trim();
    if (/^(dispatch_task|summarize_timeline|open_expert_dm)$/.test(t)) {
      const r = sel.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) engPrimary.push(t);
    }
  }
  const composer =
    document.querySelector('.project-chat-composer') ||
    document.querySelector('textarea')?.closest('.sticky, [class*="composer"], .border-t');
  const cr = composer?.getBoundingClientRect();
  return {
    found,
    engPrimary,
    composerTop: cr ? Math.round(cr.top) : null,
    vh: window.innerHeight,
  };
});
results.checks.general = gen;
const m1gen =
  gen.found.every((f) => !f.missing && f.tag === 'BUTTON' && f.h >= 40) && gen.engPrimary.length === 0;
results.verdicts['AFE-M-1'].generalOk = m1gen;
results.verdicts['AFE-M-1'].status = results.verdicts['AFE-M-1'].status === 'PASS' && m1gen ? 'PASS' : 'FAIL';
results.verdicts['AFE-M-1'].detail += `; general=${JSON.stringify(gen.found)}; eng=${JSON.stringify(gen.engPrimary)}; composerTop=${gen.composerTop}`;

if (gen.composerTop != null) {
  const m2gen = gen.composerTop <= 780;
  results.verdicts['AFE-M-2'].generalTop = gen.composerTop;
  if (!m2gen) {
    results.verdicts['AFE-M-2'].status = 'FAIL';
    results.verdicts['AFE-M-2'].detail += `; general composerTop=${gen.composerTop} FAIL`;
  }
}

// ——— Session OA1: M-3, S-1, S-3, S-6, S-7 ———
await page.goto(`${base}/agent/sessions/sess-oa-1`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await shot('04-session-confirm.png');

const sess = await page.evaluate(() => {
  const bar =
    document.querySelector('#session-confirm-bar') ||
    document.querySelector('[data-confirm-bar]') ||
    document.querySelector('.confirm-hitl') ||
    document.querySelector('.agent-hitl-dock');
  const chipTexts = ['待批准', '待授权', '逐步'];
  const chips = chipTexts.map((t) => {
    const el = [...(bar?.querySelectorAll('*') || document.querySelectorAll('*'))].find(
      (e) => (e.textContent || '').trim() === t && e.children.length === 0,
    );
    if (!el) {
      // fallback: any element with exact text
      const el2 = [...document.querySelectorAll('*')].find((e) => (e.textContent || '').trim() === t && e.children.length === 0);
      if (!el2) return { t, missing: true };
      return { t, fs: parseFloat(getComputedStyle(el2).fontSize), h: Math.round(el2.getBoundingClientRect().height) };
    }
    return { t, fs: parseFloat(getComputedStyle(el).fontSize), h: Math.round(el.getBoundingClientRect().height) };
  });
  const more =
    bar?.querySelector('.agent-confirm-more') ||
    [...document.querySelectorAll('button, summary, a')].find((e) => /还有\s*\d+\s*条/.test(e.textContent || ''));
  const mr = more?.getBoundingClientRect();
  const cta =
    bar?.querySelector('.agent-confirm-cta') ||
    [...document.querySelectorAll('button')].find((b) => /批准策略/.test(b.textContent || ''));
  const cr = cta?.getBoundingClientRect();
  const fold =
    document.querySelector('.agent-hitl-composer-fold > summary') ||
    document.querySelector('[data-testid="session-composer-fold"] > summary') ||
    document.querySelector('summary');
  const fr = fold?.getBoundingClientRect();

  // S-1: transition:all in dock / confirm / rail
  let allCount = 0;
  const samples = [];
  const scopes = [
    ...document.querySelectorAll(
      '.agent-hitl-dock, .agent-hitl-dock *, .confirm-hitl, .confirm-hitl *, #session-confirm-bar, #session-confirm-bar *, .agent-rail-row, .agent-rail-row *, [class*="agent-rail"], [class*="agent-rail"] *',
    ),
  ];
  const seen = new Set();
  for (const el of scopes) {
    if (seen.has(el)) continue;
    seen.add(el);
    const tp = getComputedStyle(el).transitionProperty;
    if (tp === 'all') {
      allCount++;
      if (samples.length < 8)
        samples.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 50),
          tp,
        });
    }
  }

  // S-3: surface links — exact labels only
  const surfExact = [...document.querySelectorAll('a,button')]
    .filter((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      return t === '作业中台' || t === '知产 Agent' || t === '办理台';
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        t: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        top: Math.round(r.top),
        left: Math.round(r.left),
        visible: r.width > 0 && r.height > 0,
        cls: (el.className || '').toString().slice(0, 80),
        inSegmented: !!(el.closest('[class*="segment"]') || el.closest('nav')),
      };
    });

  // S-7: aside contrast vs confirm — soft check: aside has reduced opacity or muted class
  const aside = document.querySelector('.agent-aside, [data-testid="session-context"]');
  const asideCs = aside ? getComputedStyle(aside) : null;
  const formLink = [...document.querySelectorAll('.agent-aside a, .agent-aside button')].find((a) =>
    /表单|工作台/.test(a.textContent || ''),
  );
  const formH = formLink ? Math.round(formLink.getBoundingClientRect().height) : null;

  return {
    chips,
    more: more ? { h: Math.round(mr.height), t: (more.textContent || '').trim().slice(0, 40) } : null,
    cta: cta ? { h: Math.round(cr.height), t: (cta.textContent || '').trim().slice(0, 24) } : null,
    fold: fold ? { h: Math.round(fr.height), t: (fold.textContent || '').trim().slice(0, 48) } : null,
    transitionAll: allCount,
    transitionSamples: samples,
    surfExact,
    asideOpacity: asideCs ? asideCs.opacity : null,
    asideFilter: asideCs ? asideCs.filter : null,
    formLinkH: formH,
  };
});
results.checks.session = sess;

try {
  const bar = page.locator('#session-confirm-bar, .confirm-hitl, [data-confirm-bar], .agent-hitl-dock').first();
  await bar.screenshot({ path: path.join(out, '05-confirm-closeup.png') });
} catch {}

const m3fonts = sess.chips.every((c) => !c.missing && c.fs >= 12);
const m3hits =
  sess.more &&
  sess.more.h >= 40 &&
  sess.fold &&
  sess.fold.h >= 40 &&
  sess.cta &&
  sess.cta.h >= 36; // REVIEW: suggest ≥36–40; REPORT claims 40
const m3ok = m3fonts && m3hits;
passFail(
  'AFE-M-3',
  m3ok,
  `chips=${JSON.stringify(sess.chips)}; more=${JSON.stringify(sess.more)}; cta=${JSON.stringify(sess.cta)}; fold=${JSON.stringify(sess.fold)}`,
);

const s1ok = sess.transitionAll === 0;
passFail('AFE-S-1', s1ok, `transitionAllExact in dock/confirm/rail=${sess.transitionAll}; samples=${JSON.stringify(sess.transitionSamples)}`);

// S-3: only one set — ProductSwitcher OK; AppSurfaceLinks (segmented mid-top) should be gone
// Accept: labels 作业中台/知产 Agent present once as ProductSwitcher; no 「办理台」segmented trio
const visibleSurf = sess.surfExact.filter((s) => s.visible);
const hasBanlitai = visibleSurf.some((s) => s.t === '办理台');
const hasProductPair =
  visibleSurf.some((s) => s.t === '作业中台') && visibleSurf.some((s) => s.t === '知产 Agent');
// dual jump was segmented (top~12) + floating (left~1341). After fix: only floating ProductSwitcher.
const midTopSegmented = visibleSurf.filter((s) => s.top >= 0 && s.top <= 40 && s.left < 800);
const s3ok = hasProductPair && !hasBanlitai && midTopSegmented.length === 0;
passFail(
  'AFE-S-3',
  s3ok,
  `surf=${JSON.stringify(visibleSurf)}; midTopSegmented=${midTopSegmented.length}; hasBanlitai=${hasBanlitai}`,
);

const s6ok = sess.cta && sess.cta.h >= 40 && sess.fold && sess.fold.h >= 40;
passFail('AFE-S-6', s6ok, `cta.h=${sess.cta?.h}; fold.h=${sess.fold?.h}`);

// S-7: soft — form link ≥40 and aside not competing (opacity or form hit). Spot: form link hit if present.
const s7ok = sess.formLinkH == null || sess.formLinkH >= 40;
passFail('AFE-S-7', s7ok, `formLinkH=${sess.formLinkH}; asideOpacity=${sess.asideOpacity}`);

// ——— Catalog: S-2 ———
await page.goto(`${base}/agent/agents`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await shot('06-catalog.png');
const catalog = await page.evaluate(() => {
  const notes = [...document.querySelectorAll('.agent-picker-card__tier-note')];
  return notes.slice(0, 8).map((n) => {
    const r = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    return {
      h: Math.round(r.height),
      clamp: cs.webkitLineClamp || cs.lineClamp || 'none',
      textLen: (n.textContent || '').trim().length,
      t: (n.textContent || '').trim().slice(0, 60),
      cls: (n.className || '').toString().slice(0, 50),
    };
  });
});
results.checks.catalog = catalog;
const clamped = catalog.filter((c) => String(c.clamp) === '2' || c.clamp === 2);
const s2ok = clamped.length >= 1 || catalog.some((c) => c.h > 0 && c.h <= 50);
passFail('AFE-S-2', s2ok, `tier-notes=${JSON.stringify(catalog)}; clampedCount=${clamped.length}`);

// summary
const must = ['AFE-M-1', 'AFE-M-2', 'AFE-M-3'];
const should = ['AFE-S-1', 'AFE-S-2', 'AFE-S-3', 'AFE-S-4', 'AFE-S-5', 'AFE-S-6', 'AFE-S-7'];
const mustPass = must.every((id) => results.verdicts[id]?.status === 'PASS');
const shouldFails = should.filter((id) => results.verdicts[id]?.status !== 'PASS');
results.summary = {
  mustPass,
  shouldFails,
  feelVerdict: mustPass ? (shouldFails.length === 0 ? 'feel Go' : 'Conditional') : 'Conditional',
};

fs.writeFileSync(path.join(out, '_afe-recheck.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify({ verdicts: results.verdicts, summary: results.summary }, null, 2));
await browser.close();
